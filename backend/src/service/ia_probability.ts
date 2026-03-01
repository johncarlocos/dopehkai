import { GoogleGenAI } from "@google/genai";
import { Match, ResultIA } from "../model/match.model";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function IaProbality(match: Match, playersInjured: any): Promise<ResultIA | null> {
  try {
    const matchDataInput = {
      data: match.kickOff.split(" ")[0],
      home: {
        name: match.homeTeamNameEn || match.homeTeamName,
        last5Matches: match.homeForm.split(",").slice(0, 5),
        averageGoals: match.lastGames
          ? Number(match.lastGames.homeTeam.teamGoalsFor) / Number(match.lastGames.homeTeam.teamPlayed)
          : null,
        winRate: match.lastGames
          ? (Number(match.lastGames.homeTeam.teamWin) / Number(match.lastGames.homeTeam.teamPlayed)) * 100
          : null,
      },
      away: {
        name: match.awayTeamNameEn || match.awayTeamName,
        last5Matches: match.awayForm.split(",").slice(0, 5),
        averageGoals: match.lastGames
          ? Number(match.lastGames.awayTeam.teamGoalsFor) / Number(match.lastGames.awayTeam.teamPlayed)
          : null,
        winRate: match.lastGames
          ? (Number(match.lastGames.awayTeam.teamWin) / Number(match.lastGames.awayTeam.teamPlayed)) * 100
          : null,
      },
    };
    const injuredHome = playersInjured.home.length;
    const injuredAway = playersInjured.away.length;

    const hadHome = match.hadHomePct ?? match.predictions?.homeWinRate;
    const hadAway = match.hadAwayPct ?? match.predictions?.awayWinRate;
    const hadDraw = match.hadDrawPct;
    const hkjc1x2 =
      hadHome != null && hadAway != null
        ? `HKJC 1X2 (real-time implied %): Home ${hadHome}%, Draw ${hadDraw ?? "—"}%, Away ${hadAway}%.`
        : "";
    const hkjcHandicap = match.condition ? `HKJC Handicap: ${match.condition}.` : "";
    const hkjcHilo =
      match.hiloLines?.length
        ? "HKJC HiLo: " +
          match.hiloLines.map((l) => `${l.line} — Over ${l.overPct}%, Under ${l.underPct}%`).join("; ") +
          "."
        : "";
    const hkjcBlock = [hkjc1x2, hkjcHandicap, hkjcHilo].filter(Boolean).join(" ");

    const prompt = `
You are a football betting analyst. Use ONLY the data below. Do not use external sources.

Match:
- Date: ${matchDataInput.data}
- Home Team: ${matchDataInput.home.name}
  - Last 5: ${matchDataInput.home.last5Matches.join(", ")}
  - Avg goals: ${matchDataInput.home.averageGoals}
  - Injured: ${injuredHome}
- Away Team: ${matchDataInput.away.name}
  - Last 5: ${matchDataInput.away.last5Matches.join(", ")}
  - Avg goals: ${matchDataInput.away.averageGoals}
  - Injured: ${injuredAway}
${hkjcBlock ? `\n${hkjcBlock}\n` : ""}

Tasks:
1) Estimate home/draw/away win probabilities (sum = 100). Use the HKJC odds above as the market baseline; adjust slightly based on form and injuries if justified.
2) Choose ONE bestPick: the option where your estimated probability is higher than the market implied probability (value bet). If no clear value, pick the most likely outcome among: HOME, AWAY, DRAW, HANDICAP_HOME, HANDICAP_AWAY, OVER_2.5, UNDER_2.5, OVER_3.5, UNDER_3.5.

Respond ONLY with this JSON (no other text):
{
  "home": number,
  "away": number,
  "draw": number,
  "bestPick": "HOME" | "AWAY" | "DRAW" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "OVER_2.5" | "UNDER_2.5" | "OVER_3.5" | "UNDER_3.5"
}
- home + away + draw = 100. Home advantage ~5%.
- Exactly one bestPick from the 9 values. Vary choices; do not always pick HOME or AWAY.
`;

    console.log("[Gemini] Calling single-match API", { model: GEMINI_MODEL, matchId: match.id || match.eventId, home: match.homeTeamNameEn || match.homeTeamName, away: match.awayTeamNameEn || match.awayTeamName });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a football analyst. Use only the data provided. Respond only with valid JSON.",
        temperature: 0.2,
      },
    });

    const content = response.text ?? "";
    console.log("[Gemini] Single-match API response received", { model: GEMINI_MODEL, responseLength: content?.length ?? 0 });

    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    const jsonString = content.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);

    if (
      typeof parsed.home !== "number" ||
      typeof parsed.away !== "number" ||
      typeof parsed.draw !== "number"
    ) {
      return null;
    }

    const result: ResultIA = {
      home: parsed.home,
      away: parsed.away,
      draw: parsed.draw,
      bestPick: typeof parsed.bestPick === "string" ? parsed.bestPick : undefined,
    };

    return result;
  } catch (error: any) {
    console.error("IaProbality error:", error.message || error);
    return null;
  }
}

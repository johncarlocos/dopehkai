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

    const prompt = `
You are a football betting analyst.

1) First, estimate win probability percentages for FULL TIME RESULT (1X2):
- home = Home team wins
- away = Away team wins
- draw = Draw

2) Then choose ONE best betting idea across ALL markets where odds would be 1.7 or higher.
   You MUST consider: 1X2 (HOME, AWAY, DRAW), Handicap (HANDICAP_HOME, HANDICAP_AWAY), HiLo 2.5 (OVER_2.5, UNDER_2.5), HiLo 3.5 (OVER_3.5, UNDER_3.5).
   Pick the option with the best value—do NOT always choose HOME or AWAY. Use DRAW, handicap, or HiLo when they offer better value.
Return which market/type you prefer in a tag called "bestPick".

Respond ONLY in this exact JSON format (no explanations, no extra fields):
{
  "home": number,
  "away": number,
  "draw": number,
  "bestPick": "HOME" | "AWAY" | "DRAW" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "OVER_2.5" | "UNDER_2.5" | "OVER_3.5" | "UNDER_3.5"
}

### Match Information:
- Date: ${matchDataInput.data}
- Home Team: ${matchDataInput.home.name}
  - Last 5 matches: ${matchDataInput.home.last5Matches.join(", ")}
  - Average goals per game: ${matchDataInput.home.averageGoals}
  - Injured players: ${injuredHome}
- Away Team: ${matchDataInput.away.name}
  - Last 5 matches: ${matchDataInput.away.last5Matches.join(", ")}
  - Average goals per game: ${matchDataInput.away.averageGoals}
  - Injured players: ${injuredAway}

Guidelines:
- Injuries reduce the strength of that team; if injuries are similar both sides, reduce the impact.
- Home team has small base advantage (~5%).
- For "bestPick": choose the SINGLE best value across 1X2, Handicap, HiLo 2.5, and HiLo 3.5. Use DRAW when a draw is likely and has value. Use HANDICAP_HOME or HANDICAP_AWAY when handicap is the best value. Use OVER_2.5, UNDER_2.5, OVER_3.5, or UNDER_3.5 when total goals market is the best value. Do not default to HOME or AWAY only.
- Always choose exactly ONE bestPick from the 9 options.
- Do not provide any explanations. Only return the JSON result.
`;

    console.log("[Gemini] Calling single-match API", { model: GEMINI_MODEL, matchId: match.id || match.eventId, home: match.homeTeamNameEn || match.homeTeamName, away: match.awayTeamNameEn || match.awayTeamName });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a football analyst with access to real-time data. Respond only with valid JSON.",
        temperature: 0.3,
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

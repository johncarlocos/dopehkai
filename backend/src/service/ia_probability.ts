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
You are a football betting analyst. Please analyze the following match:

Match:
- Date: ${matchDataInput.data}
- Home Team: ${matchDataInput.home.name}
  - Last 5 matches: ${matchDataInput.home.last5Matches.join(", ")}
  - Average goals per game: ${matchDataInput.home.averageGoals}
  - Injured players: ${injuredHome}
- Away Team: ${matchDataInput.away.name}
  - Last 5 matches: ${matchDataInput.away.last5Matches.join(", ")}
  - Average goals per game: ${matchDataInput.away.averageGoals}
  - Injured players: ${injuredAway}

Conduct this research by referencing professional data sources such as WhoScored, Sofascore, and Transfermarkt, and cross-reference the latest odds and match info from the HKJC Football website.

Please strictly follow the structure below for your internal reasoning before you pick probabilities and a bet:
1. Data & Statistical Analysis:
- Compare both teams' xG (Expected Goals) and xGA (Expected Goals Against) over the last 5 matches.
- Analyze the win rate disparity between home and away performances.
- Consider the latest news in both English and the league's native language (e.g., Spanish, German, or Portuguese) so you don't miss key information.
2. Squad & Lineup Deep-Dive:
- Use the most updated injury and suspension information you can infer.
- Specifically reason about how the absence of key players affects offensive or defensive efficiency (use data-backed logic where possible).
3. Tactical Breakdown:
- Analyze the preferred formations and tactical styles of both head coaches.
- Assess tactical counters, for example whether a high press is vulnerable to direct counter-attacks.
4. Market Sentiment & Odds:
- Consider the trend of international mainstream odds (opening vs. current) and which side the market shows more confidence in.

Now, based on that reasoning, produce ONLY the final numeric betting view in this exact JSON format (no explanations, no extra fields):
{
  "home": number,
  "away": number,
  "draw": number,
  "bestPick": "HOME" | "AWAY" | "DRAW" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "OVER_2.5" | "UNDER_2.5" | "OVER_3.5" | "UNDER_3.5"
}

Rules:
- home + away + draw must sum to 100.
- Consider home advantage (~5%).
- Choose ONE best betting idea across ALL markets (1X2, Handicap, HiLo 2.5, HiLo 3.5) where odds would be 1.7 or higher and label it as "bestPick".
- You MUST vary your choices: use "DRAW", "HANDICAP_HOME", "HANDICAP_AWAY", "OVER_2.5", "UNDER_2.5", "OVER_3.5", "UNDER_3.5" when they offer better value—do NOT always pick "HOME" or "AWAY".
- Always choose exactly ONE bestPick from the 9 allowed values.
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

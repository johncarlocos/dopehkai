/**
 * Single Gemini call for multiple matches. Saves cost and avoids rate limits.
 * Returns one analysis per match (home, away, draw percentages).
 */
import { GoogleGenAI } from "@google/genai";
import { ResultIA } from "../model/match.model";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export interface MatchForBatch {
  matchId: string;
  home: string;
  away: string;
  kickoff: string;
}

export interface BatchAnalysisItem {
  matchId: string;
  home: number;
  away: number;
  draw: number;
  /** Optional AI recommendation tag for frontend. */
  bestPick?: string;
}

/**
 * Call Gemini once with all matches; returns array of { matchId, home, away, draw }.
 * Invalid or missing entries are omitted from the result.
 */
export async function IaProbabilityBatch(
  matches: MatchForBatch[]
): Promise<BatchAnalysisItem[]> {
  if (matches.length === 0) return [];

  try {
    const listText = matches
      .map(
        (m, i) =>
          `${i + 1}. [${m.matchId}] ${m.home} vs ${m.away} (${m.kickoff})`
      )
      .join("\n");

    const prompt = `
You are a football betting analyst. Please analyze the following match:

Matches:
${listText}

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

For EACH match:
1) Estimate home/away/draw win probabilities (must sum to 100).
2) Choose ONE best betting idea across ALL markets (1X2, Handicap, HiLo 2.5, HiLo 3.5) where odds are 1.7 or higher. Label it as "bestPick".
   You MUST vary your choices: use "DRAW", "HANDICAP_HOME", "HANDICAP_AWAY", "OVER_2.5", "UNDER_2.5", "OVER_3.5", "UNDER_3.5" when they offer better value—do NOT always pick "HOME" or "AWAY".
   Allowed bestPick values: "HOME", "AWAY", "DRAW", "HANDICAP_HOME", "HANDICAP_AWAY", "OVER_2.5", "UNDER_2.5", "OVER_3.5", "UNDER_3.5"

Respond ONLY with a JSON array. One object per match in the same order. No other text.
Format:
[
  { "matchId": "<id>", "home": number, "away": number, "draw": number, "bestPick": "HOME" | "AWAY" | "DRAW" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "OVER_2.5" | "UNDER_2.5" | "OVER_3.5" | "UNDER_3.5" },
  ...
]
- home + away + draw for each match must sum to 100.
- Consider home advantage (around 5%).
- Always choose exactly one bestPick per match. Vary across the 9 options based on best value.
- Do not add explanations. Only the JSON array.
`;

    console.log("[Gemini] Calling batch API", { model: GEMINI_MODEL, matchCount: matches.length });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          "You are a football analyst. Respond only with a valid JSON array of objects with matchId, home, away, draw (numbers summing to 100 per match).",
        temperature: 0.3,
      },
    });

    const content = response.text ?? "";
    console.log("[Gemini] Batch API response received", { model: GEMINI_MODEL, responseLength: content?.length ?? 0 });
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      console.warn("[IaProbabilityBatch] No JSON array in response");
      return [];
    }
    const jsonString = content.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString) as any[];

    if (!Array.isArray(parsed)) return [];

    const byId = new Map<string, string>();
    matches.forEach((m) => byId.set(m.matchId, m.matchId));

    const results: BatchAnalysisItem[] = [];
    for (let i = 0; i < parsed.length && i < matches.length; i++) {
      const raw = parsed[i];
      const matchId = matches[i].matchId;
      const home = typeof raw?.home === "number" ? raw.home : null;
      const away = typeof raw?.away === "number" ? raw.away : null;
      const draw = typeof raw?.draw === "number" ? raw.draw : 0;
      if (home != null && away != null && home >= 0 && away >= 0) {
        const id = raw?.matchId ?? matchId;
        const bestPick =
          typeof raw?.bestPick === "string" ? raw.bestPick : undefined;
        results.push({
          matchId: String(id),
          home,
          away,
          draw,
          bestPick,
        });
      }
    }
    return results;
  } catch (error: any) {
    const msg = error?.message || String(error);
    const cause = error?.cause ? ` (cause: ${error.cause?.message ?? error.cause})` : "";
    console.error("[IaProbabilityBatch] Error:", msg + cause);
    if (msg.includes("fetch") || msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT")) {
      console.error("[IaProbabilityBatch] Check GEMINI_API_KEY in .env and network/proxy. See https://ai.google.dev/gemini-api/docs");
    }
    return [];
  }
}

/** Convert BatchAnalysisItem to ResultIA (redistribute draw into home/away like single-match flow). */
export function toResultIA(item: BatchAnalysisItem): ResultIA {
  const total = item.home + item.away;
  const homeShare = total ? item.home / total : 0.5;
  const awayShare = total ? item.away / total : 0.5;
  return {
    home: Number((item.home + item.draw * homeShare).toFixed(2)),
    away: Number((item.away + item.draw * awayShare).toFixed(2)),
    draw: item.draw,
    bestPick: item.bestPick,
  };
}

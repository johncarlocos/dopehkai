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
You are a football betting analyst. Analyze the following matches and estimate win probability (percentage) for home, draw, and away for each.

Matches:
${listText}

For EACH match:
1) Estimate home/away/draw win probabilities (must sum to 100).
2) Choose ONE best betting idea where odds are 1.7 or higher and label it as "bestPick":
   - "HOME", "AWAY", "DRAW"
   - or "HANDICAP_HOME", "HANDICAP_AWAY"
   - or "OVER_2.5", "UNDER_2.5"

Respond ONLY with a JSON array. One object per match in the same order. No other text.
Format:
[
  { "matchId": "<id>", "home": number, "away": number, "draw": number, "bestPick": "HOME" | "AWAY" | "DRAW" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "OVER_2.5" | "UNDER_2.5" },
  ...
]
- home + away + draw for each match must sum to 100.
- Consider home advantage (around 5%).
- Always choose exactly one bestPick for each match.
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
    console.error("[IaProbabilityBatch] Error:", error?.message || error);
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

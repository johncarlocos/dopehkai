/**
 * Single AI call (Gemini or Grok) for multiple matches. Saves cost and avoids rate limits.
 * Returns one analysis per match (home, away, draw percentages).
 */
import { ResultIA } from "../model/match.model";
import { generateText, getModelName, getProviderName } from "./aiProvider";

export interface MatchForBatch {
  matchId: string;
  home: string;
  away: string;
  kickoff: string;
  /** HKJC real-time 1X2 implied % */
  hadHomePct?: string;
  hadDrawPct?: string;
  hadAwayPct?: string;
  /** HKJC handicap condition */
  condition?: string;
  /** HKJC HiLo lines */
  hiloLines?: { line: string; overPct: string; underPct: string }[];
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
      .map((m, i) => {
        const base = `${i + 1}. [${m.matchId}] ${m.home} vs ${m.away} (${m.kickoff})`;
        const odds: string[] = [];
        if (m.hadHomePct != null && m.hadAwayPct != null) {
          odds.push(`1X2: H ${m.hadHomePct}% D ${m.hadDrawPct ?? "—"}% A ${m.hadAwayPct}%`);
        }
        if (m.condition) odds.push(`Handicap: ${m.condition}`);
        if (m.hiloLines?.length) {
          odds.push(
            "HiLo: " +
              m.hiloLines.map((l) => `${l.line} O${l.overPct}% U${l.underPct}%`).join("; ")
          );
        }
        return odds.length ? `${base} | HKJC: ${odds.join(" | ")}` : base;
      })
      .join("\n");

    const prompt = `
You are a football betting analyst. Use ONLY the data below. Do not use external sources.

Matches (HKJC = real-time market implied %):
${listText}

For EACH match:
1) Estimate home/draw/away win probabilities (sum = 100). Use the HKJC odds as the market baseline; adjust slightly if the team names or context suggest value.
2) Choose ONE bestPick: the option where your estimated probability is higher than the market implied probability (value bet). If no clear value, pick the most likely outcome. Allowed: HOME, AWAY, DRAW, HANDICAP_HOME, HANDICAP_AWAY, OVER_2.5, UNDER_2.5, OVER_3.5, UNDER_3.5.

Respond ONLY with a JSON array. One object per match in the same order. No other text.
[
  { "matchId": "<id>", "home": number, "away": number, "draw": number, "bestPick": "HOME" | "AWAY" | "DRAW" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "OVER_2.5" | "UNDER_2.5" | "OVER_3.5" | "UNDER_3.5" },
  ...
]
- home + away + draw = 100 per match. Home advantage ~5%.
- Exactly one bestPick per match. Vary choices; do not always pick HOME or AWAY.
`;

    const provider = getProviderName();
    const model = getModelName();
    console.log(`[${provider}] Calling batch API`, { model, matchCount: matches.length });
    const content = await generateText(prompt, {
      systemInstruction:
        "You are a football analyst. Use only the data provided. Respond only with a valid JSON array of objects with matchId, home, away, draw (sum 100), bestPick.",
      temperature: 0.2,
    });
    console.log(`[${provider}] Batch API response received`, { model, responseLength: content?.length ?? 0 });
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
      const provider = getProviderName();
      if (provider === "Grok") {
        console.error("[IaProbabilityBatch] Check GROK_API_KEY or XAI_API_KEY in .env. See https://docs.x.ai");
      } else {
        console.error("[IaProbabilityBatch] Check GEMINI_API_KEY in .env and network. See https://ai.google.dev/gemini-api/docs");
      }
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

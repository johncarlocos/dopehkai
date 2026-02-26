/**
 * Production analysis flow:
 * - Find matches that need analysis (pending or stale > 1h)
 * - Acquire Redis lock to prevent duplicate Gemini calls
 * - Call Gemini once (batch) for all such matches
 * - Save results to MongoDB, invalidate Redis cache
 */
import { collection, doc, getDocs, updateDoc } from "../database/db";
import { db } from "../firebase/firebase";
import Tables from "../ultis/tables.ultis";
import { acquireLock, releaseLock, cacheDel, CacheKeys } from "../cache/redis";
import {
  IaProbabilityBatch,
  toResultIA,
  MatchForBatch,
} from "./ia_probability_batch";

const STALE_MS = 60 * 60 * 1000; // 1 hour – re-analyze after this
const LOCK_TTL_SECONDS = 120; // Lock held for up to 2 min during batch

/**
 * Find match IDs that need analysis: no analysis yet, or analysis older than STALE_MS.
 * Includes all matches with valid kickOff (so every HKJC match can get analysis).
 */
async function getMatchIdsNeedingAnalysis(): Promise<
  { matchId: string; home: string; away: string; kickoff: string }[]
> {
  const staleThreshold = new Date(Date.now() - STALE_MS);

  const matchesCol = collection(db, Tables.matches);
  const snapshot = await getDocs(matchesCol);
  const out: { matchId: string; home: string; away: string; kickoff: string }[] = [];

  for (const d of snapshot.docs) {
    const data = d.data();
    const kickOff = data?.kickOff;
    if (!kickOff) continue;
    let kickTime: Date;
    try {
      kickTime = kickOff.includes("T")
        ? new Date(kickOff)
        : new Date(kickOff.replace(" ", "T"));
    } catch {
      continue;
    }
    if (isNaN(kickTime.getTime())) continue;

    const status = data?.analysis_status;
    const updatedAt = data?.analysis_updated_at;
    const hasValidAnalysis =
      status === "completed" &&
      updatedAt &&
      new Date(updatedAt).getTime() >= staleThreshold.getTime();

    if (hasValidAnalysis) continue;

    const home =
      data?.homeTeamNameEn || data?.homeTeamName || "Home";
    const away =
      data?.awayTeamNameEn || data?.awayTeamName || "Away";
    out.push({
      matchId: d.id,
      home,
      away,
      kickoff: kickOff,
    });
  }

  return out;
}

/**
 * Run one batch: lock → find pending/stale → Gemini batch → save to Mongo → invalidate cache.
 * Safe to call from cron or on-demand; only one run at a time globally (Redis lock).
 */
export async function runAnalysisBatch(): Promise<{
  ran: boolean;
  reason?: string;
  processed?: number;
}> {
  const toAnalyze = await getMatchIdsNeedingAnalysis();
  if (toAnalyze.length === 0) {
    return { ran: false, reason: "no matches need analysis" };
  }

  const locked = await acquireLock(
    CacheKeys.analysisBatchLock(),
    LOCK_TTL_SECONDS
  );
  if (!locked) {
    return { ran: false, reason: "analysis already running (lock held)" };
  }

  try {
    const matchesForBatch: MatchForBatch[] = toAnalyze.map((m) => ({
      matchId: m.matchId,
      home: m.home,
      away: m.away,
      kickoff: m.kickoff,
    }));

    const results = await IaProbabilityBatch(matchesForBatch);
    const now = new Date();
    const resultById = new Map(results.map((r) => [String(r.matchId), r]));

    const defaultIA = { home: 50, away: 50, draw: 0 };

    for (const m of toAnalyze) {
      const item = resultById.get(String(m.matchId));
      const ia = item ? toResultIA(item) : defaultIA;
      if (!item) {
        console.warn("[analysisWorker] No Gemini result for", m.matchId, m.home, "vs", m.away, "- using default 50/50");
      }
      const matchRef = doc(db, Tables.matches, m.matchId);
      try {
        await updateDoc(matchRef, {
          ia,
          analysis_status: "completed",
          analysis_updated_at: now,
        });
        await cacheDel(CacheKeys.matchDetail(m.matchId));
      } catch (e) {
        console.warn("[analysisWorker] Update failed for", m.matchId, e);
      }
    }

    await cacheDel(CacheKeys.matchesList(false));
    await cacheDel(CacheKeys.matchesList(true));
    await cacheDel(CacheKeys.analysisAll());

    console.log(
      "[analysisWorker] Batch done. Analyzed:",
      toAnalyze.length,
      "matches (Gemini returned",
      results.length,
      ")"
    );
    return { ran: true, processed: toAnalyze.length };
  } finally {
    await releaseLock(CacheKeys.analysisBatchLock());
  }
}

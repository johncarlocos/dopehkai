import { useQuery, UseQueryResult } from "@tanstack/react-query";
import API from "../api/api";
import AppGlobal from "../ultis/global";

export interface ResultIA {
  home: number;
  away: number;
  draw: number;
  bestPick?: string;
}

/**
 * Fetches match analysis from backend. When 比賽 page loads, backend may call Gemini for missing analysis (can take time).
 * Returns map of matchId -> { home, away, draw }.
 */
export const useMatchAnalysis = (): UseQueryResult<Record<string, ResultIA>, Error> => {
  return useQuery<Record<string, ResultIA>, Error>({
    queryKey: ["match-analysis"],
    queryFn: async () => {
      const url = AppGlobal.baseURL + "match/analysis";
      const res = await API.GET(url);
      if (res.status === 200 && res.data && typeof res.data === "object") {
        return res.data as Record<string, ResultIA>;
      }
      return {};
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: 1,
  });
};

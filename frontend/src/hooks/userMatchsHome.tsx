import { useQuery, UseQueryResult } from "@tanstack/react-query";
import API from "../api/api";
import { Match } from "../models/match";
import AppGlobal from "../ultis/global";

/**
 * Fetches match list for home (e.g. carousel). Uses backend only - data comes from DB via backend (home/matchs -> get2Matchs reads from DB).
 */
export const useMatchsHome = (
  startDate?: string,
  endDate?: string
): UseQueryResult<Match[], Error> => {
  return useQuery<Match[], Error>({
    queryKey: ["matchsHome", startDate, endDate],
    queryFn: async () => {
      const res = await API.GET(AppGlobal.baseURL + "home/matchs");
      if (res.status === 200 && res.data) return res.data;
      return [];
    },
  });
};
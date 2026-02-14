import { useQuery, UseQueryResult } from "@tanstack/react-query";
import API from "../api/api";
import AppGlobal from "../ultis/global";
import { Probability } from "../models/probability";

export const useProbability = (
    id: string
): UseQueryResult<Probability, Error> => {
    return useQuery<Probability, Error>({
        queryKey: ["probability", id],
        queryFn: async () => {
            try {
                // Always fetch fresh data by adding refresh parameter
                const res = await API.GET(
                    AppGlobal.baseURL + "match/match-data/" + id + "?refresh=true");
                if (res.status === 200 && res.data) return res.data;
                throw new Error(`Failed to fetch match details: ${res.status}`);
            } catch (error) {
                console.error('Error fetching probability:', error);
                throw error;
            }
        },
        refetchOnMount: false, // Use cached data if available
        refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
        staleTime: 2 * 60 * 1000, // 2 minutes - balance freshness and performance
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        retry: 2, // Retry failed requests
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import API from "../api/api";
import AppGlobal from "../ultis/global";

export const useRecords2 = (
    page: number,
    limit: number
): UseQueryResult<any, Error> => {
    return useQuery<any, Error>({
        queryKey: ["records2", page, limit],
        queryFn: async () => {
            try {
                const res = await API.GET(`${AppGlobal.baseURL}records2?page=${page}&limit=${limit}`);
                if (res.status === 200 && res.data) return res.data;
                throw new Error("Failed to fetch records2");
            } catch (error) {
                console.error('Error fetching records2:', error);
                throw error;
            }
        },
        staleTime: 2 * 60 * 1000, // Cache records for 2 minutes
        refetchOnMount: false, // Don't block initial render
        retry: 2, // Retry failed requests
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};


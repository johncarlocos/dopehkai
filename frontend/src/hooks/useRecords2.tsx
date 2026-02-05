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
            const res = await API.GET(`${AppGlobal.baseURL}records2?page=${page}&limit=${limit}`);
            if (res.status === 200 && res.data) return res.data;
            throw new Error("Failed to fetch records2");
        },
        staleTime: 2 * 60 * 1000, // Cache records for 2 minutes
        refetchOnMount: false, // Don't block initial render
    });
};


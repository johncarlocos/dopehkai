import { useQuery, UseQueryResult } from "@tanstack/react-query";
import API from "../api/api";
import AppGlobal from "../ultis/global";

export const useMembers = (
    page: number,
    limit: number,
    search?: string,
    vipOnly?: boolean
): UseQueryResult<any, Error> => {
    return useQuery<any, Error>({
        queryKey: ["members", page, limit, search, vipOnly],
        queryFn: async () => {
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            const vipParam = vipOnly ? "&vipOnly=true" : "";
            const res = await API.GET(`${AppGlobal.baseURL}admin/members?page=${page}&limit=${limit}${searchParam}${vipParam}&_t=${Date.now()}`);
            if (res.status === 200 && res.data) return res.data;
            throw new Error("Failed to fetch members");
        },
        staleTime: 0,
    });
};
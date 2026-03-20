import { useQuery, UseQueryResult } from "@tanstack/react-query";
import API from "../api/api";
import AppGlobal from "../ultis/global";

export interface PlatformStats {
    total: number;
    vip: number;
}

export interface IncomeDetail {
    email: string;
    price: string;
    platform: string;
    created_at: string;
}

export interface AnalyticsData {
    platforms: Record<string, PlatformStats>;
    income: {
        date: string;
        total: number;
        vipCount: number;
        details: IncomeDetail[];
    };
}

export const useAnalytics = (date: string): UseQueryResult<AnalyticsData, Error> => {
    return useQuery<AnalyticsData, Error>({
        queryKey: ["analytics", date],
        queryFn: async () => {
            const res = await API.GET(`${AppGlobal.baseURL}admin/analytics?date=${date}`);
            if (res.status === 200 && res.data) return res.data;
            throw new Error("Failed to fetch analytics");
        },
    });
};

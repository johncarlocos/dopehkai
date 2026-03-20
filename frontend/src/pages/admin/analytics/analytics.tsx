import { useState } from "react";
import AppBarComponent from "../../../components/appBar";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { TextField } from "@mui/material";
import ThemedText from "../../../components/themedText";

function AnalyticsPage() {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" })).toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const { data, isLoading } = useAnalytics(selectedDate);

    const platformConfig = [
        {
            key: "FACEBOOK",
            label: "Facebook",
            icon: <FaFacebook />,
            gradient: "from-blue-600 to-blue-800",
            border: "border-blue-500",
        },
        {
            key: "THREADS",
            label: "Threads",
            icon: <FaThreads />,
            gradient: "from-gray-600 to-gray-800",
            border: "border-gray-500",
        },
        {
            key: "INSTAGRAM",
            label: "Instagram",
            icon: <FaInstagram />,
            gradient: "from-pink-600 to-purple-800",
            border: "border-pink-500",
        },
    ];

    const totalUsers = data
        ? Object.values(data.platforms).reduce((sum, p) => sum + p.total, 0)
        : 0;
    const totalVip = data
        ? Object.values(data.platforms).reduce((sum, p) => sum + p.vip, 0)
        : 0;

    return (
        <div className="min-h-screen w-screen overflow-x-hidden bg-black text-white">
            <AppBarComponent />
            <div className="mt-24 flex justify-center">
                <div className="w-5/6 pb-12">
                    <ThemedText type="defaultSemiBold" className="text-xl sm:text-2xl mb-6" colorText="orange">
                        分析面板
                    </ThemedText>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-orange-600 to-amber-800 rounded-xl p-4 sm:p-6 shadow-lg">
                                    <p className="text-xs sm:text-sm text-orange-100 opacity-80">總用戶</p>
                                    <p className="text-3xl sm:text-5xl font-extrabold mt-2">{totalUsers}</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-600 to-green-800 rounded-xl p-4 sm:p-6 shadow-lg">
                                    <p className="text-xs sm:text-sm text-green-100 opacity-80">VIP 用戶</p>
                                    <p className="text-3xl sm:text-5xl font-extrabold mt-2">{totalVip}</p>
                                </div>
                            </div>

                            {/* Platform Cards */}
                            <p className="text-base sm:text-lg font-semibold mb-4 text-gray-300">平台用戶統計</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                                {platformConfig.map((p) => {
                                    const stats = data?.platforms[p.key];
                                    return (
                                        <div
                                            key={p.key}
                                            className={`bg-gradient-to-br ${p.gradient} rounded-xl p-5 sm:p-6 shadow-lg border-l-4 ${p.border}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-white opacity-90 text-2xl sm:text-3xl">{p.icon}</span>
                                                <span className="text-base sm:text-lg font-semibold">{p.label}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-60">用戶</p>
                                                    <p className="text-2xl sm:text-3xl font-bold">{stats?.total ?? 0}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-60">VIP</p>
                                                    <p className="text-2xl sm:text-3xl font-bold text-yellow-300">{stats?.vip ?? 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Income Section */}
                            <div className="bg-gray-900 rounded-lg p-4 sm:p-6 shadow-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                    <p className="text-base sm:text-lg font-semibold text-gray-300">每日收入</p>
                                    <TextField
                                        type="date"
                                        size="small"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        sx={{
                                            width: { xs: "100%", sm: 220 },
                                            "& .MuiOutlinedInput-root": {
                                                color: "white",
                                                "& fieldset": { borderColor: "#4b5563" },
                                                "&:hover fieldset": { borderColor: "#f59e0b" },
                                                "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                                            },
                                            "& input::-webkit-calendar-picker-indicator": {
                                                filter: "invert(1)",
                                            },
                                        }}
                                    />
                                </div>

                                {/* Income summary row */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                        <p className="text-xs sm:text-sm text-gray-400">日期</p>
                                        <p className="text-base sm:text-xl font-bold text-white mt-1">{selectedDate}</p>
                                    </div>
                                    <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                        <p className="text-xs sm:text-sm text-gray-400">新 VIP 數量</p>
                                        <p className="text-xl sm:text-2xl font-bold text-yellow-400 mt-1">{data?.income.vipCount ?? 0}</p>
                                    </div>
                                </div>

                                {/* Total income highlight */}
                                <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-lg p-5 sm:p-6 border border-orange-500/30 mb-6">
                                    <p className="text-xs sm:text-sm text-orange-300 mb-1">總收入</p>
                                    <p className="text-4xl sm:text-5xl font-extrabold text-orange-400">
                                        ${data?.income.total?.toLocaleString() ?? "0"}
                                    </p>
                                </div>

                                {/* Income details */}
                                {data?.income.details && data.income.details.length > 0 ? (
                                    <>
                                        {/* Mobile: card layout */}
                                        <div className="sm:hidden flex flex-col gap-3">
                                            {data.income.details.map((d, i) => (
                                                <div key={i} className="bg-black/40 rounded-lg p-3 border border-gray-700">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-white text-sm font-medium truncate max-w-[55%]">{d.email}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                            d.platform === "FACEBOOK" ? "bg-blue-600/30 text-blue-300" :
                                                            d.platform === "INSTAGRAM" ? "bg-pink-600/30 text-pink-300" :
                                                            "bg-gray-600/30 text-gray-300"
                                                        }`}>
                                                            {d.platform}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-orange-400 font-bold text-lg">
                                                            ${parseFloat(d.price).toLocaleString()}
                                                        </span>
                                                        <span className="text-gray-500 text-xs">
                                                            {new Date(d.created_at).toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop: table layout */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-700 text-gray-400">
                                                        <th className="text-left py-3 px-4">電郵</th>
                                                        <th className="text-left py-3 px-4">平台</th>
                                                        <th className="text-right py-3 px-4">價格</th>
                                                        <th className="text-right py-3 px-4">時間</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.income.details.map((d, i) => (
                                                        <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                                            <td className="py-3 px-4 text-white">{d.email}</td>
                                                            <td className="py-3 px-4">
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                    d.platform === "FACEBOOK" ? "bg-blue-600/30 text-blue-300" :
                                                                    d.platform === "INSTAGRAM" ? "bg-pink-600/30 text-pink-300" :
                                                                    d.platform === "THREADS" ? "bg-gray-600/30 text-gray-300" :
                                                                    "bg-gray-600/30 text-gray-300"
                                                                }`}>
                                                                    {d.platform}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right text-orange-400 font-semibold">
                                                                ${parseFloat(d.price).toLocaleString()}
                                                            </td>
                                                            <td className="py-3 px-4 text-right text-gray-400">
                                                                {new Date(d.created_at).toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">此日期無 VIP 註冊記錄</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;

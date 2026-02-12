import { useEffect } from "react";
import AppBarComponent from "../../components/appBar";
import AppAssets from "../../ultis/assets";
import AppColors from "../../ultis/colors";

function TermsPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen w-screen overflow-x-hidden bg-black">
            {/* Background Image */}
            <div className="fixed inset-0 w-full h-full z-[-1]">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none"
                    style={{
                        backgroundImage: `url(${AppAssets.background_image})`,
                        opacity: 1,
                    }}
                ></div>
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: 'black',
                        opacity: 0.2,
                    }}
                ></div>
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: AppColors.primary,
                        opacity: 0.1,
                    }}
                ></div>
            </div>

            <AppBarComponent />

            {/* Main Content */}
            <div className="relative z-10 pt-32 pb-20 w-full">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                    {/* Header Section */}
                    <div className="mb-12 text-center">
                        <div className="inline-block mb-6">
                            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4"></div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
                                服務條款
                            </h1>
                            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"></div>
                        </div>
                        <p className="text-xl sm:text-2xl text-gray-300 font-semibold mb-2">
                            足球分析系統服務條款
                        </p>
                        <p className="text-sm sm:text-base text-gray-400">
                            最後更新日期：2026年2月12日
                        </p>
                    </div>

                    {/* Welcome Section */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/10 shadow-2xl">
                        <p className="text-white text-lg leading-relaxed">
                            歡迎使用 <span className="font-bold text-yellow-400">[DOPE AI]</span>（以下簡稱「本系統」）。在使用本系統提供的數據分析與服務前，請仔細閱讀以下條款。
                        </p>
                    </div>

                    {/* Terms Content */}
                    <div className="space-y-6">
                        {/* Section 1 */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-xl">1</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        服務說明與年齡限制
                                    </h2>
                                    <div className="space-y-4 text-gray-200 leading-relaxed">
                                        <div>
                                            <p className="font-semibold text-yellow-400 mb-2">服務性質：</p>
                                            <p className="text-base sm:text-lg">
                                                本系統提供之足球數據分析、AI 賽事預測、球員技術指標及相關統計（下稱「本服務」），僅供數據參考、學術研究或教育用途。
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-yellow-400 mb-2">年齡限制：</p>
                                            <p className="text-base sm:text-lg">
                                                您必須年滿 <span className="font-bold text-white">18 歲</span>（或您所在地法律規定之法定成年年齡）方可註冊並使用本服務。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-xl">2</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        數據準確性與延遲聲明
                                    </h2>
                                    <div className="space-y-4 text-gray-200 leading-relaxed">
                                        <div>
                                            <p className="font-semibold text-blue-400 mb-2">數據來源：</p>
                                            <p className="text-base sm:text-lg">
                                                本系統數據採集自第三方供應商或公開資料，雖力求準確，但不保證其絕對即時性與無誤性。
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-400 mb-2">延遲說明：</p>
                                            <p className="text-base sm:text-lg">
                                                受限於網絡傳輸及第三方接口，數據可能存在 <span className="font-bold text-white">1 至 15 分鐘</span>（或以上）之延遲。本系統不對因數據延遲而導致的任何決策失誤承擔責任。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-xl">3</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        專業免責聲明
                                    </h2>
                                    <div className="space-y-4 text-gray-200 leading-relaxed">
                                        <div>
                                            <p className="font-semibold text-red-400 mb-2">非博彩建議：</p>
                                            <p className="text-base sm:text-lg">
                                                本系統提供的所有分析模型均為機率計算，不構成任何形式的投注建議或獲利保證。
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-red-400 mb-2">風險自負：</p>
                                            <p className="text-base sm:text-lg">
                                                用戶應理解足球比賽具有高度不確定性。任何依賴本系統資訊而進行的行為（包括但不限於博彩、投資或球員交易），其產生的盈虧由用戶自行承擔。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-xl">4</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        退款政策
                                    </h2>
                                    <div className="space-y-4 text-gray-200 leading-relaxed">
                                        <p className="text-base sm:text-lg mb-4">
                                            我們致力於提供高質量的分析服務，若您對服務不滿意，退款規則如下：
                                        </p>
                                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                                            <p className="font-semibold text-green-400 mb-2">2天冷靜期：</p>
                                            <p className="text-base sm:text-lg">
                                                自首次訂閱之日起 <span className="font-bold text-white">2 日內</span>，若用戶未使用超過 <span className="font-bold text-white">5 次</span>數據查詢功能，可申請全額退款。
                                            </p>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                                            <p className="font-semibold text-red-400 mb-3">不予退款情況：</p>
                                            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
                                                <li>超過 2日冷靜期後之申請。</li>
                                                <li>用戶因個人預測失準、博彩損失為由要求退款。</li>
                                                <li>帳戶因違反本條款（如非法抓取數據）而被封禁。</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-400 mb-2">退款手續：</p>
                                            <p className="text-base sm:text-lg">
                                                請聯繫 <span className="font-bold text-white">[客服]</span>，我們將在 <span className="font-bold text-white">30 個工作日</span>內審核並處理。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-xl">5</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        知識產權與禁止行為
                                    </h2>
                                    <div className="space-y-4 text-gray-200 leading-relaxed">
                                        <p className="text-base sm:text-lg">
                                            本系統之演算法、專有指標及數據排列方式均屬本公司資產。
                                        </p>
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                            <p className="font-semibold text-yellow-400 mb-3">嚴禁行為：</p>
                                            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
                                                <li>禁止使用任何自動化工具（如爬蟲、Robot、Scraper）抓取本站數據；</li>
                                                <li>禁止未經授權轉售本系統之分析報告。</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-xl">6</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        隱私與數據使用
                                    </h2>
                                    <div className="space-y-4 text-gray-200 leading-relaxed">
                                        <p className="text-base sm:text-lg">
                                            我們將依法保護您的個人資料。
                                        </p>
                                        <p className="text-base sm:text-lg">
                                            您同意本系統可在去識別化（匿名）的前提下，收集您的操作行為數據，用於優化 AI 預測模型及演算法。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                            <p className="text-gray-300 text-sm sm:text-base">
                                如有任何疑問，請聯繫我們的客服團隊。
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-2">
                                © 2026 DOPE AI. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TermsPage;


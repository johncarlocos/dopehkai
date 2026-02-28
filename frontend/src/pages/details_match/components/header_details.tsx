import { Probability } from "../../../models/probability";
import { CardMatch } from "../../../components/card_match";
import { useNavigate } from "react-router-dom";
import { getTeamNameInCurrentLanguage } from "../../../ultis/languageUtils";

interface Props {
    data: Probability;
    /** When false (e.g. non-VIP), the "分析:主勝" block is hidden; lock is shown by parent. */
    showAnalysisLabel?: boolean;
}

function HeaderDetailsComponent({
    data,
    showAnalysisLabel = true,
}: Props) {
    const navigate = useNavigate();

    const getAnalysisLabel = () => {
        const pick = data.ia?.bestPick;
        if (!pick) {
            // Fallback: choose side with higher IA win rate if available
            if (data.ia) {
                if (data.ia.home >= data.ia.away && data.ia.home >= data.ia.draw) {
                    return "分析 : 主勝";
                }
                if (data.ia.away >= data.ia.home && data.ia.away >= data.ia.draw) {
                    return "分析 : 客勝";
                }
            }
            return null;
        }

        if (pick === "HOME") return "分析 : 主勝";
        if (pick === "AWAY") return "分析 : 客勝";
        if (pick === "DRAW") return "分析 : 和局";

        // Handicap: distinguish home vs away
        if (pick === "HANDICAP_HOME") return "分析 : 主讓球";
        if (pick === "HANDICAP_AWAY") return "分析 : 客受讓";

        // HiLo 2.5 line
        if (pick === "OVER_2.5") return "分析 : 大2.5";
        if (pick === "UNDER_2.5") return "分析 : 細2.5";
        // HiLo 3.5 line
        if (pick === "OVER_3.5") return "分析 : 大3.5";
        if (pick === "UNDER_3.5") return "分析 : 細3.5";

        return null;
    };

    const analysisLabel = getAnalysisLabel();

    return (
        <div className="w-full flex flex-col items-center">
            <div className="sm:w-2/3 w-5/6 flex">
                <CardMatch
                    widht={"100%"}
                    navigate={navigate}
                    match={data}
                    teams={[getTeamNameInCurrentLanguage(data.homeLanguages, data.homeTeamName), getTeamNameInCurrentLanguage(data.awayLanguages, data.awayTeamName)]}
                />
            </div>
            {showAnalysisLabel && analysisLabel && (
                <div className="sm:w-2/3 w-5/6 mt-3">
                    <div className="bg-white/90 rounded-lg px-4 py-4 sm:py-5 shadow flex items-center justify-center">
                        <span className="text-base sm:text-2xl font-bold text-gray-800 text-center">
                            {analysisLabel}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
export default HeaderDetailsComponent;
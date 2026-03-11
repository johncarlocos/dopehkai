import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();

    const getAnalysisLabel = () => {
        const pick = data.ia?.bestPick;
        if (!pick) return null;

        // Only show HiLo analysis – labels from translation so you can change "大3.5" etc.
        if (pick === "OVER_2.5") return t("analysis_over_2_5");
        if (pick === "UNDER_2.5") return t("analysis_under_2_5");
        if (pick === "OVER_3.5") return t("analysis_over_3_5");
        if (pick === "UNDER_3.5") return t("analysis_under_3_5");

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
import { useTranslation } from "react-i18next";
import AppAssets from "../../../ultis/assets";
import { useEffect, useState } from "react";
import moment from "moment-timezone";
import ThemedText from "../../../components/themedText";

interface Props {
    kickOff?: string;
}

function LockedAnalysisCard({ kickOff }: Props) {
    useTranslation();
    const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00");

    useEffect(() => {
        if (!kickOff) return;

        const updateCountdown = () => {
            let matchDate: moment.Moment;
            if (kickOff.includes('T')) {
                matchDate = moment.tz(kickOff, 'Asia/Hong_Kong');
            } else {
                matchDate = moment.tz(kickOff, 'YYYY-MM-DD HH:mm', 'Asia/Hong_Kong');
            }

            const now = moment.tz('Asia/Hong_Kong');
            const diff = matchDate.diff(now);

            if (diff > 0) {
                const duration = moment.duration(diff);
                const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
                const minutes = duration.minutes().toString().padStart(2, '0');
                const seconds = duration.seconds().toString().padStart(2, '0');
                setTimeRemaining(`${hours}:${minutes}:${seconds}`);
            } else {
                setTimeRemaining("00:00:00");
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [kickOff]);

    return (
        <div className="sm:w-2/3 w-5/6 mx-auto bg-white rounded-lg mt-5 p-6 py-8 flex items-center min-h-[280px]">
            <div className="w-1 h-full bg-blue-600 mr-4 rounded"></div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <ThemedText
                    className="text-lg font-bold text-black mb-2"
                    type="defaultSemiBold"
                >
                    分析
                </ThemedText>
                <img 
                    src={AppAssets.lock} 
                    alt="Lock" 
                    className="w-12 h-12 mb-2"
                />
                <ThemedText
                    className="text-sm text-black mb-1"
                    type="default"
                >
                    付費後可查看分析
                </ThemedText>
                <ThemedText
                    className="text-xs text-gray-500 mb-2"
                    type="default"
                >
                    距離開賽剩餘
                </ThemedText>
                <div className="text-2xl font-bold text-orange-500">
                    {timeRemaining}
                </div>
            </div>
        </div>
    );
}

export default LockedAnalysisCard;


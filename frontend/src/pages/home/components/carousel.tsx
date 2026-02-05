import { useEffect, useState } from "react";
import { CardMatch } from "../../../components/card_match";
import useIsMobile from "../../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { Match } from "../../../models/match";
import { useNavigate } from "react-router-dom";
import AppAssets from "../../../ultis/assets";
import SectionComponent1 from "./section.components";
import { Records } from "../../../models/records";
import { getTeamNameInCurrentLanguage } from "../../../ultis/languageUtils";
import GlobeAnimation from "../../../components/globe_animation";


export type Props = {
    match: Match[],
    data: Records[]
};

export function HeroCarousel({
    match, data
}: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slides = [
        {
            id: 1,
            title: t("Smart_Football_Analysis"),
            line1: t("Helping_You_Seize_Every"),
        },
        {
            id: 2,
            title: t("Data-Driven_Professional_Insights"),
            line1: t("Most_Accurate_Match_Predictions"),
        },
        {
            id: 3,
            title: t("Your_Football_Decision_Assistant"),
            line1: t("Revealing_Information_for_Each_Match"),
        },
    ];

    return (
        <div className="relative w-screen overflow-hiddenpb-96 bg-black">

            <div
                className={`absolute inset-0 h-[180vh] transition-opacity duration-1000 ease-in-out bg-center bg-cover z-0"
                        }`}

                style={{ backgroundImage: `url(${AppAssets.background_image})` }}
            />

            {/* Globe Animation - Positioned at top center */}
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-[1] -mt-32 sm:mt-0" style={{ opacity: 0.5 }}>
                <GlobeAnimation 
                    width="100%" 
                    height="100%" 
                    style={{ maxWidth: '1000px', maxHeight: '1000px', minWidth: '600px', minHeight: '600px' }}
                />
            </div>


            <div className="relative z-10 w-full flex items-center h-[50vh] flex-col sm:pl-10 pl-2 pr-5">
                <div className="relative z-10 w-full flex items-end h-[70vh]">
                    <div className="flex flex-1 items-center pl-5">
                        <div className="w-5 bg-white mr-4 self-stretch" />
                        <div className="flex flex-col justify-center space-y-2 text-white">
                            <p className="sm:text-2xl text-1xl font-bold leading-[1.1]">
                                {slides[current].title.toUpperCase()}
                            </p>
                            <p className="sm:text-7xl text-3xl font-semibold leading-tight">
                                {slides[current].line1.toUpperCase()}
                            </p>

                        </div>
                    </div>
                </div>
            </div>


            <div onClick={() => {
                navigate("/records");
            }}
                className="relative z-10 w-full flex items-center m-9 pl-10">
                <button className="mt-6 flex items-center gap-3 bg-neutral-900 hover:bg-black border-none text-white uppercase font-semibold px-6 py-3 rounded-lg transition w-max">
                    記錄1
                    <span className="text-white text-xl flex items-center justify-center leading-none mb-2">→</span>
                </button>
            </div>




            {
                isMobile
                    ? <div className="absolute flex items-center left-0 right-0 justify-around pt-0">

                        {
                            match.length > 1
                                ?
                                <div className="flex-col items-center justify-around  w-10/12 cursor-pointer">
                                    <CardMatch
                                        widht={80}
                                        navigate={navigate}
                                        match={match[0]}
                                        teams={[getTeamNameInCurrentLanguage(match[0].homeLanguages, match[0].homeTeamName), getTeamNameInCurrentLanguage(match[0].awayLanguages, match[0].awayTeamName)]}
                                    />
                                    <div className="flex sm:w-32 h-2" />
                                    <CardMatch
                                        widht={80}
                                        navigate={navigate}
                                        match={match[1]}
                                        teams={[getTeamNameInCurrentLanguage(match[1].homeLanguages, match[1].homeTeamName), getTeamNameInCurrentLanguage(match[1].awayLanguages, match[1].awayTeamName)]}
                                    />
                                </div>
                                : <></>
                        }


                    </div>
                    : <div className="flex w-screen justify-around flex-row pt-14">
                        {
                            match.length > 1
                                ?
                                <div className="flex flex-row items-center justify-around w-11/12 cursor-pointer">
                                    <CardMatch
                                        widht={"50%"}
                                        navigate={navigate}
                                        match={match[0]}
                                        teams={[getTeamNameInCurrentLanguage(match[0].homeLanguages, match[0].homeTeamName), getTeamNameInCurrentLanguage(match[0].awayLanguages, match[0].awayTeamName)]}
                                    />
                                    <div className="flex w-32" />
                                    <CardMatch
                                        widht={"50%"}
                                        navigate={navigate}
                                        match={match[1]}
                                        teams={[getTeamNameInCurrentLanguage(match[1].homeLanguages, match[1].homeTeamName), getTeamNameInCurrentLanguage(match[1].awayLanguages, match[1].awayTeamName)]}
                                    />
                                </div>
                                : <></>
                        }
                    </div>
            }


            <SectionComponent1 data={data} />



        </div >
    );
}

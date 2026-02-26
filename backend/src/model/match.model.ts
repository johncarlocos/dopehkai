import { LastGameData } from "./footylogic_last_games"

export interface TeamLanguages {
    en: string;
    zh: string;
    zhCN: string;
}

export interface Match {
    id?: string;
    homeLanguages?: TeamLanguages;
    awayLanguages?: TeamLanguages;
    condition?: string
    kickOffTime: string
    kickOffDate: string
    competitionId: number
    eventId: string
    matchOutcome: string
    homeForm: string
    awayForm: string
    competitionName: string
    homeTeamName: string
    kickOff: string
    awayTeamName: string
    kickOffDateLocal: string
    homeTeamNameEn?: string
    awayTeamNameEn?: string
    homeTeamLogo?: string
    awayTeamLogo?: string
    homeTeamId?: number
    awayTeamId?: number
    lastGames?: LastGameData
    fixture_id?: number
    league_id?: number,
    predictions?: Predictions
    ia?: ResultIA
    ia2?: ResultIA
    /** "pending" | "completed" – used for batch Gemini workflow */
    analysis_status?: "pending" | "completed"
    /** When AI analysis was last updated; used for stale check (e.g. re-analyze after 1h) */
    analysis_updated_at?: Date | string | null
}

export interface ResultIA {
    draw: number;
    home: number;
    away: number;
}

export interface Predictions {
    homeWinRate: number;
    awayWinRate: number;
    overRound: number;
    evHome: number;
    evAway: number;
    pbrHome: number;
    pbrAway: number;
    kellyHome: number;
    kellyAway: number;
}

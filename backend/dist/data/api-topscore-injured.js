"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTopScoreInjured = void 0;
const axios_1 = __importDefault(require("axios"));
const key = process.env.KEY_API;
const ApiTopScoreInjured = async (fixtureId, leagueId, season, homeTeam, awayTeam) => {
    const headers = {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": key,
    };
    try {
        const [topScorersRes, injuriesRes] = await Promise.all([
            axios_1.default.get(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season}`, { headers }),
            axios_1.default.get(`https://v3.football.api-sports.io/injuries?fixture=${fixtureId}`, { headers }),
        ]);
        if (topScorersRes.status !== 200 ||
            injuriesRes.status !== 200) {
            return { home: [], away: [] };
        }
        const topScorers = topScorersRes.data.response;
        const injuries = injuriesRes.data.response;
        const getKeyAbsences = (teamId) => {
            const teamScorers = topScorers.filter((p) => p.statistics?.[0]?.team?.id === teamId);
            return teamScorers
                .filter((p) => injuries.find((inj) => inj.player.name === p.player.name &&
                inj.team.id === teamId))
                .map((p) => {
                const injury = injuries.find((inj) => inj.player.name === p.player.name &&
                    inj.team.id === teamId);
                return {
                    name: p.player.name,
                    reason: injury?.type || "-",
                };
            });
        };
        return {
            home: getKeyAbsences(homeTeam),
            away: getKeyAbsences(awayTeam),
        };
    }
    catch (err) {
        console.error("Erro:", err);
        return {
            home: [],
            away: [],
        };
    }
};
exports.ApiTopScoreInjured = ApiTopScoreInjured;

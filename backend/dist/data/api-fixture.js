"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFixtureByDate = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const key = process.env.KEY_API;
const ApiFixtureByDate = async (date) => {
    let fixtures = [];
    const options = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        params: { date: date, timezone: "Asia/Shanghai" },
        headers: {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": key,
        },
    };
    try {
        const response = await (0, axios_1.default)(options);
        const data = response.data;
        if (response.status == 200) {
            data.response.forEach((match) => {
                fixtures.push({
                    id: match.fixture.id,
                    league_id: match.league.id,
                    team: `${match.teams.home.name}/${match.teams.away.name}`,
                    home: match.teams.home.name,
                    away: match.teams.away.name,
                    homeLogo: match.teams.home.logo,
                    awayLogo: match.teams.away.logo,
                });
            });
        }
        return fixtures;
    }
    catch (error) {
        console.error(`Error fetching data for date ${date}: ${error}`);
        return []; // Return empty array instead of undefined
    }
};
exports.ApiFixtureByDate = ApiFixtureByDate;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHKJC = void 0;
const api_1 = __importDefault(require("../api/api"));
const ApiHKJC = async () => {
    try {
        console.log("[ApiHKJC] Fetching all matches from HKJC API");
        const queryWithDates = {
            ...base,
            variables: {
                ...base.variables,
                startDate: null, // null means get all matches (not filtered by date)
                endDate: null, // null means get all matches (not filtered by date)
                endIndex: 500, // Increased to get more matches (max 500 recommended)
                showAllMatch: true // Show all matches regardless of odds types availability
            }
        };
        console.log("[ApiHKJC] Request payload:", JSON.stringify(queryWithDates, null, 2));
        const res = await api_1.default.POST("https://info.cld.hkjc.com/graphql/base/", queryWithDates);
        console.log("[ApiHKJC] Response status:", res.status);
        console.log("[ApiHKJC] Response data keys:", res.data ? Object.keys(res.data) : 'no data');
        if (res.status == 200) {
            // Check response structure
            if (res.data && res.data.data) {
                console.log("[ApiHKJC] Response data.data keys:", Object.keys(res.data.data));
                const matches = res.data.data.matches || [];
                console.log("[ApiHKJC] Received", matches.length, "matches from HKJC API");
                // Log full response structure if no matches
                if (matches.length === 0) {
                    console.log("[ApiHKJC] Full response structure:", JSON.stringify(res.data, null, 2).substring(0, 1000));
                    console.log("[ApiHKJC] Checking if matches array exists:", Array.isArray(res.data.data.matches));
                    console.log("[ApiHKJC] matches value:", res.data.data.matches);
                }
                // Log date range of matches
                if (matches.length > 0) {
                    const dates = matches.map((m) => {
                        const date = m.matchDate?.split('+')[0]?.split('T')[0];
                        return date;
                    }).filter((date) => Boolean(date))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .sort();
                    if (dates.length > 0) {
                        console.log("[ApiHKJC] Match dates range:", dates[0], "to", dates[dates.length - 1], "(" + dates.length + " unique dates)");
                    }
                }
                return matches;
            }
            else {
                console.error("[ApiHKJC] Unexpected response structure. Full response:", JSON.stringify(res.data, null, 2).substring(0, 2000));
                return [];
            }
        }
        console.warn("[ApiHKJC] API returned status", res.status);
        console.warn("[ApiHKJC] Response data:", res.data ? JSON.stringify(res.data, null, 2).substring(0, 1000) : 'no data');
        return [];
    }
    catch (error) {
        console.error("[ApiHKJC] Error fetching matches:", error);
        return [];
    }
};
exports.ApiHKJC = ApiHKJC;
const base = {
    "query": "query matchList($startIndex: Int, $endIndex: Int, $startDate: String, $endDate: String, $matchIds: [String], $tournIds: [String], $fbOddsTypes: [FBOddsType]!, $fbOddsTypesM: [FBOddsType]!, $inplayOnly: Boolean, $featuredMatchesOnly: Boolean, $frontEndIds: [String], $earlySettlementOnly: Boolean, $showAllMatch: Boolean) {\n  matches(startIndex: $startIndex, endIndex: $endIndex, startDate: $startDate, endDate: $endDate, matchIds: $matchIds, tournIds: $tournIds, fbOddsTypes: $fbOddsTypesM, inplayOnly: $inplayOnly, featuredMatchesOnly: $featuredMatchesOnly, frontEndIds: $frontEndIds, earlySettlementOnly: $earlySettlementOnly, showAllMatch: $showAllMatch) {\n    id\n    frontEndId\n    matchDate\n    kickOffTime\n    status\n    updateAt\n    sequence\n    esIndicatorEnabled\n    homeTeam {\n      id\n      name_en\n      name_ch\n    }\n    awayTeam {\n      id\n      name_en\n      name_ch\n    }\n    tournament {\n      id\n      frontEndId\n      nameProfileId\n      isInteractiveServiceAvailable\n      code\n      name_en\n      name_ch\n    }\n    isInteractiveServiceAvailable\n    inplayDelay\n    venue {\n      code\n      name_en\n      name_ch\n    }\n    tvChannels {\n      code\n      name_en\n      name_ch\n    }\n    liveEvents {\n      id\n      code\n    }\n    featureStartTime\n    featureMatchSequence\n    poolInfo {\n      normalPools\n      inplayPools\n      sellingPools\n      ntsInfo\n      entInfo\n      definedPools\n    }\n    runningResult {\n      homeScore\n      awayScore\n      corner\n      homeCorner\n      awayCorner\n    }\n    runningResultExtra {\n      homeScore\n      awayScore\n      corner\n      homeCorner\n      awayCorner\n    }\n    adminOperation {\n      remark {\n        typ\n      }\n    }\n    foPools(fbOddsTypes: $fbOddsTypes) {\n      id\n      status\n      oddsType\n      instNo\n      inplay\n      name_ch\n      name_en\n      updateAt\n      expectedSuspendDateTime\n      lines {\n        lineId\n        status\n        condition\n        main\n        combinations {\n          combId\n          str\n          status\n          offerEarlySettlement\n          currentOdds\n          selections {\n            selId\n            str\n            name_ch\n            name_en\n          }\n        }\n      }\n    }\n  }\n}",
    "variables": {
        "fbOddsTypes": ["HDC", "EDC"], // Used to filter foPools (which odds pools to return for each match)
        "fbOddsTypesM": ["HDC", "EDC"], // Used to filter matches (only matches with these odds types)
        "featuredMatchesOnly": false,
        "startDate": null, // null = all dates
        "endDate": null, // null = all dates
        "tournIds": null,
        "matchIds": null,
        "tournId": null,
        "tournProfileId": null,
        "subType": null,
        "startIndex": 1,
        "endIndex": 120,
        "frontEndIds": null,
        "earlySettlementOnly": false,
        "showAllMatch": false, // When true, returns all matches regardless of fbOddsTypesM
        "tday": null,
        "tIdList": null
    }
};

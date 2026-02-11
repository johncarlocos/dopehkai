import API from "../api/api";
import { HKJC } from "../model/hkjc.model";

export const ApiHKJC = async (): Promise<HKJC[]> => {
    try {
        console.log("[ApiHKJC] Fetching all matches from HKJC API");
        
        // Strategy: Make multiple queries with different odds types and merge results
        // This ensures we get ALL matches, not just those with specific odds types
        // Common odds types: HAD (most common), HDC, EDC, HIL, OOE, CS, TG
        const oddsTypeGroups = [
            ["HAD"], // Home/Draw/Away - most matches have this
            ["HDC"], // Handicap
            ["EDC"], // European Handicap
            ["HIL"], // Half-Time/Full-Time
            ["OOE"], // Odd/Even
            ["CS"],  // Correct Score
            ["TG"]   // Total Goals
        ];
        
        const allMatchesMap = new Map<string, HKJC>();
        
        // Query with each odds type group and merge results
        for (const oddsTypes of oddsTypeGroups) {
            try {
                const queryWithDates = {
                    ...base,
                    variables: {
                        ...base.variables,
                        startDate: null,
                        endDate: null,
                        startIndex: 1,
                        endIndex: 500,
                        showAllMatch: true,
                        fbOddsTypesM: oddsTypes,
                        featuredMatchesOnly: false,
                        inplayOnly: false
                    }
                };
                
                console.log(`[ApiHKJC] Querying with odds types: ${oddsTypes.join(', ')}`);
                const res = await API.POST("https://info.cld.hkjc.com/graphql/base/", queryWithDates);
                
                if (res.status == 200 && res.data && res.data.data) {
                    const matches = res.data.data.matches || [];
                    console.log(`[ApiHKJC] Received ${matches.length} matches for odds types: ${oddsTypes.join(', ')}`);
                    
                    // Add matches to map (deduplicated by id)
                    matches.forEach((match: HKJC) => {
                        if (match.id && !allMatchesMap.has(match.id)) {
                            allMatchesMap.set(match.id, match);
                        }
                    });
                }
            } catch (error) {
                console.warn(`[ApiHKJC] Error querying with odds types ${oddsTypes.join(', ')}:`, error);
                // Continue with next odds type group
            }
        }
        
        const allMatches = Array.from(allMatchesMap.values());
        console.log("[ApiHKJC] Total unique matches after merging:", allMatches.length);
        
        // Log date range of matches
        if (allMatches.length > 0) {
            const dates = allMatches.map((m: HKJC): string | undefined => {
                const date = m.matchDate?.split('+')[0]?.split('T')[0];
                return date;
            }).filter((date: string | undefined): date is string => Boolean(date))
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
              .sort();
            if (dates.length > 0) {
                console.log("[ApiHKJC] Match dates range:", dates[0], "to", dates[dates.length - 1], "(" + dates.length + " unique dates)");
            }
        }
        
        return allMatches;
    } catch (error) {
        console.error("[ApiHKJC] Error fetching matches:", error);
        return [];
    }
};

const base = {
    "query": "query matchList($startIndex: Int, $endIndex: Int, $startDate: String, $endDate: String, $matchIds: [String], $tournIds: [String], $fbOddsTypes: [FBOddsType]!, $fbOddsTypesM: [FBOddsType]!, $inplayOnly: Boolean, $featuredMatchesOnly: Boolean, $frontEndIds: [String], $earlySettlementOnly: Boolean, $showAllMatch: Boolean) {\n  matches(startIndex: $startIndex, endIndex: $endIndex, startDate: $startDate, endDate: $endDate, matchIds: $matchIds, tournIds: $tournIds, fbOddsTypes: $fbOddsTypesM, inplayOnly: $inplayOnly, featuredMatchesOnly: $featuredMatchesOnly, frontEndIds: $frontEndIds, earlySettlementOnly: $earlySettlementOnly, showAllMatch: $showAllMatch) {\n    id\n    frontEndId\n    matchDate\n    kickOffTime\n    status\n    updateAt\n    sequence\n    esIndicatorEnabled\n    homeTeam {\n      id\n      name_en\n      name_ch\n    }\n    awayTeam {\n      id\n      name_en\n      name_ch\n    }\n    tournament {\n      id\n      frontEndId\n      nameProfileId\n      isInteractiveServiceAvailable\n      code\n      name_en\n      name_ch\n    }\n    isInteractiveServiceAvailable\n    inplayDelay\n    venue {\n      code\n      name_en\n      name_ch\n    }\n    tvChannels {\n      code\n      name_en\n      name_ch\n    }\n    liveEvents {\n      id\n      code\n    }\n    featureStartTime\n    featureMatchSequence\n    poolInfo {\n      normalPools\n      inplayPools\n      sellingPools\n      ntsInfo\n      entInfo\n      definedPools\n    }\n    runningResult {\n      homeScore\n      awayScore\n      corner\n      homeCorner\n      awayCorner\n    }\n    runningResultExtra {\n      homeScore\n      awayScore\n      corner\n      homeCorner\n      awayCorner\n    }\n    adminOperation {\n      remark {\n        typ\n      }\n    }\n    foPools(fbOddsTypes: $fbOddsTypes) {\n      id\n      status\n      oddsType\n      instNo\n      inplay\n      name_ch\n      name_en\n      updateAt\n      expectedSuspendDateTime\n      lines {\n        lineId\n        status\n        condition\n        main\n        combinations {\n          combId\n          str\n          status\n          offerEarlySettlement\n          currentOdds\n          selections {\n            selId\n            str\n            name_ch\n            name_en\n          }\n        }\n      }\n    }\n  }\n}",
    "variables": {
        "fbOddsTypes": ["HDC", "EDC"], // Used to filter foPools (which odds pools to return for each match)
        "fbOddsTypesM": ["HDC", "EDC"], // Used to filter matches (only matches with these odds types)
        "featuredMatchesOnly": false,
        "startDate": null, // null = all dates
        "endDate": null,   // null = all dates
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
}
    ;  
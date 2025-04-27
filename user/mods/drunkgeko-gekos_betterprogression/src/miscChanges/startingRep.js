"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStartingReputation = setStartingReputation;
function setStartingReputation(context) {
    const config = context.config.overrideInitialStanding;
    const profileTemplates = context.tables.templates.profiles;
    for (const profile of Object.values(profileTemplates))
        for (const template of [profile.bear, profile.usec]) {
            template.trader.initialStanding["default"] = config.defaultOverride;
            for (const trader of Object.keys(context.tables.traders)) {
                template.trader.initialStanding[trader] = config.defaultOverride;
            }
            for (const [trader, standing] of Object.entries(config.indivudalOverrides)) {
                template.trader.initialStanding[trader] = standing;
            }
        }
}
//# sourceMappingURL=startingRep.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeHidehoutBuildCosts = changeHidehoutBuildCosts;
const utils_1 = require("../utils");
function changeHidehoutBuildCosts(context) {
    const config = context.config.hideoutBuildsChanges;
    const hideoutAreas = context.tables.hideout.areas;
    for (const area of hideoutAreas)
        for (const stage of Object.values(area.stages)) {
            const nonCurrencyReq = stage.requirements.filter((req) => !utils_1.currencies.includes(req.templateId));
            for (const req of nonCurrencyReq) {
                if (req.count) {
                    req.count -= config.threshold;
                    if (req.count > 0)
                        req.count *= config.factor;
                    req.count += config.threshold;
                    if (config.roundDown) {
                        req.count = Math.floor(req.count);
                    }
                    else {
                        req.count = Math.ceil(req.count);
                    }
                }
            }
        }
}
//# sourceMappingURL=buildChanges.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSupportForGPTraders = addSupportForGPTraders;
exports.changeRefPurchasingOptions = changeRefPurchasingOptions;
exports.gainRefRepOnKill = gainRefRepOnKill;
const utils_1 = require("../utils");
const ItemTpl_1 = require("C:/snapshot/project/obj/models/enums/ItemTpl");
function addSupportForGPTraders(context, container) {
    container.afterResolution("TraderController", (_t, result) => {
        // We want to replace the original method logic with something different
        const old = result.getItemPrices.bind(result);
        result.getItemPrices = (sessionId, traderId) => {
            const oldOut = old(sessionId, traderId); //Add old logic back in
            oldOut.currencyCourses["5d235b4d86f7742e017bc88a"] = 7500; //ToDo: configurable?
            return oldOut;
        };
    }, { frequency: "Always" });
}
function changeRefPurchasingOptions(context) {
    const ref = context.tables.traders["6617beeaa9cfa777ca915b7c"];
    const config = context.config.refChanges;
    if (config.refBuysInGPCoins)
        ref.base.currency = "GP";
    if (config.refOnlyBuysDogtags) {
        ref.base.items_buy.category = [];
        ref.base.items_buy.id_list = (0, utils_1.getDogtagsList)(context);
    }
    if (config.refAlsoBuysLegaMedals)
        ref.base.items_buy.id_list.push(ItemTpl_1.ItemTpl.BARTER_LEGA_MEDAL);
}
function gainRefRepOnKill(context, container) {
    container.afterResolution("LocationLifecycleService", (_t, result) => {
        // We want to replace the original method logic with something different
        const old = result.handlePostRaidPmc.bind(result);
        result.handlePostRaidPmc = (sessionId, fullProfile, scavProfile, isDead, isSurvived, isTransfer, request, locationName) => {
            old(sessionId, fullProfile, scavProfile, isDead, isSurvived, isTransfer, request, locationName); //Add old logic back in
            let pmcKills = [];
            try {
                //Filter PMC kills
                pmcKills = request.results.profile.Stats.Eft.Victims.filter((victim) => ["pmcbear", "pmcusec"].includes(victim.Role.toLowerCase()));
            }
            catch (error) {
                this.context.logger.error("Error Details:" + "Something went wrong when trying to tally up PMC kills!");
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
            try {
                fullProfile.characters.pmc.TradersInfo["6617beeaa9cfa777ca915b7c"].standing += repByKills(pmcKills, context);
            }
            catch (error) {
                this.context.logger.error("Error Details:" + "Something went wrong when trying add Ref rep for PMC kills!");
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
        };
        // The modifier Always makes sure this replacement method is ALWAYS replaced
    }, { frequency: "Always" });
}
function repByKills(pmcKills, context) {
    let totalRep = 0;
    for (const kill of pmcKills)
        for (const repRange of context.config.refChanges.refStandingOnKill.repByKillLevel) {
            if (kill.Level >= repRange.levelRange[0] && kill.Level < repRange.levelRange[1])
                totalRep += repRange.rep;
        }
    return totalRep;
}
//# sourceMappingURL=refRepRework.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeBitcoinFarming = changeBitcoinFarming;
const ItemTpl_1 = require("C:/snapshot/project/obj/models/enums/ItemTpl");
const utils_1 = require("../utils");
function changeBitcoinFarming(context) {
    const config = context.config.bitcoinChanges;
    //Set bitcoin value
    if (config.overrideValue) {
        context.tables.templates.handbook.Items.find((item) => item.Id === ItemTpl_1.ItemTpl.BARTER_PHYSICAL_BITCOIN).Price = config.value;
    }
    //Multiply btc production rate
    const btcProds = context.tables.hideout.production.recipes.filter((production) => production.endProduct === ItemTpl_1.ItemTpl.BARTER_PHYSICAL_BITCOIN);
    for (const p of btcProds) {
        p.productionTime = Math.round(p.productionTime / config.btcFarmSpeedMult);
        p.productionLimitCount = config.btcCapacity;
    }
    //Apply boost rate
    context.tables.hideout.settings.gpuBoostRate = config.gpuBoostRate;
    //Remove all non-barters for GPUs
    if (config.cannotBuyGPU)
        for (const trader of Object.values(context.tables.traders)) {
            if (trader.assort == null)
                continue;
            trader.assort.items = trader.assort.items.filter(assort => assort._tpl != "57347ca924597744596b4e71" || (0, utils_1.isBarterTrade)(assort, trader));
        }
}
//# sourceMappingURL=bitcoinChanges.js.map
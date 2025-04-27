"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableFleaMarket = disableFleaMarket;
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
function disableFleaMarket(context) {
    const allItems = context.tables.templates.items;
    const config = context.config.fleaMarketChanges;
    for (const [id, item] of Object.entries(allItems)) {
        let allowed = config.fleaWhitelist.includes(id);
        if (config.stillAllowKeys && context.itemHelper.isOfBaseclass(id, BaseClasses_1.BaseClasses.KEY) && item._props.CanSellOnRagfair)
            allowed = true;
        item._props.CanRequireOnRagfair = allowed && item._props.CanRequireOnRagfair;
        item._props.CanSellOnRagfair = allowed;
    }
}
//# sourceMappingURL=fleaChanges.js.map
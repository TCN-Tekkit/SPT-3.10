"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewItems = addNewItems;
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/naming-convention
const json5_1 = __importDefault(require("C:/snapshot/project/node_modules/json5"));
const utils_1 = require("../utils");
function addNewItems(context) {
    //Read custom items config
    const fileContent = fs_1.default.readFileSync((0, utils_1.getModFolder)() + "/config/advanced/customItems.json5", "utf-8");
    const itemsConfig = json5_1.default.parse(fileContent);
    const buffs = context.tables.globals.config.Health.Effects.Stimulator.Buffs;
    const items = context.tables.templates.items;
    const locales = context.tables.locales.global;
    //Add the buffs
    for (const [buff, effects] of Object.entries(itemsConfig.customBuffs)) {
        buffs[buff] = effects;
    }
    //Add the items
    for (const [id, item] of Object.entries(itemsConfig.customItems)) {
        items[id] = item;
    }
    //Add the locales
    for (const [item, locale] of Object.entries(itemsConfig.customLocales)) {
        (0, utils_1.addToLocale)(locales, item, locale.Name, locale.ShortName, locale.Description);
    }
    //Add the trades
    for (const [traderID, additions] of Object.entries(itemsConfig.customTrades)) {
        const trader = context.tables.traders[traderID];
        for (const trade of additions.items) {
            trader.assort.items.push(trade);
        }
        for (const [trade, scheme] of Object.entries(additions.barter_scheme)) {
            trader.assort.barter_scheme[trade] = scheme;
        }
        for (const [trade, loyalty] of Object.entries(additions.loyal_level_items)) {
            trader.assort.loyal_level_items[trade] = loyalty;
        }
    }
}
//# sourceMappingURL=items.js.map
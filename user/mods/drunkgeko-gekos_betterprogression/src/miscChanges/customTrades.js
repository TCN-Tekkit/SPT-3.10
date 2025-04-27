"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCustomTrades = addCustomTrades;
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/naming-convention
const json5_1 = __importDefault(require("C:/snapshot/project/node_modules/json5"));
const utils_1 = require("../utils");
function addCustomTrades(context) {
    //Read custom trades config
    const fileContent = fs_1.default.readFileSync((0, utils_1.getModFolder)() + "/config/advanced/customTrades.json5", "utf-8");
    const tradesConfig = json5_1.default.parse(fileContent);
    for (const [traderID, additions] of Object.entries(tradesConfig)) {
        const trader = context.tables.traders[traderID];
        for (const trade of Object.values(additions.items)) {
            trader.assort.items.push(trade);
        }
        for (const [trade, scheme] of Object.entries(additions.barter_scheme)) {
            trader.assort.barter_scheme[trade] = scheme;
        }
        for (const [trade, loyalty] of Object.entries(additions.loyal_level_items)) {
            trader.assort.loyal_level_items[trade] = loyalty;
        }
        for (const [trade, lockProps] of Object.entries(additions.questlocks)) {
            (0, utils_1.lockBehindQuest)(context, traderID, trade, lockProps.quest, additions.items[trade]._tpl, lockProps.rewardId, lockProps.targetId);
        }
    }
}
//# sourceMappingURL=customTrades.js.map
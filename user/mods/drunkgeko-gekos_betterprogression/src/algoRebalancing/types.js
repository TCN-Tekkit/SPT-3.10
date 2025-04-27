"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangedItem = void 0;
class ChangedItem {
    trade;
    score;
    trader;
    logChange;
    isWeapon;
    constructor(trade, score, trader, logChange, isWeapon) {
        this.trade = trade;
        this.score = score;
        this.trader = trader;
        this.logChange = logChange;
        this.isWeapon = isWeapon;
    }
}
exports.ChangedItem = ChangedItem;
//# sourceMappingURL=types.js.map
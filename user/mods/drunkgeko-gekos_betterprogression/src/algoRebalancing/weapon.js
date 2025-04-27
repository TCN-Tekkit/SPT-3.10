"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWeaponLoyalty = calculateWeaponLoyalty;
exports.followDefaultBuild = followDefaultBuild;
exports.penalizeAdvancedAttachments = penalizeAdvancedAttachments;
exports.weaponShifting = weaponShifting;
const utils_1 = require("../utils");
function calculateWeaponLoyalty(item, assort, context) {
    const config = context.config.algorithmicalRebalancing.weaponRules;
    const tables = context.tables;
    const itemTemplate = tables.templates.items[item._tpl];
    const fireMode = (0, utils_1.bestFiremode)(itemTemplate);
    const fireRate = itemTemplate._props.bFirerate;
    let loyalty = config.defaultBaseLoyalty;
    //Base loyalty level based on caliber
    for (const byCaliber of config.weaponBaseLoyaltyByCaliber) {
        if (byCaliber.caliber == itemTemplate._props.ammoCaliber)
            loyalty = byCaliber.baseLoyalty;
    }
    //Account for best available fire mode
    for (const byMode of config.fireModeRules) {
        if (byMode.mode == fireMode)
            loyalty += byMode.delta;
    }
    //Account for fire rate if applicable
    if (fireMode == "fullauto" || fireMode == "burst")
        for (const byRate of config.fireRateRules) {
            if (fireRate >= byRate.rateInterval[0] && fireRate < byRate.rateInterval[1])
                loyalty += byRate.delta;
        }
    return loyalty + config.globalDelta;
}
//Move attachments that are part of some default build to the same tier of the weapon their are part of the build for
function followDefaultBuild(changedItems, context) {
    const changesById = (0, utils_1.indexById)(changedItems);
    for (const weaponChange of Object.values(changesById)) {
        if (!weaponChange.isWeapon)
            continue;
        const parts = (0, utils_1.getDefaultAttachments)(weaponChange.trade._tpl, context);
        for (const part of parts) {
            const level = (0, utils_1.loyaltyFromScore)(weaponChange.score, context.config.algorithmicalRebalancing.clampToMaxLevel);
            const partTrades = (0, utils_1.findTrades)(part, context);
            for (const partTrade of partTrades) {
                const oldPartChange = changesById[partTrade.trade._id];
                if (oldPartChange != null) {
                    const oldLevel = (0, utils_1.loyaltyFromScore)(oldPartChange.score, context.config.algorithmicalRebalancing.clampToMaxLevel);
                    if (oldLevel <= level) {
                        continue;
                    }
                    else {
                        changedItems[oldLevel] = changedItems[oldLevel].filter((item) => item.trade._id != partTrade.trade._id);
                    }
                }
                changedItems[level].push({
                    trade: partTrade.trade,
                    score: weaponChange.score,
                    trader: partTrade.trader,
                    logChange: false,
                    isWeapon: false
                });
            }
        }
    }
}
function penalizeAdvancedAttachments(changedItems, context) {
    const config = context.config.algorithmicalRebalancing;
    const toPenalize = [];
    for (const [tier, changes] of Object.entries(changedItems))
        for (const change of changes) {
            if (!change.isWeapon)
                continue;
            if (!(0, utils_1.canAllAttachmentsBePurchased)(change.trade, change.trader.assort.items, true, true, Number(tier), (0, utils_1.getDefaultAttachments)(change.trade._tpl, context), (0, utils_1.indexById)(changedItems), context)) {
                toPenalize.push([change, Number(tier)]);
                //context.logger.info(`Penalizing ${context.tables.templates.items[change.trade._tpl]._name}`);
            }
        }
    for (const [change, tier] of toPenalize) {
        changedItems[tier] = changedItems[tier].filter((item) => item.trade._id != change.trade._id);
        change.score += config.weaponRules.advancedAttachmentsDelta;
        const newLevel = (0, utils_1.loyaltyFromScore)(change.score, config.clampToMaxLevel);
        if (changedItems[newLevel] == null) {
            changedItems[newLevel] = [change];
        }
        else {
            changedItems[newLevel].push(change);
        }
    }
}
function weaponShifting(changedItems, context) {
    const config = context.config.algorithmicalRebalancing;
    const reverse = config.weaponRules.upshiftRules.shiftDownInstead;
    //Shifting system
    //WARNING!!! HORRIBLE CODE AHEAD!!!
    const keys = Object.keys(changedItems).sort();
    for (let i = 0; i < keys.length; i++) {
        const index = reverse ? keys.length - i - 1 : i; //Reverse order
        const changesInLevel = changedItems[keys[index]];
        if (changesInLevel == null || changesInLevel.length == 0)
            continue;
        const toShift = new Set();
        for (let i = 0; i < changesInLevel.length; i++) {
            if (toShift.has(i))
                continue;
            if (!changesInLevel[i].isWeapon)
                continue;
            for (let j = i + 1; j < changesInLevel.length; j++) {
                if (toShift.has(j))
                    continue;
                if (!changesInLevel[j].isWeapon)
                    continue;
                const a = changesInLevel[i];
                const b = changesInLevel[j];
                if ((0, utils_1.shareSameNiche)(a.trade, b.trade, a.trader, b.trader, context)) {
                    const aPowerLevel = config.weaponRules.upshiftRules.powerLevels[a.trade._tpl];
                    const bPowerLevel = config.weaponRules.upshiftRules.powerLevels[b.trade._tpl];
                    if (aPowerLevel == null || bPowerLevel == null || aPowerLevel == bPowerLevel)
                        continue;
                    if (aPowerLevel < bPowerLevel) {
                        toShift.add(reverse ? i : j);
                    }
                    else {
                        toShift.add(reverse ? j : i);
                    }
                }
            }
        }
        for (const shiftIndex of toShift) {
            const change = changesInLevel[shiftIndex];
            change.score += config.weaponRules.upshiftRules.shiftAmount * (reverse ? -1 : 1);
            const newLevel = (0, utils_1.loyaltyFromScore)(change.score, config.clampToMaxLevel);
            changedItems[keys[index]] = changedItems[keys[index]].filter(item => item.trade._id != change.trade._id);
            if (changedItems[newLevel] == null) {
                changedItems[newLevel] = [change];
            }
            else {
                changedItems[newLevel].push(change);
            }
        }
    }
}
//# sourceMappingURL=weapon.js.map
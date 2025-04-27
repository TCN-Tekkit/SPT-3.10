"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorithmicallyRebalance = algorithmicallyRebalance;
const ammo_1 = require("./ammo");
const weapon_1 = require("./weapon");
const utils_1 = require("../utils");
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
const types_1 = require("./types");
function algorithmicallyRebalance(context) {
    //Alias
    const config = context.config.algorithmicalRebalancing;
    const itemHelper = context.itemHelper;
    const traders = Object.values(context.tables.traders);
    //Organize changed items by loyalty level so that they can be easily accessed by the shifting system
    //[trade, loyaltyScore, trader, logChanges][index][loyaltyLevel]
    const changedItems = {};
    //Loop over each trader
    for (const trader of traders) {
        const loyaltyLevels = trader?.assort?.loyal_level_items;
        if (loyaltyLevels == null)
            continue;
        const itemsForSale = trader?.assort?.items;
        if (itemsForSale == null)
            continue;
        if (config.excludeTraders.includes(trader.base._id))
            continue;
        for (const item of itemsForSale) {
            if (Object.keys(config.explicitLoyaltyOverride.trades).includes(item._id))
                continue;
            if (Object.keys(config.explicitLoyaltyOverride.items).includes(item._tpl))
                continue;
            let thisItem;
            //// AMMO ////
            if (config.ammoRules.enable) {
                let ammoOrBox = false;
                let ammo;
                let loyaltyScore;
                if (itemHelper.isOfBaseclass(item._tpl, BaseClasses_1.BaseClasses.AMMO)) {
                    loyaltyScore = (0, ammo_1.calculateAmmoLoyalty)(item, context);
                    ammo = item._tpl;
                    ammoOrBox = true;
                }
                else if (itemHelper.isOfBaseclass(item._tpl, BaseClasses_1.BaseClasses.AMMO_BOX)) {
                    ammo = context.tables.templates.items[item._tpl]._props.StackSlots[0]._props.filters[0].Filter[0];
                    loyaltyScore = (0, ammo_1.scoreAmmo)(context.tables.templates.items[ammo], context);
                    ammoOrBox = true;
                }
                if (ammoOrBox && !config.ammoRules.ignoreCalibers.includes(context.tables.templates.items[ammo]._props.Caliber)) {
                    thisItem = new types_1.ChangedItem(item, loyaltyScore, trader, config.ammoRules.logChanges, false);
                }
            }
            //// WEAPONS ////
            if (config.weaponRules.enable
                && itemHelper.isOfBaseclass(item._tpl, BaseClasses_1.BaseClasses.WEAPON)
                && !itemHelper.isOfBaseclass(item._tpl, BaseClasses_1.BaseClasses.SPECIAL_WEAPON)) //ToDo: double check melee and grenades (and possibly other exceptions)
             {
                const loyaltyScore = (0, weapon_1.calculateWeaponLoyalty)(item, itemsForSale, context);
                thisItem = new types_1.ChangedItem(item, loyaltyScore, trader, config.weaponRules.logChanges, true);
            }
            if (thisItem != null) //If item is being affected by the mod
             {
                //Final modifications
                if ((0, utils_1.isQuestLocked)(item, trader)) {
                    thisItem.score += config.questLockDelta;
                    if (config.logBartersAndLocks)
                        context.logger.info(context.tables.templates.items[item._tpl]._name + " is a quest-locked item\t(Trade ID: " + item._id + ")");
                }
                if ((0, utils_1.isBarterTrade)(item, trader)) {
                    thisItem.score += config.barterDelta;
                    if (config.logBartersAndLocks)
                        context.logger.info(context.tables.templates.items[item._tpl]._name + " is a bartered item\t(Trade ID: " + item._id + ")");
                }
                //By-trader delta
                if (trader.base._id in config.deltaByTrader)
                    thisItem.score += config.deltaByTrader[trader.base._id];
                //Explicit deltas
                const tradeD = config.explicitLoyaltyDelta.trades[thisItem.trade._id];
                const itemD = config.explicitLoyaltyDelta.items[thisItem.trade._tpl];
                if (!isNaN(tradeD))
                    thisItem.score += tradeD;
                if (!isNaN(itemD))
                    thisItem.score += itemD;
                const level = (0, utils_1.loyaltyFromScore)(thisItem.score, config.clampToMaxLevel);
                if (changedItems[level] == null) {
                    changedItems[level] = [thisItem];
                }
                else {
                    changedItems[level].push(thisItem);
                }
            }
        }
    }
    if (config.weaponRules.upshiftRules.enable)
        (0, weapon_1.weaponShifting)(changedItems, context);
    if (config.weaponRules.attachmentsFollowDefaultBuild)
        (0, weapon_1.followDefaultBuild)(changedItems, context);
    if (config.weaponRules.advancedAttachmentsDelta != 0)
        (0, weapon_1.penalizeAdvancedAttachments)(changedItems, context);
    //Apply changes
    for (const changesInLevel of Object.values(changedItems)) {
        if (changesInLevel == null || changesInLevel.length == 0)
            continue;
        for (const changedItem of changesInLevel) {
            let doClamp = config.clampToMaxLevel;
            if (config.forceClampingOfQuestlockedItems && (0, utils_1.isQuestLocked)(changedItem.trade, changedItem.trader))
                doClamp = true;
            if (changedItem.logChange)
                context.logger.info(`Setting ${context.tables.templates.items[changedItem.trade._tpl]._name} at loyalty level ${(0, utils_1.loyaltyFromScore)(changedItem.score, doClamp)} (${changedItem.score})`);
            (0, utils_1.setLoyalty)(changedItem.trade._id, changedItem.score, changedItem.trader, doClamp);
        }
    }
    //Overrides
    for (const trader of traders) {
        const loyaltyLevels = trader?.assort?.loyal_level_items;
        if (loyaltyLevels == null)
            continue;
        const itemsForSale = trader?.assort?.items;
        if (itemsForSale == null)
            continue;
        if (config.excludeTraders.includes(trader.base._id))
            continue;
        for (const item of trader.assort.items) {
            let override = null;
            override = config.explicitLoyaltyOverride.trades[item._id];
            if (override == null)
                override = config.explicitLoyaltyOverride.items[item._tpl];
            if (override == null)
                continue;
            (0, utils_1.setLoyalty)(item._id, override, trader, config.clampToMaxLevel);
        }
    }
    if (config.ammoRules.craftSettings.enable)
        (0, ammo_1.rebalanceAmmoCrafts)(context);
}
//# sourceMappingURL=core.js.map
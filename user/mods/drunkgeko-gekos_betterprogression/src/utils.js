"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencies = void 0;
exports.getDogtagsList = getDogtagsList;
exports.findTrades = findTrades;
exports.getDefaultAttachments = getDefaultAttachments;
exports.unrollAttachments = unrollAttachments;
exports.containsAttachment = containsAttachment;
exports.indexById = indexById;
exports.canBePurchased = canBePurchased;
exports.canAllAttachmentsBePurchased = canAllAttachmentsBePurchased;
exports.lockBehindQuest = lockBehindQuest;
exports.setAreaLevelRequirement = setAreaLevelRequirement;
exports.isQuestLockedCraft = isQuestLockedCraft;
exports.addToLocale = addToLocale;
exports.shareSameNiche = shareSameNiche;
exports.loyaltyFromScore = loyaltyFromScore;
exports.setLoyalty = setLoyalty;
exports.isBarterTrade = isBarterTrade;
exports.isQuestLocked = isQuestLocked;
exports.getModFolder = getModFolder;
exports.bestFiremode = bestFiremode;
exports.pickBestFiremode = pickBestFiremode;
const RewardType_1 = require("C:/snapshot/project/obj/models/enums/RewardType");
const path_1 = require("path");
exports.currencies = [
    "5449016a4bdc2d6f028b456f", //Roubles
    "5696686a4bdc2da3298b456a", //Dollars
    "569668774bdc2da2298b4568", //Euroes
    "5d235b4d86f7742e017bc88a", //GP Coin
    "6656560053eaaa7a23349c86" //Lega medal
];
const purchasability = {};
function getDogtagsList(context) {
    const list = [];
    for (const [id, item] of Object.entries(context.tables.templates.items)) {
        if (item._props.DogTagQualities)
            list.push(id);
    }
    return list;
}
//Find and return the trader-trade pair that sell the given item
function findTrades(itemId, context) {
    const found = [];
    for (const trader of Object.values(context.tables.traders)) {
        if (trader.assort == null)
            continue;
        for (const trade of trader.assort.items) {
            if (trade._tpl == itemId)
                found.push({
                    trader: trader,
                    trade: trade
                });
        }
    }
    return found;
}
function getDefaultAttachments(weaponID, context) {
    const preset = context.presetHelper.getDefaultWeaponPresets[weaponID];
    if (preset == null || preset == undefined)
        return [];
    return preset._items.map((item) => item._tpl);
}
//Returns the list of all attachments connected to the given item (recursively)
function unrollAttachments(item, assort) {
    const attachments = [];
    const newAttachments = assort.filter((candidate) => candidate.parentId == item._id && candidate._tpl != item._tpl);
    attachments.push(...newAttachments);
    for (const att of newAttachments) {
        attachments.push(...unrollAttachments(att, assort));
    }
    return attachments;
}
//Does the given item from the given assort contain the given attachment? (as an item table id)
function containsAttachment(item, assort, attachmentID, context) {
    //Shortcut items without slots
    const template = context.tables.templates.items[item._tpl];
    if (template._props.Slots == null)
        return false;
    if (template._props.Slots.length == 0)
        return false;
    return unrollAttachments(item, assort).map((item) => item._tpl).includes(attachmentID);
}
function indexById(byTier) {
    const byId = {};
    for (const items of Object.values(byTier))
        for (const item of items) {
            byId[item.trade._id] = item;
        }
    return byId;
}
//Can the given item be purchased before or at the given loyalty tier cutoff? Can optionally exclude barters
//Trade IDs in skip will not be considered as valid purchases (mostly to avoid self-referencing when used in canAllAttachmentsBePurchased)
//If an item is present in tierOverrides the corresponding loyalty level will be used instead of that of the trader
//Careful about the dynamic programming part with purchasability. If this function previously found an item to be purchasable it will say it is again without checking even if things changed
function canBePurchased(itemID, excludeBarters, excludeQuestlocks, tierCutoff, skip, tierOverrides, context) {
    if (purchasability[itemID] <= tierCutoff)
        return true;
    for (const trader of Object.values(context.tables.traders)) {
        if (trader.assort == null)
            continue;
        for (const trade of trader.assort.items) {
            const loyalty = tierOverrides[trade._id] != null ? tierOverrides[trade._id].score : trader.assort.loyal_level_items[trade._id];
            if (loyaltyFromScore(loyalty, context.config.algorithmicalRebalancing.clampToMaxLevel) > tierCutoff)
                continue;
            if ((trade._tpl === itemID && trader.assort.barter_scheme[trade._id] != null)
                || containsAttachment(trade, trader.assort.items, itemID, context)) //It's a match!
             {
                if (excludeBarters && isBarterTrade(trade, trader))
                    continue;
                if (excludeQuestlocks && isQuestLocked(trade, trader))
                    continue;
                if (skip.includes(trade._id))
                    continue;
                if (itemID in purchasability) {
                    purchasability[itemID] = Math.min(purchasability[itemID], loyalty);
                }
                else {
                    purchasability[itemID] = loyalty;
                }
                return true;
            }
        }
    }
    return false;
}
//Can all the attachments on the given item be purchased before the given loyalty tier cutoff? Can optionally exclude barters
//Attachments in the skip list will not be checked
function canAllAttachmentsBePurchased(item, assort, excludeBarters, excludeQuestlocks, tierCutoff, skip, tierOverrides, context) {
    const attachments = unrollAttachments(item, assort);
    for (const att of attachments) {
        if (skip.includes(att._tpl))
            continue;
        if (!canBePurchased(att._tpl, excludeBarters, excludeQuestlocks, tierCutoff, [item._id], tierOverrides, context)) {
            //context.logger.info(`Unpurchasable attachment: ${context.tables.templates.items[att._tpl]._name}`)
            return false;
        }
    }
    //context.logger.success(`Did not penalize ${context.tables.templates.items[item._tpl]._name}`);
    return true;
}
function lockBehindQuest(context, traderID, trade, lock, itemID, rewardID, targetID) {
    const trader = context.tables.traders[traderID];
    trader.questassort.success[trade] = lock;
    const questRewards = context.tables.templates.quests[lock].rewards.Success;
    questRewards.push({
        type: RewardType_1.RewardType.ASSORTMENT_UNLOCK,
        index: questRewards.length,
        unknown: false,
        traderId: traderID,
        target: targetID,
        items: [
            {
                _id: targetID,
                _tpl: itemID
            }
        ],
        id: rewardID,
        availableInGameEditions: []
    });
}
function setAreaLevelRequirement(craft, level) {
    for (const req of craft.requirements) {
        if (req.requiredLevel != null)
            req.requiredLevel = level;
    }
}
function isQuestLockedCraft(craft) {
    for (const req of craft.requirements) {
        if (req.questId != null)
            return true;
    }
    return false;
}
function addToLocale(locales, id, name, shortname, description) {
    for (const locale of Object.values(locales)) {
        locale[`${id} Name`] = name;
        locale[`${id} ShortName`] = shortname;
        locale[`${id} Description`] = description;
    }
}
function shareSameNiche(a, b, aTrader, bTrader, context) {
    const c = context.config.algorithmicalRebalancing.weaponRules.upshiftRules;
    const aTempl = context.tables.templates.items[a._tpl];
    const bTempl = context.tables.templates.items[b._tpl];
    if (c.devideNicheByFiremode) {
        if (bestFiremode(aTempl) != bestFiremode(bTempl))
            return false;
    }
    if (c.devideNicheByCaliber) {
        if (aTempl._props.ammoCaliber != bTempl._props.ammoCaliber)
            return false;
    }
    if (c.devideNicheByBarterType) {
        if (isBarterTrade(a, aTrader) != isBarterTrade(b, bTrader))
            return false;
    }
    if (c.devideNicheByQuestLock) {
        if (isQuestLocked(a, aTrader) != isQuestLocked(b, bTrader))
            return false;
    }
    return true;
}
function loyaltyFromScore(score, capToMax) {
    const maxLevel = capToMax ? 4 : 999; //Set max level to a dummy value if config states that loyalty > 4 is to be hidden from all trader levels
    return Math.max(1, Math.min(maxLevel, Math.floor(score))); //Floor and clamp between 1 and the max level
}
//Sets the loyalty level of the given sale item on the given trader
//If capToMax is false the loyalty level will be allowed to go beyond 4
function setLoyalty(itemID, loyalty, trader, capToMax) {
    if (loyalty == null)
        loyalty = 0;
    trader.assort.loyal_level_items[itemID] = loyaltyFromScore(loyalty, capToMax);
}
//Checks if the given trade item is offered for barter on the given trader
//Anything that can't be purchased for RUB, EUR, USD, GP or Lega Medals is considered a barter
function isBarterTrade(trade, trader) {
    const scheme = trader.assort.barter_scheme[trade._id];
    if (scheme == null)
        return false;
    for (const ask of scheme)
        for (const ask1 of ask) //Cursed, i know
         {
            if (!exports.currencies.includes(ask1._tpl))
                return true;
        }
    return false;
}
//Checks if the given trade item is quest locked on the given trader
function isQuestLocked(trade, trader) {
    const questLocks = [
        ...Object.keys(trader.questassort["success"]),
        ...Object.keys(trader.questassort["started"]),
        ...Object.keys(trader.questassort["fail"])
    ];
    for (const questLockedTrade of questLocks) {
        if (trade._id == questLockedTrade)
            return true;
    }
    return false;
}
//Returns the path to the mod folder
function getModFolder() {
    return (0, path_1.join)(__dirname, "../"); // "./user/mods/Gekos_BetterProgression";
}
function bestFiremode(item) {
    const res = pickBestFiremode(item._props.weapFireType, item._props.BoltAction || !item._props.CanQueueSecondShot);
    if (res == "")
        console.log(item);
    return res;
}
//Returns one of "manual", "semiauto" or "fullauto" depending on which is the best fire mode available between the provided choices
function pickBestFiremode(modes, isManual) {
    if (modes == null) {
        return "";
    }
    const ranks = {
        "none": -9999,
        "manual": 0,
        "doublet": 1,
        "semiauto": 1,
        "doubleaction": 1,
        "single": isManual ? -100 : 1,
        "burst": 2,
        "fullauto": 3
    };
    let bestMode = "none";
    for (const mode of modes) {
        if (ranks[bestMode] < ranks[mode])
            bestMode = mode;
    }
    if (isManual)
        if (ranks[bestMode] < ranks["manual"])
            bestMode = "manual";
    //Rename for simplicity
    if (bestMode == "manual" || bestMode == "pumpaction" || (isManual && bestMode == "single"))
        return "manual";
    if (bestMode == "single" || bestMode == "doubleaction" || bestMode == "doublet")
        return "semiauto";
    return bestMode;
}
//# sourceMappingURL=utils.js.map
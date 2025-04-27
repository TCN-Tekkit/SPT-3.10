"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAmmoLoyalty = calculateAmmoLoyalty;
exports.scoreAmmo = scoreAmmo;
exports.rebalanceAmmoCrafts = rebalanceAmmoCrafts;
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
const utils_1 = require("../utils");
function calculateAmmoLoyalty(item, context) {
    const itemTemplate = context.tables.templates.items[item._tpl];
    return scoreAmmo(itemTemplate, context);
}
function scoreAmmo(itemTemplate, context) {
    const config = context.config.algorithmicalRebalancing.ammoRules;
    let loyalty = config.defaultBaseLoyaltyByPen;
    //Base level from penetration
    for (const rule of config.ammoBaseLoyaltyByPen) {
        if (itemTemplate._props.PenetrationPower >= rule.penInterval[0] && itemTemplate._props.PenetrationPower < rule.penInterval[1]) {
            loyalty = rule.baseLoyalty;
        }
    }
    //Modify by caliber
    for (const rule of config.caliberRules) {
        if (itemTemplate._props.Caliber == rule.caliber) {
            loyalty += rule.loyaltyDelta;
        }
    }
    //Modify by damage (accounting for projectile count)
    for (const rule of config.damageRules) {
        const totalDamage = itemTemplate._props.Damage * itemTemplate._props.ProjectileCount;
        if (totalDamage >= rule.damageInterval[0] && totalDamage < rule.damageInterval[1]) {
            loyalty += rule.loyaltyDelta;
        }
    }
    loyalty += config.globalDelta;
    return loyalty;
}
function rebalanceAmmoCrafts(context) {
    const config = context.config.algorithmicalRebalancing.ammoRules;
    const crafts = context.tables.hideout.production.recipes;
    for (const craft of crafts) {
        const ammoId = craft.endProduct;
        if (!context.itemHelper.isOfBaseclass(ammoId, BaseClasses_1.BaseClasses.AMMO))
            continue; //Exclude non-ammo
        let score = scoreAmmo(context.tables.templates.items[ammoId], context);
        if ((0, utils_1.isQuestLockedCraft)(craft))
            score += context.config.algorithmicalRebalancing.questLockDelta;
        for (const map of config.craftSettings.loyaltyToLevelRanges) {
            if (score >= map.range[0] && score < map.range[1])
                (0, utils_1.setAreaLevelRequirement)(craft, map.level);
        }
    }
}
//# sourceMappingURL=ammo.js.map
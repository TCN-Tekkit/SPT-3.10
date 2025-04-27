"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStashProgression = changeStashProgression;
const HideoutAreas_1 = require("C:/snapshot/project/obj/models/enums/HideoutAreas");
const ItemTpl_1 = require("C:/snapshot/project/obj/models/enums/ItemTpl");
const utils_1 = require("../utils");
function changeStashProgression(context) {
    //Thanks to ODT and his Softcore mod for this part of the code, most of this function is taken from there with appropriate modifications
    //Link to the mod: https://hub.sp-tarkov.com/files/file/998-softcore-proper-singleplayer-experience-for-spt/
    const config = context.config.stashProgression;
    const profs = context.tables.templates.profiles;
    const basicStashBonuses = {
        id: "64f5b9e5fa34f11b380756c0",
        templateId: ItemTpl_1.ItemTpl.STASH_STANDARD_STASH_10X30,
        type: "StashSize"
    };
    const startingStashes = [
        ItemTpl_1.ItemTpl.STASH_STANDARD_STASH_10X30,
        ItemTpl_1.ItemTpl.STASH_LEFT_BEHIND_STASH_10X40,
        ItemTpl_1.ItemTpl.STASH_PREPARE_FOR_ESCAPE_STASH_10X50,
        ItemTpl_1.ItemTpl.STASH_EDGE_OF_DARKNESS_STASH_10X68,
        ItemTpl_1.ItemTpl.STASH_THE_UNHEARD_EDITION_STASH_10X72
    ];
    for (const [profile, _] of Object.entries(profs)) {
        for (const sidekey of Object.keys(_)) {
            if (sidekey === "descriptionLocaleKey") {
                continue;
            }
            const side = profs[profile][sidekey];
            const hideoutArea = side.character.Hideout?.Areas.find((area) => area.type === HideoutAreas_1.HideoutAreas.STASH);
            if (!hideoutArea) {
                context.logger.warning(`HideoutOptionsChanger: doProgressiveStash: hideoutArea for profile ${_} not found`);
                continue;
            }
            hideoutArea.level = 1;
            const startingStashItems = side.character.Inventory.items.filter((item) => startingStashes.includes(item._tpl));
            for (const item of startingStashItems) {
                item._tpl = ItemTpl_1.ItemTpl.STASH_STANDARD_STASH_10X30;
            }
            // Fix for Unheard profiles
            side.character.Bonuses = side.character.Bonuses.filter((x) => x.type !== "StashSize");
            side.character.Bonuses.push(basicStashBonuses);
        }
    }
    //Change stash sizes
    const stashUpdates = {
        [ItemTpl_1.ItemTpl.STASH_STANDARD_STASH_10X30]: config.stashSizes[0],
        [ItemTpl_1.ItemTpl.STASH_LEFT_BEHIND_STASH_10X40]: config.stashSizes[1],
        [ItemTpl_1.ItemTpl.STASH_PREPARE_FOR_ESCAPE_STASH_10X50]: config.stashSizes[2],
        [ItemTpl_1.ItemTpl.STASH_EDGE_OF_DARKNESS_STASH_10X68]: config.stashSizes[3],
        [ItemTpl_1.ItemTpl.STASH_THE_UNHEARD_EDITION_STASH_10X72]: config.stashSizes[4]
    };
    for (const [itemTpl, stashSize] of Object.entries(stashUpdates)) {
        const stashItem = context.tables.templates.items[itemTpl];
        if (stashItem?._props?.Grids?.[0]?._props) {
            stashItem._props.Grids[0]._props.cellsV = stashSize;
        }
        else {
            context.logger.warning(`HideoutOptions: doBiggerStash: Failed to modify stash with Tpl ${itemTpl}, skipping`);
        }
    }
    //Change construction price
    const hideoutStashStages = context.tables.hideout.areas.find((area) => area.type === HideoutAreas_1.HideoutAreas.STASH).stages;
    for (const stage of Object.values(hideoutStashStages)) {
        const currencyRequirements = stage.requirements.filter((req) => utils_1.currencies.includes(req.templateId));
        for (const currencyRequirement of currencyRequirements) {
            if (currencyRequirement.count) {
                currencyRequirement.count *= config.stashUpgradeCostFactor;
            }
        }
        const loyaltylevels = stage.requirements.filter((req) => req.loyaltyLevel !== undefined);
        for (const loyaltyLevel of loyaltylevels) {
            if (loyaltyLevel.loyaltyLevel !== undefined) {
                loyaltyLevel.loyaltyLevel += config.stashUpgradeLoyaltyDelta;
            }
        }
    }
}
//# sourceMappingURL=stashChanges.js.map
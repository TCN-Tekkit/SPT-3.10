"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySecureContainerChanges = applySecureContainerChanges;
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/naming-convention
const json5_1 = __importDefault(require("C:/snapshot/project/node_modules/json5"));
const utils_1 = require("../utils");
function applySecureContainerChanges(context) {
    //Read secure container config
    const fileContent = fs_1.default.readFileSync((0, utils_1.getModFolder)() + "/config/advanced/secureChanges.json5", "utf-8");
    const secureConfig = json5_1.default.parse(fileContent);
    const config = context.config.secureContainerProgression;
    //Change container grids
    for (const container of Object.keys(config.sizeChanges)) {
        const containerItem = context.tables.templates.items[container];
        const gridTemplate = containerItem._props.Grids[0];
        const gridSizes = config.sizeChanges[container];
        const newGrids = [];
        for (let i = 0; i < gridSizes.length; i++) {
            const size = gridSizes[i];
            newGrids.push({
                _name: (i + 1).toString(),
                _id: context.hashUtil.generate(),
                _parent: "664a55d84a90fc2c8a6305c9",
                _props: {
                    filters: gridTemplate._props.filters,
                    cellsH: size[0],
                    cellsV: size[1],
                    minCount: 0,
                    maxCount: 0,
                    maxWeight: 0,
                    isSortingTable: false
                },
                _proto: "55d329c24bdc2d892f8b4567"
            });
        }
        containerItem._props.Grids = newGrids;
    }
    //Add quest rewards
    for (const [condition, questsWithRewards] of Object.entries(secureConfig.AdditionalQuestRewards)) {
        for (const [quest, extraReward] of Object.entries(questsWithRewards)) {
            if (condition == "Success")
                context.tables.templates.quests[quest].rewards.Success.push(extraReward);
            if (condition == "Started")
                context.tables.templates.quests[quest].rewards.Started.push(extraReward);
        }
    }
    //Start with Waist Pouch
    const profileTemplates = context.tables.templates.profiles;
    for (const profile of Object.values(profileTemplates)) {
        const bearContainer = profile.bear.character.Inventory.items.find((x) => x.slotId === "SecuredContainer");
        if (bearContainer) {
            bearContainer._tpl = context.config.secureContainerProgression.starterContainer;
        }
        const usecContainer = profile.usec.character.Inventory.items.find((x) => x.slotId === "SecuredContainer");
        if (usecContainer) {
            usecContainer._tpl = context.config.secureContainerProgression.starterContainer;
        }
    }
}
//# sourceMappingURL=secureContainer.js.map
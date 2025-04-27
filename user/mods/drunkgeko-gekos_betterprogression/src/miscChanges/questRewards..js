"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdditionalQuestRewards = addAdditionalQuestRewards;
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/naming-convention
const json5_1 = __importDefault(require("C:/snapshot/project/node_modules/json5"));
const utils_1 = require("../utils");
function addAdditionalQuestRewards(context) {
    //Read rewards config
    const fileContent = fs_1.default.readFileSync((0, utils_1.getModFolder)() + "/config/advanced/additionalQuestRewards.json5", "utf-8");
    const secureConfig = json5_1.default.parse(fileContent);
    for (const [condition, questsWithRewards] of Object.entries(secureConfig)) {
        for (const [quest, extraReward] of Object.entries(questsWithRewards)) {
            if (condition == "Success")
                context.tables.templates.quests[quest].rewards.Success.push(extraReward);
            if (condition == "Started")
                context.tables.templates.quests[quest].rewards.Started.push(extraReward);
        }
    }
}
//# sourceMappingURL=questRewards..js.map
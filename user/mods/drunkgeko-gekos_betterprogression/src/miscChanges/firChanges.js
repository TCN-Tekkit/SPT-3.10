"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFirFromQuests = removeFirFromQuests;
exports.removeFirFromFlea = removeFirFromFlea;
exports.removeFirFromHideout = removeFirFromHideout;
exports.removeFirFromRepeatables = removeFirFromRepeatables;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
function removeFirFromQuests(context) {
    const quests = context.tables.templates.quests;
    const locales = context.tables.locales.global;
    const foundInRaidRegex = new RegExp("Find.*in raid", "i");
    const inRaidRegex = new RegExp("in raid", "i");
    for (const quest of Object.values(quests)) {
        const sets = [quest.conditions.AvailableForFinish, quest.conditions.AvailableForStart, quest.conditions.Fail, quest.conditions.Started, quest.conditions.Success];
        for (const set of sets) {
            if (set == null)
                continue;
            //Allow handing over of non-FiR items
            for (const cond of set) {
                if (cond.conditionType == "HandoverItem" || cond.conditionType === "FindItem") {
                    cond.onlyFoundInRaid = false;
                }
            }
        }
    }
    //Change the locales to remove "in raid"
    for (const [lang, locale] of Object.entries(locales))
        for (const [key, text] of Object.entries(locale)) {
            if (foundInRaidRegex.test(text)) {
                locales[lang][key] = text.replace(inRaidRegex, "");
            }
        }
}
function removeFirFromFlea(context) {
    context.tables.globals.config.RagFair.isOnlyFoundInRaidAllowed = false;
}
function removeFirFromHideout(context) {
    const hideoutAreas = context.tables.hideout.areas;
    for (const area of hideoutAreas)
        for (const stage of Object.values(area.stages)) {
            const itemReq = stage.requirements.filter((req) => req.type == "Item");
            for (const req of itemReq) {
                req.isSpawnedInSession = false;
            }
        }
}
function removeFirFromRepeatables(context) {
    for (const repType of context.sptConfig.getConfig(ConfigTypes_1.ConfigTypes.QUEST).repeatableQuests) {
        repType.questConfig.Completion.requiredItemsAreFiR = false;
    }
}
//# sourceMappingURL=firChanges.js.map
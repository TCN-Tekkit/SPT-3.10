"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeSkills = changeSkills;
function changeSkills(context) {
    context.tables.globals.config.SkillFreshEffectiveness = context.config.skillChanges.SkillFreshEffectiveness;
    context.tables.globals.config.SkillFreshPoints = context.config.skillChanges.SkillFreshPoints;
    context.tables.globals.config.SkillMinEffectiveness = context.config.skillChanges.SkillMinEffectiveness;
    context.tables.globals.config.SkillPointsBeforeFatigue = context.config.skillChanges.SkillPointsBeforeFatigue;
}
//# sourceMappingURL=skills.js.map
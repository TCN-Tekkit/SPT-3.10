"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buffSICCCase = buffSICCCase;
const ItemTpl_1 = require("C:/snapshot/project/obj/models/enums/ItemTpl");
function buffSICCCase(context) {
    //Thanks to ODT and his Softcore mod for this part of the code, most of this function is taken from there with appropriate modifications
    //Link to the mod: https://hub.sp-tarkov.com/files/file/998-softcore-proper-singleplayer-experience-for-spt/
    const config = context.config.SICCBuffs;
    const docsFilter = config.canHoldWhatDocsCan ? context.tables.templates.items?.[ItemTpl_1.ItemTpl.CONTAINER_DOCUMENTS_CASE]._props.Grids?.[0]._props.filters[0].Filter : [];
    const siccFilter = context.tables.templates.items?.[ItemTpl_1.ItemTpl.CONTAINER_SICC]._props.Grids?.[0]._props.filters[0].Filter;
    const additionalItems = config.additionalWhitelistedItems;
    if (!docsFilter || !siccFilter) {
        context.logger.warning("HideoutContainers: doSiccCaseBuff: docsFilter or siccFilter not found");
        return;
    }
    const mergeFilters = [...new Set([...docsFilter, ...siccFilter, ...additionalItems])];
    context.tables.templates.items[ItemTpl_1.ItemTpl.CONTAINER_SICC]._props.Grids[0]._props.filters[0].Filter = mergeFilters;
}
//# sourceMappingURL=buffSICCCase.js.map
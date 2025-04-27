"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeContainer = changeContainer;
function changeContainer(context) {
    const changes = context.config.misc.ContanerSizeChanges;
    for (const [key, size] of Object.entries(changes)) {
        if (context.tables.templates.items[key] == null)
            continue;
        context.tables.templates.items[key]._props.Grids[0]._props.cellsH = size[0];
        context.tables.templates.items[key]._props.Grids[0]._props.cellsV = size[1];
    }
}
//# sourceMappingURL=changeContainerSizes.js.map
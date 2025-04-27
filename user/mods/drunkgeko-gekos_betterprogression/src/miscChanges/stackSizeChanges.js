"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStackSizes = changeStackSizes;
function changeStackSizes(context) {
    //Change stack sizes
    for (const [item, stackSize] of Object.entries(context.config.misc.stackSizeOverride)) {
        context.tables.templates.items[item]._props.StackMaxSize = stackSize;
    }
}
//# sourceMappingURL=stackSizeChanges.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGPtoPMC = addGPtoPMC;
function addGPtoPMC(context) {
    //Thanks to AcidPhantasm and his Bosses Have Lega Medals mod for giving me an example on how to implement this feature
    //The mod can be found here: https://hub.sp-tarkov.com/files/file/2109-bosses-have-lega-medals/
    const config = context.config.misc.pmcsHaveGPCoins;
    const factor = config.GPCoinWeightProportional;
    for (const botType in context.tables.bots.types) {
        if (!botType.includes("usec") && !botType.includes("bear") && !botType.includes("pmc"))
            continue;
        if (botType == "exusec" || botType == "infectedpmc")
            continue;
        const pockets = context.tables.bots.types[botType].inventory.items.Pockets;
        let totalWeight = Object.values(pockets).reduce((a, b) => a + b, 0);
        pockets["5d235b4d86f7742e017bc88a"] = Math.max(1, totalWeight * factor);
        const backpack = context.tables.bots.types[botType].inventory.items.Backpack;
        totalWeight = Object.values(backpack).reduce((a, b) => a + b, 0);
        backpack["5d235b4d86f7742e017bc88a"] = Math.max(1, totalWeight * factor);
        context.logger.info(`weight for ${botType} is ${pockets["5d235b4d86f7742e017bc88a"]}`);
    }
}
//# sourceMappingURL=addGPtoPMC.js.map
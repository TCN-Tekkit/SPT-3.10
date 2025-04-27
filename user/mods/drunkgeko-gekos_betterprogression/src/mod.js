"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/naming-convention
const json5_1 = __importDefault(require("C:/snapshot/project/node_modules/json5"));
const contex_1 = require("./contex");
const core_1 = require("./algoRebalancing/core");
const secureContainer_1 = require("./miscChanges/secureContainer");
const utils_1 = require("./utils");
const stashChanges_1 = require("./miscChanges/stashChanges");
const fleaChanges_1 = require("./miscChanges/fleaChanges");
const buildChanges_1 = require("./miscChanges/buildChanges");
const skills_1 = require("./miscChanges/skills");
const craftChanges_1 = require("./miscChanges/craftChanges");
const refRepRework_1 = require("./miscChanges/refRepRework");
const buffSICCCase_1 = require("./miscChanges/buffSICCCase");
const firChanges_1 = require("./miscChanges/firChanges");
const customTrades_1 = require("./miscChanges/customTrades");
const bitcoinChanges_1 = require("./miscChanges/bitcoinChanges");
const priceChanging_1 = require("./miscChanges/priceChanging");
const loggerWrapper_1 = require("./loggerWrapper");
const stackSizeChanges_1 = require("./miscChanges/stackSizeChanges");
const startingRep_1 = require("./miscChanges/startingRep");
const path_1 = require("path");
const questRewards_1 = require("./miscChanges/questRewards.");
class Mod {
    context;
    preSptLoad(container) {
        this.context = new contex_1.Context();
        const preLoader = container.resolve("PreSptModLoader");
        this.context.logger = new loggerWrapper_1.LoggerWrapper(container.resolve("WinstonLogger"), preLoader);
        this.safelyReadConfig();
        this.setupRouterForClientSideData(container);
        this.safeApplyEarlyModifications(container);
    }
    postDBLoad(container) {
        this.context.database = container.resolve("DatabaseServer");
        this.context.sptConfig = container.resolve("ConfigServer");
        this.context.tables = this.context.database.getTables();
        this.context.itemHelper = container.resolve("ItemHelper");
        container.resolve("PresetController").initialize();
        this.context.presetHelper = container.resolve("PresetHelper");
        this.context.hashUtil = container.resolve("HashUtil");
        this.safelyApplyChanges();
        this.context.logger.success("Finished applying all changes!");
    }
    ///////////////////////////////////////////////////////////////////////////
    setupRouterForClientSideData(container) {
        const staticRouter = container.resolve("StaticRouterModService");
        try {
            staticRouter.registerStaticRouter("skillpointsconfigrouter", [
                {
                    url: "/server-config-router/skillpoints",
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    action: (_url, _info, _sessionID, _output) => {
                        return Promise.resolve(JSON.stringify({ response: this.context.config.skillChanges.SkillPointsSystem }));
                    }
                }
            ], "skillpointsconfig");
        }
        catch (error) {
            this.context.logger.error("Failed to send skill points config data over to the client!");
            if (this.context.config.dev.showFullError) {
                this.context.logger.error("Error Details:" + error);
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
        }
        try {
            staticRouter.registerStaticRouter("skillsconfigrouter", [
                {
                    url: "/server-config-router/skillsconfig",
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    action: (_url, _info, _sessionID, _output) => {
                        return Promise.resolve(JSON.stringify({ response: this.context.config.skillChanges.CustomMultipliers }));
                    }
                }
            ], "skillsconfig");
        }
        catch (error) {
            this.context.logger.error("Failed to send skills config data over to the client!");
            if (this.context.config.dev.showFullError) {
                this.context.logger.error("Error Details:" + error);
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
        }
    }
    safeApplyEarlyModifications(container) {
        try {
            if (this.context.config.refChanges.enable && this.context.config.refChanges.refStandingOnKill.enable)
                (0, refRepRework_1.gainRefRepOnKill)(this.context, container);
        }
        catch (error) {
            this.context.logger.error("Failed to inject ref rep on PMC kill function!");
            if (this.context.config.dev.showFullError) {
                this.context.logger.error("Error Details:" + error);
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
        }
        //For ref buying items for GP coins. Requires client patching for fixing wrong GP icon
        try {
            (0, refRepRework_1.addSupportForGPTraders)(this.context, container);
        }
        catch (error) {
            this.context.logger.error("Failed to patch in support for GP trading!");
            if (this.context.config.dev.showFullError) {
                this.context.logger.error("Error Details:" + error);
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
        }
    }
    safelyReadConfig() {
        try {
            const fileContent = fs_1.default.readFileSync((0, path_1.join)((0, utils_1.getModFolder)(), "/config/config.json5"), "utf-8");
            this.context.config = json5_1.default.parse(fileContent);
        }
        catch (error) {
            this.context.logger.error("Main config file failed to load!");
            this.context.logger.error("Error Details:" + error);
            this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
        }
    }
    safelyApplyChanges() {
        const cfg = this.context.config;
        const log = cfg.dev.muteProgressOnServerLoad ? null : this.context.logger;
        log?.info("Running algorithmical rebalancing...");
        this.safelyRunIf(cfg.algorithmicalRebalancing.enable, () => (0, core_1.algorithmicallyRebalance)(this.context), "Failed to run algorithmical rebalancing!");
        log?.info("Done!");
        log?.info("Changing stack sizes...");
        this.safelyRunIf(true, () => (0, stackSizeChanges_1.changeStackSizes)(this.context), "Failed to apply changes to stack sizes!");
        log?.info("Done!");
        log?.info("Applying secure container changes...");
        this.safelyRunIf(cfg.secureContainerProgression.enable, () => (0, secureContainer_1.applySecureContainerChanges)(this.context), "Failed to apply secure container changes!");
        log?.info("Done!");
        log?.info("Applying stash progression changes...");
        this.safelyRunIf(cfg.stashProgression.enable, () => (0, stashChanges_1.changeStashProgression)(this.context), "Failed to apply stash progression changes!");
        log?.info("Done!");
        log?.info("Disabling flea market...");
        this.safelyRunIf(cfg.fleaMarketChanges.disableFleaMarket, () => (0, fleaChanges_1.disableFleaMarket)(this.context), "Failed to disable flea market!");
        log?.info("Done!");
        log?.info("Applying changes to hideout build costs...");
        this.safelyRunIf(cfg.hideoutBuildsChanges.enable, () => (0, buildChanges_1.changeHidehoutBuildCosts)(this.context), "Failed to apply changes to hideout build costs!");
        log?.info("Done!");
        log?.info("Applying changes to skills...");
        this.safelyRunIf(cfg.skillChanges.enable, () => (0, skills_1.changeSkills)(this.context), "Failed to apply changes to skills!");
        log?.info("Done!");
        log?.info("Applying changes to craft times and output counts...");
        this.safelyRunIf(true, () => (0, craftChanges_1.changeCrafts)(this.context), "Failed to apply changes to craft times and output counts!");
        log?.info("Done!");
        log?.info("Applying changes to item prices...");
        this.safelyRunIf(true, () => (0, priceChanging_1.changePrices)(this.context), "Failed to apply changes to item prices!");
        log?.info("Done!");
        log?.info("Applying changes to SICC container...");
        this.safelyRunIf(cfg.SICCBuffs.enable, () => (0, buffSICCCase_1.buffSICCCase)(this.context), "Failed to apply changes to SICC container!");
        log?.info("Done!");
        log?.info("Removing FiR requirements...");
        this.safelyRunIf(cfg.misc.removeFirFromQuests, () => (0, firChanges_1.removeFirFromQuests)(this.context), "Failed to remove FiR requirements form quests!");
        this.safelyRunIf(cfg.misc.removeFirFromQuests, () => (0, firChanges_1.removeFirFromRepeatables)(this.context), "Failed to remove FiR requirements from repeatable quests!");
        this.safelyRunIf(cfg.misc.removeFirFromHideout, () => (0, firChanges_1.removeFirFromHideout)(this.context), "Failed to remove FiR requirements from hideout builds!");
        this.safelyRunIf(cfg.misc.removeFirFromFlea, () => (0, firChanges_1.removeFirFromFlea)(this.context), "Failed to remove FiR requirements from flea market listings!");
        log?.info("Done!");
        log?.info("Adding custom trades...");
        this.safelyRunIf(cfg.misc.addCustomTrades, () => (0, customTrades_1.addCustomTrades)(this.context), "Failed to add custom trades!");
        log?.info("Done!");
        log?.info("Applying changes to bitcoin farming...");
        this.safelyRunIf(cfg.bitcoinChanges.enable, () => (0, bitcoinChanges_1.changeBitcoinFarming)(this.context), "Failed to apply changes to bitcoin farming!");
        log?.info("Done!");
        log?.info("Setting initial trader standing...");
        this.safelyRunIf(cfg.bitcoinChanges.enable, () => (0, startingRep_1.setStartingReputation)(this.context), "Failed to set initial trader standing!");
        log?.info("Done!");
        log?.info("Applying changes to Ref item purchasing...");
        this.safelyRunIf(cfg.refChanges.enable, () => (0, refRepRework_1.changeRefPurchasingOptions)(this.context), "Failed to apply changes to Ref item purchasing!");
        log?.info("Done!");
        log?.info("Adding additional quest rewards...");
        this.safelyRunIf(cfg.misc.enableExtraQuestRewards, () => (0, questRewards_1.addAdditionalQuestRewards)(this.context), "Failed to add additional quest rewards!");
        log?.info("Done!");
    }
    safelyRunIf(condition, func, message) {
        try {
            if (condition) {
                func();
            }
        }
        catch (error) {
            this.context.logger.error(message);
            if (this.context.config.dev.showFullError) {
                this.context.logger.error("Error Details:" + error);
                this.context.logger.error("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
            }
        }
    }
}
exports.mod = new Mod();
//# sourceMappingURL=mod.js.map
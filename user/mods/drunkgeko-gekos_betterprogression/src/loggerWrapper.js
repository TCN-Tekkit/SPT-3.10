"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerWrapper = void 0;
class LoggerWrapper {
    prefix;
    logger;
    modName;
    modVersion;
    constructor(_logger, preLoader) {
        this.logger = _logger;
        try {
            let modDetails = preLoader.getImportedModDetails()["Gekos_BetterProgression"];
            if (modDetails == null) {
                modDetails = preLoader.getImportedModDetails()["drunkgeko-gekos_betterprogression"];
            }
            this.modName = modDetails.name;
            this.modVersion = modDetails.version;
            this.prefix = `[${this.modName}-${this.modVersion}] `;
        }
        catch (error) {
            this.modName = "gekos_betterprogression";
            this.modVersion = "??";
            this.prefix = `[${this.modName}-${this.modVersion}] `;
            this.warning("Could not retrieve mod info!");
            this.warning("Stack Trace:\n" + (error instanceof Error ? error.stack : "No stack available"));
        }
    }
    info(message) {
        this.logger.info(this.prefix + message);
    }
    writeToLogFile(data) {
        if (typeof data === "string") {
            data += this.prefix;
        }
        this.logger.writeToLogFile(data);
    }
    log(data, color, backgroundColor) {
        if (typeof data === "string") {
            data += this.prefix;
        }
        this.logger.log(data, backgroundColor);
    }
    logWithColor(data, textColor, backgroundColor) {
        if (typeof data === "string") {
            data += this.prefix;
        }
        this.logger.logWithColor(data, textColor, backgroundColor);
    }
    error(data) {
        this.logger.error(`${this.prefix}${data}`);
    }
    warning(data) {
        this.logger.warning(this.prefix + data);
    }
    success(data) {
        this.logger.success(this.prefix + data);
    }
    debug(data, onlyShowInConsole) {
        if (typeof data === "string") {
            data += this.prefix;
        }
        this.logger.debug(data, onlyShowInConsole);
    }
}
exports.LoggerWrapper = LoggerWrapper;
//# sourceMappingURL=loggerWrapper.js.map
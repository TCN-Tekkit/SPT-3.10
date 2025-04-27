"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
class Context {
    database;
    tables;
    logger;
    itemHelper;
    presetHelper;
    sptConfig;
    hashUtil;
    config;
    constructor(_config, /*Not sure how to type this, dynamically type checked languages are weird*/ _database, _tables, _logger, _itemHelper, _preetHelper, _sptConfig, _hashUtil) {
        this.database = _database;
        this.tables = _tables;
        this.logger = _logger;
        this.config = _config;
        this.itemHelper = _itemHelper;
        this.presetHelper = _preetHelper;
        this.sptConfig = _sptConfig;
        this.hashUtil = _hashUtil;
    }
    logObject(object) {
        this.logger?.info(JSON.stringify(object, null, 2));
    }
}
exports.Context = Context;
//# sourceMappingURL=contex.js.map
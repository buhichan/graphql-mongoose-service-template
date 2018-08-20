"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../db");
exports.getModel = function (metaName) {
    return db_1.connection.then(function (connection) {
        var Model = connection.models[metaName];
        if (!Model)
            throw new Error("model name invalid, valid model names are " + connection.modelNames().join(","));
        return Model;
    });
};
//# sourceMappingURL=utils.js.map
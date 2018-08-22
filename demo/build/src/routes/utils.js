"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeModelGetter = function (connection) { return function (metaName) {
    var Model = connection.models[metaName];
    if (!Model)
        throw new Error("model name invalid, valid model names are " + connection.modelNames().join(","));
    return Model;
}; };
//# sourceMappingURL=utils.js.map
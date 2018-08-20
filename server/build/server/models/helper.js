"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var db_1 = require("../db");
function model(name, def, options) {
    return db_1.connection.then(function (connection) { return connection.model(name, new mongoose_1.Schema(def, options), name); });
}
exports.model = model;
//# sourceMappingURL=helper.js.map
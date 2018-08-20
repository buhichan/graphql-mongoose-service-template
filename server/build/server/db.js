"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var mongoClient = new mongoose_1.Mongoose();
exports.connection = mongoClient.connect(ENV.MONGODB, {
    useNewUrlParser: true
});
//# sourceMappingURL=db.js.map
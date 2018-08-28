"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./views/restful"));
__export(require("./utils"));
__export(require("./models/meta"));
__export(require("./models/model"));
var graphql_1 = require("./views/graphql/graphql");
exports.makeGraphQLPlugin = graphql_1.makeGraphQLPlugin;
var make_schema_1 = require("./views/graphql/make-schema");
exports.makeGraphQLSchema = make_schema_1.makeGraphQLSchema;
//# sourceMappingURL=index.js.map
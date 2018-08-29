"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
function safeJSONParse(text) {
    try {
        return JSON.parse(text);
    }
    catch (e) {
        return null;
    }
}
function parseAnyTypeLiteral(ast) {
    switch (ast.kind) {
        case graphql_1.Kind.OBJECT: {
            return ast.fields.reduce(function (values, field) {
                values[field.name.value] = parseAnyTypeLiteral(field.value);
                return values;
            }, {});
        }
        case graphql_1.Kind.LIST:
            return ast.values.map(function (x) {
                return parseAnyTypeLiteral(x);
            });
        case graphql_1.Kind.ENUM:
        case graphql_1.Kind.FLOAT:
        case graphql_1.Kind.STRING:
        case graphql_1.Kind.INT:
        case graphql_1.Kind.BOOLEAN:
            return ast.value;
        case graphql_1.Kind.NULL:
        default:
            return null;
    }
}
exports.GraphQLAny = new graphql_1.GraphQLScalarType({
    name: 'Any',
    description: 'Arbitrary type',
    parseValue: function (value) {
        return value;
    },
    serialize: function (value) {
        return value;
    },
    parseLiteral: parseAnyTypeLiteral
});
//# sourceMappingURL=any.js.map
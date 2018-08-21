"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var utils_1 = require("./utils");
function capitalize(str) {
    if (!str)
        return str;
    return str[0].toUpperCase() + str.slice(1);
}
function mapToGraphQLType(metaName, fields, context) {
    var buildField = function (field) {
        var fieldName = metaName + capitalize(field.name);
        var currentContext = {
            getRef: context.getRef,
            getValue: function (x) { return context.getValue(x)[field.name]; }
        };
        switch (true) {
            case (field.enum instanceof Array && field.enum.length > 0): {
                return {
                    type: new graphql_1.GraphQLEnumType({
                        name: fieldName,
                        values: field.enum.reduce(function (enums, v) {
                            var _a;
                            return (__assign({}, enums, (_a = {}, _a[v] = { value: v }, _a)));
                        }, {})
                    })
                };
            }
            case field.type === "date": return { type: graphql_1.GraphQLInt };
            case field.type === "number": return { type: graphql_1.GraphQLInt };
            case field.type === "boolean": return { type: graphql_1.GraphQLBoolean };
            case field.type === "ref": return context.getRef(field.ref, currentContext.getValue);
            case field.type === "array": {
                return {
                    type: new graphql_1.GraphQLList(buildField(field.item).type)
                };
            }
            case field.type === "object": {
                return {
                    type: new graphql_1.GraphQLObjectType({
                        name: fieldName,
                        fields: mapToGraphQLType(fieldName, field.fields, currentContext)
                    })
                };
            }
            default: return {
                type: graphql_1.GraphQLString
            };
        }
    };
    return fields.reduce(function (fields, def) {
        var field = buildField(def);
        if (field && field.type)
            fields[def.name] = field;
        return fields;
    }, {});
}
function convertToInputType(type) {
    if (graphql_1.isInputType(type))
        return type;
    else if (type instanceof graphql_1.GraphQLList)
        return new graphql_1.GraphQLList(convertToInputType(type.ofType));
    else if (type instanceof graphql_1.GraphQLObjectType) {
        var fields_1 = type.getFields();
        return new graphql_1.GraphQLInputObjectType({
            name: "_" + type.name,
            fields: Object.keys(fields_1).reduce(function (inputFields, fieldName) {
                var converted = convertToInputType(fields_1[fieldName].type);
                if (converted)
                    inputFields[fieldName] = {
                        type: converted,
                    };
                return inputFields;
            }, {})
        });
    }
    else
        return null;
}
function buildGraphQLSchema(rootTypes) {
    var _this = this;
    return new graphql_1.GraphQLSchema({
        query: new graphql_1.GraphQLObjectType({
            name: "Root",
            fields: rootTypes.reduce(function (query, type) {
                query[type.name] = {
                    type: new graphql_1.GraphQLList(type),
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, utils_1.getModel(type.name)];
                                case 1:
                                    model = _a.sent();
                                    if (!model)
                                        return [2 /*return*/, []];
                                    else
                                        return [2 /*return*/, model.find(args)];
                                    return [2 /*return*/];
                            }
                        });
                    }); }
                };
                return query;
            }, {}),
        }),
        types: rootTypes,
        mutation: new graphql_1.GraphQLObjectType({
            name: "Mutation",
            fields: rootTypes.reduce(function (mutations, type) {
                var convertedInputType = convertToInputType(type);
                mutations['add' + capitalize(type.name)] = {
                    type: type,
                    args: {
                        payload: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, utils_1.getModel(type.name)];
                                case 1:
                                    model = _a.sent();
                                    return [2 /*return*/, model.create(args.payload)];
                            }
                        });
                    }); }
                };
                mutations['update' + capitalize(type.name)] = {
                    type: type,
                    args: {
                        condition: {
                            type: convertedInputType
                        },
                        payload: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, utils_1.getModel(type.name)];
                                case 1:
                                    model = _a.sent();
                                    return [2 /*return*/, model.update(args.condition, args.payload).exec()];
                            }
                        });
                    }); }
                };
                mutations['delete' + capitalize(type.name)] = {
                    type: graphql_1.GraphQLInt,
                    args: {
                        condition: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, utils_1.getModel(type.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.remove(args.condition).exec()];
                                case 2:
                                    res = _a.sent();
                                    return [2 /*return*/, res ? res.n : 0];
                            }
                        });
                    }); }
                };
                return mutations;
            }, {})
        })
    });
}
function makeGraphQLPlugin(options) {
    var _this = this;
    var metas = options.metas;
    var rootTypes = metas.map(function (modelMeta) {
        return new graphql_1.GraphQLObjectType({
            name: modelMeta.name,
            fields: function () {
                return __assign({ _id: { type: graphql_1.GraphQLString } }, mapToGraphQLType(modelMeta.name, modelMeta.fields, {
                    getValue: function (x) { return x; },
                    getRef: function (refName, getValue) {
                        var type = rootTypes.find(function (x) { return x.name === refName; });
                        if (!type)
                            return null;
                        else
                            return {
                                type: type,
                                resolve: function (source) { return __awaiter(_this, void 0, void 0, function () {
                                    var id, model;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                id = getValue(source);
                                                if (!id)
                                                    return [2 /*return*/, null];
                                                return [4 /*yield*/, utils_1.getModel(refName)];
                                            case 1:
                                                model = _a.sent();
                                                return [2 /*return*/, model.findById(id)];
                                        }
                                    });
                                }); }
                            };
                    }
                }));
            }
        });
    });
    var schema = buildGraphQLSchema(rootTypes);
    return {
        name: "graphql",
        register: function (server) { return server.route([
            {
                path: "/graphql",
                method: "post",
                handler: function (req) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, graphql_1.graphql(schema, req.payload.query)];
                    });
                }); }
            }
        ]); }
    };
}
exports.makeGraphQLPlugin = makeGraphQLPlugin;
//# sourceMappingURL=graphql.js.map
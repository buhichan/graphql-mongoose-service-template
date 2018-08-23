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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var utils_1 = require("./utils");
function capitalize(str) {
    if (!str)
        return str;
    return str[0].toUpperCase() + str.slice(1);
}
function mapMetaToField(fieldMeta, context) {
    var field = {
        type: mapMetaToType(fieldMeta, context)
    };
    if (fieldMeta.type === 'ref')
        field.resolve = context.getResolver(fieldMeta.ref, context.getValue);
    if (fieldMeta.type === 'array' && fieldMeta.item.type === 'ref')
        field.resolve = context.getResolver(fieldMeta.item.ref, context.getValue);
    return field;
}
function mapMetaToType(field, context) {
    var currentContext = __assign({}, context, { getValue: function (x) { return context.getValue(x)[field.name]; } });
    switch (true) {
        case (field.enum instanceof Array && field.enum.length > 0): {
            return new graphql_1.GraphQLEnumType({
                name: field.name,
                values: field.enum.reduce(function (enums, v) {
                    var _a;
                    return (__assign({}, enums, (_a = {}, _a[v] = { value: v }, _a)));
                }, {})
            });
        }
        case field.type === "date": return graphql_1.GraphQLInt;
        case field.type === "number": return graphql_1.GraphQLInt;
        case field.type === "boolean": return graphql_1.GraphQLBoolean;
        case field.type === "array": return new graphql_1.GraphQLList(mapMetaToType(field.item, currentContext));
        case field.type === "object": {
            if (!context.outputObjectTypePool[field.name])
                context.outputObjectTypePool[field.name] = new graphql_1.GraphQLObjectType({
                    name: field.name,
                    fields: (field.fields || []).reduce(function (fields, def) {
                        var field = mapMetaToField(def, currentContext);
                        if (field)
                            fields[def.name] = field;
                        return fields;
                    }, {})
                });
            return context.outputObjectTypePool[field.name];
        }
        default:
            return graphql_1.GraphQLString; //includes string and ref
    }
}
function mapOutputTypeToInputType(type, context) {
    if (graphql_1.isInputType(type))
        return type;
    else if (type instanceof graphql_1.GraphQLList)
        return new graphql_1.GraphQLList(mapOutputTypeToInputType(type.ofType, context));
    else if (type instanceof graphql_1.GraphQLObjectType) {
        var fields_1 = type.getFields();
        if (!context.inputObjectTypePool[type.name])
            context.inputObjectTypePool[type.name] = new graphql_1.GraphQLInputObjectType({
                name: "_" + type.name,
                fields: Object.keys(fields_1).reduce(function (inputFields, fieldName) {
                    var converted = mapOutputTypeToInputType(fields_1[fieldName].type, context);
                    if (converted)
                        inputFields[fieldName] = {
                            type: converted,
                        };
                    return inputFields;
                }, {})
            });
        return context.inputObjectTypePool[type.name];
    }
    else
        return null;
}
function buildGraphQLSchema(rootTypes, mutationMetas, context) {
    var _this = this;
    var getModel = context.getModel;
    var customMutations = Object.keys(mutationMetas).reduce(function (mutations, mutationName) {
        var mutationMeta = mutationMetas[mutationName];
        mutations[mutationName] = {
            type: !mutationMeta.returns ? graphql_1.GraphQLBoolean : mapMetaToType(mutationMeta.returns, context),
            args: Object.keys(mutationMeta.args).reduce(function (args, argName) {
                var argMeta = mutationMeta.args[argName];
                args[argName] = {
                    type: mapOutputTypeToInputType(mapMetaToType(argMeta.meta, context), context),
                    defaultValue: mutationMeta.args[argName].defaultValue
                };
                return args;
            }, {}),
            resolve: function (_, args) {
                return mutationMeta.resolve(args);
            }
        };
        return mutations;
    }, {});
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
                                case 0: return [4 /*yield*/, getModel(type.name)];
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
                var convertedInputType = mapOutputTypeToInputType(type, context);
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
                                case 0: return [4 /*yield*/, getModel(type.name)];
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
                                case 0: return [4 /*yield*/, getModel(type.name)];
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
                                case 0: return [4 /*yield*/, getModel(type.name)];
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
            }, customMutations)
        })
    });
}
function makeGraphQLPlugin(options) {
    var _this = this;
    var metas = options.metas, mutations = options.mutations, connection = options.connection;
    var getModel = utils_1.makeModelGetter(connection);
    function getResolver(refName, getValue) {
        var _this = this;
        return function (source) { return __awaiter(_this, void 0, void 0, function () {
            var type, id, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = rootTypes.find(function (x) { return x.name === refName; });
                        if (!type)
                            return [2 /*return*/, null];
                        id = getValue(source);
                        if (!id)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, getModel(refName)];
                    case 1:
                        model = _a.sent();
                        if (id instanceof Array)
                            return [2 /*return*/, model.find({
                                    id: {
                                        $in: id
                                    }
                                })];
                        else
                            return [2 /*return*/, model.findById(id)];
                        return [2 /*return*/];
                }
            });
        }); };
    }
    var context = {
        getValue: function (x) { return x; },
        getModel: getModel,
        getResolver: getResolver,
        inputObjectTypePool: {},
        outputObjectTypePool: {}
    };
    var rootTypes = metas.filter(function (x) { return x.type === "object"; }).map(function (modelMeta) {
        if (!modelMeta.fields.some(function (x) { return x.name === "_id"; }))
            modelMeta = __assign({}, modelMeta, { fields: __spread([
                    {
                        name: "_id",
                        type: "string",
                        label: "id"
                    }
                ], modelMeta.fields) });
        return mapMetaToType(modelMeta, context);
    });
    var schema = buildGraphQLSchema(rootTypes, mutations, context);
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
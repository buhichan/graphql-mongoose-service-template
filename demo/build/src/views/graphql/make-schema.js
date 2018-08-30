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
var utils_1 = require("../../utils");
var graphql_1 = require("graphql");
var meta_1 = require("../../models/meta");
var any_1 = require("./type/any");
var validate_1 = require("../../models/validate");
function capitalize(str) {
    if (!str)
        return str;
    return str[0].toUpperCase() + str.slice(1);
}
function mapMetaToField(fieldMeta, context, path) {
    var field = {
        type: mapMetaToOutputType(fieldMeta, context, path)
    };
    if (!fieldMeta.type)
        return null;
    if (fieldMeta.type === 'ref' && fieldMeta.ref) {
        field.resolve = context.getResolver(fieldMeta.ref, path);
    }
    if (fieldMeta.type === 'array' && fieldMeta.item && fieldMeta.item.type === 'ref' && fieldMeta.item.ref) {
        field.resolve = context.getResolver(fieldMeta.item.ref, path);
    }
    return field;
}
function mapMetaToOutputType(field, context, path) {
    switch (true) {
        case !field:
            return null;
        case ('enum' in field && field.enum instanceof Array && field.enum.length > 0): {
            var enumList = field['enum'];
            if (!context.enumTypePoll[field.name]) {
                context.enumTypePoll[field.name] = new graphql_1.GraphQLEnumType({
                    name: path.join("_") + field.name,
                    values: enumList.reduce(function (enums, v) {
                        var _a;
                        return (__assign({}, enums, (_a = {}, _a[v] = { value: v }, _a)));
                    }, {})
                });
            }
            return context.enumTypePoll[field.name];
        }
        case field.type === "any": return any_1.GraphQLAny;
        case field.type === "date": return graphql_1.GraphQLString;
        case field.type === "number": return graphql_1.GraphQLInt;
        case field.type === "ref" && field.ref in context.outputObjectTypePool: {
            return context.outputObjectTypePool[field.ref];
        }
        case field.type === "boolean": return graphql_1.GraphQLBoolean;
        case field.type === "array": {
            var item = mapMetaToOutputType(field.item, context, path.concat(field.name));
            if (!item)
                return null;
            return new graphql_1.GraphQLList(item);
        }
        case field.type === "object" && field.fields instanceof Array && field.fields.length > 0: {
            if (!context.outputObjectTypePool[field.name])
                context.outputObjectTypePool[field.name] = new graphql_1.GraphQLObjectType({
                    name: path.join("_") + field.name,
                    fields: function () { return field.fields.reduce(function (fields, childMeta) {
                        var child = mapMetaToField(childMeta, context, path.concat(childMeta.name));
                        if (child)
                            fields[childMeta.name] = child;
                        return fields;
                    }, {}); }
                });
            return context.outputObjectTypePool[field.name];
        }
        default:
            return graphql_1.GraphQLString; //includes string and ref
    }
}
function mapMetaToInputType(meta, context) {
    if (!meta)
        return null;
    if (meta.type === 'ref')
        return graphql_1.GraphQLString;
    else if (meta.type === 'object') {
        if (!context.inputObjectTypePool[meta.name])
            context.inputObjectTypePool[meta.name] = new graphql_1.GraphQLInputObjectType({
                name: "_" + meta.name,
                fields: function () { return meta.fields.reduce(function (inputFields, fieldMeta) {
                    var converted = mapMetaToInputType(fieldMeta, context);
                    if (converted)
                        inputFields[fieldMeta.name] = {
                            type: converted,
                        };
                    return inputFields;
                }, {}); }
            });
        return context.inputObjectTypePool[meta.name];
    }
    else if (meta.type === 'array') {
        var item = mapMetaToInputType(meta.item, context);
        if (!item)
            return null;
        return new graphql_1.GraphQLList(item);
    }
    var type = mapMetaToOutputType(meta, context, []);
    if (graphql_1.isInputType(type))
        return type;
    else
        return null;
}
var sortEnumType = new graphql_1.GraphQLEnumType({
    name: "SortDirection",
    values: {
        asc: { value: 1, description: "升序" },
        desc: { value: -1, description: "降序" }
    }
});
function makeQueryArgs(meta, context) {
    var indexableFields = meta.fields.filter(function (x) {
        return ['number', 'string', 'date'].includes(x.type) && x.name !== "_id";
    });
    var queryArgs = {
        search: {
            type: any_1.GraphQLAny,
            defaultValue: {}
        },
        limit: {
            type: graphql_1.GraphQLInt
        },
        skip: {
            type: graphql_1.GraphQLInt,
            defaultValue: 0
        }
    };
    if (indexableFields.length) {
        queryArgs.sort = {
            type: new graphql_1.GraphQLInputObjectType({
                name: "_" + meta.name + "_sort",
                fields: indexableFields.reduce(function (fields, fieldMeta) {
                    fields[fieldMeta.name] = {
                        type: sortEnumType
                    };
                    return fields;
                }, {})
            })
        };
    }
    return queryArgs;
}
function convertSearchToFindOptions(search) {
    if (search != undefined && !(search instanceof Array) && typeof search === 'object')
        return Object.keys(search).reduce(function (findOptions, name) {
            var newName = name;
            if (name.startsWith("_") && name !== "_id")
                newName = "$" + name.slice(1);
            findOptions[newName] = convertSearchToFindOptions(search[name]);
            return findOptions;
        }, {});
    return search;
}
function makeGraphQLSchema(options) {
    var _this = this;
    var connection = options.connection, metas = options.metas, mutationMetas = options.mutations, _a = options.onMutation, onMutation = _a === void 0 ? {} : _a;
    options.metas.forEach(function (meta) {
        if (!validate_1.validateData(meta, meta_1.metaOfMeta))
            throw new Error("Invalid meta: " + meta.name);
    });
    var getModel = utils_1.makeModelGetter(connection);
    var getResolver = function (refName, path) {
        return function (source) { return __awaiter(_this, void 0, void 0, function () {
            var id, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = utils_1.deepGet(source, path);
                        if (!id)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, getModel(refName)];
                    case 1:
                        model = _a.sent();
                        if (!model)
                            return [2 /*return*/, null];
                        if (id instanceof Array)
                            return [2 /*return*/, model.find({
                                    _id: {
                                        $in: id
                                    }
                                })];
                        else
                            return [2 /*return*/, model.findById(id)];
                        return [2 /*return*/];
                }
            });
        }); };
    };
    var context = {
        getModel: getModel,
        getResolver: getResolver,
        enumTypePoll: {},
        inputObjectTypePool: {},
        outputObjectTypePool: {}
    };
    var internalFields = [
        {
            name: "_id",
            label: "ID",
            type: "string"
        },
        {
            name: "createdAt",
            label: "创建时间",
            type: "date"
        }, {
            name: "updatedAt",
            label: "更新时间",
            type: "date"
        }
    ];
    metas = metas.filter(function (x) { return x && x.type === "object" && !internalFields.some(function (f) { return f.name === x.name; }); }).map(function (modelMeta) {
        return __assign({}, modelMeta, { fields: __spread(internalFields, modelMeta.fields) });
    });
    var rootTypes = metas.map(function (modelMeta) {
        return mapMetaToOutputType(modelMeta, context, []);
    });
    var customMutations = Object.keys(mutationMetas).reduce(function (customMutations, mutationName) {
        var mutationMeta = mutationMetas[mutationName];
        customMutations[mutationName] = {
            type: !mutationMeta.returns ? graphql_1.GraphQLBoolean : mapMetaToOutputType(mutationMeta.returns, context, []),
            args: Object.keys(mutationMeta.args).reduce(function (args, argName) {
                var argMeta = mutationMeta.args[argName];
                if (argMeta.meta)
                    args[argName] = {
                        type: mapMetaToInputType(argMeta.meta, context),
                        defaultValue: mutationMeta.args[argName].defaultValue
                    };
                return args;
            }, {}),
            resolve: function (_, args) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Object.keys(mutationMeta.args).forEach(function (argName) {
                                if (!validate_1.validateData(args[argName], mutationMeta.args[argName].meta)) {
                                    throw validate_1.MetaValidationError(argName);
                                }
                            });
                            return [4 /*yield*/, mutationMeta.resolve(args)];
                        case 1:
                            res = _a.sent();
                            if (!onMutation[mutationName]) return [3 /*break*/, 3];
                            return [4 /*yield*/, onMutation[mutationName](args, res)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/, res];
                    }
                });
            }); }
        };
        return customMutations;
    }, {});
    var schema = new graphql_1.GraphQLSchema({
        query: new graphql_1.GraphQLObjectType({
            name: "Root",
            fields: rootTypes.reduce(function (query, type) {
                var meta = metas.find(function (x) { return x.name === type.name; });
                query[type.name] = {
                    type: new graphql_1.GraphQLList(type),
                    args: makeQueryArgs(meta, context),
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, findCondition, query_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(type.name)];
                                case 1:
                                    model = _a.sent();
                                    if (!model)
                                        return [2 /*return*/, []];
                                    else {
                                        findCondition = convertSearchToFindOptions(args.search);
                                        query_1 = model.find(findCondition)
                                            .sort(args.sort)
                                            .skip(args.skip);
                                        if (args.limit)
                                            return [2 /*return*/, query_1.limit(args.limit)];
                                        return [2 /*return*/, query_1];
                                    }
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
            fields: __assign({}, metas.reduce(function (mutations, meta) {
                var modelType = context.outputObjectTypePool[meta.name];
                var convertedInputType = mapMetaToInputType(meta, context);
                var addModelMutationName = 'add' + capitalize(meta.name);
                mutations[addModelMutationName] = {
                    type: modelType,
                    args: {
                        payload: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(meta.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.create(args.payload)];
                                case 2:
                                    res = _a.sent();
                                    if (!onMutation[addModelMutationName]) return [3 /*break*/, 4];
                                    return [4 /*yield*/, onMutation[addModelMutationName](args, res)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/, res];
                            }
                        });
                    }); }
                };
                var updateModelMutationName = 'update' + capitalize(meta.name);
                mutations[updateModelMutationName] = {
                    type: modelType,
                    args: {
                        condition: {
                            type: convertedInputType
                        },
                        payload: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(meta.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.findOneAndUpdate(args.condition, args.payload).exec()];
                                case 2:
                                    res = _a.sent();
                                    if (!onMutation[updateModelMutationName]) return [3 /*break*/, 4];
                                    return [4 /*yield*/, onMutation[updateModelMutationName](args, res)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/, res];
                            }
                        });
                    }); }
                };
                var updateManyModelMutationName = 'updateMany' + capitalize(meta.name);
                mutations[updateManyModelMutationName] = {
                    type: graphql_1.GraphQLInt,
                    args: {
                        condition: {
                            type: convertedInputType
                        },
                        payload: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, updateResult, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(meta.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.updateMany(args.condition, args.payload).exec()];
                                case 2:
                                    updateResult = _a.sent();
                                    res = updateResult ? updateResult.n : 0;
                                    if (!onMutation[updateModelMutationName]) return [3 /*break*/, 4];
                                    return [4 /*yield*/, onMutation[updateModelMutationName](args, res)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/, res];
                            }
                        });
                    }); }
                };
                var deleteModelMutationName = 'delete' + capitalize(meta.name);
                mutations[deleteModelMutationName] = {
                    type: graphql_1.GraphQLInt,
                    args: {
                        condition: {
                            type: convertedInputType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, deleteResult, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(meta.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.deleteMany(args.condition).exec()];
                                case 2:
                                    deleteResult = _a.sent();
                                    res = deleteResult ? deleteResult.n : 0;
                                    if (!onMutation[deleteModelMutationName]) return [3 /*break*/, 4];
                                    return [4 /*yield*/, onMutation[deleteModelMutationName](args, res)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/, res];
                            }
                        });
                    }); }
                };
                return mutations;
            }, {}), customMutations)
        })
    });
    return schema;
}
exports.makeGraphQLSchema = makeGraphQLSchema;
//# sourceMappingURL=make-schema.js.map
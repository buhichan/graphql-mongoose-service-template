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
var make_custom_types_1 = require("./make-custom-types");
function capitalize(str) {
    if (!str)
        return str;
    return str[0].toUpperCase() + str.slice(1);
}
function mapMetaToField(fieldMeta, context, path) {
    var field = {
        type: mapMetaToOutputType(fieldMeta, context, path),
        description: fieldMeta.label
    };
    if (!fieldMeta.type)
        return null;
    if (fieldMeta.type === 'ref' && fieldMeta.ref) {
        field.resolve = context.getResolver(fieldMeta.ref, path.slice(1).concat(fieldMeta.name));
    }
    else if (fieldMeta.type === 'array' && fieldMeta.item && fieldMeta.item.type === 'ref' && fieldMeta.item.ref) {
        field.resolve = context.getResolver(fieldMeta.item.ref, path.slice(1).concat(fieldMeta.name));
    }
    else if (fieldMeta.resolve)
        field.resolve = function (_, args, context) { return fieldMeta.resolve(args, context); };
    return field;
}
//path不包括field.name
function mapMetaToOutputType(field, context, path) {
    switch (true) {
        case !field:
            return null;
        case field.name === "_id":
            return graphql_1.GraphQLID;
        case ('enum' in field && field.enum instanceof Array && field.enum.length > 0): {
            var enumList = field['enum'];
            if (!context.enumTypePoll[field.name]) {
                context.enumTypePoll[field.name] = new graphql_1.GraphQLEnumType({
                    name: path.concat(field.name).join("__"),
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
                    name: path.concat(field.name).join("__"),
                    description: field.label,
                    fields: function () { return field.fields.reduce(function (fields, childMeta) {
                        var child = mapMetaToField(childMeta, context, path.concat(field.name));
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
exports.mapMetaToOutputType = mapMetaToOutputType;
function mapMetaToInputType(meta, context, operationType) {
    if (!meta)
        return null;
    if (meta.readonly && operationType === 'Write')
        return null;
    if (meta.writeonly && operationType === 'Read')
        return null;
    if (meta.type === "ref")
        return graphql_1.GraphQLString;
    if (meta.type === 'object') {
        var inputObjectTypeName = operationType + capitalize(meta.name);
        if (!context.inputObjectTypePool[inputObjectTypeName])
            context.inputObjectTypePool[inputObjectTypeName] = new graphql_1.GraphQLInputObjectType({
                name: inputObjectTypeName,
                fields: function () { return meta.fields.reduce(function (inputFields, fieldMeta) {
                    var converted = mapMetaToInputType(fieldMeta, context, operationType);
                    if (converted)
                        inputFields[fieldMeta.name] = {
                            type: converted,
                            description: fieldMeta.label
                        };
                    return inputFields;
                }, {}); }
            });
        return context.inputObjectTypePool[inputObjectTypeName];
    }
    else if (meta.type === 'array') {
        var item = mapMetaToInputType(meta.item, context, operationType);
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
exports.mapMetaToInputType = mapMetaToInputType;
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
            description: "搜索条件, 支持mongodb操作符, 但需要把$替换为_",
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
    var connection = options.connection, metas = options.metas, _a = options.mutations, mutationMetas = _a === void 0 ? {} : _a, _b = options.queries, queryMetas = _b === void 0 ? {} : _b, _c = options.onMutation, onMutation = _c === void 0 ? {} : _c;
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
            type: "string",
            readonly: true
        },
        {
            name: "createdAt",
            label: "创建时间",
            type: "date",
            readonly: true
        }, {
            name: "updatedAt",
            label: "更新时间",
            type: "date",
            readonly: true
        }
    ];
    metas = metas.filter(function (x) { return x && x.type === "object"; }).map(function (modelMeta) {
        return __assign({}, modelMeta, { fields: __spread(modelMeta.fields, internalFields.filter(function (x) { return !modelMeta.fields.some(function (y) { return y.name === x.name; }); })) });
    });
    var rootTypes = metas.map(function (modelMeta) {
        return mapMetaToOutputType(modelMeta, context, []);
    });
    var IDType = new graphql_1.GraphQLNonNull(graphql_1.GraphQLID);
    var metaTypeQueries = rootTypes.reduce(function (query, type) {
        var meta = metas.find(function (x) { return x.name === type.name; });
        var resolve = function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
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
        }); };
        query[type.name] = {
            type: new graphql_1.GraphQLList(type),
            description: meta.label,
            args: makeQueryArgs(meta, context),
            resolve: resolve
        };
        return query;
    }, {});
    var schema = new graphql_1.GraphQLSchema({
        query: new graphql_1.GraphQLObjectType({
            name: "Root",
            fields: __assign({}, metaTypeQueries, make_custom_types_1.makeCustomTypes(queryMetas, context, {})),
        }),
        types: rootTypes,
        mutation: new graphql_1.GraphQLObjectType({
            name: "Mutation",
            fields: __assign({}, metas.reduce(function (mutations, meta) {
                var modelType = context.outputObjectTypePool[meta.name];
                var modelReadType = new graphql_1.GraphQLNonNull(mapMetaToInputType(meta, context, 'Read'));
                var modelWriteType = new graphql_1.GraphQLNonNull(mapMetaToInputType(meta, context, 'Write'));
                var addModelMutationName = 'add' + capitalize(meta.name);
                mutations[addModelMutationName] = {
                    type: modelType,
                    args: {
                        payload: {
                            type: modelWriteType
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
                        _id: {
                            type: IDType,
                        },
                        payload: {
                            type: modelWriteType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(meta.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.findByIdAndUpdate(args._id, args.payload, {
                                            new: true
                                        }).exec()];
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
                            type: modelReadType
                        },
                        payload: {
                            type: modelWriteType
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
                        _id: {
                            type: IDType
                        }
                    },
                    resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var model, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getModel(meta.name)];
                                case 1:
                                    model = _a.sent();
                                    return [4 /*yield*/, model.findByIdAndRemove(args._id).exec()];
                                case 2:
                                    res = _a.sent();
                                    if (!onMutation[deleteModelMutationName]) return [3 /*break*/, 4];
                                    return [4 /*yield*/, onMutation[deleteModelMutationName](args, res)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/, !!res ? 1 : 0];
                            }
                        });
                    }); }
                };
                return mutations;
            }, {}), make_custom_types_1.makeCustomTypes(mutationMetas, context, onMutation))
        })
    });
    return schema;
}
exports.makeGraphQLSchema = makeGraphQLSchema;
//# sourceMappingURL=make-schema.js.map
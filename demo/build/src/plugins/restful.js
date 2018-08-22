"use strict";
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
var utils_1 = require("../utils");
var joi = require("joi");
var utils_2 = require("./utils");
var getQuery = function (name) {
    return function (request) {
        if (typeof request.query === 'string')
            return null;
        return request.query[name];
    };
};
var defaultSuccessAction = function (res) {
    return {
        message: "ok",
        data: res
    };
};
var defaultFailAction = function (error) {
    console.error(error);
    return {
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        data: null
    };
};
function restfulRoutes(options) {
    var _this = this;
    var meta = options.meta, connection = options.connection, validators = options.validators, _a = options.onSuccess, onSuccess = _a === void 0 ? defaultSuccessAction : _a, _b = options.onFail, onFail = _b === void 0 ? defaultFailAction : _b, _c = options.routePrefix, routePrefix = _c === void 0 ? "/" : _c;
    var afterResponse = function (res) {
        return res.then(onSuccess, onFail);
    };
    var failAction = function (_, __, err) {
        console.error(err);
        throw err;
    };
    var getModel = utils_2.makeModelGetter(connection);
    return [
        {
            path: "" + routePrefix + meta.name,
            method: "get",
            handler: utils_1.pipe(function (req) { return __awaiter(_this, void 0, void 0, function () {
                var model, where, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getModel(meta.name)];
                        case 1:
                            model = _a.sent();
                            where = meta.fields.reduce(function (query, k) {
                                var field = getQuery(k.name)(req);
                                if (field !== undefined)
                                    query[k.name] = field;
                                return query;
                            }, {
                            // todo: createdAt
                            });
                            return [4 /*yield*/, model.find(where)
                                    .limit(utils_1.pipe(getQuery('limit'), utils_1.head, parseInt, utils_1.defaultValue(100))(req))
                                    .skip(utils_1.pipe(getQuery('skip'), utils_1.head, parseInt, utils_1.defaultValue(0))(req))];
                        case 2:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            }); }, afterResponse)
        }, {
            path: "" + routePrefix + meta.name + "/{id}",
            method: "get",
            options: {
                validate: {
                    params: {
                        id: joi.string()
                    },
                    failAction: failAction
                }
            },
            handler: utils_1.pipe(function (req) { return __awaiter(_this, void 0, void 0, function () {
                var model, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getModel(meta.name)];
                        case 1:
                            model = _a.sent();
                            return [4 /*yield*/, model.findById(utils_1.head(getQuery("id")(req)))];
                        case 2:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            }); }, afterResponse)
        }, {
            path: "" + routePrefix + meta.name + "/{id}",
            method: "put",
            options: {
                validate: {
                    params: {
                        id: joi.string()
                    },
                    payload: validators.put,
                    failAction: failAction
                },
                response: {
                    failAction: failAction
                },
            },
            handler: utils_1.pipe(function (req) { return __awaiter(_this, void 0, void 0, function () {
                var model, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getModel(meta.name)];
                        case 1:
                            model = _a.sent();
                            return [4 /*yield*/, model.findByIdAndUpdate(req.params.id, req.payload)];
                        case 2:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            }); }, afterResponse)
        }, {
            path: "" + routePrefix + meta.name,
            method: "post",
            options: {
                validate: {
                    payload: validators.post,
                    failAction: failAction
                },
                response: {
                    failAction: failAction
                }
            },
            handler: utils_1.pipe(function (req) { return __awaiter(_this, void 0, void 0, function () {
                var model, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getModel(meta.name)];
                        case 1:
                            model = _a.sent();
                            return [4 /*yield*/, model.create(req.payload)];
                        case 2:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            }); }, afterResponse)
        }, {
            path: "" + routePrefix + meta.name + "/{id}",
            method: "delete",
            options: {
                validate: {
                    params: {
                        id: joi.string()
                    },
                    failAction: failAction
                },
                response: {
                    failAction: failAction
                }
            },
            handler: utils_1.pipe(function (req) { return __awaiter(_this, void 0, void 0, function () {
                var model, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getModel(meta.name)];
                        case 1:
                            model = _a.sent();
                            return [4 /*yield*/, model.findByIdAndRemove(req.params.id)];
                        case 2:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            }); }, afterResponse)
        }
    ];
}
exports.restfulRoutes = restfulRoutes;
//# sourceMappingURL=restful.js.map
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
var Hapi = require("hapi");
var joi = require("joi");
var mongoose_1 = require("mongoose");
var graphiql_1 = require("./graphiql");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        /**
         * reload graphql schema when meta model is mutated.
         */
        function reloadMetas() {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, Promise.all(allMetas.map(function (meta) { return makeModelFromMeta({ connection: connection, meta: meta }); }))];
                        case 1:
                            _d.sent();
                            _b = (_a = graphQLPlugin).reload;
                            _c = {};
                            return [4 /*yield*/, MetaModel.find()];
                        case 2:
                            _b.apply(_a, [(_c.metas = (_d.sent()).map(function (x) { return x.toObject(); }).concat(metaOfMeta),
                                    _c)]);
                            return [2 /*return*/];
                    }
                });
            });
        }
        var _a, makeModelFromMeta, metaOfMeta, restfulRoutes, makeGraphQLPlugin, server, uri, connection, MetaModel, metas, allMetas, alreadyDefined, graphQLPlugin, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("../src"); })];
                case 1:
                    _a = _e.sent(), makeModelFromMeta = _a.makeModelFromMeta, metaOfMeta = _a.metaOfMeta, restfulRoutes = _a.restfulRoutes, makeGraphQLPlugin = _a.makeGraphQLPlugin;
                    console.log("Dependencies loaded.");
                    server = new Hapi.Server({
                        host: "0.0.0.0",
                        port: 10082,
                        routes: {
                            "cors": {
                                origin: ['*'],
                                credentials: true
                            },
                        },
                        router: {
                            stripTrailingSlash: true
                        }
                    });
                    uri = "mongodb://localhost:27017/graphql-test";
                    return [4 /*yield*/, new mongoose_1.Mongoose().createConnection(uri, {
                            useNewUrlParser: true
                        })];
                case 2:
                    connection = _e.sent();
                    return [4 /*yield*/, makeModelFromMeta({
                            connection: connection,
                            meta: metaOfMeta
                        })];
                case 3:
                    MetaModel = _e.sent();
                    return [4 /*yield*/, MetaModel.find()];
                case 4:
                    metas = _e.sent();
                    allMetas = metas.map(function (x) {
                        var meta = x.toObject();
                        // makeModelFromMeta(meta)
                        return meta;
                    }).concat([
                        {
                            name: "test",
                            type: "object",
                            label: "test",
                            fields: [
                                {
                                    name: "any",
                                    type: "any",
                                    label: "any"
                                }
                            ]
                        },
                    ]);
                    console.log("Metas loaded.");
                    return [4 /*yield*/, Promise.all(allMetas.map(function (meta) { return makeModelFromMeta({ connection: connection, meta: meta }); }))];
                case 5:
                    _e.sent();
                    console.log("Models loaded.");
                    alreadyDefined = new Set();
                    allMetas.concat(metaOfMeta).map(function (meta) {
                        if (alreadyDefined.has(meta.name)) {
                            alreadyDefined.add(meta.name);
                            server.route(restfulRoutes({
                                meta: meta,
                                connection: connection,
                                validators: {
                                    put: joi.any(),
                                    post: joi.any()
                                }
                            }));
                        }
                    });
                    graphQLPlugin = makeGraphQLPlugin({
                        metas: allMetas.concat(metaOfMeta),
                        connection: connection,
                        onMutation: {
                            addMeta: reloadMetas,
                            deleteMeta: reloadMetas,
                            updateMeta: reloadMetas
                        },
                        mutations: {
                            customAction: {
                                args: {
                                    name: {
                                        meta: {
                                            type: "string",
                                            name: "Name",
                                            label: "Name"
                                        },
                                        defaultValue: "world"
                                    }
                                },
                                returns: {
                                    type: "string",
                                    name: "string",
                                    label: "string"
                                },
                                resolve: function (args, context) {
                                    return "hello " + args.name;
                                }
                            }
                        }
                    });
                    return [4 /*yield*/, server.register({
                            plugin: graphQLPlugin
                        })];
                case 6:
                    _e.sent();
                    return [4 /*yield*/, server.start()];
                case 7:
                    _e.sent();
                    server.events.on('request', function (request, event, tags) {
                        console.log(tags);
                        if (tags.error) {
                            // console.log(`Request error: ${event.error ? event.error['message'] : 'unknown'}`);
                            if (request && request.response)
                                request.response.message = JSON.stringify({
                                    meta: __assign({}, event.error),
                                    data: null
                                });
                        }
                    });
                    server.route({
                        path: "/login",
                        method: "post",
                        handler: function () {
                            return "success";
                        }
                    });
                    graphiql_1.default(server); // graphiql只是作demo用, 类似swagger
                    console.log("Backend running in http://localhost:10082");
                    console.log("Graphql API is http://localhost:10082/graphql");
                    console.log("To see frontend, run yarn dev:fe, then go to http://localhost:10082/graphiql/graphiql.html");
                    _c = (_b = console).log;
                    _d = "Current models: ";
                    return [4 /*yield*/, connection];
                case 8:
                    _c.apply(_b, [_d + (_e.sent()).modelNames()]);
                    return [2 /*return*/];
            }
        });
    });
}
exports.bootstrap = bootstrap;
bootstrap();
//# sourceMappingURL=demo.js.map
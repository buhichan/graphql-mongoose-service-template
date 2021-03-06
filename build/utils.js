"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = function () { };
exports.identity = function (x) { return x; };
exports.makeModelGetter = function (connection) { return function (metaName) {
    var Model = connection.models[metaName];
    if (!Model)
        return null;
    return Model;
}; };
function pipe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (first) { return (args && args.length
        ? args.reduce(function (result, next) { return next(result); }, first)
        : first); };
}
exports.pipe = pipe;
function deepGet(obj, path) {
    var p = obj;
    var i = 0;
    while (i < path.length) {
        var seg = path[i];
        if (seg != undefined && p != undefined)
            p = p[seg];
        else
            return null;
        i++;
    }
    return p;
}
exports.deepGet = deepGet;
function defaultValue(defaultV) {
    return function (v) {
        return v ? v : defaultV;
    };
}
exports.defaultValue = defaultValue;
exports.head = function (maybeArr) {
    if (maybeArr instanceof Array)
        return maybeArr[0];
    return maybeArr;
};
function deepEqual(a, b) {
    if (a instanceof Array)
        return a.every(function (_, k) { return deepEqual(a[k], b[k]); });
    if (typeof a === 'object')
        return Object.keys(a).every(function (k) {
            return deepEqual(a[k], b[k]);
        });
    return a === b;
}
exports.deepEqual = deepEqual;
//# sourceMappingURL=utils.js.map
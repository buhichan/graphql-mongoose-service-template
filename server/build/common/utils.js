"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=utils.js.map
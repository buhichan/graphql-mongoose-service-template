"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makeBatch(batcher) {
    var buffer = [];
    var timer;
    function trigger() {
        if (!timer) {
            timer = setImmediate(flush);
        }
    }
    function flush() {
        var bufferClone = buffer.slice();
        buffer = [];
        batcher(bufferClone.map(function (x) { return x.item; })).then(function (res) {
            bufferClone.forEach(function (x, i) {
                x.resolve(res instanceof Array ? res[i] : res);
            });
        }).catch(function (err) {
            bufferClone.forEach(function (x) { return x.reject(err); });
        });
        timer = null;
    }
    return function (item) {
        return new Promise(function (resolve, reject) {
            buffer.push({
                item: item,
                resolve: resolve,
                reject: reject
            });
            trigger();
        });
    };
}
exports.makeBatch = makeBatch;
//# sourceMappingURL=batching.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldTypes = {
    "number": Number,
    "string": String,
    "boolean": Boolean,
    "ref": String,
    "array": Array,
    "object": Object,
    "date": Date
};
function buildMeta(nestLevel) {
    if (nestLevel === 0)
        return undefined;
    var child = buildMeta(nestLevel - 1);
    var fields = [
        {
            name: "name",
            label: "名称",
            type: "string",
        }, {
            name: "label",
            label: "标签",
            type: "string",
        }, {
            name: "type",
            label: "类型",
            type: "string",
            enum: Object.keys(exports.fieldTypes),
        }, {
            name: "enum",
            label: "枚举",
            type: "array",
            item: {
                name: "enum",
                type: "string",
                label: "枚举值"
            }
        }, {
            name: "ref",
            label: "关联",
            type: "string",
        }
    ];
    if (child)
        fields.push({
            name: "fields",
            label: "字段列表",
            type: "array",
            item: {
                name: "child",
                type: "object",
                label: "字段定义",
                fields: child
            }
        });
    return fields;
}
exports.metaOfMeta = {
    name: "Meta",
    label: "元数据",
    type: "object",
    fields: buildMeta(3)
};
//# sourceMappingURL=meta.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var validate_1 = require("./validate");
exports.mapFieldTypeToMongooseType = {
    "number": mongoose_1.Schema.Types.Number,
    "string": mongoose_1.Schema.Types.String,
    "boolean": mongoose_1.Schema.Types.Boolean,
    "ref": mongoose_1.Schema.Types.ObjectId,
    "date": mongoose_1.Schema.Types.Date,
    "any": mongoose_1.Schema.Types.Mixed
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
            enum: Object.keys(exports.mapFieldTypeToMongooseType),
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
    if (child) {
        fields.push({
            name: "fields",
            label: "字段列表",
            type: "array",
            item: {
                name: "child",
                type: "object",
                label: "字段定义",
                fields: child,
                validate: validate_1.fieldValidator
            }
        });
        fields.push({
            name: "item",
            label: "子项",
            type: "object",
            fields: child,
            validate: validate_1.fieldValidator
        });
    }
    return fields;
}
exports.metaOfMeta = {
    name: "Meta",
    label: "元数据",
    type: "object",
    fields: buildMeta(3),
    validate: validate_1.fieldValidator
};
//# sourceMappingURL=meta.js.map
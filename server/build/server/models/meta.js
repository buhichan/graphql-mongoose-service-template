"use strict";
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
var helper_1 = require("./helper");
require("../db");
var joi = require("joi");
var mongoose_1 = require("mongoose");
var typeKey = '$type';
exports.fieldTypes = {
    "string": function () { return String; },
    "number": function () { return Number; },
    "date": function () { return Date; },
    "enum": function (metaField) {
        var _a;
        return (_a = {},
            _a[typeKey] = mongoose_1.SchemaTypes.String,
            _a.enum = metaField.enum,
            _a);
    },
    "list": function () { return [String]; },
    "boolean": function () { return Boolean; },
    "array": function (metaField) { return [makeSchemaDefinitions(metaField.children)]; },
    "object": function (metaField) { return makeSchemaDefinitions(metaField.children); },
    "ref": function (metaField) {
        var _a;
        return (_a = {},
            _a[typeKey] = mongoose_1.SchemaTypes.ObjectId,
            _a.ref = metaField.ref,
            _a);
    }
};
var metaOfField = [
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
        type: "enum",
        enum: Object.keys(exports.fieldTypes),
    }, {
        name: "enum",
        label: "枚举",
        type: "list",
    }, {
        name: "ref",
        label: "关联",
        type: "string",
    }
];
exports.metaOfMeta = {
    name: "Meta",
    fields: [
        {
            name: "name",
            label: "名称",
            type: "string",
            children: []
        }, {
            name: "fields",
            label: "字段",
            type: "array",
            children: __spread(metaOfField, [
                {
                    name: "children",
                    label: "字段",
                    type: "array",
                    children: __spread(metaOfField, [
                        {
                            name: "children",
                            label: "字段",
                            type: "array",
                            children: metaOfField
                        },
                    ])
                },
            ])
        }
    ]
};
exports.MetaModel = makeModelFromMeta(exports.metaOfMeta);
function makeSchemaDefinitions(metaFields) {
    return metaFields.reduce(function (fields, metaField) {
        if (metaField.type in exports.fieldTypes)
            fields[metaField.name] = exports.fieldTypes[metaField.type](metaField);
        else
            console.error("Invalid field meta:", metaField);
        return fields;
    }, {});
}
function makeModelFromMeta(meta) {
    return helper_1.model(meta.name, makeSchemaDefinitions(meta.fields), {
        typeKey: typeKey
    });
}
exports.makeModelFromMeta = makeModelFromMeta;
var fieldValidator = joi.object({
    name: joi.string().required(),
    label: joi.string().required(),
    type: joi.string().required().allow(Object.keys(exports.fieldTypes)),
    enum: joi.array().items(joi.string()).optional(),
    ref: joi.string().optional(),
    children: joi.array().items(joi.lazy(function () { return fieldValidator; })).optional()
});
exports.metaModelValidations = {
    post: joi.object({
        name: joi.string().required(),
        fields: joi.array().items(fieldValidator).required()
    }).unknown(true),
    put: joi.object({
        name: joi.string().optional(),
        fields: joi.array().items(fieldValidator).optional()
    }).unknown(true),
};
// console.log(MetaModelDef)
//# sourceMappingURL=meta.js.map
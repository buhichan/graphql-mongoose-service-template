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
var _a;
var helper_1 = require("./helper");
require("../db");
var joi = require("joi");
exports.fieldTypes = {
    "string": String,
    "number": Number,
    "date": Date,
    "array": Array,
    "object": Object,
    "boolean": Boolean
};
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
            children: [
                {
                    name: "name",
                    label: "名称",
                    type: "string",
                    children: []
                }, {
                    name: "label",
                    label: "标签",
                    type: "string",
                    children: []
                }, {
                    name: "type",
                    label: "类型",
                    type: "string",
                    children: []
                }, {
                    name: "children",
                    label: "字段",
                    type: "array",
                    children: [
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
                        }
                    ]
                },
            ]
        }
    ]
};
exports.MetaModel = makeModelFromMeta(exports.metaOfMeta);
function makeSchemaDefinitions(metaFields) {
    return metaFields.reduce(function (fields, metaField) {
        var makeField = function (metaField) {
            switch (metaField.type) {
                case "string": return String;
                case "number": return Number;
                case "boolean": return Boolean;
                case "date": return Date;
                case "array": return [
                    makeSchemaDefinitions(metaField.children)
                ];
                case "object": return makeSchemaDefinitions(metaField.children);
            }
        };
        fields[metaField.name] = makeField(metaField);
        return fields;
    }, {});
}
function makeModelFromMeta(meta) {
    return helper_1.model(meta.name, makeSchemaDefinitions(meta.fields), {
        typeKey: "$type"
    });
}
exports.makeModelFromMeta = makeModelFromMeta;
var fieldValidator = joi.object({
    name: joi.string().required(),
    label: joi.string().required(),
    type: (_a = joi.string().required()).allow.apply(_a, __spread(Object.keys(exports.fieldTypes))),
    children: joi.array().items(joi.lazy(function () { return fieldValidator; }))
});
exports.metaModelValidations = {
    post: joi.object({
        name: joi.string().required(),
        fields: joi.array().items(fieldValidator).required()
    }).unknown(true),
    put: joi.object({
        name: joi.string(),
        fields: joi.array().items(fieldValidator)
    }).unknown(true),
};
// console.log(MetaModelDef)
//# sourceMappingURL=meta-model.js.map
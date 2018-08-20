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
var _a, _b, _c, _d;
var helper_1 = require("./helper");
require("../db");
var joi = require("joi");
exports.fieldTypes = ["string", "number", "date", "array", "object", "boolean"];
var MetaModelFieldDef1 = {
    name: String,
    label: String,
    type: String
};
var MetaModelFieldDef2 = __assign({}, MetaModelFieldDef1, { children: [
        MetaModelFieldDef1
    ] });
var MetaModelFieldDef = __assign({}, MetaModelFieldDef2, { children: [
        MetaModelFieldDef2
    ] }); // max nesting level === 1, level 2 is only allowed for meta of meta.
var MetaModelDef = {
    name: String,
    fields: [
        MetaModelFieldDef
    ]
};
exports.MetaModel = helper_1.model("Meta", MetaModelDef, {
    typeKey: "$type"
});
function makeModelFromMeta(meta) {
    var makeFields = function (metaFields) { return metaFields.reduce(function (fields, metaField) {
        var makeField = function (metaField) {
            switch (metaField.type) {
                case "string": return String;
                case "number": return Number;
                case "boolean": return Boolean;
                case "date": return Date;
                case "array": return [
                    makeFields(metaField.children)
                ];
                case "object": return makeFields(metaField.children);
            }
        };
        fields[metaField.name] = makeField(metaField);
        return fields;
    }, {}); };
    return helper_1.model(meta.name, makeFields(meta.fields), {
        typeKey: "$type"
    });
}
exports.makeModelFromMeta = makeModelFromMeta;
exports.metaModelValidations = {
    post: joi.object({
        name: joi.string().required(),
        fields: joi.array().items(joi.object({
            name: joi.string().required(),
            label: joi.string().required(),
            type: (_a = joi.string().required()).allow.apply(_a, __spread(exports.fieldTypes)),
            children: joi.array().items(joi.object({
                name: joi.string().required(),
                label: joi.string().required(),
                type: (_b = joi.string()).allow.apply(_b, __spread(exports.fieldTypes)).disallow('array', 'object').required(),
            }))
        })).required()
    }).unknown(true),
    put: joi.object({
        name: joi.string(),
        fields: joi.array().items(joi.object({
            name: joi.string().required(),
            label: joi.string().required(),
            type: (_c = joi.string().required()).allow.apply(_c, __spread(exports.fieldTypes)),
            children: joi.array().items(joi.object({
                name: joi.string().required(),
                label: joi.string().required(),
                type: (_d = joi.string()).allow.apply(_d, __spread(exports.fieldTypes)).disallow('array', 'object').required(),
            }))
        }))
    }).unknown(true),
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
//# sourceMappingURL=meta-model.js.map
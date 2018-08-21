"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("./helper");
require("../db");
var joi = require("joi");
var meta_1 = require("./meta");
var mongoose_1 = require("mongoose");
var typeKey = '$type';
exports.MetaModel = makeModelFromMeta(meta_1.metaOfMeta);
function makeSchemaDefinitions(metaFields) {
    var specialFields = {
        "array": function (metaField) { return [makeSchemaDefinition(metaField.item)]; },
        "object": function (metaField) { return makeSchemaDefinitions(metaField.fields); },
        "ref": function (metaField) {
            var _a;
            return (_a = {},
                _a[typeKey] = mongoose_1.SchemaTypes.ObjectId,
                _a.ref = metaField.ref,
                _a);
        }
    };
    function makeSchemaDefinition(metaField) {
        if (metaField.type in specialFields)
            return specialFields[metaField.type](metaField);
        else if (metaField.type in meta_1.fieldTypes)
            return meta_1.fieldTypes[metaField.type];
        else
            return null;
    }
    return metaFields.reduce(function (fields, metaField) {
        var def = makeSchemaDefinition(metaField);
        if (def)
            fields[metaField.name] = def;
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
    type: joi.string().required().allow(Object.keys(meta_1.fieldTypes)),
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
//# sourceMappingURL=model.js.map
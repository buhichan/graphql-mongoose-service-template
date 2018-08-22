"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var joi = require("joi");
var meta_1 = require("./meta");
var mongoose_1 = require("mongoose");
var typeKey = '$type';
exports.makeMetaModel = function (connection) { return makeModelFromMeta(connection)(meta_1.metaOfMeta); };
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
function makeModelFromMeta(connection) {
    return function (meta) {
        return connection.model(meta.name, new mongoose_1.Schema(makeSchemaDefinitions(meta.fields), {
            typeKey: typeKey
        }), meta.name);
    };
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
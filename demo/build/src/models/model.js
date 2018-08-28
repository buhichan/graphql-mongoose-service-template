"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var joi = require("joi");
var meta_1 = require("./meta");
var mongoose_1 = require("mongoose");
var typeKey = '$type';
exports.makeMetaModel = function (connection) { return makeModelFromMeta(connection)(meta_1.metaOfMeta); };
function makeSchemaDefinitions(metaFields) {
    function makeFieldDefinition(fieldMeta) {
        var _a;
        switch (fieldMeta.type) {
            case "array": {
                var item = makeFieldDefinition(fieldMeta.item);
                if (item)
                    return [item];
                return null;
            }
            case "object":
                return makeSchemaDefinitions(fieldMeta.fields);
            case "ref":
                return _a = {},
                    _a[typeKey] = mongoose_1.SchemaTypes.ObjectId,
                    _a.ref = fieldMeta.ref,
                    _a;
            default: {
                if (fieldMeta.type in meta_1.fieldTypes)
                    return meta_1.fieldTypes[fieldMeta.type];
                else
                    return null;
            }
        }
    }
    if (!metaFields)
        return {};
    return metaFields.reduce(function (fields, metaField) {
        var def = makeFieldDefinition(metaField);
        if (def)
            fields[metaField.name] = def;
        return fields;
    }, {});
}
function makeModelFromMeta(connection) {
    return function (meta) {
        if (meta.name in connection.models)
            delete connection.models[meta.name];
        if (meta.type === 'object' && meta.fields) {
            var def = makeSchemaDefinitions(meta.fields);
            try {
                return connection.model(meta.name, new mongoose_1.Schema(def, {
                    typeKey: typeKey
                }), meta.name);
            }
            catch (e) {
                console.error('invalid meta:', meta);
                console.error('invalid mongoose def:', def);
                throw e;
            }
        }
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
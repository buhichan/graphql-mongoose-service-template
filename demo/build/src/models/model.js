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
Object.defineProperty(exports, "__esModule", { value: true });
var meta_1 = require("./meta");
var mongoose_1 = require("mongoose");
var validate_1 = require("./validate");
var typeKey = '$type';
function makeFieldDefinition(fieldMeta) {
    if (fieldMeta.resolve) { // TBD:resolve的不存在于数据库
        return null;
    }
    switch (fieldMeta.type) {
        case "array": {
            var item = makeFieldDefinition(fieldMeta.item);
            if (item)
                return [item];
            return null;
        }
        case "object":
            return makeSchemaDefinition(fieldMeta.fields);
        default: {
            if (fieldMeta.type in meta_1.mapFieldTypeToMongooseType)
                return meta_1.mapFieldTypeToMongooseType[fieldMeta.type];
            else
                return null;
        }
    }
}
function makeSchemaDefinition(metaFields) {
    if (!metaFields)
        return {};
    return metaFields.reduce(function (fields, metaField) {
        var def = makeFieldDefinition(metaField);
        if (def)
            fields[metaField.name] = def;
        return fields;
    }, {});
}
exports.makeSchemaDefinition = makeSchemaDefinition;
function makeModelFromMeta(options) {
    var connection = options.connection, meta = options.meta, _a = options.schemaOptions, schemaOptions = _a === void 0 ? {} : _a, _b = options.mapSchemaDefinition, mapSchemaDefinition = _b === void 0 ? function (x) { return x; } : _b;
    if (meta.name in connection.models)
        delete connection.models[meta.name];
    if (meta.type === 'object' && meta.fields) {
        var def = mapSchemaDefinition(makeSchemaDefinition(meta.fields));
        var schema = new mongoose_1.Schema(def, __assign({ timestamps: true }, schemaOptions, { typeKey: typeKey }));
        schema.pre("validate", function (next) {
            var validationResult = validate_1.validateData(this.toJSON(), meta);
            if (validationResult.length)
                next(validate_1.MetaValidationError(validationResult));
            else
                next();
        });
        try {
            return connection.model(meta.name, schema, meta.name);
        }
        catch (e) {
            console.error('invalid meta:', meta);
            console.error('invalid mongoose def:', def);
            throw e;
        }
    }
}
exports.makeModelFromMeta = makeModelFromMeta;
//# sourceMappingURL=model.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldValidator = {
    allOf: [
        {
            if: {
                properties: {
                    type: {
                        const: "array"
                    }
                }
            },
            then: {
                properties: {
                    item: true
                }
            }
        }, {
            if: {
                properties: {
                    type: {
                        const: "ref"
                    }
                }
            },
            then: {
                properties: {
                    ref: true
                }
            }
        }, {
            if: {
                properties: {
                    type: {
                        const: "object"
                    }
                }
            },
            then: {
                properties: {
                    fields: true
                }
            }
        }
    ]
};
function applyMetaValidator(data, validate) {
    if (typeof validate === 'boolean')
        return !!data === validate;
    if (validate === undefined)
        return true;
    return ((!validate.const || validate.const === data) &&
        (!validate.allOf || validate.allOf.every(function (validate) { return applyMetaValidator(data, validate); })) &&
        (!validate.anyOf || validate.anyOf.some(function (validate) { return applyMetaValidator(data, validate); })) &&
        (!validate.not || !applyMetaValidator(data, validate.not)) &&
        (!validate.properties || Object.keys(validate.properties).every(function (propName) { return applyMetaValidator(data[propName], validate.properties[propName]); })) &&
        (!validate.if || (function () {
            if (applyMetaValidator(data, validate.if))
                return applyMetaValidator(data, validate.then);
            else
                return applyMetaValidator(data, validate.else);
        })()));
}
exports.applyMetaValidator = applyMetaValidator;
function MetaValidationError(name) {
    throw new Error("Meta Validation Error: " + name);
}
exports.MetaValidationError = MetaValidationError;
function validateData(data, meta) {
    switch (true) {
        case meta.name === "_id":
            return true;
        case meta.enum instanceof Array && meta.enum.length > 1:
            return meta.enum.includes(data);
        case meta.type === 'any':
            return true;
        case meta.type === 'number':
            return typeof data === 'string';
        case meta.type === 'string':
            return typeof data === 'string';
        case meta.type === 'boolean':
            return data === true || data === false;
        case meta.type === 'date':
            return isFinite(new Date(data).getTime());
        case meta.type === 'ref':
            return true; //todo: don't know what to do.
        case meta.type === 'array':
            return data instanceof Array && data.every(function (item) { return validateData(item, meta.item); });
        case meta.type === 'object': {
            if (typeof data !== 'object')
                return false;
            return ((!meta.validate || applyMetaValidator(data, meta.validate)) &&
                meta.fields.every(function (field) { return data[field.name] == undefined || validateData(data[field.name], field); }));
        }
        default:
            return false;
    }
}
exports.validateData = validateData;
//# sourceMappingURL=validate.js.map
import { model } from "./helper";
import "../db"
import * as joi from "joi"
import {metaOfMeta,IMeta, FieldTypes, fieldTypes} from "./meta"
import { SchemaTypeOpts, SchemaTypes } from "mongoose";

const typeKey = '$type'

export const MetaModel = makeModelFromMeta(metaOfMeta)

function makeSchemaDefinitions (metaFields:IMeta[]){
    const specialFields:{[type in FieldTypes]?:(fieldMeta:IMeta)=>SchemaTypeOpts<any>} = {
        "array":metaField=>[makeSchemaDefinition(metaField.item)],
        "object":metaField=>makeSchemaDefinitions(metaField.fields),
        "ref":metaField=>({
            [typeKey]:SchemaTypes.ObjectId,
            ref:metaField.ref
        })
    }
    function makeSchemaDefinition(metaField:IMeta){
        if(metaField.type in specialFields)
            return specialFields[metaField.type](metaField)
        else if(metaField.type in fieldTypes)
            return fieldTypes[metaField.type]
        else
            return null
    }
    return metaFields.reduce((fields,metaField)=>{
        const def = makeSchemaDefinition(metaField)
        if(def)
            fields[metaField.name] = def
        return fields
    },{})
}

export function makeModelFromMeta(meta:IMeta){
    return model<any>(meta.name,makeSchemaDefinitions(meta.fields),{
        typeKey:typeKey
    })
}

const fieldValidator = joi.object({
    name:joi.string().required(),
    label:joi.string().required(),
    type:joi.string().required().allow(Object.keys(fieldTypes)),
    enum:joi.array().items(joi.string()).optional(),
    ref:joi.string().optional(),
    children:joi.array().items(
        joi.lazy(()=>fieldValidator)
    ).optional()
})

export const metaModelValidations = {
    post:joi.object({
        name:joi.string().required(),
        fields:joi.array().items(
            fieldValidator
        ).required()
    }).unknown(true),
    put:joi.object({
        name:joi.string().optional(),
        fields:joi.array().items(
            fieldValidator
        ).optional()
    }).unknown(true),
}

// console.log(MetaModelDef)
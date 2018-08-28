import * as joi from "joi"
import {metaOfMeta,IMeta, FieldTypes, fieldTypes} from "./meta"
import { SchemaTypeOpts, SchemaTypes, Connection, Document, Schema } from "mongoose";

const typeKey = '$type'
export interface TypedDocument<T> extends Document {
    toObject():T,
    toJSON():T,
}

export const makeMetaModel = (connection:Connection)=>makeModelFromMeta(connection)(metaOfMeta)

function makeSchemaDefinitions (metaFields:IMeta[]){
    function makeFieldDefinition(fieldMeta:IMeta):SchemaTypeOpts<any>{
        switch(fieldMeta.type){
            case "array":{
                const item = makeFieldDefinition(fieldMeta.item)
                if(item)
                    return [item]
                return null   
            }
            case "object":
                return makeSchemaDefinitions(fieldMeta.fields)
            case "ref":
                return {
                    [typeKey]:SchemaTypes.ObjectId,
                    ref:fieldMeta.ref
                }
            default:{
                if(fieldMeta.type in fieldTypes)
                    return fieldTypes[fieldMeta.type]
                else
                    return null
            }
        }
    }
    if(!metaFields)
        return {}
    return metaFields.reduce((fields,metaField)=>{
        const def = makeFieldDefinition(metaField)
        if(def)
            fields[metaField.name] = def
        return fields
    },{})
}

export function makeModelFromMeta<T=any>(connection:Connection){
    return (meta:IMeta)=>{
        if(meta.name in connection.models)
            delete connection.models[meta.name]
        if(meta.type==='object' && meta.fields){
            const def = makeSchemaDefinitions(meta.fields)
            try{
                return connection.model<TypedDocument<T>>(
                    meta.name,
                    new Schema(def,{
                        typeKey:typeKey
                    }),
                    meta.name
                )
            }catch(e){
                console.error('invalid meta:',meta)
                console.error('invalid mongoose def:',def)
                throw e
            }
        }
    }
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
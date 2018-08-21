import { model } from "./helper";
import "../db"
import * as joi from "joi"
import { SchemaTypeOpts, SchemaTypes } from "mongoose";

const typeKey = '$type'

export const fieldTypes:{[type:string]:(fieldMeta:IMetaModelField)=>SchemaTypeOpts<any>} = {
    "string":()=>String,
    "number":()=>Number,
    "date":()=>Date,
    "enum":metaField=>({
        [typeKey]:SchemaTypes.String,
        enum:metaField.enum
    }),
    "list":()=>[String],
    "boolean":()=>Boolean,
    "array":metaField=>[makeSchemaDefinitions(metaField.children as any)],
    "object":metaField=>makeSchemaDefinitions(metaField.children as any),
    "ref":metaField=>({
        [typeKey]:SchemaTypes.ObjectId,
        ref:metaField.ref
    })
}

const metaOfField:IMetaModelField[] = [
    {
        name:"name",
        label:"名称",
        type:"string",
    },{
        name:"label",
        label:"标签",
        type:"string",
    },{
        name:"type",
        label:"类型",
        type:"enum",
        enum:Object.keys(fieldTypes),
    },{
        name:"enum",
        label:"枚举",
        type:"list",
    },{
        name:"ref",
        label:"关联",
        type:"string",
    }
]

export const metaOfMeta:IMetaModel = {
    name:"Meta",
    fields:[
        {
            name:"name",
            label:"名称",
            type:"string",
            children:[]
        },{
            name:"fields",
            label:"字段",
            type:"array",
            children:[
                ...metaOfField,
                {
                    name:"children",
                    label:"字段",
                    type:"array",
                    children:[
                        ...metaOfField,
                        {
                            name:"children",
                            label:"字段",
                            type:"array",
                            children:metaOfField
                        },
                    ]
                },
            ]
        }
    ]
}

export type IMetaModelField = {
    name:string,
    label:string,
    type:keyof typeof fieldTypes
    children?:IMetaModelField[]
    enum?:string[]
    ref?:string
}
export type IMetaModel = {
    name:string,
    fields:IMetaModelField[]
}

export const MetaModel = makeModelFromMeta(metaOfMeta)

function makeSchemaDefinitions (metaFields:IMetaModelField[]){
    return metaFields.reduce((fields,metaField)=>{
        if(metaField.type in fieldTypes)
            fields[metaField.name] = fieldTypes[metaField.type](metaField)
        else
            console.error("Invalid field meta:", metaField)
        return fields
    },{})
}

export function makeModelFromMeta(meta:IMetaModel){
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
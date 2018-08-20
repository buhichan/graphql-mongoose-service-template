import { schemaToType, model } from "./helper";
import "../db"
import * as joi from "joi"
import { deepEqual } from "../../common/utils";

export const fieldTypes = {
    "string":String,
    "number":Number,
    "date":Date,
    "array":Array,
    "object":Object,
    "boolean":Boolean
}

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
                {
                    name:"name",
                    label:"名称",
                    type:"string",
                    children:[]
                },{
                    name:"label",
                    label:"标签",
                    type:"string",
                    children:[]
                },{
                    name:"type",
                    label:"类型",
                    type:"string",
                    children:[]
                },{
                    name:"children",
                    label:"字段",
                    type:"array",
                    children:[
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
                            type:"string",
                        }
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
}
export type IMetaModel = {
    name:string,
    fields:IMetaModelField[]
}

export const MetaModel = makeModelFromMeta(metaOfMeta)

function makeSchemaDefinitions (metaFields:IMetaModelField[]){
    return metaFields.reduce((fields,metaField)=>{
        const makeField = (metaField:IMetaModelField)=>{
            switch(metaField.type){
                case "string":return String
                case "number":return Number
                case "boolean":return Boolean
                case "date":return Date
                case "array": return [
                    makeSchemaDefinitions(metaField.children as any)
                ]
                case "object": return makeSchemaDefinitions(metaField.children as any)
            }
        }
        fields[metaField.name] = makeField(metaField)
        return fields
    },{})
}

export function makeModelFromMeta(meta:IMetaModel){
    return model<any>(meta.name,makeSchemaDefinitions(meta.fields),{
        typeKey:"$type"
    })
}

const fieldValidator = joi.object({
    name:joi.string().required(),
    label:joi.string().required(),
    type:joi.string().required().allow(...Object.keys(fieldTypes)),
    children:joi.array().items(
        joi.lazy(()=>fieldValidator)
    )
})

export const metaModelValidations = {
    post:joi.object({
        name:joi.string().required(),
        fields:joi.array().items(
            fieldValidator
        ).required()
    }).unknown(true),
    put:joi.object({
        name:joi.string(),
        fields:joi.array().items(
            fieldValidator
        )
    }).unknown(true),
}

// console.log(MetaModelDef)
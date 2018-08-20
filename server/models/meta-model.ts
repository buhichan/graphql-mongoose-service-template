import { schemaToType, model } from "./helper";
import "../db"
import * as joi from "joi"

export const fieldTypes = ["string","number","date","array","object","boolean"]

const MetaModelFieldDef1 = {
    name: String,
    label: String,
    type: String
}

const MetaModelFieldDef2 = {
    ...MetaModelFieldDef1,
    children:[
        MetaModelFieldDef1
    ]
}

const MetaModelFieldDef = {
    ...MetaModelFieldDef2,
    children:[
        MetaModelFieldDef2
    ]
} // max nesting level === 1, level 2 is only allowed for meta of meta.

const MetaModelDef = {
    name: String,
    fields: [
        MetaModelFieldDef
    ]
}

export type IMetaModel = schemaToType<typeof MetaModelDef>
export type IMetaModelField = schemaToType<typeof MetaModelFieldDef>

export const MetaModel = model<IMetaModel>("Meta",MetaModelDef,{
    typeKey:"$type"
})

export function makeModelFromMeta(meta:IMetaModel){
    const makeFields = (metaFields:IMetaModelField[])=>metaFields.reduce((fields,metaField)=>{
        const makeField = (metaField:IMetaModelField)=>{
            switch(metaField.type){
                case "string":return String
                case "number":return Number
                case "boolean":return Boolean
                case "date":return Date
                case "array": return [
                    makeFields(metaField.children as any)
                ]
                case "object": return makeFields(metaField.children as any)
            }
        }
        fields[metaField.name] = makeField(metaField)
        return fields
    },{})
    return model<any>(meta.name,makeFields(meta.fields),{
        typeKey:"$type"
    })
}

export const metaModelValidations = {
    post:joi.object({
        name:joi.string().required(),
        fields:joi.array().items(
            joi.object({
                name:joi.string().required(),
                label:joi.string().required(),
                type:joi.string().required().allow(...fieldTypes),
                children:joi.array().items(
                    joi.object({
                        name:joi.string().required(),
                        label:joi.string().required(),
                        type:joi.string().allow(...fieldTypes).disallow('array','object').required(),
                    })
                )
            })
        ).required()
    }).unknown(true),
    put:joi.object({
        name:joi.string(),
        fields:joi.array().items(
            joi.object({
                name:joi.string().required(),
                label:joi.string().required(),
                type:joi.string().required().allow(...fieldTypes),
                children:joi.array().items(
                    joi.object({
                        name:joi.string().required(),
                        label:joi.string().required(),
                        type:joi.string().allow(...fieldTypes).disallow('array','object').required(),
                    })
                )
            })
        )
    }).unknown(true),
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
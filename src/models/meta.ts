import { Schema } from "mongoose";
import { IMetaConstraint, applyMetaValidator, fieldValidator } from "./validate";
import { GraphQLFieldResolver } from "graphql";

export const mapFieldTypeToMongooseType = {
    "number":Schema.Types.Number,
    "string":Schema.Types.String,
    "boolean":Schema.Types.Boolean,
    "ref":Schema.Types.ObjectId,
    "date":Schema.Types.Date,
    "any":Schema.Types.Mixed
}

export type FieldTypes = keyof typeof mapFieldTypeToMongooseType

export type SimpleFieldTypes = Exclude<FieldTypes, "object"|"ref"|"array" >

type BaseMeta = {
    name:string,
    label:string,
    validate?:IMetaConstraint
    writeonly?:boolean
    readonly?:boolean,
    defaultValue?:any,
    resolve?:GraphQLFieldResolver<any,any,any>,
    args?:{
        [argName:string]:IMeta
    }
}

export type SimpleFieldMeta = BaseMeta & {
    type:SimpleFieldTypes
    enum?:string[]
}

export type ArrayFieldMeta = BaseMeta & {
    type:"array",
    item:IMeta
}

export type RefFieldMeta = BaseMeta & {
    type:"ref",
    ref:string
}

export type ObjectFieldMeta = BaseMeta & {
    type:"object",
    fields:IMeta[]
}

export type IMeta = SimpleFieldMeta | ArrayFieldMeta | RefFieldMeta | ObjectFieldMeta

function buildMeta(nestLevel:number){
    if(nestLevel === 0)
        return undefined
    const child = buildMeta(nestLevel-1)
    const fields:IMeta[] = [
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
            enum:Object.keys(mapFieldTypeToMongooseType),
        },{
            name:"enum",
            label:"枚举",
            type:"array",
            item:{
                name:"enum",
                type:"string",
                label:"枚举值"
            }
        },{
            name:"ref",
            label:"关联",
            type:"string",
        }
    ]
    if(child){
        fields.push(
            {
                name:"fields",
                label:"字段列表",
                type:"array",
                item:{
                    name:"child",
                    type:"object",
                    label:"字段定义",
                    fields:child,
                    validate:fieldValidator
                }
            }
        )
        fields.push(
            {
                name:"item",
                label:"子项",
                type:"object",
                fields:child,
                validate:fieldValidator
            }
        )
    }
    return fields
}

export const metaOfMeta:ObjectFieldMeta = {
    name:"Meta",
    label:"元数据",
    type:"object",
    fields:buildMeta(3),
    validate:fieldValidator
}
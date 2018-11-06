import { metaOfMeta,IMeta, mapFieldTypeToMongooseType, RefFieldMeta} from "./meta"
import { Connection, Document, Schema, SchemaOptions, SchemaDefinition } from "mongoose";
import { validateData, MetaValidationError } from "./validate";

const typeKey = '$type'
export interface TypedDocument<T> extends Document {
    toObject():T,
    toJSON():T,
}

function mapMetaTypeToMongooseType(fieldMeta:IMeta){
    if(fieldMeta.resolve){ // TBD:resolve的不存在于数据库
        return null
    }
    switch(fieldMeta.type){
        case "array":{
            const item = makeFieldDefinition(fieldMeta.item)
            if(item)
                return [item]
            return null   
        }
        case "object":
            return makeSchemaDefinition(fieldMeta.fields)
        default:{
            if(fieldMeta.type in mapFieldTypeToMongooseType)
                return {
                    [typeKey]: mapFieldTypeToMongooseType[fieldMeta.type],
                    default: fieldMeta.defaultValue
                }
            else
                return null
        }
    }
}

function makeFieldDefinition(fieldMeta:IMeta){
    const type = mapMetaTypeToMongooseType(fieldMeta)
    if((fieldMeta as RefFieldMeta).ref)
        return {
            [typeKey]: type,
            ref:(fieldMeta as RefFieldMeta).ref
        }
    return type
}

export function makeSchemaDefinition (metaFields:IMeta[]):SchemaDefinition{
    if(!metaFields)
        return {}
    return metaFields.reduce((fields,metaField)=>{
        const def = makeFieldDefinition(metaField)
        if(def)
            fields[metaField.name] = def
        return fields
    },{})
}

type MakeModelOptions<T> = {
    connection:Connection,
    meta:IMeta,
    schemaOptions?:Exclude<SchemaOptions,'typeKey'>,
    mapSchemaDefinition?:(def:SchemaDefinition)=>SchemaDefinition
}

export function makeModelFromMeta<T=any>(options:MakeModelOptions<T>){
    const {connection,meta,schemaOptions={},mapSchemaDefinition=x=>x} = options
    if(meta.name in connection.models)
        delete connection.models[meta.name]
    if(meta.type==='object' && meta.fields){
        const def = mapSchemaDefinition(makeSchemaDefinition(meta.fields))
        const schema = new Schema(def,{
            timestamps:true,
            ...schemaOptions,
            typeKey:typeKey
        })
        schema.pre("validate",function(this:Document,next:any){
            const validationResult = validateData(this.toJSON(),meta)
            if(validationResult.length)
                next(MetaValidationError(validationResult))
            else
                next()
        })
        try{
            return connection.model<TypedDocument<T>>(
                meta.name,
                schema,
                meta.name
            )
        }catch(e){
            console.error('invalid meta:',meta)
            console.error('invalid mongoose def:',def)
            throw e
        }
    }
}
import { metaOfMeta,IMeta, fieldTypes} from "./meta"
import { Connection, Document, Schema, SchemaOptions, SchemaDefinition, ValidationError } from "mongoose";
import { validateData } from "./validate";

const typeKey = '$type'
export interface TypedDocument<T> extends Document {
    toObject():T,
    toJSON():T,
}

function mapMetaTypeToMongooseType(fieldMeta:IMeta){
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
            if(fieldMeta.type in fieldTypes)
                return fieldTypes[fieldMeta.type]
            else
                return null
        }
    }
}

function makeFieldDefinition(fieldMeta:IMeta){
    const type = mapMetaTypeToMongooseType(fieldMeta)
    if(fieldMeta.ref)
        return {
            [typeKey]: type,
            ref:fieldMeta.ref
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
            if(!validateData(this.toJSON(),meta))
                next(new ValidationError("Validation Error: "+meta.name))
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
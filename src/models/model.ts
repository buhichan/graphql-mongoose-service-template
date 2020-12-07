import { metaOfMeta, IMeta, mapFieldTypeToMongooseType, RefFieldMeta } from "./meta"
import { Connection, Document, Schema, SchemaOptions, SchemaDefinition } from "mongoose"
import { validateData, MetaValidationError } from "./validate"
import { func } from "joi"

const typeKey = "$type"
export interface TypedDocument<T> extends Document {
    toObject(): T
    toJSON(): T
}

function makeFieldDefinition(fieldMeta: IMeta) {
    if (fieldMeta.resolve) {
        // TBD:resolve的不存在于数据库
        return null
    }
    switch (fieldMeta.type) {
        case "array": {
            const item = makeFieldDefinition(fieldMeta.item)
            if (item) return [item]
            return null
        }
        case "object":
            return makeSchemaDefinition(fieldMeta.fields)
        default: {
            if (fieldMeta.type in mapFieldTypeToMongooseType) return mapFieldTypeToMongooseType[fieldMeta.type]
            else return null
        }
    }
}

export function makeSchemaDefinition(metaFields: IMeta[]): SchemaDefinition {
    if (!metaFields) return {}
    return metaFields.reduce((fields, metaField) => {
        const def = makeFieldDefinition(metaField)
        if (def) fields[metaField.name] = def
        return fields
    }, {})
}

type MakeSchemaOptions<T> = {
    meta: IMeta
    schemaOptions?: Exclude<SchemaOptions, "typeKey">
    mapSchemaDefinition?: (def: SchemaDefinition) => SchemaDefinition
}

export function makeSchemaFromMeta<T = any>({ meta, schemaOptions = {}, mapSchemaDefinition = x => x }: MakeSchemaOptions<T>) {
    if (meta.type === "object" && meta.fields) {
        const def = mapSchemaDefinition(makeSchemaDefinition(meta.fields))
        const schema = new Schema(def, {
            timestamps: true,
            ...schemaOptions,
            typeKey: typeKey,
        })
        schema.pre("validate", function (this: Document, next: any) {
            const validationResult = validateData(this.toJSON(), meta)
            if (validationResult.length) next(MetaValidationError(validationResult))
            else next()
        })
        return schema
    } else {
        return null
    }
}

type MakeModelOptions<T> = MakeSchemaOptions<T> & {
    connection: Connection
}

export function makeModelFromMeta<T = any>(options: MakeModelOptions<T>) {
    const { connection, meta } = options
    if (meta.name in connection.models) {
        delete connection.models[meta.name]
    }
    const schema = makeSchemaFromMeta(options)
    return connection.model<TypedDocument<T>>(meta.name, schema, meta.name)
}

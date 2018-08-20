import {Document,Schema, SchemaDefinition, SchemaOptions} from "mongoose"
import { connection } from "../db";

type ItemOf<T> = T extends Array<infer U>?U:never

export type schemaToType<T> = {
    [k in keyof T]:
        T[k] extends StringConstructor?string:
        T[k] extends NumberConstructor?number:
        T[k] extends DateConstructor?Date:
        T[k] extends BooleanConstructor?boolean:
        T[k] extends Array<infer U>?Array<schemaToType<U>>:
        T[k] extends {
            type:infer U
            [other:string]:any
        }?schemaToType<U>:
        schemaToType<T[k]>
}

export interface TypedDocument<T> extends Document {
    toObject():T,
    toJSON():T,
}

export function model<T>(name:string,def:SchemaDefinition,options?:SchemaOptions){
    return connection.then(connection=>connection.model<TypedDocument<T>>(name,new Schema(def,options),name))
}
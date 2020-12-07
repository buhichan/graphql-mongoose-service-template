import { IMeta } from "./meta";
import { Connection, Document, Schema, SchemaOptions, SchemaDefinition } from "mongoose";
export interface TypedDocument<T> extends Document {
    toObject(): T;
    toJSON(): T;
}
export declare function makeSchemaDefinition(metaFields: IMeta[]): SchemaDefinition;
declare type MakeSchemaOptions<T> = {
    meta: IMeta;
    schemaOptions?: Exclude<SchemaOptions, "typeKey">;
    mapSchemaDefinition?: (def: SchemaDefinition) => SchemaDefinition;
};
export declare function makeSchemaFromMeta<T = any>({ meta, schemaOptions, mapSchemaDefinition }: MakeSchemaOptions<T>): Schema;
declare type MakeModelOptions<T> = MakeSchemaOptions<T> & {
    connection: Connection;
};
export declare function makeModelFromMeta<T = any>(options: MakeModelOptions<T>): import("mongoose").Model<TypedDocument<T>>;
export {};

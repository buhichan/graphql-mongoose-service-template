import { IMeta } from "./meta";
import { Connection, Document, SchemaOptions, SchemaDefinition } from "mongoose";
export interface TypedDocument<T> extends Document {
    toObject(): T;
    toJSON(): T;
}
export declare function makeSchemaDefinition(metaFields: IMeta[]): SchemaDefinition;
declare type MakeModelOptions<T> = {
    connection: Connection;
    meta: IMeta;
    schemaOptions?: Exclude<SchemaOptions, 'typeKey'>;
    mapSchemaDefinition?: (def: SchemaDefinition) => SchemaDefinition;
};
export declare function makeModelFromMeta<T = any>(options: MakeModelOptions<T>): import("mongoose").Model<TypedDocument<T>>;
export {};

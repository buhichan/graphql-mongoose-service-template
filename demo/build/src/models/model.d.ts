import * as joi from "joi";
import { IMeta } from "./meta";
import { Connection, Document } from "mongoose";
export interface TypedDocument<T> extends Document {
    toObject(): T;
    toJSON(): T;
}
export declare const makeMetaModel: (connection: Connection) => import("mongoose").Model<TypedDocument<any>>;
export declare function makeModelFromMeta<T = any>(connection: Connection): (meta: IMeta) => import("mongoose").Model<TypedDocument<T>>;
export declare const metaModelValidations: {
    post: joi.ObjectSchema;
    put: joi.ObjectSchema;
};

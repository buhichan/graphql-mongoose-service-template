import { Schema } from "mongoose";
import { IMetaConstraint } from "./validate";
import { GraphQLFieldResolver } from "graphql";
export declare const mapFieldTypeToMongooseType: {
    "number": typeof Schema.Types.Number;
    "string": typeof Schema.Types.String;
    "boolean": typeof Schema.Types.Boolean;
    "ref": typeof Schema.Types.ObjectId;
    "date": typeof Schema.Types.Date;
    "any": typeof Schema.Types.Mixed;
};
export declare type FieldTypes = keyof typeof mapFieldTypeToMongooseType;
export declare type SimpleFieldTypes = Exclude<FieldTypes, "object" | "ref" | "array">;
declare type BaseMeta = {
    name: string;
    label: string;
    validate?: IMetaConstraint;
    writeonly?: boolean;
    readonly?: boolean;
    defaultValue?: any;
    resolve?: GraphQLFieldResolver<any, any, any>;
    args?: {
        [argName: string]: IMeta;
    };
};
export declare type SimpleFieldMeta = BaseMeta & {
    type: SimpleFieldTypes;
    enum?: string[];
};
export declare type ArrayFieldMeta = BaseMeta & {
    type: "array";
    item: IMeta;
};
export declare type RefFieldMeta = BaseMeta & {
    type: "ref";
    ref: string;
};
export declare type ObjectFieldMeta = BaseMeta & {
    type: "object";
    fields: IMeta[];
};
export declare type IMeta = SimpleFieldMeta | ArrayFieldMeta | RefFieldMeta | ObjectFieldMeta;
export declare const metaOfMeta: ObjectFieldMeta;
export {};

import { Schema } from "mongoose";
import { IMetaConstraint } from "./validate";
export declare const fieldTypes: {
    "number": NumberConstructor;
    "string": StringConstructor;
    "boolean": BooleanConstructor;
    "ref": typeof Schema.Types.ObjectId;
    "array": ArrayConstructor;
    "object": ObjectConstructor;
    "date": DateConstructor;
    "any": typeof Schema.Types.Mixed;
};
export declare type FieldTypes = keyof typeof fieldTypes;
export declare type SimpleFieldTypes = Exclude<FieldTypes, "object" | "ref" | "array">;
export interface IMeta {
    name: string;
    label: string;
    type: FieldTypes;
    fields?: IMeta[];
    item?: IMeta;
    enum?: string[];
    ref?: string;
    validate?: IMetaConstraint;
    readonly?: boolean;
    writeonly?: boolean;
}
export declare const metaOfMeta: IMeta;

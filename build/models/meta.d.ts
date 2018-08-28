import { Schema } from "mongoose";
export declare const fieldTypes: {
    "number": NumberConstructor;
    "string": StringConstructor;
    "boolean": BooleanConstructor;
    "ref": StringConstructor;
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
}
export declare const metaOfMeta: IMeta;

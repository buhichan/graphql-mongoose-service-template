export declare const fieldTypes: {
    "number": NumberConstructor;
    "string": StringConstructor;
    "boolean": BooleanConstructor;
    "ref": StringConstructor;
    "array": ArrayConstructor;
    "object": ObjectConstructor;
    "date": DateConstructor;
};
export declare type FieldTypes = keyof typeof fieldTypes;
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

import { IMeta } from "./meta";
export declare type IMetaConstraint = boolean | {
    anyOf?: IMetaConstraint[];
    allOf?: IMetaConstraint[];
    not?: IMetaConstraint;
    if?: IMetaConstraint;
    then?: IMetaConstraint;
    else?: IMetaConstraint;
    properties?: {
        [name: string]: IMetaConstraint;
    };
    const?: any;
};
export declare const fieldValidator: IMetaConstraint;
export declare function applyMetaValidator(data: any, validate: IMetaConstraint): any;
export declare function MetaValidationError(name: any): void;
export declare function validateData(data: any, meta: IMeta): any;

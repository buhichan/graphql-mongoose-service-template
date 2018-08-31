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
export declare function applyMetaValidator(data: any, validate: IMetaConstraint): boolean;
export declare function MetaValidationError(res: ReturnType<typeof validateData>): void;
export declare function validateData(data: any, meta: IMeta): {
    path: string;
    message: string;
}[];

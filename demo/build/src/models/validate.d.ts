import { IMeta } from "./meta";
export declare type IMetaConstraint = boolean | {
    or?: IMetaConstraint[];
    and?: IMetaConstraint[];
    not?: IMetaConstraint;
    if?: IMetaConstraint;
    then?: IMetaConstraint;
    else?: IMetaConstraint;
    properties?: {
        [name: string]: IMetaConstraint;
    };
    const?: any;
};
export declare const fieldValidator: {
    and: ({
        if: {
            properties: {
                type: {
                    const: string;
                };
            };
        };
        then: {
            properties: {
                item: boolean;
                ref?: undefined;
                fields?: undefined;
            };
        };
    } | {
        if: {
            properties: {
                type: {
                    const: string;
                };
            };
        };
        then: {
            properties: {
                ref: boolean;
                item?: undefined;
                fields?: undefined;
            };
        };
    } | {
        if: {
            properties: {
                type: {
                    const: string;
                };
            };
        };
        then: {
            properties: {
                fields: boolean;
                item?: undefined;
                ref?: undefined;
            };
        };
    })[];
};
export declare function applyMetaValidator(data: any, validate: IMetaConstraint): any;
export declare function MetaValidationError(name: any): void;
export declare function validateData(data: any, meta: IMeta): any;

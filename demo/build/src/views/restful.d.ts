import { IMeta } from "../models/meta";
import { ServerRoute } from "hapi";
import * as joi from "joi";
import { Connection } from "mongoose";
declare type BuildRoutesOptions = {
    meta: IMeta;
    validators: {
        put: joi.AnySchema;
        post: joi.AnySchema;
    };
    connection: Connection;
    routePrefix?: string;
    onSuccess?: (res: any) => any;
    onFail?: (error: Error) => any;
};
export declare function restfulRoutes(options: BuildRoutesOptions): ServerRoute[];
export {};

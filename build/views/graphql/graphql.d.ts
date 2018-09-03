import { IMeta } from "../../models/meta";
import { Request } from "hapi";
import { Connection } from "mongoose";
export declare type CustomTypeDesc<Context> = {
    args?: {
        [name: string]: {
            meta: IMeta;
            defaultValue?: any;
        };
    };
    label?: string;
    returns?: IMeta;
    resolve: (args?: any, req?: Context) => any;
};
export declare type GraphqlPluginOptions<Context = Request> = {
    metas: IMeta[];
    connection: Connection;
    getContext?: (request: Request) => Context;
    queries?: {
        [name: string]: CustomTypeDesc<Context>;
    };
    mutations?: {
        [name: string]: CustomTypeDesc<Context>;
    };
    onMutation?: {
        [mutationName: string]: (args: any, res: any) => void;
    };
};
export declare function makeGraphQLPlugin(options: GraphqlPluginOptions): (import("hapi").PluginBase<{}> & import("hapi").PluginNameVersion & {
    reload: (newOptions: Partial<GraphqlPluginOptions<Request>>) => void;
}) | (import("hapi").PluginBase<{}> & import("hapi").PluginPackage & {
    reload: (newOptions: Partial<GraphqlPluginOptions<Request>>) => void;
});

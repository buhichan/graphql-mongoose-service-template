import { IMeta } from "../../models/meta";
import { Request } from "hapi";
import { Connection } from "mongoose";
export declare type MutationMeta<Context = any, Args = any> = {
    args: {
        [name: string]: {
            meta: IMeta;
            defaultValue?: any;
        };
    };
    label?: string;
    returns?: IMeta;
    resolve: (args?: Args, req?: Context) => any;
};
export declare type GraphqlPluginOptions<Context = Request> = {
    metas: IMeta[];
    connection: Connection;
    getContext?: (request: Request) => Context;
    mutations: {
        [name: string]: MutationMeta<Context>;
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

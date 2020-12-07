import { Request } from "hapi";
import { Connection } from "mongoose";
import { IMeta, ObjectFieldMeta } from "../../models/meta";
export declare type GraphqlPluginOptions<Context = Request> = {
    metas: ObjectFieldMeta[];
    connection: Connection;
    getContext?: (request: Request) => Context;
    queries?: {
        [name: string]: IMeta;
    };
    mutations?: {
        [name: string]: IMeta;
    };
};
export declare function makeGraphQLPlugin(options: GraphqlPluginOptions): (import("hapi").PluginBase<{}> & import("hapi").PluginNameVersion & {
    reload: (newOptions: Partial<GraphqlPluginOptions<Request>>) => void;
}) | (import("hapi").PluginBase<{}> & import("hapi").PluginPackage & {
    reload: (newOptions: Partial<GraphqlPluginOptions<Request>>) => void;
});

import { IMeta } from "../../models/meta";
import { Request } from "hapi";
import { Connection } from "mongoose";
export declare type MutationMeta<Args = any> = {
    args: {
        [name: string]: {
            meta: IMeta;
            defaultValue?: any;
        };
    };
    label?: string;
    returns?: IMeta;
    resolve: (args?: Args, req?: Request) => any;
};
export declare type GraphqlPluginOptions = {
    metas: IMeta[];
    connection: Connection;
    mutations: {
        [name: string]: MutationMeta<any>;
    };
    onMutation?: {
        [mutationName: string]: (args: any, res: any) => void;
    };
};
export declare function makeGraphQLPlugin(options: GraphqlPluginOptions): (import("hapi").PluginBase<{}> & import("hapi").PluginNameVersion & {
    reload: (newOptions: Partial<GraphqlPluginOptions>) => void;
}) | (import("hapi").PluginBase<{}> & import("hapi").PluginPackage & {
    reload: (newOptions: Partial<GraphqlPluginOptions>) => void;
});

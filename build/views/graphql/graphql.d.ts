import { IMeta } from "../../models/meta";
import { Connection } from "mongoose";
declare type CustomMutationMeta<Args extends {
    [name: string]: {
        meta: IMeta;
        defaultValue?: any;
    };
} = {}> = {
    args: Args;
    returns?: IMeta;
    resolve: (args: {
        [name in keyof Args]: any;
    }) => any;
};
export declare type GraphqlPluginOptions = {
    metas: IMeta[];
    connection: Connection;
    mutations: {
        [name: string]: CustomMutationMeta<any>;
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
export {};

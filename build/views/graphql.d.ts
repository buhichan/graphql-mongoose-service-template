import { IMeta } from "../models/meta";
import { GraphQLSchema } from "graphql";
import { Plugin } from "hapi";
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
    }) => any | Promise<any>;
};
declare type GraphqlPluginOptions = {
    metas: IMeta[];
    connection: Connection;
    mutations: {
        [name: string]: CustomMutationMeta<any>;
    };
};
export declare function makeGraphQLSchema(metas: IMeta[], mutationMetas: GraphqlPluginOptions['mutations'], connection: Connection): GraphQLSchema;
export declare function makeGraphQLPlugin(options: GraphqlPluginOptions): Plugin<{}>;
export {};

import { IMeta } from "../models/meta";
import { GraphQLFieldConfigMap } from "graphql";
import { Plugin } from "hapi";
import { Connection } from "mongoose";
declare type GraphqlRoutesOptions = {
    metas: IMeta[];
    connection: Connection;
    mutations: {
        [name: string]: GraphQLFieldConfigMap<void, void>;
    };
};
export declare function makeGraphQLHandler(options: GraphqlRoutesOptions): Plugin<{}>;
export {};

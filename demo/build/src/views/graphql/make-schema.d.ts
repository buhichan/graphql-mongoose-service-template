import { GraphqlPluginOptions } from "./graphql";
import { GraphQLSchema, GraphQLEnumType, GraphQLOutputType, GraphQLFieldConfig, GraphQLInputType } from "graphql";
import { Model } from "mongoose";
import { IMeta } from "../../models/meta";
export declare type TypeMapperContext = {
    getResolver: (metaName: string, path: string[]) => GraphQLFieldConfig<void, void>['resolve'];
    getModel: (metaName: string) => Model<any> | null;
    outputTypeHashMap: Map<string, GraphQLOutputType>;
    inputTypeHashMap: Map<string, GraphQLInputType>;
    enumTypePoll: {
        [name: string]: GraphQLEnumType;
    };
};
export declare function mapMetaToOutputType(field: IMeta, context: TypeMapperContext, path: string[]): GraphQLOutputType | null;
export declare function mapMetaToInputType(meta: IMeta, context: TypeMapperContext, path: string[], operationType: "Any" | "Read" | "Write"): GraphQLInputType | null;
export declare function makeGraphQLSchema(options: GraphqlPluginOptions): GraphQLSchema;

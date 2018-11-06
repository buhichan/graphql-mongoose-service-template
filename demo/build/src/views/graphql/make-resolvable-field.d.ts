import { GraphQLFieldConfigArgumentMap } from "graphql";
import { IMeta } from "../../models/meta";
import { TypeMapperContext } from "./make-schema";
export declare function makeResolvableField<Context>(meta: IMeta, context: TypeMapperContext): {
    type: import("graphql/type/definition").GraphQLOutputType;
    label: string;
    args: GraphQLFieldConfigArgumentMap;
    resolve: (source: any, args: any, context: any, info: any) => Promise<any>;
};

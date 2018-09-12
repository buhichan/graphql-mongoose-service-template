import { GraphQLFieldConfigMap } from "graphql";
import { TypeMapperContext } from "./make-schema";
import { GraphqlPluginOptions } from "./graphql";
export declare function makeCustomTypes<Context>(typeMetas: GraphqlPluginOptions<Context>['mutations'], context: TypeMapperContext, onMutation: GraphqlPluginOptions<Context>['onMutation']): GraphQLFieldConfigMap<void, any>;
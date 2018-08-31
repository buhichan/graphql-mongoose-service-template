import { GraphQLFieldConfigMap, GraphQLBoolean, GraphQLFieldConfigArgumentMap } from "graphql";
import { MetaValidationError, validateData } from "../../models/validate";
import { IMeta } from "../../models/meta";
import { mapMetaToInputType, mapMetaToOutputType, TypeMapperContext } from "./make-schema";
import { GraphqlPluginOptions } from "./graphql";

export function buildCustomMutations<Context,Args>(
    mutationMetas:GraphqlPluginOptions<Context>['mutations'],
    context:TypeMapperContext,
    onMutation:GraphqlPluginOptions<Context>['onMutation']
){
    return Object.keys(mutationMetas).reduce((customMutations,mutationName)=>{
        const mutationMeta = mutationMetas[mutationName]
        customMutations[mutationName] = {
            type:!mutationMeta.returns ? GraphQLBoolean : mapMetaToOutputType(mutationMeta.returns, context, []),
            args:Object.keys(mutationMeta.args).reduce((args,argName)=>{
                const argMeta = mutationMeta.args[argName]
                if(argMeta.meta)
                    args[argName] = {
                        type: mapMetaToInputType(argMeta.meta, context, 'Any'),
                        defaultValue: mutationMeta.args[argName].defaultValue
                    }
                return args
            },{} as GraphQLFieldConfigArgumentMap),
            resolve:async (_,args,context)=>{
                Object.keys(mutationMeta.args).forEach(argName=>{
                    if(!validateData(args[argName],mutationMeta.args[argName].meta)){
                        throw MetaValidationError(argName)
                    }
                })
                const res = await mutationMeta.resolve(args,context)
                if(onMutation[mutationName])
                    await onMutation[mutationName](args,res)
                return res
            }
        }
        return customMutations
    },{} as GraphQLFieldConfigMap<void,any>)
}
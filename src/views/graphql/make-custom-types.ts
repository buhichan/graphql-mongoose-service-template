import { GraphQLFieldConfigMap, GraphQLBoolean, GraphQLFieldConfigArgumentMap } from "graphql";
import { MetaValidationError, validateData } from "../../models/validate";
import { IMeta } from "../../models/meta";
import { mapMetaToInputType, mapMetaToOutputType, TypeMapperContext } from "./make-schema";
import { GraphqlPluginOptions } from "./graphql";

export function makeCustomTypes<Context>(
    typeMetas:GraphqlPluginOptions<Context>['mutations'],
    context:TypeMapperContext,
    onMutation:GraphqlPluginOptions<Context>['onMutation']
){
    return Object.keys(typeMetas).reduce((customTypes,typeName)=>{
        const mutationMeta = typeMetas[typeName]
        const argMetas = mutationMeta.args || {}
        customTypes[typeName] = {
            type:!mutationMeta.returns ? GraphQLBoolean : mapMetaToOutputType(mutationMeta.returns, context, []),
            args:Object.keys(argMetas).reduce((args,argName)=>{
                const argMeta = mutationMeta.args[argName]
                if(argMeta.meta)
                    args[argName] = {
                        type: mapMetaToInputType(argMeta.meta, context, [], 'Any'),
                        defaultValue: mutationMeta.args[argName].defaultValue
                    }
                return args
            },{} as GraphQLFieldConfigArgumentMap),
            resolve:async (_,args,context)=>{
                Object.keys(argMetas).forEach(argName=>{
                    const validationResult = validateData(args[argName],mutationMeta.args[argName].meta)
                    if(validationResult.length)
                        throw MetaValidationError(validationResult)
                })
                const res = await mutationMeta.resolve(args,context)
                if(onMutation && onMutation[typeName])
                    await onMutation[typeName](args,res)
                return res
            }
        }
        return customTypes
    },{} as GraphQLFieldConfigMap<void,any>)
}
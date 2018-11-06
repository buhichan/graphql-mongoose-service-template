import { GraphQLFieldConfigMap, GraphQLBoolean, GraphQLFieldConfigArgumentMap } from "graphql";
import { MetaValidationError, validateData } from "../../models/validate";
import { IMeta } from "../../models/meta";
import { mapMetaToInputType, mapMetaToOutputType, TypeMapperContext } from "./make-schema";

export function makeResolvableField<Context>(
    meta:IMeta,
    context:TypeMapperContext,
){
    const argMetas = meta.args || {}
    return {
        type: mapMetaToOutputType(meta, context, []),
        label:meta.label,
        args:Object.keys(argMetas).reduce((args,argName)=>{
            const argMeta = argMetas[argName]
            if(argMeta)
                args[argName] = {
                    type: mapMetaToInputType(argMeta, context, [], 'Any'),
                    defaultValue: argMeta.defaultValue
                }
            return args
        },{} as GraphQLFieldConfigArgumentMap),
        resolve:async (source,args,context,info)=>{
            Object.keys(argMetas).forEach(argName=>{
                const validationResult = validateData(args[argName],argMetas[argName])
                if(validationResult.length)
                    throw MetaValidationError(validationResult)
            })
            const res = await meta.resolve(source,args,context,info)
            return res
        }
    }
}
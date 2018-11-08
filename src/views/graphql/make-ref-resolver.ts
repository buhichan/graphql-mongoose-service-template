import { TypeMapperContext } from "./make-schema";
import { IMeta, RefFieldMeta } from "../../models/meta";
import { makeBatch } from "./batching";
import { ObjectID } from "bson";

function recursivelyResolveRefField(meta:IMeta,context:TypeMapperContext){
    return async (value):Promise<any>=>{
        if(!value){
            return null
        }else if(meta.type === 'object'){
            return Promise.all(meta.fields.map(child=>{
                return recursivelyResolveRefField(child,context)(value[child.name]).then(childValue=>{
                    value[child.name] = childValue
                })
            })).then(()=>value)
        }else if(meta.type === 'array' && value instanceof Array){
            return Promise.all(value.map(recursivelyResolveRefField(meta.item,context)))
        }else if(meta.type === 'ref' && context.metaMap.has(meta.ref) && ObjectID.isValid(value)){
            const batcher = context.batcherMap.get(meta.ref)
            const resolveNested = recursivelyResolveRefField(context.metaMap.get(meta.ref),context)
            return batcher(value).then(resolveNested)
        }
        return value
    }
}

export function makeRefResolver(meta:RefFieldMeta,context:TypeMapperContext){
    return async (source:any)=>{
        // const path = []
        // let pathP = info.path
        // while(pathP){
        //     path.unshift(pathP.key)
        //     pathP = pathP.prev
        // }
        // const id = deepGet(source,path.slice(2)); // path[0] is modelName, path[1] is index
        const id = source[meta.name]
        if(!context.metaMap.has(meta.ref))
            return id
        return recursivelyResolveRefField(meta,context)(id)
            .then(res=>{
                return res
            })
    }
}
import { TypeMapperContext } from "./make-schema";
import { IMeta } from "../../models/meta";
import { deepGet } from "../..";

function markDeeperResolver(meta:IMeta,context:TypeMapperContext){
    if(meta.type === 'object')
        return (value)=>{
            if(!value)
                return value
            meta.fields.forEach(child=>{
                value[child.name] = markDeeperResolver(child,context)(value[child.name])
            })
            return value
        }
    if(meta.type === 'array')
        return value=>{
            if(value instanceof Array)
                return value.map(markDeeperResolver(meta.item,context))
        }
    if(meta.type === 'ref')
        return value=>{
            if(value === null)
                return null
            if(context.metaMap.has(meta.ref))
                return ()=>resolveRefField(context.metaMap.get(meta.ref), value, context)
            return value
        }
    return value=>value
}

async function resolveRefField(meta:IMeta, id,context:TypeMapperContext){
    if(!id)
        return null
    const model = await context.getModel(meta.name)
    if(!model)
        return null
   
    if(id instanceof Array)
        return model.find({
            _id:{
                $in:String(id)
            }
        }).then(x=>x.map(markDeeperResolver(meta,context)))
    else
        return model.findById(String(id)).then(res=>{
            return res
        }).then(markDeeperResolver(meta,context))
}

export function makeResolver(meta:IMeta,context:TypeMapperContext){
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
        return resolveRefField(context.metaMap.get(meta.ref), id, context)
    }
}
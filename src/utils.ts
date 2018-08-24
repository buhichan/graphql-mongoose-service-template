import { Connection } from "mongoose";

export const noop = ()=>{}

export const identity = x=>x

export const makeModelGetter = (connection:Connection)=>(metaName:string)=>{
    const Model = connection.models[metaName]
    if(!Model)
        return null
    return Model
}

export function pipe(...args:Function[]):any {
    return first=>(
        args && args.length 
        ? args.reduce(
            (result, next) => next(result),
            first
        )
        : first
    );
}

export function deepGet(obj:any, path:string[]){
    let p = obj
    while(path.length > 0){
        const seg = path.shift()
        if(seg && p)
            p = p[seg]
        else
            return null
    }
    return p
}

export function defaultValue(defaultV:any){
    return (v:any)=>{
        return v?v:defaultV
    }
}

export const head = <T>(maybeArr:T[]|T)=>{
    if(maybeArr instanceof Array)
        return maybeArr[0]
    return maybeArr
}

export function deepEqual(a,b){
    if(a instanceof Array)
        return a.every((_,k)=>deepEqual(a[k],b[k]))
    if(typeof a === 'object')
        return Object.keys(a).every(k=>{
            return deepEqual(a[k],b[k])
        })
    return a === b
}
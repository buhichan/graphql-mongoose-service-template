

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

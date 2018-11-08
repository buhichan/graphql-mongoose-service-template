export function makeBatch<A=any,B=any>(batcher:(R:A[])=>Promise<B[]>):(a:A)=>Promise<B>{
    let buffer = []
    let timer
    function trigger(){
        if(!timer){
            timer = setImmediate(flush)
        }
    }
    function flush(){
        const bufferClone = buffer.slice()
        buffer = []
        batcher(bufferClone.map(x=>x.item)).then(res=>{
            bufferClone.forEach((x,i)=>{
                x.resolve(res instanceof Array ? res[i] : res)
            })
        }).catch(err=>{
            bufferClone.forEach(x=>x.reject(err))
        })
        timer = null
    }
    return (item:A)=>{
        return new Promise((resolve,reject)=>{
            buffer.push({
                item,
                resolve,
                reject
            })
            trigger()
        })
    }
}
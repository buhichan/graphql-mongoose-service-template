import {HttpService} from "guguder"

export const Http = new HttpService({
    headers:{
        "Content-Type":"text/plain"
    },
    credentials:"include"
})

Http.afterRequest(async ({res,url,params,config})=>{
    if(!res.ok){
        if(res.status === 404) {
            throw new Error("请求地址不存在")
        }
        else if(res.status === 403) {
            throw new Error("权限不足");
        }
        else{
            const text = await res.text();
            const data = JSON.parse(text)
            throw new Error(data.message as string | "Unknown Error")
        }
    }
    return res
});
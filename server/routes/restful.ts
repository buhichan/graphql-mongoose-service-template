import { IMetaModel } from "../models/meta-model";
import { ServerRoute, Request } from "hapi"
import { pipe, defaultValue, head } from "../../common/utils";
import * as joi from "joi"
import { getModel } from "./utils";

const getQuery = (name:string)=>{
    return (request:Request)=>{
        if(typeof request.query === 'string')
            return null
        return request.query[name]
    }
}

type BuildRoutesOptions = {
    meta:IMetaModel,
    validators:{
        put:joi.AnySchema,
        post:joi.AnySchema,
    },
    routePrefix?:string,
    onSuccess?:(res:any)=>any
    onFail?:(error:Error)=>any
}

const defaultSuccessAction: (res:any)=>any=(res)=>{
    return {
        meta:{
            message:"ok"
        },
        data:res
    }
}

const defaultFailAction = (error:Error)=>{
    console.error(error)
    return {
        meta:{
            message:error.message,
            stack:process.env.NODE_ENV!=='production'?error.stack:undefined
        },
        data:null
    }
}

export function restfulRoutes(options:BuildRoutesOptions):ServerRoute[]{
    const {
        meta,
        validators,
        onSuccess = defaultSuccessAction,
        onFail = defaultFailAction,
        routePrefix = "/"
    } = options
    const afterResponse = (res:Promise<any>)=>{
        return res.then(onSuccess,onFail)
    }
    return [
        {
            path:`${routePrefix}${meta.name}`,
            method:"get",
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const where = meta.fields.reduce((query,k)=>{
                        query[k.name] = getQuery(k.name)(req)
                        return query
                    },{
                        // todo: createdAt
                    })
                    const data = await model.find(where)
                        .limit(
                            pipe(
                                getQuery('limit'),
                                head,
                                parseInt,
                                defaultValue(100)
                            )(req)
                        )
                        .skip(
                            pipe(
                                getQuery('skip'),
                                head,
                                parseInt,
                                defaultValue(100)
                            )(req)
                        )
                    return data
                },
                afterResponse
            )
        },{
            path:`${routePrefix}${meta.name}/{id}`,
            method:"get",
            options:{
                validate:{
                    params:{
                        id: joi.string()
                    }
                }
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.find({
                        id:getQuery("id")(req)
                    })
                    return data
                },
                afterResponse
            )
        },{
            path:`${routePrefix}${meta.name}/{id}`,
            method:"put",
            options:{
                validate:{
                    params:{
                        id: joi.string()
                    },
                    payload:validators.put
                }
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.findOneAndUpdate(req.payload,req.params)
                    return data
                },
                afterResponse
            )
        },{
            path:`${routePrefix}${meta.name}`,
            method:"post",
            options:{
                validate:{
                    payload:validators.post
                }
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.create(req.payload)
                    return data
                },
                afterResponse
            )
        },{
            path:`${routePrefix}${meta.name}/{id}`,
            method:"delete",
            options:{
                validate:{
                    params:{
                        id: joi.string()
                    }
                }
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.findOneAndRemove(req.params)
                    return data
                },
                afterResponse
            )
        }
    ]
}

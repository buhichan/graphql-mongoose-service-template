import { IMeta, ObjectFieldMeta } from "../models/meta";
import { ServerRoute, Request } from "hapi"
import { pipe, defaultValue, head } from "../utils";
import * as joi from "joi"
import { makeModelGetter } from "../utils";
import { Connection } from "mongoose";

const getQuery = (name:string)=>{
    return (request:Request)=>{
        if(typeof request.query === 'string')
            return null
        return request.query[name]
    }
}

type BuildRoutesOptions = {
    meta:IMeta,
    validators:{
        put:joi.AnySchema,
        post:joi.AnySchema,
    },
    connection:Connection,
    routePrefix?:string,
    onSuccess?:(res:any)=>any
    onFail?:(error:Error)=>any
}

const defaultSuccessAction: (res:any)=>any=(res)=>{
    return {
        message:"ok",
        data:res
    }
}

const defaultFailAction = (error:Error)=>{
    console.error(error)
    return {
        message:error.message,
        stack:process.env.NODE_ENV!=='production'?error.stack:undefined,
        data:null
    }
}

export function restfulRoutes(options:BuildRoutesOptions):ServerRoute[]{
    const {
        meta,
        connection,
        validators,
        onSuccess = defaultSuccessAction,
        onFail = defaultFailAction,
        routePrefix = "/"
    } = options
    const afterResponse = (res:Promise<any>)=>{
        return res.then(onSuccess,onFail)
    }
    const failAction = (_,__,err)=>{
        console.error(err)
        throw err
    }
    const getModel = makeModelGetter(connection)
    return [
        {
            path:`${routePrefix}${meta.name}`,
            method:"get",
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const where = (meta as ObjectFieldMeta).fields.reduce((query,k)=>{
                        const field = getQuery(k.name)(req)
                        if(field !== undefined)
                            query[k.name] = field
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
                                defaultValue(0)
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
                    },
                    failAction
                }
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.findById(head(getQuery("id")(req)))
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
                    payload:validators.put,
                    failAction
                },
                response:{
                    failAction
                },
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.findByIdAndUpdate(req.params.id,req.payload)
                    return data
                },
                afterResponse
            )
        },{
            path:`${routePrefix}${meta.name}`,
            method:"post",
            options:{
                validate:{
                    payload:validators.post,
                    failAction
                },
                response:{
                    failAction
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
                    },
                    failAction
                },
                response:{
                    failAction
                }
            },
            handler:pipe(
                async (req)=>{
                    const model = await getModel(meta.name)
                    const data = await model.findByIdAndRemove(req.params.id)
                    return data
                },
                afterResponse
            )
        }
    ]
}

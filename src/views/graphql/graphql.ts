import { IMeta } from "../../models/meta";
import { GraphQLSchema,graphql} from "graphql";
import { Plugin,Request } from "hapi";
import { Connection } from "mongoose";
import { makeGraphQLSchema } from "./make-schema";

export type GraphqlPluginOptions<Context=Request> = {
    metas:IMeta[],
    connection:Connection,
    getContext?:(request:Request)=>Context
    mutations:{
        [name:string]:{
            args:{
                [name:string]:{
                    meta:IMeta,
                    defaultValue?:any
                }
            },
            label?:string,
            returns?:IMeta,
            resolve:(args?:any,req?:Context)=>any
        }
    },
    onMutation?:{
        [mutationName:string]:(args:any,res:any)=>void
    }
}


export function makeGraphQLPlugin(options:GraphqlPluginOptions){
    let schema:GraphQLSchema
    function reload(newOptions:Partial<GraphqlPluginOptions>){
        const finalOptions = {
            ...options,
            ...newOptions
        }
        schema = makeGraphQLSchema(finalOptions)
    }
    reload(options)
    return {
        name:"graphql-mongoose",
        register:server=>server.route([
            {
                path:`/graphql`,
                method:"post",
                handler:async (request)=>{
                    const {variables,query} = request.payload as any
                    const context = options.getContext ? options.getContext(request) : request
                    return graphql(schema,query,null,context,variables)
                }
            }
        ]),
        reload
    } as Plugin<{}> & {
        reload:typeof reload
    }
}
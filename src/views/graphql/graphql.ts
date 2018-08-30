import { IMeta } from "../../models/meta";
import { GraphQLSchema,graphql} from "graphql";
import { Plugin,Request } from "hapi";
import { Connection } from "mongoose";
import { makeGraphQLSchema } from "./make-schema";

export type MutationMeta<Args=any> = {
    args:{
        [name:string]:{
            meta:IMeta,
            defaultValue?:any
        }
    },
    label?:string,
    returns?:IMeta,
    resolve:(args?:Args,req?:Request)=>any
}

export type GraphqlPluginOptions = {
    metas:IMeta[],
    connection:Connection,
    mutations:{
        [name:string]:MutationMeta<any>
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
                    return graphql(schema,query,null,request,variables)
                }
            }
        ]),
        reload
    } as Plugin<{}> & {
        reload:typeof reload
    }
}
import { IMeta } from "../../models/meta";
import { GraphQLSchema,graphql} from "graphql";
import { Plugin } from "hapi";
import { Connection } from "mongoose";
import { makeGraphQLSchema } from "./make-schema";

type CustomMutationMeta<Args extends {
    [name:string]:{
        meta:IMeta,
        defaultValue?:any
    }
} = {}> = {
    args:Args,
    returns?:IMeta,
    resolve:(args:{[name in keyof Args]:any})=>any
}

export type GraphqlPluginOptions = {
    metas:IMeta[],
    connection:Connection,
    mutations:{
        [name:string]:CustomMutationMeta<any>
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
                handler:async (req)=>{
                    // console.log("currentSchemaTypes",Object.keys(schema.getTypeMap()))
                    return graphql(schema,(req.payload as any).query,null,null,(req.payload as any).variables)
                }
            }
        ]),
        reload
    } as Plugin<{}> & {
        reload:typeof reload
    }
}
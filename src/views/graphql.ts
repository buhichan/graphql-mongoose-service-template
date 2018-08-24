import { IMeta } from "../models/meta";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, graphql, GraphQLType, GraphQLBoolean, GraphQLID, GraphQLOutputType, GraphQLFieldConfig, GraphQLInputType, isInputType, GraphQLInputObjectType, GraphQLFieldConfigArgumentMap } from "graphql";
import { Plugin } from "hapi";
import { Connection, Model } from "mongoose";
import { deepGet,makeModelGetter } from "../utils";
// import { GraphQLSchemaConfig } from "graphql/type/schema";

type CustomMutationMeta<Args extends {
    [name:string]:{
        meta:IMeta,
        defaultValue?:any
    }
} = {}> = {
    args:Args,
    returns?:IMeta,
    resolve:(args:{[name in keyof Args]:any})=>any|Promise<any>
}

type GraphqlPluginOptions = {
    metas:IMeta[],
    connection:Connection,
    mutations:{
        [name:string]:CustomMutationMeta<any>
    }
}

type TypeMapperContext = {
    getResolver:(metaName:string, path: string[])=>GraphQLFieldConfig<void,void>['resolve'],
    getModel:(metaName:string)=>Model<any> | null
    outputObjectTypePool:{[name:string]:GraphQLOutputType}
    inputObjectTypePool:{[name:string]:GraphQLInputType}
    enumTypePoll:{[name:string]:GraphQLEnumType}
}

function capitalize(str:string){
    if(!str)
        return str
    return str[0].toUpperCase()+str.slice(1)
}


function mapMetaToField(fieldMeta:IMeta,context:TypeMapperContext,path:string[]){
    const field:GraphQLFieldConfig<void,void> = {
        type:mapMetaToOutputType(fieldMeta, context, path)
    }
    if(fieldMeta.type === 'ref'){
        field.resolve = context.getResolver(fieldMeta.ref,path)
    }
    if(fieldMeta.type === 'array' && fieldMeta.item.type === 'ref'){
        field.resolve = context.getResolver(fieldMeta.item.ref,path)
    }
    return field
}

function mapMetaToOutputType(field:IMeta,context:TypeMapperContext,path:string[]):GraphQLOutputType{
    switch(true){
        case (field.enum instanceof Array && field.enum.length > 0):{
            if(!context.enumTypePoll[field.name]){
                context.enumTypePoll[field.name] = new GraphQLEnumType({
                    name:path.join("_")+field.name,
                    values:field.enum.reduce((enums,v)=>({...enums,[v]:{value:v}}),{})
                })
            }
            return context.enumTypePoll[field.name]
        }
        case field.type==="date": return GraphQLString
        case field.type==="number": return GraphQLInt
        case field.type==="ref" && field.ref in context.outputObjectTypePool:{
            return context.outputObjectTypePool[field.ref]
        }
        case field.type==="boolean": return GraphQLBoolean
        case field.type==="array": return new GraphQLList(mapMetaToOutputType(field.item,context,path.concat(field.name)))
        case field.type==="object" && field.fields instanceof Array && field.fields.length > 0: {
            if(!context.outputObjectTypePool[field.name])
                context.outputObjectTypePool[field.name] = new GraphQLObjectType({
                    name:path.join("_")+field.name,
                    fields:()=>field.fields.reduce((fields,childMeta)=>{
                        const child = mapMetaToField(childMeta,context,path.concat(childMeta.name))
                        if(child)
                            fields[childMeta.name]=child
                        return fields
                    },{} as GraphQLFieldConfigMap<void,void>)
                })
            return context.outputObjectTypePool[field.name]
        }
        default: 
            return GraphQLString //includes string and ref
    }
}

function mapMetaToInputType(meta:IMeta,context:TypeMapperContext):GraphQLInputType{
    if(meta.type === 'ref')
        return GraphQLString
    else if(meta.type==='object'){
        if(!context.inputObjectTypePool[meta.name])
            context.inputObjectTypePool[meta.name] = new GraphQLInputObjectType({
                name:"_"+meta.name,
                fields:()=>meta.fields.reduce((inputFields,fieldMeta)=>{
                    const converted = mapMetaToInputType(fieldMeta, context)
                    if(converted)
                        inputFields[fieldMeta.name] = {
                            type:converted,
                        }
                    return inputFields
                },{})
            })

        return context.inputObjectTypePool[meta.name]
    }
    else if(meta.type==='array')
        return new GraphQLList(mapMetaToInputType(meta.item,context))
        
    const type = mapMetaToOutputType(meta, context, [])
    if(isInputType(type))
        return type
    else 
        return null
}

export function makeGraphQLSchema(metas:IMeta[],mutationMetas:GraphqlPluginOptions['mutations'],connection:Connection){
    const getModel = makeModelGetter(connection)
    const getResolver:TypeMapperContext['getResolver'] = (refName,path)=>{
        return async (source)=>{
            const id = deepGet(source,path)
            if(!id)
                return null
            const model = await getModel(refName)
            if(!model)
                return null
            if(id instanceof Array)
                return model.find({
                    id:{
                        $in:id
                    }
                })
            else
                return model.findById(id)
        }
    }
    const context:TypeMapperContext = {
        getModel,
        getResolver,
        enumTypePoll:{},
        inputObjectTypePool:{},
        outputObjectTypePool:{}
    }
    metas = metas.filter(x=>x.type==="object").map(modelMeta=>{
        if(!modelMeta.fields.some(x=>x.name==="_id"))
            return {
                ...modelMeta,
                fields:[
                    {
                        name:"_id",
                        type:"string",
                        label:"id"
                    } as IMeta,
                    ...modelMeta.fields,
                ]
            }
        return modelMeta
    })
    const rootTypes = metas.map(modelMeta=>{
        return mapMetaToOutputType(modelMeta,context,[]) as GraphQLObjectType
    })
    const customMutations = Object.keys(mutationMetas).reduce((mutations,mutationName)=>{
        const mutationMeta = mutationMetas[mutationName]
        mutations[mutationName] = {
            type:!mutationMeta.returns ? GraphQLBoolean : mapMetaToOutputType(mutationMeta.returns, context, []),
            args:Object.keys(mutationMeta.args).reduce((args,argName)=>{
                const argMeta = mutationMeta.args[argName]
                args[argName] = {
                    type: mapMetaToInputType(argMeta.meta, context),
                    defaultValue: mutationMeta.args[argName].defaultValue
                }
                return args
            },{} as GraphQLFieldConfigArgumentMap),
            resolve:(_,args)=>{
                return mutationMeta.resolve(args)
            }
        }
        return mutations
    },{} as GraphQLFieldConfigMap<void,void>)
    const schema = new GraphQLSchema({
        query:new GraphQLObjectType({
            name:"Root",
            fields:rootTypes.reduce((query,type)=>{
                query[type.name] = {
                    type:new GraphQLList(type),
                    resolve:async (source,args,context,info)=>{
                        const model = await getModel(type.name)
                        if(!model)
                            return []
                        else
                            return model.find(args)
                    }
                }
                return query
            },{} as GraphQLFieldConfigMap<any,any>),
        }),
        types:rootTypes,
        mutation:new GraphQLObjectType({
            name:"Mutation",
            fields:{
                ...metas.reduce((mutations,meta)=>{
                    const modelType = context.outputObjectTypePool[meta.name]
                    const convertedInputType = mapMetaToInputType(meta,context)
                    mutations['add'+capitalize(meta.name)] = {
                        type:modelType,
                        args:{
                            payload:{
                                type:convertedInputType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            return model.create(args.payload)
                        }
                    }
                    mutations['update'+capitalize(meta.name)] = {
                        type:modelType,
                        args:{
                            condition:{
                                type:convertedInputType
                            },
                            payload:{
                                type:convertedInputType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            return model.update(args.condition,args.payload).exec()
                        }
                    }
                    mutations['delete'+capitalize(meta.name)] = {
                        type:GraphQLInt,
                        args:{
                            condition:{
                                type:convertedInputType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            const res = await model.remove(args.condition).exec()
                            return res ? res.n : 0
                        }
                    }
                    return mutations
                },{}),
                ...customMutations
            }
        })
    })
    return schema
}

export function makeGraphQLPlugin(options:GraphqlPluginOptions){
    const {metas,mutations,connection} = options
    let schema:GraphQLSchema = makeGraphQLSchema(metas,mutations,connection)
    return {
        name:"graphql",
        register:server=>server.route([
            {
                path:`/graphql`,
                method:"post",
                handler:async (req)=>{
                    return graphql(schema,(req.payload as any).query)
                }
            }
        ])
    } as Plugin<{}>
}
import { IMeta } from "../models/meta";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, graphql, GraphQLType, GraphQLBoolean, GraphQLID, GraphQLOutputType, GraphQLFieldConfig, GraphQLInputType, isInputType, GraphQLInputObjectType } from "graphql";
import { makeModelGetter } from "./utils";
import { Plugin } from "hapi";
import { Connection } from "mongoose";
// import { GraphQLSchemaConfig } from "graphql/type/schema";

type GraphqlRoutesOptions = {
    metas:IMeta[],
    connection:Connection,
    mutations:{
        [name:string]:GraphQLFieldConfigMap<void,void>
    }
}

type GraphQLTypeMapperContext = {
    getRef:(name:string, getValue: GraphQLTypeMapperContext['getValue'])=>GraphQLFieldConfig<void,void>,
    getValue:(model:any)=>any
}

function capitalize(str:string){
    if(!str)
        return str
    return str[0].toUpperCase()+str.slice(1)
}

function mapToGraphQLType(metaName:string,fields:IMeta[], context:GraphQLTypeMapperContext){
    const buildField=(field:IMeta):GraphQLFieldConfig<void,void>=>{
        const fieldName = metaName+capitalize(field.name)
        const currentContext = {
            getRef:context.getRef,
            getValue:x=>context.getValue(x)[field.name]
        }
        switch(true){
            case (field.enum instanceof Array && field.enum.length > 0):{
                return {
                    type:new GraphQLEnumType({
                        name:fieldName,
                        values:field.enum.reduce((enums,v)=>({...enums,[v]:{value:v}}),{})
                    })
                }
            }
            case field.type==="date": return {type:GraphQLInt}
            case field.type==="number": return {type:GraphQLInt}
            case field.type==="boolean": return {type:GraphQLBoolean}
            case field.type==="ref": return context.getRef(field.ref,currentContext.getValue)
            case field.type==="array": {
                return {
                    type:new GraphQLList(buildField(field.item).type)
                }
            }
            case field.type==="object": {
                return {
                    type:new GraphQLObjectType({
                        name:fieldName,
                        fields:mapToGraphQLType(fieldName,field.fields, currentContext)
                    })
                }
            }
            default: return {
                type: GraphQLString
            }
        }
    }
    return fields.reduce((fields,def)=>{
        const field = buildField(def)
        if(field && field.type)
            fields[def.name]=field
        return fields
    },{} as GraphQLFieldConfigMap<void,void>)
}

const inputObjectTypeMap = {}
function convertToInputType(type:GraphQLType):GraphQLInputType{
    if(isInputType(type))
        return type
    else if(type instanceof GraphQLList)
        return new GraphQLList(convertToInputType(type.ofType))
    else if(type instanceof GraphQLObjectType){
        const fields = type.getFields()
        if(!inputObjectTypeMap[type.name])
            inputObjectTypeMap[type.name] = new GraphQLInputObjectType({
                name:"_"+type.name,
                fields:Object.keys(fields).reduce((inputFields,fieldName)=>{
                    const converted = convertToInputType(fields[fieldName].type)
                    if(converted)
                        inputFields[fieldName] = {
                            type:converted,
                        }
                    return inputFields
                },{})
            })
        return inputObjectTypeMap[type.name]
    }else
        return null
}

function buildGraphQLSchema(rootTypes:GraphQLObjectType[],connection:Connection){
    const getModel = makeModelGetter(connection)
    return new GraphQLSchema({
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
            fields:rootTypes.reduce((mutations,type)=>{
                const convertedInputType = convertToInputType(type)
                mutations['add'+capitalize(type.name)] = {
                    type:type,
                    args:{
                        payload:{
                            type:convertedInputType
                        }
                    },
                    resolve:async (source,args,context,info)=>{
                        const model = await getModel(type.name)
                        return model.create(args.payload)
                    }
                }
                mutations['update'+capitalize(type.name)] = {
                    type:type,
                    args:{
                        condition:{
                            type:convertedInputType
                        },
                        payload:{
                            type:convertedInputType
                        }
                    },
                    resolve:async (source,args,context,info)=>{
                        const model = await getModel(type.name)
                        return model.update(args.condition,args.payload).exec()
                    }
                }
                mutations['delete'+capitalize(type.name)] = {
                    type:GraphQLInt,
                    args:{
                        condition:{
                            type:convertedInputType
                        }
                    },
                    resolve:async (source,args,context,info)=>{
                        const model = await getModel(type.name)
                        const res = await model.remove(args.condition).exec()
                        return res ? res.n : 0
                    }
                }
                return mutations
            },{})
        })
    })
}

export function makeGraphQLHandler(options:GraphqlRoutesOptions){
    const {metas,connection} = options
    const getModel = makeModelGetter(connection)
    const rootTypes = metas.map(modelMeta=>{
        return new GraphQLObjectType({
            name:modelMeta.name,
            fields:()=>{
                return {
                    _id:{type:GraphQLString},
                    ...mapToGraphQLType(modelMeta.name,modelMeta.fields,{
                        getValue:x=>x,
                        getRef:(refName,getValue)=>{
                            const type = rootTypes.find(x=>x.name===refName)
                            if(!type)
                                return null
                            else return {
                                type,
                                resolve:async (source)=>{
                                    const id = getValue(source)
                                    if(!id)
                                        return null
                                    const model = await getModel(refName)
                                    return model.findById(id)
                                }
                            }
                        }
                    })
                }
            }
        })
    })
    
    let schema:GraphQLSchema = buildGraphQLSchema(rootTypes,connection)
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
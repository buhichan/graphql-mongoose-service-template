import { IMetaModel, IMetaModelField } from "../models/meta-model";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, graphql, GraphQLType, GraphQLBoolean } from "graphql";
import { getModel } from "./utils";
// import { GraphQLSchemaConfig } from "graphql/type/schema";

type GraphqlRoutesOptions = {
    metas:IMetaModel[],
    mutations:GraphQLObjectType
}

function mapToGraphQLType(fields:IMetaModelField[], addType:(field:IMetaModelField)=>GraphQLType){
    const findType=(field:IMetaModelField)=>{
        switch(field.type){
            case "date": return GraphQLInt
            case "number": return GraphQLInt
            case "boolean": return GraphQLBoolean
            case "array": {
                const type = addType(field)
                return new GraphQLList(type)
            }
            case "object": {
                return new GraphQLObjectType({
                    name:field.name,
                    fields:mapToGraphQLType(field.children as any, addType)
                })
            }
            default: return GraphQLString
        }
    }
    return fields.reduce((fields,def)=>{
        fields[def.name]={
            type:findType(def)
        }
        return fields
    },{} as GraphQLFieldConfigMap<any,any>)
}

export function graphqlRoutes(options:GraphqlRoutesOptions){
    const {metas} = options
    const types = metas.reduce((types,x)=>{
        const addType = (child)=>{
            const newType = new GraphQLObjectType({
                name:child===x?x.name:x.name+"_"+child.name,
                fields:mapToGraphQLType(child.fields || child.children, addType)
            })
            types.push(newType)
            return newType
        }
        addType(x)
        return types
    },[])
    const schemaDef = {
        query:new GraphQLObjectType({
            name:"Root",
            fields:types.reduce((query,type)=>{
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
        types:types
    }
    try{
        const schema = new GraphQLSchema(schemaDef)
        return [
            {
                path:`/graphql`,
                method:"post",
                handler:async (req)=>{
                    return graphql(schema,req.payload.query)
                }
            }
        ]
    }catch(e){
        return [
            {
                path:`/graphql`,
                method:"post",
                handler:async (_)=>{
                    return {
                        message:e.message,
                        stack:e.stack,
                    }
                }
            }
        ]
    }
}
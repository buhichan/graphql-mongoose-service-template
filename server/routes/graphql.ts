import { IMetaModel, IMetaModelField } from "../models/meta";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, graphql, GraphQLType, GraphQLBoolean, GraphQLID, GraphQLOutputType, GraphQLFieldConfig } from "graphql";
import { getModel } from "./utils";
// import { GraphQLSchemaConfig } from "graphql/type/schema";

type GraphqlRoutesOptions = {
    metas:IMetaModel[],
    mutations:GraphQLObjectType
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

function mapToGraphQLType(metaName:string,fields:IMetaModelField[], context:GraphQLTypeMapperContext){
    const buildField=(field:IMetaModelField):GraphQLFieldConfig<void,void>=>{
        const fieldName = metaName+capitalize(field.name)
        const currentContext = {
            getRef:context.getRef,
            getValue:x=>context.getValue(x)[field.name]
        }
        switch(field.type){
            case "date": return {type:GraphQLInt}
            case "number": return {type:GraphQLInt}
            case "boolean": return {type:GraphQLBoolean}
            case "enum1": return {type:new GraphQLEnumType({
                name:fieldName,
                values:field.enum.reduce((map,x)=>({...map,[x]:{value:x}}),{})
            })}
            case "list":return {type:new GraphQLList(GraphQLString)}
            case "ref": return context.getRef(field.ref,currentContext.getValue)
            case "array": {
                const type = new GraphQLObjectType({
                    name:fieldName,
                    fields:mapToGraphQLType(fieldName,field.children, currentContext)
                })
                return {
                    type:new GraphQLList(type)
                }
            }
            case "object": {
                return {
                    type:new GraphQLObjectType({
                        name:fieldName,
                        fields:mapToGraphQLType(fieldName,field.children, currentContext)
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

export function graphqlRoutes(options:GraphqlRoutesOptions){
    const {metas} = options
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
    const schemaDef = {
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
        types:rootTypes
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
import { GraphqlPluginOptions } from "./graphql";
import { makeModelGetter, deepGet } from "../../utils";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, graphql, GraphQLType, GraphQLBoolean, GraphQLID, GraphQLOutputType, GraphQLFieldConfig, GraphQLInputType, isInputType, GraphQLInputObjectType, GraphQLFieldConfigArgumentMap, GraphQLNonNull } from "graphql";
import { Model } from "mongoose";
import { IMeta, metaOfMeta } from "../../models/meta";
import { GraphQLAny } from "./type/any";
import { validateData } from "../../models/validate";
import { makeCustomTypes } from "./make-custom-types";


export type TypeMapperContext = {
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


function mapMetaToField(fieldMeta:IMeta&{resolve?:(args:any,context:any)=>any},context:TypeMapperContext,path:string[]){
    const field:GraphQLFieldConfig<void,void> = {
        type:mapMetaToOutputType(fieldMeta, context, path),
        description:fieldMeta.label
    }
    if(!fieldMeta.type)
        return null
    if(fieldMeta.type === 'ref' && fieldMeta.ref){
        field.resolve = context.getResolver(fieldMeta.ref,path.slice(1).concat(fieldMeta.name))
    }
    else if(fieldMeta.type === 'array' && fieldMeta.item && fieldMeta.item.type === 'ref' && fieldMeta.item.ref){
        field.resolve = context.getResolver(fieldMeta.item.ref,path.slice(1).concat(fieldMeta.name))
    }
    else if(fieldMeta.resolve)
        field.resolve = (_,args,context)=>fieldMeta.resolve(args,context)
    return field
}

//path不包括field.name
export function mapMetaToOutputType(field:IMeta,context:TypeMapperContext,path:string[]):GraphQLOutputType|null{
    switch(true){
        case !field:
            return null
        case field.name === "_id":
            return GraphQLID
        case ('enum' in field && field.enum instanceof Array && field.enum.length > 0):{
            const enumList:string[] = field['enum'];
            if(!context.enumTypePoll[field.name]){
                context.enumTypePoll[field.name] = new GraphQLEnumType({
                    name:path.concat(field.name).join("__"),
                    values:enumList.reduce((enums,v)=>({...enums,[v]:{value:v}}),{})
                })
            }
            return context.enumTypePoll[field.name]
        }
        case field.type==="any": return GraphQLAny
        case field.type==="date": return GraphQLString
        case field.type==="number": return GraphQLInt
        case field.type==="ref" && field.ref in context.outputObjectTypePool:{
            return context.outputObjectTypePool[field.ref]
        }
        case field.type==="boolean": return GraphQLBoolean
        case field.type==="array": {
            const item = mapMetaToOutputType(field.item,context,path.concat(field.name))
            if(!item)
                return null
            return new GraphQLList(item)
        }
        case field.type==="object" && field.fields instanceof Array && field.fields.length > 0: {
            if(!context.outputObjectTypePool[field.name])
                context.outputObjectTypePool[field.name] = new GraphQLObjectType({
                    name:path.concat(field.name).join("__"),
                    description:field.label,
                    fields:()=>field.fields.reduce((fields,childMeta)=>{
                        const child = mapMetaToField(childMeta,context,path.concat(field.name))
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

export function mapMetaToInputType(meta:IMeta,context:TypeMapperContext,operationType:"Any"|"Read"|"Write"):GraphQLInputType|null{
    if(!meta)
        return null
    if(meta.readonly && operationType === 'Write')
        return null
    if(meta.writeonly && operationType === 'Read')
        return null
    if(meta.type === "ref")
        return GraphQLString
    if(meta.type==='object'){
        const inputObjectTypeName = operationType + capitalize(meta.name)
        if(!context.inputObjectTypePool[inputObjectTypeName])
            context.inputObjectTypePool[inputObjectTypeName] = new GraphQLInputObjectType({
                name:inputObjectTypeName,
                fields:()=>meta.fields.reduce((inputFields,fieldMeta)=>{
                    const converted = mapMetaToInputType(fieldMeta, context,operationType)
                    if(converted)
                        inputFields[fieldMeta.name] = {
                            type:converted,
                            description:fieldMeta.label
                        }
                    return inputFields
                },{})
            })
        return context.inputObjectTypePool[inputObjectTypeName]
    }
    else if(meta.type==='array'){
        const item = mapMetaToInputType(meta.item,context,operationType)
        if(!item)
            return null
        return new GraphQLList(item)
    }
        
    const type = mapMetaToOutputType(meta, context, [])
    if(isInputType(type))
        return type
    else 
        return null
}


const sortEnumType = new GraphQLEnumType({
    name:"SortDirection",
    values:{
        asc:{value:1,description:"升序"},
        desc:{value:-1,description:"降序"}
    }
})

function makeQueryArgs(meta:IMeta,context:TypeMapperContext){
    const indexableFields = meta.fields.filter(x=>{
        return ['number','string','date'].includes(x.type) && x.name !== "_id"
    })
    const queryArgs:GraphQLFieldConfigArgumentMap = {
        search:{
            type:GraphQLAny,
            description:"搜索条件, 支持mongodb操作符, 但需要把$替换为_",
            defaultValue:{}
        },
        limit:{
            type:GraphQLInt
        },
        skip:{
            type:GraphQLInt,
            defaultValue:0
        }
    }

    if(indexableFields.length){
        queryArgs.sort = {
            type:new GraphQLInputObjectType({
                name:"_"+meta.name+"_sort",
                fields:indexableFields.reduce((fields,fieldMeta)=>{
                    fields[fieldMeta.name] = {
                        type:sortEnumType
                    }
                    return fields
                },{})
            })
        }
    }
    return queryArgs
}

function convertSearchToFindOptions(search:any){
    if(search != undefined && !(search instanceof Array) && typeof search === 'object')
        return Object.keys(search).reduce((findOptions,name)=>{
            let newName = name
            if(name.startsWith("_") && name !== "_id")
                newName = "$"+name.slice(1)
            findOptions[newName] = convertSearchToFindOptions(search[name])
            return findOptions
        },{})
    return search
}

export function makeGraphQLSchema(options:GraphqlPluginOptions){
    let {
        connection,
        metas,
        mutations:mutationMetas = {},
        queries:queryMetas = {},
        onMutation = {},
    } = options
    options.metas.forEach(meta=>{
        if(!validateData(meta,metaOfMeta))
            throw new Error("Invalid meta: "+meta.name)
    })
    const getModel = makeModelGetter(connection)
    const getResolver:TypeMapperContext['getResolver'] = (refName,path)=>{
        return async (source)=>{
            const id = deepGet(source,path); // path[0] is modelName, which is useless.
            if(!id)
                return null
            const model = await getModel(refName)
            if(!model)
                return null
            if(id instanceof Array)
                return model.find({
                    _id:{
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
    const internalFields:IMeta[] = [
        {
            name:"_id",
            label:"ID",
            type:"string",
            readonly:true
        },
        {
            name:"createdAt",
            label:"创建时间",
            type:"date",
            readonly:true
        },{
            name:"updatedAt",
            label:"更新时间",
            type:"date",
            readonly:true
        }
    ]
    metas = metas.filter(x=>x && x.type==="object").map(modelMeta=>{
        return {
            ...modelMeta,
            fields:[
                ...modelMeta.fields,
                ...internalFields.filter(x=>!modelMeta.fields.some(y=>y.name === x.name))
            ]
        }
    })
    const rootTypes = metas.map(modelMeta=>{
        return mapMetaToOutputType(modelMeta,context,[]) as GraphQLObjectType
    })

    const IDType = new GraphQLNonNull(GraphQLID)

    const metaTypeQueries = rootTypes.reduce((query,type)=>{
        const meta = metas.find(x=>x.name === type.name)
        const resolve = async (source,args,context,info)=>{
                const model = await getModel(type.name)
                if(!model)
                    return []
                else {
                    const findCondition = convertSearchToFindOptions(args.search)
                    const query = model.find(findCondition)
                        .sort(args.sort)
                        .skip(args.skip)
                    if(args.limit)
                        return query.limit(args.limit)
                    return query
                }
            }
        query[type.name] = {
            type:new GraphQLList(type),
            description:meta.label,
            args:makeQueryArgs(meta,context),
            resolve
        }
        return query
    },{} as GraphQLFieldConfigMap<any,any>)

    const schema = new GraphQLSchema({
        query:new GraphQLObjectType({
            name:"Root",
            fields:{
                ...metaTypeQueries,
                ...makeCustomTypes(queryMetas, context, {}),
            },
        }),
        types:rootTypes,
        mutation:new GraphQLObjectType({
            name:"Mutation",
            fields:{
                ...metas.reduce((mutations,meta)=>{
                    const modelType = context.outputObjectTypePool[meta.name]
                    const modelReadType = new GraphQLNonNull(mapMetaToInputType(meta,context,'Read'))
                    const modelWriteType = new GraphQLNonNull(mapMetaToInputType(meta, context, 'Write'))
                    const addModelMutationName = 'add'+capitalize(meta.name)
                    mutations[addModelMutationName] = {
                        type:modelType,
                        args:{
                            payload:{
                                type:modelWriteType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            const res = await model.create(args.payload)
                            if(onMutation[addModelMutationName])
                                await onMutation[addModelMutationName](args,res)
                            return res
                        }
                    }
                    const updateModelMutationName = 'update'+capitalize(meta.name)
                    mutations[updateModelMutationName] = {
                        type:modelType,
                        args:{
                            _id:{
                                type:IDType,
                            },
                            payload:{
                                type:modelWriteType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            const res = await model.findByIdAndUpdate(args._id,args.payload,{
                                new:true
                            }).exec()
                            if(onMutation[updateModelMutationName])
                                await onMutation[updateModelMutationName](args,res)
                            return res
                        }
                    }
                    const updateManyModelMutationName = 'updateMany'+capitalize(meta.name)
                    mutations[updateManyModelMutationName] = {
                        type:GraphQLInt,
                        args:{
                            condition:{
                                type:modelReadType
                            },
                            payload:{
                                type:modelWriteType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            const updateResult = await model.updateMany(args.condition,args.payload).exec()
                            const res = updateResult ? updateResult.n : 0
                            if(onMutation[updateModelMutationName])
                                await onMutation[updateModelMutationName](args,res)
                            return res
                        }
                    }
                    const deleteModelMutationName = 'delete'+capitalize(meta.name)
                    mutations[deleteModelMutationName] = {
                        type:GraphQLInt,
                        args:{
                            _id:{
                                type:IDType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            const res = await model.findByIdAndRemove(args._id).exec()
                            if(onMutation[deleteModelMutationName])
                                await onMutation[deleteModelMutationName](args,res)
                            return !!res?1:0
                        }
                    }
                    return mutations
                },{} as GraphQLFieldConfigMap<void,any>),
                ...makeCustomTypes(mutationMetas, context, onMutation)
            }
        })
    })
    return schema
}
import { GraphqlPluginOptions } from "./graphql";
import { makeModelGetter, deepGet } from "../../utils";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, graphql, GraphQLType, GraphQLBoolean, GraphQLID, GraphQLOutputType, GraphQLFieldConfig, GraphQLInputType, isInputType, GraphQLInputObjectType, GraphQLFieldConfigArgumentMap, GraphQLNonNull, GraphQLObjectTypeConfig } from "graphql";
import { Model } from "mongoose";
import { IMeta, metaOfMeta, ObjectFieldMeta, ArrayFieldMeta, RefFieldMeta } from "../../models/meta";
import { GraphQLAny } from "./type/any";
import { validateData } from "../../models/validate";
import { makeRefResolver } from "./make-ref-resolver";
import { makeResolvableField } from "./make-resolvable-field";
import { makeBatch } from "./batching";
import { ObjectID } from "bson";


export type TypeMapperContext = {
    getModel:(metaName:string)=>Model<any> | null
    metaMap:Map<string,IMeta>,
    batcherMap:Map<string,ReturnType<typeof makeBatch>>,
    outputTypeHashMap:Map<string,GraphQLOutputType>
    inputTypeHashMap:Map<string,GraphQLInputType>
    enumTypePoll:{[name:string]:GraphQLEnumType}
}

function capitalize(str:string){
    if(!str)
        return str
    return str[0].toUpperCase()+str.slice(1)
}


function mapMetaToField(fieldMeta:IMeta,context:TypeMapperContext,path:string[]){
    if(!fieldMeta.type){
        return null
    }
    if(fieldMeta.resolve){
        return makeResolvableField(fieldMeta,context)
    }
    const field:GraphQLFieldConfig<void,void> = {
        type:mapMetaToOutputType(fieldMeta, context, path),
        description:fieldMeta.label
    }
    if(fieldMeta.type === 'ref' && fieldMeta.ref){
        field.resolve = makeRefResolver(fieldMeta, context)
    }
    else if(fieldMeta.type === 'array' && fieldMeta.item && fieldMeta.item.type === 'ref' && fieldMeta.item.ref){
        field.resolve = makeRefResolver(fieldMeta.item, context)
    }
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
        case field.type==="ref" && context.outputTypeHashMap.has(field.ref): {
            return context.outputTypeHashMap.get((field as RefFieldMeta).ref)
        }
        case field.type==="boolean": return GraphQLBoolean
        case field.type==="array": {
            //https://github.com/Microsoft/TypeScript/issues/10421
            // item's name must be equal to array's name, to ensure path is correct.
            (field as ArrayFieldMeta).item.name = field.name
            const item = mapMetaToOutputType((field as ArrayFieldMeta).item,context,path)
            if(!item)
                return null
            return new GraphQLList(item)
        }
        case field.type==="object" && 'fields' in field && field.fields instanceof Array && field.fields.length > 0: {
            const ObjectTypeUniqueName = path.concat(field.name).join("__")
            if(!context.outputTypeHashMap.has(ObjectTypeUniqueName))
                context.outputTypeHashMap.set(ObjectTypeUniqueName,new GraphQLObjectType({
                    name:ObjectTypeUniqueName,
                    description:field.label,
                    fields:()=>(field as ObjectFieldMeta).fields.reduce((fields,childMeta)=>{
                        const child = mapMetaToField(childMeta,context,path.concat(field.name))
                        if(child)
                            fields[childMeta.name]=child
                        return fields
                    },{} as GraphQLFieldConfigMap<void,void>)
                }))
            return context.outputTypeHashMap.get(ObjectTypeUniqueName)
        }
        default: 
            return GraphQLString //includes string and ref
    }
}

export function mapMetaToInputType(meta:IMeta,context:TypeMapperContext,path:string[],operationType:"Any"|"Read"|"Write"):GraphQLInputType|null{
    if(!meta)
        return null
    if(meta.resolve)
        return null //TBD: resolvable field is assumed readonly
    if('readonly' in meta && operationType === 'Write')
        return null
    if(meta.writeonly && operationType === 'Read')
        return null
    if(meta.type === "ref")
        return GraphQLString
    if(meta.type==='object'){
        const inputObjectTypeUniqueName = operationType + path.join("__") + capitalize(meta.name)
        if(!context.inputTypeHashMap.has(inputObjectTypeUniqueName))
            context.inputTypeHashMap.set(inputObjectTypeUniqueName,new GraphQLInputObjectType({
                name:inputObjectTypeUniqueName,
                fields:()=>(meta as ObjectFieldMeta).fields.reduce((inputFields,fieldMeta)=>{
                    const converted = mapMetaToInputType(fieldMeta, context, path.concat(meta.name) ,operationType)
                    if(converted)
                        inputFields[fieldMeta.name] = {
                            type:converted,
                            description:fieldMeta.label
                        }
                    return inputFields
                },{})
            }))
        return context.inputTypeHashMap.get(inputObjectTypeUniqueName)
    }
    else if(meta.type==='array'){
        const item = mapMetaToInputType((meta as ArrayFieldMeta).item,context, path,operationType)
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

//为什么sort要用array? 因为graphql的处理忽略了object内key的顺序

const sortArgType = new GraphQLList(new GraphQLInputObjectType({
    name:"SortField",
    fields:{
        field:{
            type:GraphQLString
        },
        direction:{
            type:sortEnumType,
            defaultValue:1
        }
    }
}))

function makeQueryArgs(meta:ObjectFieldMeta,context:TypeMapperContext){
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
            type: sortArgType
        }
    }
    return queryArgs
}

function condition2FindOptions(search:any){
    if(search != undefined && !(search instanceof Array) && typeof search === 'object')
        return Object.keys(search).reduce((findOptions,name)=>{
            let newName = name
            if(name.startsWith("_") && name !== "_id")
                newName = "$"+name.slice(1)
            findOptions[newName] = condition2FindOptions(search[name])
            return findOptions
        },{})
    if(search != undefined && search instanceof Array){
        return search.map(condition2FindOptions)
    }
    if(ObjectID.isValid(search))
        return new ObjectID(search)
    return search
}

export function makeGraphQLSchema(options:GraphqlPluginOptions){
    let {
        connection,
        metas,
        mutations:mutationMetas = {},
        queries:queryMetas = {},
    } = options
    options.metas.forEach(meta=>{
        if(!validateData(meta,metaOfMeta))
            throw new Error("Invalid meta: "+meta.name)
    })
    const getModel = makeModelGetter(connection)
    
    const context:TypeMapperContext = {
        getModel,
        batcherMap:new Map(),
        metaMap:new Map(),
        enumTypePoll:{},
        inputTypeHashMap:new Map(),
        outputTypeHashMap:new Map()
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
    metas = metas.filter(x=>x && x.type==="object").map((modelMeta:ObjectFieldMeta)=>{
        context.metaMap.set(modelMeta.name, modelMeta)
        return {
            ...modelMeta,
            fields:[
                ...modelMeta.fields,
                ...internalFields.filter(x=>!modelMeta.fields.some(y=>y.name === x.name))
            ]
        }
    })
    metas.forEach(meta=>{
        context.batcherMap.set(meta.name,makeBatch((ids:string[])=>{
            console.debug(`batch resolving ref: ${meta.name}, ids length ${ids.length}`)
            const model = context.getModel(meta.name)
            if(!model)
                return Promise.resolve(null)
            return model.find({
                _id:{
                    $in:ids.map(String)
                }
            }).then(res=>{
                const ordered = ids.map(id=>{
                    return res.find(x=>String(x._id) === String(id))
                })
                return ordered
            })
        }))
    })
    const rootTypes = metas.map(modelMeta=>{
        return mapMetaToOutputType(modelMeta,context,[]) as GraphQLObjectType
    })

    const IDType = new GraphQLNonNull(GraphQLID)

    const metaTypeQueries = rootTypes.reduce((query,type,i)=>{
        const meta = metas[i]
        query['count'+capitalize(type.name)] = {
            type: GraphQLInt,
            description:"Count "+meta.label,
            args:makeQueryArgs(meta,context),
            resolve:async (_,args)=>{
                const model = await getModel(meta.name)
                if(!model)
                    return []
                else {
                    const findCondition = condition2FindOptions(args.search)
                    return model.count(findCondition)
                }
            }
        }
        query[type.name] = {
            type:new GraphQLList(type),
            description:meta.label,
            args:makeQueryArgs(meta,context),
            resolve:async (_,args)=>{
                const model = await getModel(meta.name)
                if(!model)
                    return []
                else {
                    const findCondition = condition2FindOptions(args.search)
                    const query = model.find(findCondition)
                        .sort(args.sort ? args.sort.reduce((obj,f)=>{
                            obj[f.field]=f.direction
                            return obj
                        },{}) : undefined)
                        .skip(args.skip)
                    if(args.limit)
                        return query.limit(args.limit)
                    return query.then(res=>{
                        return res
                    })
                }
            }
        }
        return query
    },{} as GraphQLFieldConfigMap<any,any>)

    const schema = new GraphQLSchema({
        query:new GraphQLObjectType({
            name:"Root",
            fields:{
                ...metaTypeQueries,
                ...Object.keys(queryMetas).reduce((obj,queryFieldName)=>{
                    obj[queryFieldName] = makeResolvableField(queryMetas[queryFieldName], context)
                    return obj
                },{} as GraphQLFieldConfigMap<any,any>)
            },
        }),
        types:rootTypes,
        mutation:new GraphQLObjectType({
            name:"Mutation",
            fields:{
                ...metas.reduce((mutations,meta)=>{
                    const modelType = context.outputTypeHashMap.get(meta.name)
                    if(!modelType)
                        throw new Error("Cannot find modelType:"+meta.name)
                    // const modelReadType = new GraphQLNonNull(mapMetaToInputType(meta,context, [],'Read'))
                    const modelWriteType = new GraphQLNonNull(mapMetaToInputType(meta, context, [], 'Write'))
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
                            return res
                        }
                    }
                    const updateManyModelMutationName = 'updateMany'+capitalize(meta.name)
                    mutations[updateManyModelMutationName] = {
                        type:GraphQLInt,
                        args:{
                            condition:{
                                type:GraphQLAny
                            },
                            payload:{
                                type:modelWriteType
                            }
                        },
                        resolve:async (source,args,context,info)=>{
                            const model = await getModel(meta.name)
                            const updateResult = await model.updateMany( condition2FindOptions(args.condition) ,args.payload).exec()
                            const res = updateResult ? updateResult.n : 0
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
                            return !!res?1:0
                        }
                    }
                    return mutations
                },{} as GraphQLFieldConfigMap<void,any>),
                ...Object.keys(mutationMetas).reduce((obj,mutationName)=>{
                    obj[mutationName] = makeResolvableField(mutationMetas[mutationName],context)
                    return obj
                },{})
            }
        })
    })
    return schema
}
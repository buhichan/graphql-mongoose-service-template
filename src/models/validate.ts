import { IMeta } from "./meta";
import { valid } from "joi";

export type IMetaConstraint = boolean | {
    anyOf?:IMetaConstraint[]
    allOf?:IMetaConstraint[]
    not?:IMetaConstraint
    if?:IMetaConstraint,
    then?:IMetaConstraint,
    else?:IMetaConstraint,
    properties?:{
        [name:string]:IMetaConstraint
    }
    const?:any
}

export const fieldValidator:IMetaConstraint = {
    allOf:[
        {
            if:{
                properties:{
                    type:{
                        const:"array"
                    }
                }
            },
            then:{
                properties:{
                    item:true
                }
            }
        },{
            if:{
                properties:{
                    type:{
                        const:"ref"
                    }
                }
            },
            then:{
                properties:{
                    ref:true
                }
            }
        },{
            if:{
                properties:{
                    type:{
                        const:"object"
                    }
                }
            },
            then:{
                properties:{
                    fields:true
                }
            }
        }
    ]
}

export function applyMetaValidator(data:any,validate:IMetaConstraint):boolean{
    if(typeof validate === 'boolean')
        return !!data === validate
    if(validate === undefined)
        return true
    return (
        ( !validate.const || validate.const === data ) &&
        ( !validate.allOf || validate.allOf.every(validate=>applyMetaValidator(data, validate)) ) &&
        ( !validate.anyOf || validate.anyOf.some(validate=>applyMetaValidator(data, validate))) &&
        ( !validate.not || !applyMetaValidator(data, validate.not)) &&
        ( !validate.properties || Object.keys(validate.properties).every(propName=>applyMetaValidator(data[propName], validate.properties[propName]))) &&
        ( !validate.if || ( ()=>{
            if(applyMetaValidator(data, validate.if))
                return applyMetaValidator(data, validate.then)
            else
                return applyMetaValidator(data, validate.else)
        } )() )
    )
}

export function MetaValidationError(res:ReturnType<typeof validateData>){
    throw new Error(`Meta validation error: ${res.map(x=>`${x.path}:${x.message}`).join("\n")}`)
}



export function validateData(data:any,meta:IMeta):{
    path:string,
    message:string
}[]{
    function validateDataType(){
        switch(true){
            case meta.name === "_id":
                return true
            case meta.type === 'any':
                return true
            case meta.type === 'number':
                return typeof data === 'string'
            case meta.type === 'string':
                return typeof data === 'string'
            case meta.type === 'boolean':
                return data === true || data === false
            case meta.type === 'date':
                return isFinite(new Date(data).getTime())
            case meta.type === 'ref':
                return true //todo: don't know what to do.
            case meta.type === 'array':
                return data instanceof Array
            case meta.type === 'object':{
                return typeof data === 'object'
            }
            default:
                return false
        }
    }
    if(meta.enum && meta.enum.length && !meta.enum.includes(data))
        return [{
            path:meta.name,
            message:`expect one of ${meta.enum.join(",")}, received ${String(data)}`
        }]
    const typeValid = validateDataType()
    if(!typeValid)
        return [{
            path:meta.name,
            message:`expect type ${meta.type}, received ${String(data)}`
        }]
    else if(meta.type === 'array'){
        return data.reduce((errors,item)=>{
            return errors.concat(validateData(item, meta.item).map(childError=>{
                return {
                    path: meta.name + "." + childError.path,
                    message:childError.message
                }
            }))
        },[])
    }
    else if(meta.type === 'object'){
        const validatorPassed = meta.validate ? applyMetaValidator(data,meta.validate) : true
        if(!validatorPassed)
            return [{
                path: meta.name,
                message:"meta.validate failed"
            }]
        return meta.fields.reduce((errors,field)=>{
            if(data[field.name] != undefined)
                return errors.concat(validateData(data[field.name],field).map(childError=>{
                    return {
                        path: meta.name + "." + childError.path,
                        message:childError.message
                    }
                }))
            return errors
        },[])
    }else
        return []
}
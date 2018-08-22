import { Connection } from "mongoose";

export const makeModelGetter = (connection:Connection)=>(metaName:string)=>{
    const Model = connection.models[metaName]
    if(!Model)
        throw new Error("model name invalid, valid model names are "+connection.modelNames().join(","))
    return Model
}
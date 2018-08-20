import { connection } from "../db";

export const getModel = (metaName:string)=>{
    return connection.then(connection=>{
        const Model = connection.models[metaName]
        if(!Model)
            throw new Error("model name invalid, valid model names are "+connection.modelNames().join(","))
        return Model
    })
}
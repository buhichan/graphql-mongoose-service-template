
export const fieldTypes = {
    "number":Number,
    "string":String,
    "boolean":Boolean,
    "ref":String,
    "array":Array,
    "object":Object,
    "date":Date
}

export type FieldTypes = keyof typeof fieldTypes

export interface IMeta {
    name:string,
    label:string,
    type:FieldTypes
    fields?:IMeta[]
    item?:IMeta,
    enum?:string[]
    ref?:string,
}

function buildMeta(nestLevel:number){
    if(nestLevel === 0)
        return undefined
    const child = buildMeta(nestLevel-1)
    const fields:IMeta[] = [
        {
            name:"name",
            label:"名称",
            type:"string",
        },{
            name:"label",
            label:"标签",
            type:"string",
        },{
            name:"type",
            label:"类型",
            type:"string",
            enum:Object.keys(fieldTypes),
        },{
            name:"enum",
            label:"枚举",
            type:"array",
            item:{
                name:"enum",
                type:"string",
                label:"枚举值"
            }
        },{
            name:"ref",
            label:"关联",
            type:"string",
        }
    ]
    if(child)
        fields.push(
            {
                name:"fields",
                label:"字段列表",
                type:"array",
                item:{
                    name:"child",
                    type:"object",
                    label:"字段定义",
                    fields:child
                }
            }
        )
    return fields
}

export const metaOfMeta:IMeta = {
    name:"Meta",
    label:"元数据",
    type:"object",
    fields:buildMeta(3)
}
# What is this?
- 这是一个基于mongoose, 根据字段列表快速生成Graphql API和对应的mongodb schema的工具
- A tool based on mongoose which quickly generates Graphql API and mongodb schema using provided property list.

# Production ready?
- No, not yet.
- 主要作用还是快速创建模块的原型, 如果直接用于生产环境的话会有性能问题
- The aim is to create prototypes, if used in production, may cause perfomance problems.

# Example
```typescript
import {
    IMeta, 
    makeGraphQLSchema, 
    makeGraphQLPlugin /*this makes a hapi-js plugin*/
} from "graphql-mongoose"

const user:IMeta = {
    type:"object",
    label:"User",
    name:"user", //this is the name of the mongodb schema
    fields:[
        {
            key:"name",
            label:"Name",
            type:"string"
        },{
            key:"age",
            label:"Age",
            type:"number"
        },{
            key:"parents",
            label:"Parents",
            type:"ref",
            ref:"user",  //this field is a reference to "user" schema
        },{
            key:"phones",
            label:"Phones",
            type:"array",
            item:{
                key:"PhoneNumber", //this is not used for now.
                label:"PhoneNumber", //this is not used for now.
                type:"string"
            }
        },{
            key:"detail",
            label:"Detail",
            type:"object",
            fields:[
                // nested fields
            ]
        }
    ]
}
const schema = makeGraphQLSchema({
    metas:[
        user
    ],
    querys:{}, // custom queries. same options as custom mutations.
    connection // node-mongodb-native connection, you can get it from mongoose's createConnection method
    mutations:{
        helloWorld:{ // a custom mutation named "helloWorld", this is added in addition to the generated mutations.
            args:{
                name:{
                    meta:{
                        type:"string",
                        name:"Name",
                        label:"Name"
                    },
                    defaultValue:"world"
                }
            },
            returns:{
                type:"string",
                name:"string",
                label:"string"
            },
            resolve:(args,context)=>{
                return "hello "+args.name
            }
        }
    }
})
const app = require("express")()
app.use(require("body-parser").json())
app.post("/graphql",(req,res)=>{
    const {variables,query} = req.body as any
    return graphql(schema,query,null,request,variables)
})
app.listen()
```
- Now you have a running graphql api at /graphql with these queries and mutations:
    - query
        - user (search:{_id}) 
        ```
        query {
            user (search:{name:"zhuzatang"}){
                
            }
        }
        ```
    - mutations
        - addUser
        - updateUser
        - updateManyUser
        - deleteUser
        - helloWorld
- If you want the graphiql frontend for debuging, you can use hapi-js and makeGraphQLPlugin from this package, see ./demo/demo.ts for detail.

# Todo

- API相关
    - [ ] 增加表关联的支持
        - [x] graphql
        - [ ] restful
- GraphQL
    - [x] 搜索
    - [x] 分页
    - [x] 排序
- 类型
    - [x] 增加enum的支持
    - [x] 增加any的支持
    - [ ] required/NonNull的支持
- [x] 不重启就载入model的改变
    - 需要手动打开
- [ ] batcher/dataloader

# Dev

- install deps
    - `yarn`
- backend
    - `yarn dev`
- frontend (graphiql)
    - `yarn dev:fe`
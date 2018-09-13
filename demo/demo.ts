

import * as Hapi from "hapi"
import * as joi from "joi"
import { Mongoose } from "mongoose";
import graphiql from "./graphiql";
import { IMeta } from "../src";
import { Template } from "./example";


export async function bootstrap(){
    const {makeModelFromMeta,metaOfMeta,restfulRoutes,makeGraphQLPlugin } = await import("../src")

    console.log(`Dependencies loaded.`)

    const server = new Hapi.Server({
        host: "0.0.0.0",
        port: 10082,
        routes: {
            "cors": {
                origin: ['*'],
                credentials: true
            },
        },
        router: {
            stripTrailingSlash: true
        }
    });
    const uri = "mongodb://192.168.150.135:27002/test"
    // const uri = "mongodb://localhost:27017/graphql-test"
    const connection = await new Mongoose().createConnection(uri,{
        useNewUrlParser:true
    })
    const MetaModel = await makeModelFromMeta({
        connection,
        meta:metaOfMeta
    })

    const metas = await MetaModel.find()
    const allMetas = metas.map(x=>{
        const meta = x.toObject()
        // makeModelFromMeta(meta)
        return meta as IMeta
    }).concat([
        {
            name:"test",
            type:"object",
            label:"test",
            fields:[
                {
                    name:"any",
                    type:"any",
                    label:"any"
                }
            ]
        },
        Template
    ])
    console.log(`Metas loaded.`)

    await Promise.all(allMetas.map(meta=>makeModelFromMeta({connection,meta})))
    console.log(`Models loaded.`)

    const alreadyDefined = new Set()
    
    allMetas.concat(metaOfMeta).map(meta=>{
        if(alreadyDefined.has(meta.name)){
            alreadyDefined.add(meta.name)
            server.route(restfulRoutes({
                meta:meta,
                connection,
                validators:{
                    put:joi.any(),
                    post:joi.any()
                }
            }))
        }
    })

    /**
     * reload graphql schema when meta model is mutated.
     */
    async function reloadMetas(){
        await Promise.all(allMetas.map(meta=>makeModelFromMeta({connection,meta})))
        graphQLPlugin.reload({
            metas: (await MetaModel.find()).map(x=>x.toObject()).concat(metaOfMeta)
        })
    }
    const graphQLPlugin = makeGraphQLPlugin({
        metas:allMetas.concat(metaOfMeta),
        queries:{
            locations:{
                returns:{
                    name:"locations",
                    type:"array",
                    label:"Locations",
                    item:{
                        name:"option",
                        type:"object",
                        label:"Option",
                        fields:[
                            {
                                name:"name",
                                type:"string",
                                label:"Name"
                            },{
                                name:"value",
                                type:"string",
                                label:"Value"
                            },
                        ]
                    }
                },
                resolve(){
                    return [
                        {name:"1",value:"2"},
                        {name:"3",value:"4"},
                    ]
                }
            },
        },
        connection,
        onMutation:{
            addMeta:reloadMetas,
            deleteMeta:reloadMetas,
            updateMeta:reloadMetas
        },
        mutations:{
            customAction:{
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
    await server.register({
        plugin:graphQLPlugin
    })

    await server.start()

    server.events.on('request', (request, event, tags) => {
        console.log(tags)
        if (tags.error) {
            // console.log(`Request error: ${event.error ? event.error['message'] : 'unknown'}`);
            if(request && request.response)
                request.response.message = JSON.stringify({
                    meta:{
                        ...event.error
                    },
                    data:null
                })
        }
    });

    server.route({
        path:"/login",
        method:"post",
        handler:()=>{
            return "success"
        }
    })

    graphiql(server) // graphiql只是作demo用, 类似swagger

    console.log(`Backend running in http://localhost:10082`)
    console.log(`Graphql API is http://localhost:10082/graphql`)
    console.log(`To see frontend, run yarn dev:fe, then go to http://localhost:10082/graphiql/graphiql.html`)
    console.log(`Current models: ${(await connection).modelNames()}`)
}

bootstrap()
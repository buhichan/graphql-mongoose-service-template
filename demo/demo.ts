

import * as Hapi from "hapi"
import * as joi from "joi"
import { Mongoose } from "mongoose";
import graphiql from "./graphiql";

export async function bootstrap(){
    const {makeMetaModel,metaModelValidations,makeModelFromMeta,metaOfMeta,restfulRoutes,makeGraphQLPlugin } = await import("../src")

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
    const connection = await new Mongoose().createConnection("mongodb://localhost:27017/graphql-test",{
        useNewUrlParser:true
    })
    const MetaModel = await makeMetaModel(connection)
    const metas = await MetaModel.find()
    const allMetas = metas.map(x=>{
        const meta = x.toObject()
        // makeModelFromMeta(meta)
        return meta
    })
    console.log(`Metas loaded.`)

    const modelsFromMeta = await Promise.all(allMetas.map(makeModelFromMeta(connection)))
    console.log(`Models loaded.`)

    allMetas.concat(metaOfMeta).map(meta=>{
        server.route(restfulRoutes({
            meta:meta,
            connection,
            validators:meta === metaOfMeta ? metaModelValidations : {
                post:joi.any(),
                put:joi.any()
            }
        }))
    })

    await server.register({
        plugin:makeGraphQLPlugin({
            metas:allMetas.concat(metaOfMeta),
            connection,
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
                    resolve:(args)=>{
                        return "hello "+args.name
                    }
                }
            }
        })
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
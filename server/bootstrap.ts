

import * as Hapi from "hapi"
import * as joi from "joi"

export async function bootstrap(){
    switch(process.env.NODE_ENV){
        case "production":
            await import(`./env/production`)
            break
        case "prerelease":
            await import(`./env/prerelease`)
            break
        default:
            await import("./env/development")
    }
    const {MetaModel,metaModelValidations,makeModelFromMeta } = await import("./models/model")
    const {metaOfMeta} = await import("./models/meta")
    const {restfulRoutes} = await import("./routes/restful")
    const {makeGraphQLPlugin} = await import("./routes/graphql")
    const {connection} = await import("./db")

    console.log(`Dependencies loaded.`)

    const server = new Hapi.Server({
        host: ENV.HOST,
        port: ENV.PORT,
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

    const Model = await MetaModel
    const metas = await Model.find()
    const allMetas = metas.map(x=>{
        const meta = x.toObject()
        // makeModelFromMeta(meta)
        return meta
    })
    console.log(`Metas loaded.`)

    const modelsFromMeta = await Promise.all(allMetas.map(makeModelFromMeta))
    console.log(`Models loaded.`)

    allMetas.concat(metaOfMeta).map(meta=>{
        server.route(restfulRoutes({
            meta:meta,
            validators:meta === metaOfMeta ? metaModelValidations : {
                post:joi.any(),
                put:joi.any()
            }
        }))
    })

    await server.register({
        plugin:makeGraphQLPlugin({
            metas:allMetas.concat(metaOfMeta),
            mutations:{
    
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

    console.log(`Backend running in http://${ENV.HOST}:${ENV.PORT}`)
    console.log(`Graphql API is http://${ENV.HOST}:${ENV.PORT}/graphql`)
    console.log(`To see frontend, run yarn dev:fe, then go to http://localhost:10082/`)
    console.log(`Current models: ${(await connection).modelNames()}`)
}

declare global{
    export namespace ENV{
        const HOST:string;
        const MONGODB:string;
        const PORT:number
    }
}
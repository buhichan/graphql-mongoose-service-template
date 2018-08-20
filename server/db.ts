import { Mongoose } from "mongoose";

const mongoClient = new Mongoose()

export const connection = mongoClient.connect(ENV.MONGODB,{
    useNewUrlParser:true
})
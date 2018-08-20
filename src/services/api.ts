
import {Http} from "../config/http";
import {RestfulResource} from "redux-restful-resource";
import {getStore} from "../bootstrap";

export interface IModel {
    id:string
    name:string
    fields:IField[]
}

export interface IField{
    modelId:string

}
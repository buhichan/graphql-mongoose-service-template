import {IRouteConfig} from "guguder"
import * as React from "react"
import {App} from "../app";

import {DashboardPage} from "../routes/dashboard/dashboard"

const Page404 = {
    name:"notFound",
    path:"*",
    component:()=><div>404</div>
};

export const appRoutes:IRouteConfig[] = [
    {
        code:"0",
        name:"dashboard",
        path:"/",
        exact:true,
        component:DashboardPage
    }
    /**
    Asynchronous dependencies (lazy loading)
    ,{
        deps:()=>new Promise((resolve,reject)=>{
            require.ensure(['../routes/todos'],function(){
                resolve(require("../routes/todos"))
            },"todos")
        }),
        name:"todos",
        path:"/todos",
        children:[
            {
                getComponent:deps=>deps.TodosPage,
                ...
            }
        ]
    }
    Parameter:
    ,{
        ...,
        path:"/phone/:phone_number(\d{8,13})"
        ...
    }

    */
];

export const rootRoutes:IRouteConfig[] = [
    {
        name:"App",
        path:"",
        component: App,
        children:appRoutes
    },
    Page404
];

//如果要使用MenuService，用法大概是这样
//export const menuService = new MenuService(appRoutes);
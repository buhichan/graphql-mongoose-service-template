    import { ObjectFieldMeta } from "../src";

    export const Fault:ObjectFieldMeta = {
    name: "faults",
    label: "故障表",
    type: "object",
    fields: [
        {
            name: "alarm_id",
            label: "告警ID",
            type: "string"
        },
        {
            name:"custom_field",
            label:"custom",
            type: "string",
            args:{
                arg1:{
                    type:"string",
                    name:"arg1",
                    label:"arg1",
                    defaultValue:"world"
                }
            },
            resolve:(source,args)=>{
                return "hello "+args.arg1+"\n, handleperson is "+source.Extend.handle_person
            }
        },
        {
            name: "template_id",
            label: "模版ID",
            type: "ref",
            ref: "template"
        },
        {
            name: "title",
            label: "告警标题",
            type: "string"
        },
        {
            name: "happen_time",
            label: "发生时间",
            type: "string"
        },
        {
            name: "recover_time",
            label: "恢复时间",
            type: "string"
        },
        {
            name: "handle_person",
            label: "当前处理人",
            type: "string"
        }, 
        {
            name:"alarm_reg",
            label:"告警接入",
            type:"any"
        },
        {
            name: "status",
            label: "状态",
            type: "string"
        },
        {
            name: "unom_status",
            label: "告警状态",
            type: "string"
        },
        {
            name: "info_type",
            label: "类别",
            type: "string"
        },
        {
            name: "region",
            label: "地域",
            type: "string"
        },
        {
            name: "show_level",
            label: "级别",
            type: "string"
        },
        {
            name: "usage",
            label: "一级业务",
            type: "string"
        },
        {
            name: "sec_usage",
            label: "二级业务",
            type: "string"
        },
        {
            name: "alarm_duty",
            label: "值班人",
            type: "any"
        },
        {
            name: "logs",
            label: "操作记录列表",
            type: "array",
            item: {
                name: "log",
                type: "object",
                label: "操作日志",
                fields:[
                    {
                        name: "time",
                        type: "string",
                        label: "操作时间",
                    },
                    {
                        name: "user",
                        type: "string",
                        label: "操作用户",
                    },
                    {
                        name: "action",
                        type: "string",
                        label: "操作",
                    },
                ]
            }
        },
        {
            name: "Extend",
            label: "扩展字段",
            type: "any"
        }
    ]
    }

    export const Attr:ObjectFieldMeta = {
    "name" : "attr",
    "type" : "object",
    "label" : "属性",
    "fields" : [
        {
            "name" : "name",
            "label" : "属性名称",
            "type" : "string"
        }, 
        {
            "name" : "label",
            "label" : "显示名称",
            "type" : "string"
        }, 
        {
            "name": "type",
            "label": "数据类型",
            "type": "string"
        },
        {
            "name": "lambda_name",
            "label": "lambda",
            "type": "string"
        },
        {
            "name": "is_common",
            "label": "是否公用",
            "type": "boolean"
        }, 
        {
            "name" : "is_required",
            "label" : "是否必填",
            "type" : "boolean"
        }
    ]
    }

    export const Enums: ObjectFieldMeta = {
    name: "enums",
    label: "枚举表",
    type: "object",
    fields: [
        {
            name: "attr_id",
            label: "属性id",
            type: "ref",
            ref:"attr"
        },
        {
            name: "value",
            label: "数据值",
            type: "string"
        },
        // {
        //     name: "level",
        //     label: "数据层级",
        //     type: "number"
        // },
        {
            name: "parent_id",
            label: "父id",
            type: "ref",
            ref:"enums"
        }
        
    ]

    }

    export const Template: ObjectFieldMeta = {
        "name": "template",
        "type": "object",
        "label": "故障模版表",
        "fields": [
        {
            name: "name",
            label: "模版名称",
            type: "string"
        },
        {
            name: "alarm_reg_ids",
            label: "告警接入ID列表",
            type: "array",
            item:{
            name:"alarm_reg_id",
            type:"number",
            label:"告警接入ID"
            }
        },
        {
            name: "wechat_ids",
            label: "微信群",
            type: "array",
            item:{
            name:"wechat",
            type:"string",
            label:"微信ID"
            }
        },
        {
            name: "textcard",
            label: "消息卡片",
            type: "object",
            fields: [{
            name: "title",
            type: "string",
            label: "标题"
            }, {
            name: "btntxt",
            type: "string",
            label: "按钮文本"
            }
        ]
        },
        {
            name: "fields",
            label: "字段列表",
            type: "array",
            item: {
            type: "object",
            name: "fields",
            label: "字段对象",
            fields: [
                {
                ref: "attr",
                type: "ref",
                name: "attr_id",
                label: "属性id"
                }, {
                name: "default",
                type: "any",
                label: "默认值"
                },
                {
                name: "limit",
                type: "number",
                label: "字数限制"
                }
            ]
            }
        }
    
        ]
    }
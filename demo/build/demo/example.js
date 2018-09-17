"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attr = {
    "name": "attr",
    "type": "object",
    "label": "属性",
    "fields": [
        {
            "name": "name",
            "label": "属性名称",
            "type": "string"
        },
        {
            "name": "label",
            "label": "显示名称",
            "type": "string"
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
            "name": "is_required",
            "label": "是否必填",
            "type": "boolean"
        }
    ]
};
exports.Enums = {
    name: "enums",
    label: "枚举表",
    type: "object",
    fields: [
        {
            name: "attr_id",
            label: "属性id",
            type: "ref",
            ref: "attr"
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
            ref: "enums"
        }
    ]
};
exports.Template = {
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
            item: {
                name: "alarm_reg_id",
                type: "number",
                label: "告警接入ID"
            }
        },
        {
            name: "wechat_ids",
            label: "微信群",
            type: "array",
            item: {
                name: "wechat",
                type: "string",
                label: "微信ID"
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
};
//# sourceMappingURL=example.js.map
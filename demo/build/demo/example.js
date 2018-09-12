"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                        ref: "Meta",
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
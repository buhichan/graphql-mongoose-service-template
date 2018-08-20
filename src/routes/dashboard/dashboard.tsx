/**
 * Created by buhi on 2017/5/3.
 */
import * as React from 'react';
import {ReduxComponent, RootState} from "../../bootstrap"
import {createSelector} from "reselect"
import {List} from "immutable"

import {ReduxSchemaForm,FormFieldSchema} from "redux-schema-form"
import {GridFieldSchema, Grid} from "ag-grid-presets"
import { IModel } from '../../services/api';


//const GraphiQL = window['GraphiQL'];

//this is to suppress the error when use Grid directly.

const todo_schema:GridFieldSchema[] = [
    {
        key:"name",
        label:"Name",
        type:"text"
    },{
        key:"reward",
        label:"Reward",
        type:"number"
    }
];

@ReduxComponent({
    selector:(s,props)=>({
        models:s.models,
        selected:s.models?s.models.find(x=>x.name==props.todo_id):null
    })
})
export class DashboardPage extends React.PureComponent<{
    models:List<IModel>,
    dispatch
},{}>{
    render(){
        const {models} = this.props;
        return <div>
            {
                models.map(x=><div key={x.id}>
                    <h2>
                        Name:{x.name}, fields:{x.fields}
                    </h2>
                </div>)
            }
            <ReduxSchemaForm schema={todo_schema as FormFieldSchema[]} onSubmit={console.log} />
            <Grid schema={todo_schema} data={models.toArray()}/>
        </div>
    }
}
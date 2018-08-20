import {ReduxComponent} from "./bootstrap";
import {RouteComponentProps} from "guguder";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

window['React'] = React;
window['ReactDOM'] = ReactDOM;

import 'graphiql/graphiql.css';
import * as GraphiQL from 'graphiql/graphiql.min.js';

export class App extends React.PureComponent<RouteComponentProps&{
    dispatch?,
    todos
},{}>{
    render(){
        return <div>
            <GraphiQL fetcher={graphQLFetcher} />
        </div>
    }
}

function graphQLFetcher(graphQLParams) {
    const url = new URL(location.toString());
    url.port = "10083";
    url.pathname="graphql";
    return fetch(url.toString(), {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
}
# Run in Dev mode

`npm run dev`

# Run using index.js as server

`npm run start`

# Update version number and push

`npm version [patch/minor/major/1.0.1]`

## To use this boilterplate, you probably want to know

- [immutable.js](https://facebook.github.io/immutable-js/docs/#/)
    - **important** 
- [redux](http://redux.js.org/)
    - **important**
- [typescript](https://www.typescriptlang.org/docs/tutorial.html)
    - you only need to read the 'quickstart'
- [webpack](https://webpack.js.org/configuration/)
    - if you don't want to custom webpack.config.js, you don't have to read the doc
- [material-ui](http://www.material-ui.com/#/)(optional)
    - if you don't want to use material-ui, just remove the code about it

## Custom Packages used in this boilerplate

- guguder: A wrapper around redux+immutable.js
    - [docs](https://gitlab.ucloudadmin.com/buhi/guguder)
- redux-schema-form: A dynamic form component
    - [docs](https://github.com/buhichan/redux-schema-form)
    - built on [redux-form](http://redux-form.com/)
- ag-grid-material-preset: A dynamic table component
    - [docs](https://gitlab.ucloudadmin.com/buhi/ag-grid-material-preset)
    - built on [ag-grid](https://www.ag-grid.com/)
- redux-restful-resource: A helper class to use RESTful style api, remove it if it's not needed
    - [docs](https://github.com/buhichan/redux-restful-resource)
    
## How to add a route

+ step1: add a file/directory in src/routes
    - create a component in it
    - if you want it to be connected to redux, add a @ReduxComponent decorator, then use selector to get data from store
    
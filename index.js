/**
 * Generated by 小🐔小🐔咕咕嘚.
 */
"use strict";
const express = require('express');
const path = require('path');
global['ENV'] = require(`./env/${process.env.NODE_ENV}.json`);
const app = express();
const staticAssets = express.static(path.resolve(__dirname,'assets'),{maxAge:3650*24*60*60*1000});

app.use('/assets',staticAssets);

if(process.env.NODE_ENV === 'development'){
    try{
        const webpackHotMiddleware = require("webpack-hot-middleware");
        const webpack = require('webpack');
        const webpackConfig = require('./webpack.config');
        const compiler = webpack(webpackConfig);
        const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
            devtool:"inline-source-map",
            host:"0.0.0.0",
            hot:true,
            noInfo:true,
            inline:true,
            progress:true,
            publicPath: webpackConfig.output.publicPath
        });
        app.use(webpackDevMiddleware);
        app.use(webpackHotMiddleware(compiler));
        app.get('*', function(req, res) {
            const index = webpackDevMiddleware.fileSystem.readFileSync(path.join(webpackConfig.output.path, 'index.html'));
            res.end(index);
        }.bind(this));
    }catch(e){
        console.log(e.message);
    }
}else{
    const staticApp = express.static(path.resolve(__dirname,"build/current"),{maxAge:3650*24*60*60*1000});
    app.use(function(req,res,next){
        const user_name = req.header('X-Forwarded-For');
        if(user_name)
            res.cookie('user_name',user_name, { maxAge: 900000, httpOnly: true });
        next()
    });
    app.use(staticApp);
    app.get('*',(req,res)=>{
        res.sendFile("/build/current/index.html");
    });
}
app.listen(10082);
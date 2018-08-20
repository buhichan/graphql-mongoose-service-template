module.exports = require("guguder-webpack-config").makeConfig({
    webpack:require("webpack"),
    rootDir:__dirname,
    packageJson:require("./package.json"),
})
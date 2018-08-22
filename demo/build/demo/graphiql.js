"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (server) {
    //You don't need this.
    server.register({
        plugin: require("hapi-plugin-graphiql"),
        options: {
            graphiqlSource: "downstream",
            graphiqlGlobals: "",
            graphiqlURL: "/graphiql",
            graphqlFetchURL: "/graphql",
            graphqlFetchOpts: "{\n                method: \"POST\",\n                headers: {\n                    \"Content-Type\": \"application/json\",\n                    \"Accept\":       \"application/json\"\n                },\n                body: JSON.stringify(params),\n                credentials: \"same-origin\"\n            }",
            loginFetchURL: "/login",
            loginFetchOpts: "{\n                method: \"POST\",\n                headers: {\n                    \"Content-Type\": \"application/json\"\n                },\n                body: \"{}\",\n                credentials: \"same-origin\"\n            }",
            loginFetchSuccess: "",
            loginFetchError: "",
            graphqlExample: "{\n" +
                "    Meta {\n" +
                "        _id # schema introspection\n" +
                "    }\n" +
                "}\n",
            documentationURL: "",
            documentationFile: ""
        }
    });
});
//# sourceMappingURL=graphiql.js.map
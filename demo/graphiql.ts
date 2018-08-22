import { Server } from "hapi";

export default (server:Server)=>{

    //You don't need this.
    server.register<any>({
        plugin: require("hapi-plugin-graphiql"),
        options: {
            graphiqlSource: "downstream",
            graphiqlGlobals: "",
            graphiqlURL: "/graphiql",
            graphqlFetchURL: "/graphql",
            graphqlFetchOpts: `{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept":       "application/json"
                },
                body: JSON.stringify(params),
                credentials: "same-origin"
            }`,
            loginFetchURL: "/login",
            loginFetchOpts: `{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: "{}",
                credentials: "same-origin"
            }`,
            loginFetchSuccess: "",
            loginFetchError: "",
            graphqlExample:
                "{\n" +
                "    Meta {\n" +
                "        _id # schema introspection\n" +
                "    }\n" +
                "}\n",
            documentationURL:  "",
            documentationFile: ""
        }
    })
}
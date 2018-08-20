module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "graphql_test",
      script    : "index.js",
      env: {
        APP_VERSION: require('./package.json').version,
      },
      env_production : {
        NODE_ENV: "production"
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "root",
      host : "192.168.150.211",
      ref  : "origin/graphql_test",
      repo : "git@gitlab.ucloudadmin.com:buhi/graphql_test.git",
      path : "/data/http/graphql_test",
      "post-deploy" : "npm install --production && npm run start"
    },
    development : {
      user : "root",
      host : "192.168.150.211",
      ref  : "origin/graphql_test",
      repo : "git@gitlab.ucloudadmin.com:buhi/graphql_test.git",
      path : "/data/http/graphql_test",
      "post-deploy" : "npm install && npm run dev",
      env  : {
        NODE_ENV: "development"
      }
    }
  }
};

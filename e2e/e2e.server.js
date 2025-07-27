// e2e/server.e2e.js
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("../webpack.dev"); // ← Путь до webpack.dev.js от текущей папки

const devServerOptions = { ...config.devServer, open: false };
const compiler = webpack(config);
const server = new WebpackDevServer(devServerOptions, compiler);

module.exports = () => {
  return new Promise((resolve) => {
    server.startCallback(() => {
      console.log("Webpack Dev Server started on port 8080");
      resolve(server);
    });
  });
};

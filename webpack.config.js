module.exports = {
  entry: "./src/js/App.js",
  output: {
    path: "./src",
    filename: "bundle.js"
  },
  /* ソースマップを出力させる場合は以下を追加 */
  devtool: "inline-source-map",
  module: {
    loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                presets: [ 'es2015' ]
            }
        },
        {
            test: /\.html$/,
            exclude: /node_modules/,
            loader: "html-loader"
        }
    ]
  }
};

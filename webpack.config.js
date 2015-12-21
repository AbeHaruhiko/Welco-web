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
            test: /\.vue$/,
            loader: 'vue'
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel",
            query: {
                presets: [ 'es2015' ]
            }
        },
        {
            test: /\.html$/,
            exclude: /node_modules/,
            loader: "html"
        }
    ]
  }
  ,
  vue: {
      loaders: {
        js: 'babel'
      }
  },
  babel: {
      presets: ['es2015']
  }
};

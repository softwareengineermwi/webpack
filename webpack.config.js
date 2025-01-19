const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const output = "../webpack/dist"
const pages = {
  main: "index"
}

const entries = {}
const plugins = []

for(const key in pages) {
  entries[key] = `./src/${pages[key]}.js`
  plugins.push(new HtmlWebpackPlugin({
    title: key,
    template: `./src/${pages[key]}.html`,
    chunks: [key]
  }))
}

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  entry: entries,
  plugins: plugins,
  devServer: {
    static: './dist',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, output),
  },
  experiments: {
    topLevelAwait: true
  },
};
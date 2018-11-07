const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        bundle: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: 'index.html',
          inject: true
        }),
        new CopyWebpackPlugin([
            { from: 'static', to: 'static' }
        ]),
    ],
    module: {
       rules: [{
         test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }]
    }
};
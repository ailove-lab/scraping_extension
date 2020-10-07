const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.coffee',
  output: {
    filename: 'main.js'
  },
  module: {
    rules: [
      { test: /\.js$/            , use: 'babel-loader'    },
      { test: /\.vue$/           , use: 'vue-loader'      },
      { test: /\.pug$/           , use: 'pug-plain-loader'},
      { test: /\.coffee$/        , use: 'coffee-loader'   },
      { test: /\.(png|jpg|gif)$/i, use: 'url-loader'      },
      { test: /\.css$/           , use: [MiniCssExtractPlugin.loader, 'css-loader']},
      { test: /\.styl$/          , use: [MiniCssExtractPlugin.loader, 'css-loader','stylus-loader'] },
      // Vuetify
      { test: /\.s(c|a)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', { loader: 'sass-loader', options: { implementation: require('sass'), }, },],
      },
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
    // Сохраняем CSS отдельно
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),
    // Копируем библиотеки
    new CopyPlugin({
      patterns: [
        {from: "manifest.json"},
        {from: "img/favicon.png"},
        {from: "lib/xlsx.mini.min.js"},
        {from: "lib/vue.js"},
        {from: "lib/vuetify.js"},
        {from: "lib/vuetify.min.css"},
        {from: "fonts", to: "fonts"},
      ]
    })
  ]
};

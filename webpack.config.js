const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/main.js',
    product: './src/product.js'
  },
  output: {
    filename: '[name].js', // Outputs main.js and product.js
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // For style.css
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Your home page
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/product.html', // Product detail page
      filename: 'product.html',
      chunks: ['product']
    })
  ],
  devServer: {
    static: './dist',
    port: 3000,
    open: true
  },
  mode: 'development'
};

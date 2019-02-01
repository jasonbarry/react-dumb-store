const path = require('path')

module.exports = {
  mode: 'production',
  entry: [path.join(__dirname, 'index.js')],
  output: {
    library: 'store',
    libraryTarget: 'amd',
    path: path.join(__dirname, 'dist'),
    filename: 'index.js'
  },
  externals: {
    react: 'react',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true
          }
        }
      }
    ]
  },
}

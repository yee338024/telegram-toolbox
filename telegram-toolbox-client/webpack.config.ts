const path = require('node:path')

const CopyPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: { index: './src/index.ts' },
  target: 'electron-main',
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    path: path.join(__dirname, 'dist/out'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    // new Dotenv(),
    // new TsConfigPathsPlugin(),
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: false,
        },
        mangle: {
          toplevel: true,
        },
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: `./build/icon.png`, to: 'build' },
        { from: './preload.js', to: 'preload/index.js' },
        { from: `./build/icon.ico`, to: 'build' },
        { from: `./build/icon_32.ico`, to: 'build' },
      ],
    }),
  ],
}

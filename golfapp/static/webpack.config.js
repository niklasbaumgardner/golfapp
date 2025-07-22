const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
  entry: __dirname + "/js/main.mjs",
  output: {
    path: __dirname + "/js",
    filename: "bundle.mjs",
    library: {
      type: "module",
    },
  },
  module: {
    // Bundle styles into main.css
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../css/all-out.css",
    }),
  ],
  experiments: {
    outputModule: true,
  },
};
module.exports = config;

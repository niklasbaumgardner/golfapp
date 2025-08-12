const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  entry: {
    main: __dirname + "/js/main.mjs",
    css: __dirname + "/js/css.mjs",
    agGrid: __dirname + "/js/agGrid.mjs",
  },
  output: {
    path: __dirname + "/js",
    filename: "[name].bundle.mjs",
    library: {
      type: "module",
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({ minify: CssMinimizerPlugin.lightningCssMinify }),
      "...",
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../css/bundle.min.css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: __dirname + "/css/src/themes/",
          to: __dirname + "/css/[name].min.css",
          globOptions: {
            ignore: ["**/default.css"],
          },
        },
        {
          from: __dirname + "/css/src/color/",
          to: __dirname + "/css/[name].palette.min.css",
          globOptions: {
            ignore: ["**/default.css"],
          },
        },
        {
          from: __dirname + "/css/src/color/base.css",
          to: __dirname + "/css/base.css",
        },
      ],
    }),
  ],
  experiments: {
    outputModule: true,
  },
};
module.exports = config;

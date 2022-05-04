const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: path.join(__dirname, "/src/index.tsx"),
  stats: "errors-only",
  module: getLoaders(),
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: [
      ".ts",
      ".tsx",
      ".js",
      ".json",
      ".png",
      ".glb",
      ".jpg",
      ".mp3",
      ".svg",
      ".css",
      ".gif",
      ".mp4",
    ],
    alias: {
      assets: path.resolve(__dirname, "./src/assets"),
      core: path.resolve(__dirname, "./src/playable-scavenger-hunt-core"),
      ui: path.resolve(__dirname, "./src/playables-ui-dom"),
      sounds: path.resolve(__dirname, "./src/sounds"),
      analytics: path.resolve(__dirname, "./src/playables-analytics"),
      levels: path.resolve(__dirname, "./src/levels"),
      src: path.resolve(__dirname, "./src"),
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new ESLintPlugin({
      emitError: true,
      emitWarning: true,
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new webpack.ProvidePlugin({ "window.decomp": "poly-decomp" }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, "dist/**/*")],
    }),
  ],
};

/**
 * Loaders used by the application.
 */
function getLoaders() {
  const esbuild = {
    test: /\.tsx?$/,
    loader: "esbuild-loader",
    options: {
      loader: "tsx",
      target: "es2015",
    },
    exclude: /node_modules/,
  };
  const fileLoader = [
    {
      test: /\.(png|jpg|svg|glb|mp3|gif|mp4)$/,
      loader: "url-loader",
    },
  ];
  //remove css
  const cssLoader = {
    test: /\.css$/,
    use: ["style-loader", "css-loader"],
  };

  const loaders = {
    rules: [...fileLoader, cssLoader, esbuild],
  };

  return loaders;
}

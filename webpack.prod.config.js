const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const PATHS = {
  app: path.join(__dirname, "src/index.js"),
};

module.exports = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: __dirname + "/dist",
    filename: "looker_dashboard_comments.js",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        include: /src/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};

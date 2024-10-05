const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    "content.js": "./src/content.js",
  },
  output: {
    filename: "[name]",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./src/style.css", to: "./style.css" },
        { from: "./src/manifest.json", to: "./manifest.json" },
      ],
    }),
  ],
};

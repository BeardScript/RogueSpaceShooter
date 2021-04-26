const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, dir)
}

function getDevFiles() {
  const files = glob.sync(path.resolve("./Assets") + "/**/*.@(ts|js)", {
    ignore: [
      "**/*/_Editor/**/*",
      "**/*.d.ts",
    ]
  });
  return files;
}

function getEditorFiles() {
  const files = glob.sync( resolve("./Assets") + "/**/*.@(ts|js)", {
    ignore: [
      "**/*.d.ts",
    ]
  });
  return files;
}

module.exports = {
  mode: "development",
  entry: {
    "rogue-engine-user-scripts": getDevFiles(),
    "rogue-editor-user-scripts": {
      import: getEditorFiles(),
      dependOn: "rogue-engine-user-scripts",
    },
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd",
  },
  externals: {
    "rogue-engine": {
      commonjs: "rogue-engine",
      commonjs2: "rogue-engine",
      amd: "rogue-engine",
      root: "rogue-engine"
    },
    "rogue-editor": {
      commonjs: "rogue-editor",
      commonjs2: "rogue-editor",
      amd: "rogue-editor",
      root: "rogue-editor"
    },
    three: {
      commonjs: "three",
      commonjs2: "three",
      amd: "three",
      root: "three"
    },
  },
  resolve: {
    extensions: [".ts", ".js", ".json", "*"],
    modules: [
      resolve("node_modules"),
      resolve("_Rogue")
    ],
    alias: {
      "Assets": resolve("Assets"),
      "rogue-engine": resolve("_Rogue/rogue-engine"),
    },
    fallback: { "path": false, "fs": false }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [ /node_modules/, /_Rogue\/test/, /Assets\/test/, /\.d.ts?$/ ],
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [resolve("Assets")],
        exclude: [ /node_modules/, /src\/test/ ],
      },
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false,
    overlay: true,
    disableHostCheck: true,
    clientLogLevel: "warning"
  },
  performance: {
    hints: false
  },
  devtool: "source-map",
  plugins: [new ForkTsCheckerWebpackPlugin()]
}

if (process.env.NODE_ENV === "production") {
  module.exports.devtool = "source-map";

  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    
    new webpack.LoaderOptionsPlugin({
      minimize: false
    }),
  ]);
}

var path = require("path");
var glob = require("glob");
var webpack = require("webpack");

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: "development",
  entry: {
    "rogue-engine-user-scripts": glob.sync( resolve("./Assets") + "/**/*.@(ts|js)" ),
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
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [ /node_modules/, /_Rogue\/test/, /Assets\/test/ ],
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [resolve("Assets")],
        exclude: [ /node_modules/, /src\/test/ ],
        query: {
          presets: [
            "@babel/preset-env",
            {
              plugins: [
                "@babel/plugin-proposal-class-properties"
              ]
            }
          ],
        },
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
  devtool: "#eval-source-map",
}

if (process.env.NODE_ENV === "production") {
  module.exports.devtool = "#source-map";

  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    
    new webpack.LoaderOptionsPlugin({
      minimize: false
    })
  ]);
}

const path = require("path");
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: "./js/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [{
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env"]
                },
            },
        }]
    },
    target: 'node',
    watch: true
};

// module.exports = {
//     entry: "./app",
//     output: {
//         path: __dirname,
//         filename: "bundle.js"
//     },
//     module: {
//         loaders: [
//             {  
//                 test: /\.js$/,
//                 exclude: 'node_modules',
//                 loader: 'babel',
//                 query: {presets: ['es2015']},
//             }
//         ]
//     },
//     target: 'node'
// };
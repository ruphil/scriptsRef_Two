const path = require('path');
const webpack = require('webpack');

const typeScriptConfig = {
    mode: 'development',
    // mode: 'production',
    target: 'web',
    entry: './ts/client.ts',
    // devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'ts')]
            }
        ]
    },
    output: {
        filename: 'bundle-ts-client.js',
        path: path.resolve(__dirname, 'app')
    },
    // plugins: [
    //     new webpack.optimize.AggressiveMergingPlugin(),
    //     new webpack.optimize.SplitChunksPlugin()
    // ]
}

const javaScriptConfig = {
    mode: 'development',
    // mode: 'production',
    target: 'web',
    entry: './js/client.js',
    // devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'js')]
            }
        ]
    },
    output: {
        filename: 'bundle-js-client.js',
        path: path.resolve(__dirname, 'app')
    },
    // plugins: [
    //     new webpack.optimize.AggressiveMergingPlugin(),
    //     new webpack.optimize.SplitChunksPlugin()
    // ]
}

module.exports = [ typeScriptConfig, javaScriptConfig ]
const path = require('path');
const webpack = require('webpack');

const typeScriptConfig = {
    mode: 'development',
    // mode: 'production',
    target: 'node',
    entry: './src/index.ts',
    // devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    output: {
        filename: 'bundle-app.js',
        path: path.resolve(__dirname, 'app')
    },
    // plugins: [
    //     new webpack.optimize.AggressiveMergingPlugin(),
    //     new webpack.optimize.SplitChunksPlugin()
    // ]
}

module.exports = [ typeScriptConfig ]
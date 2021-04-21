const path = require('path');

const frontendConfig = {
    mode: 'development',
    target: 'web',
    entry: './src/client.ts',
    // devtool: 'source-map',
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
        path: path.resolve(__dirname, 'app-build')
    },
}

const backendConfig = {
    mode: 'development',
    target: 'node',
    entry: './src/server.ts',
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
        filename: 'bundle-server.js',
        path: path.resolve(__dirname, 'app-build')
    },

}

module.exports = [ frontendConfig, backendConfig ]

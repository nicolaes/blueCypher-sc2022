const path = require('path');

module.exports = {
    entry: './src/index.ts',
    resolve: {
        extensions: [".ts", ".js"]
    },
    mode: 'production',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: false
    },
};

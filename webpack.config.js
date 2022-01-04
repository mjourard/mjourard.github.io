const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = (env) => {
    const stage = env.stage ? env.stage : 'development'
    dotenv.config({
        path: path.resolve(__dirname, `backend/client/.env.${stage}`),
    })
    const config = {
        mode: stage,
        entry: './backend/client/index.js',
        plugins: [
            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, '_includes/webpack.head.html'),
                templateContent: ({htmlWebpackPlugin}) => `${htmlWebpackPlugin.tags.headTags}`,
                publicPath: "/dist/",
                hash: true,
                inject: false,
                title: stage,
                xhtml: true
            }),
            new webpack.DefinePlugin({
                STAGE: `"${stage}"`,
                IS_USER_FACING: process.env.IS_USER_FACING ? process.env.IS_USER_FACING : 'true',
                TRACKER_API_BASE_URL: `"${process.env.TRACKER_API_BASE_URL}"`
            })
        ],
        output: {
            filename: '[name].[contenthash].bundle.js',
            library: 'opensourceAnalytics',
            path: path.resolve(__dirname, 'dist'),
            clean: true
        },

    }
    switch (stage) {
        case 'production':
            config['devtool'] = 'source-map';
            break;
        case 'development':
        default:
            config['devtool'] = 'inline-source-map';
    }
    return config;
};

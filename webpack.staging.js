const path = require('path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
	devtool: 'inline-source-map',
	mode: 'staging',
	output: {
		path: path.join(__dirname, 'public/dist'),
		filename: `bundle.js`,
		publicPath: '/',
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		port: 8081,
		hot: true,
		historyApiFallback: true,
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('staging'),
		}),
		new HtmlWebpackPlugin({
			title: 'Form Builder',
			template: './public/index.html',
			minify: false,
		}),
		new Dotenv({
			path: './.env.staging',
			safe: true,
			allowEmptyValues: true,
		}), //in order for environment variable to work
	],
});

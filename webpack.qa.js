const path = require('path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PACKAGE = require('./package.json');
const version = PACKAGE.version;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
	devtool: 'source-map',
	mode: 'development',
	output: {
		path: path.join(__dirname, 'build'),
		filename: `bundle-${version}.js`,
		publicPath: '/',
	},
	optimization: {
		minimizer: [new CssMinimizerPlugin()],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Form Builder',
			template: './public/index.html',
			minify: true,
		}),
		new Dotenv({
			path: './.env.qa',
			safe: true,
			allowEmptyValues: true,
		}), //in order for environment variable to work
	],
});

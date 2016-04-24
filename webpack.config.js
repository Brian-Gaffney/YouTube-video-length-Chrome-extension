/*eslint-disable */

var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

	entry: {
		main: 'main.js',
		background: 'background.js',
		style: 'styles/style.scss'
	},

	output: {
		path: __dirname + '/build',
		filename: '[name].js',
		publicPath: '/'
	},

	devtool: process.env.NODE_ENV !== 'production'  ? 'cheap-module-source-map' : 'none',

	eslint: {
		formatter: require('eslint-friendly-formatter')
	},

	module: {

		loaders: [
			{
				test: /\.(js|svg)$/,
				loader: 'babel',
				include: [
					path.resolve(__dirname, 'src')
				],
				query: {
					presets: ['es2015']
				}
			},

			{
				test: /styles\/.+\.scss$/,
				loader: ExtractTextPlugin.extract(
					'style-loader',
					'css-loader!sass'
				)
			}
		]
	},

	resolve: {

		root: __dirname,

		// Resolve extensionless files with the list below.
		// Eg. require('foo') will resolve to 'foo.js' etc.
		extensions: ['', '.js'],

		// Add the src directory as a modules location
		modulesDirectories: [
			'src/',
			'node_modules'
		]
	},

	plugins: [
		new ExtractTextPlugin('styles.css'),

		new CopyWebpackPlugin([
			{
				from: 'src/manifest.json'
			},
			{
				from: 'src/images/'
			}
		])
	]
};

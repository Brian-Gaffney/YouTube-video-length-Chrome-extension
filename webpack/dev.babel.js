import CopyWebpackPlugin from 'copy-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

import rules from './rules'

export default {
	devtool: 'inline-source-map',

	entry: {
		main: `${__dirname}/../src/main.js`,
		background: `${__dirname}/../src/background.js`,
		style: `${__dirname}/../src/styles/style.scss`,
	},

	output: {
		path: `${__dirname}/../build`,
		filename: '[name].js',
		publicPath: '/',
	},

	module: {
		rules,
	},

	plugins: [
		new ExtractTextPlugin('styles.css'),

		new CopyWebpackPlugin([
			{
				from: 'src/manifest.json',
			},
			{
				from: 'src/images/',
			},
		]),
	],
}
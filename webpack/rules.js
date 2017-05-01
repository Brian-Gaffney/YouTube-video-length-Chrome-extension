import ExtractTextPlugin from 'extract-text-webpack-plugin'

export default [
	{
		test: /\.js?$/,
		use: 'babel-loader',
		exclude: /node_modules/,
	},

	{
		test: /styles\/.+\.scss$/,
		loader: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: 'css-loader!sass-loader',
		}),
	},
]
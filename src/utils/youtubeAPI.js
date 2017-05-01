import Promise from 'bluebird'

import {
	youtubeApiKey,
} from '../config'

const apiRequestParts = [
	'snippet',
	'contentDetails',
	'statistics',
].join(',')

const apiRequestFields = [
	'items/snippet/title',
	'items/snippet/channelTitle',
	'items/snippet/thumbnails',
	'items/contentDetails/duration',
	'items/contentDetails/regionRestriction',
	'items/contentDetails/contentRating',
	'items/statistics',
].join(',')

const apiUrl = [
	'https://www.googleapis.com/youtube/v3/videos',
	`?part=${apiRequestParts}`,
	`&key=${youtubeApiKey}`,
	`&fields=${apiRequestFields}`,
].join('')

function loadVideoData (videoIDs) {
	const fetchVideoDataPromises = videoIDs.map(videoID => {
		return fetch(`${apiUrl}&id=${videoID}`)
			.then(response => response.json())
			.then(videoData => {
				return {
					videoID,
					data: videoData && videoData.items && videoData.items[0] ? videoData.items[0] : null,
				}
			})
	})

	return Promise.all(fetchVideoDataPromises)
		.then(videoData => {
			return videoData.reduce((memo, data) => {
				memo[data.videoID] = data.data
				return memo
			}, {})
		})
		.catch(error => {
			console.log('Failed to get data from API', error)
		})
}

export {
	loadVideoData,
}
import {
	youtubeApiKey,
} from '../config'

const apiRequestParts = [
	'snippet',
	'contentDetails',
	'statistics',
].join(',')

const apiRequestFields = [
	'items/id',
	'items/snippet/title',
	'items/snippet/channelTitle',
	'items/snippet/thumbnails',
	'items/snippet/publishedAt',
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
	return fetch(`${apiUrl}&id=${videoIDs.join(',')}`)
		.then(response => response.json())
		.then(videoData => {
			return videoIDs
				.reduce((memo, videoID) => {
					memo[videoID] = videoData.items.find(v => v.id === videoID)
					return memo
				}, {})
		})
}

export {
	loadVideoData,
}
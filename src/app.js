import getAllYouTubeLinksOnPage from './utils/getAllYouTubeLinksOnPage'
import {
	showVideoData,
} from './ui'
import {
	loadVideoData,
} from './utils/youtubeAPI'

class App {

	constructor () {
		this.videoLinks = {}
		this.videoData = {}
		this.attachedDurations = 0
	}

	initialize (countryCode) {
		this.countryCode = countryCode

		const youtubeLinks = getAllYouTubeLinksOnPage()

		let videoIDs = this.getUniqueVideoIDs(youtubeLinks)

		// Nest each link under it's videoID
		this.videoLinks = videoIDs.reduce((memo, videoID) => {
			memo[videoID] = youtubeLinks.filter(link => link.videoID === videoID)
			return memo
		}, {})

		loadVideoData(videoIDs)
			.then(videoData => {
				this.videoData = videoData
			})
			.then(() => {
				showVideoData(this.videoLinks, this.videoData, this.countryCode)
			})
	}

	getUniqueVideoIDs (links) {
		return links
			.map(link => {
				return link.videoID
			})
			.reduce((a, b) => {
				if (a.indexOf(b) < 0) {
					a.push(b)
				}

				return a
			}, [])
	}
}

export default App
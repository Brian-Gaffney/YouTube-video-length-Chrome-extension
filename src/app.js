import throttle from 'lodash/throttle'

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
	}

	initialize (countryCode) {
		this.countryCode = countryCode

		const youtubeLinks = getAllYouTubeLinksOnPage()

		const videoIDs = this.getUniqueVideoIDs(youtubeLinks)

		this.initializeDomMutationObserver()

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

	// Listen for DOM changes on the <body>
	// Run a throttled version of onDomMutated when changes occur
	initializeDomMutationObserver () {
		const domObserver = new MutationObserver(throttle(this.onDomMutated, 1000, {
			leading: true,
		}))

		const observerConfig = { subtree: true, childList: true }

		const body = document.querySelector('body')

		domObserver.observe(body, observerConfig)
	}

	onDomMutated = () => {
		console.log('### onDomMutated()')

		const youtubeLinks = getAllYouTubeLinksOnPage()

		const videoIDs = this.getUniqueVideoIDs(youtubeLinks)

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

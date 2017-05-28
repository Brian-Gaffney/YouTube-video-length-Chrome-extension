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
		this.fetching = true
	}

	initialize (countryCode) {
		this.countryCode = countryCode

		// Small delay for starting DOM mutation observer
		window.setTimeout(() => {
			this.initializeDomMutationObserver()
		}, 500)

		const youtubeLinks = getAllYouTubeLinksOnPage()

		const videoIDs = this.getUniqueVideoIDs(youtubeLinks)

		this.videoLinks = this.reduceVideoLinks(videoIDs, youtubeLinks)

		if (videoIDs.length > 1) {
			this.fetching = true

			loadVideoData(videoIDs)
				.then(videoData => {
					this.fetching = false
					this.videoData = videoData
				})
				.then(() => {
					showVideoData(this.videoLinks, this.videoData, this.countryCode)
				})
		}
	}

	onDomMutated = () => {
		const youtubeLinks = getAllYouTubeLinksOnPage()

		const videoIDs = this.getUniqueVideoIDs(youtubeLinks)

		// Filter out videos we've already loaded
		const newVideoIDs = videoIDs.filter(id => !this.videoData[id])

		const videoLinks = this.reduceVideoLinks(videoIDs, youtubeLinks)

		// Merge the new videoLinks in
		this.videoLinks = {
			...this.videoLinks,
			...videoLinks,
		}

		if (newVideoIDs.length > 1 || this.fetching) {
			loadVideoData(newVideoIDs)
				.then(videoData => {
					this.videoData = {
						...this.videoData,
						...videoData,
					}
				})
				.then(() => {
					showVideoData(this.videoLinks, this.videoData, this.countryCode)
				})
		}
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

	// Nest each link under it's videoID
	reduceVideoLinks (videoIDs, youtubeLinks) {
		return videoIDs.reduce((memo, videoID) => {
			memo[videoID] = youtubeLinks.filter(link => link.videoID === videoID)
			return memo
		}, {})
	}
}

export default App

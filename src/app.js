import throttle from 'lodash/throttle'
import difference from 'lodash/difference'

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
		this.videoData = {} // Video data for successfully loaded video IDs
		this.videoIDs = [] // Video IDs found on the page - Working or not
		this.fetching = true
	}

	initialize (countryCode) {
		this.countryCode = countryCode

		// Small delay for starting DOM mutation observer
		window.setTimeout(() => {
			this.initializeDomMutationObserver()
		}, 500)

		const youtubeLinks = getAllYouTubeLinksOnPage()

		this.videoIDs = this.getUniqueVideoIDs(youtubeLinks)

		this.videoLinks = this.reduceVideoLinks(this.videoIDs, youtubeLinks)

		if (this.videoIDs.length > 0) {
			this.fetching = true

			loadVideoData(this.videoIDs)
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

		// Filter out videos we've already seen on the page before
		const newVideoIDs = difference(videoIDs, this.videoIDs)

		this.videoIDs = videoIDs;

		const videoLinks = this.reduceVideoLinks(this.videoIDs, youtubeLinks)

		// Merge the new videoLinks in
		this.videoLinks = {
			...this.videoLinks,
			...videoLinks,
		}

		if (newVideoIDs.length > 0) {
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

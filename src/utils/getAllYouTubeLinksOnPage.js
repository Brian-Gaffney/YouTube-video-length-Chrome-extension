import {
	isYoutubeDomain,
} from '../utils'

import getVideoIDFromUrl from './getVideoIDFromUrl'

export default function getAllYouTubeLinksOnPage () {
	// Get all links on the page
	let youtubeLinks = document.querySelectorAll('a[href]')

	// Convert NodeList of links into array of links
	youtubeLinks = Array.prototype.slice.call(youtubeLinks)

	// Filter the links to just the youtube ones
	youtubeLinks = youtubeLinks.filter(link => {
		let hostname = new URL(link.href).hostname

		return isYoutubeDomain(hostname)
	})

	// Extract the videoIDs from the links
	youtubeLinks = youtubeLinks.map(link => {
		let videoID = getVideoIDFromUrl(link.href)

		return {
			link,
			videoID,
		}
	})

	// Filter out any links that don't have a videoID
	// eg. youtube.com or youtube.com/blah
	youtubeLinks = youtubeLinks.filter(link => {
		return !!link.videoID
	})

	return youtubeLinks
}
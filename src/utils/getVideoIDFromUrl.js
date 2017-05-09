import queryString from 'query-string'

// Regexes:
// 1. {domain}/v/{videoID}
const videoIDRegex1 = /\/v\/([a-zA-Z0-9_-]*)/

// 2. youtu.be/{videoID}
const videoIDRegex2 = /youtu.be\/([a-zA-Z0-9_-]*)/

// 3. v={videoID}
const videoIDRegex3 = /v=([a-zA-Z0-9_-]*)/

export default function getVideoIDFromUrl (href) {
	href = decodeURIComponent(href)

	let match // One variable used to store results of various regexes
	let url = new URL(href)

	if (!url) {
		return
	}

	// Check for ?v={videoID}
	match = queryString.parse(url.search)
	if (match.v) {
		return match.v
	}

	// Check for ?u=/watch?v={videoID}
	if (match.u) {
		match = videoIDRegex3.exec(match.u)
		if (match) {
			return match[1]
		}
	}

	// Check for /v/{videoID}
	match = videoIDRegex1.exec(href)
	if (match) {
		return match[1]
	}

	// Check for youtu.be/{videoID}
	match = videoIDRegex2.exec(href)
	if (match) {
		return match[1]
	}
}
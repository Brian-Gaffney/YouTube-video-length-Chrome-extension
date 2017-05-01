import queryString from 'query-string'

// #t=5m30s or #t=5m or #t=30
const videoOffsetRegex1 = /.*#t=(.*)$/

// t=5m30s or t=5m or t=30s
const videoOffsetRegex2 = /(?:([0-9]+)m)?(?:([0-9]+)s)?/

function parseVideoOffset (offset) {
	// Simple int
	if (!isNaN(parseFloat(offset)) && isFinite(offset)) {
		return offset
	}

	const match = offset.match(videoOffsetRegex2)

	// Check for things like: 5m30s or 5m or 30s
	if (match && (((match[1] - parseFloat(match[1]) + 1) >= 0) || ((match[2] - parseFloat(match[2]) + 1) >= 0))) {

		let offset = 0

		if ((parseFloat(match[1]) + 1) >= 0) {
			offset += parseFloat(match[1] * 60)
		}

		if ((parseFloat(match[2]) + 1) >= 0) {
			offset += parseFloat(match[2])
		}

		return offset
	}

	return false
}

// Checks for t=<offset> or #t=<offset> in the videoUrl
// Returns offset in seconds or 0
export default function getVideoOffset (href) {
	let url = new URL(href)

	// Check for t=<offset>
	let urlParams = queryString.parse(url.search)
	if (urlParams.t) {
		let offset = parseVideoOffset(urlParams.t)

		if (offset) {
			return offset
		}
	}

	// Check for #t=<offset>
	let match = href.match(videoOffsetRegex1)
	if (match) {
		let offset = parseVideoOffset(match[1])

		if (offset) {
			return offset
		}
	}

	return 0
}
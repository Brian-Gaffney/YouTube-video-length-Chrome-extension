import Tooltip from 'tether-tooltip'
import moment from 'moment'

import {
	contentWarning,
	ISO8601DurationToSeconds,
	prettyPrintSeconds,
	regionAllowed,
} from './utils'
import getVideoOffset from './utils/getVideoOffset'

const classPrefix = 'youtube-chrome-tooltip-extension-'

function createTooltipContent (videoData, prettyDuration) {
	if (!videoData) {
		return 'Video unavailable'
	}

	const {
		snippet: {
			channelTitle,
			publishedAt,
			thumbnails,
			title,
		},
		statistics: {
			dislikeCount,
			likeCount,
			viewCount,
		},
	} = videoData

	/*
	 * Tooltip layout:
	  +----------------------------------------------+---------------------+
	  |     [Length] Video title                     |                     |
	  |     Video channel                            |                     |
	  |                                              |    Thumbnail        |
	  |     Number of views                          |                     |
	  |     Ups / Downs                              |                     |
	  +----------------------------------------------+---------------------+
	 *
	 */

	// Video length, title and channel
	let content = `
		<h4 class="${classPrefix}video-title">
			[${prettyDuration}] ${title}
		</h4>
		<span class="${classPrefix}channel-name">
			${channelTitle}
		</span>
		<br />
	`

	const publishedDate = moment(publishedAt)
	const timeSincePublished = publishedDate.isValid() ? `Published ${publishedDate.fromNow()} ` : ''

	// If available; views, likes and dislikes and published date
	if (viewCount && likeCount && dislikeCount) {
		const nicelyFormattedViewCount = parseInt(viewCount, 10).toLocaleString()
		const viewCountSuffix = `view${viewCount === '1' ? '' : 's'}` // "view" or "views"

		content += `
			${nicelyFormattedViewCount} ${viewCountSuffix}
			${timeSincePublished ? ` - ${timeSincePublished}` : ''}
			<br />
			<span>
				<span class="${classPrefix}up-character">▲</span> ${parseInt(likeCount, 10).toLocaleString()} / ${parseInt(dislikeCount, 10).toLocaleString()} <span class="${classPrefix}down-character">▼</span>
			</span>
		`
	} else {
		// No stats
		content += `
			${timeSincePublished}
			<span class="${classPrefix}stats-unavailable">
				Stats disabled by uploader
			</span>
		`
	}

	let thumbnail = ''
	if (thumbnails && thumbnails.default) {
		const {
			default: {
				url,
				width,
				height,
			},
		} = thumbnails

		thumbnail += `
			<div class="${classPrefix}content-right">
				<img
					src="${url}"
					width="${width}"
					height="${height}"
				/>
			</div>
		`
	}

	return `
		<div class="${classPrefix}content-row">
			<div class="${classPrefix}content-left">
				${content}
			</div>

			${thumbnail}
		</div>
	`
}

function attachTooltipToLink (videoID, videoLinks, videoData, countryCode) {
	const matchingVideos = videoLinks[videoID]

	matchingVideos.forEach(video => {
		let target = video.link

		let prettyDuration

		let suffix = ''

		if (videoData) {
			let duration = ISO8601DurationToSeconds(videoData.contentDetails.duration)

			duration -= getVideoOffset(video.link.href)

			prettyDuration = prettyPrintSeconds(duration)

			if (prettyDuration) {
				suffix = `${suffix}[${prettyDuration}]`
			}

			if (contentWarning(videoData)) {
				suffix = `${suffix}[18+]`
			}

			if (!regionAllowed(countryCode, videoData.contentDetails)) {
				suffix = `${suffix} [❌ country blocked]`
			}
		} else {
			suffix = '[❌]'
		}

		// Do things a little differently if the link contains an image
		if (video.link.getElementsByTagName('img').length > 0) {
			target = video.link.getElementsByTagName('img')[0]
		} else {
			// For text links, update the link to show some more data
			let originalLinkText = video.link.innerHTML

			let root = video.link.createShadowRoot()
			root.innerHTML = `${originalLinkText} <strong>${suffix}</strong>`
		}

		// Add the tooltip
		new Tooltip({
			target,
			content: createTooltipContent(videoData, prettyDuration),
			position: 'top left',
			tetherOptions: {
				offset: '4px 4px',
			},
			classes: 'youtube-chrome-extension',
		})

		chrome.runtime.sendMessage({
			type: 'attachedLink',
		})

	})
}

function showVideoData (videoLinks, videoData, countryCode) {
	Object.keys(videoLinks)
		.map(videoID => {
			attachTooltipToLink(videoID, videoLinks, videoData[videoID], countryCode)
		})
}

export {
	showVideoData,
}
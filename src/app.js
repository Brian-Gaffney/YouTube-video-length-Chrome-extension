import queryString from 'query-string';
import Tooltip from 'tether-tooltip';

import {
	ISO8601DurationToSeconds,
	prettyPrintSeconds,
	contentWarning,
	regionAllowed,
	parseVideoOffset
} from 'utils';

const apiKey = 'AIzaSyDaj-tAbohVgEttLWimqW-gPY-5y5xvSHc';

const youtubeDomains = [
	'youtube.com',
	'm.youtube.com',
	'youtu.be',
	'm.youtu.be',
	'youtube.co.uk'
];

const youtubeDomainRegex = new RegExp(`^(www.)?(${youtubeDomains.join('|')})$`);

// {domain}/v/{videoID}
const videoIDRegex1 = /\/v\/([a-zA-Z0-9_-]*)/;

// youtu.be/{videoID}
const videoIDRegex2 = /youtu.be\/([a-zA-Z0-9_-]*)/;

// v={videoID}
const videoIDRegex3 = /v=([a-zA-Z0-9_-]*)/;

// #t=5m30s or #t=5m or #t=30
const videoOffsetRegex = /.*#t=(.*)$/;


const apiRequestParts = [
	'snippet',
	'contentDetails',
	'statistics'
].join(',');

const apiRequestFields = [
	'items/snippet/title',
	'items/snippet/channelTitle',
	'items/contentDetails/duration',
	'items/contentDetails/regionRestriction',
	'items/contentDetails/contentRating',
	'items/statistics'
].join(',');

const apiUrl = [
	'https://www.googleapis.com/youtube/v3/videos',
	`?part=${apiRequestParts}`,
	`&key=${apiKey}`,
	`&fields=${apiRequestFields}`
].join('');

class App {

	constructor () {
		this.videos = {};
		this.attachedDurations = 0;
	}

	getVideoID (href) {
		href = decodeURIComponent(href);

		let match; // One variable used to store results of various regexes
		let url = new URL(href);

		if (!url) {
			return;
		}

		// Check for ?v={videoID}
		match = queryString.parse(url.search);
		if (match.v) {
			return match.v;
		}

		// Check for ?u=/watch?v={videoID}
		if (match.u) {
			match = videoIDRegex3.exec(match.u);
			if (match) {
				return match[1];
			}
		}

		// Check for /v/{videoID}
		match = videoIDRegex1.exec(href);
		if (match) {
			return match[1];
		}

		// Check for youtu.be/{videoID}
		match = videoIDRegex2.exec(href);
		if (match) {
			return match[1];
		}
	}

	initialize (countryCode) {

		this.countryCode = countryCode;

		// Get all links on the page
		let links = document.querySelectorAll('a[href]');

		// Convert NodeList of links into array of links
		links = Array.prototype.slice.call(links);

		// Filter the links to just the youtube ones
		links = links.filter((link) => {
			let hostname = new URL(link.href).hostname;

			return youtubeDomainRegex.test(hostname);
		});

		// Extract the videoIDs from the links
		links = links.map((link) => {
			let videoID = this.getVideoID(link.href);

			return {
				link,
				videoID
			};
		});

		// Filter out any links that don't have a videoID
		// eg. youtube.com or youtube.com/blah
		links = links.filter((link) => {
			return !!link.videoID;
		});

		let videoIDs = this.getUniqueVideoIDs(links);

		// Organise links by videoID
		let linksTmp = {};
		videoIDs.forEach((videoID) => {
			linksTmp[videoID] = links.filter((link) => {
				return link.videoID === videoID;
			});
		});

		this.videos = linksTmp;

		this.loadVideoData(videoIDs);
	}

	getUniqueVideoIDs (links) {
		// Get unique videoIDs
		return links
			.map((link) => {
				return link.videoID;
			})
			.reduce((a, b) => {
				if (a.indexOf(b) < 0) {
					a.push(b);
				}

				return a;
			}, [])
		;
	}

	// Checks for t=<offset> or #t=<offset> in the videoUrl
	// Returns offset in seconds or 0
	getVideoOffset (href) {
		let url = new URL(href);

		// Check for t=<offset>
		let urlParams = queryString.parse(url.search);
		if (urlParams.t) {
			let offset = parseVideoOffset(urlParams.t);

			if (offset) {
				return offset;
			}
		}

		// Check for #t=<offset>
		let match = href.match(videoOffsetRegex);
		if (match) {
			let offset = parseVideoOffset(match[1]);

			if (offset) {
				return offset;
			}
		}

		return 0;
	}

	showVideoData (videoID, data) {
		let matchingVideos = this.videos[videoID];

		matchingVideos.forEach((video) => {
			let target = video.link;

			let videoTooltipText;
			let prettyDuration;

			let suffix = '';

			if (!data) {
				videoTooltipText = 'Video unavailable';
				suffix = '[❌]';
			}
			else {
				videoTooltipText = `${data.snippet.title}`;
				let duration = ISO8601DurationToSeconds(data.contentDetails.duration);

				duration -= this.getVideoOffset(video.link.href);

				prettyDuration = prettyPrintSeconds(duration);


				if (prettyDuration) {
					suffix = `${suffix}[${prettyDuration}]`;
				}

				if (contentWarning(data)) {
					suffix = `${suffix}[18+]`;
				}

				if (!regionAllowed(this.countryCode, data.contentDetails)) {
					suffix = `${suffix} [❌ country blocked]`;
				}
			}

			let videoInformation = videoTooltipText;

			// Do things a little differently if the link contains an image
			if (video.link.getElementsByTagName('img').length > 0) {
				target = video.link.getElementsByTagName('img')[0];

				videoInformation = `${videoTooltipText} <strong>${suffix}</strong>`;
			}
			else {
				// For text links, update the link to show some more data
				let originalLinkText = video.link.innerHTML;

				let root = video.link.createShadowRoot();
				root.innerHTML = `${originalLinkText} <strong>${suffix}</strong>`;
			}

			// Add the tooltip
			new Tooltip({
				target,
				content: videoInformation,
				position: 'top left',
				tetherOptions: {
					offset: '4px 4px'
				},
				classes: 'youtube-chrome-extension'
			});

			chrome.runtime.sendMessage({
				type: 'updateBadgeText',
				badgeText: ++this.attachedDurations
			});

		});
	}

	loadVideoData (videoIDs) {
		videoIDs.forEach((videoID) => {
			let url = `${apiUrl}&id=${videoID}`;

			fetch(url)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					this.showVideoData(videoID, data.items[0]);
				})
				.catch((error) => {
					console.log('Failed to get data from API', error);
				});
		});
	}

	mapLinks (videoLink) {
		videoLink.findSelector = videoLink.setSelector.replace('{{videoID}}', '');

		return videoLink;
	}

	createSelector () {
		return this.videoLinks.map((link) => {
			return `${link.findSelector}:not([duration-attached])`;
		}).reduce((a, b) => {
			return `${a}, ${b}`;
		});
	}
}

export default App;
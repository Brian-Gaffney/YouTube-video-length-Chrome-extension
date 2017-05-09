// This page runs once within a Chrome session

// Number of links affected - Indexed by tabId
const attachedLinksCount = {}

let countryCode = null

// Used for passing messages back and forth between the page extension JS and the Chrome runtime
const processMessage = (message, sender, sendResponse) => {
	let tabID = sender.tab.id

	switch (message.type) {
		case 'updateBadgeText':
			if (message.badgeText) {
				chrome.browserAction.setBadgeText({
					text: String(message.badgeText),
					tabId: tabID,
				})
			}

			break

		case 'attachedLink':
			if (!attachedLinksCount[tabID]) {
				attachedLinksCount[tabID] = 0
			}

			chrome.browserAction.setBadgeText({
				text: String(++attachedLinksCount[tabID]),
				tabId: tabID,
			})

			break

		case 'enableBadge':
			chrome.browserAction.setIcon({
				tabId: tabID,
				path: '48.png',
			})
			break

		case 'disableBadge':
			chrome.browserAction.setIcon({
				tabId: tabID,
				path: 'disabled-48.png',
			})
			break

		// Return the users country code to the calling page
		case 'getUserCountryCode':
			getUserCountryCode()
				.then(countryCode => {
					sendResponse(countryCode)
				})
				.catch(() => {
					sendResponse(null)
				})

			// Return true to tell Chrome that the sendResponse() call will happen asynchronously
			return true

		default:
			console.info('Unknown message received', message)
	}
}

// Returns a promise and resolves with the users country code or null
function getUserCountryCode () {
	if (countryCode) {
		return Promise.resolve(countryCode)
	}

	return findUserCountryCode()
}

// Try and determine users location
function findUserCountryCode () {
	return fetch('https://geoip.nekudo.com/api/')
		.then(response => response.json())
		.then(data => {
			countryCode = data.country.code.toUpperCase()
			return countryCode
		})
		.catch(error => {
			console.info('Failed to get user country code', error)
		})
}

// Recieve messages from content scripts
chrome.extension.onMessage.addListener(processMessage)
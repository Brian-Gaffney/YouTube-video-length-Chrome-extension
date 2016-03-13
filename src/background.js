let countryCode = null;

const processMessage = (message, sender, callback) => {
	let tabID = sender.tab.id;

	switch (message.type) {
		case 'updateBadgeText':
			if (message.badgeText) {
				chrome.browserAction.setBadgeText({
					text: String(message.badgeText),
					tabId: tabID
				});
			}

			break;

		case 'enableBadge':
			chrome.browserAction.setIcon({
				tabId: tabID,
				path: '48.png'
			});
			break;

		case 'disableBadge':
			chrome.browserAction.setIcon({
				tabId: tabID,
				path: 'disabled-48.png'
			});
			break;

		// Return the users country code to the calling page
		case 'getUserCountryCode':
			if (!countryCode) {
				findUserCountryCode();
			}

			callback(countryCode);
			break;

		default:
			console.log('Unknown message received', message);
	}
};

const findUserCountryCode = () => {
	// Try and determine users location
	fetch('https://geoip.nekudo.com/api/')
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			countryCode = data.country.code.toUpperCase();
		})
		.catch((error) => {
			console.warn('Failed to get user country code', error);
		})
	;
};


// Run on first install
chrome.runtime.onInstalled.addListener(findUserCountryCode);

// Run when starting Chrome or changing profile
chrome.runtime.onStartup.addListener(findUserCountryCode);

// Recieve messages from content scripts
chrome.extension.onMessage.addListener(processMessage);
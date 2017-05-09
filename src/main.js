// This file runs for every page loaded in chrome

import App from './app'
import {
	isDomainBlacklisted,
} from './utils'

//Don't run on blacklisted domains
if (isDomainBlacklisted(window.location.hostname)) {

	// Set badge to disabled then do nothing
	chrome.runtime.sendMessage({
		type: 'disableBadge',
	})

	chrome.runtime.sendMessage({
		type: 'updateBadgeText',
		badgeText: 'x',
	})
} else {
	chrome.runtime.sendMessage({
		type: 'enableBadge',
	})

	// Get the users country code and run the app
	chrome.runtime.sendMessage({
		type: 'getUserCountryCode',
	}, countryCode => {
		const app = new App()
		app.initialize(countryCode)
	})
}

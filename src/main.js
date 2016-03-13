import App from 'app';

//Don't run on blacklisted domains
const blackListedDomains = [
	'youtube.com',
	'm.youtube.com',
	'youtu.be',
	'm.youtu.be',
	'youtube.co.uk',
	'google.com'
];

const blackListedDomainsRegex = new RegExp(`^(www.)?(${blackListedDomains.join('|')})$`);

if (blackListedDomainsRegex.test(window.location.hostname)) {

	// Set badge to disabled then do nothing
	chrome.runtime.sendMessage({
		type: 'disableBadge'
	});

	chrome.runtime.sendMessage({
		type: 'updateBadgeText',
		badgeText: 'x'
	});
}
else {
	chrome.runtime.sendMessage({
		type: 'enableBadge'
	});

	let app = new App();

	chrome.runtime.sendMessage({
		type: 'getUserCountryCode'
	}, (countryCode) => {
		app.initialize(countryCode);
	});
}

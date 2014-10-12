chrome.extension.onMessage.addListener(function(message, sender) {
	var tab_id = sender.tab.id;

	if(message.badge_text) {
		chrome.browserAction.setBadgeText({
			text: String(message.badge_text),
			tabId: tab_id
		});
	}

});
//Recieve messages from content scripts 
chrome.extension.onMessage.addListener(function(message, sender) {
	var tabID = sender.tab.id;

	switch(message.type) {
		case updateBadge:
			if(message.badgeText) {
				chrome.browserAction.setBadgeText({
					text: String(message.badgeText),
					tabId: tabID
				});
			}
			break;
		default:
			console.log("Unknown message recieved", message);
	}
});
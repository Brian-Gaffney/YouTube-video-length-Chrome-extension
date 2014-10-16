//Recieve messages from content scripts 
chrome.extension.onMessage.addListener(function(message, sender) {
	var tabID = sender.tab.id;

	switch(message.type) {
		case "updateBadgeText":
			if(message.badgeText) {
				chrome.browserAction.setBadgeText({
					text: String(message.badgeText),
					tabId: tabID
				});
			}
			break;
		case "enableBadge":
			chrome.browserAction.setIcon({
				tabId: tabID,
				path: 'icon.png'
			});
			break;
		case "disableBadge":
			chrome.browserAction.setIcon({
				tabId: tabID,
				path: 'disabled_icon.png'
			});
			break;
		default:
			console.log("Unknown message recieved", message);
	}
});
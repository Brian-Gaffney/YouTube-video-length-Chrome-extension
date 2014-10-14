var extension = {
	videoLinks: [
		{
			service: 'youtube',
			findSelector: 'a[href^="http://youtube.com/watch"]',
			setSelector: 'a[href^="http://youtube.com/watch?v={{videoID}}"]'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="http://www.youtube.com/watch"]',
			setSelector: 'a[href^="http://www.youtube.com/watch?v={{videoID}}"]'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="https://youtube.com/watch"]',
			setSelector: 'a[href^="https://youtube.com/watch?v={{videoID}}"]'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="https://www.youtube.com/watch"]',
			setSelector: 'a[href^="https://www.youtube.com/watch?v={{videoID}}"]'
		},
		{
			service: 'youtu.be',
			findSelector: 'a[href^="http://youtu.be"]',
			setSelector: 'a[href^="http://youtu.be/{{videoID}}"]'
		},
		{
			service: 'youtu.be',
			findSelector: 'a[href^="https://youtu.be"]',
			setSelector: 'a[href^="https://youtu.be/{{videoID}}"]'
		},
		{
			service: 'm.youtube',
			findSelector: 'a[href^="http://m.youtube.com/watch"]',
			setSelector: 'a[href^="http://m.youtube.com/watch?v={{videoID}}"]'
		},
		{
			service: 'm.youtube',
			findSelector: 'a[href^="https://m.youtube.com/watch"]',
			setSelector: 'a[href^="https://m.youtube.com/watch?v={{videoID}}"]'
		}
	],

	apiKey: "AIzaSyDaj-tAbohVgEttLWimqW-gPY-5y5xvSHc",
	selector: {},
	videos: {},
	maxAnchors: 50,
	attachedDurations: 0,

	initialize: function() {
		var self = this;

		self.selector = self.videoLinks.map(function(vl) {
			return vl.findSelector;
		}).reduce(function(a,b) {
			return a + ", " + b;
		});

		youTubeLinks = document.querySelectorAll(self.selector);

		for(var i = 0, len = youTubeLinks.length; i < len && i < self.maxAnchors; i++) {
			var videoUrl = youTubeLinks[i].getAttribute('href');
			var videoID = self.getVideoId(videoUrl);

			//Dedupe
			if(self.videos[videoID]) {
				continue;
			}
			self.videos[videoID] = {};

			var promise = self.getVideoInfo(videoID);

			promise.then(function(result) {
				self.showDuration(result.videoID, result.videoDuration);
			}, function(error) {
				console.log('promise failed', error);
			});
		}
	},

	getVideoInfo: function(videoID) {
		var self = this;
		var apiURL = "https://www.googleapis.com/youtube/v3/videos"
			+ "?part=contentDetails,statistics"
			+ "&fields=items/contentDetails/duration,items/statistics/likeCount"
			+ "&id=" + videoID
			+ "&key=" + self.apiKey;

		var xhr = new XMLHttpRequest();
		xhr.open("GET", apiURL, true);

		var promise = new Promise(function(resolve, reject) {
			xhr.onreadystatechange = function() {
				if(xhr.status === 200) {

					if(xhr.readyState === 3) {
						var response = JSON.parse(xhr.responseText);

						if(response.items[0]) {
							var videoDuration = IS08601DurationToSeconds(response.items[0].contentDetails.duration);

							resolve({
								videoID: videoID,
								videoDuration: videoDuration
							});
						}
					}

				} else {
					reject(xhr);
				}
			};

			xhr.send();
		});

		return promise;
	},

	getVideoId: function(videoUrl) {
		var res;

		//Check for youtu.be link shortener
		if(videoUrl.search("http://youtu.be") === 0 || videoUrl.search("https://youtu.be") === 0) {
			res = videoUrl.replace("http://youtu.be/", "").replace("https://youtu.be/", "");
		} else { //Normal youtube.com URL
			var regex = /v=[\w_-]+/g;
			res = regex.exec(videoUrl)[0];
			res = res.slice(2,res.length);
		}

		return res;
	},

	showDuration: function(videoID, duration) {
		var self = this;

		var selector = self.videoLinks.map(function(vl) {
			return vl.setSelector.replace("{{videoID}}", videoID);
		}).reduce(function(a,b) {
			return a + ", " + b;
		});

		var anchors = document.querySelectorAll(selector);

		duration = prettyPrintSeconds(duration);

		for (var i = 0, len = anchors.length; i < len; i++) {

			var el = anchors[i];

			//Only attach if the anchor contains text
			if(el.innerText !== "") {
				var durationElement = document.createElement("span");
				durationElement.className = "video-duration";
				var durationContent = document.createTextNode("[" + duration + "]");
				durationElement.appendChild(durationContent);
				el.appendChild(durationElement);

				//Update the plugin icon to show the count of video durations shown
				chrome.runtime.sendMessage({
					type: 'updateBadge',
					badgeText: ++self.attachedDurations
				});
			}
		}
	}
};

var siteBlacklist = [
	"^http[s]?:\/\/[www]{0,3}m?\.?youtube\.com",
	"^http[s]?:\/\/.*google.*q="
];

var re = new RegExp(siteBlacklist.join("|"));
if(window.location.href.match(re) == null) {
	console.log("Run on this site");
	extension.initialize();
} else {
	console.log("Dont run on this site");
}
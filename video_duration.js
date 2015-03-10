var extension = {
	siteBlacklist: [
		"^https?:\/\/[www]{0,3}m?\.?youtube\.com",
		"^https?:\/\/.*google.*q="
	],

	videoLinks: [
		{
			service: 'youtube',
			findSelector: 'a[href^="http://youtube.com/watch"]:not([duration-attached])',
			setSelector: 'a[href^="http://youtube.com/watch?v={{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="http://www.youtube.com/watch"]:not([duration-attached])',
			setSelector: 'a[href^="http://www.youtube.com/watch?v={{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="https://youtube.com/watch"]:not([duration-attached])',
			setSelector: 'a[href^="https://youtube.com/watch?v={{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="https://www.youtube.com/watch"]:not([duration-attached])',
			setSelector: 'a[href^="https://www.youtube.com/watch?v={{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="http://youtube.com/watch"]',
			setSelector: 'a[href^="http://youtube.com/watch?&v={{videoID}}"]'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="http://www.youtube.com/watch"]',
			setSelector: 'a[href^="http://www.youtube.com/watch?&v={{videoID}}"]'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="https://youtube.com/watch"]',
			setSelector: 'a[href^="https://youtube.com/watch?&v={{videoID}}"]'
		},
		{
			service: 'youtube',
			findSelector: 'a[href^="https://www.youtube.com/watch"]',
			setSelector: 'a[href^="https://www.youtube.com/watch?&v={{videoID}}"]'
		},
		{
			service: 'youtu.be',
			findSelector: 'a[href^="http://youtu.be"]:not([duration-attached])',
			setSelector: 'a[href^="http://youtu.be/{{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'youtu.be',
			findSelector: 'a[href^="https://youtu.be"]:not([duration-attached])',
			setSelector: 'a[href^="https://youtu.be/{{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'm.youtube',
			findSelector: 'a[href^="http://m.youtube.com/watch"]:not([duration-attached])',
			setSelector: 'a[href^="http://m.youtube.com/watch?v={{videoID}}"]:not([duration-attached])'
		},
		{
			service: 'm.youtube',
			findSelector: 'a[href^="https://m.youtube.com/watch"]:not([duration-attached])',
			setSelector: 'a[href^="https://m.youtube.com/watch?v={{videoID}}"]:not([duration-attached])'
		}
	],

	apiKey: "AIzaSyDaj-tAbohVgEttLWimqW-gPY-5y5xvSHc",
	selector: {},
	videos: {},
	maxAnchors: 50,
	videoData: {},
	attachedDurations: 0,

	initialize: function() {
		var self = this;

		//Bind to DOM changes so that we can attach durations to dynamic content
		document.addEventListener("DOMSubtreeModified", function(ev) {

			if(
				//Only listen to valid events
				ev.target.nodeName !== "#text" &&
				//Don't listening to our own events
				!ev.target.querySelector(':scope > span.video-duration') &&
				!ev.target.hasAttribute('duration-attached')
			) {
				self.findYouTubeLinks(ev.target);
			}
		});

		this.selector = this.videoLinks.map(function(vl) {
			return vl.findSelector;
		}).reduce(function(a,b) {
			return a + ", " + b;
		});

		this.findYouTubeLinks(document);
	},

	findYouTubeLinks: function(element) {
		var self = this;

		youTubeLinks = element.querySelectorAll(this.selector);

		for(var i = 0, len = youTubeLinks.length; i < len && i < this.maxAnchors; i++) {
			var videoUrl = youTubeLinks[i].getAttribute('href');
			var videoID = this.getVideoId(videoUrl);

			this.videos[videoID] = {};

			var promise = this.getVideoInfo(videoID);

			promise.then(function(result) {
				self.showDuration(result.videoID, result.videoDuration);
			}, function(error) {
				console.log('promise failed', error);
			});
		}
	},

	getVideoInfo: function(videoID) {
		var self = this;

		//Prevent multiple requests for the same video data
		if(this.videoData[videoID]) {
			var promise = new Promise(function(resolve, reject) {
				resolve(self.videoData[videoID]);
			});

			return promise;
		}

		var apiUrl = "https://www.googleapis.com/youtube/v3/videos"
			+ "?part=contentDetails,statistics"
			+ "&fields=items/contentDetails/duration,items/statistics/likeCount"
			+ "&id=" + videoID
			+ "&key=" + self.apiKey;

		var xhr = new XMLHttpRequest();
		xhr.open("GET", apiUrl, true);

		var promise = new Promise(function(resolve, reject) {
			xhr.onreadystatechange = function() {
				if(xhr.status === 200) {

					if(xhr.readyState === 3) {
						var response = JSON.parse(xhr.responseText);

						if(response.items[0]) {
							var videoDuration = IS08601DurationToSeconds(response.items[0].contentDetails.duration);

							//Save the data for later to prevent multiple requests
							self.videoData[videoID] = {
								videoID: videoID,
								videoDuration: videoDuration
							};

							resolve(self.videoData[videoID]);
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

			res = res.split('#')[0];

		} else { //Normal youtube.com URL
			var regex = /v=[\w_-]+/g;
			res = regex.exec(videoUrl)[0];
			res = res.slice(2,res.length);
		}

		return res;
	},

	//Checks for t=123 or t=1m23s in the videoUrl
	//Returns offset in seconds or 0
	getVideoOffset: function(videoUrl) {
		var regex = /t=(?:([0-9]+)m)?(?:([0-9]+)s)?/; //t=5m30s or t=5m or t=30s
		var res = videoUrl.match(regex);

		if(res && (((res[1] - parseFloat(res[1]) + 1) >= 0) || ((res[2] - parseFloat(res[2]) + 1) >= 0))) {
			var offset = 0;

			if((parseFloat(res[1]) + 1) >= 0) {
				offset += parseFloat(res[1] * 60);
			}

			if((parseFloat(res[2]) + 1) >= 0) {
				offset += parseFloat(res[2]);
			}

			return offset;
		}

		regex = /t=([0-9]+)/; //t=30 (seconds)
		res = videoUrl.match(regex);
		if(res && ((res[1] - parseFloat(res[1]) + 1) >= 0)) {
			return res[1];
		}

		return 0;
	},

	showDuration: function(videoID, duration) {
		var self = this;

		var selector = self.videoLinks.map(function(vl) {
			return vl.setSelector.replace("{{videoID}}", videoID);
		}).reduce(function(a,b) {
			return a + ", " + b;
		});

		var anchors = document.querySelectorAll(selector);

		for (var i = 0, len = anchors.length; i < len; i++) {
			var el = anchors[i];
			var offset = self.getVideoOffset(el.href);
			var prettyDuration = prettyPrintSeconds(duration - offset);

			el.setAttribute("duration-attached", true);

			if(prettyDuration <= 0) {
				continue;
			}

			//Create the element to show the duration
			var durationElement = document.createElement("span");
			durationElement.className = "video-duration";
			var durationContent = document.createTextNode("[" + prettyDuration + "]");
			durationElement.appendChild(durationContent);

			//Check if the anchor contains images
			if(el.getElementsByTagName('img').length > 0) {
				var imgs = el.getElementsByTagName('img');

				var img = imgs[0];

				var imgStyles = window.getComputedStyle(img);

				if(imgStyles.position === "absolute") {
					var top = img.offsetTop;
					var left = img.offsetLeft;
					var height = img.getBoundingClientRect().height;
					var width = img.getBoundingClientRect().width;
				} else {
					var height = el.getBoundingClientRect().height;
					var width = el.getBoundingClientRect().width;
				}

				durationElement.className = "video-duration image";

				//Insert the element
				el.appendChild(durationElement);

				//Determine the position for the overlay
				if(imgStyles.position === "absolute") {
					var topPosition = top + height - durationElement.getBoundingClientRect().height;
					var leftPosition = left + width - durationElement.getBoundingClientRect().width;
				} else {
					var topPosition = height - durationElement.getBoundingClientRect().height;
					var leftPosition = width - durationElement.getBoundingClientRect().width;

					el.style.position = "relative";
				}

				//Set the elements position
				durationElement.style.position = "absolute";
				durationElement.style.top = topPosition + "px";
				durationElement.style.left = leftPosition + "px";

				//Make the element visible
				durationElement.style.opacity = 1;
			}

			//Only attach if the anchor contains text
			if(el.innerText !== "") {
				el.appendChild(durationElement);

				//Update the plugin icon to show the count of video durations shown
				chrome.runtime.sendMessage({
					type: 'updateBadgeText',
					badgeText: ++self.attachedDurations
				});
			}
		}
	}
};

//Don't run on blacklisted sites
var re = new RegExp(extension.siteBlacklist.join("|"));
if(window.location.href.match(re) === null) {
	chrome.runtime.sendMessage({
		type: 'enableBadge'
	});

	extension.initialize();
} else {
	chrome.runtime.sendMessage({
		type: 'disableBadge'
	});
}
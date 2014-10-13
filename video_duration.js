var video_links = [
	{
		service: 'youtube',
		selector_find: 'a[href^="http://youtube.com/watch"]',
		selector_set: 'a[href^="http://youtube.com/watch?v={{video_id}}"]'
	},
	{
		service: 'youtube',
		selector_find: 'a[href^="http://www.youtube.com/watch"]',
		selector_set: 'a[href^="http://www.youtube.com/watch?v={{video_id}}"]'
	},
	{
		service: 'youtube',
		selector_find: 'a[href^="https://youtube.com/watch"]',
		selector_set: 'a[href^="https://youtube.com/watch?v={{video_id}}"]'
	},
	{
		service: 'youtube',
		selector_find: 'a[href^="https://www.youtube.com/watch"]',
		selector_set: 'a[href^="https://www.youtube.com/watch?v={{video_id}}"]'
	},
	{
		service: 'youtu.be',
		selector_find: 'a[href^="http://youtu.be"]',
		selector_set: 'a[href^="http://youtu.be/{{video_id}}"]'
	},
	{
		service: 'youtu.be',
		selector_find: 'a[href^="https://youtu.be"]',
		selector_set: 'a[href^="https://youtu.be/{{video_id}}"]'
	},
	{
		service: 'm.youtube',
		selector_find: 'a[href^="http://m.youtube.com/watch"]',
		selector_set: 'a[href^="http://m.youtube.com/watch?v={{video_id}}"]'
	},
	{
		service: 'm.youtube',
		selector_find: 'a[href^="https://m.youtube.com/watch"]',
		selector_set: 'a[href^="https://m.youtube.com/watch?v={{video_id}}"]'
	}
];


var selector = video_links.map(function(vl) {
	return vl.selector_find;
}).reduce(function(a,b) {
	return a + ", " + b;
});

var youtube_links = document.querySelectorAll(selector);

var api_key = "AIzaSyDaj-tAbohVgEttLWimqW-gPY-5y5xvSHc";

var videos = {};

var max_anchors = 20;

var attached_durations = 0;

//YouTube.com already shows video lengths almost everywhere
if(window.location.hostname !== "www.youtube.com" && window.location.hostname !== "youtube.com") {
	initialize();
}

function initialize() {
	for(var i = 0, len = youtube_links.length; i < len && i < max_anchors; i++) {
		var video_url = youtube_links[i].getAttribute('href');
		var video_id = get_video_id(video_url);

		//Dedupe
		if(videos[video_id]) {
			continue;
		}
		videos[video_id] = {};

		call_API(video_id, video_url);
	}
}

function call_API(video_id, video_url) {
	var api_call_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" + video_id + "&key=" + api_key;

	var xhr = new XMLHttpRequest();

	xhr.open("GET", api_call_url, true);

	xhr.onreadystatechange = function() {
		if(xhr.status === 200 && xhr.readyState === 3) {
			var response = JSON.parse(xhr.responseText);

			if(response.items[0]) {
				var video_duration = response.items[0].contentDetails.duration;

				video_duration = IS08601_duration_to_seconds(video_duration);

				attach_duration(video_id, video_duration);
			}
		}
	};

	xhr.send();
}

function IS08601_duration_to_seconds(duration) {
	var seconds = duration.match(/(\d*)S/);
	seconds = parseInt(seconds ? (parseInt(seconds[1]) ? seconds[1] : 0) : 0);

	var minutes = duration.match(/(\d*)M/);
	minutes = parseInt(minutes ? (parseInt(minutes[1]) ? minutes[1] : 0) : 0);

	var hours = duration.match(/(\d*)H/);
	hours = parseInt(hours ? (parseInt(hours[1]) ? hours[1] : 0) : 0);

	var total_seconds = 
		(hours * 60 * 60) +
		(minutes * 60) +
		seconds;

	return total_seconds;
}

function attach_duration(video_id, duration) {

	var selector = video_links.map(function(vl) {
		return vl.selector_set.replace("{{video_id}}", video_id);
	}).reduce(function(a,b) {
		return a + ", " + b;
	});

	var anchors = document.querySelectorAll(selector);

	duration = pretty_print_seconds(duration);

	for (var i = 0, len = anchors.length; i < len; i++) {

		var el = anchors[i];

		//Only attach if the anchor contains text
		if(el.innerText !== "") {
			var duration_element = document.createElement("span");
			duration_element.className = "video-duration";
			var duration_content = document.createTextNode("[" + duration + "]");
			duration_element.appendChild(duration_content);
			el.appendChild(duration_element);

			//Update the plugin icon to show the count of video durations shown
			chrome.runtime.sendMessage({badge_text: ++attached_durations});
		}
	}
}

function pretty_print_seconds(seconds) {
	var hours = parseInt( seconds / 3600 ) % 24;
	var minutes = parseInt( seconds / 60 ) % 60;
	var seconds = seconds % 60;

	var result = "";

	//Roll hours into the minutes
	if(hours > 0) {
		minutes += hours * 60
	}

	if(minutes > 0) {
		result += minutes + ":";
	} else {
		result += "0:"
	}

	result += (seconds  < 10 ? "0" + seconds : seconds);

	return result;
}


function get_video_id(url) {

	var res;

	//Check for youtu.be link shortener
	if(url.search("http://youtu.be") === 0 || url.search("https://youtu.be") === 0) {
		res = url.replace("http://youtu.be/", "").replace("https://youtu.be/", "");
	} else { //Normal youtube.com URL
		var youtube_id_regex = /v=[\w_-]+/g;
		res = youtube_id_regex.exec(url)[0];
		res = res.slice(2,res.length);
	}

	return res;
}
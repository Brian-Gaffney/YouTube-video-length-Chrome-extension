YouTube-video-length-Chrome-extension
=====================================

Shows video length next to YouTube video links

https://chrome.google.com/webstore/detail/youtube-video-length/lfkbfhglojdeoebdkpmgmphplhanchff

*Bugs*
	Doesn't show correct time for streams

*Todo*
	Improve location detemination
		Load it once in background.js and store for a while
		Cancel the request if it takes too long
			Not possible with fetch api

	Show more than just duration
		Rating
			statistics.likeCount
			statistics.dislikeCount

	Make a few screenshots
	Improve demo.html
	Put demo.html on Github pages

	Extension popup
		Total length of all (unique) videos on page
		Total number of videos

		Let user select display mode

		Show/set user country code

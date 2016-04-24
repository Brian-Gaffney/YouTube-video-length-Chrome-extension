YouTube-video-length-Chrome-extension
=====================================

Shows video length next to YouTube video links

Built without any JS libraries to find out how much I rely on jQuery and Underscore.

*Bugs*
	Doesn't show correct time for streams

*Todo*
	Dynamic content

	Improve location detemination
		Load it once in background.js and store for a while
		Cancel the request if it takes too long
			Not possible with fetch api

	Webpack
		Automate manifest stuff
			https://www.npmjs.com/package/chrome-manifest
		Create CRX
			Auto add commit ID to CRX somewhere so that users can see which commit the CRX was built from


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
YouTube-video-length-Chrome-extension
=====================================

Shows video length next to YouTube video links

*Bugs*
	Doesn't show correct time for streams

*Todo*
	Make better icons
	Make a few screenshots
	Create demo.html
	Put up the example.html and demo.html on Github pages?

	Show when videos are not available to view
		❌

	Improve getVideoID()
		Strip t=X stuff

	Show on embedded videos

	Show more than just duration
		Video title
		Rating - statistics.likeCount
		Videos that have had the sounds muted
		Availability
			Deleted
			Geo locked
			Age limit

			contentDetails.licensedContent field?

	Grunt/Gulb
		SCSS
		Create CRX
			Auto add commit ID to CRX somewhere so that users can see which commit the CRX was built from

	Different display modes
		Eg
			Inline eg [1:23]
			Position absolute next to link so as not to break page flow
			Appear on hover

		Can be user selectable

	Extension popup
		Total length of all (unique) videos on page
		Total number

		Let user select display mode

	Support non-youtube sites
		Vimeo
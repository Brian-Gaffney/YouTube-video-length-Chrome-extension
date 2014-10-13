YouTube-video-length-Chrome-extension
=====================================

Shows video length next to YouTube video links


*Todo*

	Support m.youtube.com

	Show more than just duration
		Rating
		Videos that have had the sounds muted
		Availability
			Deleted
			Geo locked
			Age limit

	Have a list of sites not to run on
		youtube.com - Already done
		Google search results page - Already shows the video length

	Videos with an offset
		Calculate the time from offset to the end of video

	Better detection of when and how to attach the duration
		Don't attach to links that just contain an image
		If the <a> tag contains nothing
		If the <a> tag contains a string deeply nested then attach near that level

	A proper icon

	Grunt file
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

	Deal with dynamically populated pages

	Support non-youtube sites
		Vimeo
		???
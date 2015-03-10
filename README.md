YouTube-video-length-Chrome-extension
=====================================

Shows video length next to YouTube video links


*Todo*
	Publish to Chrome extension store thing
		Think of a name
		Make an icon
		Make a few screenshots
		Put up the example html page somewhere

	Improve getVideoID()
		Strip t=X stuff

	Show on embedded videos

	Show more than just duration
		Rating - statistics.likeCount
		Videos that have had the sounds muted
		Availability
			Deleted
			Geo locked
			Age limit

			contentDetails.licensedContent field?

	Grunt/Gulb/Belch/Earwax
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
		???
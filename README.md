YouTube-video-length-Chrome-extension
=====================================

Shows video length next to YouTube video links


*Todo*

	Better detection of when and how to attach the duration
		Attach differently if the link only contains an image
			Attach like youtube.com, small white text in the bottom right
				Possibly percentage based font size with max and min
		If the <a> tag contains nothing
		If the <a> tag contains a string deeply nested then attach near that level

	Show on embedded videos


	Show more than just duration
		Rating - statistics.likeCount
		Videos that have had the sounds muted
		Availability
			Deleted
			Geo locked
			Age limit

			contentDetails.licensedContent field?

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
		$(document).bind("DOMSubtreeModified", function() {
			//Use a setTimeout to debounce
		});

	Support non-youtube sites
		Vimeo
		???

	Publish to Chrome extension store thing
		Think of a name
		Make an icon
		Make a few screenshots
		Put up the example html page somewhere
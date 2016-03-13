// t=5m30s or t=5m or t=30s
const videoOffsetRegex1 = /(?:([0-9]+)m)?(?:([0-9]+)s)?/;

function ISO8601DurationToSeconds (duration) {
	let seconds = duration.match(/(\d*)S/);
	seconds = parseInt(seconds ? (parseInt(seconds[1], 10) ? seconds[1] : 0) : 0, 10);

	let minutes = duration.match(/(\d*)M/);
	minutes = parseInt(minutes ? (parseInt(minutes[1], 10) ? minutes[1] : 0) : 0, 10);

	let hours = duration.match(/(\d*)H/);
	hours = parseInt(hours ? (parseInt(hours[1], 10) ? hours[1] : 0) : 0, 10);

	let totalSeconds =
		(hours * 60 * 60) +
		(minutes * 60) +
		seconds;

	return totalSeconds;
}

function prettyPrintSeconds (seconds) {

	if (seconds <= 0) {
		return 0;
	}

	let hours = parseInt(seconds / 3600, 10) % 24;
	let minutes = parseInt(seconds / 60, 10) % 60;
	seconds = seconds % 60;

	let result = '';

	//Roll hours into the minutes
	if (hours > 0) {
		minutes += hours * 60;
	}

	if (minutes > 0) {
		result += `${minutes}:`;
	}
	else {
		result += '0:';
	}

	result += (seconds  < 10 ? `0${seconds}` : seconds);

	return result;
}

function contentWarning (data) {
	return data &&
			data.contentDetails.contentRating &&
			data.contentDetails.contentRating.ytRating &&
			data.contentDetails.contentRating.ytRating === 'ytAgeRestricted';
}

// Check if the users country is allowed to view the video
function regionAllowed (countryCode, contentDetails) {
	// Implicitly allowed
	if (!countryCode || !contentDetails.regionRestriction) {
		return true;
	}

	let regionRestriction = contentDetails.regionRestriction;

	// Explicitly allowed
	if (regionRestriction.allowed && regionRestriction.allowed.includes(countryCode)) {
		return true;
	}

	// Explicitly blocked
	if (regionRestriction.blocked && regionRestriction.blocked.includes(countryCode)) {
		return false;
	}

	// Implicitly allowed
	return true;
}

function parseVideoOffset (offset) {
	// Simple int
	if (!isNaN(parseFloat(offset)) && isFinite(offset)) {
		return offset;
	}

	let match = offset.match(videoOffsetRegex1);

	// Check for things like: 5m30s or 5m or 30s
	if (match && (((match[1] - parseFloat(match[1]) + 1) >= 0) || ((match[2] - parseFloat(match[2]) + 1) >= 0))) {

		let offset = 0;

		if ((parseFloat(match[1]) + 1) >= 0) {
			offset += parseFloat(match[1] * 60);
		}

		if ((parseFloat(match[2]) + 1) >= 0) {
			offset += parseFloat(match[2]);
		}

		return offset;
	}

	return false;
}

export {
	ISO8601DurationToSeconds,
	prettyPrintSeconds,
	contentWarning,
	regionAllowed,
	parseVideoOffset
};

function IS08601DurationToSeconds(duration) {
	var seconds = duration.match(/(\d*)S/);
	seconds = parseInt(seconds ? (parseInt(seconds[1]) ? seconds[1] : 0) : 0);

	var minutes = duration.match(/(\d*)M/);
	minutes = parseInt(minutes ? (parseInt(minutes[1]) ? minutes[1] : 0) : 0);

	var hours = duration.match(/(\d*)H/);
	hours = parseInt(hours ? (parseInt(hours[1]) ? hours[1] : 0) : 0);

	var totalSeconds = 
		(hours * 60 * 60) +
		(minutes * 60) +
		seconds;

	return totalSeconds;
}

function prettyPrintSeconds(seconds) {
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
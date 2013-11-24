Number.prototype.pad = function(width,chr){
    chr = chr || '0';
    var result = this;
    for (var a = 0; a < width; a++)
        result = chr + result;
    return result.slice(-width);
};

$('document').ready(function() {
	//Check for web worker support
	if(typeof(Worker)!=="undefined") {
		//Web workers supported
		var timeWorker = new Worker('assets/js/time.js');

		var update = init();

		timeWorker.addEventListener('message', function(e) {
			update(e.data[0], e.data[1], e.data[2]);
		});
	} else {
		//Web workers not supported

		$('#content').html("<br><br>Your browser does not support web workers! I am working on a fix (non-updating time) for such browsers. <br><br> Web workers are supported on the recent versions of Chrome, Firefox, Safari and IE 10.");
	}
});

function init() {
	var LIGHT_TIME_HOURS = 4;
	var LIGHT_TIME_MINUTES = 30;

	var DARK_TIME_HOURS = 21;
	var DARK_TIME_MINUTES = 30;

	var lightMessage = "NIGHT in";
	var darkMessage = "DAY in";

	var lightCountdown = " (real time)";
	var darkCountdown = "Time until dark (real time)";

	var LIGHT_ICON_FILE = "/assets/images/sun.ico";
	var DARK_ICON_FILE = "/assets/images/moon.ico";

	var isLight = false;
	var created = false;

	var tick = 0;

	//Hours/Minutes/Seconds
	var countdownTime = [0, 0, 0];

	$('#light-time').html(LIGHT_TIME_HOURS.pad(2) + ":" + LIGHT_TIME_MINUTES.pad(2));
	$('#dark-time').html(DARK_TIME_HOURS.pad(2) + ":" + DARK_TIME_MINUTES.pad(2));

	return function update(hours, minutes, seconds) {
		isNowLight = ((hours > LIGHT_TIME_HOURS) && (hours < DARK_TIME_HOURS)) || ((hours == LIGHT_TIME_HOURS) && (minutes > LIGHT_TIME_MINUTES)) || ((hours == DARK_TIME_HOURS) && (minutes < DARK_TIME_MINUTES));


		if ((isLight == isNowLight) && (created)) {
			//Same, don't need to change anything
		} else {
			created = true;

			$('#status-message').html(isNowLight ? lightMessage : darkMessage);
			$('#countdown-message').html(isNowLight ? darkCountdown: lightCountdown);
			
			//Set favicon (may not work in Firefox)
			$("#favicon").attr("href", isNowLight ? LIGHT_ICON_FILE : DARK_ICON_FILE);

			if (isNowLight) {
				//Count down until dark
				timeDiff = calcTimeDiff([hours, minutes, seconds], [DARK_TIME_HOURS, DARK_TIME_MINUTES, 0]);
				$("body").removeClass("dark");
                $('.sunrise-icon').attr('src','assets/images/sunrise-dark.png');
                $('.moonrise-icon').attr('src','assets/images/moonrise-dark.png');
			} else {
				//Count down unti light
				timeDiff = calcTimeDiff([hours, minutes, seconds], [LIGHT_TIME_HOURS, LIGHT_TIME_MINUTES, 0]);
				$("body").addClass("dark");
                $('.sunrise-icon').attr('src','assets/images/sunrise.png');
                $('.moonrise-icon').attr('src','assets/images/moonrise.png');
			}

			var extraMinutes = ((timeDiff[0]%12)/12)*60;
			var extraSeconds = ((timeDiff[1]%12)/12)*60 + extraMinutes%1*60;

			countdownTime[0] = Math.floor(timeDiff[0]/12);
			countdownTime[1] = Math.floor(timeDiff[1]/12) + extraMinutes;
			countdownTime[2] = Math.floor(timeDiff[2]/12) + extraSeconds;


			if (countdownTime[2] > 60) {
				countdownTime[1] += Math.floor(countdownTime[2]/60);
				countdownTime[2]%= 60;
			}

			if (countdownTime[1] > 60) {
				countdownTime[0] += Math.floor(countdownTime[1]/60);
				countdownTime[1]%= 60;
			}

			console.log(countdownTime);

			isLight = isNowLight;
		}

		//Reduce real time
		if (++tick == 12) {
			tick = 0;

			if (--countdownTime[2] == -1) {
				countdownTime[2] = 59;
				countdownTime[1]--;
			}

			if (countdownTime[1] == -1) {
				countdownTime[1] = 59;
				countdownTime[0]--;
			}

			if (countdownTime[0] == -1) {
				countdownTime[0] = 0;
				countdownTime[1] = 0;
				countdownTime[2] = 0;
			}
		}
		
		//Update fields
		$('#hours').html(hours.pad(2));
		$('#minutes').html(minutes.pad(2));
		$('#seconds').html(seconds.pad(2));

		$('#hours-until').html(countdownTime[0].pad(2));
		$('#minutes-until').html(countdownTime[1].pad(2));
		$('#seconds-until').html(countdownTime[2].pad(2));
	};
}



function calcTimeDiff(time1, time2) {
	if (time1[0] > time2[0]) {
		time1[0]-=24;
	}

	if (time1[1] > time2[1]) {
		time1[1]-= 60;
		time1[0]++;
	}

	if (time1[2] > time2[2]) {
		time1[2]-= 60;
		time1[1]++;
	}

	console.log (time1 + " - " + time2);

	return [time2[0] - time1[0], time2[1] - time1[1], time2[2] - time1[2]];
}

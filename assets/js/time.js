function updateTime() {
	var now = new Date();

	var startHours = now.getUTCHours();
	var startMinutes = now.getUTCMinutes();
	var startSeconds = now.getUTCSeconds();

	var extraHours = Math.floor(startMinutes*6/60)+0;
	var extraMinutes = Math.floor(startSeconds*6/60);
	var extraSeconds = 0;

	var hours =   (startHours*6   + extraHours )%24;
	var minutes = (startMinutes*6 + extraMinutes)%60;
	var seconds = (startSeconds*6 + extraSeconds)%60;

	if (seconds < 0) {
		minutes--;
		seconds+= 60;
	}

	if (minutes < 0) {
		hours--;
		minutes+= 60;
	}

	if (hours < 0) {
		hours += 24;
	}

	return function() {
		//Update time
		if (++seconds == 60) {
			seconds = 0;
			minutes++;
		}

		if (minutes == 60) {
			minutes = 0;
			hours++;
		}

		if (hours == 24) {
			hours = 0;
		}

		self.postMessage([hours, minutes, seconds]);
	}
}

var updater = updateTime();

setInterval(updater, 166.667);



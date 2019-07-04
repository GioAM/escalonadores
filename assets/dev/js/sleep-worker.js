'use strict';

self.addEventListener('message', function(event) {
	this.console.log('eventWorker', event);
    this.console.log('event.dataWorker', event.data);
	switch (event.data) {
		case 'sleepSch':
			sleep();
			break;
	}

	this.self.postMessage({ message: 'TESTE' });

});

function sleep(milliseconds = 1000) {
	let now = new Date().getTime();
	while ( new Date().getTime() < (now + milliseconds) ) {}
}
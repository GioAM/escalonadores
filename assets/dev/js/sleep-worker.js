'use strict';

self.addEventListener('message', function(e) {
	let data = e.data;
	this.console.log('workerSch iniciando...');
    switch (data.cmd) {
        case 'startWorker':
				sleep(data.msg);
            	self.postMessage('Woker sleep started! ' + data.msg);
            	break;
        case 'stopWorker':
                self.postMessage('Woker sleep stoped! ' + data.msg);
                self.close();
                break;
        default:
            	self.postMessage('Unknown command! ' + data.msg);
    }
}, false);

function sleep(milliseconds = 1000) {
	let now = new Date().getTime();
	while ( new Date().getTime() < (now + milliseconds) ) {}
}
self.addEventListener('message', function(event) {
    this.console.log('eventWorker', event);
    this.console.log('event.dataWorker', event.data);

    if(event.data === 'do some work') {
        this.console.log('Worker is about to do some work!');
        var count = 0;
        for(var i=0; i<10000000000; i++) {   
            count += i;
        }
        
        this.self.postMessage(
            {
                message: count
            }
        );
    }
    
});
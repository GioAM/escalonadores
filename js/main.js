var id = 1;
var startTimeJobs;
var allJobs = [];
$(document).ready(function(){
	
});
function createQueue(){
	var newJob =  new JobStruct(id,$('#time').val());
	allJobs.push(newJob);
	id++;
	$('.table-logs').append("<li>Job " + newJob.jobId + " adicionado a fila. Tempo de execucao: " + newJob.totalTime +" segundos </li>");
}
function startJobs() {
	$('.table-logs').append("<li>Iniciando execucao dos Jobs.</li>");
	for (var i = 0; i < allJobs.length; i++) {
		if(i == 1){
			startTimeJobs = new Date().getTime();
		}
		$('.table-logs').append("<li>Job " + allJobs[i].jobId + " executando </li>");
		job(allJobs[i]);
		$('.table-logs').append("<li>Job " + allJobs[i].jobId + " finalizou </li>");
	}
}
function job(jobItem){
	console.log("Job " + jobItem.jobId + " executando");
	sleep(jobItem.totalTime*1000, jobItem);
	console.log("Job " + jobItem.jobId + " finalizou ");
}
function sleep(milliseconds, jobItem) {
	var now = new Date().getTime();
	jobItem.startTime = (now - startTimeJobs)/1000;
	console.log("s " + jobItem.startTime);
	console.log((now - startTimeJobs)/1000);
	while ( new Date().getTime() < now + milliseconds ){}
	jobItem.finishTime  =  (new Date().getTime() - startTimeJobs)/1000;
	console.log("s " + jobItem.finishTime);
}
function JobStruct(jobId, totalTime) {
    this.jobId = jobId;
	this.totalTime = totalTime;
}
function showAllJobs(){
	console.log(allJobs);
	for (var i = 0; i < allJobs.length; i++) {
		console.log("jobId: " + allJobs[i].jobId);
		console.log("totalTime: " + allJobs[i].totalTime);
		console.log("startTime: " + allJobs[i].startTime);
		console.log("finishTime: " + allJobs[i].finishTime);
	}
}
function createChart(){
	$('.table-logs').append("<li>Montando grafico.</li>");
	var labels = [0];
	var data = [0];
	for (var i = 0; i < allJobs.length; i++) {
		labels.push(allJobs[i].jobId);
		data.push(allJobs[i].finishTime);
	}
	var ctx = document.getElementById('myChart').getContext('2d');
	var myBarChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
        labels: labels,
        datasets: [{
            label: 'My First dataset',
            backgroundColor: '5f9ea0',
            borderColor: 'r5f9ea0',
            data: data
        }]
    },
    options: {}
});
}
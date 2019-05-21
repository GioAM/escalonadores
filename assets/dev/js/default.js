var id = 1;
var startTimeJobs;
var jobsToExecute = [];
var chartData = [];

function JobStruct(jobId, totalTime, priority) {
	this.jobId = jobId;
	this.totalTime = totalTime;
	this.executed = false;
	this.priority = priority;
}

function TimeExecution(jobId, startTime, finishTime) {
	this.jobId = jobId;
	this.startTime = startTime;
	this.finishTime = finishTime;
}

function createQueue(){
	var newJob =  new JobStruct(id,$('#time').val());
	jobsToExecute.push(newJob);
	id++;
	$('.table-logs').append("<li class='-itemjob'><i class='fas fa-level-up-alt -arrowjobicon'></i>Job <span class='-numberjob'>" + newJob.jobId + "</span> adicionado a fila <i class='fas fa-minus -minusarrowicon'></i> Tempo de execução: <span class='-numbersecondjob'>" + newJob.totalTime +"</span> segundo(s) </li>");
}

function startJobs() {
	chartData = [];
	$('.table-logs').append("<li>Iniciando execução dos Jobs.</li>");
	startTimeJobs = new Date().getTime();
	if($('.typeOfProcess').val() == "roundRobinPreemptivo"){
		while(jobsToExecute.length > 0){
			var jobNow = jobsToExecute[0];
			$('.table-logs').append("<li>Job " + jobNow.jobId + " executando uma parte</li>");
			jobPreemptivo(jobNow);
		}
	}else if($('.typeOfProcess').val() == "roundRobin"){
		jobsToExecute.sort(compareTime);
		for (var i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	}else if($('.typeOfProcess').val() == "roundRobinPriority"){
		jobsToExecute.sort(comparePriority);
		for (var i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	}
	jobsToExecute = [];
}

function jobPreemptivo(jobItem){
	if(!jobItem.executed){
		jobItem.totalTime = jobItem.totalTime - 1;
		var now = new Date().getTime();
		var startTime = (now - startTimeJobs) / 1000;
		sleep(1000);
		var finishTime  =  (new Date().getTime() - startTimeJobs)/1000;
		var jobExecution =  new TimeExecution(jobItem.jobId,startTime,finishTime);
		chartData.push(jobExecution);
		jobsToExecute.shift();
		if(jobItem.totalTime <= 0){
			jobItem.executed = true;
			$('.table-logs').append("<li>Job " + jobItem.jobId + " executou totalmente. </li>");
		}else{
			jobsToExecute.push(jobItem);
		}
	}
}

function jobRoundRobin(jobItem){
	var now = new Date().getTime();
	var startTime = (now - startTimeJobs) / 1000;
	sleep(jobItem.totalTime * 1000);
	var finishTime  =  (new Date().getTime() - startTimeJobs)/1000;
	var jobExecution =  new TimeExecution(jobItem.jobId,startTime,finishTime);
	chartData.push(jobExecution);
}

function createChart(){
	$('.table-logs').append("<li>Montando gráfico.</li>");
	google.charts.load("current", {packages:["timeline"]});
	google.charts.setOnLoadCallback(drawChart);
}

function compareTime(jobA,jobB) {
  if (jobA.totalTime < jobB.totalTime)
     return -1;
  if (jobA.totalTime > jobB.totalTime)
    return 1;
  return 0;
}

function comparePriority(jobA,jobB) {
  if (jobA.priority < jobB.priority)
     return -1;
  if (jobA.priority > jobB.priority)
    return 1;
  return 0;
}

function sleep(milliseconds) {
	var now = new Date().getTime();
	while ( new Date().getTime() < now + milliseconds ){}
}

function drawChart() {
    var container = document.getElementById('chartTime');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Job' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });
		for (var i = 0; i < chartData.length; i++) {
			dataTable.addRow([ 'Job ' +  chartData[i].jobId,  new Date(0,0,0,0,0, chartData[i].startTime ),  new Date(0,0,0,0,0,chartData[i].finishTime) ]);
		}
    var options = {
      timeline: { singleColor: '#007bff' },
    };
    chart.draw(dataTable, options);
  }

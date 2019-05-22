var id = 1;
var startTimeJobs;
var jobsToExecute = [];
var chartData = [];
var timeSlice;

function JobStruct(jobId, totalClocks, priority) {
	this.jobId = jobId;
	this.totalClocks = totalClocks;
	this.executed = false;
	this.priority = priority;
}

function TimeExecution(jobId, startTime, finishTime) {
	this.jobId = jobId;
	this.startTime = startTime;
	this.finishTime = finishTime;
}

function createQueue(){
	if($('#clocks').val() == null || $('#clocks').val() == ""){
		alert("Adicione o valor total de clocks para o job");
		return;
	}
	var newJob =  new JobStruct(id,$('#clocks').val(),$('.prioritySelect').val());
	jobsToExecute.push(newJob);
	id++;
	$('.table-logs').append("<li class='-itemjob'><i class='fas fa-level-up-alt -arrowjobicon'></i>Job <span class='-numberjob'>" + newJob.jobId + "</span> adicionado a fila <i class='fas fa-minus -minusarrowicon'></i> Total de execução: <span class='-numbersecondjob'>" + newJob.totalClocks +"</span> segundo(s) </li>");
}

function startJobs() {
	if(jobsToExecute.length <= 0  || jobsToExecute == null){
		alert("Adicione Jobs para a execução!");
		return;
	}
	if($('#timeSlice').val() == null || $('#timeSlice').val() == ""){
		alert("Adicione o valor do time Slice");
		return;
	}
	chartData = [];
	$('.table-logs').append("<li>Iniciando execução dos Jobs." + $('.typeOfProcess').val() +"</li>");
	startTimeJobs = new Date().getTime();
	timeSlice = $('#timeSlice').val();
	if($('.typeOfProcess').val() == "RRS"){
		while(jobsToExecute.length > 0){
			var jobNow = jobsToExecute[0];
			$('.table-logs').append("<li>Job " + jobNow.jobId + " executando uma parte</li>");
			jobPreemptivo(jobNow);
		}
	}else if($('.typeOfProcess').val() == "SJF"){
		jobsToExecute.sort(compareTime);
		for (var i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	}else if($('.typeOfProcess').val() == "PRIORITY"){
		jobsToExecute.sort(comparePriority);
		for (var i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	}else if($('.typeOfProcess').val() == "FIFO"){
		for (var i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	}
	jobsToExecute = [];
}

function jobPreemptivo(jobItem){
	if(jobItem.totalClocks / timeSlice > 30){
		alert("Sistema matou o Job " + jobItem.jobId + " pois é muito grande podendo danificar o sistema.")
		$('.table-logs').append("<li>Sistema matou o Job " + jobItem.jobId + " </li>");
		jobsToExecute.shift();
		return;
	}
	if(!jobItem.executed){
		jobItem.totalClocks = jobItem.totalClocks - timeSlice;
		var now = new Date().getTime();
		var startTime = (now - startTimeJobs) / 1000;
		sleep(1000);
		var finishTime  =  (new Date().getTime() - startTimeJobs)/1000;
		var jobExecution =  new TimeExecution(jobItem.jobId,startTime,finishTime);
		chartData.push(jobExecution);
		jobsToExecute.shift();
		if(jobItem.totalClocks <= 0){
			jobItem.executed = true;
			$('.table-logs').append("<li>Job " + jobItem.jobId + " executou totalmente. </li>");
		}else{
			jobsToExecute.push(jobItem);
		}
	}
}

function jobRoundRobin(jobItem){
	if(jobItem.totalClocks / timeSlice > 30){
		alert("Sistema matou o Job " + jobItem.jobId + " pois é muito grande podendo danificar o sistema.");
		$('.table-logs').append("<li>Sistema matou o Job " + jobItem.jobId + " </li>");
		return;
	}
	var now = new Date().getTime();
	var startTime = (now - startTimeJobs) / 1000;
	while(jobItem.totalClocks > 0){
		console.log(jobItem.totalClocks);
		sleep(1000);
		jobItem.totalClocks = jobItem.totalClocks - timeSlice;
	}
	var finishTime  =  (new Date().getTime() - startTimeJobs)/1000;
	var jobExecution =  new TimeExecution(jobItem.jobId,startTime,finishTime);
	chartData.push(jobExecution);
}

function createChart(){
	if(chartData.length <= 0  || chartData == null){
		alert("Execute uma operação de Escalonamento antes de montar o gráfico!");
		return;
	}
	$('.table-logs').append("<li>Montando gráfico.</li>");
	google.charts.load("current", {packages:["timeline"]});
	google.charts.setOnLoadCallback(drawChart);
}

function compareTime(jobA,jobB) {
  if (jobA.totalClocks < jobB.totalClocks)
     return -1;
  if (jobA.totalClocks > jobB.totalClocks)
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
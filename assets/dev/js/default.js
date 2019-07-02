'use strict';

var id = 1;
var startTimeJobs;
var jobsToExecute = [];
var jobsToCalculate = [];
var chartData = [];
var timeSlice;
let messages = {
	executeJobs: 'Iniciando execução dos Jobs',
	totalJobsEmpty: 'Adicione o valor total de clocks para o job',
	arrayJobsEmpty: 'Adicione Jobs para a execução',
	timeSliceEmpty: 'Adicione o valor do time Slice',
	arrayTimesEmpty: 'Execute uma operação de Escalonamento antes de montar o gráfico!'
}

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
		toast(messages.totalJobsEmpty);
		return;
	}
	var newJob =  new JobStruct(id,$('#clocks').val(),$('.prioritySelect').val());
	jobsToExecute.push(newJob);
	jobsToCalculate.push(newJob);
	id++;
	$('.table-logs').append(`
		<li class="-itemjob">
			<i class="fas fa-level-up-alt -arrowjobicon"></i>
			Job <span class="-numberjob">${newJob.jobId}</span> adicionado a fila
			<i class="fas fa-minus -minusarrowicon"></i>
			Total de execução: <span class="-numbersecondjob">${newJob.totalClocks}</span> Hz
		</li>
	`);
}

function startJobs() {
	if(jobsToExecute.length <= 0  || jobsToExecute == null){
		toast(messages.arrayJobsEmpty);
		return;
	}
	if($('#timeSlice').val() == null || $('#timeSlice').val() == ""){
		toast(messages.timeSliceEmpty);
		return;
	}
	toast(messages.executeJobs);
	chartData = [];
	$('.table-logs').append("<li>Iniciando execução dos Jobs. Modo de execução: " + $('.typeOfProcess').val() +"</li>");
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
		toast("Sistema matou o Job " + jobItem.jobId + " pois é muito grande podendo danificar o sistema.")
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
		toast("Sistema matou o Job " + jobItem.jobId + " pois é muito grande podendo danificar o sistema.");
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
		toast(messages.arrayTimesEmpty);
		return;
	}
	calculo();
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

function toast(msg, txtcolor = null) {
	$('#toast-place').append(`
		<div role="alert" aria-live="assertive" aria-atomic="true" data-autohide="true" class="toast" data-delay="1500">
			<div class="toast-body ${txtcolor}">
				<span class="-toastmsg">${msg}</span>
				<button type="button" class="close" data-dismiss="toast" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
		</div>
	`);

	$('.toast').toast('show');
	$('.toast').on('hidden.bs.toast', e => {
		$(e.currentTarget).remove();
	});
}
function calculo(){
	for(var a = 0; a < jobsToCalculate.length; a++){
			$('#calculo table tbody').empty();
			jobsToCalculate[a].lastTime = 0;
			jobsToCalculate[a].totalTime = 0;
			jobsToCalculate[a].waitTime = 0;
			for(var i = 0; i < chartData.length; i++){
				if(jobsToCalculate[a].jobId == chartData[i].jobId){
					jobsToCalculate[a].totalTime = Math.round(jobsToCalculate[a].totalTime + (chartData[i].finishTime - chartData[i].startTime));
					jobsToCalculate[a].waitTime = Math.round(jobsToCalculate[a].waitTime + (chartData[i].startTime - jobsToCalculate[a].lastTime));
					jobsToCalculate[a].lastTime = chartData[i].finishTime;
				}
			}
	}
	drawCalculo();
	jobsToCalculate = [];
}
function drawCalculo(){
	var totalWaitTime = 0;
	var valuesWaitTime = "";
	var lengthTime =  jobsToCalculate.length;
	var totalTime = 0;
	var valuesTotalTime = "";
	for(var a = 0; a < jobsToCalculate.length; a++){
		$('#calculo table tbody').append(`
		<tr>
			<td>Job ${jobsToCalculate[a].jobId}</td>
			<td>${jobsToCalculate[a].totalTime}s</td>
			<td>${jobsToCalculate[a].waitTime}s</td>
		</tr>`);
		totalWaitTime = totalWaitTime + jobsToCalculate[a].waitTime;
		totalTime = totalTime + jobsToCalculate[a].totalTime;
		valuesWaitTime = valuesWaitTime + jobsToCalculate[a].waitTime;
		valuesTotalTime = valuesTotalTime + jobsToCalculate[a].totalTime;
		if(lengthTime-1 != a){
			valuesWaitTime = valuesWaitTime + " + " ;
			valuesTotalTime = valuesTotalTime +  " + ";
		}
	}
	$('.totalTimeValues').text(valuesTotalTime);
	$('.waitTimeValues').text(valuesWaitTime);
	$('.valueWaitTotal').text((totalWaitTime/lengthTime) + 's');
	$('.valueTotal').text((totalTime/lengthTime) + 's');
	$('.lengthTime').text(lengthTime);
	$('#sectionCalculo').removeClass('hide');
}

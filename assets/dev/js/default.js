'use strict';

// importScripts('../../dev/js/sleep-worker.js');

let id = 1;
let startTimeJobs;
let jobsToExecute = [];
let jobsToCalculate = [];
let chartData = [];
let timeSlice;
let messages = {
	error: {
		totalTimeExecution: 'Insira um valor válido ao Tempo de Execução',
		timeSliceEmpty: 'Insira um valor válido ao Intervalo de Tempo',
		arrayTimesEmpty: 'Execute uma operação para montar o gráfico!'

	},
	alert: {
		executeJobs: 'Iniciando o escalonamento dos Jobs',
		restartScheduler: 'Escalonador reiniciado!',
		graphicMounted: 'Gráfico montado com sucesso!'
	},
	color: {
		success: '-textsuccess',
		danger: '-texterror',
		warning: '-textwarnning'
	}
}

var workerSch = new Worker('../../../assets/dev/js/sleep-worker.js');
console.log(workerSch);
workerSch.addEventListener('message', function(e) {
	console.log('Worker said: ', e.data);
}, false);


$(document).ready(function() {
	$('[data-toggle="tooltip"]').tooltip();
	cleanScheduler();
});

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

function createQueue() {
	let schTimeExecution = $('#schTimeExecution').val();
	let prioritySelect = $('.prioritySelect').val();
	let exprRegularInt = /([0-9])/.test(schTimeExecution);

	if((schTimeExecution === null) || (schTimeExecution === "") || (!exprRegularInt)) {
		toast(messages.error.totalTimeExecution, messages.color.danger);
		return;
	}

	var newJob =  new JobStruct(id, schTimeExecution, prioritySelect);
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
	if((jobsToExecute.length <= 0) || (jobsToExecute == null)) {
		toast(messages.arrayJobsEmpty);
		return;
	}

	timeSlice = $('#timeSlice').val();
	if((timeSlice === null) || (timeSlice === "")) {
		toast(messages.error.timeSliceEmpty, messages.color.danger);
		return;
	}
	
	disableForm('disable');
	chartData = [];
	let typeProgress = $('.typeOfProcess').val();
	$('.table-logs').append("<li>Iniciando execução dos Jobs. Modo de execução: " + typeProgress +"</li>");
	startTimeJobs = new Date().getTime();

	if(typeProgress === "RRS") {
		while(jobsToExecute.length > 0) {
			let jobNow = jobsToExecute[0];
			$('.table-logs').append("<li>Job " + jobNow.jobId + " executando uma parte</li>");
			jobPreemptivo(jobNow);
		}
	} else if(typeProgress === "SJF") {
		jobsToExecute.sort(compareTime);
		for (let i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	} else if(typeProgress === "PRIORITY") {
		jobsToExecute.sort(comparePriority);
		for (let i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	} else if(typeProgress === "FIFO") {
		for (let i = 0; i < jobsToExecute.length; i++) {
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " executando </li>");
			jobRoundRobin(jobsToExecute[i]);
			$('.table-logs').append("<li>Job " + jobsToExecute[i].jobId + " finalizou </li>");
		}
	}

	jobsToExecute = [];
}

function jobPreemptivo(jobItem) {
	if((jobItem.totalClocks / timeSlice) > 30) {
		toast("Sistema matou o Job " + jobItem.jobId + " pois é muito grande podendo danificar o sistema.")
		$('.table-logs').append("<li>Sistema matou o Job " + jobItem.jobId + " </li>");
		jobsToExecute.shift();
		return;
	}

	if(!jobItem.executed) {
		jobItem.totalClocks = jobItem.totalClocks - timeSlice;
		let now = new Date().getTime();
		let startTime = (now - startTimeJobs) / 1000;
		// sleep();
		workerSch.postMessage({ 'cmd': 'startWorker', 'msg': 1000} );
		workerSch.postMessage({ 'cmd': 'stopWorker', 'msg': 'STOP'} );
		let finishTime = (new Date().getTime() - startTimeJobs) / 1000;
		let jobExecution = new TimeExecution(jobItem.jobId, startTime, finishTime);
		chartData.push(jobExecution);
		jobsToExecute.shift();

		if(jobItem.totalClocks <= 0) {
			jobItem.executed = true;
			$('.table-logs').append("<li>Job " + jobItem.jobId + " executou totalmente. </li>");
		} else {
			jobsToExecute.push(jobItem);
		}
	}
}

function jobRoundRobin(jobItem) {
	if((jobItem.totalClocks / timeSlice) > 30) {
		toast("Sistema matou o Job " + jobItem.jobId + " pois é muito grande podendo danificar o sistema.");
		$('.table-logs').append("<li>Sistema matou o Job " + jobItem.jobId + " </li>");
		return;
	}

	let now = new Date().getTime();
	let startTime = (now - startTimeJobs) / 1000;
	while(jobItem.totalClocks > 0) {
		console.log(jobItem.totalClocks);
		// sleep();
		workerSch.postMessage({ 'cmd': 'startWorker', 'msg': 1000} );
		jobItem.totalClocks = jobItem.totalClocks - timeSlice;
	}

	workerSch.postMessage({ 'cmd': 'stopWorker', 'msg': 'STOP'} );

	let finishTime = (new Date().getTime() - startTimeJobs) / 1000;
	let jobExecution = new TimeExecution(jobItem.jobId, startTime, finishTime);
	chartData.push(jobExecution);
}

function createChart() {
	if((chartData.length <= 0)  || (chartData == null)) {
		toast(messages.error.arrayTimesEmpty, messages.color.danger);
		return;
	}

	calculo();
	google.charts.load("current", { packages: ["timeline"] });
	google.charts.setOnLoadCallback(drawChart);
	$('#createChart').prop('disabled', true);
	$('#sectionGraphic').show();
	toast(messages.alert.graphicMounted, messages.color.success);
}

function compareTime(jobA, jobB) {
	if (jobA.totalClocks < jobB.totalClocks)
		return -1;
	if (jobA.totalClocks > jobB.totalClocks)
		return 1;
	return 0;
}

function comparePriority(jobA, jobB) {
	if (jobA.priority < jobB.priority)
		return -1;
	if (jobA.priority > jobB.priority)
		return 1;
	return 0;
}

function sleep(milliseconds = 1000) {
	let now = new Date().getTime();
	while ( new Date().getTime() < (now + milliseconds) ) {}
}

function drawChart() {
    let container = document.getElementById('chartTime');
    let chart = new google.visualization.Timeline(container);
    let dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Job' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
	dataTable.addColumn({ type: 'date', id: 'End' });
	
	for (let i = 0; i < chartData.length; i++) {
		dataTable.addRow(
			[
				'Job ' +  chartData[i].jobId,  
				new Date(0, 0, 0, 0, 0, chartData[i].startTime ),  
				new Date(0, 0, 0, 0, 0, chartData[i].finishTime) 
			]
		);
	}

    let options = {
    	timeline: { singleColor: '#007bff' },
	};
	
    chart.draw(dataTable, options);
}

function toast(msg, txtColor = null) {
	$('#toast-place').append(`
		<div role="alert" aria-live="assertive" aria-atomic="true" data-autohide="true" class="toast" data-delay="2000">
			<div class="toast-body ${txtColor}">
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
	for(let a = 0; a < jobsToCalculate.length; a++) {
			$('#calculo table tbody').empty();
			jobsToCalculate[a].lastTime = 0;
			jobsToCalculate[a].totalTime = 0;
			jobsToCalculate[a].waitTime = 0;
			for(let i = 0; i < chartData.length; i++){
				if(jobsToCalculate[a].jobId == chartData[i].jobId) {
					jobsToCalculate[a].totalTime = Math.round(jobsToCalculate[a].totalTime + (chartData[i].finishTime - chartData[i].startTime));
					jobsToCalculate[a].waitTime = Math.round(jobsToCalculate[a].waitTime + (chartData[i].startTime - jobsToCalculate[a].lastTime));
					jobsToCalculate[a].lastTime = chartData[i].finishTime;
				}
			}
	}

	drawCalculo();
	jobsToCalculate = [];
}
function drawCalculo() {
	let totalWaitTime = 0;
	let valuesWaitTime = "";
	let lengthTime =  jobsToCalculate.length;
	let totalTime = 0;
	let valuesTotalTime = "";
	for(let a = 0; a < jobsToCalculate.length; a++) {
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
		if((lengthTime - 1) != a) {
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

function cleanScheduler() {
	$('#cleanScheduler').on('click', function() {
		id = 1;
		startTimeJobs;
		jobsToExecute = [];
		jobsToCalculate = [];
		chartData = [];
		$('.table-logs').html("");
		$('#schTimeExecution').val("");
		$('#timeSlice').val("");
		$('#sectionGraphic').hide();
		// $('#sectionCalculo').hide();
		$('#chartTime').html("");
		// $('#chartTime').html("");
		disableForm('enable');
		toast(messages.alert.restartScheduler, messages.color.success);
	});
}

function disableForm(item) {
	switch (item) {
		case 'disable':
			$('#schTimeExecution').prop('disabled', true);
			$('#timeSlice').prop('disabled', true);
			$('#createQueue').prop('disabled', true);
			$('#prioritySelect').prop('disabled', true);
			$('#typeOfProcess').prop('disabled', true);
			$('#startJobs').prop('disabled', true);
			break;
		case 'enable':
			$('#schTimeExecution').prop('disabled', false);
			$('#timeSlice').prop('disabled', false);
			$('#createQueue').prop('disabled', false);
			$('#prioritySelect').prop('disabled', false);
			$('#typeOfProcess').prop('disabled', false);
			$('#startJobs').prop('disabled', false);
			$('#createChart').prop('disabled', false);
			break;
	}
}

cuwyApp.controller('patientLp24hCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {
	var urlServer = '';
	$scope.siteMap = config.siteMap.siteMaps[4];
	$scope.startHour24lp = config.startHour24lp;
	$scope.dayStartHour = getCookie('dayStartHour');
	if($scope.dayStartHour){
		$scope.startHour24lp = parseInt($scope.dayStartHour);
	}

	$scope.newPrescribes = function(){
		newPrescribesCommon($scope);
		$scope.savePatient();
//		$scope.workDoc.prescribesHistory.splice(1, 0, prescribeHistory);
		//moveMinus($scope.workDoc.prescribesHistory, 1);
		//$scope.workDoc.selectPrescribesHistoryIndex = 1;
		//console.log($scope.workDoc.selectPrescribesHistoryIndex);
		//initEditedPrescribeHistory($scope);
	}

	initDeclarePrescribesEdit($scope, $http, $sce);

	console.log("------patientLp24hCtrl-------------");
	$http({ method : 'GET', url : config.urlPrefix + '/read/patient_'+$scope.parameters.id
	}).success(function(data, status, headers, config) {
		initWorkDocument(data, $scope);
		var patientFromList = $filter('filter')
		(patient1sList, {PATIENT_ID:$scope.patient.PATIENT_ID})[0];
		if($scope.patient.PATIENT_NAME != patientFromList.PATIENT_NAME){
			$scope.patient.PATIENT_NAME = patientFromList.PATIENT_NAME;
			changeSaveControl($scope, $http);
		}
	}).error(function(data, status, headers, config) {
	});

	$scope.savePatient = function(){
		saveWorkDoc(config.urlPrefix + "/save/patient", $scope, $http);
	}

	$scope.phOpenUpdateDialog = function(prescribeHistoryIndex){
		var prescribeHistory = $scope.workDoc.prescribesHistory[prescribeHistoryIndex];
		prescribeHistory.updateDialogOpen = !prescribeHistory.updateDialogOpen;
	}


copy = function(taskIndex, prescribeHistory){
	console.log("-----copy-------- "+taskIndex);
	console.log(prescribeHistory);
	//var drug = prescribeHistory.prescribes.tasks[taskIndex];
	//if(drug.selectMultiple){
	if(prescribeHistory.prescribes.selectMultiple){
		contextMenuCopy(prescribeHistory.prescribes, $http); 
	}else if(taskIndex == -1){
		contextMenuCopy(prescribeHistory.prescribes, $http); 
	}else{
		var drug = prescribeHistory.prescribes.tasks[taskIndex];
		contextMenuCopy(drug, $http);
	}
}

$scope.menuPatientUpdate = [
['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
	console.debug('Edit');
	$scope.updatePatient();
}]
];

$scope.updatePatient = function(){
	$scope.patient.patientUpdateOpen = !$scope.patient.patientUpdateOpen;
}

$scope.menuNoDelDayBlock = [
	['<span class="glyphicon glyphicon-remove"></span> Скасувати видалення ', function ($itemScope) {
		$itemScope.prescribeHistory.deleteDay = false;
	}]
];

$scope.menuDayBlock = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція <sub><kbd>⏎</kbd></sub>', function ($itemScope) {
		$itemScope.prescribeHistory.updateDialogOpen = !$itemScope.prescribeHistory.updateDialogOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-plus"></span> Нове призначення <sub><kbd>Shift+⏎</kbd></sub>', function ($itemScope) {
		$scope.newPrescribes();
	}],
	['<span class="glyphicon glyphicon-remove"></span> Видалити <sub><kbd>Del</kbd></sub>', function ($itemScope) {
		deleteDay($itemScope.prescribeHistory);
	}]
];

$scope.menuTasksAll = [
	['<i class="fa fa-copy"></i> Копіювати <sub><kbd>Ctrl+C</kbd></sub>', function ($itemScope) { 
		contextMenuCopy($itemScope.prescribeHistory.prescribes, $http); 
	}],
	['<i class="fa fa-paste"></i> Вставити <sub><kbd>Ctrl+V</kbd></sub>', function ($itemScope) { 
		$http({
			method : 'GET',
			url : config.urlPrefix + '/session/paste'
		}).success(function(data, status, headers, config) {
			
			if($itemScope.prescribeHistory.prescribes.tasks.length == 0){
				$itemScope.prescribeHistory.prescribes.tasks = data.tasks;
				$scope.numberOfChange += $itemScope.prescribeHistory.prescribes.tasks.length;
			}else{
				if(data.tasks.length + $itemScope.prescribeHistory.prescribes.tasks.length < 19){
					$itemScope.prescribeHistory.prescribes.tasks.push
					.apply($itemScope.prescribeHistory.prescribes.tasks, data.tasks);
				}
			}
			
		}).error(function(data, status, headers, config) {
		});
	}]
];

deleteDay = function(prescribeHistory){
	if(prescribeHistory.deleteDay){
		$scope.workDoc.prescribesHistory.splice($scope.workDoc.selectPrescribesHistoryIndex, 1);
	}else{
		prescribeHistory.deleteDay = true;
	}
}

deleteSelected = function(taskIndex, prescribeHistory){
	var isMultipleSelect = false;
	for(var i=prescribeHistory.prescribes.tasks.length-1;i>=0;i--){
		if(prescribeHistory.prescribes.tasks[i] 
		&& prescribeHistory.prescribes.tasks[i].selectMultiple
		){
			prescribeHistory.prescribes.tasks.splice(i, 1);
			isMultipleSelect = true;
			changeSaveControl($scope, $http);
		}
	}
	if(!isMultipleSelect){
		prescribeHistory.prescribes.tasks.splice(taskIndex, 1);
		changeSaveControl($scope, $http);
	}
};


$scope.selectMultiple = function(taskInDayIndex, prescribeHistory){
	console.log("selectMultiple");
	if(null == prescribeHistory.prescribes.tasks[taskInDayIndex]){
		prescribeHistory.prescribes.tasks[taskInDayIndex] = {};
	}
	prescribeHistory.prescribes.tasks[taskInDayIndex].selectMultiple = !prescribeHistory.prescribes.tasks[taskInDayIndex].selectMultiple;
	prescribeHistory.prescribes.selectMultiple = true;
}

//----------------drug document----------------------------
$scope.newDrugDocumentDose = {};
$scope.addNewDrugDocumentDose = function(){
	$scope.newDrugDocumentDose.DOSE_ID = $scope.drugDocument.localIdSequence++;
	if(null == $scope.drugDocument.doses)
		$scope.drugDocument.doses = [];
	$scope.drugDocument.doses.push($scope.newDrugDocumentDose);
	$scope.addDoseToPrescribeDrug($scope.newDrugDocumentDose);
	saveDrugDocument();
	$scope.newDrugDocumentDose = {};
	changeSaveControl($scope, $http);
};

saveDrugDocument = function(){
	$http({
		method : 'POST',
		data : $scope.drugDocument,
		url : config.urlPrefix + "/save/drug"
	}).success(function(data, status, headers, config){
		$scope.drugDocument = data;
	}).error(function(data, status, headers, config) {
		$scope.error = data;
	});
}
//---------------------drug document---------------------END-------

//---------------------keydown-------------------------------
var KeyCodes = {
	F2 : 113,
	F4 : 115,
	Escape : 27,
	F1 : 112,
	C : 67,
	V : 86,
	S : 83,
	P0 : 48,//Ctrl_P
	Delete : 46,
	PageUp : 33,
	PageDown : 34,
	End : 35,
	Home : 36,
	ArrowUp : 38,
	ArrowDown : 40,
	ArrowLeft : 37,
	ArrowRight : 39,
	BACKSPACE : 8,
	TABKEY : 9,
	Enter : 13,
	SPACEBAR : 32
};

$scope.keys = [];
$scope.keys.push({ code : KeyCodes.F4, action : function() { $scope.savePatient(); }});
$scope.keys.push({ code : KeyCodes.Escape,
	action : function() {
		console.log("Escape");
		if($scope.editedPrescribeHistory.prescribes.selectMultiple){
			escapeSelectMultiple($scope.editedPrescribeHistory);
			return;
		}
		if($scope.patient.pageDeepPositionIndex == 2){
			$scope.patient.pageDeepPositionIndex--;
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
			if($scope.workDoc.selectPrescribesHistoryIndex == -1){
					$scope.patient.patientUpdateOpen = false;
			}else{
				var calcNotCollapsed = 0;
				$($scope.patient.prescribesHistory).each(function () {
					if(!this.isCollapsed) calcNotCollapsed++;
				} );
				if(calcNotCollapsed > 1 && !$scope.editedPrescribeHistory.isCollapsed){
					$scope.editedPrescribeHistory.isCollapsed = true;
				}else{
					$scope.patient.pageDeepPositionIndex--;
					$("#focus_0").focus();
				}
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 0){
			skipLinkMinus1();
		}else 
		if($scope.patient.pageDeepPositionIndex > $scope.minPageDeepPositionIndex){
			$scope.patient.pageDeepPositionIndex--;
			$("#focus_minus_"+(0-$scope.patient.pageDeepPositionIndex)).focus();
		}
	}
});
$scope.keys.push({ code : KeyCodes.F1,
	action : function() {
		$scope.openF1();
	}
});
$scope.openF1 = function(){
	window.open("help.html#patient", "", "width=1000, height=500");
}

deleteAllDrugs = function(){
	var answer = confirm("Видалити всі ліки ("+$scope.editedPrescribeHistory.prescribes.tasks.length+") з схеми ліквання?");
	if (answer) {
		for(var i=$scope.editedPrescribeHistory.prescribes.tasks.length-1;i>=0;i--){
			if($scope.editedPrescribeHistory.prescribes.tasks[i] 
			){
				$scope.editedPrescribeHistory.prescribes.tasks.splice(i, 1);
			}
		}
		changeSaveControl($scope, $http);
	}
};

$scope.keys.push({
	code : KeyCodes.Delete,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 1){
			deleteDay($scope.editedPrescribeHistory);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
			if($scope.editedPrescribeHistory.selectDrugIndex == -1){
				deleteAllDrugs();
			}else{
				deleteSelected($scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
			}
		}
	}
});

$scope.keys.push({
	code : KeyCodes.SPACEBAR,
	action : function() {
		console.log("SPACEBAR");
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.collapseDayPrescribe($scope.patient.selectPrescribesHistoryIndex);
		}else
		if($scope.patient.pageDeepPositionIndex == 2){
			var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
			$scope.openPrescribeDrugDialog(taskInDay, $scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 3){
			initEditedPrescribeDrug($scope);
			if(null == $scope.editedPrescribeDrug)
				openEditedPrescribeDrugDialog();
			else{
				changeHour($scope.editedPrescribeHistory.dayHourIndex, $scope, $http);
			}
		}
	}
});

$scope.keys.push({
	code : KeyCodes.F2,
	action : function() {
		console.log("F2");
		if($scope.patient.pageDeepPositionIndex == 1){
			if($scope.patient.selectPrescribesHistoryIndex == -1){
				$scope.updatePatient();
			}else{
				$scope.phOpenUpdateDialog($scope.workDoc.selectPrescribesHistoryIndex);
			}
			changeSaveControl($scope, $http);
		}
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.Enter,
	action : function() {
		console.log("Ctrl + Enter");
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.phOpenUpdateDialog($scope.workDoc.selectPrescribesHistoryIndex);
			changeSaveControl($scope, $http);
		}
	}
});

$scope.keys.push({ shiftKey : true, code : KeyCodes.Enter,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.newPrescribes();
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
			$scope.editedPrescribeHistory.prescribes.tasks.splice($scope.editedPrescribeHistory.selectDrugIndex+1, 0, null);
			changeSaveControl($scope, $http);
		}
	}
});
$scope.keys.push({
	code : KeyCodes.Enter,
	action : function() {
		console.log("Enter "+"/"+$scope.workDoc.pageDeepPositionIndex+"/"+$scope.workDoc.selectPrescribesHistoryIndex);
		if($scope.workDoc.pageDeepPositionIndex == 1){
			if($scope.workDoc.selectPrescribesHistoryIndex == -1){
				$scope.updatePatient();
			}else{
				$scope.collapseDayPrescribe($scope.workDoc.selectPrescribesHistoryIndex);
			}
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
			openEditedPrescribeDrugDialog();
		}else
		if($scope.workDoc.pageDeepPositionIndex == 3){
			initEditedPrescribeDrug($scope);
			if(null == $scope.editedPrescribeDrug){
				openEditedPrescribeDrugDialog();
			}else{
				changeHour($scope.editedPrescribeHistory.dayHourIndex, $scope, $http);
			}
		}
	}
});

openEditedPrescribeDrugDialog = function(){
	var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
	$scope.openPrescribeDrugDialog(taskInDay, $scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
};

$scope.keys.push({
	code : KeyCodes.ArrowRight,
	action : function() {
		console.log("ArrowRight - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if(document.activeElement.id.indexOf('focus') >= 0){
			$("#"+document.activeElement.id).blur();
		}
		if($scope.patient.pageDeepPositionIndex <= 2){
			$scope.patient.pageDeepPositionIndex++;
			if($scope.patient.pageDeepPositionIndex == 3){
				if($scope.editedPrescribeHistory.dayHourIndex == -1 || !$scope.editedPrescribeHistory.dayHourIndex){
					$scope.editedPrescribeHistory.dayHourIndex = 0;
				}
				return;
			}
		}
		if($scope.patient.pageDeepPositionIndex < 0){
			$("#focus_minus_"+(0-$scope.patient.pageDeepPositionIndex)).focus();
		}else
		if($scope.patient.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
		}else
		if($scope.patient.pageDeepPositionIndex == 2){
			if($scope.editedPrescribeHistory.isCollapsed){
				$scope.editedPrescribeHistory.isCollapsed = false;
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex++;
			if(24 == $scope.editedPrescribeHistory.dayHourIndex)
				$scope.editedPrescribeHistory.dayHourIndex = 0;
		}
	}
});

$scope.keys.push({
	code : KeyCodes.End,
	action : function() {
		console.log("End - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex = 23;
		}
	}
});

$scope.keys.push({
	code : KeyCodes.PageDown,
	action : function() {
		console.log("PageDown - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			if($scope.editedPrescribeHistory.selectDrugIndex < $scope.editedPrescribeHistory.prescribes.tasks.length - 1){
				$scope.editedPrescribeHistory.selectDrugIndex = $scope.editedPrescribeHistory.prescribes.tasks.length - 1;
			}else{
				$scope.editedPrescribeHistory.selectDrugIndex = $scope.editedPrescribeHistory.tasksInDay.length - 1;
			}
		}
	}
});

$scope.keys.push({
	code : KeyCodes.PageUp,
	action : function() {
		console.log("PageUp - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			if($scope.editedPrescribeHistory.selectDrugIndex == 0){
				$scope.editedPrescribeHistory.selectDrugIndex = -1;
			}else{
				$scope.editedPrescribeHistory.selectDrugIndex = 0;
			}
		}
	}
});

$scope.keys.push({ code : KeyCodes.Home,
	action : function() {
		console.log("Home - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex = 0;
		}
	}
});

$scope.keys.push({ code : KeyCodes.ArrowLeft,
	action : function() {
		console.log("ArrowLeft - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex--;
			if($scope.editedPrescribeHistory.dayHourIndex >=0)
				return;
		}
		if($scope.workDoc.pageDeepPositionIndex > $scope.minPageDeepPositionIndex){
			$scope.workDoc.pageDeepPositionIndex--;
		}
		if($scope.workDoc.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
			$scope.workDoc.selectPrescribesHistoryIndex = 0;
			initEditedPrescribeHistory($scope);
		}else
		if($scope.workDoc.pageDeepPositionIndex < 0){
			$("#focus_minus_"+(0-$scope.workDoc.pageDeepPositionIndex)).focus();
		}
	}
});

$scope.keys.push({
	code : KeyCodes.ArrowDown,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex++;
			if($scope.editedPrescribeHistory.selectDrugIndex >= 19){
				$scope.editedPrescribeHistory.selectDrugIndex = 0;
			}
			initEditedPrescribeDrug($scope);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.workDoc.selectPrescribesHistoryIndex++;
			if($scope.workDoc.selectPrescribesHistoryIndex >= $scope.patient.prescribesHistory.length){
				$scope.workDoc.selectPrescribesHistoryIndex = -1;
			}
			initEditedPrescribeHistory($scope);
		}
	}
});
$scope.keys.push({ code : KeyCodes.ArrowUp,
	action : function() {
		console.log("ArrowUp - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex--;
			if($scope.editedPrescribeHistory.selectDrugIndex < -1){
				$scope.editedPrescribeHistory.selectDrugIndex = 18;
			}
			initEditedPrescribeDrug($scope);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.workDoc.selectPrescribesHistoryIndex--;
			if($scope.workDoc.selectPrescribesHistoryIndex < -1){
				$scope.workDoc.selectPrescribesHistoryIndex = 
					$scope.workDoc.prescribesHistory.length - 1;
			}
			initEditedPrescribeHistory($scope);
		}
	}
});
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.P0,
	action : function() { //Ctrl_P
		document.getElementById("print_"+prescribeHistoryIndex).click();
	}
});
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.V,
	action : function() {
		var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
		contextMenuPaste(taskInDay, $scope.editedPrescribeHistory, $scope, $http); 
	}
});
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.C,
	action : function() {
		copy($scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.S, action : function() { $scope.savePatient(); }});

$scope.keys.push({
	ctrlKey : true, code : KeyCodes.ArrowDown,
	action : function() {
	}
});
$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowUp,
	action : function() {
	}
});

hourYesHourNo = function (hourYes, hourNo){
	$scope.editedPrescribeDrug.times.hours[hourYes] = "-";
	$scope.editedPrescribeDrug.times.hours[hourNo] = null;
}
var dayStartHour = 8;
$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowLeft,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 3){
			var hour =  getLp24hour($scope.editedPrescribeHistory.dayHourIndex, $scope);
			if($scope.editedPrescribeDrug.times.hours[hour]){
				hourYesHourNo(hour - 1, hour);
				$scope.editedPrescribeHistory.dayHourIndex--;
			}else{
				var moved = false;
				var selectedHour = hour;
				for (var hour = dayStartHour; hour < selectedHour; hour++) {
					if($scope.editedPrescribeDrug.times.hours[hour]){
						if(hour == 8) break; // no move to other day
						hourYesHourNo(hour - 1, hour);
						var moved = true;
					}
				}
				if(moved)
					$scope.editedPrescribeHistory.dayHourIndex--;
			}
		}
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowRight,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 3){
			var hour =  getLp24hour($scope.editedPrescribeHistory.dayHourIndex, $scope);
			if($scope.editedPrescribeDrug.times.hours[hour]){
				hourYesHourNo(hour + 1, hour);
				$scope.editedPrescribeHistory.dayHourIndex++;
			}else{
				var moved = false;
				var selectedHour = hour;
				var isBreak = false;
				for (var hour = dayStartHour - 1; hour > selectedHour || (selectedHour >= dayStartHour && hour >= 0); hour--) 
					if($scope.editedPrescribeDrug.times.hours[hour]){
						if(hour == (dayStartHour - 1)){
							isBreak = true;
							break; // no move to other day
						}
						hourYesHourNo(hour + 1, hour);
						var moved = true;
					}
				if(!isBreak)
					for (var hour = 23; hour > selectedHour; hour--) 
						if($scope.editedPrescribeDrug.times.hours[hour]){
							var hourYes = (hour == 23)? 0:hour + 1;
							hourYesHourNo(hourYes, hour);
							var moved = true;
						}
				if(moved)
					$scope.editedPrescribeHistory.dayHourIndex++;
			}
		}
	}
});

$scope.keys.push({
	altKey : true, code : KeyCodes.ArrowDown,
	action : function() {
		movePlus($scope.editedPrescribeHistory.prescribes.tasks, $scope.editedPrescribeHistory.selectDrugIndex + 1);
		$scope.editedPrescribeHistory.selectDrugIndex++;
	}
});
$scope.keys.push({ altKey : true, code : KeyCodes.ArrowUp,
	action : function() {
		moveMinus($scope.editedPrescribeHistory.prescribes.tasks, $scope.editedPrescribeHistory.selectDrugIndex);
		$scope.editedPrescribeHistory.selectDrugIndex--;
	}
});

isDrugEditDialogOpen = function(){
	if($scope.workDoc.selectPrescribesHistoryIndex < 0)
		return false;
	if(!$scope.editedPrescribeHistory.selectDrugIndex){
		$scope.editedPrescribeHistory.selectDrugIndex = 0;
	}
	var editDrugDialogOpen = 
		$scope.editedPrescribeHistory.tasksInDay 
		&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex]
		&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed;
	return editDrugDialogOpen;
}

var patientUpdateHash = "";
$scope.checkPatientUpdated = function(){
	if($scope.patient.patientUpdateOpen){
		$scope.patient.patientUpdateOpen = false;
		var checkUpdated = patientUpdateHash != ($scope.patient.PATIENT_NAME + $scope.patient.PATIENT_HISTORYID);
		if(checkUpdated){
			changeSaveControl($scope, $http);
		}
	}
}
$scope.isPatientUpdateOpen = function(){
	if($scope.patient.patientUpdateOpen){
		patientUpdateHash = $scope.patient.PATIENT_NAME + $scope.patient.PATIENT_HISTORYID
	}
}

isEditDialogOpen = function(){
	var editDialogOpen = 
		false
		|| $scope.workDoc.patientUpdateOpen
		|| isDrugEditDialogOpen()
		;
	return editDialogOpen;
}

$scope.$on('keydown', function(msg, obj){
//	console.log(obj);
	console.log(obj.event);
	var code = obj.event.keyCode;
	if(isEditDialogOpen()){
		if(code == $scope.keys[0].code){
			$scope.keys[0].action(); //make save (F4)
		}else
		if(code == $scope.keys[1].code){
			$scope.keys[1].action(); //make Escape
			$scope.$apply();
		}
		return;
	}
	var ctrlKey = obj.event.ctrlKey;
	var altKey = obj.event.altKey;
	var shiftKey = obj.event.shiftKey;
	$scope.keys.forEach(function(o) {
		if(o.code !== code) return;
		if((ctrlKey && !o.ctrlKey) || (o.ctrlKey && !ctrlKey)) return;
		if((altKey && !o.altKey) || (o.altKey && !altKey)) return;
		if((shiftKey && !o.shiftKey) || (o.shiftKey && !shiftKey)) return;
		o.action();
		$scope.$apply();
	});
});
//---------------------keydown---------------------END-------
//---------------datepicker-------------------------
$scope.today = function() { $scope.dt = new Date(); };
$scope.today(); 
$scope.clear = function () { $scope.dt = null; };
// Disable weekend selection
$scope.disabled = function(date, mode) {
	return false;
//	return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
};
$scope.toggleMin = function() { $scope.minDate = $scope.minDate ? null : new Date(); };
$scope.toggleMin();
$scope.open = function($event) {
	$event.preventDefault();
	$event.stopPropagation();
	$scope.opened = true;
};
$scope.dateOptions = { formatYear: 'yy', startingDay: 1 };
$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
$scope.format = $scope.formats[0];
//---------------datepicker-------------------------END
}]);

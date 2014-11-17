cuwyApp.controller('patientLp24hCtrl', [ '$scope', '$http', '$filter', function ($scope, $http, $filter) {
	var minPageDeepPositionIndex = -2;
	$scope.numberOfChange = 0;
	$scope.numberOfAutoSavedChange = 0;
	$scope.drug1sList = drug1sList;
	$scope.config = config;
	$scope.siteMap = config.siteMap.siteMaps[4];
	$scope.parameters = parameters;
	var pageDeepPosition = ["page","day","task","edittask"];
	
	getDayHours = function(){
		var dayHours = [];
		for(var i=0;i<24;i++) dayHours.push(i);
		return dayHours;
	};

	$scope.dayHours = getDayHours();
	getTasksInDay = function(){
		var tasksInDay = [];
		for(var ii=0;ii<19;ii++){
			tasksInDay.push({i:ii,isCollapsed:false});
		}
		return tasksInDay;
	};

	$http({
		method : 'GET',
		url : config.urlPrefix + '/read/patient_'+$scope.parameters.id
	}).success(function(data, status, headers, config) {
		$scope.patient = data;
		initWorkDocument();
	}).error(function(data, status, headers, config) {
	});

	initWorkDocument = function(){
		console.log("initWorkDocument");
		$scope.workDoc = $scope.patient;
		if(null == $scope.patient.prescribesHistory){
			$scope.newPrescribes();
			changeSaveControl($scope, $http);
		}
		$($scope.patient.prescribesHistory).each(function () {
			this.tasksInDay = getTasksInDay();
		});
		if(typeof $scope.patient.selectPrescribesHistoryIndex === 'undefined'){
			$scope.patient.selectPrescribesHistoryIndex = 0;
			changeSaveControl($scope, $http);
		}
		initEditedPrescribeHistory();
		if(typeof $scope.editedPrescribeHistory === 'undefined'){
			$scope.editedPrescribeHistory = $scope.patient.prescribesHistory[0];
		}
		if(typeof $scope.editedPrescribeHistory.selectDrugIndex === 'undefined'){
			$scope.editedPrescribeHistory.selectDrugIndex = 0;
			changeSaveControl($scope, $http);
		}
		initEditedPrescribeDrug();
		if(typeof $scope.patient.pageDeepPositionIndex === 'undefined'){
			changeSaveControl($scope, $http);
			if($scope.editedPrescribeHistory.isCollapsed){
				$scope.patient.pageDeepPositionIndex = 1;
			}else{
				$scope.patient.pageDeepPositionIndex = 2;
			}
		}
		var patientFromList = $filter('filter')(patient1sList, 
				{PATIENT_ID:$scope.patient.PATIENT_ID})[0];
		if($scope.patient.PATIENT_NAME != patientFromList.PATIENT_NAME){
			$scope.patient.PATIENT_NAME = patientFromList.PATIENT_NAME;
			changeSaveControl($scope, $http);
		}
	}

	$scope.newPrescribes = function(){
		var today = new Date();
		var prescribeHistory = {
				date:today, 
				selectDrugIndex:0,
				prescribes:{tasks:[]}
		}
		prescribeHistory.tasksInDay = getTasksInDay();
		if(null == $scope.patient.prescribesHistory){
			$scope.patient.prescribesHistory = [];
		}
		$scope.patient.prescribesHistory.splice(0, 0, prescribeHistory);
		$scope.workDoc.selectPrescribesHistoryIndex = 0;
		initEditedPrescribeHistory();
	}

	$scope.savePatient = function(){
		var docToSave = cangePatientDocToSave($scope);
		$http({
			method : 'POST',
			data : docToSave,
			url : config.urlPrefix + "/save/patient"
		}).success(function(data, status, headers, config){
			$scope.patient = data;
			initWorkDocument();
			$scope.numberOfChange = 0;
			$scope.numberOfAutoSavedChange = 0;
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
	};

	//---------data-ng-class-----------------------------------
	$scope.dayInSelectPath = function(prescribeHistoryIndex){
		return prescribeHistoryIndex == $scope.workDoc.selectPrescribesHistoryIndex;
	}
	$scope.daySelected = function(prescribeHistoryIndex){
		return $scope.dayInSelectPath(prescribeHistoryIndex) && ($scope.workDoc.pageDeepPositionIndex == 1);
	}
	$scope.taskInSelectPath = function(taskInDayIndex, prescribeHistory){
		return taskInDayIndex == prescribeHistory.selectDrugIndex;
	}
	$scope.taskSelected = function(taskInDayIndex, prescribeHistory){
		var dayInSelectPath = $scope.dayInSelectPath(getPrescribeIndex(prescribeHistory));
		return dayInSelectPath && $scope.taskInSelectPath(taskInDayIndex, prescribeHistory) && ($scope.patient.pageDeepPositionIndex == 2);
	}
	$scope.dayHourInSelectPath = function(dayHourIndex, taskInDayIndex, prescribeHistory){
		var dayInSelectPath = $scope.dayInSelectPath(getPrescribeIndex(prescribeHistory));
		if(!dayInSelectPath) return false;
		var taskInSelectPath = $scope.taskInSelectPath(taskInDayIndex, prescribeHistory);
		if(!taskInSelectPath) return false;
		return $scope.editedPrescribeHistory.dayHourIndex == dayHourIndex;
	}
	$scope.dayHourSelected = function(dayHourIndex, taskInDayIndex, prescribeHistory){
		return $scope.dayHourInSelectPath(dayHourIndex, taskInDayIndex, prescribeHistory) && ($scope.patient.pageDeepPositionIndex == 3);
	}
	//---------data-ng-class--------------------END------------

	$scope.phOpenUpdateDialog = function(prescribeHistoryIndex){
		var prescribeHistory = $scope.workDoc.prescribesHistory[prescribeHistoryIndex];
		prescribeHistory.updateDialogOpen = !prescribeHistory.updateDialogOpen;
	}
	$scope.collapseDayPrescribe = function(prescribeHistoryIndex){
		if($scope.patient.selectPrescribesHistoryIndex == -1){
			$scope.workDoc.selectPrescribesHistoryIndex = prescribeHistoryIndex;
			initEditedPrescribeHistory();
			$scope.patient.patientUpdateOpen = false;
			return;
		}
		var prescribeHistory = $scope.workDoc.prescribesHistory[prescribeHistoryIndex];
		if(prescribeHistory.updateDialogOpen){
			prescribeHistory.updateDialogOpen = false;
			return;
		}
		prescribeHistory.isCollapsed = !prescribeHistory.isCollapsed
		if(prescribeHistory.isCollapsed)
			return;
		setEditedPrescribeHistory(prescribeHistoryIndex);
		changeSaveControl($scope, $http);
	}

	setEditedPrescribeHistory = function(index){
		$scope.workDoc.selectPrescribesHistoryIndex = index;
		initEditedPrescribeHistory();
	}
	initEditedPrescribeDrug = function(){
		$scope.editedPrescribeDrug =  $scope.editedPrescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
	}
	initEditedPrescribeHistory = function(){
		if($scope.patient.selectPrescribesHistoryIndex < 0){
			return;
		}
		$scope.editedPrescribeHistory = $scope.workDoc.prescribesHistory[$scope.workDoc.selectPrescribesHistoryIndex];
	}
	getPrescribeIndex = function(prescribeHistory){ return $scope.workDoc.prescribesHistory.indexOf(prescribeHistory); }
	setEditedPrescribeDrug = function(taskInDayIndex){
		$scope.editedPrescribeHistory.selectDrugIndex = taskInDayIndex;
		initEditedPrescribeDrug();
	}

	closeEditedPrescribeDrugDialog = function(){
		$scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed = false;
	}

	changeEditedSelection = function(taskInDayIndex, prescribeHistory){
		var isWithoutChange = true;
		var selectPrescribesHistoryIndex = getPrescribeIndex(prescribeHistory);
		if(!$scope.dayInSelectPath(selectPrescribesHistoryIndex)){
			closeEditedPrescribeDrugDialog();
			setEditedPrescribeHistory(selectPrescribesHistoryIndex);
			setEditedPrescribeDrug(taskInDayIndex);
			isWithoutChange = false;
		}
		if(!$scope.taskInSelectPath(taskInDayIndex, prescribeHistory)){
			closeEditedPrescribeDrugDialog();
			setEditedPrescribeDrug(taskInDayIndex);
			isWithoutChange = false;
		}
		return isWithoutChange;
	}
	
	$scope.openPrescribeDrugDialog = function(taskInDay, taskInDayIndex, prescribeHistory){
		if($scope.patient.selectPrescribesHistoryIndex == -1){
			$scope.patient.selectPrescribesHistoryIndex = getPrescribeIndex(prescribeHistory);
		}
		$scope.patient.pageDeepPositionIndex = 2;
		if(!changeEditedSelection(taskInDayIndex, prescribeHistory)) 
			return;

		//$scope.patient.pageDeepPositionIndex = 3;
		var oldCollapsed = taskInDay.isCollapsed;
		$(prescribeHistory.tasksInDay).each(function () {
			this.isCollapsed = false;
		} );
		taskInDay.isCollapsed = !oldCollapsed;
		$scope.editedPrescribeDrug =  prescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
		if(null == $scope.editedPrescribeDrug){
			$scope.editedPrescribeDrug = 
			{DRUG_NAME:"",
				dose:{DOSECONCENTRATON_UNIT:""
					,DOSECONCENTRATON_NUMBER:""
					,DOSE_UNIT:""
					,DOSE_NUMBER:""
					,DOSE_ID:""
					,DOSE_ROUTE_OF_ADMINISTRATION:""}
			};
			insertDrugToTask($scope.editedPrescribeDrug, $scope.editedPrescribeHistory.selectDrugIndex, prescribeHistory);
		}
		if($scope.editedPrescribeDrug && $scope.editedPrescribeDrug.DRUG_ID){
			readDrugDocument($scope.editedPrescribeDrug);
		}
	}
	
readDrugDocument = function(drug){
	$http({
		method : 'GET',
		url : config.urlPrefix + '/read/drug_'+drug.DRUG_ID
	}).success(function(data, status, headers, config) {
		$scope.drugDocument = data;
	}).error(function(data, status, headers, config) {
		$scope.drugDocument = null;
	});
}

$scope.saveNewDrug = function(seekDrug, taskInDay, prescribeHistory){
	$http({
		method : 'POST',
		data : $scope.editedPrescribeDrug,
		url : config.urlPrefix + '/saveNewDrug'
	}).success(function(data, status, headers, config){
		$scope.drug1sList = data;
		var newDrug = $scope.drug1sList[$scope.drug1sList.length-1];
		$scope.drugToTask2(newDrug, taskInDay, prescribeHistory)
	}).error(function(data, status, headers, config) {
		$scope.error = data;
	});
}

insertDrugToTask = function(drug, position, prescribeHistory){
	var addNull = position - prescribeHistory.prescribes.tasks.length;
	if(addNull > 0){
		for (i = 0; i < addNull; i++) {
			prescribeHistory.prescribes.tasks.push(null);
		}
		prescribeHistory.prescribes.tasks.push(drug);
	}else if(null == prescribeHistory.prescribes.tasks[position]){
		prescribeHistory.prescribes.tasks[position] = drug;
	}else{
		prescribeHistory.prescribes.tasks[position] = drug;
	}
	changeSaveControl($scope, $http);
}


$scope.useHour = function(taskInDay, taskInDayIndex, dayHourIndex, prescribeHistory){
	$scope.workDoc.pageDeepPositionIndex = 3;
	console.log("A1 = "+dayHourIndex+":"+taskInDayIndex);
	var isWithoutChange = changeEditedSelection(taskInDayIndex, prescribeHistory);
	$scope.editedPrescribeHistory.dayHourIndex = dayHourIndex;
	if(!isWithoutChange) 
		return;
	if(!taskInDay.isCollapsed){
		changeHour(dayHourIndex, $scope, $http);
	}else
	if(taskInDay.isCollapsed){
		var hour =  getLp24hour(dayHourIndex);
		var editedDrug = prescribeHistory.prescribes.tasks[taskInDay.i];
		if(!editedDrug.times){
			editedDrug.times = {};
			editedDrug.times.hours = getDayHoursEmpty();
		}
		if(!editedDrug.times.hours[hour]){
			editedDrug.times.hours[hour] = "-";
		}else{
			editedDrug.times.hours[hour] = null;
		}
		changeSaveControl($scope, $http);
		taskInDay.dialogTab = "times";
	}
}

getLp24hour= function(dayHour){
	var lp24hour = dayHour + $scope.config.startHour24lp;
	lp24hour = lp24hour>23?lp24hour-24:lp24hour;
	return lp24hour;
}

$scope.isMinus = function(taskInDayIndex, dayHourIndex, prescribeHistory){
	if(!prescribeHistory.prescribes || !prescribeHistory.prescribes.tasks[taskInDayIndex]
	|| !prescribeHistory.prescribes.tasks[taskInDayIndex].times
	)
		return false;
	var lp24hour = getLp24hour(dayHourIndex);
	var isMinus = ('-' == prescribeHistory.prescribes.tasks[taskInDayIndex].times.hours[lp24hour]);
	return isMinus;
}

$scope.getLp24hourStr = function(dayHour){
	var lp24hour = getLp24hour(dayHour);
	return (lp24hour>9?'':'0')+lp24hour;
}
getLp24hour= function(dayHour){
	var lp24hour = dayHour + $scope.config.startHour24lp;
	lp24hour = lp24hour>23?lp24hour-24:lp24hour;
	return lp24hour;
}

$scope.getHoures2prescribe = function(drugForEdit){
	var houres2prescribe = [];
	if(drugForEdit && drugForEdit.times)
	angular.forEach(drugForEdit.times.hours, function(value, key){
		if(value){
			houres2prescribe.push(key);
		}
	} );
	return houres2prescribe;
}
$scope.prescribeHoursLeft = function(drugForEdit){
	var houres2prescribe = $scope.getHoures2prescribe(drugForEdit);
	angular.forEach(houres2prescribe, function(hourValue, key){
		$scope.prescribeHourLeft(drugForEdit, hourValue);
	});
}
$scope.prescribeHourLeft = function(drugForEdit, hour){
	moveMinus(drugForEdit.times.hours, hour);
}
$scope.prescribeHourRight = function(drugForEdit, hour){
	movePlus(drugForEdit.times.hours, hour + 1);
}
$scope.prescribeHoursRight = function(drugForEdit){
	var houres2prescribe = $scope.getHoures2prescribe(drugForEdit);
	angular.forEach(houres2prescribe, function(hourValue, key){
		$scope.prescribeHourRight(drugForEdit, hourValue);
	});
}

moveTo = function(arrayToSort, indexFrom, indexTo){
	var el = arrayToSort.splice(indexFrom, 1);
	arrayToSort.splice(indexTo, 0, el[0]);
	changeSaveControl($scope, $http);
}

moveUp = function(arrayToSort, index){
	moveTo(arrayToSort, index,index-1);
}

movePlus = function(arrayToSort, index){
	if(index < arrayToSort.length){
		moveUp(arrayToSort, index);
	}else{
		moveTo(arrayToSort, index-1,0);
	}
}
moveMinus = function(arrayToSort, index){
	if(index > 0){
		moveUp(arrayToSort, index);
	}else{
		moveTo(arrayToSort, 0, arrayToSort.length-1);
	}
}
contextMenuCopy = function(copyObject){
	$http({
		method : 'POST',
		data : copyObject,
		url : config.urlPrefix + "/session/copy"
	}).success(function(data, status, headers, config){
	}).error(function(data, status, headers, config) {
		$scope.error = data;
	});
}

copy = function(taskIndex, prescribeHistory){
	//var drug = prescribeHistory.prescribes.tasks[taskIndex];
	//if(drug.selectMultiple){
	if(prescribeHistory.prescribes.selectMultiple){
		contextMenuCopy(prescribeHistory.prescribes); 
	}else{
		var drug = prescribeHistory.prescribes.tasks[taskIndex];
		contextMenuCopy(drug);
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
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		$itemScope.prescribeHistory.updateDialogOpen = !$itemScope.prescribeHistory.updateDialogOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-remove"></span> Видалити <sub><kbd>Del</kbd></sub>', function ($itemScope) {
		deleteDay($itemScope.prescribeHistory);
	}]
];

$scope.menuTask = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція <sub><kbd>⏎</kbd></sub>', function ($itemScope) {
		$scope.openPrescribeDrugDialog($itemScope.taskInDay, $itemScope.taskInDayIndex, $itemScope.$parent.prescribeHistory);
	}],
	null,
	['<i class="fa fa-copy"></i> Копіювати <sub><kbd>Ctrl+C</kbd></sub>', function ($itemScope) { 
		var taskIndex = $itemScope.$index;
		copy(taskIndex, $itemScope.$parent.prescribeHistory);
	}],
	['<i class="fa fa-paste"></i> Вставити <sub><kbd>Ctrl+V</kbd></sub>', function ($itemScope) { 
		$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index, 0, null);
		contextMenuPaste($itemScope.taskInDay, $itemScope.$parent.prescribeHistory); 
	}],
	null,
	['<span class="glyphicon glyphicon-plus"></span> Додати строчку <sub><kbd>Shift+⏎</kbd></sub>', function ($itemScope) {
		$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index+1, 0, null);
		changeSaveControl($scope, $http);
	}],
	['<span class="glyphicon glyphicon-remove"></span> Видалити <sub><kbd>Del</kbd></sub>', function ($itemScope) {
		deleteSelected($itemScope.$index, $itemScope.$parent.prescribeHistory);
	}],
	null,
	['<span class="glyphicon glyphicon-arrow-up"></span> Догори <sub><kbd>Alt+↑</kbd></sub>', function ($itemScope) {
		moveMinus($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	['<span class="glyphicon glyphicon-arrow-down"></span> Донизу <sub><kbd>Alt+↓</kbd></sub>', function ($itemScope) {
		movePlus($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index + 1);
	}],
	null,
	['<i class="fa fa-reply-all"></i> Скасувати вибір', function ($itemScope) {
		escapeSelectMultiple($itemScope.$parent.prescribeHistory);
	}]
];

escapeSelectMultiple = function(prescribeHistory){
	$(prescribeHistory.prescribes.tasks).each(function () {
		this.selectMultiple = false;
	});
	prescribeHistory.prescribes.selectMultiple = false;
}


$scope.menuTasksAll = [
	['<i class="fa fa-copy"></i> Копіювати <sub><kbd>Ctrl+C</kbd></sub>', function ($itemScope) { 
		contextMenuCopy($itemScope.prescribeHistory.prescribes); 
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

contextMenuPaste = function(taskInDay, prescribeHistory){
	$http({
		method : 'GET',
		url : config.urlPrefix + '/session/paste'
	}).success(function(data, status, headers, config) {
		if(data.selectMultiple && data.tasks){
			var position = taskInDay.i;
			$(data.tasks).each(function () {
				if(this.selectMultiple){
					insertDrugToTask(this, position++, prescribeHistory);
				}
			});
		}else{
			var drug = data;
			$scope.drugToTask2(drug, taskInDay, prescribeHistory)
		}
	}).error(function(data, status, headers, config) {
	});
};

$scope.drugToTask2 = function(drug, taskInDay, prescribeHistory){
	var position = taskInDay.i;
	insertDrugToTask(drug, position, prescribeHistory);
	taskInDay.dialogTab = "dose";
	readDrugDocument(drug);
	$scope.editedPrescribeDrug =  prescribeHistory.prescribes.tasks[position];
}

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
$scope.keys.push({code : KeyCodes.F4, action : function() { $scope.savePatient(); }});
$scope.keys.push({
	code : KeyCodes.Escape,
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
		if($scope.patient.pageDeepPositionIndex > minPageDeepPositionIndex){
			$scope.patient.pageDeepPositionIndex--;
			$("#focus_minus_"+(0-$scope.patient.pageDeepPositionIndex)).focus();
		}
	}
});
$scope.keys.push({
	code : KeyCodes.F1,
	action : function() {
		$scope.openF1();
	}
});
$scope.openF1 = function(){
	window.open("help.html#patient", "", "width=1000, height=500");
}
$scope.keys.push({
	code : KeyCodes.Delete,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 1){
			deleteDay($scope.editedPrescribeHistory);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
//			var antwort = alert("Видалити елемент з схеми ліквання?");
//			console.log(antwort);
			deleteSelected($scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
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
			initEditedPrescribeDrug();
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
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.Enter,
	action : function() {
		console.log("Ctrl + Enter");
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.phOpenUpdateDialog($scope.workDoc.selectPrescribesHistoryIndex);
			changeSaveControl($scope, $http);
		}
	}
});

$scope.keys.push({
	shiftKey : true, code : KeyCodes.Enter,
	action : function() {
		//$scope.editedPrescribeHistory.selectDrugIndex++;
		$scope.editedPrescribeHistory.prescribes.tasks.splice($scope.editedPrescribeHistory.selectDrugIndex+1, 0, null);
		changeSaveControl($scope, $http);
	}
});
$scope.keys.push({
	code : KeyCodes.Enter,
	action : function() {
		console.log("Enter");
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
			initEditedPrescribeDrug();
			if(null == $scope.editedPrescribeDrug)
				openEditedPrescribeDrugDialog();
			else{
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
			console.log($scope.editedPrescribeHistory.prescribes.tasks.length);
			console.log($scope.editedPrescribeHistory.selectDrugIndex);
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
			$scope.editedPrescribeHistory.selectDrugIndex = 0;
		}
	}
});

$scope.keys.push({
	code : KeyCodes.Home,
	action : function() {
		console.log("Home - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			console.log($scope.editedPrescribeHistory.dayHourIndex);
			$scope.editedPrescribeHistory.dayHourIndex = 0;
		}
	}
});

$scope.keys.push({
	code : KeyCodes.ArrowLeft,
	action : function() {
		console.log("ArrowLeft - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex--;
			if($scope.editedPrescribeHistory.dayHourIndex >=0)
				return;
		}
		if($scope.workDoc.pageDeepPositionIndex > minPageDeepPositionIndex){
			$scope.workDoc.pageDeepPositionIndex--;
		}
		if($scope.workDoc.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
			$scope.workDoc.selectPrescribesHistoryIndex = 0;
			initEditedPrescribeHistory();
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
			initEditedPrescribeDrug();
		}else
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.workDoc.selectPrescribesHistoryIndex++;
			if($scope.workDoc.selectPrescribesHistoryIndex >= $scope.patient.prescribesHistory.length){
				$scope.workDoc.selectPrescribesHistoryIndex = -1;
			}
			initEditedPrescribeHistory();
		}
	}
});
$scope.keys.push({
	code : KeyCodes.ArrowUp,
	action : function() {
		console.log("ArrowUp - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex--;
			if($scope.editedPrescribeHistory.selectDrugIndex < 0){
				$scope.editedPrescribeHistory.selectDrugIndex = 18;
			}
			initEditedPrescribeDrug();
		}else
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.workDoc.selectPrescribesHistoryIndex--;
			if($scope.workDoc.selectPrescribesHistoryIndex < -1){
				$scope.workDoc.selectPrescribesHistoryIndex = 
					$scope.workDoc.prescribesHistory.length - 1;
			}
			initEditedPrescribeHistory();
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
		contextMenuPaste(taskInDay, $scope.editedPrescribeHistory); 
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
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.ArrowUp,
	action : function() {
	}
});

hourYesHourNo = function (hourYes, hourNo){
	$scope.editedPrescribeDrug.times.hours[hourYes] = "-";
	$scope.editedPrescribeDrug.times.hours[hourNo] = null;
}
var dayStartHour = 8;
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.ArrowLeft,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 3){
			console.log($scope.editedPrescribeHistory.dayHourIndex);
			var hour =  getLp24hour($scope.editedPrescribeHistory.dayHourIndex);
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

$scope.keys.push({
	ctrlKey : true, code : KeyCodes.ArrowRight,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 3){
			var hour =  getLp24hour($scope.editedPrescribeHistory.dayHourIndex);
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
$scope.keys.push({
	altKey : true, code : KeyCodes.ArrowUp,
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
	console.log(obj);
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


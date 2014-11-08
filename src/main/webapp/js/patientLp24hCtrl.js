cuwyApp.controller('patientLp24hCtrl', [ '$scope', '$http', '$filter', function ($scope, $http, $filter) {
	var minPageDeepPositionIndex = -2;
	$scope.numberOfChange = 0;
	$scope.drug1sList = drug1sList;
	$scope.config = config;
	$scope.siteMap = config.siteMap.siteMaps[4];
	$scope.parameters = parameters;
	var pageDeepPosition = ["page","day","task","edittask"];
	
	getDayHours = function(){
		var dayHours = [];
		for(var i=0;i<24;i++) dayHours.push(i);
		return dayHours;
	}
	$scope.dayHours = getDayHours();
	getTasksInDay = function(){
		var tasksInDay = [];
		for(var ii=0;ii<19;ii++){
			tasksInDay.push({i:ii,isCollapsed:false});
		}
		return tasksInDay;
	}

	$http({
		method : 'GET',
		url : config.urlPrefix + '/read/patient_'+$scope.parameters.id
	}).success(function(data, status, headers, config) {
		$scope.patient = data;
		initPatientDocument();
	}).error(function(data, status, headers, config) {
	});

	initPatientDocument = function(){
		console.log("initPatientDocument");
		$scope.workDoc = $scope.patient;
		if(null == $scope.patient.prescribesHistory){
			$scope.newPrescribes();
			$scope.numberOfChange++;
		}
		$($scope.patient.prescribesHistory).each(function () {
			this.tasksInDay = getTasksInDay();
		} );
		if(typeof $scope.patient.selectPrescribesHistoryIndex === 'undefined'){
			$scope.patient.selectPrescribesHistoryIndex = 0;
			$scope.numberOfChange++;
		}
		initEditedPrescribeHistory();
		if(typeof $scope.editedPrescribeHistory.selectDrugIndex === 'undefined'){
			$scope.editedPrescribeHistory.selectDrugIndex = 0;
			$scope.numberOfChange++;
		}
		initEditedPrescribeDrug();
		initEditedPrescribeDrug();
		if(typeof $scope.patient.pageDeepPositionIndex === 'undefined'){
			$scope.numberOfChange++;
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
			$scope.numberOfChange++;
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
	}

	$scope.savePatient = function(){
			$($scope.patient.prescribesHistory).each(function () {
				this.tasksInDay = null;
			} );
		$http({
			method : 'POST',
			data : $scope.patient,
			url : config.urlPrefix + "/save/patient"
		}).success(function(data, status, headers, config){
			$scope.patient = data;
			initPatientDocument();
			$scope.numberOfChange = 0;
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

	$scope.collapseDayPrescribe = function(prescribeHistoryIndex){
		var prescribeHistory = $scope.patient.prescribesHistory[prescribeHistoryIndex];
		if(prescribeHistory.updateDialogOpen){
			prescribeHistory.updateDialogOpen = false;
			return;
		}
		prescribeHistory.isCollapsed = !prescribeHistory.isCollapsed
		if(prescribeHistory.isCollapsed)
			return;
		setEditedPrescribeHistory(prescribeHistoryIndex);
		$scope.numberOfChange++;
	}

	setEditedPrescribeHistory = function(index){
		$scope.workDoc.selectPrescribesHistoryIndex = index;
		initEditedPrescribeHistory();
	}
	initEditedPrescribeDrug = function(){
		$scope.editedPrescribeDrug =  $scope.editedPrescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
	}
	initEditedPrescribeHistory = function(){
		$scope.editedPrescribeHistory = $scope.workDoc.prescribesHistory[$scope.patient.selectPrescribesHistoryIndex];
	}
	getPrescribeIndex = function(prescribeHistory){ return $scope.workDoc.prescribesHistory.indexOf(prescribeHistory); }
	setEditedPrescribeDrug = function(taskInDayIndex){
		$scope.editedPrescribeHistory.selectDrugIndex = taskInDayIndex;
		initEditedPrescribeDrug();
	}

	closeEditedPrescribeDrugDialog = function(){
		console.log($scope.editedPrescribeHistory);
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
	$scope.numberOfChange++;
}

changeHour = function(dayHourIndex){
	if(!$scope.editedPrescribeDrug.times){
		$scope.editedPrescribeDrug.times = {};
		$scope.editedPrescribeDrug.times.hours = getDayHoursEmpty();
	}
	console.log(dayHourIndex);
	var hour =  getLp24hour(dayHourIndex);
	console.log(hour);
	if(!$scope.editedPrescribeDrug.times.hours[hour]){
		$scope.editedPrescribeDrug.times.hours[hour] = "-";
	}else{
		$scope.editedPrescribeDrug.times.hours[hour] = null;
	}
}

$scope.useHour = function(taskInDay, taskInDayIndex, dayHourIndex, prescribeHistory){
	$scope.workDoc.pageDeepPositionIndex = 3;
	console.log("A1 = "+dayHourIndex+":"+taskInDayIndex);
	var isWithoutChange = changeEditedSelection(taskInDayIndex, prescribeHistory);
	console.log($scope.editedPrescribeDrug);
	$scope.editedPrescribeHistory.dayHourIndex = dayHourIndex;
	if(!isWithoutChange) 
		return;
	if(!taskInDay.isCollapsed){
		changeHour(dayHourIndex);
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
		$scope.numberOfChange++;
		taskInDay.dialogTab = "times";
	}
}

getLp24hour= function(dayHour){
	var lp24hour = dayHour + $scope.config.startHour24lp;
	lp24hour = lp24hour>23?lp24hour-24:lp24hour;
	return lp24hour;
}

getDayHoursEmpty = function(){
	var dayHours = [];
	for(var i=0;i<24;i++) dayHours.push(null);
	return dayHours;
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
	$scope.numberOfChange++;
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
	var drug = prescribeHistory.prescribes.tasks[taskIndex];
	if(drug.selectMultiple){
		$itemScope.$parent.prescribeHistory.prescribes.selectMultiple = true;
		contextMenuCopy($itemScope.$parent.prescribeHistory.prescribes); 
	}else{
		contextMenuCopy(drug);
	}
}

$scope.menuPatientUpdate = [
['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
	console.debug('Edit');
	console.log($itemScope);
	$itemScope.patient.patientUpdateOpen = !$itemScope.patient.patientUpdateOpen;
}]
];

$scope.menuDayBlock = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		$itemScope.prescribeHistory.updateDialogOpen = !$itemScope.prescribeHistory.updateDialogOpen;
	}]
	];

$scope.menuTask = [
	['<i class="fa fa-copy"></i> Копіювати', function ($itemScope) { 
		var taskIndex = $itemScope.$index;
		copy(taskIndex, $itemScope.$parent.prescribeHistory);
	}],
	['<i class="fa fa-paste"></i> Вставити', function ($itemScope) { 
		$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index, 0, null);
		contextMenuPaste($itemScope.taskInDay, $itemScope.$parent.prescribeHistory); 
	}],
	null,
	['<span class="glyphicon glyphicon-plus"></span> Додати строчку', function ($itemScope) {
		$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index, 0, null);
		$scope.numberOfChange++;
	}],
	['<span class="glyphicon glyphicon-remove"></span> Видалити', function ($itemScope) {
		var isMultipleSelect = false;
		for(var i=$itemScope.$parent.prescribeHistory.prescribes.tasks.length-1;i>=0;i--){
			if($itemScope.$parent.prescribeHistory.prescribes.tasks[i] 
			&& $itemScope.$parent.prescribeHistory.prescribes.tasks[i].selectMultiple
			){
				$itemScope.$parent.prescribeHistory.prescribes.tasks.splice(i, 1);
				isMultipleSelect = true;
				$scope.numberOfChange++;
			}
		}
		if(!isMultipleSelect){
			$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index, 1);
			$scope.numberOfChange++;
		}
	}],
	null,
	['<span class="glyphicon glyphicon-arrow-up"></span> Догори', function ($itemScope) {
		moveMinus($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	['<span class="glyphicon glyphicon-arrow-down"></span> Донизу', function ($itemScope) {
		movePlus($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index + 1);
	}],
	null,
	['<i class="fa fa-reply-all"></i> Скасувати вибір', function ($itemScope) {
		$($itemScope.$parent.prescribeHistory.prescribes.tasks).each(function () {
			this.selectMultiple = false;
		});
	}]
];

$scope.menuTasksAll = [
	['<i class="fa fa-copy"></i> Копіювати', function ($itemScope) { 
		contextMenuCopy($itemScope.prescribeHistory.prescribes); 
	}],
	['<i class="fa fa-paste"></i> Вставити', function ($itemScope) { 
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
}

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
	$scope.numberOfChange++;
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
	F4 : 115,
	Escape : 27,
	F1 : 112,
	C : 67,
	V : 86,
	S : 83,
	P0 : 48,//Ctrl_P
	Delete : 46,
	ArrowUp : 38,
	ArrowDown : 40,
	ArrowLeft : 37,
	ArrowRight : 39,
	Enter : 13,
	BACKSPACE : 8,
	TABKEY : 9,
	SPACEBAR : 32
};

$scope.keys = [];
$scope.keys.push({code : KeyCodes.F4, action : function() { $scope.savePatient(); }});
$scope.keys.push({
	code : KeyCodes.Escape,
	action : function() {
		console.log("Escape");
		if($scope.patient.pageDeepPositionIndex == 2){
			$scope.patient.pageDeepPositionIndex--;
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
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
		}
	}
});
$scope.keys.push({
	code : KeyCodes.Enter,
	action : function() {
		console.log("Enter");
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.collapseDayPrescribe($scope.patient.selectPrescribesHistoryIndex);
		}else
		if($scope.patient.pageDeepPositionIndex == 2){
			openEditedPrescribeDrugDialog();
		}else
		if($scope.patient.pageDeepPositionIndex == 3){
			initEditedPrescribeDrug();
			if(null == $scope.editedPrescribeDrug)
				openEditedPrescribeDrugDialog();
			else{
				changeHour($scope.editedPrescribeHistory.dayHourIndex);
				$scope.numberOfChange++;
			}
		}
	}
});
openEditedPrescribeDrugDialog = function(){
	var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
	$scope.openPrescribeDrugDialog(taskInDay, $scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
}
$scope.keys.push({
	shiftKey : true, code : KeyCodes.Enter,
	action : function() {
		$scope.editedPrescribeHistory.selectDrugIndex++;
		$scope.editedPrescribeHistory.prescribes.tasks.splice($scope.editedPrescribeHistory.selectDrugIndex, 0, null);
		$scope.numberOfChange++;
	}
});
$scope.keys.push({
	code : KeyCodes.ArrowRight,
	action : function() {
		console.log("ArrowRight - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.patient.pageDeepPositionIndex <= 2){
			$scope.patient.pageDeepPositionIndex++;
			if($scope.patient.pageDeepPositionIndex == 3)
				return;
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
		if($scope.patient.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex++;
			if($scope.editedPrescribeHistory.selectDrugIndex >= 19){
				$scope.editedPrescribeHistory.selectDrugIndex = 0;
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.patient.selectPrescribesHistoryIndex++;
			if($scope.patient.selectPrescribesHistoryIndex >= $scope.patient.prescribesHistory.length){
				$scope.patient.selectPrescribesHistoryIndex = 0;
			}
			initEditedPrescribeHistory();
		}
	}
});
$scope.keys.push({
	code : KeyCodes.ArrowUp,
	action : function() {
		console.log("ArrowUp - deep - "+$scope.patient.pageDeepPositionIndex);
		if($scope.patient.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex--;
			if($scope.editedPrescribeHistory.selectDrugIndex < 0){
				$scope.editedPrescribeHistory.selectDrugIndex = 18;
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.patient.selectPrescribesHistoryIndex--;
			if($scope.patient.selectPrescribesHistoryIndex < 0){
				$scope.patient.selectPrescribesHistoryIndex = 
					$scope.patient.prescribesHistory.length - 1;
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
			$scope.numberOfChange++;
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
	//console.log(obj);
	var code = obj.event.keyCode;
	if(isEditDialogOpen()){
		if(code == $scope.keys[0].code){
			//make save (F4)
			 $scope.keys[0].action();
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
	return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
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


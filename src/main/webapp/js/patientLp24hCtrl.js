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
		$scope.saveWorkDoc();
//		$scope.workDoc.prescribesHistory.splice(1, 0, prescribeHistory);
		//moveMinus($scope.workDoc.prescribesHistory, 1);
		//$scope.workDoc.selectPrescribesHistoryIndex = 1;
		//console.log($scope.workDoc.selectPrescribesHistoryIndex);
		//initEditedPrescribeHistory($scope);
	}

	initDeclarePrescribesEdit($scope, $http, $sce, $filter);

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
	$http({ method : 'GET', url : config.urlPrefix + '/read' + urlServer + '/prescribe_14'
	}).success(function(prescribesGroup, status, headers, config) {
		$scope.prescribesGroup = prescribesGroup;
		console.log($scope.prescribesGroup);
	}).error(function(data, status, headers, config) {
	});

	$scope.saveWorkDoc = function(){
		saveWorkDoc(config.urlPrefix + "/save/patient", $scope, $http);
	}

	$scope.phOpenUpdateDialog = function(prescribeHistoryIndex){
		var prescribeHistory = $scope.workDoc.prescribesHistory[prescribeHistoryIndex];
		prescribeHistory.updateDialogOpen = !prescribeHistory.updateDialogOpen;
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
		copy(-1, $itemScope.prescribeHistory);
	}],
	['<i class="fa fa-paste"></i> Вставити <sub><kbd>Ctrl+V</kbd></sub>', function ($itemScope) {
		pasteCopyObject($itemScope.prescribeHistory, $scope, $http);
		console.log("----------------");
		return
		$http({ method : 'GET', url : config.urlPrefix + '/session/paste'
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

var dayStartHour = 8;

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

//---------------prescribes group-------------------------
$scope.openPrescribesGroupIndex = -1;
$scope.openGroup = function(pgPrescribesHistoryIndex){
	$scope.openPrescribesGroupIndex = pgPrescribesHistoryIndex;
	console.log(pgPrescribesHistoryIndex);
}
//---------------prescribes group-------------------------END
}]);

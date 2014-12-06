cuwyApp.controller('p24hDocCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {
	var urlServer = '';
	if(parameters.s) urlServer += '/'+parameters.s;
	console.log("urlServer "+urlServer);
	$scope.siteMap = config.siteMap.siteMaps[2];
	$scope.startHour24lp = config.startHour24lp;
	initDeclarePrescribesEdit($scope, $http, $sce, $filter);

	$http({ method : 'GET', url : config.urlPrefix + '/read' + urlServer + '/prescribe_'+$scope.parameters.id
	}).success(function(data, status, headers, config) {
		initWorkDocument(data, $scope);
	}).error(function(data, status, headers, config) {
	});

	$scope.saveWorkDoc = function(){
		console.log("saveWorkDoc");
		var excangeServer = "sahCuwy";
//		var excangeServer = "dU";
		if(excangeServer == config.installConfig.aliasId){
			if($scope.workDoc.exchange){
				var ek = Object.keys($scope.workDoc.exchange);
				var noToSave =false;
				for (k in ek) 
					if(ek[k] != excangeServer){
						noToSave = true;
						break;
					}
				if(noToSave){
					alert("Цей документ не призначений для запису. Він керується з сервера лікарні! \n" +
					"Якщо ви хочете редагувати цей документ зробіть з нього копію.")
					return;
				}
			}
		}
		saveWorkDoc(config.urlPrefix + '/save' + urlServer + '/prescribes', $scope, $http);
	}

	$scope.newPrescribes = function(){newPrescribesCommon($scope);}

	checkDrugEditedSelection = function(taskInDayIndex, prescribeHistory){
		$scope.editedPrescribeHistory = prescribeHistory;
		if($scope.editedPrescribeHistory.selectDrugIndex != taskInDayIndex){
			$scope.editedPrescribeHistory.selectDrugIndex = taskInDayIndex;
			$scope.editedPrescribeDrug =  $scope.editedPrescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
			$scope.p24hDoc.selectPrescribesHistoryIndex = $scope.p24hDoc.prescribesHistory.indexOf(prescribeHistory);
			return false;
		}
		return true;
	}

copyTODEL = function(taskIndex, prescribeHistory){
	var drug = prescribeHistory.prescribes.tasks[taskIndex];
	if(drug.selectMultiple){
		$itemScope.$parent.prescribeHistory.prescribes.selectMultiple = true;
		contextMenuCopy($itemScope.$parent.prescribeHistory.prescribes, $http); 
	}else{
		contextMenuCopy(drug, $http); 
	}
}

$scope.menuDayBlock = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		$itemScope.prescribeHistory.updateDialogOpen = !$itemScope.prescribeHistory.updateDialogOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-arrow-up"></span> Догори <sub><kbd>Alt+↑</kbd></sub>', function ($itemScope) {
		console.log($itemScope);
		moveDrugUp($itemScope.workDoc.prescribesHistory, $itemScope.$index);
	}],
	['<span class="glyphicon glyphicon-arrow-down"></span> Донизу <sub><kbd>Alt+↓</kbd></sub>', function ($itemScope) {
		moveDrugDown($itemScope.workDoc.prescribesHistory, $itemScope.$index);
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

//---------------------keydown---------------------END-------
}]);


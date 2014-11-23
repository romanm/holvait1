cuwyApp.controller('p24hDocCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {
	var urlServer = '';
	if(parameters.s) urlServer += '/'+parameters.s;
	console.log("urlServer "+urlServer);
	$scope.siteMap = config.siteMap.siteMaps[2];
	$scope.startHour24lp = config.startHour24lp;
	initDeclarePrescribesEdit($scope, $http, $sce);

	$http({ method : 'GET', url : config.urlPrefix + '/read' + urlServer + '/prescribe_'+$scope.parameters.id
	}).success(function(data, status, headers, config) {
		initWorkDocument(data, $scope);
	}).error(function(data, status, headers, config) {
	});

	$scope.savePrescribes = function(){
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
	
copy = function(taskIndex, prescribeHistory){
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
	F4 : 115,
	Escape : 27,
	F1 : 112,
	//F9 : 120,
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
	Enter : 13,
	BACKSPACE : 8,
	TABKEY : 9,
	SPACEBAR : 32
};

$scope.keys = [];
$scope.keys.push({code : KeyCodes.F4, action : function() { $scope.savePrescribes(); }});
$scope.keys.push({
	code : KeyCodes.Escape,
	action : function() {
		console.log("Escape");
		if($scope.p24hDoc.pageDeepPositionIndex == 2){
			$scope.p24hDoc.pageDeepPositionIndex--;
		}else
		if($scope.p24hDoc.pageDeepPositionIndex == 1){
			var calcNotCollapsed = 0;
			$($scope.p24hDoc.prescribesHistory).each(function () {
				if(!this.isCollapsed) calcNotCollapsed++;
			} );
			if(calcNotCollapsed > 1 && !$scope.editedPrescribeHistory.isCollapsed){
				$scope.editedPrescribeHistory.isCollapsed = true;
			}else{
				$scope.p24hDoc.pageDeepPositionIndex--;
				$("#focus_0").focus();
			}
		}else
		if($scope.p24hDoc.pageDeepPositionIndex == 0){
			skipLinkMinus1();
		}else 
		if($scope.p24hDoc.pageDeepPositionIndex > minPageDeepPositionIndex){
			$scope.p24hDoc.pageDeepPositionIndex--;
			$("#focus_minus_"+(0-$scope.p24hDoc.pageDeepPositionIndex)).focus();
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
		if($scope.workDoc.pageDeepPositionIndex == 2){
			deleteSelected($scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
		}
	}
});
$scope.keys.push({
	code : KeyCodes.SPACEBAR,
	action : function() {
		console.log("SPACEBAR");
		if($scope.p24hDoc.pageDeepPositionIndex == 1){
			$scope.collapseDayPrescribe($scope.p24hDoc.selectPrescribesHistoryIndex);
		}else
		if($scope.p24hDoc.pageDeepPositionIndex == 2){
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
			initEditedPrescribeDrug($scope);
			if(null == $scope.editedPrescribeDrug)
				openEditedPrescribeDrugDialog();
			else{
				changeHour($scope.editedPrescribeHistory.dayHourIndex, $scope, $http);
				changeSaveControl($scope, $http);
			}
		}
	}
});
openEditedPrescribeDrugDialog = function(){
	var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
	$scope.openPrescribeDrugDialog(taskInDay, $scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
};
$scope.keys.push({
	shiftKey : true, code : KeyCodes.Enter,
	action : function() {
		$scope.editedPrescribeHistory.selectDrugIndex++;
		$scope.editedPrescribeHistory.prescribes.tasks.splice($scope.editedPrescribeHistory.selectDrugIndex, 0, null);
		changeSaveControl($scope, $http);
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
	code : KeyCodes.End,
	action : function() {
		console.log("End - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex = 23;
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
	code : KeyCodes.ArrowRight,
	action : function() {
		console.log("ArrowRight - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.patient.pageDeepPositionIndex <= 2){
			$scope.patient.pageDeepPositionIndex++;
			if($scope.patient.pageDeepPositionIndex == 3){
				console.log($scope.editedPrescribeHistory.dayHourIndex);
				return;
			}
		}
		if($scope.p24hDoc.pageDeepPositionIndex < 0){
			$("#focus_minus_"+(0-$scope.p24hDoc.pageDeepPositionIndex)).focus();
		}else
		if($scope.p24hDoc.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
		}else
		if($scope.p24hDoc.pageDeepPositionIndex == 1){
		}else
		if($scope.p24hDoc.pageDeepPositionIndex == 2){
			if($scope.editedPrescribeHistory.isCollapsed){
				$scope.editedPrescribeHistory.isCollapsed = false;
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 3){
		console.log(1);
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
			console.log("----");
			$scope.editedPrescribeHistory.dayHourIndex--;
			console.log($scope.editedPrescribeHistory.dayHourIndex);
			if($scope.editedPrescribeHistory.dayHourIndex >=0)
				return;
		}
		if($scope.p24hDoc.pageDeepPositionIndex > minPageDeepPositionIndex){
			$scope.p24hDoc.pageDeepPositionIndex--;
		}
		if($scope.p24hDoc.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
			$scope.p24hDoc.selectPrescribesHistoryIndex = 0;
			$scope.editedPrescribeHistory = $scope.p24hDoc.prescribesHistory[$scope.p24hDoc.selectPrescribesHistoryIndex];
		}else
		if($scope.p24hDoc.pageDeepPositionIndex < 0){
			$("#focus_minus_"+(0-$scope.p24hDoc.pageDeepPositionIndex)).focus();
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
$scope.keys.push({
	code : KeyCodes.ArrowUp,
	action : function() {
		console.log("ArrowUp - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex--;
			if($scope.editedPrescribeHistory.selectDrugIndex < 0){
				$scope.editedPrescribeHistory.selectDrugIndex = 18;
			}
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

$scope.keys.push({ ctrlKey : true, code : KeyCodes.S, action : function() { $scope.savePrescribes(); }});

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

$scope.$on('keydown', function(msg, obj){
	//console.log(obj);
	var code = obj.event.keyCode;
	if(!$scope.editedPrescribeHistory.selectDrugIndex){
		$scope.editedPrescribeHistory.selectDrugIndex = 0;
	}
	if($scope.editedPrescribeHistory.tasksInDay 
	&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex]
	&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed
	){
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

$scope.$on('keydown-OldToDel', function(msg, obj) {
	//console.log(obj);
	var code = obj.event.keyCode;
	var ctrlKey = obj.event.ctrlKey;
	var altKey = obj.event.altKey;
	var shiftKey = obj.event.shiftKey;
	$scope.keys.forEach(function(o) {
		if($scope.editedPrescribeHistory.tasksInDay 
		&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed
		){
			return;
		}
		if($scope.editedPrescribeHistory.updateDialogOpen){
			return;
		}
		if(o.code !== code) return;
		if((ctrlKey && !o.ctrlKey) || (o.ctrlKey && !ctrlKey)) return;
		if((altKey && !o.altKey) || (o.altKey && !altKey)) return;
		if((shiftKey && !o.shiftKey) || (o.shiftKey && !shiftKey)) return;
		o.action();
		$scope.$apply();
	});
});
//---------------------keydown---------------------END-------
}]);


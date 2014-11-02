//var cuwyApp = angular.module('cuwyApp', ['ui.bootstrap']);
cuwyApp.controller('patientsCtrl', [ '$scope', '$http', '$filter', function ($scope, $http, $filter) {
	console.log("patientsCtrl");
	$scope.siteMap = config.siteMap.siteMaps[0];
	$scope.patient1sList = patient1sList;
	$scope.patientListOrArchive = false;
	$scope.selectPatientIndex = null;
	$scope.pageDeepPositionIndex = 1;

	$scope.archiveOrNot = function(archiveOrNot){
		$scope.patientListOrArchive = archiveOrNot;
		$scope.filterPatients();
	}
	$scope.filterPatients = function(){
		var f1 = $filter('filter')($scope.patient1sList, {PATIENT_ARCHIVE:$scope.patientListOrArchive});
		var f2 = $filter('filter')(f1, $scope.seekPatient);
		$scope.patient1sListFilter = $filter('limitTo')(f2, 12);
	}

	$scope.filterPatients();

	$scope.saveNewPatient = function(){
		console.log("saveNewPatient");
		postPatient('/saveNewPatient', {"PATIENT_NAME":$scope.seekPatient});
		$scope.filterPatients();
	}

	$scope.updatePatient = function(patientToUpdate){
		console.log("updatePatient");
		postPatient('/updatePatient', patientToUpdate );
		patientToUpdate.patientUpdateOpen = false;
	}

	postPatient = function (postUrl, editPatient){
		var urlPost = config.urlPrefix + postUrl;
		console.log(urlPost);
		$http({
			method : 'POST',
			data : editPatient,
			url : urlPost
		}).success(function(data, status, headers, config){
			$scope.patient1sList = data;
			console.log(data);
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

	$scope.menuPatientList = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		$itemScope.patient.patientUpdateOpen = !$itemScope.patient.patientUpdateOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-floppy-remove"></span> Перевести в архів', function ($itemScope) {
		console.debug('remove to archiv');
		$itemScope.patient.PATIENT_ARCHIVE = !$scope.patientListOrArchive;
		postPatient('/updatePatient', $itemScope.patient);
		$scope.filterPatients();
	}],
	['<span class="glyphicon glyphicon-floppy-open"></span> Відкрити пацієнт документ', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		console.log($itemScope.patient.PATIENT_ID);
		window.location.href = '/patient.html?id='+$itemScope.patient.PATIENT_ID;
	}]
	];

	var KeyCodes = {
		F1 : 112,
		ArrowUp : 38,
		ArrowDown : 40,
		ArrowLeft : 37,
		ArrowRight : 39,
		Enter : 13,
		Escape : 27,
		SPACEBAR : 32,
	};

	$scope.keys = [];
	$scope.keys.push({
		code : KeyCodes.Escape,
		action : function() {
			console.log("Escape");
			console.log($scope.pageDeepPositionIndex);
			if($scope.pageDeepPositionIndex == 1){
				$scope.pageDeepPositionIndex--;
				$("#focus_0").focus();
			}else
			if($scope.pageDeepPositionIndex == 0){
				document.getElementById('focus_minus_1').click();
			}
		}
	});
	$scope.keys.push({
		code : KeyCodes.ArrowUp,
		action : function() {
			console.log("ArrowUp ");
			adaptSelectDrugToFilterList();
			if(null==$scope.selectPatientIndex || 0==$scope.selectPatientIndex){
				$scope.selectPatientIndex = $scope.patient1sListFilter.length-1;
			}else{
				$scope.selectPatientIndex--;
			}
		}
	});
	$scope.keys.push({
		code : KeyCodes.ArrowDown,
		action : function() {
			console.log("ArrowDown ");
			adaptSelectDrugToFilterList();
			if(null==$scope.selectPatientIndex || $scope.selectPatientIndex==($scope.patient1sListFilter.length-1)){
				$scope.selectPatientIndex = 0;
			}else{
				$scope.selectPatientIndex++;
			}
		}
	});

	adaptSelectDrugToFilterList = function(){
		if(($scope.patient1sListFilter.length-1) < $scope.selectPatientIndex)
			$scope.selectPatientIndex = null;
	}
	$scope.clickItem = function(drugIndex) {
		$scope.selectPatientIndex = drugIndex;
	}
	$scope.openItem = function(drugIndex) {
		$scope.selectPatientIndex = drugIndex;
		var patient=$scope.patient1sListFilter[$scope.selectPatientIndex];
		document.getElementById("patient_"+patient.PATIENT_ID).click();
	}

	$scope.keys.push({code : KeyCodes.Enter, action : function() { $scope.openItem($scope.selectPatientIndex); } });
	$scope.keys.push({code : KeyCodes.ArrowRight, action : function() { $scope.openItem($scope.selectPatientIndex); } });
	$scope.keys.push({code : KeyCodes.F1, action : function() { $scope.openF1(); } });
	$scope.openF1 = function(){ window.open("help.html#drugs", "", "width=1000, height=500"); }

	$scope.$on('keydown', function(msg, obj) {
		var code = obj.event.keyCode;
		var ctrlKey = obj.event.ctrlKey;
		$scope.keys.forEach(function(o) {
			if (o.code !== code) return;
			if(ctrlKey && !o.ctrlKey) return;
			if(o.ctrlKey && !ctrlKey) return;
			o.action();
			$scope.$apply();
		});
	});

} ] );

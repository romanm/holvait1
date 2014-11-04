//var cuwyApp = angular.module('cuwyApp', ['ui.bootstrap']);
cuwyApp.controller('drugCtrl', [ '$scope', '$http', function ($scope, $http) {
	console.log("drugCtrl");
	$scope.parameters = parameters;
	$scope.numberOfChange = 0;

	$scope.siteMap = config.siteMap.siteMaps[5];
	$http({
		method : 'GET',
		url : config.urlPrefix + '/read/drug_'+$scope.parameters.id
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.drugDocument = data;
		if(null == $scope.drugDocument.doses)
			$scope.drugDocument.doses = [];
		if(null == $scope.drugDocument.localIdSequence)
			$scope.drugDocument.localIdSequence = 1;
	}).error(function(data, status, headers, config) {
	});

	$scope.newDrugDocumentDose = {};
	$scope.dose2newDose = function(dose){
		angular.copy(dose, $scope.newDrugDocumentDose);
	}
	$scope.addNewDrugDocumentDose = function(){
		$scope.newDrugDocumentDose.DOSE_ID = $scope.drugDocument.localIdSequence++;
		$scope.drugDocument.doses.push($scope.newDrugDocumentDose);
		$scope.newDrugDocumentDose = {};
		$scope.numberOfChange++;
	};

	$scope.saveDrugDocument = function(){
		console.log("--------devPost-----------");
		$http({
			method : 'POST',
			data : $scope.drugDocument,
			url : config.urlPrefix + "/save/drug"
		}).success(function(data, status, headers, config){
			$scope.numberOfChange = 0;
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

	$scope.menuDoses = [
		['<span class="glyphicon glyphicon-remove"></span> Видалити', function ($itemScope) {
			$itemScope.drugDocument.doses.splice($itemScope.$index, 1);
			$scope.numberOfChange++;
		}]
	];

	//---------------------keydown-------------------------------
	$scope.keys = [];
	$scope.keys.push({code : KeyCodes.F1, action : function() { $scope.openF1(); } });
	$scope.openF1 = function(){ window.open("help.html#protocols", "", "width=1000, height=500"); }

	$scope.$on('keydown', function(msg, obj) {
		console.log(obj);
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
	//---------------------keydown---------------------END-------

}]);

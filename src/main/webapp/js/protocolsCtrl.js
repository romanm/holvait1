//var cuwyApp = angular.module('cuwyApp', ['ui.bootstrap']);
cuwyApp.controller('protocolsCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {

	$scope.siteMap = config.siteMap.siteMaps[3];

	console.log("protocolsCtrl");
	$scope.protocolOrder1sList = protocolOrder1sList;
	$scope.prescribeOrder1sList = prescribeOrder1sList;
	console.log(prescribeOrder1sList);
	initDeclareListeSite($scope, $http, $sce, $filter);
	
	if(typeof prescribeOrder1sListOpen === 'undefined'){
		$scope.prescribeOrder1sListOpen = [];
	}else{
		$scope.prescribeOrder1sListOpen = prescribeOrder1sListOpen;
	}
	
	$scope.prescribeListOrArchive = false;

	$scope.saveNewPrescribe = function(){
		console.log("saveNewPrescribe");
		postPrescribe('/saveNewPrescribe', {"PRESCRIBE_NAME":$scope.seekPrescribe});
	}
	$scope.saveNewProtocol = function(){
		console.log("saveNewProtocol");
		postProtocol('/saveNewProtocol', {"ORDER_NAME":$scope.seekProtocol});
	}

	$scope.updatePrescribe = function(drugToUpdate){
		console.log("updatePrescribe");
		postPrescribe('/updatePrescribe', drugToUpdate );
		drugToUpdate.updateDialogOpen = false;
	}
	$scope.updateProtocol = function(drugToUpdate){
		console.log("updateProtocol");
		postProtocol('/updateProtocol', drugToUpdate );
		drugToUpdate.updateDialogOpen = false;
	}

	$scope.reloadFromDb = function(){
		$http({
			method : 'GET',
			url : config.urlPrefix + '/prescribe1sList'
		}).success(function(data, status, headers, config) {
			console.log(data);
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	}

	postPrescribe = function (postUrl, editPrescribeOrder){
		console.log("postPrescribe");
		console.log(postUrl);
		$http({
			method : 'POST',
			data : editPrescribeOrder,
			url : config.urlPrefix + postUrl
		}).success(function(data, status, headers, config){
			$scope.prescribeOrder1sList = data;
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

	postProtocol = function (postUrl, editProtocolOrder){
		$http({
			method : 'POST',
			data : editProtocolOrder,
			url : config.urlPrefix + postUrl
		}).success(function(data, status, headers, config){
			$scope.protocolOrder1sList = data;
			console.log(data);
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

//---------------------menu-------------------------------
	$scope.menuPrescribeList = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		$itemScope.prescribe.updateDialogOpen = !$itemScope.prescribe.updateDialogOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-edit"></span> Копіювати', function ($itemScope) {
		console.debug('Копіювати');
		console.log($itemScope);
		console.debug($itemScope);
		console.debug($itemScope.prescribe);
		copyListImem($itemScope.prescribe);
	}],
	null,
	['<span class="glyphicon glyphicon-floppy-remove"></span> Перевести в архів', function ($itemScope) {
		console.debug('delete');
		console.debug($itemScope);
		console.debug($itemScope.prescribe);
		$itemScope.prescribe.PRESCRIBE_ARCHIVE = !$scope.prescribeListOrArchive;
		console.debug($itemScope.prescribe);
		postProtocol('/updatePrescribe', $itemScope.prescribe);
	}]
	/*
	['<span class="glyphicon glyphicon-floppy-remove"></span> Видалити з БД', function ($itemScope) {
		console.debug('delete');
		console.debug($itemScope);
		console.debug($itemScope.prescribe);
		postPrescribe('/removePrescribe', $itemScope.prescribe);
	}]
	*/
	];

	$scope.menuProtocolList = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		$itemScope.protocolOrder.updateDialogOpen = !$itemScope.protocolOrder.updateDialogOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-floppy-remove"></span> Перевести в архів', function ($itemScope) {
		console.debug('delete');
		console.debug($itemScope);
		console.debug($itemScope.protocolOrder);
		$itemScope.prescribe.PRESCRIBE_ARCHIVE = !$scope.prescribeListOrArchive;
		postProtocol('/updatePrescribe', $itemScope.protocolOrder);
	}],
/*
		['<span class="glyphicon glyphicon-floppy-remove"></span> Видалити з БД', function ($itemScope) {
			console.debug('delete');
			console.debug($itemScope);
			console.debug($itemScope.protocolOrder);
			postProtocol('/removeProtocolOrder', $itemScope.protocolOrder);
		}],
 **/
	['<span class="glyphicon glyphicon-floppy-open"></span> Перейти в розділ документ', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		$itemScope.drug.updateDialogOpen = !$itemScope.drug.updateDialogOpen;
	}]
	];
//---------------------menu-------------------------------END
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

} ] );

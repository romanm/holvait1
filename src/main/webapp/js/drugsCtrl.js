cuwyApp.controller('drugsCtrl', [ '$scope', '$http', '$filter', function ($scope, $http, $filter) {
	$scope.siteMap = config.siteMap.siteMaps[1];

	console.log("drugsCtrl");
	$scope.drug1sList = drug1sList;
	$scope.drugListOrArchive = false;
	$scope.selectDrugIndex = null;

	$scope.filterArchive = function(archive){
		$scope.drugListOrArchive = archive;
		$scope.filterDrugs();
	}
	$scope.filterDrugs = function(){
		var f1 = $filter('filter')($scope.drug1sList, {DRUG_ARCHIVE:$scope.drugListOrArchive});
		var f2 = $filter('filter')(f1, $scope.seekDrug);
		$scope.drug1sListFilter = $filter('limitTo')(f2, 12);
	}
	$scope.filterDrugs();

	adaptSelectDrugToFilterList = function(){
		if(($scope.drug1sListFilter.length-1) < $scope.selectDrugIndex)
			$scope.selectDrugIndex = null;
	}

	$scope.clickItem = function(drugIndex) {
		$scope.selectDrugIndex = drugIndex;
	}
	$scope.openItem = function(drugIndex) {
		$scope.selectDrugIndex = drugIndex;
		var drug=$scope.drug1sListFilter[$scope.selectDrugIndex];
		document.getElementById("drug_"+drug.DRUG_ID).click();
	}

	$scope.saveNewDrug = function(){
		console.log("saveNewDrug");
		console.log($scope.seekDrug);
		postDrug('/saveNewDrug', {"DRUG_NAME":$scope.seekDrug});
	}

	$scope.updateDrug = function(drugToUpdate){
		console.log("updateDrug");
		postDrug('/updateDrug', drugToUpdate );
		drugToUpdate.drugUpdateOpen = false;
	}

	postDrug = function (postUrl, editDrug){
		$http({
			method : 'POST',
			data : editDrug,
			url : postUrl
		}).success(function(data, status, headers, config){
			$scope.drug1sList = data;
			console.log(data);
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

	$scope.menuDrugList = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		$itemScope.drug.drugUpdateOpen = !$itemScope.drug.drugUpdateOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-floppy-remove"></span> Перевести в архів', function ($itemScope) {
		console.debug('delete');
		console.debug($itemScope);
		console.debug($itemScope.drug);
		$itemScope.drug.DRUG_ARCHIVE = !$scope.patientListOrArchive;
		postDrug('/updateDrug', $itemScope.drug);
	}],
	/*
	['<span class="glyphicon glyphicon-floppy-remove"></span> Видалити з БД', function ($itemScope) {
		console.debug('delete');
		console.debug($itemScope);
		console.debug($itemScope.drug);
		postDrug('/removeDrug', $itemScope.drug);
	}],
	*/
	['<span class="glyphicon glyphicon-floppy-open"></span> Відкрити медикамент документ', function ($itemScope) {
		console.debug('Edit');
		console.log($itemScope);
		$itemScope.drug.drugUpdateOpen = !$itemScope.drug.drugUpdateOpen;
	}]
	];
	
var KeyCodes = {
	F1 : 112,
	ArrowUp : 38,
	ArrowDown : 40,
	ArrowLeft : 37,
	ArrowRight : 39,
	Enter : 13,
	BACKSPACE : 8,
	TABKEY : 9,
	ESCAPE : 27,
	SPACEBAR : 32,
};

$scope.keys = [];
$scope.keys.push({
	code : KeyCodes.Enter,
	action : function() {
		$scope.openItem($scope.selectDrugIndex);
	}
});
$scope.keys.push({
	ctrlKey : true, code : KeyCodes.Enter,
	action : function() {
		console.log("CtrlEnter ");
	}
});
$scope.keys.push({
	code : KeyCodes.ArrowUp,
	action : function() {
		console.log("ArrowUp ");
		adaptSelectDrugToFilterList();
		if(null==$scope.selectDrugIndex || 0==$scope.selectDrugIndex){
			$scope.selectDrugIndex = $scope.drug1sListFilter.length-1;
		}else{
			$scope.selectDrugIndex--;
		}
	}
});
$scope.keys.push({
	code : KeyCodes.ArrowDown,
	ctrlKey : true,
	action : function() {
		console.log("CtrlArrowDown ");
	}
});
$scope.keys.push({
	code : KeyCodes.ArrowDown,
	action : function() {
		console.log("ArrowDown ");
		adaptSelectDrugToFilterList();
		if(null==$scope.selectDrugIndex || $scope.selectDrugIndex==($scope.drug1sListFilter.length-1)){
			$scope.selectDrugIndex = 0;
		}else{
			$scope.selectDrugIndex++;
		}
	}
});
$scope.keys.push({
	code : KeyCodes.F1,
	action : function() {
		$scope.openF1();
	}
});

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

$scope.openF1 = function(){
	window.open("help.html#drugs", "", "width=1000, height=500");
}

} ] );
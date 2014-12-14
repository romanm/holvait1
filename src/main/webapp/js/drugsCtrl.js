cuwyApp.controller('drugsCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {

	$scope.siteMap = config.siteMap.siteMaps[1];

	console.log("drugsCtrl");
	$scope.drug1sList = drug1sList;
	$scope.predicate = 'DRUG_NAME';
	$scope.reverse = true;
	$scope.drugListOrArchive = false;
	$scope.selectDrugIndex = null;
	$scope.pageDeepPositionIndex = 1;
	initDeclareListeSite($scope, $http, $sce, $filter);

	$scope.reloadFromDb = function(){
		$http({
			method : 'GET',
			url : config.urlPrefix + '/drug1sList'
		}).success(function(data, status, headers, config) {
			$scope.drug1sList = data;
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	}

	$scope.filterArchive = function(archive){
		$scope.drugListOrArchive = archive;
		$scope.filterDrugs();
	}
	$scope.filterDrugs = function(){
		var f1 = $filter('filter')($scope.drug1sList, {DRUG_ARCHIVE:$scope.drugListOrArchive});
		var f2 = $filter('filter')(f1, $scope.seekDrug);
		$scope.drug1sListFilterLength =f2.length;
		$scope.drug1sListFilter = $filter('limitTo')(f2, 24);
		$scope.drug1sListFilter = $filter('orderBy')($scope.drug1sListFilter, $scope.predicate, $scope.reverse);
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
			url : config.urlPrefix + postUrl
		}).success(function(data, status, headers, config){
			$scope.drug1sList = data;
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}

	$scope.menuDrugList = [
	['<i class="fa fa-paste"></i> Копіювати', function ($itemScope) {
		console.debug('copy');
		console.debug($itemScope);
		console.debug($itemScope.drug);
		copyListImem($itemScope.drug);
	}],
	null,
	['<i class="fa fa-paste"></i> Корекція', function ($itemScope) {
		console.debug('Edit');
		$itemScope.drug.drugUpdateOpen = !$itemScope.drug.drugUpdateOpen;
	}],
	null,
	['<span class="glyphicon glyphicon-floppy-remove"></span> Перевести в архів', function ($itemScope) {
		console.debug('delete');
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
		$itemScope.drug.drugUpdateOpen = !$itemScope.drug.drugUpdateOpen;
	}]
	];

$scope.keys = [];
$scope.keys.push({
	code : KeyCodes.Escape,
	action : function() {
		console.log("Escape");
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
	ctrlKey : true, code : KeyCodes.ArrowDown,
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

$scope.keys.push({code : KeyCodes.Enter, action : function() { $scope.openItem($scope.selectDrugIndex); } });
$scope.keys.push({code : KeyCodes.ArrowRight, action : function() { $scope.openItem($scope.selectDrugIndex); } })
$scope.keys.push({code : KeyCodes.F1, action : function() { $scope.openF1(); } });

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

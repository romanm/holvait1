cuwyApp.controller('tagsCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {
	console.log("tagsCtrl");
	$scope.siteMap = config.siteMap.siteMaps[6];
	initDeclareListeSite($scope, $http, $sce, $filter);
	$scope.tagModel = tagModel;
	console.log(tagModel);
	//$scope.readDbTagModel();

	$scope.saveNewTag = function(){
		console.log("saveNewTag");
		console.log($scope.seekTag);
		postDrug('/saveNewTag', {"TAG_NAME":$scope.seekTag});
	}

	postDrug = function (postUrl, editDrug){
		$http({
			method : 'POST',
			data : editDrug,
			url : config.urlPrefix + postUrl
		}).success(function(data, status, headers, config){
			$scope.tagModel = data;
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}
	$scope.filterTags = function(){
//		var f1 = $filter('filter')($scope.drug1sList, {DRUG_ARCHIVE:$scope.drugListOrArchive});
//		var f2 = $filter('filter')(f1, $scope.seekDrug);
		filterTag($scope.seekTag);
	}
	$scope.filterTags();
	postTagToRest = function($itemScope, urlRest){
		console.debug($itemScope);
		$http({ method : 'POST', data : $itemScope.tag, url : config.urlPrefix + urlRest
		}).success(function(data, status, headers, config) {
			console.log(data);
			$scope.tagModel = data;
		}).error(function(data, status, headers, config) {
		});
	};

	$scope.menuTagDrugItem = [
	['<i class="fa fa-copy"></i> Видалити', function ($itemScope) {
		console.debug('delete');
		postTagToRest($itemScope,'/tag/drugDelete');
	}]
	];

	$scope.menuTagListItem = [
	['<i class="fa fa-copy"></i> Копіювати', function ($itemScope) {
		console.debug('copy');
		copyListImem($itemScope.tag);
	}],
	['<i class="fa fa-paste"></i> Вставити', function ($itemScope) {
		console.debug('paste');
		postTagToRest($itemScope,'/tag/paste');
	}],
	null,
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		console.debug('Edit');
		$itemScope.drug.drugUpdateOpen = !$itemScope.drug.drugUpdateOpen;
	}],
	null,
	['<i class="fa fa-copy"></i> Видалити', function ($itemScope) {
		console.debug('delete');
		postTagToRest($itemScope,'/tag/delete');
	}]
	];
	
}]);

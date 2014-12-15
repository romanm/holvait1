cuwyApp.controller('tagsCtrl', [ '$scope', '$http', '$filter', '$sce', function ($scope, $http, $filter, $sce) {
	console.log("tagsCtrl");
	$scope.siteMap = config.siteMap.siteMaps[6];
	initDeclareListeSite($scope, $http, $sce, $filter);

	$scope.readDbTagModel();

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

	tagPaste = function($itemScope){
		console.debug($itemScope);
		$http({ method : 'POST', data : $itemScope.tag, url : config.urlPrefix + '/tag/paste'
		}).success(function(data, status, headers, config) {
			console.log(data);
			$scope.tag1sList = data;
		}).error(function(data, status, headers, config) {
		});
	};

	$scope.menuTagListItem = [
	['<i class="fa fa-copy"></i> Копіювати', function ($itemScope) {
		console.debug('copy');
		console.debug($itemScope);
		console.debug($itemScope.tag);
		copyListImem($itemScope.tag);
	}],
	['<i class="fa fa-paste"></i> Вставити', function ($itemScope) {
		console.debug('paste');
		console.debug($itemScope.tag);
		tagPaste($itemScope);
	}],
	null,
	['<span class="glyphicon glyphicon-edit"></span> Корекція', function ($itemScope) {
		console.debug('Edit');
		$itemScope.drug.drugUpdateOpen = !$itemScope.drug.drugUpdateOpen;
	}]
	];
	
}]);

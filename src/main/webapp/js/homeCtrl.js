cuwyApp.controller('homeCtrl', [ '$scope', '$http', function ($scope, $http) {
	console.log('homeCtrl');
	$scope.siteMap = config.siteMap;
	$scope.selectIndex = 0;
	$scope.maxSelectIndex = 4;

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
		code : KeyCodes.ArrowUp,
		action : function() {
			console.log("ArrowUp ");
			if(0 == $scope.selectIndex){
				$scope.selectIndex = $scope.maxSelectIndex;
			}else{
				$scope.selectIndex--;
			}
		}
	});
	$scope.keys.push({
		code : KeyCodes.ArrowDown,
		action : function() {
			console.log("ArrowDown ");
			if($scope.selectIndex == $scope.maxSelectIndex){
				$scope.selectIndex = 0;
			}else{
				$scope.selectIndex++;
			}
		}
	});

	$scope.openItem = function(linkIndex) { 
		console.log(linkIndex);
		console.log("link_" + linkIndex);
		document.getElementById("link_" + linkIndex).click(); 
	}

	$scope.keys.push({code : KeyCodes.Enter, action : function() { $scope.openItem($scope.selectIndex); } });
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

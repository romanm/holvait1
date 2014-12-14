cuwyApp.controller('taskInDayCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
	console.log("---------taskInDayCtrl------------");
	$scope.taskInDay.dialogTab = "drug";
	$scope.isJustOpened = true;
	$scope.selectDrugIndex = null;
	$scope.selectDoseIndex = null;

	$scope.addDoseToPrescribeDrug = function(doseToPrescribe){
		$scope.editedPrescribeDrug.dose = doseToPrescribe;
		$scope.numberOfChange++;
	}

	$scope.filterDrugs();

	$scope.changeDialogTab = function(fieldName){
		$scope.taskInDay.dialogTab = fieldName;
	}

	//-----------------------keydown------------------------
	var KeyCodes = {
		Escape : 27,
		Enter : 13,
		ArrowLeft : 37,
		ArrowRight : 39,
		ArrowUp : 38,
		ArrowDown : 40
	};

	$scope.keys = [];
	$scope.keys.push({
		code : KeyCodes.Escape,
		action : function() {
			console.log("Escape -- taskInDayCtrl");
			$scope.taskInDay.isCollapsed = false;
			$scope.patient.pageDeepPositionIndex = 2;
		}
	});

	$scope.keys.push({
		code : KeyCodes.Enter,
		shiftKey : true,
		action : function() {
			console.log("Enter");
			if($scope.isJustOpened){
				$scope.isJustOpened = false;
				return;
			}
			if($scope.taskInDay.dialogTab == "drug"){
				$scope.drugToTask3($scope.drug1sListFilter[$scope.selectDrugIndex]);
			}else
			if($scope.taskInDay.dialogTab == "dose"){
				$scope.addDoseToPrescribeDrug($scope.drugDocument.doses[$scope.selectDoseIndex]);
			}
		}
	});

	$scope.keys.push({
		code : KeyCodes.ArrowUp,
		action : function() {
			console.log("ArrowUp ");
			if($scope.taskInDay.dialogTab == "drug"){
				adaptSelectDrugToFilterList();
				if(null==$scope.selectDrugIndex || 0==$scope.selectDrugIndex){
					$scope.selectDrugIndex = $scope.drugDocument.doses.length-1;
				}else{
					$scope.selectDrugIndex--;
				}
			}else
			if($scope.taskInDay.dialogTab == "dose"){
				if(null==$scope.selectDoseIndex || 0==$scope.selectDoseIndex){
					$scope.selectDoseIndex = $scope.drugDocument.doses.length-1;
				}else{
					$scope.selectDoseIndex--;
				}
			}
		}
	});
	$scope.keys.push({
		code : KeyCodes.ArrowDown,
		action : function() {
			console.log("ArrowDown ");
			if($scope.taskInDay.dialogTab == "drug"){
				adaptSelectDrugToFilterList();
				if(null==$scope.selectDrugIndex || $scope.selectDrugIndex==($scope.drug1sListFilter.length-1)){
					$scope.selectDrugIndex = 0;
				}else{
					$scope.selectDrugIndex++;
				}
			}else
			if($scope.taskInDay.dialogTab == "dose"){
				if(null==$scope.selectDoseIndex || $scope.selectDoseIndex==($scope.drugDocument.doses.length-1)){
					$scope.selectDoseIndex = 0;
				}else{
					$scope.selectDoseIndex++;
				}
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

	$scope.$on('keydown', function(msg, obj) {
		//console.log(obj);
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

}])

parameters = {};
if(window.location.search){
	$.each(window.location.search.split("?")[1].split("&"), function(index, value){
		var par = value.split("=");
		parameters[par[0]] = par[1];
	});
}

function skipLinkMinus1(){
	if(isBrowser("Chrome")){
		window.location.href = document.getElementById('focus_minus_1').getAttribute('href');
		window.location.assign();
	}else{ //if(isBrowser("Firefox")){
		document.getElementById('focus_minus_1').click();
	}
}
function isBrowser(browserName){
	return navigator.userAgent.indexOf(browserName) > 0;
}

function isMiddleWeek(index, countPatientsProWeeks){
	return index !=0 && !(index == countPatientsProWeeks.length - 1);
}

Date.prototype.getMMMMUa = function (){return this.getMonthUa(this.getMonth());}

Date.prototype.getMonthUa = function (month){
	var monthsUa = ["Січень", "Лютий"
		, "Березень", "Квітень", "Травень"
		, "Червень", "Липень", "Серпень"
		, "Вересень", "Жовтень", "Листопад"
		, "Грудень"];
	return monthsUa[month];
}
Date.prototype.getDayOfYear = function (){
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this - onejan)/86400000 + 1);
}
Date.prototype.getWeekOfYear = function (){
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this.getDayOfYear() + onejan.getDay())/7);
//	return Math.ceil((((this - onejan)/86400000 + 1 + onejan.getDay()))/7);
}
Date.prototype.addMonths = function(months){
	this.setMonth(this.getMonth() + 1);
	return this;
}
Date.prototype.addDays = function(days){
	this.setDate(this.getDate() + days);
	return this;
}
Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}

Date.prototype.addSeconds = function (num) {
    var value = this.valueOf();
    value += 1000 * num;
    return new Date(value);
}

Date.prototype.addMinutes = function (num) {
    var value = this.valueOf();
    value += 60000 * num;
    return new Date(value);
}

Date.prototype.addHours = function (num) {
    var value = this.valueOf();
    value += 3600000 * num;
    return new Date(value);
}

Date.prototype.addMonths2 = function (num) {
    var value = new Date(this.valueOf());

    var mo = this.getMonth();
    var yr = this.getYear();

    mo = (mo + num) % 12;
    if (0 > mo) {
        yr += (this.getMonth() + num - mo - 12) / 12;
        mo += 12;
    }
    else
        yr += ((this.getMonth() + num - mo) / 12);

    value.setMonth(mo);
    value.setYear(yr);
    return value;
}

var KeyCodes = {
	F1 : 112,
	ArrowUp : 38,
	ArrowDown : 40,
	ArrowLeft : 37,
	ArrowRight : 39,
	Enter : 13,
	Escape : 27,
	BACKSPACE : 8,
	TABKEY : 9,
	SPACEBAR : 32,
};

var cuwyApp = angular.module('cuwyApp', ['ui.bootstrap', 'ngSanitize', 'textAngular']);

cuwyApp.directive('autoFocus', function($timeout) {
	return {
		restrict: 'AC',
		link: function(_scope, _element) {
			$timeout(function(){
				_element[0].focus();
			}, 0);
		}
	};
});

cuwyApp.directive('ngContextMenu', function ($parse) {
	var renderContextMenu = function ($scope, event, options) {
		if (!$) { var $ = angular.element; }
		$(event.target).addClass('context');
		var $contextMenu = $('<div>');
		$contextMenu.addClass('dropdown clearfix');
		var $ul = $('<ul>');
		$ul.addClass('dropdown-menu');
		$ul.attr({ 'role': 'menu' });
		$ul.css({
			display: 'block',
			position: 'absolute',
			left: event.pageX + 'px',
			top: event.pageY + 'px'
		});
		angular.forEach(options, function (item, i) {
			var $li = $('<li>');
			if (item === null) {
				$li.addClass('divider');
			} else {
				$a = $('<a>');
				$a.attr({ tabindex: '-1', href: '#' });
				$a.append(item[0]);
//				$a.text(item[0]);
				$li.append($a);
				$li.on('click', function () {
					$scope.$apply(function() {
						item[1].call($scope, $scope);
					});
				});
			}
			$ul.append($li);
		});
		$contextMenu.append($ul);
		$contextMenu.css({
			width: '100%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 9999
		});
		$(document).find('body').append($contextMenu);
		$contextMenu.on("click", function (e) {
			$(event.target).removeClass('context');
			$contextMenu.remove();
		}).on('contextmenu', function (event) {
			$(event.target).removeClass('context');
			event.preventDefault();
			$contextMenu.remove();
		});
	};
	return function ($scope, element, attrs) {
		element.on('contextmenu', function (event) {
			$scope.$apply(function () {
				event.preventDefault();
				var options = $scope.$eval(attrs.ngContextMenu);
				if (options instanceof Array) {
					renderContextMenu($scope, event, options);
				} else {
					throw '"' + attrs.ngContextMenu + '" not an array';
				}
			});
		});
	};
});

cuwyApp.directive('keyCuwytrap', function() {
	return function(scope, elem) {
		elem.bind('keydown', function(event) {
			scope.$broadcast('keydown', {
				event : event
			});
		});
	};
});

cuwyApp.directive('keyTrap', function() {
	return function(scope, elem) {
		elem.bind('keydown', function(event) {
			scope.$broadcast('keydown', {
				code : event.keyCode,
			});
		});
	};
});

cuwyApp.directive('ngBlur', function() {
	return function( scope, elem, attrs ) {
		elem.bind('blur', function() {
			scope.$apply(attrs.ngBlur);
		});
	};
});

//--------------patientLp24/prescribes24------------------------------

readDrugDocument = function(drug, $scope, $http){
	$http({ method : 'GET', url : config.urlPrefix + '/read/drug_'+drug.DRUG_ID
	}).success(function(data, status, headers, config) {
		$scope.drugDocument = data;
	}).error(function(data, status, headers, config) {
		$scope.drugDocument = null;
	});
}

readPrescribes = function($scope, $http){
	var urlStr;
	if(parameters.pid){
		urlStr = '/read/patient_'+parameters.pid;
	}else{
		urlStr = '/read/prescribe_'+parameters.id;
	}
	$http({ method : 'GET', url : urlStr}).success(function(data, status, headers, config) {
		$scope.patient = data;
		$scope.prescribeHistory = data.prescribesHistory[parameters.phi];
		$scope.prescribes = $scope.prescribeHistory.prescribes;
	}).error(function(data, status, headers, config) {
	});
}

changeEditedSelection = function(taskInDayIndex, prescribeHistory, $scope){
	var isWithoutChange = true;
	var selectPrescribesHistoryIndex = getPrescribeIndex(prescribeHistory, $scope);
	if(!$scope.dayInSelectPath(selectPrescribesHistoryIndex)){
		closeEditedPrescribeDrugDialog($scope);
		setEditedPrescribeHistory(selectPrescribesHistoryIndex, $scope);
		setEditedPrescribeDrug(taskInDayIndex, $scope);
		isWithoutChange = false;
	}
	if(!$scope.taskInSelectPath(taskInDayIndex, prescribeHistory)){
		closeEditedPrescribeDrugDialog($scope);
		setEditedPrescribeDrug(taskInDayIndex, $scope);
		isWithoutChange = false;
	}
	return isWithoutChange;
}

setEditedPrescribeHistory = function(index, $scope){
	$scope.workDoc.selectPrescribesHistoryIndex = index;
	initEditedPrescribeHistory($scope);
}
initEditedPrescribeHistory = function($scope){
	if($scope.workDoc.selectPrescribesHistoryIndex < 0) return;
	$scope.editedPrescribeHistory = $scope.workDoc.prescribesHistory[$scope.workDoc.selectPrescribesHistoryIndex];
}
initEditedPrescribeDrug = function($scope){
	$scope.editedPrescribeDrug =  $scope.editedPrescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
}

initPrescribesTasksInDay = function($scope){
	$($scope.p24hDoc.prescribesHistory).each(function () {
		this.tasksInDay = getTasksInDay($scope);
	} );
}

getTasksInDay = function($scope){
	var tasksInDay = [];
	for(var ii=0;ii<$scope.tasksInDayNumber;ii++)
		tasksInDay.push({i:ii,isCollapsed:false});
	return tasksInDay;
};

getTasksInDayTODEL = function($scope){
	$scope.tasksInDay = [];
	for(var ii = 0;ii <= $scope.tasksInDayNumber; ii++){
		$scope.tasksInDay.push({i:ii,isCollapsed:false});
	}
}

getLp24hour= function(dayHour, $scope){
	var lp24hour = dayHour + $scope.startHour24lp;
	lp24hour = lp24hour>23?lp24hour-24:lp24hour;
	return lp24hour;
}

newPrescribesCommon = function($scope){
	var newDayTasks = angular.copy($scope.workDoc.prescribesHistory[0].prescribes.tasks);
	var today = new Date();
	var prescribeHistory = {
			date:today,
			prescribeHistoryDays: "1",
			selectDrugIndex:0,
			prescribes:{tasks:newDayTasks}
//	prescribes:{tasks:[]}
	}
	prescribeHistory.tasksInDay = getTasksInDay($scope);
	if(null == $scope.p24hDoc.prescribesHistory){
		$scope.p24hDoc.prescribesHistory = [];
	}
	$scope.p24hDoc.prescribesHistory.splice(0, 0, prescribeHistory);
}

initWorkDocument = function(data, $scope, $http){
	console.log("initWorkDocument");
	$scope.workDoc = data;
	$scope.p24hDoc = $scope.workDoc;
	$scope.patient = $scope.workDoc;
	if(null == $scope.patient.prescribesHistory){
		$scope.newPrescribes();
		changeSaveControl($scope, $http);
	}
	initPrescribesTasksInDay($scope);
	if(typeof $scope.patient.selectPrescribesHistoryIndex === 'undefined'){
		$scope.patient.selectPrescribesHistoryIndex = 0;
		changeSaveControl($scope, $http);
	}
	initEditedPrescribeHistory($scope);
	if(typeof $scope.editedPrescribeHistory === 'undefined'){
		$scope.editedPrescribeHistory = $scope.patient.prescribesHistory[0];
	}
	if(typeof $scope.editedPrescribeHistory.selectDrugIndex === 'undefined'){
		$scope.editedPrescribeHistory.selectDrugIndex = 0;
		changeSaveControl($scope, $http);
	}
	initEditedPrescribeDrug($scope);
	if(typeof $scope.patient.pageDeepPositionIndex === 'undefined'){
		changeSaveControl($scope, $http);
		if($scope.editedPrescribeHistory.isCollapsed){
			$scope.patient.pageDeepPositionIndex = 1;
		}else{
			$scope.patient.pageDeepPositionIndex = 2;
		}
		console.log("$scope.patient.pageDeepPositionIndex = "+$scope.patient.pageDeepPositionIndex);
	}
}

initDeclarePrescribesEdit = function($scope, $http, $sce){
	initDeclarePrescribesCommon($scope, $http, $sce);
	$scope.minPageDeepPositionIndex = -2;
	$scope.autoSaveLimit = 5;
	$scope.tasksInDayNumber = 19;
	$scope.numberOfChange = 0;
	$scope.numberOfAutoSavedChange = 0;
	$scope.printForm = getCookie('printForm');
	$scope.drug1sList = drug1sList;
	$scope.config = config;
	$scope.parameters = parameters;
	var pageDeepPosition = ["page","day","task","edittask"];
	$scope.dayHours = getDayHours();

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
	};

	$scope.dateOptions = {
			formatYear: 'yyyy',
			startingDay: 1
	};
	//---------data-ng-class-----------------------------------
	$scope.allDaySelect = function(prescribeHistoryIndex){
		return $scope.dayInSelectPath(prescribeHistoryIndex) && ($scope.workDoc.pageDeepPositionIndex == 2) && $scope.editedPrescribeHistory.selectDrugIndex == -1 ;
	}
	$scope.dayInSelectPath = function(prescribeHistoryIndex){
		return prescribeHistoryIndex == $scope.p24hDoc.selectPrescribesHistoryIndex;
	}
	$scope.daySelected = function(prescribeHistoryIndex){
		return $scope.dayInSelectPath(prescribeHistoryIndex) && ($scope.p24hDoc.pageDeepPositionIndex == 1);
	}
	$scope.taskInSelectPath = function(taskInDayIndex, prescribeHistory){
		return taskInDayIndex == prescribeHistory.selectDrugIndex;
	}
	$scope.taskSelected = function(taskInDayIndex, prescribeHistory){
		var dayInSelectPath = $scope.dayInSelectPath(getPrescribeIndex(prescribeHistory, $scope));
		return dayInSelectPath && $scope.taskInSelectPath(taskInDayIndex, prescribeHistory) && ($scope.patient.pageDeepPositionIndex == 2);
	}
	$scope.dayHourInSelectPath = function(dayHourIndex, taskInDayIndex, prescribeHistory){
		var dayInSelectPath = $scope.dayInSelectPath(getPrescribeIndex(prescribeHistory, $scope));
		if(!dayInSelectPath) return false;
		var taskInSelectPath = $scope.taskInSelectPath(taskInDayIndex, prescribeHistory);
		if(!taskInSelectPath) return false;
		return $scope.editedPrescribeHistory.dayHourIndex == dayHourIndex;
	}
	$scope.dayHourSelected = function(dayHourIndex, taskInDayIndex, prescribeHistory){
		return $scope.dayHourInSelectPath(dayHourIndex, taskInDayIndex, prescribeHistory) && ($scope.patient.pageDeepPositionIndex == 3);
	}
	//---------data-ng-class-----------------------------------END
	$scope.collapseDayPrescribe = function(prescribeHistoryIndex){
		if($scope.patient.selectPrescribesHistoryIndex == -1){
			$scope.workDoc.selectPrescribesHistoryIndex = prescribeHistoryIndex;
			initEditedPrescribeHistory($scope);
			$scope.patient.patientUpdateOpen = false;
			return;
		}
		var prescribeHistory = $scope.workDoc.prescribesHistory[prescribeHistoryIndex];
		if(prescribeHistory.updateDialogOpen){
			prescribeHistory.updateDialogOpen = false;
			return;
		}
		prescribeHistory.isCollapsed = !prescribeHistory.isCollapsed
		if(prescribeHistory.isCollapsed)
			return;
		setEditedPrescribeHistory(prescribeHistoryIndex, $scope);
		changeSaveControl($scope, $http);
	}

	$scope.useHour = function(taskInDay, taskInDayIndex, dayHourIndex, prescribeHistory){
		$scope.workDoc.pageDeepPositionIndex = 3;
		console.log("A1 = "+dayHourIndex+":"+taskInDayIndex);
		var isWithoutChange = changeEditedSelection(taskInDayIndex, prescribeHistory, $scope);
		$scope.editedPrescribeHistory.dayHourIndex = dayHourIndex;
		if(!isWithoutChange) return;
		if(!taskInDay.isCollapsed){
			changeHour(dayHourIndex, $scope, $http);
		}else
		if(taskInDay.isCollapsed){
			var hour =  getLp24hour(dayHourIndex, $scope);
			var editedDrug = prescribeHistory.prescribes.tasks[taskInDay.i];
			if(!editedDrug.times){
				editedDrug.times = {};
				editedDrug.times.hours = getDayHoursEmpty();
			}
			if(!editedDrug.times.hours[hour]){
				editedDrug.times.hours[hour] = "-";
			}else{
				editedDrug.times.hours[hour] = null;
			}
			changeSaveControl($scope, $http);
			taskInDay.dialogTab = "times";
		}
	}

	$scope.getHoures2prescribe = function(drugForEdit){
		var houres2prescribe = [];
		if(drugForEdit && drugForEdit.times)
		angular.forEach(drugForEdit.times.hours, function(value, key){
			if(value){
				houres2prescribe.push(key);
			}
		} );
		return houres2prescribe;
	}

	$scope.prescribeHoursLeft = function(drugForEdit){
		var houres2prescribe = $scope.getHoures2prescribe(drugForEdit);
		angular.forEach(houres2prescribe, function(hourValue, key){
			$scope.prescribeHourLeft(drugForEdit, hourValue);
		});
	}
	$scope.prescribeHourLeft = function(drugForEdit, hour){
		moveMinus(drugForEdit.times.hours, hour);
	}
	$scope.prescribeHourRight = function(drugForEdit, hour){
		movePlus(drugForEdit.times.hours, hour + 1);
	}
	$scope.prescribeHoursRight = function(drugForEdit){
		var houres2prescribe = $scope.getHoures2prescribe(drugForEdit);
		angular.forEach(houres2prescribe, function(hourValue, key){
			$scope.prescribeHourRight(drugForEdit, hourValue);
		});
	}

	$scope.openPrescribeDrugDialog = function(taskInDay, taskInDayIndex, prescribeHistory){
		if($scope.patient.selectPrescribesHistoryIndex == -1){
			$scope.patient.selectPrescribesHistoryIndex = getPrescribeIndex(prescribeHistory, $scope);
		}
		$scope.patient.pageDeepPositionIndex = 2;
		if(!changeEditedSelection(taskInDayIndex, prescribeHistory, $scope)) return;

		//$scope.patient.pageDeepPositionIndex = 3;
		var oldCollapsed = taskInDay.isCollapsed;
		$(prescribeHistory.tasksInDay).each(function () {
			this.isCollapsed = false;
		} );
		taskInDay.isCollapsed = !oldCollapsed;
		$scope.editedPrescribeDrug =  prescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
		if(null == $scope.editedPrescribeDrug){
			$scope.editedPrescribeDrug = 
			{DRUG_NAME:"",
				dose:{DOSECONCENTRATON_UNIT:""
					,DOSECONCENTRATON_NUMBER:""
					,DOSE_UNIT:""
					,DOSE_NUMBER:""
					,DOSE_ID:""
					,DOSE_ROUTE_OF_ADMINISTRATION:""}
			};
			insertDrugToTask($scope.editedPrescribeDrug, $scope.editedPrescribeHistory.selectDrugIndex, prescribeHistory);
		}
		if($scope.editedPrescribeDrug && $scope.editedPrescribeDrug.DRUG_ID){
			readDrugDocument($scope.editedPrescribeDrug, $scope, $http);
		}
	}

	$scope.saveNewDrug = function(seekDrug, taskInDay, prescribeHistory){
		$http({ method : 'POST', data : $scope.editedPrescribeDrug, url : config.urlPrefix + '/saveNewDrug'
		}).success(function(data, status, headers, config){
			$scope.drug1sList = data;
			var newDrug = $scope.drug1sList[$scope.drug1sList.length-1];
			drugToTask2(newDrug, taskInDay, prescribeHistory)
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}
//-------------context-menu-------------------------------------------
$scope.menuTask = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція <sub><kbd>⏎</kbd></sub>', function ($itemScope) {
		$scope.openPrescribeDrugDialog($itemScope.taskInDay, $itemScope.taskInDayIndex, $itemScope.$parent.prescribeHistory);
	}],
	null,
	['<i class="fa fa-copy"></i> Копіювати <sub><kbd>Ctrl+C</kbd></sub>', function ($itemScope) { 
		var taskIndex = $itemScope.$index;
		copy(taskIndex, $itemScope.$parent.prescribeHistory);
	}],
	['<i class="fa fa-paste"></i> Вставити <sub><kbd>Ctrl+V</kbd></sub>', function ($itemScope) { 
		$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index, 0, null);
		contextMenuPaste($itemScope.taskInDay, $itemScope.$parent.prescribeHistory, $scope, $http); 
	}],
	null,
	['<span class="glyphicon glyphicon-plus"></span> Додати строчку <sub><kbd>Shift+⏎</kbd></sub>', function ($itemScope) {
		$itemScope.$parent.prescribeHistory.prescribes.tasks.splice($itemScope.$index+1, 0, null);
		changeSaveControl($scope, $http);
	}],
	['<span class="glyphicon glyphicon-remove"></span> Видалити <sub><kbd>Del</kbd></sub>', function ($itemScope) {
		deleteSelected($itemScope.$index, $itemScope.$parent.prescribeHistory);
	}],
	null,
	['<span class="glyphicon glyphicon-arrow-up"></span> Догори <sub><kbd>Alt+↑</kbd></sub>', function ($itemScope) {
		moveMinus($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	['<span class="glyphicon glyphicon-arrow-down"></span> Донизу <sub><kbd>Alt+↓</kbd></sub>', function ($itemScope) {
		movePlus($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index + 1);
	}],
	null,
	['<i class="fa fa-reply-all"></i> Скасувати вибір', function ($itemScope) {
		escapeSelectMultiple($itemScope.$parent.prescribeHistory);
	}]
];

drugToTask2 = function(drug, taskInDay, prescribeHistory){
	var position = taskInDay.i;
	insertDrugToTask(drug, position, prescribeHistory);
	taskInDay.dialogTab = "dose";
	readDrugDocument(drug, $scope, $http);
	$scope.editedPrescribeDrug =  prescribeHistory.prescribes.tasks[position];
}

insertDrugToTask = function(drug, position, prescribeHistory){
	var addNull = position - prescribeHistory.prescribes.tasks.length;
	if(addNull > 0){
		for (i = 0; i < addNull; i++) {
			prescribeHistory.prescribes.tasks.push(null);
		}
		prescribeHistory.prescribes.tasks.push(drug);
	}else if(null == prescribeHistory.prescribes.tasks[position]){
		prescribeHistory.prescribes.tasks[position] = drug;
	}else{
		prescribeHistory.prescribes.tasks[position] = drug;
	}
	changeSaveControl($scope, $http);
}

contextMenuPaste = function(taskInDay, prescribeHistory, $scope, $http){
	$http({ method : 'GET', url : config.urlPrefix + '/session/paste'
	}).success(function(data, status, headers, config) {
		if(data.selectMultiple && data.tasks){
			var position = taskInDay.i;
			$(data.tasks).each(function () {
				if(this.selectMultiple){
					insertDrugToTask(this, position++, prescribeHistory);
				}
			});
		}else{
			var drug = data;
			drugToTask2(drug, taskInDay, prescribeHistory)
		}
	}).error(function(data, status, headers, config) {
	});
};

contextMenuCopy = function(copyObject, $http){
	console.log(copyObject);
	$http({ method : 'POST', data : copyObject, url : config.urlPrefix + "/session/copy"
	}).success(function(data, status, headers, config){
	}).error(function(data, status, headers, config) {
		$scope.error = data;
	});
};
//-------------context-menu-------------------------------------------END

}

initDeclarePrescribesCommon = function($scope, $http, $sce){
	$scope.getLp24hourStr = function(dayHour){
		var lp24hour = getLp24hour(dayHour, $scope);
		return (lp24hour>9?'':'0')+lp24hour;
	}

	$scope.isMinus = function(taskInDayIndex, dayHourIndex, prescribeHistory){
		if(typeof prescribeHistory === 'undefined' 
		|| !prescribeHistory.prescribes || !prescribeHistory.prescribes.tasks[taskInDayIndex]
		|| !prescribeHistory.prescribes.tasks[taskInDayIndex].times
		)
			return false;
		var lp24hour = getLp24hour(dayHourIndex, $scope);
		var isMinus = ('-' == prescribeHistory.prescribes.tasks[taskInDayIndex].times.hours[lp24hour]);
		return isMinus;
	}

	$scope.taskDescription = function($index, prescribeHistory){
		if(typeof prescribeHistory.prescribes === 'undefined' || $index >= prescribeHistory.prescribes.tasks.length) return ".";
		var drug = prescribeHistory.prescribes.tasks[$index];
		if(drug === null || drug.DRUG_NAME === "") return ".";
		var taskDescription = drug.DRUG_NAME + " ";
		if(typeof drug.dose !== 'undefined'){
			if(drug.dose.DOSECONCENTRATON_NUMBER){
				taskDescription +=
					$sce.trustAsHtml( "<small>" + drug.dose.DOSECONCENTRATON_NUMBER+drug.dose.DOSECONCENTRATON_UNIT + "</small> ");
			}
			taskDescription += drug.dose.DOSE_NUMBER+" "+drug.dose.DOSE_UNIT;
			if(typeof drug.dose.DOSE_ROUTE_OF_ADMINISTRATION !== 'undefined'){
				taskDescription += " "+drug.dose.DOSE_ROUTE_OF_ADMINISTRATION;
			}
		}
		return taskDescription;
	};
	
}

initDeclarePrescribesPrint = function($scope, $http, $sce){
	readPrescribes($scope, $http);
	initDeclarePrescribesCommon($scope, $http, $sce);
	$scope.tasksInDay = getTasksInDay($scope);
	$scope.dayHours = getDayHours();

}

cangePatientDocToSave = function($scope){
	var docToSave = angular.copy($scope.patient);
	$(docToSave.prescribesHistory).each(function () {
		this.tasksInDay = null;
	});
	docToSave.patientUpdateOpen = false;
	return docToSave;
}

readDrug1sList = function($scope, $http){
	$http({
		method : 'GET',
		url : config.urlPrefix + '/drug1sList'
	}).success(function(data, status, headers, config) {
		$scope.drug1sList = data;
	}).error(function(data, status, headers, config) {
	});
}

saveWorkDoc = function(url, $scope, $http){
	var docToSave = cangePatientDocToSave($scope);
	$http({ method : 'POST', data : docToSave, url : url
	}).success(function(data, status, headers, config){
		initWorkDocument(data, $scope, $http);
		$scope.numberOfChange = 0;
		$scope.numberOfAutoSavedChange = 0;
		readDrug1sList($scope, $http);
	}).error(function(data, status, headers, config) {
		$scope.error = data;
	});
}

changeSaveControl = function($scope, $http){
	$scope.numberOfChange++;
	console.log($scope.numberOfChange+"/"+$scope.numberOfAutoSavedChange+"/"+$scope.autoSaveLimit);
	if(($scope.numberOfChange - $scope.numberOfAutoSavedChange) >= $scope.autoSaveLimit){
		console.log("-------------");
		var docToSave = cangePatientDocToSave($scope);
		$http({ method : 'POST', data : docToSave, url : config.urlPrefix + "/autosave/patient"
		}).success(function(data, status, headers, config){
			initWorkDocument(data, $scope, $http);
			console.log("numberOfAutoSavedChange = "+$scope.numberOfAutoSavedChange);
			$scope.numberOfAutoSavedChange = $scope.numberOfChange;
			console.log("numberOfAutoSavedChange = "+$scope.numberOfAutoSavedChange);
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}
	console.log(1);
};

getDayHours = function(){
	var dayHours = [];
	for(var i = 0; i < 24; i++) dayHours.push(i);
	return dayHours;
}

getDayHoursEmpty = function(){
	var dayHours = [];
	for(var i = 0; i < 24; i++) dayHours.push(null);
	return dayHours;
};

changeHour = function(dayHourIndex, $scope, $http){
	if(!$scope.editedPrescribeDrug.times){
		$scope.editedPrescribeDrug.times = {};
		$scope.editedPrescribeDrug.times.hours = getDayHoursEmpty();
	}
	var hour =  getLp24hour(dayHourIndex, $scope);
	if(!$scope.editedPrescribeDrug.times.hours[hour]){
		$scope.editedPrescribeDrug.times.hours[hour] = "-";
	}else{
		$scope.editedPrescribeDrug.times.hours[hour] = null;
	}
	changeSaveControl($scope, $http);
};

moveTo = function(arrayToSort, indexFrom, indexTo){
	var el = arrayToSort.splice(indexFrom, 1);
	arrayToSort.splice(indexTo, 0, el[0]);
	changeSaveControl($scope, $http);
}

moveUp = function(arrayToSort, index){
	moveTo(arrayToSort, index, index-1);
}

movePlus = function(arrayToSort, index){
	if(index < arrayToSort.length){
		moveUp(arrayToSort, index);
	}else{
		moveTo(arrayToSort, index-1,0);
	}
}
moveMinus = function(arrayToSort, index){
	if(index > 0){
		moveUp(arrayToSort, index);
	}else{
		moveTo(arrayToSort, 0, arrayToSort.length-1);
	}
}

getPrescribeIndex = function(prescribeHistory, $scope){ return $scope.workDoc.prescribesHistory.indexOf(prescribeHistory); }

setEditedPrescribeDrug = function(taskInDayIndex, $scope){
	$scope.editedPrescribeHistory.selectDrugIndex = taskInDayIndex;
	initEditedPrescribeDrug($scope);
}

closeEditedPrescribeDrugDialog = function($scope){
	$scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed = false;
}

escapeSelectMultiple = function(prescribeHistory){
	$(prescribeHistory.prescribes.tasks).each(function () {
		this.selectMultiple = false;
	});
	prescribeHistory.prescribes.selectMultiple = false;
}


//--------------patientLp24/prescribes24------------------------------END

setCookieDaysLong = function(c_name,value,exdays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

getCookie = function(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
	}
	return "";
}

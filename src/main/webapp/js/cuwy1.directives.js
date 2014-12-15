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
	F2 : 113,
	F4 : 115,
	Escape : 27,
	F1 : 112,
	Way : 60,//<
	C : 67,
	V : 86,
	S : 83,
	P0 : 48,//Ctrl_P
	Backspace : 8,
	Delete : 46,
	PageUp : 33,
	PageDown : 34,
	End : 35,
	Home : 36,
	ArrowUp : 38,
	ArrowDown : 40,
	ArrowLeft : 37,
	ArrowRight : 39,
	BACKSPACE : 8,
	TABKEY : 9,
	Enter : 13,
	SPACEBAR : 32
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
	console.log(data);
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
	var newDayTasks = [];
	if($scope.workDoc.prescribesHistory)
		newDayTasks = angular.copy($scope.workDoc.prescribesHistory[0].prescribes.tasks);
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
	angular.forEach($scope.patient.prescribesHistory, function(value, key){
		value.deleteDay = false;
	} );
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
	}
}

initDeclareListeSite = function($scope, $http, $sce, $filter){
	console.log("initDeclareListeSite");
	initDeclarePrescribesCommon($scope, $http, $sce, $filter);
	
	copyListImem = function(drug){
		contextMenuCopy(drug, $http);
	};
}

initDeclarePrescribesEdit = function($scope, $http, $sce, $filter){
	initDeclarePrescribesCommon($scope, $http, $sce, $filter);
	$scope.hourMoveWay = 0;
	$scope.hoursMoveWays = ["|⇄|",".⇄|","|⇄."];
//	$scope.hoursMoveWays = ["|⇄|",".⇄|","|⇄|","|⇄."];
//	$scope.hoursMoveWays = ["|↔|"," ↔|","|↔|","|↔ "];
//	$scope.hoursMoveWays = ["↔","⇥","↦"];
//	$scope.hoursMoveWays = ["↔","⇥↤","↦⇤"];
	//$scope.hoursMoveWays = ["<sub>←</sub><sup>→</sup>","<sub>⇥</sub><sup>↤</sup>","<sub>↦</sub><sup>⇤</sup>"];
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
	$scope.dayHeadSelect = function(prescribeHistoryIndex, dayHourIndex){
		var dayInSelectPath = $scope.dayInSelectPath(prescribeHistoryIndex);
		if(!dayInSelectPath) return false;
		return $scope.editedPrescribeHistory.dayHourIndex == dayHourIndex;
	}
	$scope.allDaySelect = function(prescribeHistoryIndex){
		return $scope.dayInSelectPath(prescribeHistoryIndex) && ($scope.workDoc.pageDeepPositionIndex == 2) && $scope.editedPrescribeHistory.selectDrugIndex == -1;
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
	$scope.drugInDrugSelected = function(taskInDayIndex, drugInDrug, prescribeHistory){
		var dayInSelectPath = $scope.dayInSelectPath(getPrescribeIndex(prescribeHistory, $scope));
		return dayInSelectPath && $scope.editedPrescribeDrug == drugInDrug && $scope.taskInSelectPath(taskInDayIndex, prescribeHistory) && ($scope.patient.pageDeepPositionIndex == 2);
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
	var k2lMap = {
		"й":"q","ц":"w","у":"e","к":"r","е":"t","н":"y","г":"u","ш":"i","щ":"o","з":"p","х":"[","ъ":"]",
		"ф":"a","ы":"s","в":"d","а":"f","п":"g","р":"h","о":"j","л":"k","д":"l","ж":";","э":"'",
		"я":"z","ч":"x","с":"c","м":"v","и":"b","т":"n","ь":"m","б":",","ю":"."
	}
	$scope.k2l = null;
	$scope.getSeekPrescribeEdit = function(){
		console.log($scope.selectDrugIndex);
		console.log($scope.seekPrescribeEdit);
		$scope.filterDrugs($scope.seekPrescribeEdit);
		console.log($scope.drug1sListFilter);
		$scope.k2l = null;
		if($scope.drug1sListFilter.length == 0){
			var k2l = "";
			angular.forEach($scope.seekPrescribeEdit, function(value, key){
				k2l += k2lMap[value];
			});
			$scope.filterDrugs(k2l);
			if($scope.drug1sListFilter.length > 0){
				$scope.k2l = k2l;
			}
		}
	}
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
		prescribeHistory.isCollapsed = !prescribeHistory.isCollapsed;
		if(prescribeHistory.isCollapsed){
			prescribeHistoryIndex--;
			if(prescribeHistoryIndex < 0) prescribeHistoryIndex = 0;
		}
		setEditedPrescribeHistory(prescribeHistoryIndex, $scope);
		changeSaveControl($scope, $http);
	}

	$scope.useHourDrugInDrug = function(dayHourIndex, drugInline){
		if(!drugInline.times){
			drugInline.times = {};
			drugInline.times.hours = getDayHoursEmpty();
		}
		var hour =  getLp24hour(dayHourIndex, $scope);
		if(!drugInline.times.hours[hour]){
			drugInline.times.hours[hour] = "-";
		}else{
			drugInline.times.hours[hour] = null;
		}
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

	$scope.prescribeMalProDayMinus = function(drugForEdit){
		var malProDay = $scope.getHoures2prescribe(drugForEdit).length;
		if(malProDay > 1)
			malProDay--;
		prescribeMalProDay2(drugForEdit, malProDay);
	}
	$scope.prescribeMalProDayPlus = function(drugForEdit){
		var malProDay = $scope.getHoures2prescribe(drugForEdit).length;
		if(malProDay < 24)
			malProDay++;
		prescribeMalProDay2(drugForEdit, malProDay);
	}
	
	prescribeMalProDay2 = function(drugForEdit, malProDay){
		var restHour = 24 % malProDay;
		var stepHour = (24 - restHour) / malProDay;
		var startHour = null;
		for(var h = $scope.startHour24lp; h < 24; h++)
			if(drugForEdit.times.hours[h]){
				startHour = h;
				break;
			}
		var restMalProDay = malProDay;
		var lastHour = startHour;
		var donation = {};
		for(var h = startHour; h < 24; h++){
			if(h == lastHour){
				donation[h] = "-";
				lastHour += stepHour;
				restMalProDay--;
			}
		}
		if(restMalProDay > 0)
		for(var h = 0; h < startHour; h++){
			if(h == lastHour - 24){
				donation[h] = "-";
				lastHour += stepHour;
				restMalProDay--;
				if(restMalProDay == 0)
					break;
			}
		}
		for(var h = 0; h < 24; h++)
			if(donation[h]){
				drugForEdit.times.hours[h] = "-";
			}else
			if(drugForEdit.times.hours[h]){
				drugForEdit.times.hours[h] = null;
			}
	}

	prescribeMalProDay = function(drugForEdit, malProDay){
		var stepHour = Math.round(24/malProDay);
		var nextHour = null;
		for(var h = $scope.startHour24lp; h < 24; h++){
			if(drugForEdit.times.hours[h]){
				if(!nextHour){
					nextHour = getNextHour(h, stepHour);
					continue;
				}
			}
			if(h == nextHour){
				drugForEdit.times.hours[h] = "-";
				nextHour = getNextHour(h, stepHour);
				continue;
			}else if(drugForEdit.times.hours[h]){
				drugForEdit.times.hours[h] = null;
			}
		}
		for(var h = 0; h < $scope.startHour24lp; h++){
			if(h == nextHour){
				drugForEdit.times.hours[h] = "-";
				nextHour = getNextHour(h, stepHour);
				continue;
			}else if(drugForEdit.times.hours[h]){
				drugForEdit.times.hours[h] = null;
			}
		}
	}
	getNextHour = function(h, stepHour){
		var nextHour = h + stepHour;
		return nextHour > 23?nextHour-24:nextHour;
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

	$scope.openPrescribeDrugInDrugDialog = function(taskInDay, drugInDrug, prescribeHistory){
		collapseModal(taskInDay, prescribeHistory);
		$scope.editedPrescribeDrug = drugInDrug;
		readDrugDocument(drugInDrug, $scope, $http);
	}

	$scope.openPrescribeDrugDialog = function(taskInDay, taskInDayIndex, prescribeHistory){
		if($scope.patient.selectPrescribesHistoryIndex == -1){
			$scope.patient.selectPrescribesHistoryIndex = getPrescribeIndex(prescribeHistory, $scope);
		}
		$scope.patient.pageDeepPositionIndex = 2;
		if(!changeEditedSelection(taskInDayIndex, prescribeHistory, $scope)) return;

		//$scope.patient.pageDeepPositionIndex = 3;
		collapseModal(taskInDay, prescribeHistory);
		initEditedPrescribeDrugForEdit(prescribeHistory, $scope.editedPrescribeHistory.selectDrugIndex, $scope);

		if($scope.editedPrescribeDrug && $scope.editedPrescribeDrug.DRUG_ID){
			readDrugDocument($scope.editedPrescribeDrug, $scope, $http);
		}
	}

	initEditedPrescribeDrugForEdit = function(prescribeHistory, editedPrescribeDrugIndex, $scope){
		$scope.editedPrescribeDrug =  prescribeHistory.prescribes.tasks[editedPrescribeDrugIndex];
		if(null == $scope.editedPrescribeDrug){
			$scope.editedPrescribeDrug = 
			{DRUG_NAME:"",
			changedDrug : true,
				dose:{DOSECONCENTRATON_UNIT:""
					,DOSECONCENTRATON_NUMBER:""
					,DOSE_UNIT:""
					,DOSE_NUMBER:""
					,DOSE_ID:""
					,DOSE_ROUTE_OF_ADMINISTRATION:""}
			};
			insertDrugToTask($scope.editedPrescribeDrug, editedPrescribeDrugIndex, prescribeHistory);
		}
		$scope.oldDoses = getDosesInStr($scope.editedPrescribeDrug.dose);
	}
	getDosesInStr = function(d){
		return d.DOSECONCENTRATON_UNIT +d.DOSECONCENTRATON_NUMBER +d.DOSE_UNIT +d.DOSE_NUMBER 
		+d.DOSE_ROUTE_OF_ADMINISTRATION;
	}
	collapseModal = function(taskInDay, prescribeHistory){
		var oldCollapsed = taskInDay.isCollapsed;
		for (var dp = 0; dp < prescribeHistory.tasksInDay.length; dp++)
			if(prescribeHistory.tasksInDay[dp].isCollapsed){
				var drug = prescribeHistory.prescribes.tasks[dp];
				//нічого не помінялось і самозбереження
				//if(drug && $scope.oldDoses != getDosesInStr(drug)) changeSaveControl($scope, $http);
				prescribeHistory.tasksInDay[dp].isCollapsed = false;
			}
		taskInDay.isCollapsed = !oldCollapsed;
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

	drugToTask2 = function(drug, taskInDay, prescribeHistory){
		var position = taskInDay.i;
		insertDrugToTask(drug, position, prescribeHistory);
		taskInDay.dialogTab = "dose";
		readDrugDocument(drug, $scope, $http);
		$scope.editedPrescribeDrug =  prescribeHistory.prescribes.tasks[position];
	}

	$scope.drugToTask4 = function(drug){
		var drugCount = $scope.editedPrescribeHistory.prescribes.tasks.length;
		initEditedPrescribeDrugForEdit($scope.editedPrescribeHistory, drugCount, $scope);
		drugToTask31(drug);
	}

	drugToTask31 = function(drug){
		var dT = $scope.editedPrescribeDrug;
		var dS = drug;
		dT.DRUG_ARCHIVE = dS.DRUG_ARCHIVE;
		dT.DRUG_ID = dS.DRUG_ID;
		dT.DRUG_NAME = dS.DRUG_NAME;
		readDrugDocument(dT, $scope, $http);
	}
	$scope.drugToTask3 = function(drug){
		drugToTask31(drug);
		$scope.taskInDay.dialogTab = "dose";
		$('#dose1').focus();
	}

	adaptSelectDrugToFilterList = function(){
		if(($scope.drug1sListFilter.length-1) < $scope.selectDrugIndex)
			$scope.selectDrugIndex = null;
	}

	$scope.filterDrugs = function(seekDrug){
		var f1 = $filter('filter')($scope.drug1sList, {DRUG_ARCHIVE:false});
		var f2 = $filter('filter')(f1, seekDrug);
//		var f2 = $filter('filter')(f1, $scope.editedPrescribeDrug.DRUG_NAME);
		$scope.drug1sListFilter = $filter('limitTo')(f2, 12);
		adaptSelectDrugToFilterList();
		if($scope.selectDrugIndex == null)
			$scope.selectDrugIndex = 0;
	}

copy = function(taskIndex, prescribeHistory){
	console.log("-----copy-------- "+taskIndex);
	if(prescribeHistory.prescribes.selectMultiple){
		copyCopyObject(null, prescribeHistory, $http, $filter);
	}else{
		copyCopyObject(taskIndex, prescribeHistory, $http, $filter);
	}
}

//-------------context-menu-------------------------------------------
$scope.menuTasksAll = [
	['<i class="fa fa-copy"></i> Копіювати <sub><kbd>Ctrl+C</kbd></sub>', function ($itemScope) {
		copy(-1, $itemScope.prescribeHistory);
	}],
	['<i class="fa fa-paste"></i> Вставити <sub><kbd>Ctrl+V</kbd></sub>', function ($itemScope) {
		pasteCopyObject($itemScope.prescribeHistory, $scope, $http);
		console.log("----------------");
		return
		$http({ method : 'GET', url : config.urlPrefix + '/session/paste'
		}).success(function(data, status, headers, config) {
			
			if($itemScope.prescribeHistory.prescribes.tasks.length == 0){
				$itemScope.prescribeHistory.prescribes.tasks = data.tasks;
				$scope.numberOfChange += $itemScope.prescribeHistory.prescribes.tasks.length;
			}else{
				if(data.tasks.length + $itemScope.prescribeHistory.prescribes.tasks.length < 19){
					$itemScope.prescribeHistory.prescribes.tasks.push
					.apply($itemScope.prescribeHistory.prescribes.tasks, data.tasks);
				}
			}
		}).error(function(data, status, headers, config) {
		});
	}],
	null,
	['<span class="glyphicon glyphicon-plus"></span> Видалити всі призначення ', function ($itemScope) {
		var drugCount = $itemScope.prescribeHistory.prescribes.tasks.length;
		var isConfirmed = confirm("Підтвердіть, що Ви дійсно бажаєте вилучити одразу " +drugCount +" ліків !");
		if(isConfirmed){
			$itemScope.prescribeHistory.prescribes.tasks.splice(0,drugCount - 1);
			changeSaveControl($scope, $http);
		}
	}]
];

$scope.menuDrugInDrug = [
	['<span class="glyphicon glyphicon-edit"></span> Корекція <sub><kbd>⏎</kbd></sub>', function ($itemScope) {
		$scope.openPrescribeDrugDialog($itemScope.taskInDay, $itemScope.taskInDayIndex, $itemScope.$parent.prescribeHistory);
	}],
	null,
	['<i class="fa fa-copy"></i> Копіювати <sub><kbd>Ctrl+C</kbd></sub>', function ($itemScope) { 
		var taskIndex = $itemScope.$index;
		copy(taskIndex, $itemScope.$parent.prescribeHistory);
	}],
	['<span class="glyphicon glyphicon-remove"></span> Видалити <sub><kbd>Del</kbd></sub>', function ($itemScope) {
		deleteDrugInDrug($itemScope);
	}],
	null,
	['<span class="glyphicon glyphicon-arrow-up"></span> Догори <sub><kbd>Alt+↑</kbd></sub>', function ($itemScope) {
		moveDrugUp($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	['<span class="glyphicon glyphicon-arrow-down"></span> Донизу <sub><kbd>Alt+↓</kbd></sub>', function ($itemScope) {
		moveDrugDown($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	null,
	['<span class="glyphicon glyphicon-minus"></span> В стовбчик / стрічку ', function ($itemScope) {
		inSelfLine($itemScope);
	}],
	['<span class="glyphicon glyphicon-minus"></span> Розділитиль ', function ($itemScope) {
		splitSymbol($itemScope);
	}]
];

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
		var prescribeHistory = $itemScope.$parent.prescribeHistory;
		prescribeHistory.selectDrugIndex = $itemScope.$index;
		pasteCopyObject(prescribeHistory, $scope, $http);
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
		moveDrugUp($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	['<span class="glyphicon glyphicon-arrow-down"></span> Донизу <sub><kbd>Alt+↓</kbd></sub>', function ($itemScope) {
		moveDrugDown($itemScope.$parent.prescribeHistory.prescribes.tasks, $itemScope.$index);
	}],
	null,
	/*
	['<span class="glyphicon glyphicon-plus"></span> Додати до групи', function ($itemScope) {
		addToGroup($itemScope);
	}],
	 * */
	['<span class="glyphicon glyphicon-plus"></span> Додати до групи в лінію', function ($itemScope) {
		addToGroupInline($itemScope);
	}],
	['<i class="fa fa-reply-all"></i> Скасувати вибір', function ($itemScope) {
		escapeSelectMultiple($itemScope.$parent.prescribeHistory);
	}]
];

splitSymbol = function($itemScope){
	var drugGroup = $itemScope.prescribeHistory.prescribes.tasks[$itemScope.taskInDayIndex];
	if(!drugGroup.splitSymbol){
		drugGroup.splitSymbol = ";"
	}else
	if("+" == drugGroup.splitSymbol){
		drugGroup.splitSymbol = ";";
	}else
	if(";" == drugGroup.splitSymbol){
		drugGroup.splitSymbol = "+";
	}
	changeSaveControl($scope, $http);
}

inSelfLine = function($itemScope){
	$itemScope.drugInline.inSelfLine = !$itemScope.drugInline.inSelfLine;
}
addToGroupInline = function($itemScope){
	var taskIndex = $itemScope.$index;
	var prescribeHistory = $itemScope.$parent.prescribeHistory;
	var drug = prescribeHistory.prescribes.tasks[taskIndex];
	var drugGroup = prescribeHistory.prescribes.tasks[taskIndex-1];
	if(drug.groupPosition > 0){
		drugGroup  = prescribeHistory.prescribes.tasks[taskIndex - drug.groupPosition];
	}
	if(!drugGroup.inlineDrugs){
		drugGroup.inlineDrugs = [];
	}
	if(!drug.inSelfLine){
		drug.inSelfLine = false;
	}
	drugGroup.inlineDrugs.push(drug);
	prescribeHistory.prescribes.tasks.splice(taskIndex, 1);
	changeSaveControl($scope, $http);
}

addToGroup = function($itemScope){
	var taskIndex = $itemScope.$index;
	var prescribeHistory = $itemScope.$parent.prescribeHistory;
	var drugGroup = prescribeHistory.prescribes.tasks[taskIndex-1];
	if(!drugGroup.groupPosition){
		drugGroup.groupPosition = 0;
	}
	var drug = prescribeHistory.prescribes.tasks[taskIndex];
	drug.groupPosition = drugGroup.groupPosition+1;
	changeSaveControl($scope, $http);
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
	}else if(null == drug){
		prescribeHistory.prescribes.tasks.splice(position, 0, null);
	}else{
		prescribeHistory.prescribes.tasks.splice(position, 0, null);
		prescribeHistory.prescribes.tasks[position] = drug;
	}
}

pasteCopyObject = function(prescribeHistory, $scope, $http){
	$http({ method : 'GET', url : config.urlPrefix + '/session/paste'
	}).success(function(copyObject, status, headers, config) {
		var selectPosition = prescribeHistory.selectDrugIndex;
		if(selectPosition == -1) selectPosition = 0;
		var taskInDay = prescribeHistory.tasksInDay[selectPosition];
		var position = taskInDay.i;
		$(copyObject.tasks).each(function () {
			var drug = this.DRUG_NAME?this:null;
			insertDrugToTask(drug, position++, prescribeHistory);
		});
		changeSaveControl($scope, $http);
	}).error(function(data, status, headers, config) {
	});
};

pasteToDrugDocName = function($itemScope, $scope, $http){
	$http({ method : 'GET', url : config.urlPrefix + '/session/paste'
	}).success(function(copyObject, status, headers, config) {
		if(!$scope.drugDocument.replacementDrugs){
			$scope.drugDocument.replacementDrugs = [];
		}
		$scope.drugDocument.replacementDrugs.push(copyObject.drugDocument);
		changeSaveControl($scope, $http);
	}).error(function(data, status, headers, config) {
	});
};

//-------------context-menu-------------------------------------------END

moveTo = function(arrayToSort, indexFrom, indexTo){
	var el = arrayToSort.splice(indexFrom, 1);
	arrayToSort.splice(indexTo, 0, el[0]);
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

//---------------------keydown-------------------------------
$scope.keys = [];
//masd be first
$scope.keys.push({ code : KeyCodes.F4, action : function() { $scope.saveWorkDoc(); }});
//masd be two
$scope.keys.push({ code : KeyCodes.Escape,
	action : function() {
		console.log("Escape");
		if($scope.editedPrescribeHistory.prescribes.selectMultiple){
			escapeSelectMultiple($scope.editedPrescribeHistory);
			return;
		}
		if($scope.patient.pageDeepPositionIndex == 2){
			$scope.patient.pageDeepPositionIndex--;
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
			if($scope.workDoc.selectPrescribesHistoryIndex == -1){
					$scope.patient.patientUpdateOpen = false;
			}else{
				var calcNotCollapsed = 0;
				$($scope.patient.prescribesHistory).each(function () {
					if(!this.isCollapsed) calcNotCollapsed++;
				} );
				if(calcNotCollapsed > 1 && !$scope.editedPrescribeHistory.isCollapsed){
					$scope.editedPrescribeHistory.isCollapsed = true;
				}else{
					$scope.patient.pageDeepPositionIndex--;
					$("#focus_0").focus();
				}
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 0){
			skipLinkMinus1();
		}else 
		if($scope.patient.pageDeepPositionIndex > $scope.minPageDeepPositionIndex){
			$scope.patient.pageDeepPositionIndex--;
			$("#focus_minus_"+(0-$scope.patient.pageDeepPositionIndex)).focus();
		}
	}
});
$scope.keys.push({ code : KeyCodes.F1,
	action : function() {
		$scope.openF1();
	}
});
$scope.openF1 = function(){
	window.open("help.html#patient", "", "width=1000, height=500");
}
$scope.keys.push({ code : KeyCodes.SPACEBAR,
	action : function() {
		console.log("SPACEBAR");
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.collapseDayPrescribe($scope.patient.selectPrescribesHistoryIndex);
		}else
		if($scope.patient.pageDeepPositionIndex == 2){
			var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
			$scope.openPrescribeDrugDialog(taskInDay, $scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 3){
			initEditedPrescribeDrug($scope);
			if(null == $scope.editedPrescribeDrug)
				openEditedPrescribeDrugDialog();
			else{
				changeHour($scope.editedPrescribeHistory.dayHourIndex, $scope, $http);
			}
		}
	}
});

$scope.keys.push({ code : KeyCodes.Home,
	action : function() {
		console.log("Home - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex = 0;
		}
	}
});

$scope.keys.push({ code : KeyCodes.End,
	action : function() {
		console.log("End - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex = 23;
		}
	}
});

$scope.keys.push({ code : KeyCodes.PageDown,
	action : function() {
		console.log("PageDown - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			if($scope.editedPrescribeHistory.selectDrugIndex < $scope.editedPrescribeHistory.prescribes.tasks.length - 1){
				$scope.editedPrescribeHistory.selectDrugIndex = $scope.editedPrescribeHistory.prescribes.tasks.length - 1;
			}else{
				$scope.editedPrescribeHistory.selectDrugIndex = $scope.editedPrescribeHistory.tasksInDay.length - 1;
			}
		}
	}
});

$scope.keys.push({ code : KeyCodes.PageUp,
	action : function() {
		console.log("PageUp - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			if($scope.editedPrescribeHistory.selectDrugIndex == 0){
				$scope.editedPrescribeHistory.selectDrugIndex = -1;
			}else{
				$scope.editedPrescribeHistory.selectDrugIndex = 0;
			}
		}
	}
});

$scope.keys.push({ code : KeyCodes.ArrowRight,
	action : function() {
		console.log("ArrowRight - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if(document.activeElement.id.indexOf('focus') >= 0){
			$("#"+document.activeElement.id).blur();
		}
		if($scope.patient.pageDeepPositionIndex <= 2){
			$scope.patient.pageDeepPositionIndex++;
			if($scope.patient.pageDeepPositionIndex == 3){
				if($scope.editedPrescribeHistory.dayHourIndex == -1 || !$scope.editedPrescribeHistory.dayHourIndex){
					$scope.editedPrescribeHistory.dayHourIndex = 0;
				}
				return;
			}
		}
		if($scope.patient.pageDeepPositionIndex < 0){
			$("#focus_minus_"+(0-$scope.patient.pageDeepPositionIndex)).focus();
		}else
		if($scope.patient.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
		}else
		if($scope.patient.pageDeepPositionIndex == 1){
		}else
		if($scope.patient.pageDeepPositionIndex == 2){
			if($scope.editedPrescribeHistory.isCollapsed){
				$scope.editedPrescribeHistory.isCollapsed = false;
			}
		}else
		if($scope.patient.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex++;
			if(24 == $scope.editedPrescribeHistory.dayHourIndex)
				$scope.editedPrescribeHistory.dayHourIndex = 0;
		}
	}
});

$scope.keys.push({ code : KeyCodes.ArrowLeft,
	action : function() {
		console.log("ArrowLeft - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex == 3){
			$scope.editedPrescribeHistory.dayHourIndex--;
			if($scope.editedPrescribeHistory.dayHourIndex >=0)
				return;
		}
		if($scope.workDoc.pageDeepPositionIndex > $scope.minPageDeepPositionIndex){
			$scope.workDoc.pageDeepPositionIndex--;
		}
		if($scope.workDoc.pageDeepPositionIndex == 0){
			$("#focus_0").focus();
			$scope.workDoc.selectPrescribesHistoryIndex = 0;
			initEditedPrescribeHistory($scope);
		}else
		if($scope.workDoc.pageDeepPositionIndex < 0){
			$("#focus_minus_"+(0-$scope.workDoc.pageDeepPositionIndex)).focus();
		}
	}
});

$scope.keys.push({ code : KeyCodes.ArrowDown,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex++;
			if($scope.editedPrescribeHistory.selectDrugIndex >= 19){
				$scope.editedPrescribeHistory.selectDrugIndex = 0;
			}
			initEditedPrescribeDrug($scope);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.workDoc.selectPrescribesHistoryIndex++;
			if($scope.workDoc.selectPrescribesHistoryIndex >= $scope.patient.prescribesHistory.length){
				$scope.workDoc.selectPrescribesHistoryIndex = -1;
			}
			initEditedPrescribeHistory($scope);
		}
	}
});

$scope.keys.push({ code : KeyCodes.ArrowUp,
	action : function() {
		console.log("ArrowUp - deep - "+$scope.workDoc.pageDeepPositionIndex);
		if($scope.workDoc.pageDeepPositionIndex >= 2){
			$scope.editedPrescribeHistory.selectDrugIndex--;
			if($scope.editedPrescribeHistory.selectDrugIndex < -1){
				$scope.editedPrescribeHistory.selectDrugIndex = 18;
			}
			initEditedPrescribeDrug($scope);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.workDoc.selectPrescribesHistoryIndex--;
			if($scope.workDoc.selectPrescribesHistoryIndex < -1){
				$scope.workDoc.selectPrescribesHistoryIndex = 
					$scope.workDoc.prescribesHistory.length - 1;
			}
			initEditedPrescribeHistory($scope);
		}
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.P0,
	action : function() { //Ctrl_P
		document.getElementById("print_"+prescribeHistoryIndex).click();
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.V,
	action : function() { //Ctrl_V
		pasteCopyObject($scope.editedPrescribeHistory, $scope, $http);
	}
});
$scope.keys.push({ ctrlKey : true, code : KeyCodes.C,
	action : function() { //Ctrl_C
		copy($scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.S, action : function() { $scope.saveWorkDoc(); }});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowDown,
	action : function() {
	}
});
$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowUp,
	action : function() {
	}
});

hourYesHourNo = function (hourYes, hourNo){
	$scope.editedPrescribeDrug.times.hours[hourYes] = "-";
	$scope.editedPrescribeDrug.times.hours[hourNo] = null;
}

$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowLeft,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 3){
			var hour =  getLp24hour($scope.editedPrescribeHistory.dayHourIndex, $scope);
			if($scope.editedPrescribeDrug.times.hours[hour]){
				hourYesHourNo(hour - 1, hour);
				$scope.editedPrescribeHistory.dayHourIndex--;
			}else{
				var moved = false;
				var selectedHour = hour;
				for (var hour = $scope.dayStartHour; hour < selectedHour; hour++) {
					if($scope.editedPrescribeDrug.times.hours[hour]){
						if(hour == 8) break; // no move to other day
						hourYesHourNo(hour - 1, hour);
						var moved = true;
					}
				}
				if(moved)
					$scope.editedPrescribeHistory.dayHourIndex--;
			}
		}
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.ArrowRight,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 3){
			var hour =  getLp24hour($scope.editedPrescribeHistory.dayHourIndex, $scope);
			if($scope.editedPrescribeDrug.times.hours[hour]){
				hourYesHourNo(hour + 1, hour);
				$scope.editedPrescribeHistory.dayHourIndex++;
			}else{
				var moved = false;
				var selectedHour = hour;
				var isBreak = false;
				for (var hour = $scope.dayStartHour - 1; hour > selectedHour || (selectedHour >= $scope.dayStartHour && hour >= 0); hour--) 
					if($scope.editedPrescribeDrug.times.hours[hour]){
						if(hour == ($scope.dayStartHour - 1)){
							isBreak = true;
							break; // no move to other day
						}
						hourYesHourNo(hour + 1, hour);
						var moved = true;
					}
				if(!isBreak)
					for (var hour = 23; hour > selectedHour; hour--) 
						if($scope.editedPrescribeDrug.times.hours[hour]){
							var hourYes = (hour == 23)? 0:hour + 1;
							hourYesHourNo(hourYes, hour);
							var moved = true;
						}
				if(moved)
					$scope.editedPrescribeHistory.dayHourIndex++;
			}
		}
	}
});

moveDrugDown = function(tasks, selectDrugIndex){
	var drug = tasks[selectDrugIndex];
	if(drug.groupPosition == null){
		movePlus(tasks, selectDrugIndex + 1);
		changeSaveControl($scope, $http);
		return true;
	}
	if(drug.groupPosition > 0){
		selectDrugIndex -= drug.groupPosition;
		drug = tasks[selectDrugIndex];
	}
	if(drug.groupPosition == 0){
		var drugInGroupIndex = 0;
		while(drug && drug.groupPosition == drugInGroupIndex){
			drugInGroupIndex = drugInGroupIndex + 1;
			drug = tasks[selectDrugIndex + drugInGroupIndex];
		}
		for(var gd = drugInGroupIndex; gd > 0; gd--){
			movePlus(tasks, selectDrugIndex + gd);
		}
		changeSaveControl($scope, $http);
		return true;
	}
}

moveDrugUp = function(tasks, selectDrugIndex){
	var drug = tasks[selectDrugIndex];
	if(drug.groupPosition == null){
		moveMinus(tasks, selectDrugIndex);
		changeSaveControl($scope, $http);
		return true;
	}
	if(drug.groupPosition > 0){
		selectDrugIndex -= drug.groupPosition;
		drug = tasks[selectDrugIndex];
	}
	if(drug.groupPosition == 0){
		moveMinus(tasks, selectDrugIndex);
		var drugInGroupIndex = drug.groupPosition + 1;
		var drugInGroup = tasks[selectDrugIndex + drugInGroupIndex];
		while(drugInGroup && drugInGroup.groupPosition == drugInGroupIndex){
			moveMinus(tasks, selectDrugIndex + drugInGroupIndex);
			drugInGroupIndex = drugInGroupIndex + 1;
			drugInGroup = tasks[selectDrugIndex + drugInGroupIndex];
		}
		changeSaveControl($scope, $http);
		return true;
	}
}

$scope.keys.push({ altKey : true, code : KeyCodes.ArrowDown,
	action : function() {
		var isMoved = moveDrugDown($scope.editedPrescribeHistory.prescribes.tasks, $scope.editedPrescribeHistory.selectDrugIndex);
		if(isMoved){
			$scope.editedPrescribeHistory.selectDrugIndex++;
		}
	}
});
$scope.keys.push({ altKey : true, code : KeyCodes.ArrowUp,
	action : function() {
		var isMoved = moveDrugUp($scope.editedPrescribeHistory.prescribes.tasks, $scope.editedPrescribeHistory.selectDrugIndex);
		if(isMoved){
			$scope.editedPrescribeHistory.selectDrugIndex--;
		}
	}
});

$scope.keys.push({ code : KeyCodes.Enter,
	action : function() {
		console.log("Enter "+"/"+$scope.workDoc.pageDeepPositionIndex+"/"+$scope.workDoc.selectPrescribesHistoryIndex);
		if($scope.workDoc.pageDeepPositionIndex == 1){
			if($scope.workDoc.selectPrescribesHistoryIndex == -1){
				$scope.updatePatient();
			}else{
				$scope.collapseDayPrescribe($scope.workDoc.selectPrescribesHistoryIndex);
			}
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
			openEditedPrescribeDrugDialog();
		}else
		if($scope.workDoc.pageDeepPositionIndex == 3){
			initEditedPrescribeDrug($scope);
			if(null == $scope.editedPrescribeDrug){
				openEditedPrescribeDrugDialog();
			}else{
				changeHour($scope.editedPrescribeHistory.dayHourIndex, $scope, $http);
			}
		}
	}
});

openEditedPrescribeDrugDialog = function(){
	var taskInDay = $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex];
	$scope.openPrescribeDrugDialog(taskInDay, $scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
};

$scope.keys.push({ shiftKey : true, code : KeyCodes.Enter,
	action : function() {
		if($scope.workDoc.pageDeepPositionIndex == 1){
			$scope.newPrescribes();
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
			var drug = $scope.editedPrescribeHistory.prescribes.tasks[$scope.editedPrescribeHistory.selectDrugIndex];
			console.log(drug);
			if(drug && drug.groupPosition >=0){
			}else{
				$scope.editedPrescribeHistory.prescribes.tasks.splice($scope.editedPrescribeHistory.selectDrugIndex+1, 0, null);
				changeSaveControl($scope, $http);
			}
		}
	}
});

$scope.keys.push({ ctrlKey : true, code : KeyCodes.Enter,
	action : function() {
		console.log("Ctrl + Enter");
		if($scope.patient.pageDeepPositionIndex == 1){
			$scope.phOpenUpdateDialog($scope.workDoc.selectPrescribesHistoryIndex);
			changeSaveControl($scope, $http);
		}
	}
});
$scope.keys.push({ ctrlKey : true, code : KeyCodes.Way, action : function() {
	$scope.changeHourMoveWay();
}});
$scope.keys.push({ code : KeyCodes.Backspace, action : function() {deleteBackspace();}});
$scope.keys.push({ code : KeyCodes.Delete, action : function() {deleteBackspace();}});
deleteBackspace = function(){
	if($scope.workDoc.pageDeepPositionIndex == 1){
		deleteDay($scope.editedPrescribeHistory);
		changeSaveControl($scope, $http);
	}else
	if($scope.workDoc.pageDeepPositionIndex == 2){
		if($scope.editedPrescribeHistory.selectDrugIndex == -1){
			deleteAllDrugs();
		}else{
			deleteSelected($scope.editedPrescribeHistory.selectDrugIndex, $scope.editedPrescribeHistory);
		}
		changeSaveControl($scope, $http);
	}
}; 
deleteDrugInDrug = function($itemScope){
	var delDrugPosition = $itemScope.prescribeHistory.prescribes.tasks[$itemScope.taskInDayIndex].inlineDrugs.indexOf($itemScope.drugInline);
	$itemScope.prescribeHistory.prescribes.tasks[$itemScope.taskInDayIndex].inlineDrugs.splice(delDrugPosition, 1);
	changeSaveControl($scope, $http);
}; 
deleteSelected = function(taskIndex, prescribeHistory){
	var isMultipleSelect = false;
	for(var i=prescribeHistory.prescribes.tasks.length-1;i>=0;i--){
		if(prescribeHistory.prescribes.tasks[i] 
		&& prescribeHistory.prescribes.tasks[i].selectMultiple
		){
			prescribeHistory.prescribes.tasks.splice(i, 1);
			isMultipleSelect = true;
			changeSaveControl($scope, $http);
		}
	}
	if(!isMultipleSelect){
		prescribeHistory.prescribes.tasks.splice(taskIndex, 1);
		changeSaveControl($scope, $http);
	}
};

$scope.keys.push({ code : KeyCodes.F2,
	action : function() {
		console.log("F2 "+$scope.patient.pageDeepPositionIndex);
		if($scope.patient.pageDeepPositionIndex == 1){
			if($scope.patient.selectPrescribesHistoryIndex == -1){
				$scope.updatePatient();
			}else{
				$scope.phOpenUpdateDialog($scope.workDoc.selectPrescribesHistoryIndex);
			}
			changeSaveControl($scope, $http);
		}else
		if($scope.workDoc.pageDeepPositionIndex == 2){
			openEditedPrescribeDrugDialog();
		}
	}
});

isDrugEditDialogOpen = function(){
	if($scope.workDoc.selectPrescribesHistoryIndex < 0)
		return false;
	if(!$scope.editedPrescribeHistory.selectDrugIndex){
		$scope.editedPrescribeHistory.selectDrugIndex = 0;
	}
	var editDrugDialogOpen = 
		$scope.editedPrescribeHistory.tasksInDay 
		&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex]
		&& $scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed;
	return editDrugDialogOpen;
}

isEditDialogOpen = function(){
	var editDialogOpen = 
		false
		|| $scope.workDoc.patientUpdateOpen
		|| isDrugEditDialogOpen()
		;
	return editDialogOpen;
}

$scope.$on('keydown', function(msg, obj){
//	console.log(obj);
//	console.log(obj.event);
	var code = obj.event.keyCode;
	if(isEditDialogOpen()){
		if(code == $scope.keys[0].code){
			$scope.keys[0].action(); //make save (F4)
		}else
		if(code == $scope.keys[1].code){
			$scope.keys[1].action(); //make Escape
			$scope.$apply();
		}
		return;
	}
	var ctrlKey = obj.event.ctrlKey;
	var altKey = obj.event.altKey;
	var shiftKey = obj.event.shiftKey;
	$scope.keys.forEach(function(o) {
		if(o.code !== code) return;
		if((ctrlKey && !o.ctrlKey) || (o.ctrlKey && !ctrlKey)) return;
		if((altKey && !o.altKey) || (o.altKey && !altKey)) return;
		if((shiftKey && !o.shiftKey) || (o.shiftKey && !shiftKey)) return;
		o.action();
		$scope.$apply();
	});
});

//---------------------keydown-------------------------------END
//---------------------work with block-------------------------------

	$scope.addTaskToPrescribeHistoryEnd = function(drugPrescribeHistory, selectDrugIndex){
		var insertPosition = $scope.editedPrescribeHistory.prescribes.tasks.length;
		console.log(insertPosition);
		if(insertPosition > 0){
			while(insertPosition > 0 && ($scope.editedPrescribeHistory.prescribes.tasks[insertPosition] == null
					|| $scope.editedPrescribeHistory.prescribes.tasks[insertPosition].DRUG_NAME == "")){
				insertPosition--;
			}
			insertPosition++;
		}
		console.log(insertPosition);
		initEditedPrescribeDrugForEdit($scope.editedPrescribeHistory, insertPosition, $scope);
		addTaskToPrescribeHistoryInPosition(drugPrescribeHistory, selectDrugIndex, insertPosition);
	}
	$scope.addTaskToPrescribeHistory = function(drugPrescribeHistory, selectDrugIndex){
		addTaskToPrescribeHistoryInPosition(drugPrescribeHistory, selectDrugIndex, $scope.editedPrescribeHistory.selectDrugIndex);
	}

	addTaskToPrescribeHistoryInPosition = function(drugPrescribeHistory, selectDrugIndex, insertPosition){
		console.log(drugPrescribeHistory);
		var drug = drugPrescribeHistory.prescribes.tasks[selectDrugIndex];
		console.log(drug);
		if(false && drug.groupPosition >=0){
			if(drug.groupPosition > 0){
				selectDrugIndex -= drug.groupPosition;
				drug = drugPrescribeHistory.prescribes.tasks[selectDrugIndex];
			}
			attToFirstDrug(drug);
			$scope.editedPrescribeDrug.groupPosition = 0;
			var drugInGroupIndex = 0;
			while(drug && drug.groupPosition == drugInGroupIndex){
				drugInGroupIndex = drugInGroupIndex + 1;
				drug = drugPrescribeHistory.prescribes.tasks[selectDrugIndex + drugInGroupIndex];
				if(drug){
					insertDrugToTask(drug, insertPosition + drugInGroupIndex, $scope.editedPrescribeHistory);
				}
			}
			changeSaveControl($scope, $http);
		}else{
			attToFirstDrug(drug);
			changeSaveControl($scope, $http);
		}
	}

	attToFirstDrug = function(drug){
		$scope.editedPrescribeDrug.DRUG_ID= drug.DRUG_ID;
		$scope.editedPrescribeDrug.DRUG_NAME= drug.DRUG_NAME;
		$scope.editedPrescribeDrug.dose = drug.dose;
		$scope.editedPrescribeDrug.times = drug.times;
		$scope.editedPrescribeDrug.inlineDrugs = drug.inlineDrugs;
	}

//---------------------work with block-------------------------------END

}

initDeclarePrescribesCommon = function($scope, $http, $sce, $filter){

	$scope.readDbTagModel = function(){
		$http({ method : 'GET', url : config.urlPrefix + '/tagModel'
		}).success(function(data, status, headers, config) {
			console.log(data);
			$scope.tagModel = data;
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	};

	$scope.getMapKeys = function(map) {
		if(typeof map === 'undefined'){
			return null;
		}
		return Object.keys(map);
	}

	contextMenuCopy = function(copyObject, $http){
		$http({ method : 'POST', data : copyObject, url : config.urlPrefix + "/session/copy"
		}).success(function(data, status, headers, config){
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	};

	$scope.getLp24hourStr = function(dayHour){
		var lp24hour = getLp24hour(dayHour, $scope);
		return (lp24hour>9?'':'0')+lp24hour;
	}

	$scope.isMinusDrugInDrug = function(dayHourIndex, drugInline){
		var lp24hour = getLp24hour(dayHourIndex, $scope);
		if(!drugInline.times)
			return false;
		var isMinus = ('-' == drugInline.times.hours[lp24hour]);
		return isMinus;
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

	getTaskFromPrescribes = function($index, prescribeHistory){
		if(typeof prescribeHistory === 'undefined' 
			|| typeof prescribeHistory.prescribes === 'undefined' 
				|| $index >= prescribeHistory.prescribes.tasks.length
		) return ".";
		var drug = prescribeHistory.prescribes.tasks[$index];
		if(drug === null || drug.DRUG_NAME === "") return ".";
		return drug;
	}

	$scope.malProDay = function(taskInDayIndex, prescribeHistory){
		var drug = prescribeHistory.prescribes.tasks[taskInDayIndex];
		if(drug == null || drug.times == null) return;
		var donationMal = $filter('filter')(drug.times.hours, "-").length;
		return (donationMal).toString();
	}

	$scope.infusionSumme = function(taskInDayIndex, prescribeHistory){
		var drug = prescribeHistory.prescribes.tasks[taskInDayIndex];
		if(drug == null || drug.times == null) return;
		var dayMlSum = {
			diSum : 0,
			diPoSum : 0,
			diVvSum : 0
		}
		var ml = drug.dose.DOSE_UNIT;
		if("мл" === ml){
			var donationMal = $filter('filter')(drug.times.hours, "-").length;
			dayMlSum.diSum = drug.dose.DOSE_NUMBER*donationMal;
		}
		angular.forEach(drug.inlineDrugs, function(inlineDrug, idIndex){
			calcMl(inlineDrug, dayMlSum, $filter);
		})
		if(0 === dayMlSum.diSum || dayMlSum.diSum < 10)
			return;
		return (dayMlSum.diSum).toString();
	}
	calcMl = function(drug, dayMlSum, $filter){
		if(drug.dose){
			if("мл" === drug.dose.DOSE_UNIT){
				if(drug.times){
					var donationMal = $filter('filter')(drug.times.hours, "-").length;
					dayMlSum.diSum += drug.dose.DOSE_NUMBER*donationMal;
					if("п.о." === drug.dose.DOSE_ROUTE_OF_ADMINISTRATION){
						dayMlSum.diPoSum += drug.dose.DOSE_NUMBER*donationMal;
					}else
					if("в/в" === drug.dose.DOSE_ROUTE_OF_ADMINISTRATION){
						dayMlSum.diVvSum += drug.dose.DOSE_NUMBER*donationMal;
					}
				}
			}
		}
	};
	$scope.dayInfusionSumme = function(prescribeHistory){
		if(prescribeHistory.isCollapsed)
			return;
		var dayMlSum = {
			diSum : 0,
			diPoSum : 0,
			diVvSum : 0
		}
		angular.forEach(prescribeHistory.prescribes.tasks, function(drug, index){
			if(drug){
				calcMl(drug, dayMlSum, $filter);
				angular.forEach(drug.inlineDrugs, function(inlineDrug, idIndex){
					calcMl(inlineDrug, dayMlSum, $filter);
				})
			}
		} );
		dayMlSum.diSum = Math.round(dayMlSum.diSum/100)*100;
		dayMlSum.diPoSum = Math.round(dayMlSum.diPoSum/100)*100;
		dayMlSum.diVvSum = Math.round(dayMlSum.diVvSum/100)*100;
		var diPoSumHtml = " <sub>"+dayMlSum.diPoSum.toString()+"</sub>";
		var diVvSumHtml = " <sup>"+dayMlSum.diVvSum.toString()+"</sup>";
		var html = "≈" + (dayMlSum.diSum).toString() + " мл "+diVvSumHtml+"/"+diPoSumHtml;
		return $sce.trustAsHtml(html);
	}

	$scope.changeHourMoveWay = function(){
		$scope.hourMoveWay++;
		if($scope.hourMoveWay > 2) $scope.hourMoveWay = 0;
	}
	$scope.showHourMoveWay = function(){
		return $sce.trustAsHtml($scope.hoursMoveWays[$scope.hourMoveWay]);
	}
	$scope.taskAndHourDescription = function($index, prescribeHistory){
		var drug = getTaskFromPrescribes($index, prescribeHistory);
		if("." === drug) return drug;
		var td = $scope.drugDescription(drug);
		angular.forEach($filter('filter')(drug.times.hours, "-"), function(){
			td += " <i class='fa fa-minus'></i>";
		});
		td = "<span title ='" +$scope.drugHourDescription(drug) +"' >" + td +"</span>";
		return $sce.trustAsHtml( td );
	}
	$scope.taskDescription = function($index, prescribeHistory){
		var drug = getTaskFromPrescribes($index, prescribeHistory);
		if("." === drug) return drug;
		return $scope.drugDescription(drug);
	};
	$scope.drugDescription = function(drug){
		var taskDescription = drug.DRUG_NAME + " ";
		if(typeof drug.dose !== 'undefined'){
			if(drug.dose.DOSECONCENTRATON_NUMBER && !(drug.DRUG_NAME.indexOf("%") > 0)){
				taskDescription +=
					$sce.trustAsHtml( "<small>" + drug.dose.DOSECONCENTRATON_NUMBER+drug.dose.DOSECONCENTRATON_UNIT + "</small> ");
			}
			taskDescription += drug.dose.DOSE_NUMBER+" "+drug.dose.DOSE_UNIT;
			if(typeof drug.dose.DOSE_ROUTE_OF_ADMINISTRATION !== 'undefined'){
				taskDescription += " "+drug.dose.DOSE_ROUTE_OF_ADMINISTRATION;
			}
		}
		return taskDescription;
	}
	$scope.drugHourDescription = function(drug){
		var hoursStr = "(";
		var malProDay = 0;
		for(var h = $scope.dayStartHour; h < 24; h++){
			if(drug.times.hours[h]){
				hoursStr += h+",";
				malProDay++;
			}
		}
		for(var h = 0; h < $scope.dayStartHour; h++){
			if(drug.times.hours[h]){
				hoursStr += h+",";
				malProDay++;
			}
		}
		hoursStr = hoursStr.substring(0, hoursStr.length-1) ;
		hoursStr += " год.)";
		var drugHourDescriptionStr = malProDay +" в день " + hoursStr;
		return drugHourDescriptionStr;
	}

}

initDeclarePrescribesPrint = function($scope, $http, $sce, $filter){
	readPrescribes($scope, $http);
	initDeclarePrescribesCommon($scope, $http, $sce, $filter);
	$scope.tasksInDay = getTasksInDay($scope);
	$scope.dayHours = getDayHours();

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

changeWorkDocToSave = function($scope){
	var docToSave = angular.copy($scope.workDoc);
	$(docToSave.prescribesHistory).each(function () {
		this.tasksInDay = null;
	});
	docToSave.patientUpdateOpen = false;
	return docToSave;
}

saveWorkDoc = function(url, $scope, $http){
	var docToSave = changeWorkDocToSave($scope);
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
console.log($scope.numberOfChange);
return;

	if(($scope.numberOfChange - $scope.numberOfAutoSavedChange) >= $scope.autoSaveLimit){
		var docToSave = changeWorkDocToSave($scope);
		$http({ method : 'POST', data : docToSave, url : config.urlPrefix + "/autosave/patient"
		}).success(function(data, status, headers, config){
			initWorkDocument(data, $scope, $http);
			$scope.numberOfAutoSavedChange = $scope.numberOfChange;
		}).error(function(data, status, headers, config) {
			$scope.error = data;
		});
	}
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


getPrescribeIndex = function(prescribeHistory, $scope){ return $scope.workDoc.prescribesHistory.indexOf(prescribeHistory); }

setEditedPrescribeDrug = function(taskInDayIndex, $scope){
	$scope.editedPrescribeHistory.selectDrugIndex = taskInDayIndex;
	initEditedPrescribeDrug($scope);
}

closeEditedPrescribeDrugDialog = function($scope){
	if($scope.editedPrescribeHistory.selectDrugIndex = -1){
		$scope.editedPrescribeHistory.selectDrugIndex = 0;
	}
	$scope.editedPrescribeHistory.tasksInDay[$scope.editedPrescribeHistory.selectDrugIndex].isCollapsed = false;
}

escapeSelectMultiple = function(prescribeHistory){
	$(prescribeHistory.prescribes.tasks).each(function () {
		this.selectMultiple = false;
	});
	prescribeHistory.prescribes.selectMultiple = false;
}


//--------------patientLp24/prescribes24------------------------------END

getCookieCopyObject = function(){
	var copyObjectStr = getCookie("copyObject");
	return JSON.parse(copyObjectStr);
}

copyDrugDocument = function(drugDocument, $http, $filter){
	var copyObj = {};
	copyObj.drugDocument = drugDocument;
	contextMenuCopy(copyObj, $http);
}
copyCopyObject = function(taskIndex, prescribeHistory, $http, $filter){
	var copyObj = {};
	copyObj.tasks = [];
	if(taskIndex == null){
		var tasksToCopy = $filter('filter')
			(prescribeHistory.prescribes.tasks, {selectMultiple:true});
		copyObj.tasks = tasksToCopy;
	}else if(taskIndex == -1){
		copyObj.tasks = prescribeHistory.prescribes.tasks;
	}else{
		var drug = prescribeHistory.prescribes.tasks[taskIndex];
		if(drug.groupPosition == 0){
			var drugInGroupIndex = 0;
			while(drug && drug.groupPosition == drugInGroupIndex){
				copyObj.tasks.push(drug);
				drugInGroupIndex = drugInGroupIndex + 1;
				drug = prescribeHistory.prescribes.tasks[taskIndex + drugInGroupIndex];
			}
		}else if(drug.groupPosition > 0){
			var drugToCopy = angular.copy(drug);
			drugToCopy.groupPosition = null;
			copyObj.tasks.push(drugToCopy);
		}else{
			copyObj.tasks.push(drug);
		}
	}
	contextMenuCopy(copyObj, $http);
}

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

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

Date.prototype.getMMMMUa = function (){
	return this.getMonthUa(this.getMonth());
}
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
readPrescribes = function($scope, $http){
	var urlStr;
	if(parameters.pid){
		urlStr = '/read/patient_'+parameters.pid;
	}else{
		urlStr = '/read/prescribe_'+parameters.id;
	}
	$http({ method : 'GET', url : urlStr
	}).success(function(data, status, headers, config) {
		$scope.patient = data;
		$scope.prescribeHistory = data.prescribesHistory[parameters.phi];
		$scope.prescribes = $scope.prescribeHistory.prescribes;
	}).error(function(data, status, headers, config) {
	});
}

getTasksInDay = function($scope){
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

initDeclarePrescribes = function($scope, $http, $sce){
	readPrescribes($scope, $http);
	getTasksInDay($scope);
	$scope.dayHours = getDayHours();

	$scope.taskDescription = function($index){
		if(typeof $scope.prescribes === 'undefined') return;
		if($index >= $scope.prescribes.tasks.length) return ".";
		var drug = $scope.prescribes.tasks[$index];
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

	$scope.getLp24hourStr = function(dayHour){
		var lp24hour = getLp24hour(dayHour, $scope);
		return (lp24hour>9?'':'0')+lp24hour;
	}

	$scope.isMinus = function(taskInDayIndex, $index){
		if(!$scope.prescribes || !$scope.prescribes.tasks[taskInDayIndex]
		|| !$scope.prescribes.tasks[taskInDayIndex].times
		)
			return false;
		var lp24hour = getLp24hour($index, $scope);
		var isMinus = ('-' == $scope.prescribes.tasks[taskInDayIndex].times.hours[lp24hour]);
		return isMinus;
	}
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
		console.log($scope.drug1sList);
	}).error(function(data, status, headers, config) {
	});
}

var autoSaveLimit = 5;
changeSaveControl = function($scope, $http){
	$scope.numberOfChange++;
	console.log($scope.numberOfChange+"/"+$scope.numberOfAutoSavedChange);
	if(($scope.numberOfChange - $scope.numberOfAutoSavedChange) >= autoSaveLimit){
		console.log("-------------");
		var docToSave = cangePatientDocToSave($scope);
		$http({
			method : 'POST',
			data : docToSave,
			url : config.urlPrefix + "/autosave/patient"
		}).success(function(data, status, headers, config){
			console.log("numberOfAutoSavedChange = "+$scope.numberOfAutoSavedChange);
			$scope.numberOfAutoSavedChange = $scope.numberOfChange;
			console.log("numberOfAutoSavedChange = "+$scope.numberOfAutoSavedChange);
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
	var hour =  getLp24hour(dayHourIndex);
	if(!$scope.editedPrescribeDrug.times.hours[hour]){
		$scope.editedPrescribeDrug.times.hours[hour] = "-";
	}else{
		$scope.editedPrescribeDrug.times.hours[hour] = null;
	}
	changeSaveControl($scope, $http);
};

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

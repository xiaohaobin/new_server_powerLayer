try{
	// 默认变量sss
	var sysID = 28939;
	var bTicketSystemEnabled = '1';
	var bIsMobile = '';
// Info
	var sCookieDate = '2019-04-23';
	var sDate = '2019-04-23';
	
	var lastData = '2019-04-23',
		aLimitDate = lastData.split('-'),
		oLimitDate = new Date(Date.UTC(aLimitDate[0], aLimitDate[1] - 2, 1, 12, 0, 0)),
		sLimitDate = oLimitDate.toISOString().substring(0, 10);
	
	var bNoData = false;
	
	var sBackgroundImg = false;
	
	// 功能开关
	var bTicketSystemEnabled = '1';
	var bChannelInfoEnabled = '';
	var sunNormal = '1';
	var iPeakPower = 1880;
	var iLowTraffic = '';
	var iInverterSystem = '';
	var bSendUrgentFlagCnf = '1';
	var bIsMobile = '';
	var bTigoBoost = '';
	var bIsTigoUser = '';
	var bZendeskTicket = '';
	var bOemTicket = '1';
	var iIsBasicPackage = 0;
	
	// Translations
	var aTranslationStrings = [];
	aTranslationStrings[0] = "Channel information not available";
	aTranslationStrings[1] = "Lifetime production";
	aTranslationStrings[2] = "Lifetime";
	aTranslationStrings[3] = "Daily production";
	var translationTonnes = "tonnes";
	
	var lang_url = '/base/main/summary?sysid=28939';
		// 默认变量eee




/**
 * 系统时间格式转化为 hh-mm-ss时间格式
 * @param {String} dt 系统时间格式时间
 * */
function nowtime2(dt) {
	return(
		(dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
		":" +
		(dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) 
	);
}

/**
 * 以几分钟为间隔，获取两个时间范围内的所有时间点，返回数组
 * @param {String} startDate 开始时间（yyyy-mm-dd hh:mm:ss）
 * @param {String} endDate 结束时间（yyyy-mm-dd hh:mm:ss）
 * @param {Number} space 时间间隔（单位分钟），默认间隔30分钟
 * @param {Boolean} isReverse 时间点是否从结束时间开始计算返回，如true，则倒叙，否则或者不传为正序
 * */
function getDateArr(startDate, endDate, space, isReverse){				
	if(!startDate || !endDate){
		alert('时间参数缺省');
		return;
	}
	var _startDate = new Date(startDate);
	var _endDate = new Date(endDate);

	if(!space) {
		space = 30 * 60 * 1000;
	} else {
		space = space * 60 * 1000;
	}
	var endTime = _endDate.getTime();
	var startTime = _startDate.getTime();
	var mod = endTime - startTime;				

	if(mod <= space) {
		return;
		alert("时间太短");
	}
	var dateArray = [];				
	if(isReverse){
		//倒叙插入
		while(mod - space >= space) {
			var d = new Date();
			d.setTime(endTime - space);
			dateArray.push(d);
			mod = mod - space;
			endTime = endTime - space;
		}
	}else{
		//正序插入
		while(mod >= space) {
			var d = new Date();
			d.setTime(startTime + space);
			dateArray.push(d);
			mod = mod - space;
			startTime = startTime + space;
		}					
	}				
	dateArray.reverse();
	var aRes = [];
	for(var i = dateArray.length - 1; i >= 0; i--) {					
		aRes.push(nowtime2(dateArray[i]));
	}
	aRes.unshift('00:00');
	
	var _oDateArr = [];
	for(var i=0,len=aRes.length;i<len;i++){
		_oDateArr.push({"d":[],"t":aRes[i]});
	}
	return _oDateArr;
}

var _aDateArr = getDateArr("2015-04-15 00:00:00","2015-04-15 23:59:00", 1);

var Tigo = Tigo || {};

(function(window, $) {
	Tigo = {
		summary: {
			constants: { //Constants
				min_rssi: 50,
				max_rssi: 210,
				max_temp: 80,
				w_panel: 49,
				h_panel: 70,
				w_inverter: 80,
				h_inverter: 25,
				margin: 100,
				sun_hidden_angle: 15,
				sun_visible_angle: 150,
				color_highlight: '#D1D1D1'
			}
		}
	};
})(window, jQuery);

//Variables
var configuration,
	panelData = [],
	calendarData,
	aScreenConfiguration = [],
	configLoaded = false,
	dataLoaded = false,
	dataProcessed = false,
	calendarLoaded = false,
	iDelayLoad = 0,
	aHash = [],
	aSliderMap = [],
	aChannels = [],
	aDeselectedChannels = [],
	iLastDataPoint,
	curr_pos = 0,
	zoom = 1,
	lastZoom = 1,
	iLTCornerX = 0,
	iLTCornerY = 0, //coordinates of Left Top corner of viewport in current translation
	aViewportSize,
	aScreenCorners,
	initialize = true,
	canvasHeight,
	canvasWidth,
	iLastMouseOn,
	iCurrentDataset,
	sView = 'physical',
	bDisplayLifetime = false,
	hasUnderlayImg = false,
	underlayImgX,
	underlayImgY,
	underlayImg,
	imagesToLoad = 0,
	aElectricalLines = [],
	resetZoom = false,
	refresh = false,
	sDataType = 'pin',
	max_vin,
	max_vout,
	max_reclaimed,
	sunrise,
	sunset,
	iSunriseMinutes,
	iSunsetMinutes,
	light,
	dark,
	iLightMinutes,
	iDarkMinutes,
	iLightInSpan,
	iLightOutSpan,
	iLightFullInMinutes,
	iLightFullOutMinutes,
	aSunCoordinates,
	oActiveElem = false,
	dataToLoad = 0,
	isWidgetLoading = false,
	bPlayback,
	stopAnimationOnLastFrame = true,
	fMinZoom = 0.01,
	fMaxZoom = 2,
	bDisplayRepeaters = false,
	iMaxDayPower,
	totalEnergy = 0,
	dailyEnergy = [],
	bgImg,
	dataAjaxRequest,
	bUpdatedByTimer = false,
	bSendUrgentFlag = true,
	iMonthsInRow = 4,
	calendarMaxGrade = 200,
	iTigoBoost = 0;

///////////////////////////////

$(window).resize(function() {
	var mainHeight = $('.main_container').height();
	var contentHeight = mainHeight - 87;
	$('#content_top').height(contentHeight);
});

$(document).ready(function() {
	var	$canvasHolder = $(document.getElementById('canvasHolder')),
		$wideTimePlayer = $(document.getElementById('wide_time_player')),
		$playButton = $('.tp_playImg'),
		$tpPlay = $('.tp_play'),
		$tpPrevMin = $('.tp_prevMin'),
		$tpPrevMinImg = $('.tp_prevMinImg'),
		$tpNextMin = $('.tp_nextMin'),
		$tpNextMinImg = $('.tp_nextMinImg');

	
	if (bIsMobile) {
		iMonthsInRow = 3;
	}

	var mainHeight = $('.main_container').height(),
		contentHeight = mainHeight - 87;
	$('#content_top').height(contentHeight);

	var spriteImage = new Image();
	spriteImage.src = (typeof sSkinSpriteImg === 'undefined') ? 'img/summary_sprite4.png' :
		sSkinSpriteImg;
	imagesToLoad++;
	spriteImage.onload = function() {
		imagesToLoad--;
		gateDraw();
	};

	var mainCanvas = document.getElementById('mainCanvas'),
		ctx = mainCanvas.getContext('2d'),
		sunCanvas = document.getElementById('sunCanvas'),
		sunCtx = sunCanvas.getContext('2d'),

		aViewportSize = {
			x: canvasWidth,
			y: canvasHeight
		};

	

	

	var reloadTime = 3600000, // 3600000 equals 1 hour
		reloadTimer = setTimeout(function() {
			bUpdatedByTimer = true;
			reload();
		}, reloadTime);

	/////////////////////////主循环//////////////////////

	initialCalcs();
	loadBackground();
	loadConfig();
	checkSavedDate();
	if (!bNoData) {
		displayDay(sDate, bSendUrgentFlagCnf);
	} else {
		$('.toolbar_section').hide();
		$('.toolbar').css('background-color', '#eee');
		$wideTimePlayer.hide();
	}

	////////////////////////////////////////////////////////
	function checkSavedDate() {
		if (sCookieDate) {
			sDate = sCookieDate;
		} else {
			setCurrentDate(sDate);
		}
	}

	function initialCalcs() {
		iLTCornerX = 0;
		iLTCornerY = 0;
		canvasHeight = $canvasHolder.height();
		canvasWidth = $canvasHolder.width();
		aScreenCorners = getScreenCorners();
		mainCanvas.width = canvasWidth;
		mainCanvas.height = canvasHeight;
		sunCanvas.width = canvasWidth;
		sunCanvas.height = canvasHeight;
	}

	function displayDay(date, isInit) {
		
		if (!bSendUrgentFlagCnf) {
			isInit = false;
		}
		dataLoaded = false;
		bPlayback = false;

		var ld = new Date(lastData);
		var dd = new Date(date);

		if (dd > ld) date = lastData;
		sDate = date;


		$('.date').text(date);
		var a = date.split('-');
		var day = parseFloat(a[2]);
		loadData(date, isInit);
	}

	function setDateBounds(dateToDisplay) {
		if (dataLoaded && calendarLoaded) {
			var firstDate = calendarData[0][0];
			if (iIsBasicPackage && firstDate < sLimitDate) {
				firstDate = sLimitDate;
			}
		}
	}

	function showBackground() {
		if (sBackgroundImg && bgImg) {
			processBackground();
		}
	}

	function processBackground() {
		var height = bgImg.height,
			width = bgImg.width,
			fPicRatio = height / width,
			fCanvRatio = canvasHeight / canvasWidth,
			drawHeight, drawWidth, x, y;
		if (fPicRatio > fCanvRatio) {
			drawHeight = canvasHeight;
			drawWidth = (canvasHeight / height) * width;
			y = 0;
			x = (canvasWidth - drawWidth) / 2;
		} else {
			drawWidth = canvasWidth;
			drawHeight = (canvasWidth / width) * height;
			x = 0;
			y = (canvasHeight - drawHeight) / 2;
		}
	}

	/////////////////////////Loading Functions/////////////////////////

	function loadBackground() {
		if (sBackgroundImg) {
			bgImg = new Image();
			bgImg.src = sBackgroundImg;

			bgImg.onload = function() {
				processBackground();
			};

			bgImg.onerror = function() {
				sBackgroundImg = false;
				bgImg = null;
			}
		}
	}

	function addCommas(nStr) {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	function formatEnergy(energy) {
		if (!isNaN(energy)) {
			if (energy < 1000) {
				energy = addCommas(energy.toFixed(2)) + ' kWh';
			} else if (energy < 10000) {
				energy = addCommas(energy.toFixed(2)) + ' kWh';
			} else if (energy < 100000) {
				energy = addCommas((energy / 1000).toFixed(2)) + ' MWh';
			} else {
				energy = addCommas((energy / 1000).toFixed(2)) + ' MWh';
			}
		} else {
			energy = '---';
		}

		return energy;
	}

	

	function loadConfig() {
		configLoaded = false;
		$.ajax({
			type:"get",
			url: 'json/config.json',
			dataType: 'json',
			success: function(objects) {
				console.log(objects,"config.json");
				try {
					configLoaded = true;
					configuration = objects;
					if (typeof(configuration) !== 'object') {
						throw 'config_common_error';
					}
					processData();
					if (bNoData) {
						aHash[sDataType] = createHash();
					}
				} catch (err) {
				}
			},
			error: function() {
				configLoaded = false;
			}
		});
	}

	function loadData(date, isInit) {
		function gateProcessData() {
			dataLoaded = true;
			if (dataToLoad === 0) {
				processData();
				setDateBounds(date);
			}
		}

		var ajaxDataLoader = function() {

			dataAjaxRequest = $.ajax({
				url: 'json/data.json',
				dataType: 'json',
				type:"get",
				cache: false,
				success: function(data) {
					data.dataset[0].data = _aDateArr;
					try {
						dataToLoad--;
						console.log(date,'date');
						panelData[0] = date;
						if (data.dataset[0].data[0].t == "") {
//							$disabledOverlay.hide();
						}
						panelData[1]['pin'] = data;
						sunrise = data.sunrise;
						sunset = data.sunset;
						light = data.light;
						dark = data.dark;
						gateProcessData();
						refresh = false;
					} catch (err) {
						refresh = false;
						dataLoaded = false;
					}
				},
				error: function() {
					if (dataAjaxRequest.isAborted) {
						return;
					}
					refresh = false;
					dataLoaded = false;
				}
			});
		};

		dataToLoad = 0;
		if (panelData[0] !== date || refresh) {
			panelData[1] = [];
			dataToLoad++;
			if (typeof(isInit) !== 'undefined' && isInit == true) {
				dataAjaxRequest = $.ajax({
					url: 'json/urgent.json',
					dataType: 'json',
					cache: false,
					type:"get",
					success: function(data) {
						console.log(data,'urgent.json');
						if (typeof data.lastData !== 'undefined' && data.lastData != false) { // reset date if latest
							sDate = date = lastData = data.lastData;
							$('.date').text(date);
							var a = date.split('-');
							var day = parseFloat(a[2]);
						}
					},
					complete: function(data) {
						ajaxDataLoader();
					}
				});
			} else {
				ajaxDataLoader();
			}
		}

		if (sDataType !== 'pin' && !panelData[1][sDataType]) {
			dataToLoad++;
			var sLoadDataType = sDataType;
			if (sDataType == 'iin') {
				sLoadDataType = 'vin';
			}
			var sCurrentlyLoading = sDataType;

			dataAjaxRequest = $.ajax({
				url: '/base/main/summary/data?sysid=' + sysID + '&date=' + date + '&temp=' + sLoadDataType,
				dataType: 'json',
				cache: false,
				success: function(data) {
					try {
						dataToLoad--;
						panelData[0] = date;
						
						panelData[1][sCurrentlyLoading] = data;
						if (sDataType === 'vin') {
							max_vin = findMaxDataValue(data);
							if (max_vin < 20) {
								max_vin = 20;
							}
						}
						if (sDataType === 'vout') {
							max_vout = findMaxDataValue(data);
							if (max_vout < 20) {
								max_vout = 20;
							}
						}
						if (sDataType === 'reclaimed') {
							max_reclaimed = findMaxDataValue(data);
						}
						gateProcessData();
					} catch (err) {
						dataLoaded = false;
					}
				},
				error: function() {
					if (dataAjaxRequest.isAborted) {
						return;
					}
					dataLoaded = false;
				}
			});
		} else if (panelData[1][sDataType]) {
			gateProcessData();
		}
	}

	
	function findMaxDataValue(data) {
		var max = 0;
		for (var i = 0; i < data.dataset.length; i++) {
			var panels = [];
			for (var n = 0; n < data.dataset[i].order.length; n++) {
				var id = data.dataset[i].order[n];
				var confIndex = aHash['pin'].id2pos[id];
				if (typeof(confIndex) !== 'undefined') {
					var type = configuration[confIndex].type;
					if (type === 2) {
						panels.push(n);
					}
				}
			}

			for (var j = 0; j < data.dataset[i].data.length; j++) {
				var d = data.dataset[i].data[j].d;
				for (var m = 0; m < panels.length; m++) {
					if (max < d[panels[m]]) max = d[panels[m]];
				}
			}
		}
		return max;
	}

	function processData() {
		if (configLoaded && dataLoaded) {
			iSunriseMinutes = (sunrise * 60) >> 0;
			iSunsetMinutes = (sunset * 60) >> 0;
			iLightMinutes = (light * 60) >> 0;
			iDarkMinutes = (dark * 60) >> 0;
			iLightInSpan = iSunriseMinutes - iLightMinutes;
			iLightOutSpan = iDarkMinutes - iSunsetMinutes;
			iLightFullInMinutes = iSunriseMinutes + iLightInSpan;
			iLightFullOutMinutes = iSunsetMinutes - iLightOutSpan;

			function addLeadingZeroMinutes(min) {
				if (min < 10) min = '0' + min;
				return min;
			}

			var hr = sunrise >> 0;
			var min = addLeadingZeroMinutes(iSunriseMinutes % 60);
			$('#sunrise_indicator').text(hr + ':' + min);
			hr = sunset >> 0;
			min = addLeadingZeroMinutes(iSunsetMinutes % 60);
			$('#sunset_indicator').text(hr + ':' + min);

			var iNumObjects = configuration.length;
			aHash[sDataType] = createHash();
			aSliderMap = createSliderMap(); //for the cases when there were header changes, and therefore data is broken into datasets
			iLastDataPoint = aSliderMap[aSliderMap.length - 1] - 1;
			if (sView === "electrical") {
				modifiedCoord = calculateModifiedCoordinatesElectrical();
			} else if (sView === "block") {
				modifiedCoord = calculateModifiedCoordinatesBlock();
			}
			if (refresh) {
				curr_pos = iLastDataPoint;
			}
			if (initialize) {
				curr_pos = iLastDataPoint;
				initialize = false;
			}
			

			dataProcessed = true;
			gateDraw(); //检查是否所有内容都已加载并绘制屏幕
		}
	}

	
	///////////////////////////哈希表的功能//////////////////////

	
	function createHash() {
		var hashed = {
			lines: [],
			panels: [],
			panels_nd: [],
			other: [],
			id2pos: [],
			id2datapos: [],
			conf2datapos: [],
			repeaters: [],
			estimated: []
		};
		var aRepeaters = [];
		if (!bNoData) {
			var panelDataLength = panelData[1][sDataType].dataset.length;
		} else {
			panelDataLength = 1;
		}
		var cl = configuration.length,
			id;
		for (var i = 0; i < panelDataLength; i++) {
			hashed.panels[i] = [];
			hashed.panels_nd[i] = [];
			hashed.id2datapos[i] = [];
			hashed.conf2datapos[i] = [];
		}
		for (var i = 0; i < cl; i++) {
			var panel_found = false;
			//object id
			id = configuration[i].id;
			//object id to index
			hashed.id2pos[id] = i;

			if (configuration[i].type === 10) {
				hashed.lines.push(i);
			} else if (configuration[i].type === 23) {
				imagesToLoad++;
				underlayImg = new Image();
				underlayImg.src = '/base/' + configuration[i].path;
				underlayImg.onload = function() {
					imagesToLoad--;
					gateDraw();
				};
				hasUnderlayImg = true;
				underlayImgX = configuration[i].X;
				underlayImgY = configuration[i].Y;
			} else {
				//panels
				if (configuration[i].type === 2) {
					if (typeof(configuration[i].channel) !== 'undefined' && $.inArray(configuration[i].channel, aChannels) === -1) {
						aChannels.push(configuration[i].channel);
					}
					if (configuration[i].repeater && $.inArray(configuration[i].repeater, aRepeaters) === -1) {
						hashed.repeaters.push([i, configuration[i].repeater]);
					}
				}

				for (var j = 0; j < panelDataLength; j++) {
					var objExists = (panelData.length > 0 && $.inArray(id, panelData[1][sDataType].dataset[j].order) !== -1);
					var isProductionEnergyMeter = (configuration[i].type == 15);
					if (!bNoData && (objExists || isProductionEnergyMeter)) {
						var pos = $.inArray(id, panelData[1][sDataType].dataset[j].order);
						hashed.panels[j].push([i, pos]); //配置中的位置，数据对象中的位置
						hashed.conf2datapos[j][i] = pos;
						panel_found = true;
						hashed.id2datapos[j][id] = pos;
					} else if (configuration[i].type === 2) {
						hashed.panels_nd[j].push(i);
						panel_found = true;
					}
				}
				if (!panel_found) {
					hashed.other.push(i);
				}
			}
		}
		for (var i = 0; i < hashed.repeaters.length; i++) { //用配置索引替换中继器的对象id
			iObjId = hashed.repeaters[i][1];
			iRepeaterIndex = hashed.id2pos[iObjId];
			hashed.repeaters[i][1] = iRepeaterIndex;
		}
		aChannels.sort();
		return hashed;
	}

	//获取太阳动画运动的最小值和最大值
	function createSliderMap() {
		var slMap = [0],
			summ = 0,
			numDatasets = panelData[1][sDataType].dataset.length;
		for (var i = 0; i < numDatasets; i++) {
			summ += panelData[1][sDataType].dataset[i].data.length;
			slMap.push(summ);
		}
		// console.log(slMap,'最大最小值');
		return slMap;
	}

	function calculateModifiedCoordinatesBlock() {
		var modifiedCoord = [],
			otherMembers = [],
			inverters = [];
		var panels = 0;

		for (var i = 0; i < aHash[sDataType].panels.length; i++) {
			if (panels < aHash[sDataType].panels[i].length) panels = aHash[sDataType].panels[i].length;
		}

		var x = aViewportSize.x - Tigo.summary.constants.w_inverter - 100;
		var y = aViewportSize.y;

		var max = (x / (Tigo.summary.constants.w_panel + 10)) * ((y - 200) / (Tigo.summary.constants.h_panel + 10)); //-200来补偿setInitialZoom中的额外填充
		var requiredZoom = Math.sqrt(max / panels);
		var iXLimit = x / requiredZoom;

		var xpos = 0,
			ypos = 0;
		var xstep = Tigo.summary.constants.w_panel + 10;
		var ystep = Tigo.summary.constants.h_panel + 20;

		for (var i = 0; i < configuration.length; i++) {
			var type = configuration[i].type;
			if (type === 4) {
				inverters.push(i);
				var stringIds = configuration[i].children;
				for (var j in stringIds) {
					var stringPos = aHash[sDataType].id2pos[stringIds[j]];
					if (configuration[stringPos].type === 3) {
						var panelIds = configuration[stringPos].children;

						for (var k in panelIds) {
							var panelPos = aHash[sDataType].id2pos[panelIds[k]];
							if (configuration[panelPos].type === 2) {
								modifiedCoord[panelPos] = {
									x: xpos,
									y: ypos
								};
								xpos += xstep;
								if (xpos > iXLimit) {
									xpos = 0;
									ypos += ystep;
								}
							}
						}
					}
				}
			} else if (type === 1) {
				var powerFactoryIndex = i;
			} else if (type !== 4 && type !== 2 && type !== 1 && type !== 10 && type !== 11 && type !== 6) {
				otherMembers.push(i);
			}
		}

		var ypos_inv = 0;
		for (var i = 0; i < inverters.length; i++) {
			modifiedCoord[inverters[i]] = {
				x: (iXLimit + 50),
				y: ypos_inv
			};
			ypos_inv += Tigo.summary.constants.h_inverter + 20;
		}

		for (var i = 0; i < otherMembers.length; i++) {
			if (configuration[otherMembers[i]].V === 'false') {
				continue;
			}
			modifiedCoord[otherMembers[i]] = {
				x: xpos,
				y: ypos + 120
			};
			xpos += 150;
			if (xpos > iXLimit) {
				xpos = 0;
				ypos += ystep;
			}
		}

		return modifiedCoord;
	}

	function calculateModifiedCoordinatesElectrical() {
		var modifiedCoord = [],
			xpos, ypos = 0,
			xstep = 60,
			ystep = 100,
			xpos_max = 0;
		var inverters = [],
			lines = [],
			otherMembers = [];
		for (var i = 0; i < configuration.length; i++) {
			var type = configuration[i].type;
			if (type === 4) {
				inverters.push([i, ypos]);
				var stringIds = configuration[i].children;
				for (var j in stringIds) {
					var stringPos = aHash[sDataType].id2pos[stringIds[j]];
					if (configuration[stringPos].type === 3) {
						var panelIds = configuration[stringPos].children;
						xpos = 0;
						lines.push(ypos);

						for (var k in panelIds) {
							var panelPos = aHash[sDataType].id2pos[panelIds[k]];
							if (configuration[panelPos].type === 2) {
								modifiedCoord[panelPos] = {
									x: xpos,
									y: ypos
								};
								xpos += xstep;
							}
						}
						if (xpos > xpos_max) xpos_max = xpos;
						ypos += ystep;
					}
				}
			} else if (type === 1) {
				var powerFactoryIndex = i;
			} else if (type !== 4 && type !== 2 && type !== 1 && type !== 10 && type !== 11 && type !== 6) {
				otherMembers.push(i);
			}
		}
		for (var i = 0; i < inverters.length; i++) {
			modifiedCoord[inverters[i][0]] = {
				x: xpos_max + 20,
				y: inverters[i][1] + (Tigo.summary.constants.h_panel - Tigo.summary.constants.h_inverter) / 2
			};
		}
		xpos = 30;
		for (var i = 0; i < otherMembers.length; i++) {
			if (configuration[otherMembers[i]].V === 'false') {
				continue;
			}
			modifiedCoord[otherMembers[i]] = {
				x: xpos,
				y: ypos + 120
			};
			xpos += 150;
		}
		modifiedCoord[powerFactoryIndex] = {
			x: xpos_max - 50,
			y: ypos + 50
		};
		for (var i = 0; i < lines.length; i++) {
			var line = {};
			line.X1 = 0;
			line.X2 = xpos_max + 20 + Tigo.summary.constants.w_inverter / 2;
			line.Y1 = lines[i] + Tigo.summary.constants.h_panel / 2;
			line.Y2 = line.Y1;
			aElectricalLines[i] = line;
		}
		var line1 = {};
		line1.X1 = xpos_max + 20 + Tigo.summary.constants.w_inverter / 2;
		line1.X2 = line1.X1;
		line1.Y1 = Tigo.summary.constants.h_panel / 2;
		line1.Y2 = ypos + 50;
		aElectricalLines.push(line1);
		var line2 = {};
		line2.X1 = line1.X1;
		line2.X2 = line1.X1 - 50;
		line2.Y1 = line1.Y2;
		line2.Y2 = line1.Y2;
		aElectricalLines.push(line2);

		return modifiedCoord;
	}

	///////////////////////////////////////////////////////////////////

	
	////////////////////////屏幕上的计算///////////////////////

	function getScreenCorners() {
		aViewportSize = getViewportSize();
		var LX = iLTCornerX - Tigo.summary.constants.margin;
		var LY = iLTCornerY - Tigo.summary.constants.margin;
		var UX = iLTCornerX + Math.ceil(aViewportSize.x) + Tigo.summary.constants.margin;
		var UY = iLTCornerY + Math.ceil(aViewportSize.y) + Tigo.summary.constants.margin;
		return {
			'lx': LX,
			'ly': LY,
			'ux': UX,
			'uy': UY
		};
	}

	function getViewportSize() {
		var viewport = [];
		viewport['x'] = canvasWidth / zoom;
		viewport['y'] = canvasHeight / zoom;
		return viewport;
	}
	
	/**
	 * 获取当前现实时间的时分数据，并且转化为0到1439的值
	 * @param {String} currHM 当前时分
	 * return {Number}
	 * */
	function getTimeTransformVal(currHM){
		if(currHM){
			var _HM = currHM;
		}else{
			var oTime = new Date();
			var _hours =oTime.getHours();
			var _minutus =oTime.getMinutes();
			if(_hours*1 < 10) _hours = "0"+_hours; 
			if(_minutus*1 < 10) _minutus = "0"+_minutus; 
			var _HM = _hours + ":" + _minutus;
		}
		
		var TimeTransformVal = null;
		for(var i=0,len=_aDateArr.length;i<len;i++){
			if(_HM == _aDateArr[i].t){
				TimeTransformVal = i;
				break;
			}
		}
		return TimeTransformVal;
	}
	//console.log(getTimeTransformVal(),'当前时分进度值');
	////////////////////////////Draw Functions/////////////////////////

	function getSunCoordinates(position) {
		var aSunCoordinates = false;
		if (position > iSunriseMinutes && position < iSunsetMinutes) {
			var radius = canvasWidth / 2 - 200;
			var adjustedPos = position - iSunriseMinutes;
			var span = iSunsetMinutes - iSunriseMinutes;

			var angle = Tigo.summary.constants.sun_hidden_angle + (adjustedPos * Tigo.summary.constants.sun_visible_angle) /
				span;
			if (sunNormal) angle = 180 - angle;
			angle = angle * Math.PI / 180;

			var x = Math.cos(angle) * radius + canvasWidth / 2 - 40; //40 = 80/2来补偿图像的宽度
			var y = radius - Math.sin(angle) * radius + 35;
			aSunCoordinates = [x, y];
		}
		return aSunCoordinates;
	}

	function getOverlayOpacity(position) {
		var opacity;
		if (position >= iLightFullInMinutes && position <= iLightFullOutMinutes) opacity = 0;
		else if (position > iLightMinutes && position < iLightFullInMinutes) {
			var adjustedPos = position - iLightMinutes;
			opacity = 1 - adjustedPos / (2 * iLightInSpan);
		} else if (position > iLightFullOutMinutes && position < iDarkMinutes) {
			var adjustedPos = position - iLightFullOutMinutes;
			opacity = adjustedPos / (2 * iLightOutSpan);
		} else if (position <= iLightMinutes || position >= iDarkMinutes) opacity = 1;
		return opacity;
	}

	function gateDraw() {
		console.log('chushihua:',curr_pos,iLastDataPoint)
		if (!imagesToLoad && !dataToLoad && dataProcessed) {
			if (iLastDataPoint < curr_pos) curr_pos = iLastDataPoint;
			
			curr_pos = getTimeTransformVal();
			draw(curr_pos, true, true);
		}
	}

	var currentPoint, adjustedPos, n, iPrevDataset;
	var multipleCurrentPoint;
	iPrevDataset = -1;

	/**
	 * 拖拽太阳动画，重新定义太阳的位置，背景颜色，播放器进度等参数
	 * @param {Number} nPos 播放器进度值 （目前最大1127）
	 * @param {Boolean} recalculateScreen
	 * @param {Boolean} initial
	 * */
	function draw(nPos, recalculateScreen, initial) {
		console.log('draw函数',nPos, recalculateScreen, initial);
		ctx.clearRect(iLTCornerX, iLTCornerY, aViewportSize.x, aViewportSize.y);
		
		n = 0;
	
		while (aSliderMap[n] <= nPos) {
			n++; //which dataset is current
		}

		iCurrentDataset = n - 1;
		if (iCurrentDataset !== iPrevDataset) {
			iPrevDataset = iCurrentDataset;
			recalculateScreen = true;
		}

		adjustedPos = nPos - aSliderMap[iCurrentDataset]; //in current dataset

		if (sDataType == 'iin') {
			currentPoint = panelData[1]['pin'].dataset[iCurrentDataset].data[adjustedPos];
			multipleCurrentPoint = panelData[1]['iin'].dataset[iCurrentDataset].data[adjustedPos];
		} else {
			currentPoint = panelData[1][sDataType].dataset[iCurrentDataset].data[adjustedPos];
		}

		if (!recalculateScreen || initial) {
			sunCtx.clearRect(0, 0, canvasWidth, canvasHeight);
			if (!sBackgroundImg) {
				var skyGrdLight = ctx.createLinearGradient(0, 0, 0, 300);
				skyGrdLight.addColorStop(0, 'rgb(109,153,203)');
				skyGrdLight.addColorStop(1, 'rgba(255,255,255,0)');
				console.log(skyGrdLight,111111);
				sunCtx.fillStyle = skyGrdLight;
				sunCtx.fillRect(0, 0, canvasWidth, 300);
				var iOpacity = getOverlayOpacity(nPos);
				var skyGrdDark = ctx.createLinearGradient(0, 0, 0, 300);
				skyGrdDark.addColorStop(0, 'rgba(0,0,0,' + iOpacity + ')');
				skyGrdDark.addColorStop(0.2, 'rgba(3,23,46,' + iOpacity + ')');
				skyGrdDark.addColorStop(1, 'rgba(255,255,255,0)');
				sunCtx.fillStyle = skyGrdDark;
				sunCtx.fillRect(0, 0, canvasWidth, 300);
			}

			aSunCoordinates = getSunCoordinates(nPos);
			if (aSunCoordinates) {
				sunCtx.drawImage(spriteImage, 223, 1, 80, 80, aSunCoordinates[0], aSunCoordinates[1], 80, 80);
			}
		}

		if (hasUnderlayImg) {
			ctx.drawImage(underlayImg, underlayImgX, underlayImgY);
		}

	
		drawPanels(nPos, recalculateScreen);

		
		$('.sTimeSlider').slider('value', nPos);
		console.log('init..............',nPos)
	}

	
	
	
	//拖动太阳动画，返回时间等参数
	function drawPanels(nPos, recalculateScreen) {
		aHash[sDataType].estimated = [];

		ctx.font = "18px sans-serif";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.strokeStyle = "rgb(99,99,99)";
		ctx.lineWidth = 1;

		$('.time').text(currentPoint.t);
		console.log(currentPoint.t,"时间");
		var iNoDataPanels = aHash[sDataType].panels_nd[iCurrentDataset].length,
			pl, i, confIndex, visible, objIndex, x, y, type, dr, object,
			sColor, value, maxPower, percent, startColor, endColor, aColor, colorValue, r, g, b, sTextColor,
			rotation;

		if (recalculateScreen) {
			pl = aHash[sDataType].panels[iCurrentDataset].length;
			aScreenConfiguration = [];
		} else {
			pl = aScreenConfiguration.length;
		}

		for (i = 0; i < pl; i++) {
			if (recalculateScreen) {
				confIndex = aHash[sDataType].panels[iCurrentDataset][i][0];

				visible = configuration[confIndex].V;
				if (visible === "false") {
					continue;
				}
				objIndex = aHash[sDataType].panels[iCurrentDataset][i][1];

				if (sView === "electrical" || sView === "block") {
					x = modifiedCoord[confIndex].x;
					y = modifiedCoord[confIndex].y;
				} else {
					x = configuration[confIndex].X;
					y = configuration[confIndex].Y;
				}

				if (x >= aScreenCorners.lx && x <= aScreenCorners.ux && y >= aScreenCorners.ly && y <= aScreenCorners.uy) {
					aScreenConfiguration.push(confIndex);
				} else {
					continue;
				}
			} else {
				confIndex = aScreenConfiguration[i];
				visible = configuration[confIndex].V;
				if (visible === "false") continue;
				objIndex = aHash[sDataType].conf2datapos[iCurrentDataset][confIndex];
				if (sView === "electrical" || sView === "block") {
					x = modifiedCoord[confIndex].x;
					y = modifiedCoord[confIndex].y;
				} else {
					x = configuration[confIndex].X;
					y = configuration[confIndex].Y;
				}
			}

			object = configuration[confIndex];
			type = configuration[confIndex].type;
			dr = configuration[confIndex].DR;
			if (sDataType === 'rssi' && type === 2 && $.inArray(configuration[confIndex].channel, aDeselectedChannels) !== -1) {
				sColor = "rgb(225,225,225)";
				value = false;
			} else {
				value = getPanelValue(objIndex, dr, confIndex);
				if (typeof(value) === "number") {
					sTextColor = "rgb(255,255,255)";
					switch (sDataType) {
						case 'pin':
							maxPower = configuration[confIndex].MP;
							/**
							 * 设置面板的默认最大功率
							 */
							if (maxPower == '' || maxPower == undefined) {
								if (type == 2) {
									maxPower = 230;
								} else {
									maxPower = value * 10;
								}
							}
							percent = value / maxPower;
							startColor = [0, 0, 0];
							endColor = (typeof powerColor === 'undefined') ? [0, 255, 0] : powerColor;
							aColor = gradientColor(startColor, endColor, percent);
							sColor = "rgb(" + aColor[0] + "," + aColor[1] + "," + aColor[2] + ")";
							break;
						case 'reclaimed':
							percent = value / max_reclaimed;
							startColor = [30, 56, 78];
							endColor = [0, 255, 0];
							aColor = gradientColor(startColor, endColor, percent);
							sColor = "rgb(" + aColor[0] + "," + aColor[1] + "," + aColor[2] + ")";
							break;
						case 'rssi':
							colorValue = ((value - Tigo.summary.constants.min_rssi) * 255 / (Tigo.summary.constants.max_rssi - Tigo.summary
								.constants.min_rssi)) >> 0;
							if (colorValue < 0) colorValue = 0;
							if (colorValue > 255) colorValue = 255;
							sColor = "rgb(0,0," + colorValue + ")";
							break;
						case 'pwm':
							sColor = "rgb(" + ((value / 2) >> 0) + ",0," + value + ")";
							break;
						case 'temp':
							colorValue = (value * 1023 / Tigo.summary.constants.max_temp) >> 0;
							if (colorValue < 0) colorValue = 0;
							if (colorValue > 1023) colorValue = 1023;
							if (colorValue < 256) {
								b = 255;
								g = colorValue;
								r = 0;
							} else if (colorValue < 768) {
								b = (383 - (colorValue / 2) >> 0), g = 255, r = ((colorValue / 2) >> 0 - 128);
							} else {
								b = 0, g = 1023 - colorValue, r = 255;
							}

							sColor = "rgb(" + r + "," + g + "," + b + ")";
							sTextColor = "rgb(" + (255 - r) + "," + (255 - g) + "," + (255 - b) + ")";
							break;
						case 'vin':
							colorValue = (value * 255 / max_vin) >> 0;
							sColor = "rgb(" + colorValue + "," + ((colorValue / 2) >> 0) + ",0)";
							break;
						case 'vout':
							colorValue = (value * 255 / max_vout) >> 0;
							sColor = "rgb(" + colorValue + "," + ((colorValue / 2) >> 0) + ",0)";
							break;
						case 'iin':
							colorValue = (value * 255 / 5) >> 0;
							sColor = "rgb(" + colorValue + ",0,60)";
							break;
					}
				} else sColor = "rgb(128,128,128)";
			}

			var unitLabel = '';

		}

	}

	

	/**
	 * 从同一字符串中的活动面板中获取平均值
	 */
	function getAverageByParent(object) {
		var iParentId = object.parent,
			iParentIndex = aHash[sDataType].id2pos[iParentId],
			aPanels = configuration[iParentIndex].children,
			dAvg, dSum = 0,
			iCounter = 0,
			i;

		for (i in aPanels) {
			var val = currentPoint.d[aHash[sDataType].id2datapos[iCurrentDataset][aPanels[i]]];
			if (typeof(val) === 'number') {
				iCounter++;

				if (sDataType == 'iin' && typeof(multipleCurrentPoint.d[aHash[sDataType].id2datapos[iCurrentDataset][aPanels[i]]]) ===
					"number") {
					dSum += val / multipleCurrentPoint.d[aHash[sDataType].id2datapos[iCurrentDataset][aPanels[i]]];
				} else {
					dSum += val;
				}
			}
		}

		dAvg = (dSum / iCounter);
		if (sDataType == 'iin') {
			dAvg = (((dAvg * 10) + 0.5) >> 0) / 10;
		} else {
			dAvg = dAvg >> 0;
		}
		if (dAvg > 0) {
			return {
				'value': dAvg,
				'panels_num': aPanels.length - iCounter
			};
		}

		return false;
	}

	

	function getPanelValue(objIndex, dr, confIndex) {
		var value;

		if (typeof(currentPoint.d[objIndex]) === "number") {
			if (sDataType == 'iin' && configuration[confIndex].type == 2) {
				if (typeof(multipleCurrentPoint.d[objIndex]) === "number") {
					value = ((((currentPoint.d[objIndex] / multipleCurrentPoint.d[objIndex]) * 10) + 0.5) >> 0) / 10;
				} else {
					value = false;
				}
			} else {
				value = currentPoint.d[objIndex];
			}
		
		} else {
			value = false;
			var object = configuration[confIndex],
				avgVal = false;

			if (dr) {
				var ii = 1,
					dataset = iCurrentDataset,
					tobjIndex = objIndex,
					objId = object.id,
					tval = currentPoint.d[objIndex],
					tpos = adjustedPos - 1;

				if (tval !== undefined && sDataType == 'reclaimed') {
					tval = parseFloat(currentPoint.d[objIndex]);
					if (isNaN(tval)) {
						tval = undefined;
					}
				}

				while ((typeof(tval) !== "number") && ii <= dr) {
					if (tpos === -1) {
						dataset--;
						if (dataset < 0) break;
						tpos = panelData[1][sDataType].dataset[dataset].data.length - 1;
						if (typeof(aHash[sDataType].id2datapos[dataset][objId]) !== 'undefined') {
							tobjIndex = aHash[sDataType].id2datapos[dataset][objId];
						} else break;
					}
					if (sDataType == 'iin' && configuration[confIndex].type == 2) {
						if (typeof(panelData[1]['iin'].dataset[dataset].data[tpos].d[tobjIndex]) === "number") {
							tval = ((((panelData[1]['pin'].dataset[dataset].data[tpos].d[tobjIndex] / panelData[1]['iin'].dataset[dataset]
								.data[tpos].d[tobjIndex]) * 10) + 0.5) >> 0) / 10;
						} else {
							tval = false;
						}
					} else if (sDataType == 'reclaimed') {
						tval = panelData[1][sDataType].dataset[dataset].data[tpos].d[tobjIndex];
						if (typeof(tval) === "string") {
							tval = parseFloat(tval);
						}
					} else {
						tval = panelData[1][sDataType].dataset[dataset].data[tpos].d[tobjIndex];
					}
					tpos--;
					ii++;
				}

				/**
				 * 我们不使用简单的DR(数据重复)功能，而是使用字符串中的avarage
				 */
				if (typeof(tval) === "number") {
					value = tval;
					if (object.type == 2) {
						avgVal = getAverageByParent(object);
						if (avgVal !== false) {
							value = avgVal.value;
						}
					}
				}

				if (sDataType == 'reclaimed' && isNaN(value)) {
					value = '-.-';
				}
			}
		}

		return value;
	}

	function getChildren(object, idToExclude) {
		var children = [];
		if (!idToExclude || object.id != idToExclude) {
			if (object.children) {
				for (var j = 0; j < object.children.length; j++) {
					var obj = configuration[(aHash[sDataType].id2pos[object.children[j]])];
					if (obj) {
						var c = getChildren(obj, idToExclude);
						if (c) children = children.concat(c);
					}
				}
			} else {
				children.push(object.id)
			}
			return children;
		}
	}

	/////////////////////////////////////////
	//播放器滚动动画
	$(".sTimeSlider").slider({
		min: 0,
		max: 1439,
		slide: function(event, ui) {
			 console.log('播放器滚动');
			resetPlayback();
			curr_pos = ui.value;//播放器
			if (curr_pos > iLastDataPoint) {
				curr_pos = iLastDataPoint;
				var eod = true;
			}
			if (curr_pos <= 0) {
				curr_pos = 0;
			}

			draw(curr_pos, false);
			if (eod) {
				return false;
			}
		},
		change: (typeof showNewFeatureCallout == "function") ? showNewFeatureCallout : null,
	});

	////////////////////////画布转换函数/////////////////////

	////拖动画布
	var mousedown = false,
		sunDrag = false,
		px, py,
		iDiff,
		detectSunDrag = function(e) {
			mousedown = true;

			if (typeof(e.gesture) !== 'undefined' && e.type === 'dragstart') {
				px = e.gesture.center.pageX;
				py = e.gesture.center.pageY;
			} else {
				px = e.pageX;
				py = e.pageY;
			}

			//检查太阳是否被拖拽
			var container = document.getElementById('mc'),
				adjustedX = px - container.offsetLeft - 8,
				adjustedY = py - container.offsetTop - 38;

			if (!bNoData && adjustedX > (aSunCoordinates[0] + 15) && adjustedX < (aSunCoordinates[0] + 65) && adjustedY > (
					aSunCoordinates[1] + 15) && adjustedY < (aSunCoordinates[1] + 65)) {
				sunDrag = true;
				iDiff = adjustedX - (aSunCoordinates[0] + 40); //40 to middle of sun
			}
		},
		resetDragParams = function(e) {
			mousedown = false;
			sunDrag = false;
		},
		drag = function(e) {
			if (mousedown && !sunDrag) {
				if (typeof(e.gesture) !== 'undefined' && e.type === 'drag') {
					px1 = e.gesture.center.pageX;
					py1 = e.gesture.center.pageY;
				} else {
					px1 = e.pageX;
					py1 = e.pageY;
				}
				tpx = px1 - px;
				tpy = py1 - py;
				px = px1;
				py = py1;
				aScreenCorners = getScreenCorners();
				if (!bNoData) {
					draw(curr_pos, true);
				} 
			} else if (mousedown) {
				var container = document.getElementById('mc');
				var adjustedX;
				if (typeof(e.gesture) !== 'undefined' && e.type === 'drag') {
					adjustedX = e.gesture.center.pageX - container.offsetLeft - 8;
				} else {
					adjustedX = e.pageX - container.offsetLeft - 8;
				}
				adjustedX -= iDiff;
				if (adjustedX > 200 && adjustedX < (canvasWidth - 200)) {
					adjustedX -= canvasWidth / 2;
					var span = (sunset - sunrise) * 60 >> 0;
					var radius = canvasWidth / 2 - 200;
					var angle = Math.acos(adjustedX / radius);
					angle = 180 * angle / Math.PI;
					if (sunNormal) angle = 180 - angle;
					var adjPos = ((angle - Tigo.summary.constants.sun_hidden_angle) * span) / (180 - 2 * Tigo.summary.constants.sun_hidden_angle);
					curr_pos = adjPos + (sunrise * 60) >> 0;
					if (curr_pos > iLastDataPoint) curr_pos = iLastDataPoint;
					if (curr_pos <= 0) curr_pos = 0;

					draw(curr_pos, false);
				}
			}
		};




	//////////////////////时间运动函数/////////////////////////
	var play,
		playFunction = function(e) {
			if (typeof panelData[1][sDataType].dataset === 'undefined') return;
			if (panelData[1][sDataType].dataset[0].data[0].t === '') return;

			bPlayback = bPlayback ? false : true;
			if (bPlayback) {
				if (curr_pos >= iLastDataPoint) curr_pos = 0;
				play = setInterval(function() {
					NextFrame()
				}, 50);
				$playButton.addClass('pause').removeClass('play');
			} else {
				clearInterval(play);
				$playButton.addClass('play').removeClass('pause');
			}
		};
	$tpPlay.on('click', playFunction);

	function NextFrame() {
		curr_pos++;
		if (curr_pos >= iLastDataPoint) {
			if (stopAnimationOnLastFrame) {
				bPlayback = false;
				clearInterval(play);
				$playButton.addClass('play').removeClass('pause');
				draw(iLastDataPoint, false);
				return;
			}
			curr_pos = 0
		}
		draw(curr_pos, false);
	}

	function shiftDate(days) {
		var firstDate = calendarData[0][0];
		if (iIsBasicPackage && firstDate < sLimitDate) {
			firstDate = sLimitDate;
		}

		if (sDate === lastData && days > 0) return false;
		if (sDate === firstDate && days < 0) return false;

		if (typeof dataAjaxRequest !== 'undefinded') {
			dataAjaxRequest.isAborted = true;
			dataAjaxRequest.abort();
		}

		resetPlayback();
		var newDate = new Date(sDate.replace(/-/g, "/"));
		newDate.setDate(newDate.getDate() + days);
		var c_month = newDate.getMonth() + 1;
		if (c_month < 10) c_month = '0' + c_month;
		var c_date = newDate.getDate();
		if (c_date < 10) c_date = '0' + c_date;
		sDate = newDate.getFullYear() + '-' + c_month + '-' + c_date;
		setCurrentDate(sDate); //设置日期cookie
		displayDay(sDate);
	}

	function resetPlayback() {
		clearInterval(play);
		$playButton.addClass('play').removeClass('pause');
		bPlayback = false;
	}

	function shiftMinute(min) {
		resetPlayback();
		curr_pos = curr_pos + min;
		if (curr_pos >= iLastDataPoint) curr_pos = iLastDataPoint;
		if (curr_pos <= 0) curr_pos = 0;
		draw(curr_pos, false);
	}

	var prevDateHandler = function(e) {
			shiftDate(-1);
		},
		nextDateHandler = function(e) {
			shiftDate(1);
		},
		nextMinuteHandler = function(e) {
			shiftMinute(1);
		},
		prevMinuteHandler = function(e) {
			shiftMinute(-1);
		};

	$tpNextMin.on('click', nextMinuteHandler);
	$tpPrevMin.on('click', prevMinuteHandler);

	//////////////////////////////////////////////////////////////////

	function reload(reloadDate) {
		reloadDate = typeof reloadDate !== 'undefined' ? reloadDate : null;
		clearTimeout(reloadTimer);
		refresh = true;
		bSendUrgentFlag = true;

		if (bUpdatedByTimer == true) {
			bSendUrgentFlag = false;
			bUpdatedByTimer = false;
		}

		//设置日期cookie
		if (reloadDate == null) {
			if (typeof lastData !== 'undefined') {
				setCurrentDate(lastData);
			} else {
				setCurrentDate(sDate);
			}
		} else {
			setCurrentDate(reloadDate);
		}

		 loadConfig();
		if (reloadDate == null) {
			if (typeof lastData !== 'undefined') {
				displayDay(lastData, bSendUrgentFlag);
			} else {
				displayDay(sDate, bSendUrgentFlag);
			}
		} else {
			displayDay(reloadDate, bSendUrgentFlag);
		}
		reloadTimer = setTimeout(function() {
			bUpdatedByTimer = true;
			reload();
		}, reloadTime);
	}

	var refreshHandler = function(e) {
		console.log(lastData);
		reload(lastData);
	};
	$('.refresh').on('click', refreshHandler);

	///////////////////////////视觉效果////////////////////////

	$wideTimePlayer.find('.refresh_icon').hover(function() {
		$(this).addClass('active');
	}, function() {
		$(this).removeClass('active');
	});
	$wideTimePlayer.find('.datepicker').hover(function() {
		var color = (typeof skin_color === 'undefined') ? '#54b948' : skin_color;
		$(this).css('color', color);
	}, function() {
		$(this).css('color', '#636466');
	});


	$tpPrevMin.hover(function() {
		$tpPrevMinImg.addClass('active');
	}, function() {
		$tpPrevMinImg.removeClass('active');
	});
	$tpNextMin.hover(function() {
		$tpNextMinImg.addClass('active');
	}, function() {
		$tpNextMinImg.removeClass('active');
	});
	$tpPlay.hover(function() {
		$playButton.addClass('active');
	}, function() {
		$playButton.removeClass('active');
	});

	///////////////////////  Window Resize  ///////////////////////////
	$(window).resize(function() {
		initialCalcs();
		showBackground();

		if (!bNoData) {
			draw(curr_pos, true, true);
		} 
		//TODO:setInitial zoom? fMinZoom adjustment
	});

	//////////////////////鼠标移动-弹出并突出显示////////////////////////



	var mouseX, mouseY, bFound, objectIndex;	

	var ticketPopupTimeout;

	

	$('.wtp_time_ctrl').on('mousedown', function(e) {
		if (e.which === 3 && bTicketSystemEnabled) {
			$(this).bind("contextmenu", function(e) {
				return false;
			});
			$('#timestamp').html(sDate + ' ' + currentPoint.t);
		}
	});

	
	

	function getParentInverterIndex(iConfIndex) {
		var type;
		while ((!type || type !== 4) && configuration[iConfIndex]) {
			var iParentId = configuration[iConfIndex].parent;
			if (iParentId == -1) break;
			iConfIndex = aHash[sDataType].id2pos[iParentId];
			type = configuration[iConfIndex].type;
		}
		if (type === 4) return iConfIndex;
		else return false;
	}


	/////////////////////其他事件处理程序////////////////////


	

	var bNoticeActive = false;

	
	function gradientColor(startColor, endColor, percent) {
		var newColor = [];
		for (var i = 0; i < 3; i++) {
			newColor[i] = startColor[i] + parseInt(percent * (endColor[i] - startColor[i]));
		}
		return newColor;
	}

	/**
	 * //////////////////////////////////////// 触摸事件处理程序 ///////////////////////////////////////
	 */
	if (bIsMobile) {

		var windowWidth, timer;
			
		
		/**
		 * 要在进行拖拽/滑动操作时改善用户体验，应该防止浏览器滚动。
		 */
		$(window).hammer().on('drag swipe', function(e) {
			e.gesture.preventDefault();
		});

		

		var startX, startY;

		/**
		 * 用户界面事件处理程序
		 */
		$tpPrevMin.off('click');
		$tpNextMin.off('click');

		$tpPlay.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('touch', playFunction);

		$tpPrevMin.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('touch', prevMinuteHandler);
		$tpPrevMin.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('hold', function() {
			timer = setInterval(prevMinuteHandler, 100);
		});
		$tpPrevMin.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('release', function() {
			clearInterval(timer)
		});
		$('.switch_icon.clock').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('touch', prevMinuteHandler);
		$('.switch_icon.clock').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('hold', function() {
			timer = setInterval(prevMinuteHandler, 100);
		});
		$('.switch_icon.clock').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('release', function() {
			clearInterval(timer)
		});

		$tpNextMin.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('touch', nextMinuteHandler);
		$tpNextMin.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('hold', function() {
			timer = setInterval(nextMinuteHandler, 100);
		});
		$tpNextMin.hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('release', function() {
			clearInterval(timer)
		});
		$('.time').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('touch', nextMinuteHandler);
		$('.time').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('hold', function() {
			timer = setInterval(nextMinuteHandler, 100);
		});
		$('.time').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('release', function() {
			clearInterval(timer)
		});

		$('.refresh').hammer({
			prevent_mouseevents: true,
			prevent_default: true
		}).on('touch', refreshHandler);
		$('#calendar').hammer({
			prevent_mouseevents: false,
			prevent_default: false
		}).on('drag', function(e) {
			var currentOffset = parseInt($('#calendar').css('top')),
				offset = currentOffset + e.gesture.deltaY / 10,
				pages = Math.ceil(iNumberOfMonths / iMonthsInRow) - 3,
				maxOffset = -pages * 191,
				sliderValue = 0;

			if (offset < maxOffset) offset = maxOffset;
			else if (offset >= 0) offset = 0;

			sliderValue = calendarMaxGrade * (1 - offset / maxOffset);
			$('#calendar').clearQueue().css('top', offset);
			$("#calendar_slider").slider('value', sliderValue);
		});
	}

	/**
	 * //////////////////////////////////////// 结束触摸事件处理程序 ///////////////////////////////////////
	 */
});

/////////////////////Cookies//////////////////////////////


function setCurrentDate(dt) {
	createCookie('currdate', dt + '|' + sysID, 0.2);
}

function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else var expires = "";
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}
}catch(e){
	//TODO handle the exception
	console.log(e,21)
}
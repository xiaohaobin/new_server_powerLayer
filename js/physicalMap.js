try{
	// 默认变量sss
	
	
	
// Info
	var sCookieDate = '2019-09-23';
	var sDate = '2019-08-23';
	
	var lastData = $.getYesterdayDate(),//昨天的时间
		aLimitDate = lastData.split('-'),
		oLimitDate = new Date(Date.UTC(aLimitDate[0], aLimitDate[1] - 2, 1, 12, 0, 0)),
		sLimitDate = oLimitDate.toISOString().substring(0, 10);
	
	var bNoData = false;
	
	var sBackgroundImg = false;
	
	// 功能开关
	
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

//==================================================================================================================以上变量未知===================================================================================
//初始化日期，播放器系统，以及初始化播放器需要的数据===========================================================================================================================================
	//highcharts对象
	var panel_day_chart = null;	
	//初始数据
	var panel_day_data = new Array(1440);
	var updateSpeed = 0;
	
	//初始化日期
	initLaydate("#datePicker_hours", 1, function(a, b) {
		console.log(a, b);
		reloadPlayer(a);
	});	
	
	
	//模拟数据（某一整天的数据）
	var _aDateArr = oComFn.getDateArr(getDateVal()+" 00:00:00",getDateVal()+" 23:59:00", 1);
	_aDateArr = randomLoad(_aDateArr);
	
	console.log(_aDateArr,"模拟数据");
	
	//初始化第一个数据
	panel_day_data[0] = _aDateArr[0].panelPower;
	//加载图表
	CurpowerChart(panel_day_data,getDateVal());
	
	//模拟数据-随机加载
	function randomLoad(_aDateArr){
		for(var ran=0,len=_aDateArr.length;ran<len;ran++){
			_aDateArr[ran].panelPower = $.randNum(1, 100);
		}
		return _aDateArr;
	}
	
	//获取日期选择器的时间
	function getDateVal(){
		return $("#datePicker_hours").val();		
	}
	
	//播放器的图表
	function CurpowerChart(mainData,sTime) {	
		//配置
		var chart_confing = {
				credits: { //禁用版权信息
					enabled: false
				},
				chart: {
					backgroundColor: 'none',
					marginBottom: 20,
					zoomType: 'xy',
				},
				title: null,
				xAxis:{
					// categories: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
					// 	'11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'
					// ],
					type: 'datetime',
					dateTimeLabelFormats: {
						day: '%H:%M' //时分写法
					},
					
				},
				yAxis: {
		　　　　　　　 tickWidth:0,//去掉刻度
					gridLineWidth: 0,//去掉y轴方向的横线
					labels: {
						enabled: false
					},//去掉刻度数字
					title: {
						text: ''
					}
				},
				plotOptions: {
					series: {
						animation: {
							duration: 2000,
							easing: 'easeOutBounce'
						},
						fillOpacity: 0.09,
						lineWidth: 1,
						marker: {
							enabled: false
						} //关掉实心点
					},
					show:false,
				},
				tooltip: {
				    formatter: function (p) {
						return $.UTC_to_CTime(this.x) + ': ' + this.y + 'kwh';
				    }
				},
				series: [
					{
						type: 'areaspline',
						name: "发电量",
						data: mainData,
						color: '#009cff',
						// pointStart: Date.UTC(2010, 0, 1,0,0),//没有固定的x轴数据，便以时间为准，该参数标识从2010-1-1 00:00开始
						pointStart:oComFn.get_UTC_nTime(sTime),
						pointInterval: 60 * 1000 // 1分钟的进度
					}, 
					
				],
				
				lang: {
					noData: '亲,暂无数据哦...',
					// noData: '',
				},
				noData: {
					style: {
						fontWeight: 'bold',
						fontSize: '16px',
						color: '#504AC3'
					}
				}
			};
		panel_day_chart = Highcharts.chart('panelChartBox_content', chart_confing);//id写法,单个		
	}




//用模拟数据更新播放器y轴数据（递增刻度）
function updatePlayChartData(){
	if(updateSpeed > 1440) return;
	updateSpeed++;
	panel_day_data.splice(updateSpeed,1,_aDateArr[updateSpeed].panelPower);
	//更新播放器图表数据
	console.log("递增1最新数据",panel_day_data);
	panel_day_chart.series[0].setData(panel_day_data);
	
	// console.log(panel_day_data,"播放器数据")
}

//用模拟数据更新播放器y轴数据（递减刻度）
function dec_updatePlayChartData(){
	if(updateSpeed === 0) return;
	panel_day_data.splice(updateSpeed,1,null);
	console.log("递减1最新数据",panel_day_data);
	panel_day_chart.series[0].setData(panel_day_data);
	updateSpeed--;
}

//根据数字大范围修改
function Large_update(){
	//curr_pos,updateSpeed,_aDateArr
	var arr = new Array(1440);
	for(var i=0;i<curr_pos;i++){
		arr.splice(i,1,_aDateArr[i].panelPower)
	}	
	arr.splice(curr_pos,1,_aDateArr[curr_pos].panelPower);
	panel_day_data = arr;
	panel_day_chart.series[0].setData(panel_day_data);
	updateSpeed = curr_pos;
	console.log("大量更新",panel_day_data);
	//console.log(updateSpeed,"大范围改变");
}



/**
	 * 重新加载播放器数据
	 * @param {String} sTime yyyy-mm-dd年月日时间格式
	 * */
	function reloadPlayer(sTime){
		//_aDateArr = randomLoad(_aDateArr);
		
		//先暂停播放
		_stopPlayFn(function(){
			//遍历删除原来图表数据
			for(var i=0;i<curr_pos;i++){
				panel_day_data.splice(i, 1, null);
			}
			var mainData = new Array(1440);
			mainData[0] = _aDateArr[0].panelPower;
			//更新图表主要数据
			panel_day_chart.update({
				series: [{
						type: 'areaspline',
						name: "发电量",
						data: mainData,
						color: '#009cff',
						pointStart:oComFn.get_UTC_nTime(sTime),
						pointInterval: 60 * 1000 // 1分钟的进度
					},
				]
			});
			
			//进度变0，回到初始刻度
			backFirstPos(function(){
				//开始播放
				 // _startPlayFn();
				 playFunction();
			});
		});
	}

	//进度变0，回到初始刻度
	function backFirstPos(callback){
		updateSpeed = 0;
		curr_pos = 0;
		$('.sTimeSlider').slider('value', 0);
		if(callback) callback();
	}
	//暂停播放器
	function _stopPlayFn(callback){
		bPlayback = false;
		clearInterval(play);
		$(".tp_playImg").addClass('play').removeClass('pause');
		if(callback) callback();
	}	
	//开始播放
	function _startPlayFn(){
		bPlayback = true;
		$(".tp_playImg").removeClass('play').addClass('pause');
		setTimeout(playFunction,100);
	}











//以下是太阳系统的业务逻辑=====================================================================================================================================================================================


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
	curr_pos = 0,//播放器进度点
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
	iTigoBoost = 0,
	
	play = null,//播放器定时器对象
	slide_play_speed = 500, //运动速度
	playFunction = null;

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

	//显示太阳播放器相关函数
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
		// return false;
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
				// console.log(objects,"config.json");
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
	//加载播放器图表数据
	function loadData(date, isInit) {
		// console.error(isInit)
		// layer.msg(date + "," + isInit);
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
						// console.log(date,'date');
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
						// console.log(data,'urgent.json');
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
		// console.log('当前时间',TimeTransformVal,_HM)
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

	//初始化刻度时间
	function gateDraw() {
		// console.log('chushihua:',curr_pos,iLastDataPoint)
		if (!imagesToLoad && !dataToLoad && dataProcessed) {
			if (iLastDataPoint < curr_pos) curr_pos = iLastDataPoint;
			
			curr_pos = getTimeTransformVal("00:00");
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
			//存储太阳动画画布宽高
			localStorage.setItem("sunCanvasW",canvasWidth);
			localStorage.setItem("sunCanvasH",canvasHeight);
			sunCtx.clearRect(0, 0, canvasWidth, canvasHeight);
			if (!sBackgroundImg) {
				var skyGrdLight = ctx.createLinearGradient(0, 0, 0, 300);
				skyGrdLight.addColorStop(0, 'rgb(109,153,203)');
				skyGrdLight.addColorStop(1, 'rgba(255,255,255,0)');
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
		
		//更新svg优化器布局动画的数据
		if(vueApp != null){
			// vueApp.updateDataFn(site_data_update_random(site_data.inverter));
			vueApp.updateDataFn(_aDateArr[nPos].inverter);
		}
		
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
		console.log(currentPoint.t,"时间",slide_play_speed);
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
				// value = getPanelValue(objIndex, dr, confIndex);
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
		return;
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
		max: 1440,
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
			
			//大范围递增递减修改数据，播放后退和前进
			Large_update();
			
			
		},
		change: (typeof showNewFeatureCallout == "function") ? showNewFeatureCallout : null,
		end:function(){
			console.log("滑动结束",curr_pos);
		}
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
	
		playFunction = function() {
			if (typeof panelData[1][sDataType].dataset === 'undefined') return;
			if (panelData[1][sDataType].dataset[0].data[0].t === '') return;

			bPlayback = bPlayback ? false : true;
			if (bPlayback) {
				if (curr_pos >= iLastDataPoint) curr_pos = 0;
				play = setInterval(function() {
					NextFrame();//递增时间刻度
					
					//更新播放器x和y轴数据
					updatePlayChartData();					
					console.log(curr_pos,"刻度点")
					
					
					
				}, slide_play_speed);
				$playButton.addClass('pause').removeClass('play');
			} else {
				clearInterval(play);
				$playButton.addClass('play').removeClass('pause');
			}
		};
	$tpPlay.on('click', playFunction);
	
	//切换播放器播放速度
	$(".speedBox>div").on("click",function(){
		$(this).addClass("mainColor").removeClass("c_gray").siblings().addClass("c_gray").removeClass("mainColor");
		
		if($(this).hasClass("constant_speed")){
			slide_play_speed = 500;
		}else{
			slide_play_speed = 100;
		}
		
		if(bPlayback){			
			$tpPlay.click();
			$tpPlay.click();
		}
	});
	

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
			//curr_pos刻度点  递增
			updatePlayChartData();
		},
		prevMinuteHandler = function(e) {
			shiftMinute(-1);
			dec_updatePlayChartData();
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
		 //111
		// loadConfig();
		if (reloadDate == null) {
			if (typeof lastData !== 'undefined') {
				displayDay(lastData, bSendUrgentFlag);
			} else {
				displayDay(sDate, bSendUrgentFlag);
			}
		} else {
			//222
			displayDay(reloadDate, bSendUrgentFlag);
		}
		reloadTimer = setTimeout(function() {
			bUpdatedByTimer = true;
			reload();
		}, reloadTime);
	}

	var refreshHandler = function(e) {
		console.log(lastData);
		//初始化为第一个刻度的数据
		panel_day_data = new Array(1440);
		panel_day_data[0] =  _aDateArr[0].panelPower;
		panel_day_chart.series[0].setData(panel_day_data);
		$('.sTimeSlider').slider('value', 0);
		curr_pos = 0;
		updateSpeed = 0;
		
		//面板布局的数据设置为第一个刻度的
		if(vueApp != null){
			vueApp.updateDataFn(_aDateArr[curr_pos].inverter);
		}
		
		setTimeout(function(){
			$(".wtp_time_ctrl .time").text("00:00");
			$tpPlay.click();
			$tpPlay.click();
		},200);
	
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
// 	
// 	if (bIsMobile) {
// 
// 		var windowWidth, timer;
// 		
// 		$(window).hammer().on('drag swipe', function(e) {
// 			e.gesture.preventDefault();
// 		});
// 
// 		
// 
// 		var startX, startY;
// 
// 		$tpPrevMin.off('click');
// 		$tpNextMin.off('click');
// 
// 		$tpPlay.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('touch', playFunction);
// 
// 		$tpPrevMin.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('touch', prevMinuteHandler);
// 		$tpPrevMin.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('hold', function() {
// 			timer = setInterval(prevMinuteHandler, 100);
// 		});
// 		$tpPrevMin.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('release', function() {
// 			clearInterval(timer)
// 		});
// 		$('.switch_icon.clock').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('touch', prevMinuteHandler);
// 		$('.switch_icon.clock').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('hold', function() {
// 			timer = setInterval(prevMinuteHandler, 100);
// 		});
// 		$('.switch_icon.clock').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('release', function() {
// 			clearInterval(timer)
// 		});
// 
// 		$tpNextMin.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('touch', nextMinuteHandler);
// 		$tpNextMin.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('hold', function() {
// 			timer = setInterval(nextMinuteHandler, 100);
// 		});
// 		$tpNextMin.hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('release', function() {
// 			clearInterval(timer)
// 		});
// 		$('.time').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('touch', nextMinuteHandler);
// 		$('.time').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('hold', function() {
// 			timer = setInterval(nextMinuteHandler, 100);
// 		});
// 		$('.time').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('release', function() {
// 			clearInterval(timer)
// 		});
// 
// 		$('.refresh').hammer({
// 			prevent_mouseevents: true,
// 			prevent_default: true
// 		}).on('touch', refreshHandler);
// 		$('#calendar').hammer({
// 			prevent_mouseevents: false,
// 			prevent_default: false
// 		}).on('drag', function(e) {
// 			var currentOffset = parseInt($('#calendar').css('top')),
// 				offset = currentOffset + e.gesture.deltaY / 10,
// 				pages = Math.ceil(iNumberOfMonths / iMonthsInRow) - 3,
// 				maxOffset = -pages * 191,
// 				sliderValue = 0;
// 
// 			if (offset < maxOffset) offset = maxOffset;
// 			else if (offset >= 0) offset = 0;
// 
// 			sliderValue = calendarMaxGrade * (1 - offset / maxOffset);
// 			$('#calendar').clearQueue().css('top', offset);
// 			$("#calendar_slider").slider('value', sliderValue);
// 		});
// 	}

	/**
	 * //////////////////////////////////////// 结束触摸事件处理程序 ///////////////////////////////////////
	 */
});



//面板布局========================================================================================================================================================================
var inv_img_w = 107 * localStorage.getItem("sunCanvasW") / 1486;
var panel_img_w = 62 * localStorage.getItem("sunCanvasW") / 1486;
var s_d_c_ratio = localStorage.getItem("sunCanvasW")*1/1486;
var x_inc = 25*localStorage.getItem("sunCanvasW") / 1486;
var vueApp = null;//vue 对象
//缩略图宽高
var thum_w = localStorage.getItem("sunCanvasW")*200/1486;
var thum_h = thum_w*(localStorage.getItem("sunCanvasH")*1-80)/localStorage.getItem("sunCanvasW");

//site_data

//面板布局的配置参数
var site_data_confing = {
	inverterImgSize:{//动态获取逆变器svg图大小
		w:inv_img_w,
		h:72 * inv_img_w / 107,
	},
	panelImgSize:{//动态获取面板svg图大小
		w:panel_img_w,
		h:85 * panel_img_w / 62
	},
	
	ratio:s_d_c_ratio,//分辨率比例
	firstInvPos:{//第一个逆变器svg图的位置
		x:100 * s_d_c_ratio,
		y:20 * 100 * s_d_c_ratio / 100 //(按比例计算的y轴位置)
	},
	firstPanPos:{//第一个逆变器的第一个面板的位置
		x:100 * s_d_c_ratio,
		y:90 * 100 * s_d_c_ratio / 100 //(按比例计算的y轴位置)
	},
	//增量
	panel_increment:{
		add_x:x_inc,//面板横向增量
		add_y:x_inc * 20 / 25,//面板纵向增量，	
	},
	com_y_inc:x_inc * 20 / 25,//通用纵向增量
	col_count_panel:14,//一行显示的个数
};

/**
 * 定义对应逆变器组图高度（逆变器高度+间距+面板高度）
 * @param {Array} arr 逆变器数组
 * @param {Function} callback 回调函数
 * */
function inv_panel_Height(arr,callback){
	var inc = site_data_confing.com_y_inc;	
	var panel_h = site_data_confing.panelImgSize.h;
	for(var i=0;i<arr.length;i++){
		var nCeil = Math.ceil(arr[i].panelList.length / site_data_confing.col_count_panel);
		var totalH = inc + inc + site_data_confing.inverterImgSize.h + (nCeil * panel_h) + (nCeil * inc);
		arr[i].totalH = totalH;
	}
	if(callback) callback(arr);
}

/**
 * 定位逆变器x轴和y轴位置，该函数必须在inv_panel_Height函数执行之后执行
 * @param {Array} arr 逆变器数组
 * @param {Function} callback 回调函数
 * */
function setInvPos(arr,callback){
	function backIncTotal(n,list){
		var res = 0;
		for(var i=0;i<n;i++){
			res += t_list[i];
		}
		return res;
	}
	if(arr[0].totalH){
		var inc = site_data_confing.com_y_inc;	
		var inv_x = site_data_confing.firstInvPos.x;//逆变器x轴位置
		//var inv_y = inc;
		var t_list = [];
		for(var i=0;i<arr.length;i++){
			t_list.push(arr[i].totalH);			
		}
		
		for(var j=0;j<arr.length;j++){
			var inv_y = (j+1)*inc + backIncTotal(j,t_list);
			arr[j].x = inv_x;
			arr[j].y = inv_y;
		}
		if(callback) callback(arr);
		
	}else{
		layer.alert("先执行 inv_panel_Height 函数才可执行该函数");
	}
}

//定义逆变器面板的x坐标轴
function setPanelPos_x(arr,callback){
	var f_x = site_data_confing.firstPanPos.x;
	var p_w = site_data_confing.panelImgSize.w;
	var p_x_inc = site_data_confing.panel_increment.add_x;//面板横向增量
	var col_count = site_data_confing.col_count_panel;
	for(var i=0;i<arr.length;i++){
		var len = arr[i].panelList.length;
		for(var j=0;j<len;j++){
			arr[i].panelList[j].x = f_x + (j % col_count * p_w) + (j % col_count * p_x_inc)
		}
	}
	if(callback) callback(arr);
}

//定义逆变器面板的y坐标轴,必须在setInvPos函数之后执行
function setPanelPos_y(arr){
	var inc = site_data_confing.com_y_inc;
	var inv_h =	site_data_confing.inverterImgSize.h;
	var panel_h = site_data_confing.panelImgSize.h;
	var col_count = site_data_confing.col_count_panel;
	for(var i=0;i<arr.length;i++){
		//prevInvH 指的是上一个逆变器的高度+y轴位置==>前面所有逆变器组的高度
		if(i > 0){
			var prevInvH = arr[i-1].y + arr[i-1].totalH;
		}else{
			var prevInvH = 0;
		}
		var len = arr[i].panelList.length;
		for(var j=0;j<len;j++){
			var _res = inc * 2 + inv_h + prevInvH;
			var index_p_h = (Math.ceil((j+1)/col_count) - 1) * panel_h;
			var index_inc = (Math.ceil((j+1)/col_count) - 1) * inc;
			arr[i].panelList[j].y = _res + index_p_h + index_inc
		}
	}
	return arr;
}

//定义电站配置数据，逆变器和面板在svg中的大小
function setSiteConfSize(arr){
	for(var i=0;i<arr.length;i++){
		var len = arr[i].panelList.length;
		arr[i].w = site_data_confing.inverterImgSize.w;
		arr[i].h = site_data_confing.inverterImgSize.h;
		for(var j=0;j<len;j++){
			arr[i].panelList[j].w = site_data_confing.panelImgSize.w;
			arr[i].panelList[j].h = site_data_confing.panelImgSize.h;
		}
	}
	return arr;
}

//随机修改site_data里面主要数据
function site_data_update_random(aData){
	//$.randNum(min, max)
	for(var i=0;i<aData.length;i++){
		aData[i].power = $.randNum(1, 1000);
		var len = aData[i].panelList.length;
		for(var j=0;j<len;j++){
			aData[i].panelList[j].power = $.randNum(1, 500);
		}
	}
	return aData;
}


//重新定义svg参数  site_data的数据
//定义对应逆变器组图高度（逆变器高度+间距+面板高度）
//inv_panel_Height(site_data.inverter,function(arr){
inv_panel_Height(_aDateArr[0].inverter,function(arr){
	//定义电站配置数据，逆变器和面板在svg中的大小
	setSiteConfSize(arr);
	//定位逆变器x轴和y轴位置
	setInvPos(arr,function(res){
		//定位面板y轴
		setPanelPos_y(res);
		//定位面板x轴
		setPanelPos_x(res,function(data){			
			// console.log(data,"计算面板x轴y轴")
			loadMainSvg(data);
			
			
		});
		
	});	
});

/**
 * vue加载svg主要面板动画
 * @param {Array} aParam 配置好的数据
 * 
 * */
function loadMainSvg(aParam){
	vueApp = new Vue({
			el:"#svgLayout_box",
			data:{
				mainW:localStorage.getItem("sunCanvasW")*1 || 1000,
				mainH:localStorage.getItem("sunCanvasH")*1-80 || 500,//主图高度
				thumW:thum_w,
				thumH:thum_h,//缩略图高度
				mainData:[250, 210, 170, 130, 90],//主要数据
				mainData2:[				
								
				],
				ratioW:0,//宽度倍率
				ratioH:0,//高度倍率
				oSvg:null,//svg画布主要对象
				thum_oSvg:null,//缩略图画布主要对象
				zoom:null,//缩放svg函数对象
				svg_g:null,
				siteData:_aDateArr[0],//已经配置好的电站逆变器面板数据（对象数据）
				zoomToolData:{//缩放工具数据配置
					min:1,
					max:200,
					view_min:0.1,
					view_max:2,
					curr_view_v:1,//当前缩放scale值
				},
				staticData:{
					invNum:0,//逆变器个数
					panelNum:0,//优化器个数
				}
			},
			created:function(){
				// console.log(aParam,"计算面板x轴y轴");
				this.ratioW = this.mainW / this.thumW;
				this.ratioH = this.mainH / this.thumH;
				
				//定义要绘制的优化器数据
				this.mainData2 = oComFn.backSiteDataCf(this.siteData);
				
				
				//定义zoom函数
				this.zoomFn(this.svg_g);
				
			},
			updated:function(){
				
			},
			mounted:function(){
				
				var _this = this;
				//初始化主图svg
				this.initSvgFn(".svgBox",function(svg){
					_this.createRectFn(svg);
				});
				
				// //初始化缩略svg
				// this.thum_initSvgFn(".t_svgBox",function(svg){
				// 	_this.thum_createRectFn(svg);
				// });
				
				//初始化缩放工具
				_this.initZoomSlide();
			
				//设置初始化缩放最适宜级别
				setTimeout(function(){
					var svg_g_h = d3.select("#svg_g").attr("height");
					var zoomNum = (690 / svg_g_h).toFixed(2);
					_this.setGoodZoom(zoomNum);
				},500);
				
			},
			watch:{
				
			},
			methods:{
				/**
				 * 初始化大svg画布
				 * @param {String} selector 选择器字符串
				 * @param {Function} fn 回调函数
				 * */
				initSvgFn:function(selector,fn){
					var _this = this;
					d3.select("#svg_panel_box")
						.style("width",_this.mainW+"px")
						.style("height",_this.mainH+"px");
					
					//初始化画布，并为父元素添加样式
					_this.oSvg = d3.select(selector) //选择文档中的body元素
						.style("width",_this.mainW+"px")
						.style("height",_this.mainH+"px")
						.append("svg") //添加一个svg元素
						.attr("id","mainView")
						.attr("width", _this.mainW) //设定宽度
						.attr("height", _this.mainH); //设定高度
						
						//回调函数
						fn(_this.oSvg);
				},
				/**
				 * 初始化缩略图svg画布
				 * @param {String} selector 选择器字符串
				 * @param {Function} fn 回调函数
				 * */
				thum_initSvgFn:function(selector,fn){
					var _this = this;
					
					//每次绘制前删除之前的图形（这是一种简单有效的动画理论，但是比较消耗资源，之后会介绍如何节省资源完成需求）
					d3.select("#thumbSvg").remove();
					
					//初始化画布，并为父元素添加样式
					_this.thum_oSvg = d3.select(selector) //选择文档中的body元素
						.style("width",_this.thumW+"px")
						.style("height",_this.thumH+30+"px")
						.append("svg") //添加一个svg元素
						.attr("id", "thumbSvg")
						.attr("width", _this.thumW) //设定宽度
						.attr("height", _this.thumH); //设定高度
						
						//回调函数
						fn(_this.thum_oSvg);
				},			
				//主图矩形生产
				createRectFn:function(svg){
					var _this = this;
					if(svg){
						_this.svg_g = d3.select("#mainView").append("g")
							.attr("id","svg_g")
							.attr("width",_this.mainW)
							.attr("height",_this.mainH)
							.call(_this.zoom)
													
							
								
							//新增逆变器
							d3.select("#svg_g").append("g").attr("id","invlBox");							
							d3.select("#invlBox").selectAll("rect")
								.data(_this.siteData.inverter)
								.enter()
								.append("rect")
								.attr("x", function(d,i){
									return d.x - 5*site_data_confing.ratio;
								})
								.attr("y", function(d, i) {
									return d.y;
								})
								.attr("width", function(d,i) {
									return d.w + 50*site_data_confing.ratio;
								})
								.attr("height",function(d,i){
									return d.h;
								})		
								.attr("rx",5)	
								.attr("ry",5)	
								.attr("fill","#fff");
							//功率	
							d3.select("#invlBox").selectAll(".inv_txt_sign")
								.data(_this.siteData.inverter)
								.enter()
								.append("text")
								.attr("x", function(d,i){
									return d.x + (d.w/2) + 5*site_data_confing.ratio
								})
								.attr("y", function(d, i) {
									return d.y + 25*site_data_confing.ratio;
								})
								.attr("fill","#009cff")
								.attr("data-id",function(d,i){
									return d.id;
								})
								.attr("class","inv_txt_sign")
								.text(function(d,i){
									return d.power + "kwh";
								})
								.style("font-size",15*site_data_confing.ratio + "px");
								
								
								//添加inv名称
								d3.select("#invlBox").selectAll(".inv_tspan")
									.data(_this.siteData.inverter)
									.enter()
									.append("text")
									.attr("x", function(d,i){
										return d.x + (d.w/2) + 5*site_data_confing.ratio
									})
									.attr("y", function(d, i) {
										return d.y + 55*site_data_confing.ratio;
									})
									.text(function(d,i){
										return d.name;
									})
									.style("font-size",15*site_data_confing.ratio + "px")
									.attr("fill","#009cff")
									.attr("class","inv_tspan");
								
							//添加逆变器图片
							d3.select("#invlBox").selectAll("g")
								.data(_this.siteData.inverter)
								.enter()
								.append("g")
								.on("click",function(d,i,e){
									console.log(d,i,e);
									//显示tip
									oComFn.invTipFn($(this),d);
								})
								.attr("class","inv_img")
								.append("image")
								.attr("x", function(d,i){
									return d.x - 5*site_data_confing.ratio;
								})
								.attr("y", function(d, i) {
									return d.y + 15 * site_data_confing.ratio;
								})
								.attr("width", function(d,i) {
									return d.w * 0.6;
								})
								.attr("height",function(d,i){
									return d.h * 0.6;
								})		
								.attr("rx",5)	
								.attr("ry",5)	
								.attr("href","img/inverter.png")
								
								
						
							//新增面板
							d3.select("#svg_g").append("g").attr("id","panelBox");							
							d3.select("#panelBox").selectAll(".panel_img")							    	
								.data(_this.mainData2) //遍历函数
								.enter() //指定选择集的enter部分，即进入rect
								.append("g")
								.attr("class","panel_img")
								.attr("transform",function(d,i){
									return "rotate("+ (d.angle+180) +" "+(d.x+(d.w/2))+" "+(d.y+(d.h/2))+")";//模仿国外公司，默认180度
								})//角度
								.attr("data-angle",function(d,i){
									return d.angle;
								})
								.attr("status",function(d,i){
									return d.status;
								})
								.on("mouseenter",function(d,i){
									if(d.status == 3) return;
									//显示同组串
									_this.stringShowFn(d,i);
								})
								.on("mouseleave",function(d,i){
									if(d.status == 3) return;
									//不显示同组串
									_this.stringHideFn(d,i);									
								})							
								.on("click",function(d,i){
									if(d.status == 3) return;
									
									//显示tip
									oComFn.panelTipFn($(this),d);
									
									//根据参数数据，将对应数据的面板列表展示且高亮
									oComFn.focusPanelFn(d);
									
									//阻止事件冒泡
									window.event? window.event.cancelBubble = true : e.stopPropagation();
								})						
								.append("image")
								.attr("x", function(d,i){
									return d.x;
								})
								.attr("y", function(d, i) {
									return d.y;
								})
								.attr("width", function(d,i) {
									return d.w;
								})
								.attr("height",function(d,i){
									return d.h;
								})		
								.attr("rx",function(d,i){
									return d.rx;
								})	
								.attr("ry",function(d,i){
									return d.ry;
								})	
								.attr("string",function(d,i){
									return d.string;
								})								
								.attr("href", function(d,i){
									if(d.status == 0){
										return "img/panel_normal.png";
									}else if(d.status == 1){
										return "img/panel_outline.png";
									}
									else if(d.status == 2){
										return "img/panel_error.png";
									}
									else{
										return "img/panel_no.png";
									}
								})
							//面板功率	
							d3.selectAll(".panel_img").append("a")	
								.attr("class","imgage_txt")
								.attr("string_sign",function(d,i){
									return d.string;
								})
								.append('text')								
								.attr("x", function(d,i){
									return d.x + 10*site_data_confing.ratio;
								})
								.attr("y", function(d, i) {
									return d.y + 20*site_data_confing.ratio;
								})
								.text(function(d,i){								
									if(d.status != 3){
										return d.power;
									}
								})
								.attr("class","panel_txt_sign")
								.attr("data-id",function(d,i){
									return d.id
								})
								.attr("data-pid",function(d,i){
									return d.pid
								})
								.style("font-size",12*site_data_confing.ratio + "px")
								.attr("fill","#fff");
								
								//面板版本
								d3.selectAll(".imgage_txt").each(function(d,i){
									d3.select(this).append("text")
									.attr("x", function(d,i){
										return d.x + 10*site_data_confing.ratio;
									})
									.attr("y", function(d, i) {
										return d.y + 35*site_data_confing.ratio;
									})
									.style("font-size",12*site_data_confing.ratio + "px")
									.attr("fill","#fff")
									.text(function(d,i){
										if(d.status != 3){
											return "Wh";
										}
									})
									.attr("class","panel_tspan")
									.append("tspan")
									.attr("x", function(d,i){
										return d.x + 5*site_data_confing.ratio;
									})
									.attr("y", function(d, i) {
										return d.y + 30*site_data_confing.ratio + d.h/2;
									})
									.text(function(d,i){
										if(d.status != 3){
											return d.model;
										}
									});
								});
								
								
								
										
								//点击其他地方取消tip
								d3.select("#mainView").on("click",function(e){
									var e = e || window.event; //浏览器兼容性     
									var elem = e.target || e.srcElement;    //当前事件触发目标
									if($(elem).attr("id") == "mainView") oComFn.closeTipFn();
									return false;
								});
								
								
					}
					
				},
				//缩略图矩形生产
				thum_createRectFn:function(svg){
					console.log(svg,111);
					var _this = this;
					if(svg){
						_this.svg_g = d3.select("#thumbSvg").append("g")
							.attr("id","t_svg_g")
							.attr("width",_this.thumW)
							.attr("height",_this.thumH)
						
						//新增逆变器
						d3.select("#t_svg_g").append("g").attr("id","t_invlBox");							
						d3.select("#t_invlBox").selectAll("rect")
							.data(_this.siteData.inverter)
							.enter()
							.append("rect")
							.attr("x", function(d,i){
								return (d.x - 5*site_data_confing.ratio)/_this.ratioW;
							})
							.attr("y", function(d, i) {
								return d.y/_this.ratioH;
							})
							.attr("width", function(d,i) {
								return (d.w + 50*site_data_confing.ratio)/_this.ratioW;
							})
							.attr("height",function(d,i){
								return d.h/_this.ratioH;
							})									
							.attr("fill","#fff");
							
						d3.select("#t_invlBox").selectAll("text")
							.data(_this.siteData.inverter)
							.enter()
							.append("text")
							.attr("x", function(d,i){
								return (d.x + (d.w/2) + 5*site_data_confing.ratio)/_this.ratioW;
							})
							.attr("y", function(d, i) {
								return (d.y + 25*site_data_confing.ratio)/_this.ratioH
							})
							.attr("fill","#009cff")
							.text(function(d,i){
								return d.power + "kwh";
							})
							.style("font-size",(15*site_data_confing.ratio)/_this.ratioH + "px")
							.append('tspan')
							.attr("x", function(d,i){
								return (d.x + (d.w/2) + 5*site_data_confing.ratio)/_this.ratioW
							})
							.attr("y", function(d, i) {
								return (d.y + 55*site_data_confing.ratio)/_this.ratioH
							})
							.text(function(d,i){
								return d.name;
							})
							
						
						//site_data_confing.ratio
						
						d3.select("#t_invlBox").selectAll("g")
							.data(_this.siteData.inverter)
							.enter()
							.append("g")
							.attr("class","t_inv_img")
							.append("image")
							.attr("x", function(d,i){
								return (d.x - 5*site_data_confing.ratio)/_this.ratioW;
							})
							.attr("y", function(d, i) {
								return (d.y + 15 * site_data_confing.ratio)/_this.ratioH
							})
							.attr("width", function(d,i) {
								return (d.w * 0.6)/_this.ratioW;
							})
							.attr("height",function(d,i){
								return (d.h * 0.6)/_this.ratioH
							})	
							.attr("href","img/inverter.png");
							
												
						//新增面板
						d3.select("#t_svg_g").append("g").attr("id","t_panelBox");							
						d3.select("#t_panelBox").selectAll(".t_panel_img")							    	
							.data(_this.mainData2) //遍历函数
							.enter() //指定选择集的enter部分，即进入rect
							.append("g")
							.attr("class","t_panel_img")
							.append("image")
							.attr("x", function(d,i){
								return d.x/_this.ratioW;
							})
							.attr("y", function(d, i) {
								return d.y/_this.ratioH;
							})
							.attr("width", function(d,i) {
								return d.w/_this.ratioW;
							})
							.attr("height",function(d,i){
								return d.h/_this.ratioH;
							})		
							
							.attr("string",function(d,i){
								return d.string;
							})								
							.attr("href", function(d,i){
								if(d.status == 0){
									return "img/panel_normal.png";
								}else if(d.status == 1){
									return "img/panel_outline.png";
								}
								else if(d.status == 2){
									return "img/panel_error.png";
								}
								else{
									return "img/panel_no.png";
								}
							})
							.attr("data-role","t_mainPanel");
							
						d3.selectAll(".t_panel_img").append("a")
							.attr("class","t_imgage_txt")
							.append('text')								
							.attr("x", function(d,i){
								return (d.x + 10*site_data_confing.ratio)/_this.ratioW
							})
							.attr("y", function(d, i) {
								return (d.y + 20*site_data_confing.ratio)/_this.ratioH
							})
							.text(function(d,i){
								if(d.status != 3){
									return d.power;
								}
							})
							.style("font-size",(12*site_data_confing.ratio)/_this.ratioW + "px")
							.attr("fill","#fff")
							
							.append("tspan")
							.attr("x", function(d,i){
								return (d.x + 10*site_data_confing.ratio)/_this.ratioW;
							})
							.attr("y", function(d, i) {
								return (d.y + 35*site_data_confing.ratio)/_this.ratioH
							})
							.text(function(d,i){
								if(d.status != 3){
									return "Wh";
								}
							})
							.append("tspan")
							.attr("x", function(d,i){
								return (d.x + 5*site_data_confing.ratio)/_this.ratioW
							})
							.attr("y", function(d, i) {
								return (d.y + 30*site_data_confing.ratio + d.h/2)/_this.ratioH
							})
							.text(function(d,i){
								if(d.status != 3){
									return d.model;
								}
							});
						
					
					}
					
				},
				//面板组串效果（鼠标一进一出的效果）
				//鼠标进入面板
				stringShowFn(d,i){
					d3.selectAll(".imgage_txt").selectAll("text,tspan").each(function(k,e){
						if(d.string == k.string && d.pid == k.pid){
							d3.select(this).attr("fill","#000");
						}
					});
				},
				//鼠标离开面板
				stringHideFn(d,i){
					d3.selectAll(".imgage_txt").selectAll("text,tspan").each(function(k,e){
						if(d.string == k.string && d.pid == k.pid){
							d3.select(this).attr("fill","#fff");
						}
					});
				},
				zoomResFn:function(){
					var _this = this;
					//_this.zoom.translate()该值会使得缩放是以中心缩放
					d3.select("#svg_g").attr("transform",
						// "translate(" + _this.zoom.translate() + ")" + 
						"scale(" + _this.zoom.scale() + ")"
					);
					
				},
				//定义zoom函数
				zoomFn:function(svg){
					var _this = this;
					this.zoom = d3.behavior.zoom().scaleExtent([0.1, 2]).on("zoom", function(d,i){
						_this.zoomResFn();
						//同步
						var val = _this.zoom.scale();
						_this.zoomToolData.curr_view_v = val;
						$(".ratio_val").text((val*100).toFixed(0) + "%");
						$( "#slider-vertical" ).slider("value",(val*100).toFixed(0));
						
					});
					
				},
				//按钮点击放大缩小
				toTransformScaleFn:function(n){
					console.log(n);
					var _this = this;
	//						var clicked = d3.event.target,
					var	direction = 1,
						factor = 0.2,
						target_zoom = 1,
						center = [_this.mainW / 2, _this.mainH / 2],
						extent = _this.zoom.scaleExtent(),
						translate = _this.zoom.translate(),
						translate0 = [],
						l = [],
						view = {
							x: translate[0],
							y: translate[1],
							k: _this.zoom.scale()
						};
		
					//d3.event.preventDefault();
					direction = n;//1为放大，-1缩小
					target_zoom = _this.zoom.scale() * (1 + factor * direction);
		
					if(target_zoom < extent[0] || target_zoom > extent[1]) {
						return false;
					}
		
					translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
					view.k = target_zoom;
					l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
		
					view.x += center[0] - l[0];
					view.y += center[1] - l[1];
		
					_this.interpolateZoom([view.x, view.y], view.k);
				},
				//控制按钮缩放
				interpolateZoom:function(translate, scale){
					console.log(translate, scale,"fazhi");					
					var _this = this;
					_this.zoomToolData.curr_view_v = scale;
					var res = (_this.zoomToolData.max / _this.zoomToolData.view_max * scale).toFixed(0);
					$( "#slider-vertical" ).slider("value",res);
					$(".ratio_val").text(res + "%");
					 
						return d3.transition().duration(350).tween("zoom", function() {
							var iTranslate = d3.interpolate(_this.zoom.translate(), translate),
								iScale = d3.interpolate(_this.zoom.scale(), scale);
							return function(t) {
								_this.zoom
									.scale(iScale(t))
									.translate(iTranslate(t));
								_this.zoomResFn();
							};
						});
				},
				//抽取面板数据独立为一个数组
				createPanelConf:function(){
					var _this = this;
					var arr = _this.siteData.inverter;
					var list = [];
					for(var i=0;i<arr.length;i++){
						var len = arr[i].panelList.length;
						for(var j=0;j<len;j++){
							arr[i].panelList[j].ry = 5;
							arr[i].panelList[j].rx = 5;
							list.push(arr[i].panelList[j]);
						}
					}
					_this.mainData2 = list;
					return list;
				},
				//初始化缩放工具
				initZoomSlide:function(){
					var _this = this;
					// 滑块
					$( "#slider-vertical" ).slider({
					  orientation: "vertical",
					  range: "min",
					  min: 1,
					  max: 200,
					  value: 100,
					  slide: function( event, ui ) {
						  //同步缩放值和滑块比例
						$(".ratio_val").text(ui.value + "%");
						_this.zoomToolData.curr_view_v = ui.value/100;
						d3.select("#svg_g").attr("transform",
							"scale(" + _this.zoomToolData.curr_view_v + ")"
						);
						
					  }
					});
					$(".ratio_val").text($( "#slider-vertical" ).slider( "value" ) + "%");
				},
				//更新逆变器和面板的power数据
				updateDataFn:function(aData){
					var _this = this;
					//数据降维处理
					var list = [];
					for(var i=0;i<aData.length;i++){
						var len = aData[i].panelList.length;
						for(var j=0;j<len;j++){						
							list.push(aData[i].panelList[j]);
						}
					}
					_this.mainData2 = list;
					
					//更新逆变器的power					
					d3.selectAll(".inv_txt_sign").each(function(d,i){
						if(d.id == aData[i].id){
							d3.select(this).text(aData[i].power + "kWh");
						}
					});
					
					//更新面板的power数据
					d3.selectAll(".panel_txt_sign").each(function(d,i){
						if(d.status != 3){
							if(d.id == _this.mainData2[i].id){
								d3.select(this).text(_this.mainData2[i].power);
							}
						}
						
					});
				},
				//点击拉升画布高度
				showMoreFn:function(){
					// $("#mainView").parent().niceScroll({
					// 	zindex: "auto",
					// 	cursorcolor: "#0099FF",  // 滚动条颜色，使用16进制颜色值
					// 	 cursoropacitymin: 1,  // 当滚动条是隐藏状态时改变透明度，值范围1到0
					// 	 background:"none"
					// });
					
					var content_top_h = $("#content_top").height();
					$("#content_top").css("height",(content_top_h*1+500) + "px");
					var sunCanvas_h = d3.select("#sunCanvas").attr("height");
					d3.select("#sunCanvas").attr("height",sunCanvas_h*1 + 500);
					d3.select("#mainCanvas").attr("height",sunCanvas_h*1 + 500);
					
					var mainView_h = d3.select("#mainView").attr("height");
					d3.select("#mainView").attr("height",mainView_h*1+500);
					$("#svg_panel_box,.svgBox").css("height",(mainView_h*1+500) + "px");
					
				},
				//设置初始化缩放最适宜级别
				setGoodZoom:function(zoomNum){
					d3.select("#svg_g").attr("transform",
						// "translate(" + _this.zoom.translate() + ")" + 
						"scale(" + zoomNum + ")"
					);
					
					$(".ratio_val").text(zoomNum*100 + "%");
					$( "#slider-vertical" ).slider("value",zoomNum*100);
					this.zoomToolData.curr_view_v = zoomNum;//更新当前比例
					this.zoom.scale(zoomNum);//同步缩放对象值
				},
				
			}
		});
}


//引入公共的面板逆变器左边菜单html片段
	oComFn.importLeftNavHtml(function(){
		//监听左边逆变器面板菜单点击事件
		oComFn.LN_panelClickEvent(function(id,data){
			console.log(id,data);
			d3.selectAll(".panel_img").attr("id",function(d,k){
				if(data.name == d.name && data.model == d.model){					
					oComFn.panelTipFn($(this),d);							
				}				
			});
		});
	});
}catch(e){
	//TODO handle the exception
	console.log(e,21)
}


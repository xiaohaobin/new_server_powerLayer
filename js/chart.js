$(function(){
	//获取某一天中每隔五分钟的时间刻度数组
	var aTimeList = $.getDateArr(
		"2019-8-12 00:00:00",
		"2019-8-12 23:59:59",
		5
	);
	aTimeList = getMinuteFn(aTimeList);//分钟刻度数组
	// console.log(aTimeList,"sss");
	
	var xData,yData;//xy轴数据
	var oChart = null;//图表对象
	// var timeSpeed = 0;//时间间隔
	// var initRequestTime = "",//初始化请求的时间（包含时分秒）
	// 	initRequestDate = "";//初始化请求的时间（）
	
	//切换日期
	$('.toggle_date_btn').on("click",function(){
		$(this).addClass('active').siblings().removeClass('active');
		var nIndex = $(this).index();
		$('.datePickerBox .Wdate').eq(nIndex).addClass('active').siblings().removeClass('active');
		// console.log($(this).index());
		getChartData($(this).index(),$(".Wdate.active").val());
	});
	
	//初始化日期
	initLaydate("#datePicker_day",2,function(a,b){
		// console.log(a,b);
		getChartData(0,a);
	});
	initLaydate("#datePicker_month",3,function(a,b){
		// console.log(a,b);
		getChartData(1,a);
	});
	initLaydate("#datePicker_year",4,function(a,b){
		// console.log(a,b);
		getChartData(2,a);
	});
	initLaydate("#datePicker_year_5",4,function(a,b){
		// console.log(a,b);
		getChartData(3,a);
	});
	
	//初始化图表
	initChartFn( 0,$.conversionTime(new Date()).slice(0,10) );
	
	//图表
	function CurpowerChart(xdata,ydata) {
		var oOption = {
			credits: { //禁用版权信息
				enabled: false
			},
			chart: {
				backgroundColor: 'none',
				zoomType: 'xy',
			},
			title: null,
			xAxis: [{
				categories: xdata,
				
				// minTickInterval: 10, //x轴时间间隔
				crosshair: true,
				lineColor: '#383f4d', //x轴的颜色
				tickColor: '#383f4d', //刻度的颜色
				labels: {
					style: {
						// color: '#bdd0fc',
						fontSize: '12px'
					}
				},
				crosshair: true
			}],
			yAxis: [
				{ // Primary yAxis
					title: {
						text: "<b>功率(kWh)</b>",
					},
					labels: {
						format: '{value}',
						style: {
							// color: '#bdd0fc',
							fontSize: '12px'
						}
					},
					gridLineColor: '#383f4d', //网格线
					gridLineDashStyle: 'longdash', //网格线线条样式
				}, 
				
			],
			tooltip: {
				shared: true
			},
			legend: {
				itemDistance: 50,
				itemStyle: {
					// color: "#009cff"
				}
			},
			plotOptions: {
				series: {
					animation: {
						duration: 2000,
						easing: 'easeOutBounce'
					},
					fillOpacity: 0.09,
					lineWidth: 4,
					marker: {
						enabled: false
					} //关掉实心点
				}
			},
			series: [
				{
					type: 'areaspline',
					name: "发电量",
					data: ydata,
					color: '#504AC3',
					tooltip: {
						valueDecimals: 2,
						valueSuffix: 'W'
					}
				}, 
				
			],
			lang: {
				noData: '亲,暂无数据哦...',
			},
			noData: {
				style: {
					fontWeight: 'bold',
					fontSize: '16px',
					color: '#504AC3'
				}
			}
		};
		oChart = Highcharts.chart('chartBox', oOption);//id写法,单个		
		
	}
	
	//获取一天的分钟数组（没五分钟）
	function getMinuteFn(arr){
		for(var i=0;i<arr.length;i++){
			arr[i] = arr[i].slice(11,16);
		}
		return arr;
	}
	
	//初始化图表数据（当天时间，日类型时间）
	function initChartFn(nType,sDate){
		if(localStorage.getItem("initOptimizerChart")){
			var FD = JSON.parse(localStorage.getItem("initOptimizerChart"));
			var curT = $.conversionTime(new Date());//当前时间年月日时分秒
			var curD = curT.slice(0,10);
			if(curD == FD.FR_Date){//同一天
				//curT FD.FR_Time
				var curr_nTime = $.backDateNum(curT);
				var prev_nTime = $.backDateNum(FD.FR_Time);
				if((curr_nTime - prev_nTime) >= 300){
					
					$.isNull(
						oChart,
						function(){//变量为空的回调
							
							chart_fn_1(nType,sDate,function(xData,yData){
								CurpowerChart(xData,yData);		
								//更新本地存储记录上次请求日期和数据	
								saveFirstRData(yData);
							});		
						},
						function(){//不为空的回调
							//过了5分钟时间，可重新请求
							getChartData(0,$("#datePicker_day").val());
						},
					);
				}else{
					$.isNull(
						oChart,
						function(){//变量为空的回调
							CurpowerChart(aTimeList,FD.FR_Data);
						},
						function(){//不为空的回调
							//还没过，沿用之前存储的数据
							oChart.series[0].setData(FD.FR_Data);
						},
					);
					
				}
				
			}else{//不同一天，上次记录的天数有可能是昨天以前
				
				chart_fn_1(nType,sDate,function(xData,yData){
					CurpowerChart(xData,yData);		
					//更新本地存储记录上次请求日期和数据	
					saveFirstRData(yData);
				});		
			}
			
		}else{//第一天开始
			
			chart_fn_1(nType,sDate,function(xData,yData){
				CurpowerChart(xData,yData);		
				//更新本地存储记录上次请求日期和数据	
				saveFirstRData(yData);
			});		
		}		
	}
	
	
	//记录上一次请求日期和数据
	function saveFirstRData(yData){
		var initRequestTime = $.conversionTime(new Date());//当前时间（包含时分秒）
		var initOptimizerChart = {
			FR_Time:initRequestTime,//年月日时分秒
			FR_Data:yData,
			FR_Date:initRequestTime.slice(0,10),//年月日
		};		
		
		//保存本地，下次可用
		localStorage.setItem("initOptimizerChart",JSON.stringify(initOptimizerChart))
	}
	
	//会话存储历史数据
	function saveHisData(sDate,yData){
		if(sessionStorage.getItem("hisOptimizerChart")){
			var historyOptimizerData = JSON.parse(sessionStorage.getItem("hisOptimizerChart"));
			historyOptimizerData[sDate] = yData;
			sessionStorage.setItem("hisOptimizerChart",JSON.stringify(historyOptimizerData));
		}
		else{
			//会话存储
			var historyOptimizerData = {};
			historyOptimizerData[sDate] = yData;
			sessionStorage.setItem("hisOptimizerChart",JSON.stringify(historyOptimizerData));
		}
	}
	
	//请求日图表数据
	function chart_fn_1(nType,sDate,callback){		
		oComFn.ajax_method(
			"json/invList.json",
			{
				plantId:"123",//电站id
				type:1,//逆变器类型，1：Growatt、2：Tigo
				deviceSn:"ACssasa",
				date:sDate,
				timeType:nType,
			},
			"get",
			function(data){		
				xData = aTimeList;
				yData = randomYData(xData.length);
				if(callback) callback(xData,yData,sDate);
			}
		);
	}
	
	//请求月图表数据
	function chart_fn_2(nType,sDate,callback){
		oComFn.ajax_method(
			"json/invList.json",
			{
				plantId:"123",//电站id
				type:1,//逆变器类型，1：Growatt、2：Tigo
				deviceSn:"ACssasa",
				date:sDate,
				timeType:nType,
			},
			"get",
			function(data){		
				xData = getDayList(sDate);
				var nDay = getDayNum(sDate);
				yData = randomYData(nDay);
				
				oChart.xAxis[0].setCategories(xData);
				oChart.series[0].setData(yData);
				
				if(callback) callback(xData,yData,sDate);
			}
		);
	}
	/**
	 * 根据日期切换请求数据
	 * @param {Number} nType 日期类型
	 * @param {String} nType 
	 * */
	function getChartData(nType,sDate){		
		
		if(nType == 0){//一天每5分钟刻度
			var initRequestTime = $.conversionTime(new Date());//当前时间（包含时分秒）
			var FR_date = initRequestTime.slice(0,10);//本地时间年月日
			//更新本地存储记录上次请求日期和数据
			//判断是否同一天
			if(FR_date == sDate){//本地时间和请求的时间一致，更新本地存储		
				
				if(localStorage.getItem("initOptimizerChart")){
					var FD = JSON.parse(localStorage.getItem("initOptimizerChart"));
					var curT = $.conversionTime(new Date());//当前时间年月日时分秒
					var curD = curT.slice(0,10);
					var curr_nTime = $.backDateNum(curT);
					var prev_nTime = $.backDateNum(FD.FR_Time);
					if((curr_nTime - prev_nTime) >= 300){
						chart_fn_1(nType,sDate,function(xData,yData){
							oChart.xAxis[0].setCategories(xData);
							oChart.series[0].setData(yData);
							//更新本地存储记录上次请求日期和数据	
							saveFirstRData(yData);
						});		
					}else{
						//还没过，沿用之前存储的数据
						oChart.series[0].setData(FD.FR_Data);
					}
					
				}else{
					chart_fn_1(nType,sDate,function(xData,yData){
						oChart.xAxis[0].setCategories(xData);
						oChart.series[0].setData(yData);
						//更新本地存储记录上次请求日期和数据	
						saveFirstRData(yData);
					});		
				}
				
			}
			else{//本地时间和请求的时间不一致，即请求的是过去某天的数据
				
				if(sessionStorage.getItem("hisOptimizerChart")){//判断该日起是否被记录
					var his_data = JSON.parse(sessionStorage.getItem("hisOptimizerChart"));
					if(his_data[sDate]){//会话存储有记录
						xData = aTimeList;
						yData = his_data[sDate];
						oChart.xAxis[0].setCategories(xData);
						oChart.series[0].setData(yData);
					}else{
						chart_fn_1(nType,sDate,function(xData,yData){
							oChart.xAxis[0].setCategories(xData);
							oChart.series[0].setData(yData);
							//更新本地存储记录上次请求日期和数据	
							saveHisData(sDate,yData)
						});
					}
				}
				else{
					chart_fn_1(nType,sDate,function(xData,yData){
						oChart.xAxis[0].setCategories(xData);
						oChart.series[0].setData(yData);
						//更新本地存储记录上次请求日期和数据	
						saveHisData(sDate,yData)
					});
				}
				
			}
		}
		else if(nType == 1){//一个月所有天数
			
			if(sessionStorage.getItem("hisOptimizerChart")){//判断该日起是否被记录
				var his_data = JSON.parse(sessionStorage.getItem("hisOptimizerChart"));
				if(his_data[sDate]){//会话存储有记录
					xData = getDayList(sDate);
					yData = his_data[sDate];					
					oChart.xAxis[0].setCategories(xData);
					oChart.series[0].setData(yData);
				}else{
					chart_fn_2(nType,sDate,function(xData,yData){
						//更新历史数据
						saveHisData(sDate,yData);
					});
				}
			}
			else{
				chart_fn_2(nType,sDate,function(xData,yData){
					//更新历史数据
					saveHisData(sDate,yData);
				});
			}
			
		}
		else if(nType == 2){//一年
			oComFn.ajax_method(
				"json/invList.json",
				{
					plantId:"123",//电站id
					type:1,//逆变器类型，1：Growatt、2：Tigo
					deviceSn:"ACssasa",
					date:sDate,
					timeType:nType,
				},
				"get",
				function(data){
					xData = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
					yData = randomYData(xData.length);
					
					oChart.xAxis[0].setCategories(xData);
					oChart.series[0].setData(yData);
				}
			);
			
		}else if(nType == 3){//五年
			oComFn.ajax_method(
				"json/invList.json",
				{
					plantId:"123",//电站id
					type:1,//逆变器类型，1：Growatt、2：Tigo
					deviceSn:"ACssasa",
					date:sDate,
					timeType:nType,
				},
				"get",
				function(data){
					var year_5 = [];
					for(var i=0;i<5;i++){
						year_5.push(sDate*1 - i);				
					}
					xData = year_5.reverse();
					yData = randomYData(xData.length);
					oChart.xAxis[0].setCategories(xData);
					oChart.series[0].setData(yData);
				}
			);
			
			
		}
		
	}
	
	//随机生成任意长度的数组，元素皆为数字
	function randomYData(n){
		var list = [];
		for(var i=0;i<n;i++){
			list.push($.randNum(1,100));
		}
		return list;
	}
	
	//根据字符串年月格式（yyyy-mm），返回该月份的天数
	function getDayNum(ss){
		var t = ss.indexOf("-");
		var year = ss.slice(0,t)*1;
		var month = ss.slice(t+1)*1;
		return $.getDaysInMonth(year,month);
	}
	
	function getDayList(v){
		var nDay = getDayNum(v);
		var list = [];
		for(var i=0;i<nDay;i++){
			list.push((i+1) + "号");
		}
		 return list;
	}
	
	
});
//引入公共的面板逆变器左边菜单html片段
	oComFn.importLeftNavHtml(function(){
		//监听左边逆变器面板菜单点击事件
		oComFn.LN_panelClickEvent(function(id,data){
			console.log(id,data)
		});
	});
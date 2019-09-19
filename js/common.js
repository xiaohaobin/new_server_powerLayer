/**
 * 初始化时间laydate
 * @param {String} selector 日期选择器input的id
 * @param {String} type 类型 包含4“year”，3“month”，2“date”（年月日），5“time”（时分秒），1“datetime”，年月日时分秒
 * @param {Function} fn 回调函数，返回参数（日期值和日期类型码）
 * */
function initLaydate(selector,nType,fn){
	if(nType == "1"){
		var sType = "date";
		$(selector).val($.getYesterdayDate());//时间采用昨天
		
	}else if(nType == "2"){
		var sType = "date";
		$(selector).val( $.conversionTime(new Date()).slice(0,10) );//时间采用今天
		
		
	}else if(nType == "3"){
		var sType = "month";
		$(selector).val(getOnTime('y-m'));
		
	}else if(nType == "4"){
		var sType = "year";
		$(selector).val(getOnTime('y'));
	}else{
		var sType = "time";
		$(selector).val(getOnTime(''));
	}
	
	laydate.render({
		elem: selector,
		type: sType,
		lang: "en", //默认为中文，en是英文
		max: 0,//设置一个默认最大值 ,0表示当天，-1表示最大昨天，以此类催
	    trigger: 'click', 
		isInitValue:true,
		// value:"",
		done: function(value) {
			if(typeof fn == "function") fn(value,nType);
			
		}
	});
}

/**
 * 
 * 获取当前静态所有时间
 * @param {String} oTime 时间格式参数
 *  'y-m-d' ==> 年月日
	 'y-m' ==> 年月
	 'm-d' ==> 月日
	 'h-m-s' ==> 时分秒
	 'h-m' ==> 时分
	 'm-s' ==> 分秒
	 'y' ==>年
	 'w' ==>星期
	 'd' ==>日
	 '' ==>年月日 时分秒
 * */
function getOnTime(oTime){
	//获取当前具体时间
	var oDate = new Date();
	var nYear = oDate.getFullYear();
	var nMonth = oDate.getMonth() * 1 + 1;
	if(nMonth < 10) nMonth = "0" + nMonth;
	var nDate = oDate.getDate();
	if(nDate < 10) nDate = "0" + nDate;
	var nHours = oDate.getHours();
	var nMinutes = oDate.getMinutes();
	var nSeconds = oDate.getSeconds();

	(nHours < 10) && (nHours = "0" + nHours);
	(nMinutes < 10) && (nMinutes = "0" + nMinutes);
	(nSeconds < 10) && (nSeconds = "0" + nSeconds);

	switch(true) {
		case(oTime === 'y-m-d'):
			return nYear + "-" + nMonth + "-" + nDate;
			break;
		case(oTime === 'y-m'):
			return nYear + "-" + nMonth;
			break;
		case(oTime === 'm-d'):
			return nMonth + "-" + nDate;
			break;
		case(oTime === 'h-m-s'):
			return nHours + ":" + nMinutes + ":" + nSeconds;
			break;
		case(oTime === 'm-s'):
			return nMinutes + ":" + nSeconds;
			break;
		case(oTime === 'h-m'):
			return nHours + ":" + nMinutes;
			break;
		case(oTime === 'y'):
			return nYear;
			break;
		case(oTime === 'd'):
			return nDate;
			break;
		case(oTime === 'w'):
			return "今天是星期" + "日一二三四五六".charAt(new Date().getDay());
			break;
		case(oTime === 'ZW'):
			return nYear + "年" + nMonth + "月" + nDate + "日  " + nHours + ":" + nMinutes + ":" + nSeconds;
			break;
		default:
			return nYear + "-" + nMonth + "-" + nDate + " " + nHours + ":" + nMinutes + ":" + nSeconds;
	}
}

//以下公共方法大多针对逻辑图和物理图
var oComFn = {
	tip:null,
	//面板tip
	panelTipFn:function(obj,data){
		var _this = this;
		if(data.direction == 0){
			var d_txt = '垂直方向';
		}else{
			var d_txt = '水平方向';
		}
		
		var t = obj.find("tspan>tspan");
		var optionBtn = '<a href="javascript:;" class="panel_layerTipBox_btn ml_10"><img src="img/notes.png"/></a>'
		var html = '<div class="layerTipBox pd_10">'+
						'<div class="mb_5 fs-14"><b>'+ data.name +'</b><b>('+ data.sNum +')</b>'+ optionBtn +'</div>'+
						'<div class="mb_5 fs-14"><b>'+ data.model +'</b></div>'+
						'<div class="sys_gray_c"><span>方向：'+ d_txt +'</span></div>'+
					'</div>';
		//弹出layer.tip			
		this.tip = layer.tips(
			html,
			// obj,
			obj.find("image"),
			{
				tips: [3, '#fff'],
				time: 0,
				area: 'auto',
				maxWidth: 500,
			}
		);
		
		//面板参数弹窗
		$('body').on("click",".panel_layerTipBox_btn",function(){
			console.log(data);
			layer.closeAll();
			$(".layui-layer-shade").remove();
			
			//回显值
			for(var k in data){
				$(".input_panel_"+k).val(data[k]);
			}
			
			setTimeout(function(){
				
				_this.openLayerFn(
					$(".panel_param_form_layer"),
					"面板参数",
					["取消","确定"],
					function(a,b){
						
					},
					function(a,b){
						
					},
					function(a,b){
						//删除过多的遮罩层
						$(".layui-layer-shade").each(function(i){
							if(i > 0) $(this).remove();
						})
					}
				);
				
			},500);
			
			//停止图表播放器的播放
			_this.stopPlayInter();
		});
	},
	//逆变器tip
	invTipFn:function(obj,data){
		var _this = this;
		
		
		var optionBtn = '<a href="javascript:;" class="inv_layerTipBox_btn ml_10"><img src="img/notes.png"/></a>'
		var html = '<div class="layerTipBox pd_10">'+
						'<div class="mb_5 fs-14"><b>'+ data.name +'</b><b>('+ data.sNum +')</b>'+ optionBtn +'</div>'+
						'<div class="mb_5 fs-14"><b>'+ data.model +'</b></div>'+
						'<div class="mb_5 fs-12"><span>制造商:'+ data.manufacturer +'</span></div>'+
					'</div>';
		this.tip = layer.tips(
			html,
			obj, {
				tips: [3, '#fff'],
				time: 0,
				area: 'auto',
				maxWidth: 500,
			}
		);
		
		$('body').on("click",".inv_layerTipBox_btn",function(){
			console.log(data);
			layer.closeAll();
			$(".layui-layer-shade").remove();			
			//回显值
			for(var k in data){
				$(".input_inv_"+k).val(data[k]);
			}
			
			setTimeout(function(){
				
				_this.openLayerFn(
					$(".inv_param_form_layer"),
					"逆变器参数",
					["取消","确定"],
					function(a,b){
						
					},
					function(a,b){
						
					},
					function(a,b){
						//删除过多的遮罩层
						$(".layui-layer-shade").each(function(i){
							if(i > 0) $(this).remove();
						})
					}
				);
				
			},500)
			
			//停止图表播放器的播放
			_this.stopPlayInter();
			
		});
	},
	closeTipFn:function(){
		layer.close(this.tip);
	},
	/**
	 * 打开自定义弹窗
	 * @param {Object} obj 容器对象
	 * @param {String} sTitle 标题
	 * @param {Array} aBtn 按钮数组 
	 * @param {Function} btn1Fn 按钮1点击回调函数
	 * @param {Function} btn2Fn 按钮2点击回调函数
	 * @param {Function} succFn 弹窗打开成功回调函数
	 * @param {Array} aArea 弹窗宽高，不传就自适应
	 * */
	openLayerFn: function(obj, sTitle, aBtn, btn1Fn, btn2Fn, succFn,aArea) {
		layer.open({
			type: 1, //Page层类型
			//area: ['34%', 'auto'], //高宽
			area: aArea || ['auto', 'auto'], //高宽
			title: sTitle,
			shade: 0.6, //遮罩透明度
			maxmin: true, //允许全屏最小化
			anim: 5, //0-6的动画形式，-1不开启
			// offset:['center', 'center'], 
			content: obj,
			btn: aBtn,
			//btn: ['取消', '保存'],
			btn1: function(index, layero) {
				console.log('取消');
				layer.closeAll();
				btn1Fn(index, layero);
			},
			btn2: function(index, layero) {
				// layer.closeAll();
				console.log('保存');
				btn2Fn(index, layero);
				return false;
			},
			success: function(index, layero) {
				succFn(index, layero);
				console.log('succ')
			},
			cancel:function(){//关闭按钮回调
				$(".layui-layer-shade").remove();
			}
		});
	},
	/**
	 * 将电站数据所有优化器打散为一维数组
	 * @param {Object} oSite 后台数据模型
	 * @return {Array}
	 * */
	backSiteDataCf:function(oSite){
		var arr = oSite.inverter;
		var list = [];
		for(var i=0;i<arr.length;i++){
			var len = arr[i].panelList.length;
			for(var j=0;j<len;j++){
				arr[i].panelList[j].ry = 5;
				arr[i].panelList[j].rx = 5;
				list.push(arr[i].panelList[j]);
			}
		}
		return list;
	},
	//初始化工具
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
	zoomToolData:{//缩放工具数据配置
		min:1,
		max:200,
		view_min:0.1,
		view_max:2,
		curr_view_v:1,//当前缩放scale值
	},
	zoom:null,
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
	//缩放回调函数
	zoomResFn:function(){
		var _this = this;
		//_this.zoom.translate()该值会使得缩放是以中心缩放
		
		d3.select("#svg_g").attr("transform",
			// "translate(" + _this.zoom.translate() + ")" + 
			"scale(" + _this.zoom.scale() + ")"
		);
		
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
	//递增svg高度
	incSvgHeight:function(selector){
		var h = d3.select(selector).attr("height")*1;
		h += 500;
		d3.select(selector).attr("height",h);
	},
	//停止图表播放器的播放
	stopPlayInter:function(){
		if(bPlayback && play){
			bPlayback = false;
			clearInterval(play);
			$('.tp_playImg').addClass('play').removeClass('pause');
		}
	},
	//判断是否tigo厂商,并且监听弹窗事件
	tigoLayoutLayer:function(){
		var _this = this;
		//判断是否tigo厂商
		if(localStorage.getItem("manufacturerId") == 0){
			$(".editLayerBtnBox").removeClass("hide");
		}
		$(".editLayerBtn").on("click",function(){
			_this.openLayerFn(
				$(".editPL_layer"),
				"修改面板布局",
				["取消","确定"],
				function(a,b){
					
				},
				function(a,b){
					
				},
				function(a,b){
					
				}
			);
		});
	},
	//针对site_data数据随机更新数据（site_data）
	site_data_update_random:function(){
		var $site_data = site_data;
		$site_data.power = $.randNum(1000, 5000);
		for(var i=0;i<$site_data.inverter.length;i++){
			$site_data.inverter[i].power = $.randNum(1, 500);
			var len = $site_data.inverter[i].panelList.length;
			for(var j=0;j<len;j++){
				$site_data.inverter[i].panelList[j].power = $.randNum(1, 200);
			}
		}
		return $site_data;
	},
	//循环遍历一天（分钟刻度）的主要面板数据，为其随机生成各个刻度的数据
	/**
	 * 以几分钟为间隔，获取两个时间范围内的所有时间点，返回数组
	 * @param {String} startDate 开始时间（yyyy-mm-dd hh:mm:ss）
	 * @param {String} endDate 结束时间（yyyy-mm-dd hh:mm:ss）
	 * @param {Number} space 时间间隔（单位分钟），默认间隔30分钟
	 * @param {Boolean} isReverse 时间点是否从结束时间开始计算返回，如true，则倒叙，否则或者不传为正序
	 * */
	getDateArr:function(startDate, endDate, space, isReverse){
		var _this = this;
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
			aRes.push(_this.nowtime2(dateArray[i]));
		}
		aRes.unshift('00:00');
		
		var _oDateArr = [];
		for(var i=0,len=aRes.length;i<len;i++){
			a_obj = site_data.inverter;
			_oDateArr.push({				
				inverter:_this.getDataset(JSON.stringify(a_obj)),//主要逆变器数据，
				name:site_data.name,//电站名称
				power:$.randNum(1000, 5000),//电站产生功率
				t:aRes[i]
			});
		}
	
		return _oDateArr;
	},
	
	//数据源获取
	getDataset:function(mmp){
		var aData = JSON.parse(mmp);
		var _this = this;
		for(var k2=0;k2<aData.length;k2++){
			aData[k2].power = $.randNum(100, 500);	
			var k3_len = aData[k2].panelList.length;
			for(var k3=0;k3<k3_len;k3++){
				aData[k2].panelList[k3].power = $.randNum(0, 100)
			}
		}
		return aData;
	},
	
	/**
	 * 系统时间格式转化为 hh-mm-ss时间格式
	 * @param {String} dt 系统时间格式时间
	 * */
	nowtime2:function(dt){
		return(
			(dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
			":" +
			(dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) 
		);
	},
	/**
	 * 根据年月日时间格式获取UTC年月日时分的时间戳格式
	 * @param {String} sTime yyyy-mm-dd年月日时间格式
	 * @return {Number}
	 * */
	get_UTC_nTime:function(sTime){
		var year = sTime.slice(0,4)*1;
		var month = sTime.slice(5,7)*1 - 1;
		var day = sTime.slice(8,10)*1;
		return  Date.UTC(year, month, day, 0, 0);
	},	
	//引入公共的面板逆变器左边菜单html片段
	importLeftNavHtml:function(callback){
		//d3 引入左边逆变器面板菜单html片段
		d3.html("leftNavHtml.html", function(error, html) {
			if(error){                                     
				console.log(error);                        
			}else{
				//document.body.appendChild(html.firstChild);//添加DOM节点  
				window.onload = function(){
					var div = document.createElement('div');
					div.appendChild(html);
					document.getElementById("nav_box").appendChild(div);//添加DOM节点 
					if(callback) callback();
				}
				
			}
		});
	},
	/**
	 * 监听左边逆变器面板菜单点击事件
	 * @param {Function} callback 回调函数，携带参数1，面板id，参数2，面板所有参数
	 * */
	LN_panelClickEvent:function(callback){
		//左边菜单选择优化器样式
		$('body').on("click", '.panel_LV3>a>span', function() {
			
			oComFn.LN_panelClickUi(this);
			
			var mainData = $(this).parents(".panel_LV3").attr("data-main");
			mainData = JSON.parse(mainData);
			var dataId = $(this).parents(".panel_LV3").attr("data-id");
			//点击之后的回调函数
			if(callback) callback(dataId,mainData);
			
			// return false;
		});
	},
	//根据参数数据，将对应数据的面板列表展示且高亮
	focusPanelFn:function(data){
		$(".panel_LV3>a>span").each(function(i){
			var mainData = $(this).parents(".panel_LV3").attr("data-main");
			mainData = JSON.parse(mainData);
			if(mainData.id == data.id && 
			mainData.model == data.model && 
			mainData.name == data.name){
				console.log($(this).text());
				// $(this).click();
				oComFn.LN_panelClickUi(this);
				var p1 = $(this).parents("ul").prev(".inactive");
				p1.each(function(){
					if(!$(this).hasClass("inactives")){						
						// $(this).trigger("click");
						$(this).addClass('inactives');
						$(this).siblings('ul').slideDown(100).children('li');
					}
				});
			}
		});
	},
	//左边菜单点击面板子列表添加样式
	LN_panelClickUi:function(_this){
		$(".panel_LV1>a>span,.panel_LV2>a>span,.panel_LV3>a>span").removeClass('hover');		
		$(_this).parents('.panel_LV2').children('a').children('span').addClass('hover');
		$(_this).parents('.panel_LV1').children('a').children('span').addClass('hover');
		$(_this).addClass('hover');
		
		$('.panel_LV3>a>span').removeClass("fuzzy");
	},
	/**
	 * 普通ajax请求
	 * @param {String} murl 请求地址
	 * @param {Object} mdata 请求数据
	 * @param {String} method 请求类型
	 * @param {Function} successFn 请求成功的回调函数
	 * */
	ajax_method:function(murl, mdata, method, successFn){
		$.ajax({
			type: method,
			url: murl,
			dataType: "json",
			data: mdata || {},
			async: true,
			timeout: 10000,		
			beforeSend: function() {
				layerLoad = layer.load(3);
			},
			error: function(data) {
				layer.close(layerLoad);
				layer.alert("请求失败，请检查服务器端！", {
					icon: 5
				});
			},
			success: function(data) {
				var data = (typeof data == "object" ? data : JSON.parse(data));
				layer.close(layerLoad);
				if(data.result == 1) {					
					successFn(data);
				}
				else{
					layer.alert(JSON.stringify(data));
				}
				
			}
		});
		
	},
	//本地后台地址
	ajaxUrl_local: "http://" + window.location.host,
	//是否属于tigo逆变器
	TigoInvFn:function(){
		if(localStorage.getItem("manufacturerId") == 1){
			$(".editLayerBtnBox").addClass("hide");
		}else{
			$(".editLayerBtnBox").removeClass("hide");
		}
		$(".editLayerBtnBox").on("click",function(){
			oComFn.openLayerFn(
				$(".editPL_layer"),
				"修改面板布局",
				["取消","确定"],
				function(a,b){
					
				},
				function(a,b){
					
				},
				function(a,b){
					
				}
			);
		});
	},
};





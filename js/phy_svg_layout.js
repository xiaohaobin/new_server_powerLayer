//面板布局========================================================================================================================================================================
var inv_img_w = 107 * localStorage.getItem("sunCanvasW") / 1486;
var panel_img_w = 62 * localStorage.getItem("sunCanvasW") / 1486;
var s_d_c_ratio = localStorage.getItem("sunCanvasW") * 1 / 1486;
var x_inc = 25 * localStorage.getItem("sunCanvasW") / 1486;
var vueApp = null; //vue 对象
//缩略图宽高
var thum_w = localStorage.getItem("sunCanvasW") * 200 / 1486;
var thum_h = thum_w * (localStorage.getItem("sunCanvasH") * 1 - 80) / localStorage.getItem("sunCanvasW");

//site_data

//面板布局的配置参数
var site_data_confing = {
	inverterImgSize: { //动态获取逆变器svg图大小
		w: inv_img_w,
		h: 72 * inv_img_w / 107,
	},
	panelImgSize: { //动态获取面板svg图大小
		w: panel_img_w,
		h: 85 * panel_img_w / 62
	},

	ratio: s_d_c_ratio, //分辨率比例
	firstInvPos: { //第一个逆变器svg图的位置
		x: 100 * s_d_c_ratio,
		y: 20 * 100 * s_d_c_ratio / 100 //(按比例计算的y轴位置)
	},
	firstPanPos: { //第一个逆变器的第一个面板的位置
		x: 100 * s_d_c_ratio,
		y: 90 * 100 * s_d_c_ratio / 100 //(按比例计算的y轴位置)
	},
	//增量
	panel_increment: {
		add_x: x_inc, //面板横向增量
		add_y: x_inc * 20 / 25, //面板纵向增量，	
	},
	com_y_inc: x_inc * 20 / 25, //通用纵向增量
	col_count_panel: 14, //一行显示的个数
};

/**
 * 定义对应逆变器组图高度（逆变器高度+间距+面板高度）
 * @param {Array} arr 逆变器数组
 * @param {Function} callback 回调函数
 * */
function inv_panel_Height(arr, callback) {
	var inc = site_data_confing.com_y_inc;
	var panel_h = site_data_confing.panelImgSize.h;
	for (var i = 0; i < arr.length; i++) {
		var nCeil = Math.ceil(arr[i].panelList.length / site_data_confing.col_count_panel);
		var totalH = inc + inc + site_data_confing.inverterImgSize.h + (nCeil * panel_h) + (nCeil * inc);
		arr[i].totalH = totalH;
	}
	if (callback) callback(arr);
}

/**
 * 定位逆变器x轴和y轴位置，该函数必须在inv_panel_Height函数执行之后执行
 * @param {Array} arr 逆变器数组
 * @param {Function} callback 回调函数
 * */
function setInvPos(arr, callback) {
	function backIncTotal(n, list) {
		var res = 0;
		for (var i = 0; i < n; i++) {
			res += t_list[i];
		}
		return res;
	}
	if (arr[0].totalH) {
		var inc = site_data_confing.com_y_inc;
		var inv_x = site_data_confing.firstInvPos.x; //逆变器x轴位置
		//var inv_y = inc;
		var t_list = [];
		for (var i = 0; i < arr.length; i++) {
			t_list.push(arr[i].totalH);
		}

		for (var j = 0; j < arr.length; j++) {
			var inv_y = (j + 1) * inc + backIncTotal(j, t_list);
			arr[j].x = inv_x;
			arr[j].y = inv_y;
		}
		if (callback) callback(arr);

	} else {
		layer.alert("先执行 inv_panel_Height 函数才可执行该函数");
	}
}

//定义逆变器面板的x坐标轴
function setPanelPos_x(arr, callback) {
	var f_x = site_data_confing.firstPanPos.x;
	var p_w = site_data_confing.panelImgSize.w;
	var p_x_inc = site_data_confing.panel_increment.add_x; //面板横向增量
	var col_count = site_data_confing.col_count_panel;
	for (var i = 0; i < arr.length; i++) {
		var len = arr[i].panelList.length;
		for (var j = 0; j < len; j++) {
			arr[i].panelList[j].x = f_x + (j % col_count * p_w) + (j % col_count * p_x_inc)
		}
	}
	if (callback) callback(arr);
}

//定义逆变器面板的y坐标轴,必须在setInvPos函数之后执行
function setPanelPos_y(arr) {
	var inc = site_data_confing.com_y_inc;
	var inv_h = site_data_confing.inverterImgSize.h;
	var panel_h = site_data_confing.panelImgSize.h;
	var col_count = site_data_confing.col_count_panel;
	for (var i = 0; i < arr.length; i++) {
		//prevInvH 指的是上一个逆变器的高度+y轴位置==>前面所有逆变器组的高度
		if (i > 0) {
			var prevInvH = arr[i - 1].y + arr[i - 1].totalH;
		} else {
			var prevInvH = 0;
		}
		var len = arr[i].panelList.length;
		for (var j = 0; j < len; j++) {
			var _res = inc * 2 + inv_h + prevInvH;
			var index_p_h = (Math.ceil((j + 1) / col_count) - 1) * panel_h;
			var index_inc = (Math.ceil((j + 1) / col_count) - 1) * inc;
			arr[i].panelList[j].y = _res + index_p_h + index_inc
		}
	}
	return arr;
}

//定义电站配置数据，逆变器和面板在svg中的大小
function setSiteConfSize(arr) {
	for (var i = 0; i < arr.length; i++) {
		var len = arr[i].panelList.length;
		arr[i].w = site_data_confing.inverterImgSize.w;
		arr[i].h = site_data_confing.inverterImgSize.h;
		for (var j = 0; j < len; j++) {
			arr[i].panelList[j].w = site_data_confing.panelImgSize.w;
			arr[i].panelList[j].h = site_data_confing.panelImgSize.h;
		}
	}
	return arr;
}

//随机修改site_data里面主要数据
function site_data_update_random(aData) {
	//$.randNum(min, max)
	for (var i = 0; i < aData.length; i++) {
		aData[i].power = $.randNum(1, 1000);
		var len = aData[i].panelList.length;
		for (var j = 0; j < len; j++) {
			aData[i].panelList[j].power = $.randNum(1, 500);
		}
	}
	return aData;
}


//重新定义svg参数  site_data的数据
//定义对应逆变器组图高度（逆变器高度+间距+面板高度）
inv_panel_Height(site_data.inverter, function(arr) {
	//定义电站配置数据，逆变器和面板在svg中的大小
	setSiteConfSize(arr);
	//定位逆变器x轴和y轴位置
	setInvPos(arr, function(res) {
		//定位面板y轴
		setPanelPos_y(res);
		//定位面板x轴
		setPanelPos_x(res, function(data) {
			// console.log(data,"计算面板x轴y轴")
			loadMainSvg(data);
			console.log(site_data, "已经更改的电站数据");
			console.log(site_data_update_random(site_data.inverter), "随机生产");
		});

	});
});

/**
 * vue加载svg主要面板动画
 * @param {Array} aParam 配置好的数据
 * 
 * */
function loadMainSvg(aParam) {
	vueApp = new Vue({
		el: "#mainAppBox",
		data: {
			mainW: localStorage.getItem("sunCanvasW") * 1 || 1000,
			mainH: localStorage.getItem("sunCanvasH") * 1 - 80 || 500, //主图高度
			thumW: thum_w,
			thumH: thum_h, //缩略图高度
			mainData: [250, 210, 170, 130, 90], //主要数据
			mainData2: [{
				w: 62,
				h: 85,
				rx: 5,
				ry: 5,
				x: 0,
				y: 0,
				txtData: {
					name: "cp007"
				}
			}, ],
			ratioW: 0, //宽度倍率
			ratioH: 0, //高度倍率
			oSvg: null, //svg画布主要对象
			thum_oSvg: null, //缩略图画布主要对象
			zoom: null, //缩放svg函数对象
			svg_g: null,
			siteData: site_data, //已经配置好的电站逆变器面板数据（对象数据）
			zoomToolData: { //缩放工具数据配置
				min: 1,
				max: 200,
				view_min: 0.1,
				view_max: 2,
				curr_view_v: 1, //当前缩放scale值
			},
			staticData: {
				invNum: 0, //逆变器个数
				panelNum: 0, //优化器个数
			}
		},
		created: function() {
			console.log(aParam, "计算面板x轴y轴");
			this.ratioW = this.mainW / this.thumW;
			this.ratioH = this.mainH / this.thumH;
			this.staticData.invNum = aParam.length; //逆变器个数
			this.staticData.panelNum = this.createPanelConf().length; //面板个数

			//定义zoom函数
			this.zoomFn(this.svg_g);

			//抽取面板数据独立为一个数组
			console.log(this.createPanelConf(), "转换后的数据");
		},
		updated: function() {

		},
		mounted: function() {

			var _this = this;
			//初始化主图svg
			this.initSvgFn(".svgBox", function(svg) {
				_this.createRectFn(svg);
			});

			//初始化缩略svg
			this.thum_initSvgFn(".t_svgBox", function(svg) {
				_this.thum_createRectFn(svg);
			});

			//初始化缩放工具
			_this.initZoomSlide();
			
			
			//加载图表
			CurpowerChart(panel_day_data);

		},
		watch: {

		},
		methods: {
			/**
			 * 初始化大svg画布
			 * @param {String} selector 选择器字符串
			 * @param {Function} fn 回调函数
			 * */
			initSvgFn: function(selector, fn) {
				var _this = this;
				d3.select("#svg_panel_box")
					.style("width", _this.mainW + "px")
					.style("height", _this.mainH + "px");

				//初始化画布，并为父元素添加样式
				_this.oSvg = d3.select(selector) //选择文档中的body元素
					.style("width", _this.mainW + "px")
					.style("height", _this.mainH + "px")
					.append("svg") //添加一个svg元素
					.attr("id", "mainView")
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
			thum_initSvgFn: function(selector, fn) {
				var _this = this;

				//每次绘制前删除之前的图形（这是一种简单有效的动画理论，但是比较消耗资源，之后会介绍如何节省资源完成需求）
				d3.select("#thumbSvg").remove();

				//初始化画布，并为父元素添加样式
				_this.thum_oSvg = d3.select(selector) //选择文档中的body元素
					.style("width", _this.thumW + "px")
					.style("height", _this.thumH + 30 + "px")
					.append("svg") //添加一个svg元素
					.attr("id", "thumbSvg")
					.attr("width", _this.thumW) //设定宽度
					.attr("height", _this.thumH); //设定高度

				//回调函数
				fn(_this.thum_oSvg);
			},
			//主图矩形生产
			createRectFn: function(svg) {
				var _this = this;
				if (svg) {
					_this.svg_g = d3.select("#mainView").append("g")
						.attr("id", "svg_g")
						.attr("width", _this.mainW)
						.attr("height", _this.mainH)
						.call(_this.zoom)



					//新增逆变器
					d3.select("#svg_g").append("g").attr("id", "invlBox");
					d3.select("#invlBox").selectAll("rect")
						.data(_this.siteData.inverter)
						.enter()
						.append("rect")
						.attr("x", function(d, i) {
							return d.x - 5 * site_data_confing.ratio;
						})
						.attr("y", function(d, i) {
							return d.y;
						})
						.attr("width", function(d, i) {
							return d.w + 50 * site_data_confing.ratio;
						})
						.attr("height", function(d, i) {
							return d.h;
						})
						.attr("rx", 5)
						.attr("ry", 5)
						.attr("fill", "#fff");
					//功率	
					d3.select("#invlBox").selectAll(".inv_txt_sign")
						.data(_this.siteData.inverter)
						.enter()
						.append("text")
						.attr("x", function(d, i) {
							return d.x + (d.w / 2) + 5 * site_data_confing.ratio
						})
						.attr("y", function(d, i) {
							return d.y + 25 * site_data_confing.ratio;
						})
						.attr("fill", "#009cff")
						.attr("data-id", function(d, i) {
							return d.id;
						})
						.attr("class", "inv_txt_sign")
						.text(function(d, i) {
							return d.power + "kwh";
						})
						.style("font-size", 15 * site_data_confing.ratio + "px");


					//添加inv名称
					d3.select("#invlBox").selectAll(".inv_tspan")
						.data(_this.siteData.inverter)
						.enter()
						.append("text")
						.attr("x", function(d, i) {
							return d.x + (d.w / 2) + 5 * site_data_confing.ratio
						})
						.attr("y", function(d, i) {
							return d.y + 55 * site_data_confing.ratio;
						})
						.text(function(d, i) {
							return d.name;
						})
						.style("font-size", 15 * site_data_confing.ratio + "px")
						.attr("fill", "#009cff")
						.attr("class", "inv_tspan")



					//site_data_confing.ratio

					d3.select("#invlBox").selectAll("g")
						.data(_this.siteData.inverter)
						.enter()
						.append("g")
						.attr("class", "inv_img")
						.append("image")
						.attr("x", function(d, i) {
							return d.x - 5 * site_data_confing.ratio;
						})
						.attr("y", function(d, i) {
							return d.y + 15 * site_data_confing.ratio;
						})
						.attr("width", function(d, i) {
							return d.w * 0.6;
						})
						.attr("height", function(d, i) {
							return d.h * 0.6;
						})
						.attr("rx", 5)
						.attr("ry", 5)
						.attr("href", "img/inverter.png")
						.on("click", function(d, i, e) {
							console.log(d, i, e);
							//显示tip
							oComFn.invTipFn($(this), d);
						});


					//新增面板
					d3.select("#svg_g").append("g").attr("id", "panelBox");
					d3.select("#panelBox").selectAll(".panel_img")
						.data(_this.mainData2) //遍历函数
						.enter() //指定选择集的enter部分，即进入rect
						.append("g")
						.attr("class", "panel_img")
						.attr("status", function(d, i) {
							return d.status;
						})
						.on("mouseenter", function(d, i) {
							if (d.status == 3) return;
							//显示同组串
							_this.stringShowFn(d, i);
							//显示tip
							// oComFn.panelTipFn($(this),d);
						})
						.on("mouseleave", function(d, i) {
							if (d.status == 3) return;
							//不显示同组串
							_this.stringHideFn(d, i);

						})
						.append("image")
						.attr("x", function(d, i) {
							return d.x;
						})
						.attr("y", function(d, i) {
							return d.y;
						})
						.attr("width", function(d, i) {
							return d.w;
						})
						.attr("height", function(d, i) {
							return d.h;
						})
						.attr("rx", function(d, i) {
							return d.rx;
						})
						.attr("ry", function(d, i) {
							return d.ry;
						})
						.attr("string", function(d, i) {
							return d.string;
						})
						.attr("href", function(d, i) {
							if (d.status == 0) {
								return "img/panel_normal.png";
							} else if (d.status == 1) {
								return "img/panel_outline.png";
							} else if (d.status == 2) {
								return "img/panel_error.png";
							} else {
								return "img/panel_no.png";
							}
						})
					//面板功率	
					d3.selectAll(".panel_img").append("a")
						.attr("class", "imgage_txt")
						.attr("string_sign", function(d, i) {
							return d.string;
						})
						.append('text')
						.attr("x", function(d, i) {
							return d.x + 10 * site_data_confing.ratio;
						})
						.attr("y", function(d, i) {
							return d.y + 20 * site_data_confing.ratio;
						})
						.text(function(d, i) {
							if (d.status != 3) {
								return d.power;
							}
						})
						.attr("class", "panel_txt_sign")
						.attr("data-id", function(d, i) {
							return d.id
						})
						.attr("data-pid", function(d, i) {
							return d.pid
						})
						.style("font-size", 12 * site_data_confing.ratio + "px")
						.attr("fill", "#fff");

					//面板版本
					d3.selectAll(".imgage_txt").each(function(d, i) {
						d3.select(this).append("text")
							.attr("x", function(d, i) {
								return d.x + 10 * site_data_confing.ratio;
							})
							.attr("y", function(d, i) {
								return d.y + 35 * site_data_confing.ratio;
							})
							.style("font-size", 12 * site_data_confing.ratio + "px")
							.attr("fill", "#fff")
							.text(function(d, i) {
								if (d.status != 3) {
									return "Wh";
								}
							})
							.attr("class", "panel_tspan")
							.append("tspan")
							.attr("x", function(d, i) {
								return d.x + 5 * site_data_confing.ratio;
							})
							.attr("y", function(d, i) {
								return d.y + 30 * site_data_confing.ratio + d.h / 2;
							})
							.text(function(d, i) {
								if (d.status != 3) {
									return d.model;
								}
							});
					});


					//监听事件，点击弹出参数设置
					d3.selectAll(".panel_img").on("click", function(d, i) {
						if (d.status == 3) return;

						//显示tip
						oComFn.panelTipFn($(this), d);
					});

					//点击其他地方取消tip
					d3.select("#mainView").on("click", function(e) {
						var e = e || window.event; //浏览器兼容性     
						var elem = e.target || e.srcElement; //当前事件触发目标
						console.log($(elem), $(elem).attr("id"));
						if ($(elem).attr("id") == "mainView") oComFn.closeTipFn();
						return false;
					});



					//每秒更新数据
					// setInterval(function(){
					// 	var n_data = site_data_update_random(site_data.inverter);
					// 	console.log(n_data);
					// 	_this.updateDataFn(n_data);
					// },1000);

				}

			},
			//缩略图矩形生产
			thum_createRectFn: function(svg) {
				console.log(svg, 111);
				var _this = this;
				if (svg) {
					_this.svg_g = d3.select("#thumbSvg").append("g")
						.attr("id", "t_svg_g")
						.attr("width", _this.thumW)
						.attr("height", _this.thumH)

					//新增逆变器
					d3.select("#t_svg_g").append("g").attr("id", "t_invlBox");
					d3.select("#t_invlBox").selectAll("rect")
						.data(_this.siteData.inverter)
						.enter()
						.append("rect")
						.attr("x", function(d, i) {
							return (d.x - 5 * site_data_confing.ratio) / _this.ratioW;
						})
						.attr("y", function(d, i) {
							return d.y / _this.ratioH;
						})
						.attr("width", function(d, i) {
							return (d.w + 50 * site_data_confing.ratio) / _this.ratioW;
						})
						.attr("height", function(d, i) {
							return d.h / _this.ratioH;
						})
						.attr("fill", "#fff");

					d3.select("#t_invlBox").selectAll("text")
						.data(_this.siteData.inverter)
						.enter()
						.append("text")
						.attr("x", function(d, i) {
							return (d.x + (d.w / 2) + 5 * site_data_confing.ratio) / _this.ratioW;
						})
						.attr("y", function(d, i) {
							return (d.y + 25 * site_data_confing.ratio) / _this.ratioH
						})
						.attr("fill", "#009cff")
						.text(function(d, i) {
							return d.power + "kwh";
						})
						.style("font-size", (15 * site_data_confing.ratio) / _this.ratioH + "px")
						.append('tspan')
						.attr("x", function(d, i) {
							return (d.x + (d.w / 2) + 5 * site_data_confing.ratio) / _this.ratioW
						})
						.attr("y", function(d, i) {
							return (d.y + 55 * site_data_confing.ratio) / _this.ratioH
						})
						.text(function(d, i) {
							return d.name;
						})


					//site_data_confing.ratio

					d3.select("#t_invlBox").selectAll("g")
						.data(_this.siteData.inverter)
						.enter()
						.append("g")
						.attr("class", "t_inv_img")
						.append("image")
						.attr("x", function(d, i) {
							return (d.x - 5 * site_data_confing.ratio) / _this.ratioW;
						})
						.attr("y", function(d, i) {
							return (d.y + 15 * site_data_confing.ratio) / _this.ratioH
						})
						.attr("width", function(d, i) {
							return (d.w * 0.6) / _this.ratioW;
						})
						.attr("height", function(d, i) {
							return (d.h * 0.6) / _this.ratioH
						})
						.attr("href", "img/inverter.png");


					//新增面板
					d3.select("#t_svg_g").append("g").attr("id", "t_panelBox");
					d3.select("#t_panelBox").selectAll(".t_panel_img")
						.data(_this.mainData2) //遍历函数
						.enter() //指定选择集的enter部分，即进入rect
						.append("g")
						.attr("class", "t_panel_img")
						.append("image")
						.attr("x", function(d, i) {
							return d.x / _this.ratioW;
						})
						.attr("y", function(d, i) {
							return d.y / _this.ratioH;
						})
						.attr("width", function(d, i) {
							return d.w / _this.ratioW;
						})
						.attr("height", function(d, i) {
							return d.h / _this.ratioH;
						})

						.attr("string", function(d, i) {
							return d.string;
						})
						.attr("href", function(d, i) {
							if (d.status == 0) {
								return "img/panel_normal.png";
							} else if (d.status == 1) {
								return "img/panel_outline.png";
							} else if (d.status == 2) {
								return "img/panel_error.png";
							} else {
								return "img/panel_no.png";
							}
						})
						.attr("data-role", "t_mainPanel");

					d3.selectAll(".t_panel_img").append("a")
						.attr("class", "t_imgage_txt")
						.append('text')
						.attr("x", function(d, i) {
							return (d.x + 10 * site_data_confing.ratio) / _this.ratioW
						})
						.attr("y", function(d, i) {
							return (d.y + 20 * site_data_confing.ratio) / _this.ratioH
						})
						.text(function(d, i) {
							if (d.status != 3) {
								return d.power;
							}
						})
						.style("font-size", (12 * site_data_confing.ratio) / _this.ratioW + "px")
						.attr("fill", "#fff")

						.append("tspan")
						.attr("x", function(d, i) {
							return (d.x + 10 * site_data_confing.ratio) / _this.ratioW;
						})
						.attr("y", function(d, i) {
							return (d.y + 35 * site_data_confing.ratio) / _this.ratioH
						})
						.text(function(d, i) {
							if (d.status != 3) {
								return "Wh";
							}
						})
						.append("tspan")
						.attr("x", function(d, i) {
							return (d.x + 5 * site_data_confing.ratio) / _this.ratioW
						})
						.attr("y", function(d, i) {
							return (d.y + 30 * site_data_confing.ratio + d.h / 2) / _this.ratioH
						})
						.text(function(d, i) {
							if (d.status != 3) {
								return d.model;
							}
						});


				}

			},
			//面板组串效果（鼠标一进一出的效果）
			//鼠标进入面板
			stringShowFn(d, i) {
				d3.selectAll(".imgage_txt").selectAll("text,tspan").each(function(k, e) {
					if (d.string == k.string && d.pid == k.pid) {
						d3.select(this).attr("fill", "#000");
					}
				});
			},
			//鼠标离开面板
			stringHideFn(d, i) {
				d3.selectAll(".imgage_txt").selectAll("text,tspan").each(function(k, e) {
					if (d.string == k.string && d.pid == k.pid) {
						d3.select(this).attr("fill", "#fff");
					}
				});
			},
			zoomResFn: function() {
				var _this = this;
				//_this.zoom.translate()该值会使得缩放是以中心缩放
				d3.select("#svg_g").attr("transform",
					// "translate(" + _this.zoom.translate() + ")" + 
					"scale(" + _this.zoom.scale() + ")"
				);

			},
			//定义zoom函数
			zoomFn: function(svg) {
				var _this = this;
				this.zoom = d3.behavior.zoom().scaleExtent([0.1, 2]).on("zoom", function(d, i) {
					_this.zoomResFn();
					//同步
					var val = _this.zoom.scale();
					_this.zoomToolData.curr_view_v = val;
					$(".ratio_val").text((val * 100).toFixed(0) + "%");
					$("#slider-vertical").slider("value", (val * 100).toFixed(0));

				});

			},
			//按钮点击放大缩小
			toTransformScaleFn: function(n) {
				console.log(n);
				var _this = this;
				//						var clicked = d3.event.target,
				var direction = 1,
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
				direction = n; //1为放大，-1缩小
				target_zoom = _this.zoom.scale() * (1 + factor * direction);

				if (target_zoom < extent[0] || target_zoom > extent[1]) {
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
			interpolateZoom: function(translate, scale) {
				console.log(translate, scale, "fazhi");
				var _this = this;
				_this.zoomToolData.curr_view_v = scale;
				var res = (_this.zoomToolData.max / _this.zoomToolData.view_max * scale).toFixed(0);
				$("#slider-vertical").slider("value", res);
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
			createPanelConf: function() {
				var _this = this;
				var arr = _this.siteData.inverter;
				var list = [];
				for (var i = 0; i < arr.length; i++) {
					var len = arr[i].panelList.length;
					for (var j = 0; j < len; j++) {
						arr[i].panelList[j].ry = 5;
						arr[i].panelList[j].rx = 5;
						list.push(arr[i].panelList[j]);
					}
				}
				_this.mainData2 = list;
				return list;
			},
			//初始化缩放工具
			initZoomSlide: function() {
				var _this = this;
				// 滑块
				$("#slider-vertical").slider({
					orientation: "vertical",
					range: "min",
					min: 1,
					max: 200,
					value: 100,
					slide: function(event, ui) {
						//同步缩放值和滑块比例
						$(".ratio_val").text(ui.value + "%");
						_this.zoomToolData.curr_view_v = ui.value / 100;
						d3.select("#svg_g").attr("transform",
							"scale(" + _this.zoomToolData.curr_view_v + ")"
						);

					}
				});
				$(".ratio_val").text($("#slider-vertical").slider("value") + "%");
			},
			//更新逆变器和面板的power数据
			updateDataFn: function(aData) {
				var _this = this;
				//数据降维处理
				var list = [];
				for (var i = 0; i < aData.length; i++) {
					var len = aData[i].panelList.length;
					for (var j = 0; j < len; j++) {
						list.push(aData[i].panelList[j]);
					}
				}
				_this.mainData2 = list;

				//更新逆变器的power					
				d3.selectAll(".inv_txt_sign").each(function(d, i) {
					if (d.id == aData[i].id) {
						d3.select(this).text(aData[i].power + "kWh");
					}
				});

				//更新面板的power数据
				d3.selectAll(".panel_txt_sign").each(function(d, i) {
					if (d.status != 3) {
						if (d.id == _this.mainData2[i].id) {
							d3.select(this).text(_this.mainData2[i].power);
						}
					}

				});
			},

		}
	});
}
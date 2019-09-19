/**
 * @author 肖浩彬
 * @depend jquery.1.91.js
 * */
"use strict";

/**
 * 对象拓展函数,如果为数组，数组为哈希数组才有效
 * @param {Boolean} deep 是否深拷贝
 * @param {Object||Array} target 目标对象或者数组
 * @param {Object||Array} options 要并集的对象或者数组
 * */
function _extend(deep, target, options) {
	for(name in options) {
		copy = options[name];
		if(deep && copy instanceof Array) {
			target[name] = $.extend(deep, [], copy);
		} else if(deep && copy instanceof Object) {
			target[name] = $.extend(deep, {}, copy);
		} else {
			target[name] = options[name];
		}
	}
	return target;
}

(function($, window, document, undefined) {

	//延迟加载器
	var keyupTimer = null;

	try {
		/**************************************************全局插进*********************************************************************/
		$.extend({
			
			/**
			 * 浏览器地址指定携带的参数参数，返回指定的键值
			 * @param {String} name 要查询的地址参数的键
			 * @return {String} 
			 * */
			getQueryString: function(name) {
				var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
				var r = window.location.search.substr(1).match(reg);
				if(r != null) {
					return unescape(r[2]);
				}
				return null;
			},
			/**
			 * 获取地址栏所有参数，返回json数据格式
			 * @return {Object} 
			 **/
			oGetParam: function() {
				var search = location.search.replace(/^\s+/, '').replace(/\s+$/, '').match(/([^?#]*)(#.*)?$/); //提取location.search中'?'后面的部分//			
				if(!search) {
					return {};
				}
				var searchStr = search[0];
				var searchHash = searchStr.split('&');

				var ret = {};
				for(var i = 0, len = searchHash.length; i < len; i++) { //这里可以调用each方法
					var pair = searchHash[i];
					if((pair = pair.split('='))[0]) {
						var key = decodeURIComponent(pair.shift());
						var value = pair.length > 1 ? pair.join('=') : pair[0];

						if(value != undefined) {
							value = decodeURIComponent(value);
						}
						if(key in ret) {
							if(ret[key].constructor != Array) {
								ret[key] = [ret[key]];
							}
							ret[key].push(value);
						} else {
							ret[key] = value;
						}
					}
				}
				return ret;
			},
			//父页面和当前页面刷新加载
			pageReLoad: function() {
				if(window.parent.parent.parent.parent) {
					parent.parent.parent.parent.location.reload();
				} else if(window.parent.parent.parent) {
					parent.parent.parent.location.reload();
				} else if(window.parent.parent) {
					parent.parent.location.reload();
				} else if(window.parent) {
					parent.location.reload();
				} else {
					window.location.reload();
				}
			},
			/**
			 * 当前页面和父页面跳转到其他页面
			 * @param {String} Url Url指的是要跳转的路劲页面，如index.html
			 * */
			toNewPage: function(Url) {
				if(window.parent.parent.parent.parent) {
					parent.parent.parent.parent.location.href = Url;
				} else if(window.parent.parent.parent) {
					parent.parent.parent.location.href = Url;
				} else if(window.parent.parent) {
					parent.parent.location.href = Url;
				} else if(window.parent) {
					parent.location.href = Url;
				} else {
					window.location.href = Url;
				}
			},
			/**
			 * 判断是否移动端，移动端执行函数1（参数1）；否则执行函数2（参数2）
			 * @param {Function} fnMobile 移动端执行函数
			 * @param {Function} fnPc pc端执行函数
			 * */
			isMoblie: function(fnMobile, fnPc) {
				var sUserAgent = navigator.userAgent.toLowerCase();
				var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
				var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
				var bIsMidp = sUserAgent.match(/midp/i) == "midp";
				var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
				var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
				var bIsAndroid = sUserAgent.match(/android/i) == "android";
				var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
				var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
				if(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) { //移动端
					fnMobile();
				} else {
					fnPc();
				}
			},
			/**
			 * 判断值是否为空，回调函数
			 * @param {String} tmp 要判断的值
			 * @param {Function} NullFn 为null的回调
			 * @param {Function} noNullFn 为null的回调
			 * */
			isNull: function(tmp, NullFn, noNullFn) {
				if(!tmp && typeof(tmp) != "undefined" && tmp != 0) { //null
					//为null的回调
					NullFn();
				} else {
					//不为null的回调
					noNullFn();
				}
			},
			/**
			 * 返回浏览器的类型和版本
			 * @return {Object}
			 * */
			getExplorerInfo: function() {
				var explorer = window.navigator.userAgent.toLowerCase();
				//ie 
				if(explorer.indexOf("msie") >= 0) {
					var ver = explorer.match(/msie ([\d.]+)/)[1];
					return {
						type: "IE",
						version: ver
					};
				}
				//firefox 
				else if(explorer.indexOf("firefox") >= 0) {
					var ver = explorer.match(/firefox\/([\d.]+)/)[1];
					return {
						type: "Firefox",
						version: ver
					};
				}
				//Chrome
				else if(explorer.indexOf("chrome") >= 0) {
					var ver = explorer.match(/chrome\/([\d.]+)/)[1];
					return {
						type: "Chrome",
						version: ver
					};
				}
				//Opera
				else if(explorer.indexOf("opera") >= 0) {
					var ver = explorer.match(/opera.([\d.]+)/)[1];
					return {
						type: "Opera",
						version: ver
					};
				}
				//Safari
				else if(explorer.indexOf("Safari") >= 0) {
					var ver = explorer.match(/version\/([\d.]+)/)[1];
					return {
						type: "Safari",
						version: ver
					};
				}

			},
			/**
			 * 获取两个GPS经纬度之间的距离
			 * @param {Number} lat1 第一点的纬度
			 * @param {Number} lng1 第一点的经度
			 * @param {Number} lat2 第二点的纬度
			 * @param {Number} lng2 第二点的经度
			 * @returns {Number}
			 */
			getDistance: function(lat1, lng1, lat2, lng2) {
				function toRad(d) {
					var PI = Math.PI;
					return d * PI / 180.0;
				}
				var dis = 0;
				var radLat1 = toRad(lat1);
				var radLat2 = toRad(lat2);
				var deltaLat = radLat1 - radLat2;
				var deltaLng = toRad(lng1) - toRad(lng2);
				var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));

				return Math.ceil(dis * 6378137);
			},
			/**
			 * 含有规律的字符串数据转化为数组；（以字符串中的某个字段截取生成数组）
			 * @param {String} str 指的是大字符串
			 * @param {String} chart 指的是大字符串中的某个子字符串
			 * @param {Array}
			 * */
			stringToArray: function(str, chart) {
				var arrPerssion = [];
				if(str.indexOf(chart) >= 0) {
					var tempArray = str.split(chart);
					var returnArr = new Array();
					var i, len = tempArray.length;
					for(i = 0; i < len; i++) {
						returnArr.push(tempArray[i]);
					}

					return returnArr;
				} else {
					arrPerssion.push(str);
					return arrPerssion;
				}
			},
			/**
			 * 判断某字符串是否含有某个子字符串，如有，打印其第一次或者最后一次的索引
			 * @param {String} stringText 指的是整个字符串变量，
			 * @param {String} littleStr 指的是整个字符串变量中可能存在的字段,
			 * @param {Number} isFrist 是数值，为0，则是返回第一次出现的索引，为1，则是返回最后一次的索引
			 * @return {Number}
			 * */
			hasStr: function(stringText, littleStr, isFrist) {
				var str = stringText;
				var str2 = littleStr;
				var d = str.length - str.indexOf(str2);
				if(d > str.length) {
					return -1;
				} else {

					if(isFrist && isFrist == 0){
						return str.indexOf(str2)
					}
					else if(isFrist && isFrist == 1){
						return str.lastIndexOf(str2);
					}
						
				}
			},
			/**
			 * 序列化表单的字符串转化为对象
			 * @param {String} serializedParams 序列化表单的字符串。序列化的form数据，通过$("form").serialize()获取的，如：name=xhb&pwd=123
			 * @return {Object}
			 * */
			serializeToObj: function(serializedParams) {
				var obj = {};

				function evalThem(str) {
					var strAry = new Array();
					strAry = str.split("=");
					//使用decodeURIComponent解析uri 组件编码
					for(var i = 0; i < strAry.length; i++) {
						strAry[i] = decodeURIComponent(strAry[i]);
					}
					var attributeName = strAry[0];
					var attributeValue = strAry[1].trim();
					//如果值中包含"="符号，需要合并值
					if(strAry.length > 2) {
						for(var i = 2; i < strAry.length; i++) {
							attributeValue += "=" + strAry[i].trim();
						}
					}
					if(!attributeValue) {
						return;
					}
					var attriNames = attributeName.split("."),
						curObj = obj;
					for(var i = 0; i < (attriNames.length - 1); i++) {
						curObj[attriNames[i]] ? "" : (curObj[attriNames[i]] = {});
						curObj = curObj[attriNames[i]];
					}
					//使用赋值方式obj[attributeName] = attributeValue.trim();替换
					//eval("obj."+attributeName+"=\""+attributeValue.trim()+"\";");
					//解决值attributeValue中包含单引号、双引号时无法处理的问题
					curObj[attriNames[i]] = attributeValue.trim();
				};
				var properties = serializedParams.split("&");
				for(var i = 0; i < properties.length; i++) {
					//处理每一个键值对
					evalThem(properties[i]);
				};
				return obj;
			},

			//数组排序
			arrSort: function(arr) {
				return arr.sort(function(a, b) { //排序
					return a < b ? -1 : 1;
				});
			},
			//数组去重
			delRepetition: function(arr) {
				Array.prototype.unique2 = function() {
					this.sort(); //先排序
					var res = [this[0]];
					for(var i = 1; i < this.length; i++) {
						if(this[i] !== res[res.length - 1]) {
							res.push(this[i]);
						}
					}
					return res;
				}
				return arr.unique2();
			},
			//数组扁平化（二维数组一维处理）
			flattening: function(arr) {
				var flattened = Array.prototype.concat.apply([], arr);
				return flattened;
			},
			/**
			 * 统计数组中所有的值出现的次数,并以对象的形式返回
			 * @param {Array} arr 要统计的数组
			 * @return {Object}
			 * */ 
			countif: function(arr) {
				return arr.reduce(function(prev, next) {
					//				console.log(prev); //obj，其属性为数组的每一个值，属性值为对应属性在数组中出现的次数
					//				console.log(next); //数组的每一个值
					prev[next] = (prev[next] + 1) || 1;
					return prev;
				}, {});
			},

			/**
			 * 数组对象，将数组中具有相同值的对象 取出组成新的数组，返回新数组
			 * @param {Array} arr 数组对象（哈希数组）
			 * @param {String} str 数组对象中相同值的属性字符串
			 * @return {Array}
			 * */
			getSameVal: function(arr, str) {
				var _arr = [],
					_t = [],
					// 临时的变量
					_tmp;

				// 按照特定的参数将数组排序将具有相同值得排在一起
				arr = arr.sort(function(a, b) {
					var s = a[str],
						t = b[str];

					return s < t ? -1 : 1;
				});

				if(arr.length) {
					_tmp = arr[0][str];
				}
				// console.log( arr );
				// 将相同类别的对象添加到统一个数组
				for(var i in arr) {
					if(arr[i][str] === _tmp) {
						_t.push(arr[i]);
					} else {
						_tmp = arr[i][str];
						_arr.push(_t);
						_t = [arr[i]];
					}
				}
				// 将最后的内容推出新数组
				_arr.push(_t);
				return _arr;
			},
			/**
			 * 延迟加载器
			 * @param {Function} fn 回调函数
			 * @param {Number} wait 时间（毫秒）
			 * */
			debounce: function(fn, wait) { //fn指的是函数，wait指的是时间数值（秒）
				//设定默认的延迟时间
				wait = wait || 500;
				//清除定时器
				keyupTimer && clearTimeout(keyupTimer);
				//定时器执行
				keyupTimer = setTimeout(fn, wait);
			},
			/**
			 * 随机生成n个大写字母 ,返回数组
			 * @param {Number} n 字母个数
			 * @return {Array}
			 * */
			getCapital: function(n) {
				var result = [];
				for(var i = 0; i < n; i++) {
					var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
					//大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
					result.push(String.fromCharCode(65 + ranNum));
				}
				return result;

			},
			/**
			 * 随机生成范围数字：min最小数字，max最大数字（打印数字为最小到最大的范围）
			 * @param {Number} min 最小值
			 * @param {Number} max 最大值
			 * @return {Number}
			 * */
			randNum: function(min, max) {
				var num = Math.floor(Math.random() * (max - min) + min);
				return num;
			},

			/**
			 * 获取鼠标位置
			 * @param {Event} event 事件参数标示，必传event
			 * @return {Object}
			 * */
			getMousePos: function(event) {
				var e = event || window.event;
				var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
				var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
				var x = e.pageX || e.clientX + scrollX;
				var y = e.pageY || e.clientY + scrollY;
				return {
					'x': x,
					'y': y
				};
			},
			/**
			 * 
			 * 获取当前静态所有时间
			 * @param {String} oTime 时间格式参数
			 *  'y-m-d' ==> 年月日
				 'm-d' ==> 年月
				 'm-d' ==> 月日
				 'h-m-s' ==> 时分秒
				 'h-m' ==> 时分
				 'm-s' ==> 分秒
				 'w' ==>星期
				 '' ==>年月日 时分秒
			 * */
			getOnTime: function(oTime) {
				//获取当前具体时间
				var oDate = new Date();
				var nYear = oDate.getFullYear();
				var nMonth = oDate.getMonth() * 1 + 1;
				var nDate = oDate.getDate();

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
					case(oTime === 'w'):
						return "今天是星期" + "日一二三四五六".charAt(new Date().getDay());
						break;
					case(oTime === 'ZW'):
						return nYear + "年" + nMonth + "月" + nDate + "日  " + nHours + ":" + nMinutes + ":" + nSeconds;
						break;
					default:
						return nYear + "-" + nMonth + "-" + nDate + "\0" + nHours + ":" + nMinutes + ":" + nSeconds;
				}
			},

			/**
			 * yyyy-mm-dd hh:mm:ss转换为时间戳
			 * @param {String} s yyyy-mm-dd hh:mm:ss时间格式
			 * @return {Number}
			 * */
			backDateNum: function(s) {
				if(s) {
					var date = new Date(s.replace(/-/g, '/'));
					return Date.parse(date) / 1000;
				}

			},
			/**
			 * 标准时间返回 y-m-d h:m:s格式
			 * @param {Object} date 当前时间对象
			 * @return {String}
			 * */
			formatDateTime: function(date) {
				var y = date.getFullYear();
				var m = date.getMonth() + 1;
				m = m < 10 ? ('0' + m) : m;
				var d = date.getDate();
				d = d < 10 ? ('0' + d) : d;
				var h = date.getHours();
				h = h < 10 ? ('0' + h) : h;
				var minute = date.getMinutes();
				minute = minute < 10 ? ('0' + minute) : minute;
				var second = date.getSeconds();
				second = second < 10 ? ('0' + second) : second;
				return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
			},
			
			//获取当前时间的时间戳
			getCurrTimestamp:function(){
				var sTime = $.formatDateTime(new Date());
				return $.backDateNum(sTime);
			},
			/**
			 * 时间戳转换格式
			 * @param {Number} timestamp3 时间戳
			 * @param {String} sFormat 要转换的数据格式
				 sFormat格式字符串:
				'yyyy-MM-dd h:m:s'年月日时分秒
				'yyyy-MM-dd'
				'yyyy-MM'
			 	'h:m'
			 	'yyyy'
			 	.....
			 */
			timestampToTime: function(timestamp3, sFormat) {
				function addZero(n){
					return (n <= 9 ? ("0"+n) : n);
				}
				var newDate = new Date();
				newDate.setTime(timestamp3 * 1000);
				Date.prototype.format = function(format) {
					var date = {
						"M+": addZero(this.getMonth() + 1),
						"d+": addZero(this.getDate()),
						"h+": addZero(this.getHours()),
						"m+": addZero(this.getMinutes()),
						"s+": addZero(this.getSeconds()),
						"q+": Math.floor((this.getMonth() + 3) / 3),
						"S+": this.getMilliseconds()
					};
					if(/(y+)/i.test(format)) {
						format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
					}
					for(var k in date) {
						if(new RegExp("(" + k + ")").test(format)) {
							format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
								date[k] : ("00" + date[k]).substr(("" + date[k]).length));
						}
					}
				
					return format;
				}
				return newDate.format(sFormat);
			},
			/**
			 * 根据年月日时间计算星期几
			 * @param {String} sDate 年月日时间，有可能是yyyy-mm-dd格式，也有可能是yyyy/mm/dd格式
			 * @return {String} 返回星期几
			 * */
			getWeeDay:function(sDate){
				var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]; 
				if(sDate.indexOf("/") > -1){//yyyy/mm/dd格式
					var myDate = new Date(Date.parse(sDate));
					return weekDay[myDate.getDay()];
				}else if(sDate.indexOf("-") > -1){//yyyy-mm-dd格式
					var myDate = new Date(Date.parse(sDate.replace(/-/g, '/')));
					return weekDay[myDate.getDay()];
				}else{
					alert("日期格式不对");
				}
			},
			incrementInitDate:0,//增量初始时间戳
			incrementTimer:null,//增量定时器变量
			decrementInitDate:0,//减量初始时间戳
			decrementTimer:null,//减量定时器变量
			dd_currTime:null,//增量减量对象
			/**
			 * 增量时间（顺时钟）
			 * @param {Number} nIncrement 增量（指某一刻平均递增的秒数）
			 * @param {Number} nSpeed 增速 （指平均多少ms执行一次函数的增速）
			 * @param {Function} callback 回调函数，参数为递增的时间对象
			 * @param {String} sInitDate 初始时间（包含年月日时分秒 yyyy-mm-ss hh:mm:ss格式）(可选)
			 * */
			incrementTime:function(nIncrement,nSpeed,callback,sInitDate){
				var _this = this;
				if(sInitDate == undefined || !sInitDate){//加载本地时间
					$.incrementInitDate = $.getCurrTimestamp();//初始化增量时间，转化时间戳
				}else{
					$.incrementInitDate = $.backDateNum(sInitDate);//初始化增量时间，转化时间戳
				}
				$.incrementTimer = setInterval(function(){
					$.incrementInitDate += nIncrement;
					$.dd_currTime = $.timestampToTime($.incrementInitDate, "yyyy-MM-dd h:m:s");
					_this.nIndex = $.dd_currTime.indexOf(" ");
					
					_this.oDate = {
						cTime:$.dd_currTime.slice(_this.nIndex+1,$.dd_currTime.length),//计算时分秒
						cDate:$.dd_currTime.slice(0,_this.nIndex),//计算年月日
						cWeek:$.getWeeDay($.dd_currTime.slice(0,_this.nIndex))//计算周几
					}
					callback(_this.oDate);
//					console.log(JSON.stringify(_this.oDate));
					_this.cTime = $.dd_currTime.slice(_this.nIndex,$.dd_currTime.length);//计算时分秒
					_this.cDate = $.dd_currTime.slice(0,_this.nIndex);//计算年月日
					_this.cWeek = $.getWeeDay($.dd_currTime.slice(0,_this.nIndex));//计算周几
				},nSpeed);
			},
			
			/**
			 * 减量时间（逆时钟）
			 * @param {Number} nDecrement 减量（指某一刻平均递减的秒数）
			 * @param {Number} nSpeed 减速 （指平均多少ms执行一次函数的减速）
			 * @param {Function} callback 回调函数，参数为递增的时间对象
			 * @param {String} sInitDate 初始时间（包含年月日时分秒 yyyy-mm-ss hh:mm:ss格式）(可选)
			 * */
			decrementTime:function(nDecrement,nSpeed,callback,sInitDate){
				var _this = this;
				if(sInitDate == undefined || !sInitDate){//加载本地时间
					$.decrementInitDate = $.getCurrTimestamp();//初始化增量时间，转化时间戳
				}else{
					$.decrementInitDate = $.backDateNum(sInitDate);//初始化增量时间，转化时间戳
				}
				$.decrementTimer = setInterval(function(){
					$.decrementInitDate -= nDecrement;
					$.dd_currTime = $.timestampToTime($.decrementInitDate, "yyyy-MM-dd h:m:s");
					_this.nIndex = $.dd_currTime.indexOf(" ");
					
					_this.oDate = {
						cTime:$.dd_currTime.slice(_this.nIndex+1,$.dd_currTime.length),//计算时分秒
						cDate:$.dd_currTime.slice(0,_this.nIndex),//计算年月日
						cWeek:$.getWeeDay($.dd_currTime.slice(0,_this.nIndex))//计算周几
					}
					callback(_this.oDate);
//					console.log(JSON.stringify(_this.oDate));
					_this.cTime = $.dd_currTime.slice(_this.nIndex,$.dd_currTime.length);//计算时分秒
					_this.cDate = $.dd_currTime.slice(0,_this.nIndex);//计算年月日
					_this.cWeek = $.getWeeDay($.dd_currTime.slice(0,_this.nIndex));//计算周几
				},nSpeed);
			},
			/**
			 * 秒数转化为时分秒时间格式
			 * @param {Number} ts 秒数
			 * @return {String}
			 * */
			secondToStr:function(ts){
				/**
				 * zeroize值和长度（默认值是2）。
				 * @param {Object} v
				 * @param {Number} l
				 * @return {String} 
				 */
				function ultZeroize(v, l) {
					var z = "";
					l = l || 2;
					v = String(v);
					for(var i = 0; i < l - v.length; i++) {
						z += "0";
					}
					return z + v;
				};
				
				
				if(isNaN(ts)) {
					return "--:--:--";
				}
				var h = parseInt(ts / 3600);
				var m = parseInt((ts % 3600) / 60);
				var s = parseInt(ts % 60);
				return (ultZeroize(h) + ":" + ultZeroize(m) + ":" + ultZeroize(s));
			},
			/**
			 * 检测浏览器是否支持svg
			 * @return {Boolean}
			 * */
			isSupportSVG:function(){
				var SVG_NS = 'http://www.w3.org/2000/svg';
	    		return !!document.createElementNS &&!!document.createElementNS(SVG_NS, 'svg').createSVGRect;
			},
			/**
			 * 检测浏览器是否支持canvas
			 * @return {Boolean}
			 * */
			isSupportCanvas:function(){
				if(document.createElement('canvas').getContext){
			        return true;
			    }else{
			        return false;
			    }
			},
			
			/**
			 * 十进制转换为各种进制字符（2到32进制）
			 * @param {String} str 要转换其他进制的十进制字符串
			 * @param {Number} num 十进制要转换的进制数（2到32）
			 * @return {String} 
			 * */
			tenToAny:function(str,num){
				return str.toString(num);
			},
			
			/**
			 * 其他进制（2到32）数据转换为十进制数据
			 * @param {String} str 其他进制的字符数据
			 * @param {Number} num 要转换为十进制的原进制数（2到32）
			 * @return {String}
			 * */
			AnyToTen:function(str,num){
				return parseInt(str,num);
			},
			
			/**
			 * 动态加载外部js文件
			 * @param {String} path 本地路径，注意：末尾不要加“.js”后缀
			 * @param {Function} callback 动态加载js成功的回调函数
			 * */
			_loadJs: function(path, callback) {
				callback = !(typeof(callback) == "undefined") ? callback : function() {};
				var oHead = document.getElementsByTagName('HEAD').item(0);
				var script = document.createElement("script")
				script.type = "text/javascript";
				if(script.readyState) { //IE
					script.onreadystatechange = function() {
						if(script.readyState == "loaded" || script.readyState == "complete") {
							script.onreadystatechange = null;
							callback();
						}
					};
				} else { //Others: Firefox, Safari, Chrome, and Opera
					script.onload = function() {
						callback();
					};
				}
				script.src = path + ".js";
				oHead.appendChild(script);
			},

			/**
			 * 动态加载外部css文件
			 * @param {String} path 本地路径，注意：末尾不要加“.css”后缀
			 * */
			_loadCss: function(path) {
				if(!path || path.length === 0) {
					throw new Error('参数“path”是必需的!');
				}
				var head = document.getElementsByTagName('head')[0];
				var links = document.createElement('link');
				links.href = path + ".css";
				links.rel = 'stylesheet';
				links.type = 'text/css';
				head.appendChild(links);
			},
			
			/**
			 * 获取对象类型名
			 * @param {Any} object 各种返回类型 ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"]
			 * @return {String}
			 * */
			_getType: function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			},
			
			/**
			 * 用来判断对象类型
			 * @param {Any} object 需要判断的数据
			 * @param {String} typeStr 预想的类型字符串
			 * @return {Boolean}
			 * */
			_isType: function(object, typeStr) {
				return $._getType(object) == typeStr;
			},
			
			/**
			 * 动态加载js文件,批量加载js,css文件，path可以是数组格式或用逗号隔开的字符串	
			 * @param {String||Array} path path可以是数组格式或用逗号隔开的字符串,指的是需要加载的js或者css组，如["jquery","layer"]
			 * @param {String} fileType 指定要动态加载的统一的类型，js或者css
			 * */
			_import: function(path, fileType) {
				var loadfun;
				switch(fileType) {
					case "js":
						loadfun = $._loadJs;
						break;
					case "css":
						loadfun = $._loadCss;
						break;
					default:
						alert("请检查文件类型");
				}
				//如果path是以逗号隔开的字符串		 
				if(this._is(path, "String")) {
					if(path.indexOf(",") >= 0) {
						path = path.split(",");
					} else {
						path = [path];
					}
				}
				//循环加载文件
				for(var i = 0; i < path.length; i++) {
					loadfun(path[i]);
				}
			},
			/**
			 * 对象数据序列化为带特定字符为分隔符的字符串
			 * @param {Object} obj 需要序列化为带特地字符分割的对象
			 * @param {String} symbol 分隔符字符串
			 * @return {String}
			 * */
			objSerialize:function(obj,symbol) {					
				var str = "";
				for(each in obj) {
					str += each + "=" + obj[each] + symbol;
				}
				return str.slice(0,str.length-(symbol.length));
			},
			
			/**
			 * 根据字符串获取其长度，中文汉字为2个长度，特殊字符长度有多有少
			 * @param {String} str 要计算长度个数的字符串
			 * @return {Number}
			 * */
			strGetLength:function(str){ 
			
			    var realLength = 0;
			    for (var i = 0; i < str.length; i++) 
			    {
			        charCode = str.charCodeAt(i);
			        if (charCode >= 0 && charCode <= 128) 
					realLength += 1;
			        else 
					realLength += 2;
			    }
			    return realLength;
			},
			//中文数组排序
			sortChinese:function(arr){ // 参数： 排序的数组
//			    arr.sort(function (item1, item2) {
//			      return item1.localeCompare(item2, 'zh-CN');
//			    })
				if(arr.length > 0){
					return (arr.sort(function(a, b){return (a + '').localeCompare(b + '')}))
				}
				
			},
			/**
			 * 动态添加外部js和删除原js，js加载完成，执行回调
			 * @param {String} url       script的src的地址,要动态添加的脚本地址
			 * @param {Function} callback  回调函数执行
			 * @param {String} srckey    要删除的原脚本地址（虽然删除，方法还在）
			 * */
			changeScript:function(url, srckey, callback){
				
				// 删除之前的script
				const scripts = document.querySelectorAll('script');
				for(const script of scripts) {
					if(script.src.includes(srckey)) {
						script.parentNode.removeChild(script);
					}
				}
				document.execCommand('Refresh');
			
				// 重新创建script
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.async = true;
				script.defer = true;
				if(script.readyState) { // IE
					script.onreadystatechange = function() {
						if(script.readyState === "loaded" || script.readyState === "complete") {
							script.onreadystatechange = null;
							callback();
						}
					};
				} else { // Others
					script.onload = function() {
						callback();
					};
				}
				script.src = url;
				document.getElementsByTagName("head")[0].appendChild(script);
				
			},
			/**
			 * 动态添加js，js加载完毕，执行回调函数
			 * @param {String} url  script的src的地址,要动态添加的脚本地址
			 * @param {Function} callback  回调函数执行
			 * */
			addScript:function(url,callback){
				// 创建script
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.async = true;
				script.defer = true;
				if(script.readyState) { // IE
					script.onreadystatechange = function() {
						if(script.readyState === "loaded" || script.readyState === "complete") {
							script.onreadystatechange = null;
							callback();
						}
					};
				} else { // Others
					script.onload = function() {
						callback();
					};
				}
				script.src = url;
				document.getElementsByTagName("head")[0].appendChild(script);
			},
			/**
			 * 以几分钟为间隔，获取两个时间范围内的所有时间点，返回数组
			 * @param {String} startDate 开始时间（yyyy-mm-dd hh:mm:ss）
			 * @param {String} endDate 结束时间（yyyy-mm-dd hh:mm:ss）
			 * @param {Number} space 时间间隔（单位分钟），默认间隔30分钟
			 * @param {Boolean} isReverse 时间点是否从结束时间开始计算返回，如true，则倒叙，否则或者不传为正序
			 * @return {Array}
			 * */
			getDateArr:function(startDate, endDate, space, isReverse){
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
					aRes.push($.conversionTime(dateArray[i]));
				}
				return aRes;
			},
			/**
			 * 系统时间格式转化为 yyyy-mm-dd hh-mm-ss时间格式
			 * @param {String} dt 系统时间格式时间
			 * @return {String}
			 * */
			conversionTime:function(dt){
				return(
					dt.getFullYear() +
					"-" +
					(dt.getMonth() + 1 < 10 ?
						"0" + (dt.getMonth() + 1) :
						dt.getMonth() + 1) +
					"-" +
					(dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate()) +
					" " +
					(dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
					":" +
					(dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) +
					":" +
					(dt.getSeconds() < 10 ? "0" + dt.getSeconds() : dt.getSeconds())
				);
			},
			/**
			 * 大于0的正整数转化为大写字母
			 * @param {Number} num 大于零的正整数
			 * @return {String}
			 * */
			numToLetter:function(num){
				var stringName = "";
			    if(num > 0) {
				    if(num >= 1 && num <= 26) {
				        stringName = String.fromCharCode(64 + parseInt(num));
				    } 
				    else {
				        while(num > 26) {
				          var count = parseInt(num/26);
				          var remainder = num%26;
				          if(remainder == 0) {
				            remainder = 26;
				            count--;
				            stringName = String.fromCharCode(64 + parseInt(remainder)) + stringName;
				          } else {
				            stringName = String.fromCharCode(64 + parseInt(remainder)) + stringName;
				          }
				          num = count;
				        }
				        stringName = String.fromCharCode(64 + parseInt(num)) + stringName;
				    }
			    }
			    
			    return stringName;
			    
			},
			//清除所有缓存
			clearCacheFn:function(callback){
				var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
				if (keys) {
				    for (var i = keys.length; i--;) {
				        document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();//清除当前域名下的,例如：m.kevis.com
				        document.cookie = keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString();//清除当前域名下的，例如 .m.kevis.com
				        document.cookie = keys[i] + '=0;path=/;domain=kevis.com;expires=' + new Date(0).toUTCString();//清除一级域名下的或指定的，例如 .kevis.com
				    }
					if(callback) callback();
				}
			},
			/**
			 * 设置cookie
			 * @param {String} name 设置的键
			 * @param {String} value 设置的值
			 * @param {Number} time 设置的过期时间，单位毫秒，如1000，则为1秒
			 * */
			_set_cookie:function(name,value,time){
				var exp = new Date();
				exp.setTime(exp.getTime() + time*1);
				document.cookie = name + "="+ escape(value) + ";expires=" + exp.toGMTString();
			},
			/**
			 * 读取cookie
			 * @param {String} name 设置的键
			 * */
			_get_cookie:function(name){			
				var arr,
					reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
				if(arr = document.cookie.match(reg)) return unescape(arr[2]);
				else return null;
			},
			/**
			 * 删除cookie
			 * @param {String} name 设置的键
			 * */
			_del_cookie:function(name){			
				var exp = new Date();
				exp.setTime(exp.getTime() - 1);
				var cval = getCookie(name);
				if(cval != null) document.cookie = name + "="+cval+";expires=" + exp.toGMTString();
			},
			/**
			 * 获取元素的实际宽高，偏移量和x,y位置
			 * @param {String} selector 元素的选择器，id要带#，class要带.
			 * */
			getDOMTrueData:function(selector){
				 return document.querySelector(selector).getBoundingClientRect();
			},
			/**
			 * 获取昨天时间（返回年月日yyyy-mm-dd格式）
			 * @return {String}
			 * */
			getYesterdayDate:function(){
				var today = $.getOnTime('y-m-d');
				var nYesterday = $.backDateNum(today) - 86400;//昨天时间戳
				return $.timestampToTime(nYesterday,"yyyy-MM-dd");
			},
			//阻止事件冒泡
			stopEventBubble:function(){
				//阻止事件冒泡
				window.event? window.event.cancelBubble = true : e.stopPropagation();
			},
			/**
			 * 获取video视频第一针图片，生成地址
			 * @param {Object} jsObj js元素对象
			 * @param {Function} fn 回调函数，返回参数是img地址
			 * */
			getVideoImg:function(jsObj,fn){
				var video;
				var scale = 0.8;
				var initialize = function() {
					video = jsObj;
					video.addEventListener('loadeddata', captureImage); // 用于向指定元素添加事件句柄。
				};

				var captureImage = function() {
					var canvas = document.createElement("canvas"); // 创建一个画布
					canvas.width = video.videoWidth * scale;
					canvas.height = video.videoHeight * scale;
					canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); // getContext:设置画布环境；drawImage:画画 
					var imgUrl = canvas.toDataURL("image/png");
					if(fn) fn(imgUrl);
					
				};

				initialize();
			},
			isLoad:true,//加个节流阀,避免尚未加载出的时间段里,上拉多次而导致加载太多
			
			/**
			 * 监听window滚动条滚动到底部的事件
			 * @param {Function} fn 回调函数
			 * */
			window_to_bottom_fn:function(fn){
				//开启事件监听
				window.addEventListener('scroll', function() {
					let clientHeight = document.documentElement.clientHeight //可视区高度
	
					let scrollHeight = document.documentElement.scrollHeight //文档流高度
	
					let scrollDistance = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0 //滚动出去高度
	
					//文档剩余区域的高度
					// 文档高度-可视区高度-滚动出去的高度 = 文档剩余高度
					let surplus = scrollHeight - clientHeight - scrollDistance //尚未滚出来的文档流高度
	
					//注意判断条件,当剩余文档流的高度小于0时
	
					if(surplus <= 0 && $.isLoad) {
	
						$.isLoad = false
	
						setTimeout(function() {
							if(fn) fn();
							$.isLoad = true;
	
						}, 100) //迟疑三秒再加载出来
	
					}
	
				}, false);
			},
			/**
			 * Date.UTC() 格式的时间转化为中国时区的 “yyyy-mm-dd hh:mm:ss”时间格式
			 * @param {Number} n Date.UTC()之后的时间串
			 * */
			UTC_to_CTime:function(n){
				var t = 28800000;				
				var xVal = n;
				var s_utc_time = new Date(xVal);
				var sTime = s_utc_time.toUTCString();//UTC时间转换为国际GMT时间
				// var resTime = $.formatDateTime(new Date(sTime));
				var nT = Date.parse(new Date(sTime)) - t;//转化时间戳
				return $.timestampToTime(nT/1000,"yyyy-MM-dd h:m:s");
			},
			/**
			 * 根据年月返回该月份的天数
			 * @param {Number} year 年份
			 * @param {Number} month 月份
			 * @return {Number}
			 * */
			getDaysInMonth:function(year,month){
				month = parseInt(month,10);  //parseInt(number,type)这个函数后面如果不跟第2个参数来表示进制的话，默认是10进制。
				var temp = new Date(year,month,0);
				return temp.getDate();	
			},
			/**
			 * 根据指定年月日，获取该天前几天的天数返回数组
			 * @param {Number} n 要返回的天数
			 * @param {String} sDate 指定时间，“yyyy-mm-dd”格式 ,如果不传该参数，则默认未当前系统日期
			 * */
			getPrevDays:function(n,sDate){
				var nDayC = 24 * 60 * 60;//一天的时间戳数。秒单位
				if(sDate){
					var nTargetDate = $.backDateNum(sDate);
				}else{
					var curtime = $.getOnTime("y-m-d");
					var nTargetDate = $.backDateNum(curtime);
				}
				var list = [];
				for(var i=0;i<n;i++){
					var nRes = nTargetDate - (nDayC*i);
					var sRes = $.timestampToTime(nRes,"yyyy-MM-dd");
					list.push(sRes);
				}
				return list;
			},
			/**
			 * 根据指定年月日，获取该天后几天的天数返回数组
			 * @param {Number} n 要返回的天数
			 * @param {String} sDate 指定时间，“yyyy-mm-dd”格式 ,如果不传该参数，则默认未当前系统日期
			 * */
			getNextDays:function(n,sDate){
				var nDayC = 24 * 60 * 60;//一天的时间戳数。秒单位
				if(sDate){
					var nTargetDate = $.backDateNum(sDate);
				}else{
					var curtime = $.getOnTime("y-m-d");
					var nTargetDate = $.backDateNum(curtime);
				}
				var list = [];
				for(var i=0;i<n;i++){
					var nRes = nTargetDate + (nDayC*i);
					var sRes = $.timestampToTime(nRes,"yyyy-MM-dd");
					list.push(sRes);
				}
				return list;
			},
			/**
			 * 根据年月日，返回对应的星期
			 * @param {String} sDate 日期年月日"yyyy-mm-dd"或者"yyyy/mm/dd"
			 * @param {String} sLang 语言版本，cn代表中文星期名称，en代表英文星期名称
			 * */
			getWeekName:function(sDate,sLang){
				var nWeek = new Date(sDate).getDay();
				switch (nWeek){
					case 1:
						return (sLang == "en" ? "Mon." : "星期一");
						break;
					case 2:
						return (sLang == "en" ? "Tue." : "星期二");
						break;
					case 3:
						return (sLang == "en" ? "Wed." : "星期三");
						break;
					case 4:
						return (sLang == "en" ? "Thur." : "星期四");
						break;
					case 5:
						return (sLang == "en" ? "Fri." : "星期五");
						break;
					case 6:
						return (sLang == "en" ? "Sat." : "星期六");
						break;
					default:
						return (sLang == "en" ? "Sun." : "星期日");
						break;
				}
			},
		});

		/***********************************************************************对象插件*********************************************************************************************/
		//关于置顶置底
		/**
		 * 置顶
		 * @param {Object} 传递参数
		 * @property {String} options.event 事件类型
		 * @property {Array} options.position 置顶操作元素的位置
		 * @property {Array} options.offset 对应定位平移的像素
		 * @property {String} options.txt 置顶操作元素的文本字段
		 * @property {Number} options.zIndex 置顶操作元素的层级
		 * */
		$.fn.toTop = function(options) {
			var defaults = {
				event: 'click', // 事件类型
				position: ['left', 'bottom'],
				offset: ['10px', '10px'],
				txt: '置顶',
				zIndex: 1000
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
			obj.on(opts.event, function() {
				$('html,body').animate({
					scrollTop: '0px'
				}, 800);
			});
			obj.css({
				'position': 'fixed',
				'zIndex': opts.zIndex
			});
			if(opts.position.length == 2 && opts.offset.length == 2) {
				for(var i = 0; i < opts.position.length; i++) {
					if(opts.position[i] == 'right' && opts.position[i + 1] == 'bottom') {
						obj.css({
							'right': opts.offset[0],
							'bottom': opts.offset[1]
						});
					}
					if(opts.position[i] == 'right' && opts.position[i + 1] == 'top') {
						obj.css({
							'right': opts.offset[0],
							'top': opts.offset[1]
						});
					}
					if(opts.position[i] == 'left' && opts.position[i + 1] == 'top') {
						obj.css({
							'left': opts.offset[0],
							'top': opts.offset[1]
						});
					} else {
						obj.css({
							'left': opts.offset[0],
							'bottom': opts.offset[1]
						});
					}
				}
			}
			obj.text(opts.txt);
		};

		/**
		 * 置底
		 * @param {Object} 传递参数
		 * @property {String} options.event 事件类型
		 * @property {Array} options.position 置底操作元素的位置
		 * @property {Array} options.offset 对应定位平移的像素
		 * @property {String} options.txt 置底操作元素的文本字段
		 * @property {Number} options.zIndex 置底操作元素的层级
		 * */
		$.fn.toBottom = function(options) {
			var defaults = {
				event: 'click', // 事件类型
				position: ['right', 'top'],
				offset: ['10px', '10px'],
				txt: '置底',
				zIndex: 1000
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
			obj.on(opts.event, function() {
				$('html,body').animate({
					scrollTop: document.body.clientHeight + "px"
				}, 800);
			});
			obj.css({
				'position': 'fixed',
				'zIndex': opts.zIndex
			});
			if(opts.position.length == 2 && opts.offset.length == 2) {
				for(var i = 0; i < opts.position.length; i++) {
					if(opts.position[i] == 'left' && opts.position[i + 1] == 'bottom') {
						obj.css({
							'left': opts.offset[0],
							'bottom': opts.offset[1]
						});
					}
					if(opts.position[i] == 'right' && opts.position[i + 1] == 'bottom') {
						obj.css({
							'right': opts.offset[0],
							'bottom': opts.offset[1]
						});
					}
					if(opts.position[i] == 'left' && opts.position[i + 1] == 'top') {
						obj.css({
							'left': opts.offset[0],
							'top': opts.offset[1]
						});
					} else {
						obj.css({
							'right': opts.offset[0],
							'top': opts.offset[1]
						});
					}
				}
			}
			obj.text(opts.txt);
		}

		/**
		 * 评级组件
		 * @param {Object} options 传递参数 
		 * @property {Number} options.star 星星个数
		 * @property {Boolean} options.edit 是否可以编辑
		 * */
		$.fn.rate = function(options) {
			var defaults = {
				star: 1, // 星级
				edit: false
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
			var rate = opts.star > 5 ? 5 : opts.star;
			var sStar = "★★★★★☆☆☆☆☆".slice(5 - rate, 10 - rate);
			var aStar = sStar.split("");
			var tem = "";
			for(var i = 0; i < aStar.length; i++) {
				tem += '<b data="' + aStar[i].charCodeAt(0) + '">' + aStar[i] + '</b>'
			}
			obj.html(tem);
			if(opts.edit) {
				obj.css("cursor", "pointer");
				obj.children().on("click", function() {
					console.log($(this).attr("data"), $(this).index());
					if($(this).attr("data") == "9733") {
						$(this).attr("data", "9734").text(String.fromCharCode(9734));
						$(this).prevAll().attr("data", "9733").text(String.fromCharCode(9733));
						$(this).nextAll().attr("data", "9734").text(String.fromCharCode(9734));
						return false;
					}
					if($(this).attr("data") == "9734") {
						$(this).attr("data", "9733").text(String.fromCharCode(9733));
						$(this).prevAll().attr("data", "9733").text(String.fromCharCode(9733));

					}
				});
			}

		};
		
		/**
		 * 限制文件上传大小类型和尺寸
		 * @param {Object} options 传递参数 
		 * @property {String} options.event 事件类型
		 * @property {Number} options.size 限制上传的文件大小
		 * @property {Boolean} options.onlyImage 是否默认所有类型可上传
		 * @property {Number} options.width 限制上传的图片像素宽度,onlyImage必须true
		 * @property {Number} options.height 限制上传的图片像素宽度,onlyImage必须true
		 * */
		$.fn.fileVaild = function(options){
			var _this = $(this);
			var defaults = {
				event:"change",
				size:1,//限制几m
				onlyImage:true,//默认所有类型可上传
				width:200,//默认像素宽度,onlyImage必须true
				height:300 //默认像素高度,onlyImage必须true
			};
			var opts = $.extend({}, defaults, options);
			if(opts.onlyImage){
				$(".Limit_that").remove();
				var sHtml = '<div class="Limit_that">'+
								'<span style="color: red;">温馨提示:图片上传的大小最大为'+ opts.size +'M，像素要求最小尺寸为'+ opts.width +'*'+ opts.height +',且图片宽高比例为'+ opts.width +':'+ opts.height +'</span>'+
							'</div>';
				_this.after($(sHtml));
			}
			_this.on(opts.event,function(){
				var file = this.files[0];//上传的图片的所有信息
				if(opts.onlyImage){				
					 //首先判断是否是图片			 
				    if(!/image\/\w+/.test(file.type)){
				        alert('上传的不是图片');
				        $(this).val('');
				        return false;
				    }
				}
				
			    //在此限制图片的大小
			    var imgSize = file.size;
			    //35160  计算机存储数据最为常用的单位是字节(B)
			    if(imgSize > opts.size*1024*1024){
			       alert('上传的文件大于'+ opts.size +'M,请重新选择!');
			        $(this).val('');
			        return false;
			    }
				
				//图片类型
				if(/image\/\w+/.test(file.type)){
					//创建图片预览
					$("#previewImg").remove();
					var oPreview = $('<img id="previewImg" style="display: none;"/>');
					var oReader = new FileReader();
					oReader.onload = function(e){
						oPreview.attr("src",e.target.result);
						$("body").append(oPreview);
						$("#previewImg").load(function(){
							if(this.naturalWidth*1 < opts.width || this.naturalHeight*1 < opts.height){
								alert("上传的图片像素最小必须是:" + opts.width + "*" + opts.height);
								_this.val("");
								return false;
							}
							if((opts.width/opts.height) != ((this.naturalWidth*1)/(this.naturalHeight*1))){
								alert("上传的图片像素宽高比例必须是:" + opts.width + ":" + opts.height);
								_this.val("");
							}
	//						console.log(this.naturalWidth + ' x ' + this.naturalHeight);
						});
					}
					oReader.readAsDataURL(file);
				}			
			});
			
		};
		
		/**
		 * 文本域字符限制输入
		 * @param {Object} options 传递参数 
		 * @property {String} options.event 事件类型
		 * @property {Number} options.maxLength 限制最大能输入多少字符
		 * @property {Number} options.width 文本域的宽度
		 * @property {Number} options.height 文本域 的高度
		 * */
		$.fn.textareaVaild = function(options){
			var _this = $(this);
			var defaults = {
				event:"keyup",
				maxLength:300,//限制最大能输入多少字符
				width:540,//文本域的宽度
				height:170 //文本域 的高度
			};
			var opts = $.extend({}, defaults, options);
			var nTextarea = $('<div class="textarea-numberbar"><em class="textarea-length">0</em>/'+ opts.maxLength +'</div>').css({
				"position": "absolute",
			    "bottom": "1%",		    
			    "padding": 0,
			    "margin": 0
			});
			_this.after(nTextarea);
			_this.on(opts.event,function(){
				var v = $(this).val();
				var l = v.length;
				if (l > opts.maxLength) {
					v = v.substring(0, opts.maxLength);
					$(this).val(v);
				}
				$(this).parent().find(".textarea-length").text(v.length);
				$(".textarea-numberbar").css({
				    "left": (opts.width - $(".textarea-numberbar").width()) + "px"
				});
			})
			.attr("dragonfly",true)
			.css({
				"width":opts.width + "px",
				"height":opts.height + "px"
			});
			_this.parent().css({
				"position":"relative"
			});
			$(".textarea-numberbar").css({
			    "left": (opts.width - $(".textarea-numberbar").width()) + "px"
			});
		};	
		
		/**
		 * 验证码倒计时
		 *  默认六十秒
 			必须是input和button的按钮
		 * @param {Object} options 传递参数
		 * @property {Number} options.second 验证码倒计时秒数
		 * */
		$.fn.countDown = function(options){
			var $this = $(this);
			var defaults = {
				second:60 //秒
			};
			var opts = $.extend({}, defaults, options);
			var times = opts.second,
				timer = null;
			$this.on("click",function(){
				var _this = this;
				 // 计时开始
			    timer = setInterval(function () {
			        times--;
			        
			        if (times <= 0) {
			        	if(_this.tagName == "INPUT"){
			        		 $this.val('发送验证码');
			        	}else if(_this.tagName == "BUTTON"){
			        		$this.text('发送验证码');
			        	}
			            clearInterval(timer);
			            $this.attr('disabled', false);
			            times = opts.second;
			        } else {
			        	if(_this.tagName == "INPUT"){
			        		 $this.val(times + '秒后重试');
			        	}else if(_this.tagName == "BUTTON"){
			        		$this.text(times + '秒后重试');
			        	}
			            $this.attr('disabled', true);
			        }
			    }, 1000);
			});
		};
		
		/**
		 * 判断鼠标滑轮方向(上和下)
		 * @param {Object} options 传入参数
		 * @property {Function} options.toTop 鼠标向上的回调函数
		 * @property {Function} options.toDown 鼠标向下的回调函数
		 * */
		$.fn.T_or_B = function(options){
			var _this = $(this);
			var defaults = {
				toTop:function(){//鼠标向上的回调函数
					console.log('mousewheel top');
				},
				toDown:	function(){//鼠标向下的回调函数
					console.log('mousewheel bottom');
				}
			};
			var opts = $.extend({}, defaults, options);
			_this.on("mousewheel DOMMouseScroll", function (event) {
				    // chrome & ie || // firefox
			    var delta = (event.originalEvent.wheelDelta && (event.originalEvent.wheelDelta > 0 ? 1 : -1)) ||
			        (event.originalEvent.detail && (event.originalEvent.detail > 0 ? -1 : 1));  
			    if (delta > 0) {//往上滚动
			       opts.toTop();
			    } else if (delta < 0) {//往下滚动
			    	opts.toDown();
			    }
			});
		};

		/**
		 * 验证禁用特殊字符输入
		 * @param {Object} options 传递参数
		 * @property {String} options.event 事件类型
		 * @property {Boolean} options.paste 可否粘贴
		 * */
		$.fn.checkVerify = function(options) {
			var defaults = {
				event: 'keyup', // 事件类型
				paste: false
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
			var r = /^[\u4E00-\u9FA5a-zA-Z0-9]{0,}$/;
			obj.on(opts.event, function() {
					if(r.test($(this).val()) == false) {
						alert("不能输入特殊字符");
						obj.val("");
						obj.focus();
					}
				})
				.on('paste', function() {
					return opts.paste;
				});
		}
		
		/**
		 * 显示局部隐藏的文本内容(指定几行)
		 * @param {String} options 传递参数
		 * @property {String} options.rowCount 设置显示的文本要出现几行
		 * */
		$.fn.textOverflow_moreRow = function(options) {
			var defaults = {
				rowCount: '3' // 默认显示行数
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
		
			$("#moreOverflow_style") && $("#moreOverflow_style").remove();
			var text_overflow = {			
			    "overflow":"hidden",
				"-webkit-box-orient": "vertical",
				"-webkit-line-clamp": opts.rowCount,
				"position": "relative",
			    "cursor": "pointer"
			};
			obj.css(text_overflow).on("mouseover",function(e){
//				console.log(e.target);
				var target = e.target;
		        var containerLength = $(target).width();
		        var textLength = target.scrollWidth;
		        var text = $(target).html();
		        $(target).attr( "title", text);
			}).addClass("moreOverflow");
			var _style = '<style type="text/css" id="moreOverflow_style">' +
						 '.moreOverflow{display: -webkit-box;}' +
						 '.moreOverflow::after{content: "........................"; position: absolute; bottom: 0; right: 0;}' +
						 '</style>'
			$('head').append($(_style));	
				
		}
		
		/**
		 *  验证只能输入数字和小数
		 * */
		$.fn.onlyNumAndFlo = function(options) {
			$(this).on("blur",function(){
				var e = this;
				var re = /^\d+(?=\.{0,1}\d+$|$)/; 
			    if (e.value != "") { 
			        if (!re.test(e.value)) { 
			            alert("请输入正确的数字"); 
			            e.value = ""; 
			            e.focus(); 
			        } 
			    } 
			});
			$(this).on("keyup",function(){
				var e = this;
				e.value = e.value.replace(/[^0-9.]/g,'');
			});
		};
		
		/**
		 * 显示局部隐藏的文本内容(单行)
		 * */
		$.fn.textOverflow = function(options) {						
			var text_overflow = {			
			    "overflow":"hidden",
			    "textOverflow":"ellipsis",
			    "whiteSpace":"nowrap",
			    "cursor": "pointer"
			};
			$(this).css(text_overflow).on("mouseover",function(e){
				console.log(e.target);
				var target = e.target;
		        var containerLength = $(target).width();
		        var textLength = target.scrollWidth;
		        var text = $(target).html();
		        if (textLength > containerLength) {
		            $(target).attr( "title", text);
		        } else {
		            $(target).removeAttr( "title");
		        }
			});
		};
		
		/**
		 * 银行账号输入框格式化
		 * @param {Object} options 传递参数
		 * @property {Number} options.min 最少输入字数
		 * @property {Number} options.max 最多输入字数
		 * 
		 * @property {String} options.deimiter 账号分隔符
		 * @property {Boolean} options.onlyNumber 是否只能输入数字
		 * @property {Boolean} options.copy 是否允许复制
		 * @property {Boolean} options.paste 是否不允许粘贴
		 * @property {Boolean} options.cut 是否不允许剪切
		 * */
		$.fn.bankInput = function(options) {
			var defaults = {
				min: 10, // 最少输入字数 
				max: 25, // 最多输入字数 
				deimiter: ' ', // 账号分隔符 
				onlyNumber: true, // 只能输入数字 
				copy: false, // 允许复制
				paste: false, //不允许粘贴
				cut: false //不允许剪切
	
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
			obj.css({
				imeMode: 'Disabled',
				borderWidth: '1px',
				color: '#000',
				fontFamly: 'Times New Roman'
			}).attr('maxlength', opts.max);
			if(obj.val() != '') obj.val(obj.val().replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter));
			obj.on('keyup', function(event) {
					if(opts.onlyNumber) {
						if(!(event.keyCode >= 48 && event.keyCode <= 57)) {
							this.value = this.value.replace(/\D/g, '');
						}
					}
					this.value = this.value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter);
				})
				.on('dragenter', function() {
					return false;
				})
				.on('paste', function() { //粘贴事件
					console.log("粘贴类型：" + opts.paste);
					return opts.paste;
				})
				.on("copy", function() { //复制事件
					console.log("复制类型：" + opts.copy);
					return opts.copy;
				})
				.on("cut", function() { //剪切事件
					console.log("剪切类型：" + opts.cut);
					return opts.cut;
				})
				.on('blur', function() {
					this.value = this.value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter);
					if(this.value.length < opts.min) {
						alert('最少输入' + opts.min + '位账号信息！');
						obj.val("");
					}
				})
	
		};
		
		/**
		 * 银行账号列表显示格式化
		 * @param {Object} options 传递参数
		 * @property {String} options.deimiter 分隔符
		 * */
		$.fn.bankList = function(options) {
			var defaults = {
				deimiter: ' ' // 分隔符 
			};
			var opts = $.extend({}, defaults, options);
			return this.each(function() {
				$(this).text($(this).text().replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter));
			})
		};

		/**
		 * 验证禁用中文输入
		 * @param {Object} options 传递参数 
		 * @property {String} options.event 事件类型
		 * @property {Boolean} options.paste 可否粘贴
		 * */
		$.fn.checkChinese = function(options) {
			var defaults = {
				event: 'keyup', // 事件类型
				paste: false
			};
			var opts = $.extend({}, defaults, options);
			var obj = $(this);
			obj.on(opts.event, function() {
					//    /^[\u4e00-\u9fa5]+$/
					var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");　　
					if(reg.test(obj.val())) {
						alert("不能输入汉字！");
						obj.val("");
						obj.focus();　　
					}
				})
				.on('paste', function() {
					return opts.paste;
				});
		};

	} catch(e) {
		console.error("报错类型：" + e);
	}

})(jQuery, window, document);
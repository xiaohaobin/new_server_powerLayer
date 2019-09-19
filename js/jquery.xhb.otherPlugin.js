/**
 * @author 肖浩彬
 * @depend jquery.1.91.js
 * @depend layer.js(大于 v2.0)（弹出层插件）
   @depend laypage.js（大于 v2.0）（分页插件）
   @depend jsrsasign-all-min.js （加密插件）
   @depend crypto-js.min.js 
   @depend jquery.qrcode.js （二维码插件）
   @depend qrcode.js （二维码解析插件）
   @depend utf.js （二维码编译插进）
 * */

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

//RAS和Crypto加密
;(function($, window, document, undefined) {
	// modulus, 由后台告知
	var modulus = 'D6BC545500C205EB37A9B5872AD4578E015EC48197A2C97A7C09666082A218E49D48209B9993C3D9766DB3C90D5D6A04A571E3E17E515908B22469CD97CFEF42EA1BA97E3D250907A926204C0B2D7445A52E3CA1EEDE48DBA8E17097F2BBFFE5CCDAA365A2163C24476A5DACDBD98A2610A67795B7477D8EEECBFB9AAD8482A336414CA1AE8AC5EC3653DB49EA62CED37ECF2B42B186005C25059A5EB9284DD5EB546EE7480D0E1BB5A644032B665F3BAAAA177F4F090287C6DF457DE34B6F65B9F8B340E81E7D52F20CFFC7823D5569AF773A48C5E2C0C66EB9BE21D01C62B429F2F9A1A9DAC8954A3349009151F43B34BD66BF7EA1D028E7D79B2570C26DEB';
	// 固定值
	var exponent = "10001";
	
	try{
		var rsa = new RSAKey();
		
		rsa.setPublic(modulus, exponent);
		var key,iv;
		$.extend({
			backEncryptParam:function(){//加密发送后台
				// 计算nonceStr
				/**
				 * 根据modulus的长度, 随机获取到2个随机数, 用于截取modulus
				 * start 10 - 51
				 * end 1 - 103
				 */
				var start = Math.floor(Math.random() * modulus.length / 10 + 10);
				var end = Math.ceil(Math.random() * modulus.length / 5);
				// key值， 用来解密后台传输过来的数据
				key = modulus.substring(start, end);
				// 计算md5值作为iv(初始向量), 转为大写。 用来解密后台传输过来的数据
				iv = CryptoJS.MD5(key).toString().toUpperCase();
				
				/**
				 * 生成nonce
				 *
				 * hex(2位，表示key的长度)
				 * start(2位， 表示随机起始点的值)
				 * key(key值，长度由hex确定)
				 * iv(iv值， 长度为32位)
				 * end(1-2位， 表示随机终点的值)
				 */
				var hex = ((key.length).toString(16));
				// 长度不足2位，前补位0
				if (hex.length === 1) hex = '0' + hex;
				var nonce = hex + start + key + iv + end;
				// 需要加密的字符串
				var encryptStr = JSON.stringify({
				    nonce: nonce, //上面计算出来的
				    timestamp: new Date().getTime(), // 应该由服务器获取
				    version: "1.0", // 版本号
				    host:$.getHost()
				});
				var res = rsa.encrypt(encryptStr);
				

				// 使用AES对RSA进行再次加密，然后传输给服务器
//			  
				return {
					"encrypt":encrypt(res),
					"key":key,
					"iv":iv
				};
			},
			backDecryptParam:function(data,key,iv){//解密后台数据
				return decrypt(data, generateKey(key), iv);
			},
			//加密token
			enToken:function(token){
				return rsa.encrypt(token);
			},
		});
		
		/**
		 * 加密
		 */
		function encrypt(str) {
		    var key = CryptoJS.enc.Utf8.parse('n*dA3T6!`d}x_)&SDxo1,Kzx[+>x=1Gx');// 秘钥
		    var iv= CryptoJS.enc.Utf8.parse('xQ3%1)7@^5spCra;');//向量iv
		    var encrypted = CryptoJS.AES.encrypt(str, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
		    return encrypted.toString();
		}
		
		function decrypt(str, key, iv) {
		    key = CryptoJS.enc.Utf8.parse(key);// 秘钥
		    iv  = CryptoJS.enc.Utf8.parse(iv);//向量iv
		    var decrypted = CryptoJS.AES.decrypt(str,key,{/*mode: CryptoJS.mode.CBC,*/ iv:iv,padding:CryptoJS.pad.Pkcs7});
		    return decrypted.toString(CryptoJS.enc.Utf8);
		}
		
		function generateKey(skey){
		    if (skey.length > 32) {
		        skey = skey.substring(0, 32);
		    } else if (skey.length > 16) {
		        skey = skey.substring(0, 16);
		    } else {
		        skey = new Array(16 - skey.length + 1).join('0').concat(skey);
		    }
		    return skey;
		}
		
	}catch(e){
		//抛出错误
		console.log("错误描述：" + e.message);
	}
	
})(jQuery, window, document);






;(function($, window, document, undefined) {
	//服务器请求地址变量
	var sRequestUrl = "http://123.58.43.16:9555/";
	//定义加载层
	var layerLoad = null;
	try{
		$.extend({
			/**
			 * 返回路由地址
			 * @param {String} mUrl 后台控制器+函数
			 * @return {String}
			 * */
			urlBack: function(mUrl) {
				return sRequestUrl + '' + mUrl; //统一服务器
			},
			/**
			 * Url指的是要跳转的路劲页面，如index.html
			 * @param {String} Url
			 * @return {String}
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
			 * 普通ajax请求
			 * @param {String} murl 请求地址
			 * @param {Object} mdata 请求数据
			 * @param {String} method 请求类型
			 * @param {Function} successFn 请求成功的回调函数
			 * */
			ajax_method_1:function(murl, mdata, method, successFn){
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
						console.log(data);
						layer.alert("请求失败，请检查服务器端！", {
							icon: 5
						});
					},
					success: function(data) {
						var data = (typeof data == "object" ? data : JSON.parse(data));
						console.log(data);
						layer.close(layerLoad);
						if(data.code == 1) {
							layer.alert(data.message);
						}
						else if(data.code == 0) {
							successFn(data.data);
						}
						else if(data.code == 2){//跳转到登录页
							layer.confirm(data.message,function(){
								$.toNewPage(localStorage.getItem("loginUrl"));
							});
						}
						
					}
				});
				
			},
			/**
			 * 文件表单上传的  ajax请求
			 * @param {String} murl 请求地址
			 * @param {Object} mdata 请求数据
			 * @param {String} method 请求类型
			 * @param {Function} successFn 请求成功的回调函数
			 * */
			ajax_method_2:function(murl, mdata, method, successFn){
				$.ajax({
					type: method,
					url: murl,
	//				dataType: "json",
					data: mdata || {},
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					timeout: 10000,		
					beforeSend: function() {
						layerLoad = layer.load(3);
					},
					error: function(data) {
						layer.close(layerLoad);
						console.log(data);
						layer.alert("请求失败，请检查服务器端！", {
							icon: 5
						});
					},
					success: function(data) {
						console.log(data);
						layer.close(layerLoad);
						if(data.code == 1) {
							layer.alert(data.message);
						}
						else if(data.code == 0) {
							successFn(data);
						}
						else if(data.code == 2){//跳转到登录页
							layer.confirm(data.message,function(){
								$.toNewPage(localStorage.getItem("loginUrl"));
							});
						}
						
					}
				});
				
			},
			/**
			 * 传sessionID 的ajax请求
			 * @param {String} murl 请求地址
			 * @param {Object} mdata 请求数据
			 * @param {String} method 请求类型
			 * @param {Function} successFn 请求成功的回调函数
			 * */
			ajax_method_3:function(murl, mdata, method, successFn){
				$.ajax({
					type: method,
					url: murl,
					dataType: "json",
					data: mdata || {},
					async: true,
					timeout: 10000,	
					xhrFields: {
		            	withCredentials: true
			        },
			        crossDomain: true,
					beforeSend: function() {
						layerLoad = layer.load(3);
					},
					error: function(data) {
						layer.close(layerLoad);
						console.log(data);
						layer.alert("请求失败，请检查服务器端！", {
							icon: 5
						});
					},
					success: function(data) {
						console.log(data);
						layer.close(layerLoad);
						if(data.code == 1) {
							layer.alert(data.message);
						}
						else if(data.code == 0) {
							successFn(data);
						}
						else if(data.code == 2){//跳转到登录页
							layer.confirm(data.message,function(){
								$.toNewPage(localStorage.getItem("loginUrl"));
							});
						}
					}
				});
				
			},
			/**
			 * 传sessionID 的 文件表单上传的  ajax请求
			 * @param {String} murl 请求地址
			 * @param {Object} mdata 请求数据
			 * @param {String} method 请求类型
			 * @param {Function} successFn 请求成功的回调函数
			 * */
			ajax_method_4:function(murl, mdata, method, successFn){
				$.ajax({
					type: method,
					url: murl,
	//				dataType: "json",
					data: mdata || {},
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					xhrFields: {
		            	withCredentials: true
			        },
			        crossDomain: true,
					timeout: 10000,		
					beforeSend: function() {
						layerLoad = layer.load(3);
					},
					error: function(data) {
						layer.close(layerLoad);
						console.log(data);
						layer.alert("请求失败，请检查服务器端！", {
							icon: 5
						});
					},
					success: function(data) {
						console.log(data);
						layer.close(layerLoad);
						if(data.code == 1) {
							layer.alert(data.message);
						}
						else if(data.code == 0) {
							successFn(data);
						}
						else if(data.code == 2){//跳转到登录页
							layer.confirm(data.message,function(){
								$.toNewPage(localStorage.getItem("loginUrl"));
							});
						}
					}
				});
				
			},
			
			/**
			 * 加密解密的 ajax请求
			 * @param {String} murl 请求地址
			 * @param {Object} mdata 请求数据
			 * @param {String} method 请求类型
			 * @param {Function} successFn 请求成功的回调函数
			 * */
			ajax_method_5:function(murl, mdata, method, successFn){
				//token 来自本地存储
				var _token = $.enToken((localStorage.getItem("token") && localStorage.getItem("token")));				
				var obj = $.backEncryptParam();
				//加密字段标示
				var _sign = obj.encrypt;
				//加密key
				var key = obj.key;
				//加密iv
				var iv = obj.iv;
				
				$.ajax({
					type: method,
					url: murl,
	//				dataType: "json",
					data: mdata || {},
					async: false,
					timeout: 10000,		
					beforeSend: function() {
						layerLoad = layer.load(3);
					},
					headers: {
				       sign: _sign,
				       token:_token
				    },
					error: function(data) {
						layer.close(layerLoad);
						console.log(data);
						layer.alert("请求失败，请检查服务器端！", {
							icon: 5
						});
					},
					success: function(data) {
						//解密
						var data = JSON.parse($.backDecryptParam(data, key, iv));
						console.log(data);
						layer.close(layerLoad);
						if(data.code == 1) {
							layer.alert(data.message);
						}
						else if(data.code == 0) {
							successFn(data);
						}
						else if(data.code == 2){//跳转到登录页
							layer.confirm(data.message,function(){
								$.toNewPage(localStorage.getItem("loginUrl"));
							});
						}
						
					}
				});
			},
			
			/**
			 * 加解密的文件表单上传的  ajax请求
			 * @param {String} murl 请求地址
			 * @param {Object} mdata 请求数据
			 * @param {String} method 请求类型
			 * @param {Function} successFn 请求成功的回调函数
			 * */
			ajax_method_6:function(murl, mdata, method, successFn){
				//token 来自本地存储
				var _token = $.enToken((localStorage.getItem("token") && localStorage.getItem("token")));				
				var obj = $.backEncryptParam();
				//加密字段标示
				var _sign = obj.encrypt;
				//加密key
				var key = obj.key;
				//加密iv
				var iv = obj.iv;
				$.ajax({
					type: method,
					url: murl,
	//				dataType: "json",
					data: mdata || {},
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					timeout: 10000,		
					beforeSend: function() {
						layerLoad = layer.load(3);
					},
					headers: {
				       sign: _sign,
				       token:_token
				    },
					error: function(data) {
						layer.close(layerLoad);
						console.log(data);
						layer.alert("请求失败，请检查服务器端！", {
							icon: 5
						});
					},
					success: function(data) {
						//解密
						var data = JSON.parse($.backDecryptParam(data, key, iv));
						console.log(data);
						layer.close(layerLoad);
						if(data.code == 1) {
							layer.alert(data.message);
						}
						else if(data.code == 0) {
							successFn(data);
						}
						else if(data.code == 2){//跳转到登录页
							layer.confirm(data.message,function(){
								$.toNewPage(localStorage.getItem("loginUrl"));
							});
						}
					}
				});
			},
		});
		
		/**
		 * 分页
		 * @param {Object} options 传入的参数
		 * @property {String} options.url 请求地址
		 * @property {Object} options.data 请求发送数据
		 * @property {String} options.type 请求类型
		 * @property {Object} options.eleTotal 分页显示总数的dom选择器节点，jquery获取
		 * @property {Function} options.callBack 请求成功的回调函数
		 * */
		$.fn.paging = function(options) {
			var _this = $(this);
			var defaults = {
				url: 'http://103.251.36.122:9555/',
				data: {},
				type: "post",
				eleTotal:$(".nTotal"),//总数dom节点
				callBack: function(data) {
					console.log("huidiao");
					console.log(data);
				}
			};
			var opts = $.extend({}, defaults, options);
	
			$.ajax_method_1(
				opts.url,
				opts.data,
				opts.type,
				function(data) {
					console.log(data);
					$("#pageContainer").remove();
					_this.after($('<div id="pageContainer" class="text-c mt-20"></div>')); //表格和表格后面的分页控制器
					if(parseInt(data.data.total_items) == 0) {//判断总条数
						_this.children("tbody").html("");
						$("#pageContainer").html("当前没有数据！");
					} 
					else if(parseInt(data.data.total_items) > 0) {					
						opts.callBack(data.data);
						//fn(data.data);
						laypage({
							cont: "pageContainer", //控制分页容器，
							pages: data.data.total_pages, //总页数
							skip: true, //是否开启跳页
							groups: 3, //连续显示分页数
							first: '首页', //若不显示，设置false即可
							last: '尾页', //若不显示，设置false即可
							//							prev: '<', //若不显示，设置false即可
							//							next: '>', //若不显示，设置false即可
							hash: true, //开启hash
							jump: function(obj, first) {
								if(!first || first == undefined) { //点击跳页触发函数自身，并传递当前页：obj.curr
									opts.data.page = obj.curr;
									$.ajax_method_1(
										opts.url,
										opts.data,
										opts.type,
										function(d) {
											//											fn(d.data);
											opts.callBack(d.data);
										}
									);
								}
	
							}
						});
						$("body").delegate(".laypage_btn", "click", function() {
							opts.data.page = $(".laypage_skip").val();
							$.ajax_method_1(
								opts.url,
								opts.data,
								opts.type,
								function(data) {
									opts.callBack(data.data);
								}
							);
						});
	
					}
					opts.eleTotal.text(parseInt(data.data.total_items));
				}
	
			);
		};
		
		/**
		 * 二维码
		 依赖脚本库和插件:
		 jquery.js
		 jquery.qrcode.js
		 qrcode.js
		 utf.js
		 *
		 * @param {Object} options 传入参数
		 * @property {String} options.event 触发插件功能的事件类型
		 * @property {String} options.logo 二维码中间logo图片
		 * */
		$.fn.QR_code = function(options){
			var _this = $(this);
			var defaults = {
				event: 'click', // 事件类型
				logo:'img/96.png'//二维码中间logo图片
			};
			var opts = $.extend({}, defaults, options);
			_this.on(opts.event,function(){
				generateQRCodeEvent(opts.logo);
			});
			
			/*生成二维码事件*/
			function generateQRCodeEvent(imgUrl){
			 	$(".modelBox").remove();
				/*容器盒子*/
				var modelBox = $("<div class='modelBox'></div>");
				/*蒙板*/
				var mask = $("<div></div>").css({
					"width": "100%",
					"height": "100%",
					"position": "fixed",
					"top": "0",
					"left": "0",
					"z-index": "900",
					"backgroundColor": "rgba(0,0,0,0.8)"
				});
				/*二维码区*/
				var QRCode = $("<div></div>").css({
					"width": "300px",
					"height": "300px",
					"backgroundColor": "#fff",
					"position": "fixed",
					"top": "50%",
					"left": "50%",
					"z-index": "999",
					"marginTop": "-150px",
					"marginLeft": "-150px"
				});
				$(modelBox).append(mask);
				$(modelBox).append(QRCode);
				/*生成LOGO*/
				var logo = $("<img src='"+ imgUrl +"'>").css({
					"width": "96px",
					"height": "96px",
					"position": "fixed",
					"top": "50%",
					"left": "50%",
					"z-index": "1000",
					"marginTop": "-48px",
					"marginLeft": "-48px"
				});
				$(QRCode).append(logo);
				/*获取地址栏地址*/
				var src = location.href;
				/*生成二维码*/
				$(QRCode).qrcode({
					render: "canvas",
					text: src,
					width: "300", //二维码的宽度
					height: "300", //二维码的高度
					correctLevel: 0,
					background: "#ffffff", //二维码的后景色
					foreground: "#000000" //二维码的前景色
				});
				var myCanvas = $(QRCode).children("canvas")[0];
				var myImg = convertCanvasToImage(myCanvas);
				myCanvas.style.display = "none";
				$(QRCode).append(myImg);
				/*添加进页面*/
				$("body").append(modelBox);
				modelBox.click(function() {
					modelBox.remove();
				});
				$(".modelBox img:last-child").css("border","1px solid #fff");
			}
			function convertCanvasToImage(canvas) {
				//新Image对象，可以理解为DOM
				var image = new Image();
				// canvas.toDataURL 返回的是一串Base64编码的URL，当然,浏览器自己肯定支持
				// 指定格式 PNG
				image.src = canvas.toDataURL("image/png");
				return image;
			}	
		};
		
		
	}catch(e){
		console.error("错误类型：" +　e);
	}
})(jQuery, window, document)



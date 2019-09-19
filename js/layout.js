$(function(){	
	
	//添加优化器路由方法				
	$(".add_optimizer").on("click",function(){
		$(".noDataBox").addClass("hide");
		$(".addOptimizerBox").removeClass("hide");
	});
		
	
	//切换厂商，对应切换表单内容
	$("#Optimizer_select").on("change",function(){
		$(".MF_formBox").eq($(this).val()).addClass("active").siblings(".MF_formBox").removeClass("active");
		localStorage.setItem("manufacturerId",$("#Optimizer_select").val());
	});
	
	//美化滚动条
	 $(".addOptimizerForm").niceScroll({
		zindex: "auto",
		cursorcolor: "#0099FF",  // 滚动条颜色，使用16进制颜色值
		 cursoropacitymin: 1,  // 当滚动条是隐藏状态时改变透明度，值范围1到0
		 background:"#bbb"
	 });
	 
	 
});

//添加优化器模块
var addOptimizer = new Vue({
	el:"#mainAppBox",
	data:{		
		panel_string_num:16,//组串最大数
		panel_num_arr:[],//面板和组串数据，[{"sId":1,"panelNum":0}],sId代表组串id（1到16排序），panelNum指示该组串下面板个数,如果有isUser参数，（1，0分别代表使用和否）,curr（1，0代表是否所选）是否当前所选		
		panel_num_arr_curritem:{"sId":1,"panelNum":0,"isUser":"0","curr":"1"},//当前所选组串数据		
		panel_num_total:0,//面板总数
		panel_table_col_td:32,//设置布局表格列数（原先32）
		panel_table_row_tr:32,//设置布局表格行数
		isHorizontalDir:true,//面板模块是否水平方向，
		panelDir:"270",//单个面板方向值,默认水平向左，"0"向上，"180"向下，"270"向左，"90"向右
		panelLayoutWay:"model",//面板布局方式
		panelLayoutWay_dir:"1",//组串批量摆放面板方式方向（1234分别代替上下左右）
		initGroupStr:{},//最初的组串对象
		inverterList:[],//逆变器列表
	},
	mounted() {
		var _this = this;

		//点击面板高亮
		$('body').on("click",".layout_table_item_a img",function(){
			$(".setLayout_section_input_SN,.setLayout_section_input_COM").val("");
			$(".layout_table_item_a").removeClass('active');
			$(this).parent().addClass('active');
			console.log($(this).parents('td').attr('data-tdid'),$(this).parents('tr').attr('data-trid'),"纵横数");
			//回显示参数到表单
			if($(this).parent().attr('data-sn') && $(this).parent().attr('data-com')){
				$(".setLayout_section_input_SN").val($(this).parent().attr('data-sn'));
				$(".setLayout_section_input_COM").val($(this).parent().attr('data-com'));
			}
		});
		
		//切换面板布局方式
		$(".string_icon").on("click",function(){
			$(this).addClass('active').siblings('.string_icon').removeClass('active');
			_this.panelLayoutWay_dir = $(this).attr('data-dir');
			_this.getDirection();
		});
		
		//初始化拖拽功能
		this.dropFn();
		
		//添加模块
		this.createPanelModel();
		
		//初始化优化器厂商数据
		localStorage.setItem("manufacturerId",$("#Optimizer_select").val());
		//监听切换厂商
		// $("#Optimizer_select").on("change",function(){
		// 	localStorage.setItem("manufacturerId",$("#Optimizer_select").val());
		// });
		
		
		//设置表格布局纵横个数失去焦点事件
		this.tableLayoutBlur();
	},
	created() {
		//请求逆变器列表(初始化是growatt)
		this.getInvList();
	},
	updated(){
		//数据update的时候
		//更新面板总数
		this.getTotalPanel();
		
	},
	methods:{
		//获取当前所选组串，返回其对象数据
		getCurrString(){
			var item = null;
			for(var i=0;i<this.panel_num_arr.length;i++){
				//console.log(JSON.stringify(this.panel_num_arr[i]),'log')
				if(this.panel_num_arr[i].curr == "1"){
					item = this.panel_num_arr[i];
					break;
				}
			}
			return item;
		},
		//组串个数选择
		stringCount_selectFn(){
			function sort_back(sss){
				return ((sss == 1) ? "1" : "0");
			}
			var _this = this;	
			var v = $('#stringCount_select').val()*1;
			if(v === 0) {
				_this.panel_num_arr = [];
				return;
			}
			
			_this.panel_num_arr = [];
			for(var i =1;i<=v;i++){
				_this.panel_num_arr.push({
					"sId":i,
					"panelNum":0,
					"isUser":"0",
					"curr":sort_back(i),
					"sName":$.numToLetter(i)
				});
			}
			
			 //获取当前所选组串，并存储
			_this.panel_num_arr_curritem = _this.getCurrString();
		},		
		//获取面板总数(剩余)
		getTotalPanel(){			
			var tem = 0;
			for(var i=0,len=this.panel_num_arr.length;i<len;i++){
				tem += (this.panel_num_arr[i].panelNum)*1;
			}
			this.panel_num_total = tem;
			return tem;
		},
		//跳转布局页面
		toLeyoutPage(){
			
			var t = this.getTotalPanel();
			console.log("组串数据：",this.panel_num_arr);
			if(t > 0){
				//bounceInLeft animated
				$('.setLayoutBox').removeClass('hide').addClass('bounceInLeft').siblings('div').addClass('hide');
				$('.nicescroll-rails').addClass('hide');	
				
				for(var k=0;k<this.panel_num_arr.length;k++){
					var prop = $.numToLetter(k+1);
					this.initGroupStr[prop] = this.panel_num_arr[k].panelNum;
				}
				console.log(this.initGroupStr,"res")
			}else{
				layer.alert('请至少添加一个面板')
			}
		
		},
		//关闭模版设置布局模块
		close_setLayoutFn(){
			var _this = this;
			var index = layer.confirm(
				"如未保存布局，关闭窗口，当前布局会被清除！是否依然关闭窗口？",
				function(){
					$(".setLayoutBox").addClass("hide");
					$(".addOptimizerBox").removeClass('hide').addClass('bounceInRight');
					$('.nicescroll-rails').removeClass('hide');
					$(".layout_table_item_a").each(function(k){
						var $this = $(this);
						$(this).remove();
						$(this).parent().removeClass('assigned');
						for(var i=0;i<_this.panel_num_arr.length;i++){
							if($this.attr("data-sid") == _this.panel_num_arr[i].sId){
								_this.panel_num_arr[i].panelNum = _this.panel_num_arr[i].panelNum*1;
								_this.panel_num_arr[i].panelNum++;
							}
						}
					});
					layer.close(index);
				}
			);
			
			
		},
		//获取剩余面板总数
		getResiduePanel(){
			var tem = 0;
			for(var i=0;i<this.panel_num_arr.length;i++){
				if(!this.panel_num_arr[i].isUser){
					tem += this.panel_num_arr[i].panelNum;
				}				
			}
			this.panel_num_total = tem;
			return tem;
		},
		
		//拖拽函数
		dropFn(){
			var _this = this;
			//拖拽
			$('.layoutTableBox .layout_table_item_a').draggable({
				revert:true,
				// proxy:'clone'
			});		
			$('.layoutTableBox div.drop,.setLayout_section_top').droppable({
				onDragEnter:function(){
					$(this).addClass('over');
				},
				onDragLeave:function(){
					$(this).removeClass('over');
				},
				onDrop:function(e,source,d,ss){
					
					
					$(this).removeClass('over');
					if($(this).attr("data-sign") && $(this).attr("data-sign") == "recycleBox"){
						var sId = $(source).attr("data-sid");
						for(var i=0;i<_this.panel_num_arr.length;i++){
							if(_this.panel_num_arr[i].sId == sId){
								_this.panel_num_arr[i].panelNum = _this.panel_num_arr[i].panelNum*1;
								_this.panel_num_arr[i].panelNum++;
							}
						}
						$(source).remove();
						return;
					}
					if ($(source).hasClass('assigned')){//再添加
						if($(this).children().length > 0){
							console.log('坑位已经被霸占了111')
						}else{
							$(this).append(source);
						}		
						
					}
					 else {//复制过去
						if($(this).hasClass('layout_table_item')){
							if($(this).children().length > 0){
								console.log('坑位已经被霸占了')
							}else{
								var c = $(source).clone().addClass('assigned');
								$(this).empty().append(c);
								c.draggable({
									revert:true
								});
								$(source).remove();
								console.log($(this),"要插入的容器");
							}
							
						}else{
							console.log('不是可以正常拖拽的区域');
						}
						
					}
				}
			});
		},
		//递增面板格子行数,table的tr
		// addPanelTable(){
		// 	this.panel_table_row_tr += 5;
		// 	setTimeout(this.dropFn,100);
		// },
		//更新表格布局列个数
		// updateTableCol(){
		// 	var len = $(".layoutTable_set .layout_table_item_a").length;
		// 	var v = $(".layout_table_col_input").val();
		// 	if(v == "" || len > 0) return;
		// 	var _this = this;			
		// 	if(v*1 >= 10){
		// 		$.debounce(function(){
		// 			_this.panel_table_col_td = v*1;
		// 		},1000);				
		// 	}
		// },
		// //更新表格布局行个数
		// updateTableRow(){
		// 	var len = $(".layoutTable_set .layout_table_item_a").length;
		// 	var v = $(".layout_table_row_input").val();
		// 	if(v == "" || len > 0) return;
		// 	var _this = this;			
		// 	if(v*1 >= 10){
		// 		$.debounce(function(){
		// 			_this.panel_table_row_tr = v*1;
		// 		},1000);				
		// 	}
		// },
		//更新布局尺寸大小
		updateTableSize(){
			var _this = this;
			var len = $(".layoutTable_set .layout_table_item_a").length;
			var v = $(".layout_table_input").val();
			if(v == "" || len > 0){
				return;
			}
			if(v*1 >= 10){
					$.debounce(function(){
						_this.panel_table_row_tr = v*1;
						_this.panel_table_col_td = v*1;
						$(".layout_table_input").val(_this.panel_table_row_tr);
					},500);				
				}
		},
		//设置表格布局纵横个数失去焦点事件
		tableLayoutBlur(){
			var _this = this;	
			$(".layout_table_input").on("blur",function(){
				var len = $(".layoutTable_set .layout_table_item_a").length;
				if($(this).val() == "" || len < 10){
					$(this).val(_this.panel_table_row_tr);
					return;
				}
				_this.updateTableSize();
			});
			// $(".layout_table_row_input").on("blur",function(){
			// 	$(this).val(_this.panel_table_row_tr);
			// });
			// $(".layout_table_col_input").on("blur",function(){
			// 	$(this).val(_this.panel_table_col_td);
			// });
		},
		//创建单个面板模块和组串布局
		createPanelModel(){
			var _this = this;
			$('body').on('click','.layout_table_item',function(){
				var $this = $(this);
				if($(this).children().length > 0){
					return;
				}				
				if(_this.panelLayoutWay == "model"){//单个模块创建面板方式
					_this.getResidueString_panel($this);
				}else if(_this.panelLayoutWay == "string"){//组串创建面板方式
					var colNum = $(this).parent('td').attr("data-tdid")*1;
					var rowNum = $(this).parents('tr').attr("data-trid")*1;
					_this.getResidueString_string(rowNum,colNum,$(this));
				}
				
				
			});
		},
		//获取当前创建模块面板的方向值
		getPanelDirFn(){
			if(this.panelDir == "0"){
				return {
					className:"toTop",
					orientation:"0"
				};
			}
			else if(this.panelDir == "180"){
				return {
					className:"toBottom",
					orientation:"180"
				};
			}
			else if(this.panelDir == "270"){//水平
				return {
					className:"horizontal toLeft",
					orientation:"270"
				};
			}
			else if(this.panelDir == "90"){	//水平
				return {
					className:"horizontal toRight",
					orientation:"90"
				};
			}
		},
		//判断是否为0，返回对应的类名
		isZeroClass(p){
			if(p == 0) return "c_c9";
		},
		/**
		 * 模块方式添加面板的时候，计算当前所选组串面板个数(模块布局)
		 * @param {Function} callback 回调函数，参数，当前选择的组串数据
		 * @param {Object} obj 点击的对象div 
		 * */
		getResidueString_panel(obj){
			var _this = this;
			//当前选择组串减1
			this.panel_num_arr_curritem.panelNum = this.panel_num_arr_curritem.panelNum*1;
			if(this.panel_num_arr_curritem.panelNum > 0){
				this.panel_num_arr_curritem.panelNum--;
				this.panel_num_arr_curritem.isUser = "1";		
				var sHtml = '<a href="javascript:;" class="layout_table_item_a '+ _this.getPanelDirFn().className +'" title="组串'+ this.panel_num_arr_curritem.sName +'的面板" data-orientation="'+ _this.getPanelDirFn().orientation +'" data-sid="'+ this.panel_num_arr_curritem.sId +'"><img src="img/setLayout/panel.png"/></a>';
				var panelItem = $(sHtml);
				obj.append(panelItem);
				setTimeout(_this.dropFn,100);
			}else{
				layer.msg('当前组串面板数目为0，请重选组串！')
			}
		},
		/**
		 * 组串方式添加面板的时候，清空当前所选组串面板数，且自动切换下一个（组串布局）
		 * @param {Number} rowNum 行数 
		 * @param {Number} colNum 列数 
		 * @param {Object} obj 点击的对象div 
		 * */
		getResidueString_string(rowNum,colNum,obj){
			var _this = this;
			this.panel_num_arr_curritem.panelNum = this.panel_num_arr_curritem.panelNum*1;
			var currPanelNum = this.panel_num_arr_curritem.panelNum*1;
			var panelItem = '<a href="javascript:;" class="layout_table_item_a '+ _this.getPanelDirFn().className +'" title="组串'+ this.panel_num_arr_curritem.sName +'的面板"  data-orientation="'+ _this.getPanelDirFn().orientation +'"  data-sid="'+ this.panel_num_arr_curritem.sId +'"><img src="img/setLayout/panel.png"/></a>';
			if(currPanelNum > 0){
				if(this.panelLayoutWay_dir == "1"){//往上
					var $div= null;
					for(var k=0;k<currPanelNum;k++){
						if(rowNum == 0){
							break;
						} 	
						$div = $(".layoutTable_set tbody tr:nth-child("+ rowNum +")").children('td:nth-child('+ colNum +')').children('.layout_table_item');				
						if($div.children().length == 0){						
							resultTodo($div);
							rowNum--;						
						}else{//如有面板，回到上一次循环，行数继续递减，
							rowNum--;
							k = k - 1;
						}						
					}
				}else if(this.panelLayoutWay_dir == "2"){//往下
					var $div= null;
					for(var k=0;k<currPanelNum;k++){
						if(rowNum == (_this.panel_table_row_tr + 1)){
							break;
						} 	
						$div = $(".layoutTable_set tbody tr:nth-child("+ rowNum +")").children('td:nth-child('+ colNum +')').children('.layout_table_item');				
						if($div.children().length == 0){						
							resultTodo($div);
							rowNum++;						
						}else{//如有面板，回到上一次循环，
							rowNum++;
							k = k - 1;
						}						
					}
				}else if(this.panelLayoutWay_dir == "3"){//往左
					var $div= null;
					for(var k=0;k<currPanelNum;k++){
						if(colNum == 0){
							break;
						} 	
						$div = $(".layoutTable_set tbody tr:nth-child("+ rowNum +")").children('td:nth-child('+ colNum +')').children('.layout_table_item');				
						if($div.children().length == 0){						
							resultTodo($div);
							colNum--;						
						}else{//如有面板，回到上一次循环，
							colNum--;
							k = k - 1;
						}						
					}
				}else if(this.panelLayoutWay_dir == "4"){////往右
					var $div= null;
					for(var k=0;k<currPanelNum;k++){
						if(colNum == (_this.panel_table_col_td + 1)){
							break;
						} 	
						$div = $(".layoutTable_set tbody tr:nth-child("+ rowNum +")").children('td:nth-child('+ colNum +')').children('.layout_table_item');				
						if($div.children().length == 0){													
							resultTodo($div);
							colNum++;						
						}else{//如有面板，回到上一次循环，，
							colNum++;
							k = k - 1;
						}						
					}
				}
			}else{
				layer.msg('该组串面板已经用完，请重选其他组串！');
			}
			
			function resultTodo(obj){
				obj.append($(panelItem));
				_this.panel_num_arr_curritem.panelNum--;							
				setTimeout(_this.dropFn,100);
			}
			
		},
		//获取面板方向值
		getDirection(){
			console.log(this.panelLayoutWay_dir)
		},
		//切换组串作为当前选择显示
		toggleCurrString(v){			
			for(var i=0;i<this.panel_num_arr.length;i++){
				this.panel_num_arr[i].curr = "0"
			}
			v.curr = "1";
			this.panel_num_arr_curritem = v;
		},
		//清除参数绑定
		clearParamFn(){
			$('.setLayout_section_input_SN,.setLayout_section_input_COM').val("");
			$('.active.layout_table_item_a').removeAttr("data-sn").removeAttr("data-com").find('img').attr('src','img/setLayout/panel.png');
		},
		//面板保存参数
		saveParanFn(){
			var _SN = $(".setLayout_section_input_SN").val();
			var _COM = $(".setLayout_section_input_COM").val();
			if(_SN != "" && _COM != "" && $('.active.layout_table_item_a')){
				$('.active.layout_table_item_a').attr("data-sn",_SN).attr("data-com",_COM).find('img').attr('src','img/setLayout/panel_param.png');
				layer.msg('保存成功');
			}else{
				layer.alert('面板的参数必须填写才能保存')
			}
		},
		//面板显示参数
		showParamFn(){
			
		},
		//跳转逻辑图
		toPanelLayout(){
			window.location.href = "logicDiagram.html"
		},
		//保存面板布局
		savePanelLayoutFn(){
			var _this = this;
			// var allLen = $(".layout_table_item_a").length;//所有面板长度
			// var editedLen = $(".layout_table_item_a.active").length;//已经编辑参数的面板长度
			// console.log("原面板:"+allLen,"已编辑面板："+editedLen)
			// if(editedLen < allLen){
			// 	layer.alert("部分面板的SN参数和COM参数未添加")
			// 	return;
			// }
			
			var panelList = [];
			$(".layout_table_item_a").each(function(){
				var tdid = $(this).parents("td").attr("data-tdid");
				var trid = $(this).parents("tr").attr("data-trid");
				var loc = tdid + "-" + trid;
				panelList.push({
					"optimezerId":$(this).attr("data-sn") || "",
					"comAddr":$(this).attr("data-com") || "",
					"panelOrientation":$(this).attr("data-orientation"),
					"location":loc,
					"string_label":$.numToLetter($(this).attr("data-sid")*1)
				});
			});
			
			setTimeout(function(){
				var panelList2 = $.getSameVal(panelList,"string_label");
				// console.log(panelList2,"转化后的面板数组");
				var res = _this.squeezeFn(panelList2);				
				var oRes = _this.concordanceFn(res);//最终要发送到后台的数据
				console.log(oRes,"请求的数据")
				//异步请求
				oComFn.ajax_method(
					oComFn.ajaxUrl_local + "/layout/addGrowattOptimizer",
					oRes,
					"post",
					function(data){
						layer.msg("success")
					}
				);
				
			},500);
		},
		//面板数据降为处理，并添加面板id
		squeezeFn(arr){
			//组串对象
			//var groupStr = {};
			for(var i=0;i<arr.length;i++){
				for(var j=0;j<arr[i].length;j++){
					arr[i][j].panelId = arr[i][j].string_label + (j+1);
				}
				
				//groupStr[arr[i][0].string_label] = arr[i].length;				
			}
			return arr;
		},
		//整合面板布局数据保存后台
		concordanceFn(res){
			var _this = this;
			var arr = [];
			for(var k in res){
				arr = arr.concat(res[k]);
			}
			
			var oRes = {
				plantId:"123",//电站id
				deviceSn:$("#inverterList_select").val(),//inv 序列号
				groupStr:_this.initGroupStr,//组串对象
				panelList:arr,//面板列表
				panelLayoutSize:_this.panel_table_col_td * _this.panel_table_row_tr,//面板布局表格尺寸个数
			};
			return oRes;
		},
		numToLetter(n){
			return $.numToLetter(n*1);
		},
		//请求逆变器列表
		getInvList(){
			var _this = this;
			oComFn.ajax_method(
				"json/invList.json",
				{
					plantId:"123",//电站id
					type:$("#Optimizer_select").find("option:selected").attr("data-val")*1,
				},
				"get",
				function(data){
					// console.log(data,"invlist");
					_this.inverterList = data.obj;
				}
			);
		},
		//请求验证tigo账户
		verifyTigoFn(){
			var account = $("#tigoAccount_input").val();
			var pwd = $("#tigoPwd_input").val();
			if(account == "" || pwd == ""){
				layer.msg("账户密码不可以为空");
				return;
			}
			//异步请求
			oComFn.ajax_method(
				oComFn.ajaxUrl_local + "/layout/physical/checkTigoUser",
				{userName:account,password:pwd},
				"post",
				function(data){
					layer.msg("success",data);
				}
			);
		},
	},
});
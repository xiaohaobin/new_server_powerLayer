// console.log(leftNavDataModel(site_data));
	var left_nav_data = leftNavDataModel(site_data);
	randerNavList(left_nav_data);

/**
	 * 后台数据转换为适应于左边菜单的数据模型
	 * @param {Object} siteData 后台数据
	 * @return {Object} 适应于左边菜单数据模型
	 * */
	function leftNavDataModel(siteData) {
		var oRes = {};
		oRes.name = siteData.name;
		oRes.lv = 1;
		oRes.power = siteData.power;
		oRes.children = siteData.inverter;
		//去除id，以免影响treeLayout
		for (var i = 0; i < oRes.children.length; i++) {
			oRes.children[i].lv = 2;
			var len = oRes.children[i].panelList.length;
			if (oRes.children[i].panelList.length > 0) {
				oRes.children[i].children = [];
				var arr_1 = $.getSameVal(oRes.children[i].panelList, "string");
				for (var k = 0; k < arr_1.length; k++) {
					oRes.children[i].children.push({
						name: "zc",
						lv: 3,
						// children:[{name:"",lv:4}],
						model: oRes.children[i].model,
						children: null,
						list: arr_1[k]
					})
				}
			}
		}

		return oRes;
	}
	
	//渲染左边菜单列表
	function randerNavList(oData) {
		var tem = "";
		tem = '<div class="panelListItem" >' +
			'<div class="panel_powerTitle">' +
			'<h5>' +
			'<img src="img/leftNav/location.png" alt="">' +
			'<b class="c_black">' + oData.name + '</b>' +
			'</h5>' +
			'</div>' +
			'<div class="list">' +
			'<ul class="">' +
			randerLi(oData.children) +
			'</ul>' +
			'</div>'
		'</div>';
		$(".panelListBox").html(tem);
	}


	//渲染一级数据，逆变器
	function randerLi(aData) {
		var tem = '';
		$.each(aData, function(i, v) {
			tem += '<li class="panel_LV1" data-id="' + (v.id ? v.id : '') + '">' +
				'<a href="javascript:;" class="inactive">' +
				'<span>' + v.name + '(' + v.model + ')</span>' +
				'</a>' +
				'<ul style="display: none">' + randerLi2(v.children) + '</ul>' +
				'</li>';
		});
		return tem;
	}

	//渲染二级数据，组串
	function randerLi2(aData) {
		var tem = '';
		$.each(aData, function(i, v) {
			tem += '<li class="panel_LV2" data-id="' + (v.id ? v.id : '') + '">' +
				'<a href="javascript:;" class="inactive active">' +
				'<span>组串' + (i + 1) + '</span>' +
				'</a>' +
				'<ul>' +
				randerLi3(v.list) +
				'</ul>' +
				'</li>';
		});
		return tem;
	}

	//渲染三级数据，面板
	function randerLi3(aData) {
		var tem = '';
		$.each(aData, function(i, v) {
			// tem += '<li class="panel_LV3" data-id="' + (v.id ? v.id : '') + '" data-main="'+ JSON.stringify(v) +'">' +
				tem += "<li class='panel_LV3' data-id='"+ (v.id ? v.id : "") +"' data-main='"+ JSON.stringify(v) +"'>" +
				'<a href="javascript:;">' +
				'<span>' + v.name + '(' + v.model + ')</span>'+ 
				'</a>' +
				'</li>';
		});
		return tem;
	}


	//左边菜单折叠
	$('body').on("click", ".inactive", function() {
		if ($(this).siblings('ul').css('display') == 'none') {
			$(this).addClass('inactives');
			$(this).siblings('ul').slideDown(100).children('li');
		} else {
			//控制自身变成+号
			$(this).removeClass('inactives');
			//控制自身菜单下子菜单隐藏
			$(this).siblings('ul').slideUp(100);
			//控制自身子菜单变成+号
			$(this).siblings('ul').children('li').children('ul').parent('li').children('a').addClass('inactives');
			//控制自身菜单下子菜单隐藏
			$(this).siblings('ul').children('li').children('ul').slideUp(100);
			//控制同级菜单只保持一个是展开的（-号显示）
			$(this).siblings('ul').children('li').children('a').removeClass('inactives');
		}
	});

// 	//左边菜单选择优化器样式
// 	$('body').on("click", '.panel_LV3>a>span', function() {
// 		// $(this).addClass('hover').parents('.panel_LV3').siblings('.panel_LV3').find('span').removeClass('hover');
// 		$(".panel_LV1>a>span,.panel_LV2>a>span,.panel_LV3>a>span").removeClass('hover');
// 
// 		$(this).parents('.panel_LV2').children('a').children('span').addClass('hover');
// 		$(this).parents('.panel_LV1').children('a').children('span').addClass('hover');
// 		$(this).addClass('hover');
// 		
// 		$('.panel_LV3>a>span').removeClass("fuzzy");
// 	});
	
	//模糊检索
	function fuzzyRetrieval(txt){
		$('.panel_LV3>a>span').removeClass("fuzzy");
		if(txt == "") return;
		txt = txt.toUpperCase();
		
		$('.panel_LV3>a>span').each(function(){
			var _txt = $(this).text().toUpperCase();
			if(_txt.indexOf(txt) > -1){
				$(this).addClass('fuzzy');
				var p1 = $(this).parents("ul").prev(".inactive");
				p1.each(function(){
					if(!$(this).hasClass("inactives")){
						$(this).click();
					}
				});
				
			}else{
				// $('.panel_LV3>a>span').removeClass("fuzzy");
			}
		});
	}
	
	//模糊检索事件
	$(".panel_serach_btn").on("click",function(){
		fuzzyRetrieval( $('.panel_serach_input').val() );
	});
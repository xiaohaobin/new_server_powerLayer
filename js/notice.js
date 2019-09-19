//引入公共的面板逆变器左边菜单html片段
	oComFn.importLeftNavHtml(function(){
		//监听左边逆变器面板菜单点击事件
		oComFn.LN_panelClickEvent(function(id,data){
			console.log(id,data)
		});
	});
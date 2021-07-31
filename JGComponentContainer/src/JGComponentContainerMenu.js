isc.ClassFactory.defineClass("JGComponentContainerMenu", "Menu");
isc.JGComponentContainerMenu.addProperties({
	styleName: "JGComponentContainerMenu" //整个下拉菜单
});
isc.JGComponentContainerMenu.addMethods({
	getCellStyle: function () {
		var style = this.Super("getCellStyle", arguments);
		if (arguments[0] && arguments[0].checked === true) {
			style = "selected " + style;
		}
		return style;
	}
});
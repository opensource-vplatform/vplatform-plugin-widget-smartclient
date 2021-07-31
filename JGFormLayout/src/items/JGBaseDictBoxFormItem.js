isc.ClassFactory.defineClass("JGBaseDictBoxFormItem", "V3BaseDictBoxItems");
isc.JGBaseDictBoxFormItem.addProperties({

});
isc.JGBaseDictBoxFormItem.addMethods({
	init: function () {
		this.Super("init", arguments);
		if(this.form&&this.form._putWidgetContextProperty){
			this.form._putWidgetContextProperty(this.Code,'widgetObj',this);
		}
	}
});
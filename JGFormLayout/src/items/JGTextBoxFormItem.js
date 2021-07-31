isc.ClassFactory.defineClass("JGTextBoxFormItem", "V3TextItems");
isc.JGTextBoxFormItem.addProperties({

});

isc.JGTextBoxFormItem.addMethods({
	init: function () {
		this.Super("init", arguments);
		if(this.form&&this.form._putWidgetContextProperty){
			this.form._putWidgetContextProperty(this.Code,'widgetObj',this);
		}
	}
});
isc.ClassFactory.defineClass("JGRadioGroupFormItem", "V3RadioGroupItems");

isc.JGRadioGroupFormItem.addProperties({});
isc.JGRadioGroupFormItem.addMethods({
	init: function () {
		this.Super("init", arguments);
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
	},
	getData: function () {
		return this.DropDownSource;
	}
});
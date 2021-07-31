isc.ClassFactory.defineClass("JGCheckBoxGroupFormItem", "V3CheckBoxGroupItems");

isc.JGCheckBoxGroupFormItem.addProperties({});
isc.JGCheckBoxGroupFormItem.addMethods({
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
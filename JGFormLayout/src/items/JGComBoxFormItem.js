isc.ClassFactory.defineClass("JGComboBoxFormItem", "V3ComboBoxItems");

isc.JGComboBoxFormItem.addProperties({

});
isc.JGComboBoxFormItem.addMethods({
	init: function () {
		this.Super("init", arguments);
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
	},
	getData: function () {
		return this.form ? this.form.getDropDownSourceJGComboBox(this.Code):null;
	}
});
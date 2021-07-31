isc.ClassFactory.defineClass("JGFloatBoxFormItem", "V3FloatBoxItems");
isc.ClassFactory.mixInInterface("JGFloatBoxFormItem", "JGFormatHelper");

isc.JGFloatBoxFormItem.addProperties({});
isc.JGFloatBoxFormItem.addMethods({
	init: function () {
		this.Super("init", arguments);
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
	},
	getTextAlign: function () {
		var entityCode = this.SourceTableName;
		if (this.ColumnName == "" || !this.form) {
			return "left";
		} else {
			var fieldName = this.ColumnName.split(this.form.multiDsSpecialChar)[1];
			var currencyField = this.form._getCurrencyField();
			if (currencyField && currencyField[entityCode] && currencyField[entityCode][fieldName]) {
				return "right";
			} else {
				return "left";
			}
		}
	},
});
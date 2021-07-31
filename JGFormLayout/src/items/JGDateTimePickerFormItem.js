isc.ClassFactory.defineClass("JGDateTimePickerFormItem", "V3DateTimeItem");

isc.JGDateTimePickerFormItem.addProperties({});
isc.JGDateTimePickerFormItem.addMethods({
    init: function () {
        this.layoutType = "formLayout";
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    },
});
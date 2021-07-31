isc.ClassFactory.defineClass("JGLongDateTimePickerFormItem", "V3LongDateTimeItem");

isc.JGLongDateTimePickerFormItem.addProperties({});
isc.JGLongDateTimePickerFormItem.addMethods({
    init: function () {
        this.layoutType = "formLayout";
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    },
});
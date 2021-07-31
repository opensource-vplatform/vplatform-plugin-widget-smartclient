isc.ClassFactory.defineClass("JGPeriodFormItem", "V3PeriodItem");

isc.JGPeriodFormItem.addProperties({});

isc.JGPeriodFormItem.addMethods({
    init: function () {
        this.layoutType = "formLayout";
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    }
});
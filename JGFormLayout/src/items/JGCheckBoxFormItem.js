isc.ClassFactory.defineClass("JGCheckBoxFormItem", "V3CheckBoxItems");
isc.JGCheckBoxFormItem.addProperties({});
isc.JGCheckBoxFormItem.addMethods({
    init: function () {
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    }
});
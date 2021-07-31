isc.ClassFactory.defineClass("JGPasswordFormItem", "V3PasswordItems");

isc.JGPasswordFormItem.addProperties({});
isc.JGPasswordFormItem.addMethods({
    init: function () {
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    }
});
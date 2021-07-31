isc.ClassFactory.defineClass("JGLongTextBoxFormItem", "V3LongTextItem");

isc.JGLongTextBoxFormItem.addProperties({});
isc.JGLongTextBoxFormItem.addMethods({
    init: function () {
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    }
});
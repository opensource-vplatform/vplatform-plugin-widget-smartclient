isc.ClassFactory.defineClass("JGHyperLinkFormItem", "V3HyperLinkItem");

isc.JGHyperLinkFormItem.addProperties({});
isc.JGHyperLinkFormItem.addMethods({
    init: function () {
        this.Super("init", arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    }
});
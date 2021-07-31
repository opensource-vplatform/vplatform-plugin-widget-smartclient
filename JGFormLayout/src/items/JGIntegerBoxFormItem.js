isc.ClassFactory.defineClass("JGIntegerBoxFormItem", "V3IntegerBoxItems");

isc.JGIntegerBoxFormItem.addProperties({

});
isc.JGIntegerBoxFormItem.addMethods({
  init: function () {
    this.Super("init", arguments);
    if (this.form && this.form._putWidgetContextProperty) {
      this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
    }
  }
});

isc.ClassFactory.defineClass("JGRichTextEditorFormItem", "V3RichTextEditorItem");
isc.JGRichTextEditorFormItem.addProperties({
});

isc.JGRichTextEditorFormItem.addMethods({
    init : function(){
        var _this = this;
        this.blurDataSync = (function(){
            return function(){
                var newValue = _this.getContent();
                widgetDatasource.setSingleValue(_this.Code, newValue);
            }
        })();
        this.Super("init",arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    }
});
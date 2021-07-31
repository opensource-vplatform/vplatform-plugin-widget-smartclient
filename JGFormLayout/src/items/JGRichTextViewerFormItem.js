isc.ClassFactory.defineClass("JGRichTextViewerFormItem", "V3RichTextViewItems");
isc.JGRichTextViewerFormItem.addProperties({

});

isc.JGRichTextViewerFormItem.addMethods({
    init: function () {
        this.Super("init", arguments);
        if(this.form&&this.form._putWidgetContextProperty){
			this.form._putWidgetContextProperty(this.Code,'widgetObj',this);
		}
    }
});
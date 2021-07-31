isc.ClassFactory.defineClass("JGLinkLabelFormItem", "LinkItem");
isc.ClassFactory.mixInInterface("JGLinkLabelFormItem", "IV3FormItem");

isc.JGLinkLabelFormItem.addProperties({
    WidgetStyle: "JGLinkLabel",
    //            Placeholder:"placehoder"
});

isc.JGLinkLabelFormItem.addMethods({
    init: function () {
        this.name = this.ColumnName;
        this.tabIndex = this.TabIndex;
        this.visible = this.Visible;
        this.showTitle = false;
        this.disabled = !this.Enabled;
        this.required = this.IsMust;
        if (!this.showTitle) {
            this.cellStyle += " formItemNoLabel";
        }
        this.itemHoverHTML = this.getToolTipHandler(this.Code, this.ToolTip);
        this.linkTitle = this.SimpleChineseTitle;
        this.titleClick = this.getV3EventHandler(this.Code, "OnLabelClick");
        this.keyDown = this.getV3KeyDownEventHandler(this.Code);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
        this.Super("init", arguments);
    },

    getValueChangeFields: function () {
        return [this.name];
    },

    getBindFields: function () {
        return this.getValueChangeFields();
    },
    parentReadOnly: function (readOnly) {
        var readOnly = this.ReadOnly || readOnly;
        this.setDisabled(readOnly);
    },
    isReadOnly: function () {
        var _1 = this;
        while (_1.parentItem != null) {
            if (_1.canEdit != null) {
                return !_1.canEdit
            }
            _1 = _1.parentItem
        }
        return _1.ReadOnly || _1._ReadOnly;
    },
    canEditChanged: function (canEdit) {
        this.setDisabled(!canEdit)
    }
});
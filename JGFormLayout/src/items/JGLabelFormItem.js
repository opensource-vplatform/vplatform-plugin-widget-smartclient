isc.ClassFactory.defineClass("JGLabelFormItem", "StaticTextItem");
isc.ClassFactory.mixInInterface("JGLabelFormItem", "IV3FormItem");
isc.ClassFactory.mixInInterface("JGLabelFormItem", "JGStyleHelper");

isc.JGLabelFormItem.addProperties({
    WidgetStyle: "JGLabel",
    //            Placeholder : "placeholder"
});

isc.JGLabelFormItem.addMethods({
    init: function () {
        //            	this.textBoxStyle="LabelFormItem";
        this.textBoxStyle = "JGLabelStaticTextItem";
        this.cellStyle = "formCell JGLabelFormItem"
        this.cssText = this.cssTextExtend(this.cssText, {
            "color": this.ForeColor,
            "font-style": this.FontStyleItalic,
            "text-decoration": this.FontStyleDecoration,
            "font-size": this.FontStyleSize,
            "font-family": this.FontStyleFamily,
            "font-weight": this.FontStyleBold,
            "min-height": this.MultiHeight,
            "min-width": this.MultiWidth
        });
        this.showTitle = false;
        if (!this.showTitle) {
            this.cellStyle += " formItemNoLabel";
        }
        this.name = this.Code;
        this.value = this.SimpleChineseTitle;
        this.tabIndex = this.TabIndex;
        this.visible = this.Visible;
        this.disabled = false;
        this.align = this.TextAlign;
        this.valign = isc.Canvas.Middle;
        this.overflow = isc.Canvas.HIDDEN; //防止溢出
        this.wrap = true; //防止中文换行
        this.itemHoverHTML = this.getToolTipHandler(this.Code, this.ToolTip);
        this.click = this.getV3EventHandler(this.Code, "OnClick");
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
        this.Super("init", arguments);
    },
    setForeColor: function (foreColor) {
        foreColor = this.parseColor(foreColor);
        this.ForeColor = foreColor;
        //原生没有接口的，用cssText属性设置
        var newCssText = this.cssTextExtend(this.cssText, {
            "color": foreColor
        });
        this.setLabelStyle(newCssText);
    },
    setFontStyle: function (fontStyle) {
        fontStyle = this.parseFontStyle(fontStyle);
        this.FontStyle = fontStyle;
        var newCssText = this.cssTextExtend(this.cssText, fontStyle, true);
        this.setLabelStyle(newCssText);
    },
    setLabelStyle: function (newCssText) {
        this.cssText = newCssText;
        this.redraw();
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
    }
});
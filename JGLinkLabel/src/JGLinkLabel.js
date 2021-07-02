/**
 * v平台链接控件
 * @class JGLinkLabel
 * @extends JGBaseWidget
 * @mixes JGStyleHelper
 */
isc.ClassFactory.defineClass("JGLinkLabel", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGLinkLabel", "JGStyleHelper");

isc.JGLinkLabel.addProperties({
    Top: null,
    Left: null,
    Width: 59,
    Height: 15,
    Enabled: true,
    TabIndex: 1,
    className: "JGLinkLabelNormal",
    WebPara: null,
    SimpleChineseTitle: null,
    currentContent: null,
    BackColor: null,
    ForeColor: null,
    TextAlign: null,
    WebURL: null,
    Target: null,
    WidgetStyle: "JGLinkLabel",
    listener: [
        'click'
    ]
});

isc.JGLinkLabel.addMethods({
    //自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
    _initWidget: function () {
        this.WebPara = this.WebParam;
        var isUn = (this.WebURL == "" || !this.Enabled) ? this.WidgetStyle + 'isSelectedEventLink' : this.WidgetStyle + 'isSelectedEventLinkUp'; //是否变手型
        this.className = this.WidgetStyle + "Normal";
        this.ink = isc.Label.create({
            //ID: this.id,
            id: this.id,
            align: this.TextAlign,
            width: this.Width,
            height: this.Height,
            disabled: !this.Enabled,
            tabIndex: this.TabIndex,
            contents: this.genTitleContent(this.SimpleChineseTitle),
            overflow: isc.Canvas.HIDDEN, //防止溢出
            backgroundColor: this.BackColor,
            cssText: this.genFontCssText(this.FontStyle, this.ForeColor) + 'word-break: break-all;',
            title: this.SimpleChineseTitle,
            //prompt: this.SimpleChineseTitle,
            click: this._referEvent(this, 'click'),
            canHover: true,
            //styleName : isUn,
            baseStyle: isUn,
            canFocus: true,
            isDisabled: function () {
                return this.disabled
            },
            getHoverTarget: function (_1, _2) {
                this.parentElement.fireEvent("mouseOver");
                return this.Super("getHoverTarget", arguments);
            }
        });

        // 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
        this.addChild(this.ink);
        if (!this.Enabled) {
            this.setDisabled(!this.Enabled);
        }
    },
    setTips: function (tips) {
        this.ink.prompt = tips;
    },
    isDisabled: function () {
        return this.disabled;
    },
    setDisabled: function (enable) {
        if (enable || (this.parentWidget && this.parentWidget.isDisabled())) {
            this.ink.cssText = this.genFontCssText(this.FontStyle, this.ForeColor, false);
            this.ink.setStyleName(this.WidgetStyle + "isSelectedEventLinkDisabled")
        } else {
            this.ink.cssText = this.genFontCssText(this.FontStyle,
                this.ForeColor);
            this.ink.setStyleName(this.WidgetStyle + "isSelectedEventLink")
        }
        this.ink.redraw();
        this.ink.setDisabled(enable);
        this.disabled = enable;
    },
    isEnabled: function () {
        return this.Enabled
    },
    parentDisabled: function (enable) {
        if (enable || this.parentWidget.isDisabled()) {
            this.ink.cssText = this.genFontCssText(this.FontStyle, this.ForeColor, false);
            this.ink.setStyleName(this.WidgetStyle + "isSelectedEventLinkDisabled")
        } else {
            this.ink.cssText = this.genFontCssText(this.FontStyle, this.ForeColor);
            this.ink.setStyleName(this.WidgetStyle + "isSelectedEventLink")
        }
        this.ink.redraw();
        this.ink.setEnabled(enable)
    },
    setEnabled: function (enable) {
        if (!enable || this.parentWidget.isDisabled()) {
            this.ink.cssText = this.genFontCssText(this.FontStyle, this.ForeColor, false);
            this.ink.setStyleName(this.WidgetStyle + "isSelectedEventLinkDisabled")
        } else {
            this.ink.cssText = this.genFontCssText(this.FontStyle, this.ForeColor);
            this.ink.setStyleName(this.WidgetStyle + "isSelectedEventLink")
        }
        this.ink.redraw();
        this.ink.setEnabled(enable)
    },

    setSimpleChineseTitle: function (title) {
        this.ink.setContents(title);
        this.SimpleChineseTitle = title;
    },

    getSimpleChineseTitle: function () {
        return this.SimpleChineseTitle;
    },

    /**
     * 获取背景色
     * @return 背景色
     */
    getBackColor: function () {
        return this.BackColor;
    },

    /**
     * 设置背景色
     * @param color 背景色
     */
    setBackColor: function (color) {
        color = this.parseColor(color);
        this.BackColor = color;
        var newCssText = this.cssTextExtend(this.ink.cssText, {
            "background": color
        });
        this.ink.cssText = newCssText;
        this.ink.setBackgroundColor(color);
    },
    /**
     * 获取前景色
     * @return 前景色
     */
    getForeColor: function () {
        return this.ForeColor;
    },
    /**
     * 设置前景色
     * @param color 前景色
     */
    setForeColor: function (color) {
        color = this.parseColor(color);
        this.ForeColor = color;
        //原生没有接口的，用cssText属性设置
        var newCssText = this.cssTextExtend(this.ink.cssText, {
            "color": color
        });
        this.ink.cssText = newCssText;
        this.ink.markForRedraw();
    },
    /**
     * 设置字体
     */
    setFontStyle: function (fontStyle) {
        fontStyle = this.parseFontStyle(fontStyle);
        this.FontStyle = fontStyle;
        var newCssText = this.cssTextExtend(this.ink.cssText, fontStyle, true);
        this.ink.cssText = newCssText;
        this.ink.markForRedraw();
    },

    /**
     * 设置 完整URL
     * @param content 链接文本
     * @param url 链接url
     * @param parameters 链接parameters
     * @param target 链接target
     */
    //		    setNavigator: function (content, url, parameters, target) {
    //		        var paraUrl = '';
    //
    //		        if (parameters != null) {
    //		            paraUrl = '?';
    //		            for (var name in parameters) {
    //		                paraUrl += name + "=" + parameters[name] + '&';
    //		            }
    //
    //		            if (paraUrl.lastIndexOf('&') >= 0) {
    //		                paraUrl = paraUrl.substring(0, paraUrl.length - 1);
    //		            }
    //		        }
    //
    //		        url = url + paraUrl;
    //
    //		        return "<span  class='isSelectedEventLink'>" + content + "</span>";
    //		    },

    getWebURL: function () {
        return this.WebURL;
    },

    changeUrl: function (url) {
        this.WebURL = url;
    },

    //放在容器中按布局排版时设置比例
    setPercentWidth: function (percentWidth) {
        this.Super("setPercentWidth", arguments);
        //this.ink.setWidth(percentWidth);
        this.ink.setWidth("100%");
    },
    setPercentHeight: function (percentHeight) {
        this.Super("setPercentHeight", arguments);
        //this.ink.setHeight(percentHeight);
        this.ink.setHeight("100%");
    },

    //设置控件的index要以组件的index为前缀
    setIndexPreJoinComponentIndex: function (componentIndex) {
        var orginalIndex = this.ink.getTabIndex();
        this.ink.setTabIndex(parseInt(componentIndex + orginalIndex));
    },

    destroy: function () {
        //var ink = this.ink;
        //if(ink){
        this.ink = null;
        //ink.destroy();
        //}
        this.Super("destroy", arguments);
    },
    parentReadOnly: function (disabled) {
        this.setDisabled(disabled);
    }

});
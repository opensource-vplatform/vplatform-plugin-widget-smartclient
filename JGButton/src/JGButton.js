/**
 * V平台按钮控件
 * @class JGButton
 * @mixes JGStyleHelper
 * @extends JGBaseWidget
 * @example
 * var btn = isc.JGButton.create({
 *  SimpleChineseTitle : "test",
 *  Top : 50,
 *  Left : 50,
 *  Height : 50,
 *  Width : 150
 * });
 * btn.on("OnClick",function(){
 *  alert("clicked!");
 * });
 */
isc.ClassFactory.defineClass("JGButton", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGButton", "JGStyleHelper");

isc.JGButton.addProperties({
    _button: null,
    widgetId:"JGButton1",
    /**
     * 提醒文字
     * @memberof JGButton
     * @property {String}
     * @instance
     */
    RemindText: "",
    ToolTip:"",
    Placeholder:"",
    /**
     * 左边距
     * @memberof JGButton
     * @property {Number}
     * @instance
     */
     Left: 10,
     HorizontalAlign: "Left",
     FontStyleFamily: "",
     type: "JGButton",
     FontStyleBold: "",
     ColSpan: "1",
     TabIndex: 28,
     FontStyleSize: "",
     WidgetStyle: "JGButton",
     PercentHeight: "1.6%",
    /**
     * 是否显示
     * @memberof JGButton
     * @property {Boolean}
     * @instance
     */
    Visible: true,
    /**
     * 控件主题风格
     * @memberof JGButton
     * @property {Boolean}
     * @instance
     */
    Theme: "defaultType",
    /**
     * 高度
     * @memberof JGButton
     * @property {Number}
     * @instance
     */
     Height: 20,
     AutoTest: true,
    /**
     * 宽度
     * @memberof JGButton
     * @property {Number}
     * @instance
     */
     Width: 48,
     StaticLayoutSize: true,
     VerticalAlign: "Top",
     FontStyleItalic: "",
     EndRow: "False",
     ImageObj: null,
    /**
     * 背景色
     * @memberof JGButton
     * @property {String}
     * @instance
     */
     BackColor: null,
    /**
     * 使能
     * @memberof JGButton
     * @property {Boolean}
     * @instance
     */
     Enabled: true,
    /**
     * 标题
     * @memberof JGButton
     * @property {String}
     * @instance
     */
     SimpleChineseTitle: '',
     Code:"JGButton1",
     MultiHeight: "26px",
     PlaceholderPosition: "Right",
     StartRow: "False",
    /**
     * 泊靠
     * @memberof JGButton
     * @property {String}
     * @instance
     */
     Dock:"None",
    /**
     * 上边距
     * @memberof JGButton
     * @property {Number}
     * @instance
     */
     Top: 10,
     FontStyleDecoration: "",
     MultiWidth: "59px",
     PercentWidth: "3.2%",
    /**
     * 前景色
     * @memberof JGButton
     * @property {String}
     * @instance
     */
     ForeColor: null,
    /**
     * 名称
     * @memberof JGButton
     * @property {String}
     * @instance
     */
    Name: '',
    ImageValue: null,
    listener: ['OnClick'], //提供的事件列表
    className: "JGButtonNormal",
    _buttonDisableCustom: false, //通过规则控制的使能情况，用于区分是否属于规则设置不可用
    
});

isc.JGButton.addMethods({
    //自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
    _initWidget: function () {
        if (this.Theme && this.Theme != "customType" && !this.isOldWindowLayoutConfig()) { //旧窗体中按钮会设置前景色和背景色
            //如果配置了主题，而且不是自定义清空前景背景色
            this.ForeColor = "";
            this.BackColor = "";
        }

        if (this.Theme && this.Theme != "customType" && this.Theme != "defaultType") {
            this.WidgetStyle = this.Theme + " " + this.WidgetStyle
        }
        var _self = this;
        this.disabled = !this.Enabled;
        this._button = isc.Button.create({
            autoDraw: false,
            id: this.id,
            name: this.Name,
            overflow: "visible",
            title: this.genTitleContent(this.SimpleChineseTitle),
            width: this.Width,
            height: this.Height,
            disabled: !this.Enabled,
            tabIndex: this.TabIndex,
            // backgroundImage: this.ImageObj,
            backgroundColor: this.BackColor,
            cssText: this.genFontCssText(this.FontStyle, this.ForeColor) + "background-color:" + this.BackColor + ";" +
                "border-color:" + this.BackColor + "!important;",
            border: "0px solid",
            icon: this.getStaticImagePath(this.ImageObj),
            iconWidth: this.Height / 2,
            iconHeight: this.Height / 2,
            remindText: this.RemindText,
            showIconState: false, //防止图片修改状态
            canHover: true,
            wrap: true,
            //防止事件执行过久而导致用户继续触发,功能与_referEvent相同
            click: this._referTimerEventHandler(this, 'OnClick'),
            baseStyle: this.WidgetStyle,
            getInnerHTML: function (_1) {
                var backHtml = this.Super("getInnerHTML", arguments);
                backHtml = backHtml.replace("max-width:100%", "width:100%");
                //处理按钮下划线不显示
                backHtml = backHtml.replace("overflow:hidden;text-overflow:ellipsis", "display:inline;");
                // 处理按钮居中
                backHtml = backHtml.replace("display:inline-block;", "display:block;overflow:hidden;text-overflow:ellipsis;");

                //处理按钮不垂直居中
                backHtml = backHtml.replace("vertical-align:middle;", "");

                return backHtml;
            },
            //按钮提示数值样式
            getTitleHTML: function () {
                return _self.getModTitleHTML();
            },
            stateChanged: function () {
                //默认情况下stateChanged已经不需要更改控件状态了，因为控件可以通过redraw刷新状态
                //有一种特殊情况需要用到，就是触发事件后，控件禁用，这个时候redraw无效。
                this.Super("stateChanged");
                var _tcell = this.getTitleCell();
                if (_tcell && _tcell.style) {

                    //如果用户配置了自定义文字颜色,当按钮为禁用的时候,文字的颜色设置为灰色
                    //_tcell.style.cssText += this.cssText?this.cssText:'';
                    if (this.isDisabled()) {
                        var tempCssText = _tcell.style.cssText;
                        tempCssText = isc.JGStyleTools.removeBackgroundColor(tempCssText);
                        tempCssText = isc.JGStyleTools.removeColor(tempCssText);
                        _tcell.style.cssText = tempCssText;

                    } //禁用之后，设置的背景色和前景色无效

                }
            },
            redraw: function () {

                if (this.disabled) {
                    var _cssTextSaved = this.cssText;
                    this.cssText = isc.JGStyleTools.removeBackgroundColor(this.cssText);
                    this.cssText = isc.JGStyleTools.removeColor(this.cssText);
                    this.Super("redraw", arguments);
                    this.cssText = _cssTextSaved;

                } else {
                    this.Super("redraw", arguments);
                }

                //redraw之后，需要重新获取下对象
                if (_self.hasRemindText()) {
                    _self.remindTextDomObj = isc.Element.get(_self.remindTextDomID);
                }
            },
            isDisabled: function () {
                return this.disabled
            },
            getHoverTarget: function (_1, _2) {
                this.parentElement.fireEvent("mouseOver");
                return this.Super("getHoverTarget", arguments);
            }
        });

        // 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
        this.addChild(this._button);
    },

    addButtonClass: function (className) {
        if (!className || !this._button) {
            return;
        }
        var button = this._button;
        if (button.baseStyle) {
            var styleArr = button.baseStyle.split(" ");
            if (styleArr.indexOf(className) == -1) {
                styleArr.splice(0, 0, className);
                button.baseStyle = styleArr.join(" ");
                button.redraw();
            }
        } else {
            button.baseStyle = className;
            button.redraw();
        }
    },
    removeButtonClass: function (className) {
        if (!className) {
            return;
        }
        var button = this._button;
        if (button && button.baseStyle) {
            var styleArr = button.baseStyle.split(" ");
            if (styleArr.indexOf(className) != -1) {
                styleArr.splice(styleArr.indexOf(className), 1);
                button.baseStyle = styleArr.join(" ");
                button.redraw();
            }
        }
    },
    setTips: function (tips) {
        this._button.prompt = tips;
    },
    //暂停使用_referTimerEventHandler
    pause: function () {
        this._button.setState(isc.StatefulCanvas.STATE_UP);
        this.setRemindTextDisabled(true);
        //放到平台事件前事件处理
        //		        this._button.setDisabled(true);

        //this._button.redraw();
    },
    //继续使用_referTimerEventHandler
    resume: function () {
        if (!this._disabled) {
            //放到平台事件后事件处理
            //		            this._button.setDisabled(false);
            this.setRemindTextDisabled(false);
            this._button.redraw();
        }
    },
    /**
     * 引用控件函数,将被包含控件的方法暴露给JGButton
     */
    _referPartFunc: function () {
        this.Super("_referPartFunc", arguments);
        /**
         * 将Button的方法暴露给JGButton
         */
        this._referFuncs(this._button, ['setTitle', 'getTitle', 'setBackgroundImage', 'setBackgroundColor']);
    },
    /**
     * 设置标题
     * @method
     * @memberof JGButton
     * @instance
     * @param {String} title 控件标题
     */
    setLabelText : function(title){
        this.setSimpleChineseTitle(title);
    },
    /**
     * 获取标题
     * @method
     * @memberof JGButton
     * @instance
     * @returns {String} 按钮标题
     */
    getLabelText : function(){
        return this.getSimpleChineseTitle();
    },
    /**
     * 获取使能状态
     * @method
     * @memberof JGButton
     * @instance
     * @returns {Boolean} 使能状态
     */
    isEnabled: function () {
        return this.Enabled;
    },
    /**
     * 设置控件使能
     * @method
     * @memberof JGButton
     * @instance
     * @param {Boolean} state 使能状态
     */
    setEnabled : function(state){
        this.markDisableByRule(!state);
        this.Super("setEnabled",arguments);
    },
    /**
     * 获取控件使能状态
     * @method
     * @memberof JGButton
     * @instance
     * @returns {Boolean} 使能状态
     */
    getEnabled : function(){
        return !this.isDisabled();
    },

    /**
     * 获取控件显示状态
     * @method
     * @memberof JGButton
     * @instance
     * @returns {Boolean} 显示状态
     */
    getVisible : function(){
        return this.isVisible();
    },
    /**
     * 设置使能状态
     * @param enable 使能
     */
    setHandleDisabled: function (disabled) {
        //this.setSimpleChineseTitle(this.SimpleChineseTitle);//提醒文字更新样式
        if (this._button) {
            if (!disabled) {
                this._button.enable();
            } else {
                this._button.disable();
            }
            this._button.redraw();
        }
    },

    /**
     * 获取按钮背景色
     * @return 按钮背景色
     */
    getBackColor: function () {
        //this._button.getBackgroundColor();
        return this.BackColor;
    },

    /**
     * 设置按钮背景色
     * @method
     * @memberof JGButton
     * @instance
     * @param {String} 背景色
     */
    setBackColor: function (color) {
        color = this.parseColor(color);
        this.BackColor = color;
        var newCssText = this.cssTextExtend(this._button.cssText, {
            "background-color": color
        });
        this._button.cssText = newCssText;
        this._button._cssText = newCssText;
        //this._button.setBackgroundColor(color);
        this._button.redraw();
    },
    /**
     * 获取按钮前景色
     * @return 按钮前景色
     */
    getForeColor: function () {
        return this.ForeColor;
    },
    /**
     * 设置按钮前景色
     * @method
     * @memberof JGButton
     * @instance
     * @param color 按钮前景色
     */
    setForeColor: function (color) {
        color = this.parseColor(color);
        this.ForeColor = color;
        //原生没有接口的，用cssText属性设置后重画
        var newCssText = this.cssTextExtend(this._button.cssText, {
            "color": color
        });
        this._button.cssText = newCssText;
        this._button._cssText = newCssText;
        this._button.redraw();

    },
    /**
     * 设置按钮字体样式
     * @method
     * @memberof JGButton
     * @instance
     * @param {String} fontStyle 字体样式
     */
    setFontStyle: function (fontStyle) {
        fontStyle = this.parseFontStyle(fontStyle);
        this.FontStyle = fontStyle;
        var newCssText = this.cssTextExtend(this._button.cssText, fontStyle, true);
        this._button.cssText = newCssText;
        this._button._cssText = newCssText;
        this._button.redraw();
    },
    /**
     * 获取中文标题
     * @return 中文标题
     */
    getSimpleChineseTitle: function () {
        return this.SimpleChineseTitle;
    },
    /**
     * 设置中文标题
     * @param title 中文标题
     */
    setSimpleChineseTitle: function (title) {
        this.SimpleChineseTitle = title;
        this._button.setTitle(this.SimpleChineseTitle);
    },

    //放在容器中按布局排版时设置比例
    setPercentWidth: function (percentWidth) {
        this.Super("setPercentWidth", arguments); // 在流布局控件中按钮宽度不正确，相差1px 待处理
        //this._button.setWidth(percentWidth);
        this._button.setWidth('100%');
    },
    setPercentHeight: function (percentHeight) {
        this.Super("setPercentHeight", arguments); // 在流布局控件中按钮高度不正确，相差1px 待处理
        //this._button.setHeight(percentHeight);
        this._button.setHeight('100%');
    },
    //触发事件后，恢复按钮不选择状态
    setState: function (_state) {
        this._button.setState(_state);
    },
    //设置控件的index要以组件的index为前缀
    setIndexPreJoinComponentIndex: function (componentIndex) {
        var orginalIndex = this._button.getTabIndex();
        this._button.setTabIndex(parseInt(componentIndex + orginalIndex));
    },
    destroy: function () {
        //var button = this._button;
        //if(button){
        this._button = null;
        //	button.destroy();
        //}
        this.Super("destroy", arguments);
    },
    /**
     * 设置提醒文字
     * @method
     * @memberof JGButton
     * @instance
     * @param {String} RemindText 使能
     */
    setRemindText: function (remindText) {
        this.RemindText = remindText;
        this._button.remindText = remindText;
        this._button.setTitle(this.SimpleChineseTitle);
    },
    getRemindText: function (RemindText) {
        return this.RemindText;
    },
    hasRemindText: function () {
        return !isc.isAn.emptyString("" + this.RemindText);
    },
    enabledRemindText: function () {

    },
    RemindText_PartName: "RemindText_PartName",
    remindTextDomID: null,
    remindTextDomObj: null,
    getModTitleHTML: function () {
        var remindTextNum = "";
        var remindTextSty;
        if (this.hasRemindText()) {
            remindTextNum = "[" + this.RemindText + "]";
        } else {
            return "<nobr>" + this.SimpleChineseTitle + "</nobr>";
        }
        if (this._button.disabled) { //通过使能修改样式
            remindTextSty = this.WidgetStyle + "RemindDisabled";
        } else {
            remindTextSty = this.WidgetStyle + "Remind";
        }

        if (!this.remindTextDomID) {
            this.remindTextDomID = isc.ClassFactory.getDOMID(this.getID(), this.RemindText_PartName);
        }


        var title = "<nobr>" + this.SimpleChineseTitle + "<span id='" + this.remindTextDomID + "' class='" + remindTextSty + "'>" + remindTextNum + "</span></nobr>";
        return title;
    },

    setRemindTextDisabled: function (disabled) {

        if (this.hasRemindText()) {
            if (!this.remindTextDomObj) {
                this.remindTextDomObj = isc.Element.get(this.remindTextDomID);
            }
            if (this.remindTextDomObj) {
                if (disabled) {
                    this.remindTextDomObj.className = this.WidgetStyle + "RemindDisabled";
                } else {
                    this.remindTextDomObj.className = this.WidgetStyle + "Remind";
                }
            }
        }

    },
    parentReadOnly: function (readOnly) {
        this.setReadOnly(readOnly);
    },
    setReadOnly: function (readOnly) {
        this.ReadOnly = readOnly;
        if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) {
            //旧版ui按钮设置只读后，按钮禁用
            this.setHandleDisabled(readOnly);
        } else {
            //新版ui按钮设置只读后，按钮隐藏
            this.setVisible(!readOnly);
        }
    },
    /**
     * 标记按钮由规则设置是否禁用
     * @param	{Boolean}	state	true为规则设置禁用，false为规则设置不禁用
     * */
    markDisableByRule: function (state) {
        this._buttonDisableCustom = state;
    },
    firePlatformEventBefore: function (eventName) {
        if (eventName == "OnClick") {
            if (this._button)
                this._button.setDisabled(true);
            this.addButtonClass("V3ButtonActive");
        }
    },
    firePlatformEventAfter: function (eventName) {
        if (eventName == "OnClick") {
            if (this._button && !this._buttonDisableCustom) //并且规则没设置禁用
                this._button.setDisabled(false);
            this.removeButtonClass("V3ButtonActive");
        }
    }
});
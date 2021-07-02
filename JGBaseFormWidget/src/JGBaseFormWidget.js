/**
 * 表单类控件基类
 * @class JGBaseFormWidget
 * @mixes IRecordObserver
 * @extends JGFormWidget
 */
isc.ClassFactory.defineClass("JGBaseFormWidget", "JGFormWidget");
isc.ClassFactory.mixInInterface("JGBaseWidget", "IRecordObserver");

isc.JGBaseFormWidget.addProperties({
    //锚定布局
    isPositionForm: true,
    /**
     * 实例
     */
    form: null,

    /**
     * 表单封装类，以前为DynamicForm
     */
    formConstructor: isc.FormItemView,
    /**
     * 表单封装类的默认属性
     */
    formDefaults: {
        cellPadding: 0,
        width: 222,
        height: 24,
        //itemLayout: "absolute",
        writeFormTag: false,
        errorOrientation: "right",

    },
    titlePrefix: '<div class="formLabel">',
    titleLinkPrefix: '<div class = "formLabel s-linked">',
    //处理必填样式
    titleSuffix: '</div>',
    //处理必填样式
    requiredTitlePrefix: '<div class="formLabel">',
    requiredTitleLinkPrefix: '<div class="formLabel s-linked">',
    //处理必填样式
    requiredTitleSuffix: '</div>',
    className: "JGBaseFormWidget",
    positionStyleName: "absoluteFormLayout",
    requiredStyleName: "absoluteRequiredForm"
});

isc.JGBaseFormWidget.addMethods({

    /**
     * 控件初始化
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @param {Object} properties 属性信息
     */
    init: function (properties) {
        this._initProperties(properties);
        if (this.IsMustBehavior == "Striking") {
            this.items[0].required = this.IsMust;
        }
        this.id = isc.WidgetUtils.genWidgetRefId(this.scopeId, this.widgetId);
        this.styleName = this.className + " " + this.positionStyleName;
        if (this.IsMust) {
            this.styleName += " " + this.requiredStyleName;
        }
        this.canEdit = !this.ReadOnly;
        this.autoDraw = false;
        this.left = this.Left;
        this.top = this.Top;
        //统一处理显示隐藏的问题
        if (isc.isA.Boolean(this.Visible)) {
            this.visibility = this.Visible ? isc.Canvas.INHERIT : isc.Canvas.HIDDEN;
        }
        this.width = this.Width;
        this.height = this.Height;
        this.writeFormTag = false;
        if (!this.items[0].hint) {
            this.items[0].hint = this.items[0].Placeholder;
        }
        this.items[0].showHintInField = true;

        //添加hidden的id，防止数据同步时一直是新增记录
        //		        this.items.push({
        //		        	type:"hidden",
        //		        	name: 'id',
        //					visible:false//解决某些场景下死循环引发页面卡死
        //		        })
        isc.JGWidgetManager.putWidget(this.id, this);
        this.Super("init", arguments);
        this.getTitleHTML = function (_1, _2, _3) {
            _1.titleHasLink = _1.OnLabelClick && _1.OnLabelClick != "" ? true : false;

            this.titleSuffix = '';
            this.requiredTitleSuffix = '&nbsp;<span class="required">*</span>';
            var _4 = isc.StringBuffer.create();
            var _5 = _1.visible ? _1.getTitleHTML() : null;
            if (_5) {
                var _$5 = $(_5);
                var nowStyle = {};
                var labelFont = this.getLabelFontStyle && this.getLabelFontStyle();
                if (labelFont) {
                    try {
                        var _font = JSON.parse(labelFont);
                        if (_font) {
                            nowStyle = _font;
                        }
                    } catch (e) {}
                }
                //下拉、单/多选控件
                var labelForeColor = this.getLabelForeColor && this.getLabelForeColor();
                if (labelForeColor) {
                    nowStyle["color"] = isc.JGStyleTools.toColor(labelForeColor);
                }
                var labelBackColor = this.getLabelBackColor && this.getLabelBackColor();
                if (labelBackColor) {
                    nowStyle["background-color"] = isc.JGStyleTools.toColor(labelBackColor);
                }
                nowStyle["text-align"] = this.LabelTextAlign;
                if (_1.isSingleLabel && _1.isSingleLabel()) { //单标签添加偏移调整样式，否则标签内容显示不全或者位置偏移，相关数值可以根据实际场景调整
                    var sStyle = _1.getSingleLabelStyle();
                    if (sStyle) {
                        for (var key in sStyle) {
                            if (sStyle.hasOwnProperty(key))
                                nowStyle[key] = sStyle[key];
                        }
                    }
                }
                _$5.css(nowStyle);
                _5 = _$5[0].outerHTML;
                var _6 = this.isRequired(_1, true),
                    _7 = this.getTitleOrientation(_1),
                    _8 = (_7 == isc.Canvas.LEFT || _7 == isc.Canvas.TOP);
                if (_3) {
                    var _9 = this.$114z;
                    var _10, _11;
                    if (_6 && this.hiliteRequiredFields) {
                        if (_1.title == "") {
                            this.requiredTitleSuffix = '<span class="required">*</span>';
                        }
                        _10 = _8 ? this.requiredTitlePrefix : this.requiredRightTitlePrefix;
                        _11 = _8 ? this.requiredTitleSuffix : this.requiredRightTitleSuffix;

                    } else {
                        if (_1.title == "") {
                            this.titlePrefix = "";
                            this.rightTitlePrefix = "";
                            this.titleSuffix = "";
                            this.rightTitleSuffix = "";
                            this.titleLinkPrefix = "";
                        }
                        _10 = _8 ? this.titlePrefix : this.rightTitlePrefix;
                        _11 = _8 ? this.titleSuffix : this.rightTitleSuffix;

                    }

                    var _12 = this.$207z(_10, _11);
                    _9[1] = _12[0];
                    _9[2] = _11;
                    _9[4] = this.$1140(_1);
                    _9[10] = _10;
                    _9[11] = _5;
                    _9[12] = _12[1];
                    _4.append.apply(_4, _9)
                } else {
                    if (_1.title == "") {
                        this.titlePrefix = "";
                        this.rightTitlePrefix = "";
                        this.titleSuffix = "";
                        this.rightTitleSuffix = "";
                        this.titleLinkPrefix = "";
                        this.requiredTitleSuffix = '<span class="required">*</span>';
                    }
                    _4.append((_6 && this.hiliteRequiredFields ? (_8 ? this.requiredTitlePrefix : this.requiredRightTitlePrefix) : (_8 ? this.titlePrefix : this.rightTitlePrefix)), _6 && this.hiliteRequiredFields ? (_8 ? this.requiredTitleSuffix : this.requiredRightTitleSuffix) : (_8 ? this.titleSuffix : this.rightTitleSuffix), _5)
                }
            } else {
                _4.append("&nbsp;")
            }
            return _4.release(false)
        };
        this._afterInit();
    },

    _afterInit : function(){

    },
    /**
     * 显示验证错误信息
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     */
    showError: function () {
        if (this.IsMustBehavior != "Striking") {
            return;
        }
        var item = this.items[0];
        var msg = item.getError(); //判断是否有错误信息
        if (msg) {
            var eErrorCanvas = item.eErrorCanvas;
            var _left = this.TitleWidth + this.getPageLeft();
            var _top = this.getPageTop() + item.height + 10;
            if (this.getPageTop() > 38 || document.documentElement.clientHeight < _top) {
                _top = this.getPageTop() - 38;
            }
            var _pe = this.getParentElements();
            var _parentPe = _pe[_pe.length - 1];

            _top = _top - _parentPe.getPageTop()
            _left = _left - _parentPe.getPageLeft()
            if (_top < 0) {
                _top = 38;
            }
            if (!eErrorCanvas) {
                var tipWidth = this.getDefaultMustTipWidth ? this.getDefaultMustTipWidth() : 122;
                eErrorCanvas = item.eErrorCanvas = isc.Canvas.create({
                    width: tipWidth, // 110 太短了
                    height: 34,
                    left: _left,
                    top: _top
                })
                var _nTop = this.getPageTop() - 38;
                if (_top == _nTop || _top == _nTop - _parentPe.getPageTop()) {
                    eErrorCanvas.contents = '<div class="tips"><div class="ico-tips-top"></div><span class="iconfont icon-warn JGFormErrorIcon"></span>此项为必填项</div>';
                } else {
                    eErrorCanvas.contents = '<div class="tips"><div class="ico-tips-bottom"></div><span class="iconfont icon-warn JGFormErrorIcon"></span>此项为必填项</div>';
                }

                var _pe = this.getParentElements();
                _pe[_pe.length - 1].addChild(eErrorCanvas);
                item.eErrorCanvas.tmrID = isc.Timer.setTimeout(function () {
                    eErrorCanvas.moveTo(-100, -100)
                }, 3000); //设置时间监听器
                eErrorCanvas.bringToFront();
                eErrorCanvas.show();
            } else {
                //删除时间监听器
                if (eErrorCanvas.tmrID) {
                    eErrorCanvas.tmrID = isc.Timer.clear(eErrorCanvas.tmrID);
                    eErrorCanvas.tmrID = null;
                }
                eErrorCanvas.moveTo(_left, _top);
            }
        }
    },
    /**
     * 隐藏验证错误信息
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     */
    hideError: function () {
        if (this.IsMustBehavior != "Striking") {
            return;
        }
        var item = this.items[0];
        if (item.getError() && item.eErrorCanvas == null) {
            this.showError.apply(this, arguments);
        } else {
            var eErrorCanvas = item.eErrorCanvas
            if (eErrorCanvas)
                eErrorCanvas.moveTo(-100, -100);
        }
    },
    useFormat: function () {
        if (this.DisplayFormat && this.DisplayFormat.displayFormat) {
            this.items.last().formatEditorValue = this.fireEvent(this, 'formatDisplayValue');
        }
    },
    /**
     * 获取必填的默认浮动提示宽度
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @returns {Number} 浮动提示宽度
     */
    getDefaultMustTipWidth: function () {
        return 122;
    },
    //		    setReadOnly : function(readonly){
    //		    	this.ReadOnly = this.items[0].ReadOnly = readonly;
    //		    	readonly = readonly || !this.items[0].Enabled;
    //		    	this.items[0].setCanEdit(!readonly);
    //		    },
    /**
     * 设置控件使能
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @param {Boolean} enabled 使能
     */
    setEnabled: function (enabled) {
        this.Enabled = this.items[0].Enabled = enabled;
        this.setDisabled(!enabled);
    },
    /**
     * 设置表单项使能
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @param {Boolean} enabled 使能
     */
    setItemEnabled: function (enabled) {
        this.Enabled = this.items[0].Enabled = enabled;
        this.items[0].setDisabled(!enabled)
    },

    /**
     * 设置表单项只读
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @param {Boolean} readonly 只读
     */
    setItemReadOnly: function (readonly) {
        if (this.canEditReadOnly === false) { //如果窗体只读，则不能修改
            return;
        }
        this.ReadOnly = this.items[0].ReadOnly = readonly;
        this.canEdit = !readonly;
        this.items[0].setCanEdit(!readonly)
    },
    /**
     * 设置控件控件显示隐藏
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @param {Boolean} visible 状态
     */
    setVisible: function (visible) {
        this.Visible = this.items[0].Visible = visible;
        if (visible) {
            this.show();
            this.items[0].show();
        } else {
            this.hide();
            this.items[0].hide();
        }
    },
    /**
     * 获取控件使能状态
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @returns {Boolean} 使能状态
     */
    getEnabled: function () {
        return this.Enabled;
    },

    /**
     * 获取控件显示状态
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @returns {Boolean} 显示状态
     */
    getVisible: function () {
        return this.Visible;
    },
    toFontStyle: function (fontStyle, type) {
        if (fontStyle.toString() == "")
            return "";
        try {
            fontStyle = JSON.parse(fontStyle);
            if (fontStyle["Size"] != "")
                this[type + "FontStyleSize"] = this.items[0][type + "FontStyleSize"] = parseInt(fontStyle["Size"]) + "px";
            if (fontStyle["Family"].toString() != "")
                this[type + "FontStyleFamily"] = this.items[0][type + "FontStyleFamily"] = fontStyle["Family"].toString();
            var textDecoration = "";
            if (fontStyle["Underline"].toString().toLocaleLowerCase() == "true")
                textDecoration += "underline";
            if (fontStyle["Strikeout"].toString().toLocaleLowerCase() == "true")
                textDecoration += " line-through";
            if (textDecoration != "")
                this[type + "FontStyleDecoration"] = this.items[0][type + "FontStyleDecoration"] = textDecoration;
            else
                this[type + "FontStyleDecoration"] = this.items[0][type + "FontStyleDecoration"] = "none";
            if (fontStyle["Bold"].toString().toLocaleLowerCase() == "true")
                this[type + "FontStyleBold"] = this.items[0][type + "FontStyleBold"] = "bold";
            else
                this[type + "FontStyleBold"] = this.items[0][type + "FontStyleBold"] = "normal ";
            if (fontStyle["Italic"].toString().toLocaleLowerCase() == "true")
                this[type + "FontStyleItalic"] = this.items[0][type + "FontStyleItalic"] = "italic";
            else
                this[type + "FontStyleItalic"] = this.items[0][type + "FontStyleItalic"] = "normal"
        } catch (e) {}
    },
    getLabelFontStyle: function () {
        return this.LabelFontStyle;
    },
    getLabelForeColor: function () {
        return this.LabelForeColor;
    },
    getLabelBackColor: function () {
        return this.LabelBackColor;
    },
    getValueFontStyle: function () {
        return this.ValueFontStyle;
    },
    setValueFontStyle: function (fontStyle) {
        this.ValueFontStyle = JSON.stringify(isc.JGStyleTools.toFontStyle(fontStyle));
        var style = this.toFontStyle(fontStyle, "Value");
        this.items[0].initStyle();
        if (style !== "") {
            this.redraw()
        }
    },
    setValueForeColor: function (color) {
        this.ValueForeColor = this.items[0].ValueForeColor = isc.JGStyleTools.toColor(color);
        this.items[0].initStyle();
        this.redraw()
    },
    setValueBackColor: function (color) {
        this.ValueBackColor = this.items[0].ValueBackColor = isc.JGStyleTools.toColor(color);
        this.items[0].initStyle();
        this.redraw()
    },
    setLabelFontStyle: function (fontStyle) {
        this.LabelFontStyle = JSON.stringify(isc.JGStyleTools.toFontStyle(fontStyle));
        var style = this.toFontStyle(fontStyle, "Label");
        if (style !== "" && this.items[0].showTitle) {
            this.redraw()
        }
    },
    setLabelForeColor: function (color) {
        this.LabelForeColor = color;
        this.items[0].LabelForeColor = isc.JGStyleTools.toColor(color);
        if (this.items[0].showTitle) {
            this.redraw()
        }
    },
    setLabelBackColor: function (color) {
        this.LabelBackColor = color;
        this.items[0].LabelBackColor = isc.JGStyleTools.toColor(color);
        if (this.items[0].showTitle) {
            this.redraw()
        }
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
        if (this.items[0].showTitle) {
            this.items[0].title = title;
            this.redraw();
        }
    },
    //放在容器中按布局排版时缩放
    resized: function (deltaX, deltaY) {
        this.Super("resized", arguments);
        if (this.Dock != "None" && this.isDrawn()) {
            // 处理泊靠后控件高度自适应
            if (this.Dock === "Left" || this.Dock === "Right" || this.Dock === "Fill") {
                this.setHeight("100%");
                this.getItems()[0].setHeight("100%");
            }
            if (this.Dock == "Top" || this.Dock == "Bottom" || this.Dock == "Fill") {
                this.setWidth("100%");
            }
        }
    },



    /**
     * 覆盖目标类的的方法
     */
    _addMethods: function (des, source) {
        for (var func in source) {
            des[func] = source[func];
        }
    },

    /**
     *触发控件事件 
     * @param target 事件目标，即事件的宿主
     * @param eventName 事件名称
     * @param ...Object 事件参数
     */
    fireEvent: function (eventName) {
        var eventHandler = this.listener[eventName];
        if (eventHandler && eventHandler.length > 0) {
            var param = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            for (var j = 0, l = eventHandler.length; j < l; j++) {
                var handler = eventHandler[j];
                handler.apply(this, param);
            }
        }
    },

    /**
     * 获取控件定义Id，提供给框架调用
     */
    getId: function () {
        return this.widgetId;
    },

    destroy: function () {
        this.mouseOver = null;
        this.listener = null;
        this._Layout = null;
        isc.JGWidgetManager.destroy(this.id);
        var childrenWidgets = this.childrenWidgets;
        if (childrenWidgets) {
            this.childrenWidgets = null;
        }
        this.Super("destroy", arguments);
    },

    /**
     * 获取控件属性
     * @param propertyName 属性名称
     */
    getProperty: function (propertyName) {
        var fun = this['get' + propertyName];
        if (typeof (fun) == 'function' || typeof (fun = this['is' + propertyName]) == 'function') {
            var param = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            return fun.apply(this, param);
        }
    },

    /**
     * 设置控件属性
     * @param propertyName 属性名称
     * @param propertyValue 属性值
     */
    setProperty: function (propertyName, propertyValue) {
        var fun = this['set' + propertyName];
        if (typeof (fun) == 'function') {
            var param = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            return fun.apply(this, param);
        } else {
            throw Error(this.getClassName() + "不存在[" + propertyName + "]属性!");
        }
    },

    /**
     * 获取使能状态
     * @returns {Boolean }使能状态
     */
    isEnabled: function () {
        return this.Enabled;
    },


    /**
     * 设置使能状态
     * @param enable 使能
     */
    setHandleReadOnly: function (newState) {
        if (this.setCanEdit) { //Task20210220002
            this.setCanEdit(!newState);
        }
        for (var i = 0, num = this.items.length; i < num; i++) {
            if (this.items[i].setReadonly) {
                this.items[i].setReadonly(newState);
            }
            this.items[i].setCanEdit(!newState);
            this.items[i].redraw();
        }
    },

    /**
     * 设置绑定数据源名称
     */
    setTableName: function (tableName) {
        this.TableName = tableName;
    },

    /**
     * 获取绑定数据源名称
     */
    getTableName: function () {
        return this.TableName
    },

    //布局属性get/set
    getDock: function () {
        return this.Dock;
    },
    setDock: function (dock) {
        this.Dock = dock;
    },
    getLayoutType: function () {
        return this.LayoutType;
    },
    setLayoutType: function (layoutType) {
        this.LayoutType = layoutType;
    },
    getPercentWidth: function () {
        return this.PercentWidth;
    },
    setPercentWidth: function (percentWidth) {
        this.setWidth(percentWidth);
    },
    getPercentHeight: function () {
        return this.PercentHeight;
    },
    setPercentHeight: function (percentHeight) {
        //Form类框高度不设置为可变
        //this.setHeight(percentHeight);
    },
    getStaticLayoutSize: function () {
        return this.StaticLayoutSize;
    },
    setStaticLayoutSize: function (staticLayoutSize) {
        this.StaticLayoutSize = staticLayoutSize;
    },

    addWidgets: function (parent, children) {
        if (!parent.childrenWidgets)
            parent.childrenWidgets = [];
        parent.childrenWidgets.add(children);

        children.parentWidget = parent;
    },

    //当父亲设置为只读时,儿子也设置为只读
    parentReadOnly: function (newState, canEditReadOnly) {
        this.canEditReadOnly = canEditReadOnly;
        if (this.setHandleReadOnly) {
            this._ReadOnly = newState;
            var readOnly = this.ReadOnly || newState;
            this.setHandleReadOnly(readOnly);
        }
        if (this.childrenWidgets)
            this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
    },
    //返回控件真实状态
    isReadOnly: function () {
        return this._ReadOnly || this.ReadOnly;
    },

    //通用的处理方法,真正的实现放在setHandleReadOnly
    setReadOnly: function (newState) {
        //验证参数是否为布尔类型，
        if (!isc.isA.Boolean(newState)) {
            return; //如果不是布尔类型的话
        }
        //如果当前状态与需要设置的状态一样，直接返回	
        if (this.isReadOnly() == newState) {
            return;
        }
        //下面是修改状态，不存在真实状态与设置状态是相同

        if (newState == true) { //如果参数为true时，即设置该控件为只读
            if (this.isReadOnly()) { //如果控件现在为只读时
                this.ReadOnly = newState; //设置ReadOnly属性并直接返回
                return;
            } else {
                if (this.setHandleReadOnly) { //设置该控件为只读状态
                    this.setHandleReadOnly(newState);
                }
                this._ReadOnly = newState; //设置该控件的真实状态

                if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                    //							this.childrenWidgets.map("parentReadOnly", newState);
                    this.mapping(this.childrenWidgets, "parentReadOnly", newState);
                }
                this.ReadOnly = newState; //设置该控件的状态
            }
        } else {
            if (this.isReadOnly()) { //如果控件现在为只读时
                if (this.parentWidget && this.parentWidget.isReadOnly() || this.canEditReadOnly == false) { //如果父亲状态为只读时
                    this.ReadOnly = newState; //设置该控件ReadOnly属性并直接返回
                    return;
                } else {
                    if (this.setHandleReadOnly) { //设置该控件为只读状态
                        this.setHandleReadOnly(newState);
                    }
                    this._ReadOnly = newState; //设置该控件的真实状态

                    if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                        //								this.childrenWidgets.map("parentReadOnly", newState);
                        this.mapping(this.childrenWidgets, "parentReadOnly", newState);
                    }
                    this.ReadOnly = newState; //设置该控件的状态
                }
            } else {
                return;
            }
        }
    },


    parentDisabled: function (newState) {
        if (this.disabled)
            return;
        this._disabled = newState;
        if (this.setHandleDisabled)
            this.setHandleDisabled(newState);
        if (this.childrenWidgets)
            //						this.childrenWidgets.map("parentDisabled",newState)
            this.mapping(this.childrenWidgets, "parentDisabled", newState);
    },
    isDisabled: function () {
        var target = this;
        while (target) {
            if (target._disabled || target.disabled) {
                return true;
            };
            target = target.parentElement;
            if (target && target.eventProxy) {
                target = target.eventProxy;
            }
        }
        return false;
    },
    //重写方法，打印预览时不要蓝色的背景色，（sc中不是绝对定位时，是默认有背景色的）
    getPrintTagStartAttributes: function (absPos) {
        if (absPos) {
            return " style='position:absolute;left:" + this.getLeft() + "px;top:" +
                this.getTop() + "px;width:" + this.getWidth() + "px;height:" +
                this.getHeight() + "px;' ";
            // If we have absolutely positioned children:
            // - we're going to have to be relatively positioned so the abs-pos children are
            //   rendered within us
            // - we're going to have to have explicit sizing so we take up the right amount of space
            //   in document flow.
            // Handle this by writing out width/height set as calculated scrollWidth/height.

        } else if (this.printChildrenAbsolutelyPositioned) {
            return " style='position:relative;width:" + this.getScrollWidth() +
                "px;height:" + this.getScrollHeight() + "px;' ";
        }

        return null;
    },

    /**
     * 控件打印预览
     */
    controlPrintPreview: function (controls) {
        //当页面有滚动条时，把它滚到0,0，因为弹出的打印窗体默认是在0,0上的
        if (isc.Page && (isc.Page.getScrollTop() > 0 || isc.Page.getScrollLeft() > 0)) {
            isc.Page.scrollTo(0, 0);
        }
        //isc.Canvas.showPrintPreview(controls,{"absPos":true});
        isc.Canvas.showPrintPreview(controls);
    },

    /**
     * 控件打印
     */
    controlPrint: function (controls) {
        //isc.Canvas.printComponents(controls,{"absPos":true});
        isc.Canvas.printComponents(controls);
    },

    /**
     * 获取焦点(支持光标跳转控制规则)
     */
    setControlFocus: function () {
        this.focus();
    },


    getFieldEvent: function () {
        return this._fieldEvent;
    },

    setScopeId: function (scopeId) {
        this.scopeId = scopeId
    },

    getScopeId: function () {
        return this.scopeId;
    },

    setComponentId: function (componentId) {
        this.componentId = componentId;
    },

    getComponentId: function () {
        if (this.componentId) {
            return this.componentId;
        } else if (this.scopeId) {
            var lastIndex = this.scopeId.lastIndexOf("_");
            var compId = this.scopeId.substring(lastIndex + 1, this.scopeId.length);
            this.componentId = compId;
            return compId;
        } else {
            return null;
        }
    },

    show: function () {
        if (this._needToBuildRelation === true) {
            this.buildRelation();
        }
        this.Super("show", arguments);
    },

    getCanvasWidget: function () {

    },
    /**
     *构建父子关系 
     */
    buildRelation: function () {
        if (!this.getVisible()) { //如果面板为隐藏，则其子控件暂不构建父子关系
            this._needToBuildRelation = true;
            return;
        }
        var componentId = this.getComponentId();
        var componentIndex = isc.JGComponent.getComponentIndex(componentId);
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
        if (childrenIds && childrenIds.length > 0) {
            var LayoutType = this.getProperty("LayoutType");
            if (LayoutType && LayoutType == "BorderLayout") {
                //取用布局排版
                var topTotalPercent = 0,
                    bottomTotalPercent = 0,
                    leftTotalPercent = 0,
                    rightTotalPercent = 0,
                    centerTotalPercent = 0;
                var topTotal = 0,
                    bottomTotal = 0,
                    leftTotal = 0,
                    rightTotal = 0;
                for (var i = 0, childId; childId = childrenIds[i]; i++) {
                    var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                    var child = isc.JGWidgetManager.getWidget(childRefId);
                    if (!child) continue;
                    //布局属性
                    var Dock = child.getProperty("Dock");
                    var PercentWidth = child.getProperty("PercentWidth");
                    var PercentHeight = child.getProperty("PercentHeight");
                    var Width = child.getProperty("Width");
                    var Height = child.getProperty("Height");
                    //是否固定高或固定宽，Top/Bottom时是否固定高，Left/Right时是否固定宽
                    var StaticLayoutSize = child.getProperty("StaticLayoutSize");
                    switch (Dock) {
                        case "Top":
                            var top = this._Layout.getMember("Top_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            child.setPercentWidth("100%");
                            if (!StaticLayoutSize) {
                                child.setPercentHeight("100%");
                            }
                            top.addMember(child);
                            topTotalPercent = topTotalPercent + parseFloat(PercentHeight);
                            topTotal = topTotal + Height;
                            if (StaticLayoutSize) {
                                top.setHeight(topTotal);
                            } else {
                                top.setHeight(topTotalPercent + "%");
                            }
                            break;

                        case "Bottom":
                            var bottom = this._Layout.getMember("Bottom_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            child.setPercentWidth("100%");
                            if (!StaticLayoutSize) {
                                child.setPercentHeight("100%");
                            }
                            bottom.addMember(child);
                            bottomTotalPercent = bottomTotalPercent + parseFloat(PercentHeight);
                            bottomTotal = bottomTotal + Height;
                            if (StaticLayoutSize) {
                                bottom.setHeight(bottomTotal);
                            } else {
                                bottom.setHeight(bottomTotalPercent + "%");
                            }
                            break;

                        case "Left":
                            var middle = this._Layout.getMember("Middle_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            var left = middle.getMember("Left_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            if (!StaticLayoutSize) {
                                child.setPercentWidth("100%");
                            }
                            child.setPercentHeight("100%");
                            left.addMember(child);
                            leftTotalPercent = leftTotalPercent + parseFloat(PercentWidth);
                            leftTotal = leftTotal + Width;
                            if (StaticLayoutSize) {
                                left.setWidth(leftTotal);
                            } else {
                                left.setWidth(leftTotalPercent + "%");
                            }
                            middle.setHeight(PercentHeight);
                            break;

                        case "Right":
                            var middle = this._Layout.getMember("Middle_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            var right = middle.getMember("Right_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            if (!StaticLayoutSize) {
                                child.setPercentWidth("100%");
                            }
                            child.setPercentHeight("100%");
                            right.addMember(child);
                            rightTotalPercent = rightTotalPercent + parseFloat(PercentWidth);
                            rightTotal = rightTotal + Width;
                            if (StaticLayoutSize) {
                                right.setWidth(rightTotal);
                            } else {
                                right.setWidth(rightTotalPercent + "%");
                            }
                            middle.setHeight(PercentHeight);
                            break;

                        case "Fill":
                            var middle = this._Layout.getMember("Middle_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            var center = middle.getMember("Center_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                            child.setPercentWidth("100%");
                            child.setPercentHeight("100%");
                            center.addMember(child);
                            center.setWidth(PercentWidth);
                            middle.setHeight(PercentHeight);
                            break;

                        default:
                            this.addChild(child);
                            break;
                    }
                    //子控件的index要以组件的index为前缀
                    if (child.setIndexPreJoinComponentIndex) {
                        child.setIndexPreJoinComponentIndex(componentIndex);
                    }
                    child.buildRelation();
                    //添加关系（只读使能）
                    this.addWidgets(this, child);
                    if (this.ReadOnly || this.isReadOnly()) {
                        child.parentReadOnly(true);
                    }
                    if (this.Enabled == false || this.isDisabled()) {
                        child.parentDisabled(true);
                    }
                }
                //当没有Fill控件时，保证Middle，Center占有空白值
                var middle = this._Layout.getMember("Middle_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                if (middle.getHeight() == 0) {
                    middle.setHeight((100 - topTotalPercent - bottomTotalPercent) + "%");
                }
                var center = middle.getMember("Center_" + isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
                if (center.getWidth() == 0) {
                    center.setWidth((100 - leftTotalPercent - rightTotalPercent) + "%");
                }
            } else {
                //不用布局排版
                for (var i = 0, childId; childId = childrenIds[i]; i++) {
                    var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                    var child = isc.JGWidgetManager.getWidget(childRefId);
                    if (!child) continue;
                    this.addChild(child);
                    //添加关系（只读使能）
                    if (this.ReadOnly || this.isReadOnly()) {
                        child.parentReadOnly(true);
                    }
                    if (this.Enabled == false || this.isDisabled()) {
                        child.parentDisabled(true);
                    }
                    //子控件的index要以组件的index为前缀
                    if (child.setIndexPreJoinComponentIndex) {
                        child.setIndexPreJoinComponentIndex(componentIndex);
                    }
                    this.addWidgets(this, child);
                    child.buildRelation();
                }
                this._needToBuildRelation = false;
            }
        }
    },

    revert: function (isRe) {
        if (this.listener) {
            for (var eventName in this.listener) {
                this.listener[eventName] = [];
            }
        }
        if (isRe !== false) {
            var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
            if (childrenIds && childrenIds.length > 0) {
                for (var i = 0, childId; childId = childrenIds[i]; i++) {
                    var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                    var child = isc.JGWidgetManager.getWidget(childRefId);
                    if (!child) continue;
                    if (child.revert) {
                        child.revert();
                    }
                }
            }
        }
    },

    un: function (target, eventNames) {
        if (target && eventNames && eventNames.length > 0) {
            for (var i = 0, len = eventNames.length; i < len; i++) {
                var eventName = eventNames[i];
                target[eventName] = null;
            }
        }
    },
    getOrginalRect: function () {
        return this._orginalRect;
    },
    /**
     * 判断是否在布局内
     * */
    isInLayoutWidget: function () {
        var parentType = this.getParentType(this);
        if (parentType == "JGGroupPanel") {
            return true;
        }
        return false;
    },
    /**
     * 获取开发系统父级控件类型
     * */
    getParentType: function (widget) {
        var parentElement = widget.parentElement;
        if (parentElement) {
            var type = parentElement.type;
            if (!type) {
                type = widget.getParentType(widget.parentElement);
            }
        }
        return type;
    },
    /**
     * 获取水平位置
     */
    getHorizontalAlign: function () {
        return this.HorizontalAlign;
    },

    /**
     * 获取垂直位置
     */
    getVerticalAlign: function () {
        return this.VerticalAlign;
    },
    //控件高亮显示
    showHighlight: function () {
        var styleName = this.styleName;
        if (styleName || styleName.indexOf(' v3ComponentHighlight') == -1) {
            styleName = styleName ? styleName + ' v3ComponentHighlight' : 'v3ComponentHighlight';
            this.setStyleName(styleName);
        }
    },
    //隐藏控件高亮
    hideHighlight: function () {
        var styleName = this.styleName;
        if (styleName && styleName.indexOf(' v3ComponentHighlight') != -1) {
            styleName = styleName.replace(' v3ComponentHighlight', '');
            this.setStyleName(styleName);
        }
    },
    mapping: function (_array, funcName, arg1, arg2) {
        if (_array.length == 0) {
            return;
        }
        _array.forEach(function (item) {
            if (item[funcName]) {
                item[funcName](arg1, arg2);
            }
        })
    },
    validateWidget: function () {
        if (this.Visible === false) {
            return true;
        }
        var valid = true;
        var scopeId = this.scopeId;
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
        var catalog = {};
        if (this.validate && typeof this.validate == "function") {
            valid = this.validate();
        } else if (childrenIds) {
            $.each(childrenIds, function (index, childId) {
                var childRefId = isc.WidgetUtils.genWidgetRefId(scopeId, childId);
                var child = isc.JGWidgetManager.getWidget(childRefId);
                if (child.validateWidget && !child.validateWidget())
                    valid = false;
            });
        }

        return valid;
    },
    itemChanged: function (item, newValue) {
        this.notifyParentValidateChanged();
    },
    notifyParentValidateChanged: function () {
        var parentElement = this.parentElement;
        while (parentElement) {
            if (parentElement.onChildValidateResultChanged) {
                parentElement.onChildValidateResultChanged(true)
            }
            parentElement = parentElement.parentElement;
        }
    },
    _getVM : function() {
        var ds = this.TableName;
        var id = isc.JGV3ValuesManager.genId(ds.ID, this.scopeId, this.code);
        return isc.JGV3ValuesManager.getById(id, ds);
    },
    getBindFields : function(){
        return [this.ColumnName];
    },
    _filterData : function(fields, record) {
        var rs = {};
        if(record){
            for (var i = 0, l = fields.length; i < l; i++) {
                var field = fields[i];
                rs[field] = record[field];
            }
            rs.id = record.id;
        }
        return rs
    },
    setWidgetData : function(val,record){
        var vm = this._getVM();
        var fields = this.getBindFields();
        if(vm.setFieldCodes){
            vm.setFieldCodes([].concat(fields));
        }
        var oldValues = vm.getValues();
        var newValues = {};
        if (oldValues)
            Object.assign(newValues, oldValues);
        for (var key in newValues){
            if (newValues.hasOwnProperty(key) && (key != "id" && fields.indexOf(key) == -1)){
                delete newValues[key];
            }
        }
        var recordData = this._filterData(fields, record);
        for (var key in recordData){
            if (recordData.hasOwnProperty(key)){
                newValues[key] = recordData[key];
            }
        }
        vm.editRecord(newValues);
    },
    clearWidgetData : function(){
        var vm = this._getVM();
        vm.clearValues();
    },
    getWidgetData : function(){
        var vm = this._getVM();
        var values = vm.getValues();
        var fields = this.getBindFields();
        if(fields.length==1){
            return values[fields[0]];
        }else{
            var result = {};
            for(var i=0,l=fields.length;i<l;i++){
                var field = fields[i];
                result[field] = values[field];
            }
            return result;
        }
    },
    setV3Value : function(val){
        var ds = this.TableName;
        if(ds){
            var fields = this.getBindFields();
            var current = ds.getCurrentRecord();
            var changed = {};
            if(!current){
                current = ds.createRecord();
                ds.insertRecords([current]);
            }
            changed.id = current.id;
            if(fields.length==1){
                changed[fields[0]] = val;
            }else if(fields.length>1){
                for(var i=0,l=fields.length;i<l;i++){
                    var field = fields[i];
                    changed[field] = val[field];
                }
            }
            ds.updateRecords([changed]); 
        }  
    },

    /**
     * 获取v平台方法映射
     * @memberof JGBaseFormWidget
     * @method
     * @instance
     * @description 平台控件属性设置规则会调用到控件实例方法，如设置控件属性值会调用控件setValue方法，当控件原生已提供setValue方法且控件属性设置需求冲突时，可通过此接口中转到另一个方法
     * @returns {Object}
     */
    getV3MethodMap : function(){
        return {
            setValue : "setV3Value"
        }
    }
});
/**
 * 弹出选择
 * @class JGLabel
 * @extends JGBaseWidget
 * @example
 * isc.JGLabel.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("V3Label", "Label");
isc.V3Label.addMethods({
    getInnerHTML: function () {
        var _html = this.Super("getInnerHTML");
        return _html.replace('inline-block', 'inline');
        //如果是inline-block，给td设置text-decoration样式不会传递到div中。
    }
});

// 定义v3ui控件类型--页签 JGBaseWidget
isc.ClassFactory.defineClass("JGLabel", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGLabel", "JGStyleHelper");



// 定义v3ui控件属性
isc.JGLabel.addProperties({
    _Label: null,
    //高度
    Height: 20,
    //宽度
    Width: 50,
    //左边距
    Left: 50,
    //上边距
    Top: 70,
    //对齐
    Align: "center",
    //图标
    Icon: null,
    //中文标题
    SimpleChineseTitle: "",
    //字体
    FontStyle: {},
    //标题颜色
    ForeColor: '',
    //鼠标状态
    Cursor: 'default',

    //是否显示
    //Visible: true,
    //标签样式抽取
    WidgetsStyle: "JGLabel",
    /**
     * 事件注册
     */
    listener: ['click', 'OnClick'],

    WidgetStyle: "JGLabel"

});

isc.JGLabel.addMethods({
    _initWidget: function () {
        //add by dengb
		//当有点击事件，添加上小手样式
		if (this._$OnClick && this._$OnClick.toString() != '') {
            this.Cursor = 'hand';
            this.LinkSty = 'linkClick';
        }

        this.Super("initWidget", arguments);
        var widget = this;

        // var isUn=this.FontStyle['font-family'] != null || this.FontStyle['font-size']!=null || this.FontStyle['font-weight']!=null  ? 'normal':'isSelectedEventLink';//是否显示下划线

        var hasBindAction = this.LinkSty == "linkClick";

        this.className = this.WidgetStyle + "Normal";

        this._Label = isc.V3Label.create({
            id: this.id,
            height: this.Height,
            width: this.Width,
            valign: isc.Canvas.Middle,
            align: this.TextAlign,
            cursor: this.Cursor,
            contents: "<label style='"
                + (hasBindAction ? "cursor: pointer;" : "")

                + "'>" + this.SimpleChineseTitle + "</label>",
            //prompt:this.SimpleChineseTitle,
            //border:"1px solid #CCCCCC",
            overflow: isc.Canvas.HIDDEN,//防止溢出
            wrap: true,//防止中文换行
            showEdges: false,
            clipTitle: true,
            canFocus: true,//是否可获取焦点
            showFocusOutline: false,
            canHover: true,

            toolTipSource: this.ToolTipSource,
            //styleName : this.LinkSty=="linkClick" ? isUn :'normal',
            //cssText:this.genBackgroundImageCssTextByBackColor(this.ImageObj,this.BackColor) + this.genFontCssText(this.FontStyle,this.ForeColor) + ';word-break: break-all; ',
            backgroundColor: this.BackColor,

            styleName: this.WidgetStyle + (hasBindAction ? "WithAction" : ""),//如果绑定了动作，那么使用不同的样式

            cssText: this.genBackgroundImageCssTextByBackColor(this.ImageObj, this.BackColor) + this.genFontCssText(this.FontStyle, this.ForeColor) + ';word-break: break-all; ',
            //backgroundColor:this.BackColor,

            //click : widget._referEvent(widget, [ 'click' ])
            //防止事件执行过久而导致用户继续触发,功能与_referEvent相同
            click: widget._referTimerEventHandler(widget, ['OnClick']),
            //取消比较标题宽度与标题显示宽度
            isDisabled: function () {
                return false;
            }
        });

        // 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
        this.addChild(this._Label);

    },
    //暂停使用_referTimerEventHandler
    pause: function () {
        this._Label.setDisabled(true);
    },
    //继续使用_referTimerEventHandler
    resume: function () {
        if (!this.isEnabled || this.isEnabled()) {
            this._Label.setDisabled(false);
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
    setSimpleChineseTitle: function (contents) {
        var hasBindAction = this.LinkSty == "linkClick";
        var dom = "<label " + (hasBindAction ? "style='cursor: pointer;'" : "") + ">" + contents + "</label>";
        this.SimpleChineseTitle = contents;
        this._Label.setContents(dom);
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
        //this.BackColor = color;
        //var newCssText = this.cssTextExtend(this._Label.cssText,{"background":color});
        //this._Label.cssText = newCssText;
        this._Label.setBackgroundColor(color);
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
        var newCssText = this.cssTextExtend(this._Label.cssText, { "color": color });
        this._Label.cssText = newCssText;
        this._Label.markForRedraw();
    },
    /**
     * 设置字体
     */
    setFontStyle: function (fontStyle) {
        fontStyle = this.parseFontStyle(fontStyle);
        this.FontStyle = fontStyle;
        var newCssText = this.cssTextExtend(this._Label.cssText, fontStyle, true);
        this._Label.cssText = newCssText;
        this._Label.markForRedraw();
    },

    //放在容器中按布局排版时设置比例
    setPercentWidth: function (percentWidth) {
        this.Super("setPercentWidth", arguments);
        //this._Label.setWidth(percentWidth);
        this._Label.setWidth("100%");
    },
    setPercentHeight: function (percentHeight) {
        this.Super("setPercentHeight", arguments);
        //this._Label.setHeight(percentHeight);
        this._Label.setHeight("100%");
    },
    destroy: function () {
        //var label = this._Label;
        //if(label){
        this._Label = null;
        //label.destroy();
        //}
        this.Super("destroy", arguments);
    },
    getVisible: function() {
        return this.isVisible();
    },
    setLabelText: function(title) {
        this.setSimpleChineseTitle(title);
    },
    getLabelText: function(title) {
        return this.getSimpleChineseTitle();
    },

    // 覆盖IRecordObserver
    getBindFields : function(){
        return [this.ColumnName];
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
    }
});
/**
 * v平台小数控件
 * @class JGFloatBox
 * @extends JGBaseFormWidget
 * @mixes JGFormatHelper
 * @example
 * isc.JGFloatBox.create({
 *  autoDraw : true
 * });
 */
isc.ClassFactory.defineClass("JGFloatBox", "JGBaseFormWidget");
isc.ClassFactory.mixInInterface("JGFloatBox", "JGFormatHelper");

isc.JGFloatBox.addProperties({

    /**
     *显示格式
     */
    DisplayFormat: null,

    /**
     *高度
     */
    Height: 20,

    /**
     *显示
     */
    Visible: true,

    /**
     *字段名称
     */
    ColumnName: null,

    /**
     *值字体
     */
    ValueFontStyle: null,

    /**
     *值背景色
     */
    ValueBackColor: null,

    /**
     *只读
     */
    ReadOnly: false,

    /**
     *标签字体
     */
    LabelFontStyle: null,

    /**
     *值文本对齐
     */
    ValueTextAlign: 'center',

    /**
     *名称
     */
    Name: null,

    /**
     *标题对齐
     */
    LabelTextAlign: 'center',

    /**
     *左边距
     */
    Left: 0,

    /**
     *顺序号 
     */
    TabIndex: -1,

    /**
     *标签前景色
     */
    LabelForeColor: null,


    /**
     *标签背景色
     */
    LabelBackColor: null,


    /**
     *上边距
     */
    Top: 0,

    /**
     *标题
     */
    SimpleChineseTitle: null,

    /**
     *必填
     */
    IsMust: false,

    /**
     *使能
     */
    Enabled: false,


    /**
     *小数点前位数,默认值
     */
    IntegralPartLength: 11,

    /**
     *小数点和小数点后位数,默认值
     */
    FractionalPartLength: 6,

    /**
     *值前景色
     */
    ValueForeColor: null,


    //事件注册
    listener: ['change', 'focus', 'blur', 'keydown', 'click', 'titleClick'],
    WidgetStyle: "JGTextBox"

});

isc.JGFloatBox.addMethods({

    _initProperties: function (properties) {
        this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
        if (this.WidgetStyle == "JGFloatBox") {
            this.WidgetStyle = "JGForm";
        }
        items = [isc.addProperties(properties, {
            type: "V3FloatBoxItems",
            isAbsoluteForm: true,
        })];

        this.items = items;
    },

    getDefaultValue : function () {
		return this.DefaultValue;
	},

    getV3Value : function () {
		var value = this.getWidgetData();
		if (undefined == value || null == value) {
			return null;
		}
		return value;
	},

    setEnabled : function(state) {
		this.setItemEnabled(state);
	},

    getVisible : function () {
		return this.isVisible();
	},

    setReadOnly : function (state) {
		this.setItemReadOnly(state);
	},

    getReadOnly : function () {
		return this.isReadOnly();
	},
	
    setLabelText : function (title) {
		this.setSimpleChineseTitle(title);
	},

	getLabelText : function () {
		return this.getSimpleChineseTitle();
	},

    setV3Focus: function () {
        this.setControlFocus();
    },

    cleanSelectedControlValue: function(cleanSelected){
        this.clearWidgetBindDatas(cleanSelected);
    },

    getV3MethodMap : function(){
        return {
            setFocus : "setV3Focus",
            setValue : "setV3Value",
            getValue : "getV3Value"
        };
    }
});
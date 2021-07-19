/**
 * v平台长文本控件
 * @class JGLongTextBox
 * @extends JGBaseFormWidget
 * @example
 * isc.JGLongTextBox.create({
 *  autoDraw : true
 * });
 */
isc.ClassFactory.defineClass("JGLongTextBox", "JGBaseFormWidget");

// 定义v3ui控件属性
isc.JGLongTextBox.addProperties({
    //是否必填
    required: false,
    //最大输入长度
    maxLength: 50,
    //是否显示
    isShow: true,
    readOnly: false,
    disabled: false,
    listener: [
        'change',
        'focus',
        'blur',
        'click',
        'titleClick',
        'keydown'
    ],
    /**
     * 长文本配置信息
     */
    LongTextBoxOptions: null,
    //绑定字段名称
    ColumnName: '',
    WidgetStyle: "JGLongTextBox"
});

isc.JGLongTextBox.addMethods({
    _initProperties: function (properties) {
        this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
        this.className += " JGLongTextBox";
        if (this.WidgetStyle == "JGLongTextBox") {
            this.WidgetStyle = "JGForm";
        }

        this.items = [isc.addProperties(properties, {
            type: "V3LongTextItem",
            isAbsoluteForm: true,
        })]
    },
    /**
     * 获取长文本的配置信息
     */
    getLongTextBoxOptions: function () {
        return this.LongTextBoxOptions;
    },

    getDefaultValue : function() {
		return this.DefaultValue;
	},

    setEnabled : function(state) {
		this.setItemEnabled(state);
	},

    getVisible : function() {
		return this.isVisible();
	},

    setReadOnly : function(state) {
		this.setItemReadOnly(state);
	},

	getReadOnly : function() {
		return this.isReadOnly();
	},
	
	setLabelText : function(title) {
		this.setSimpleChineseTitle(title);
	},

	getLabelText : function() {
		return this.getSimpleChineseTitle();
	},

    setV3Focus: function () {
        this.setControlFocus();
    },

    getV3Value: function(){
        var value = this.getWidgetData();
        if (undefined == value || null == value) {
            return "";
        }
        return value;
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
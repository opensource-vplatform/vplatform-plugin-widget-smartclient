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
        this._initEventAndDataBinding();
    },

    _initEventAndDataBinding: function(){
        var _this = this;
        isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function(record) {
			isc.DataBindingUtil.setWidgetValue(_this,record);
		});
		isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(this, null, null, function() {
			isc.DataBindingUtil.clearWidgetValue(_this);
		});
        isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded);
		isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(this, null, this.OnValueChanged);
    },

    /**
     * 获取长文本的配置信息
     */
    getLongTextBoxOptions: function () {
        return this.LongTextBoxOptions;
    },

    getBindFields: function(){
        return [this.ColumnName];
    }

});
/**
 * v平台密码控件
 * @class JGPassword
 * @mixes JGBaseFormWidget
 * @mixes IRecordObserver
 * @example
 * isc.JGPassword.create({
 *  autoDraw : true
 * });
 */
isc.ClassFactory.defineClass("JGPassword", "JGBaseFormWidget");

// 定义v3ui控件属性
isc.JGPassword.addProperties({

    /**
     * 标签背景色
     */
    LabelBackColor: null,

    /**
     * 只读
     */
    ReadOnly: false,

    /**
     * 值背景色
     */
    ValueBackColor: null,

    /**
     * 左边距
     */
    Left: 0,

    /**
     * 字段名称
     */
    ColumnName: null,

    /**
     * 上边距
     */
    Top: 0,

    /**
     * 顺序号
     */
    TabIndex: -1,
    /**
     * 标签前景色
     */
    LabelForeColor: null,

    /**
     * 标题
     */
    SimpleChineseTitle: null,

    /**
     * 高度
     */
    Height: 20,

    /**
     * 密码长度
     */
    TextLength: 50,

    /**
     * 标签字体
     */
    LabelFontStyle: null,

    /**
     * 名称
     */
    Name: null,

    /**
     * 显示
     */
    Visible: true,

    /**
     * 使能
     */
    Enabled: false,

    /**
     * 值字体
     */
    ValueFontStyle: null,

    /**
     * 值前景色
     */
    ValueForeColor: null,

    /**
     * 标题对齐
     */
    LabelTextAlign: 'center',


    // 事件注册
    listener: ['change', 'focus', 'blur', 'keydown', 'click', 'titleClick'],
    WidgetStyle: "JGTextBox"

});

isc.JGPassword.addMethods({

    _initProperties: function (properties) {
        this.TitleWidth = properties.LabelWidth;
        this.TitleVisible = properties.LabelVisible;
        if (this.WidgetStyle == "JGPassword") {
            this.WidgetStyle = "JGForm";
        }
        this.items = [isc.addProperties(properties, {
            type: "V3PasswordItems",
            isAbsoluteForm: true,
        })]
        this._initEventAndDataBinding();
    },

    _initEventAndDataBinding: function () {
        var _this = this;
        isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function (record) {
            isc.DataBindingUtil.setWidgetValue(_this, record);
        });
        isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(this, null, null, function () {
            isc.DataBindingUtil.clearWidgetValue(_this);
        });
        isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(this, null, this.OnValueChanged);
        isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded);
    },

    getBindFields: function () {
        return [this.ColumnName];
    }

});
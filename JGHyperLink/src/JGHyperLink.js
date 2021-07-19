/**
 * 链接文本
 * @class JGHyperLink
 * @mixes IRecordObserver
 */
isc.ClassFactory.defineClass("JGHyperLink", "JGBaseFormWidget");
isc.ClassFactory.mixInInterface("JGHyperLink", "IRecordObserver");

// 定义v3ui控件属性
isc.JGHyperLink.addProperties({

    //是否必填
    IsMust: false,
    //最大输入长度
    TextLength: 50,
    //是否显示
    Visible: true,
    //只读
    ReadOnly: false,
    //使能
    Enabled: true,
    //标题宽度
    TitleWidth: 76,
    //
    //LabelTextAlign: 'center',
    //JGTextBox提供的事件列表
    listener: ['change', 'focus', 'blur', 'keydown', 'click', 'titleClick', 'mouseover', 'LinkAction'],
    //绑定字段名称
    ColumnName: 'ColumnName',
    widgetId: "JGHyperLink1",
    ToolTip: "",
    ValueTextAlign: "left",
    Left: 0,
    ValueForeColor: "",
    HorizontalAlign: "Left",
    type: "JGHyperLink",
    ColSpan: "1",
    WidgetStyle: "JGHyperLink",
    AutoTest: true,
    _$windowVersion: "1",
    VerticalAlign: "Top",
    ValueFontStyleFamily: "",
    Code: "JGHyperLink1",
    PlaceholderPosition: "Right",
    TableName: "",
    _$WidgetType: "JGHyperLink",
    Top: 0,
    ValueFontStyleItalic: "",
    PercentWidth: "12.6%",
    LabelFontStyleFamily: "",
    LabelTextAlign: "left",
    Placeholder: "",
    LabelForeColor: "",
    LabelFontStyleDecoration: "",
    code: "JGHyperLink1",
    LabelFontStyleBold: "",
    ValueFontStyleDecoration: "",
    LabelFontStyleItalic: "",
    TabIndex: 24,
    ValueFontStyleSize: "",
    DefaultValue: "",
    OnValueChanged: "",
    PercentHeight: "1.6%",
    OnValueLoaded: "",
    LabelFontStyleSize: "",
    LabelWidth: 94,
    Height: 26,
    OnLabelClick: "",
    Width: 235,
    SourceTableName: "",
    EndRow: "False",
    LabelBackColor: "",
    DisplayFormat: {
        numType: "0",
        displayFormat: "",
        Index: "0"
    },
    ValueFontStyleBold: "",
    SimpleChineseTitle: "链接",
    MultiHeight: "26px",
    OnClick: "",
    StartRow: "False",
    Dock: "None",
    LabelVisible: true,
    ValueBackColor: "",
    MultiWidth: "235px"
});


isc.JGHyperLink.addMethods({
    
    _initProperties: function (properties) {
        this.TitleWidth = this.LabelWidth;
        this.TitleVisible = this.LabelVisible;
        this.items = [isc.addProperties(properties, {
            type: "V3HyperLinkItem",
            isAbsoluteForm: true,
        })]
    },
    parentReadOnly: function (newState) {
        this.setReadOnly(newState)
    },
    setLabelText : function(title) {
		this.setSimpleChineseTitle(title);
	},

	getLabelText : function() {
		return this.getSimpleChineseTitle();
	},

    getValue : function(){
        return this.getWidgetData();
    }
});
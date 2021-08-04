/**
 * 整数
 * @class JGIntegerBox
 * @extends JGBaseFormWidget
 * @mixes JGFormatHelper
 * @mixes IWindowAop
 * @example
 * var ds = isc.V3Datasource.create({
	fields:[{
		name: "id",
		primaryKey:true,
		type: "text",
		title: "主键id"
	},{
		name: "a",
		type: "integer",
		title: "字段a"
	}]
});
//创建临时数据源
var createTempDS = function(fieldCode){
	return isc.V3Datasource.create({
		fields:[{
			name: "id",
			primaryKey:true,
			type: "text",
			title: "主键id"
		},{
			name: fieldCode,
			type: "integer",
			title: "字段"
		}]
	});
}

var info = isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton2",
    SimpleChineseTitle: "事件信息",
    Height: 89,
    Width: 390,
    Top: 120,
    Left: 470
});
var ipt = isc.JGIntegerBox.create({
    autoDraw: true,
    Code: "JGIntegerBox42",
    SimpleChineseTitle: "使能",
    Top: 80,
    Left: 470,
	Width:235,
	Height:26,
	LabelWidth:94,
	Visible:true,
	Enabled:true,
    OnValueChanged:function(){
		info.setSimpleChineseTitle("值改变事件触发！");
	},
	OnValueLoaded:function(){
		info.setSimpleChineseTitle("值加载事件触发！");
	},
	OnLabelClick:function(){
		info.setSimpleChineseTitle("标题点击事件触发！");
	},
	OnKeyDown:function(){
		info.setSimpleChineseTitle("键盘按下事件触发！");
	},
	OnEnter:function(){
		info.setSimpleChineseTitle("获取焦点事件触发！");
	},
	OnLeave:function(){
		info.setSimpleChineseTitle("失去焦点事件触发！");
	},
	TableName:ds,
	ColumnName: "a"
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton13",
    SimpleChineseTitle: "使能",
    Width: 59,
    Top: 79,
    Left: 724,
    OnClick:function(){
		ipt.setEnabled(true);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton112",
    SimpleChineseTitle: "禁用",
    Width: 59,
    Top: 80,
    Left: 801,
    OnClick:function(){
		ipt.setEnabled(false);
	}
});
var ipt1 = isc.JGIntegerBox.create({
    autoDraw: true,
    Code: "JGIntegerBox41",
    SimpleChineseTitle: "只读",
    Top: 48,
    Left: 470,
	Width:235,
	Height:26,
	LabelWidth:94,
	Visible:true,
	Enabled:true
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton12",
    SimpleChineseTitle: "只读",
    Width: 59,
    Top: 47,
    Left: 724,
    OnClick:function(){
		ipt1.setReadOnly(true);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton111",
    SimpleChineseTitle: "编辑",
    Width: 59,
    Top: 48,
    Left: 801,
    OnClick:function(){
		ipt1.setReadOnly(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton11",
    SimpleChineseTitle: "隐藏",
    Width: 59,
    Top: 16,
    Left: 801,
    OnClick:function(){
		ipt2.setVisible(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton1",
    SimpleChineseTitle: "显示",
    Width: 59,
    Top: 15,
    Left: 724,
    OnClick:function(){
		ipt2.setVisible(true);
	}
});
var ipt2 = isc.JGIntegerBox.create({
    autoDraw: true,
    Code: "JGIntegerBox4",
    SimpleChineseTitle: "显示",
    Top: 16,
    Left: 470,
	Width:235,
	Height:26,
	LabelWidth:94,
	Visible:true,
	Enabled:true
});
var ipt3 = isc.JGIntegerBox.create({
    autoDraw: true,
    Code: "JGIntegerBox3",
    SimpleChineseTitle: "整数",
    Top: 120,
    Left: 14,
    OnLabelClick:function(){
		info.setSimpleChineseTitle("标题点击事件触发！");
	},
	DefaultValue:1111,
	Width:235,
	Height:26,
	LabelWidth:94,
	Visible:true,
	Enabled:true,
	TableName:createTempDS("ColumnName"),
	ColumnName:"ColumnName"
});

ipt3.setV3Value(ipt3.getDefaultValue());

isc.JGIntegerBox.create({
    autoDraw: true,
    Code: "JGIntegerBox2",
    SimpleChineseTitle: "整数",
    Top: 73,
    Left: 14,
	Width:235,
	Height:26,
	LabelWidth:94,
	Visible:true,
	Enabled:true,
    LabelVisible:false
});
isc.JGIntegerBox.create({
    autoDraw: true,
    Code: "JGIntegerBox1",
    SimpleChineseTitle: "整数",
    Width: 364,
	Height:50,
	Top:16,
	Left:14,
	LabelWidth:94,
	Visible:true,
	Enabled:true,
	LabelWidth:150,
	ValueTextAlign:"Right",
	ToolTip: "\"浮动提示\"",
	Placeholder: "提醒文字"
});
ds.load([{
	id : "1",
	a : 222
}]);
 */
isc.ClassFactory.defineClass("JGIntegerBox", "JGBaseFormWidget");
isc.ClassFactory.mixInInterface("JGIntegerBox", "JGFormatHelper");
isc.ClassFactory.mixInInterface("JGIntegerBox", "IWindowAop");

isc.JGIntegerBox.addProperties({

	/**
	 * 显示格式
	 */
	DisplayFormat: null,

	/**
	 * 高度
	 */
	Height: 20,

	/**
	 * 显示
	 */
	Visible: true,

	/**
	 * 字段名称
	 */
	ColumnName: null,

	/**
	 * 值字体
	 */
	ValueFontStyle: null,

	/**
	 * 值背景色
	 */
	ValueBackColor: null,

	/**
	 * 只读
	 */
	ReadOnly: false,

	/**
	 * 标签字体
	 */
	LabelFontStyle: null,

	/**
	 * 值文本对齐
	 */
	ValueTextAlign: 'center',

	/**
	 * 名称
	 */
	Name: null,

	/**
	 * 标题对齐
	 */
	LabelTextAlign: 'center',

	/**
	 * 左边距
	 */
	Left: 0,

	/**
	 * 顺序号
	 */
	TabIndex: -1,

	/**
	 * 标签前景色
	 */
	LabelForeColor: null,

	/**
	 * 标签背景色
	 */
	LabelBackColor: null,

	/**
	 * 上边距
	 */
	Top: 0,

	/**
	 * 标题
	 */
	SimpleChineseTitle: null,

	/**
	 * 必填
	 */
	IsMust: false,

	/**
	 * 使能
	 */
	Enabled: false,

	/**
	 * 值前景色
	 */
	ValueForeColor: null,


	//位数2013-11-25 和mengyf 沟通 目前开发没有打补丁，执行这边先给默认值
	MaxLength: 11,

	// 事件注册
	listener: ['change', 'focus', 'blur', 'keydown', 'click', 'titleClick'],
	WidgetStyle: "JGTextBox"

});

isc.JGIntegerBox.addMethods({

	_initProperties: function (properties) {
		this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
		if (this.WidgetStyle == "JGIntegerBox") {
			this.WidgetStyle = "JGForm";
		}
		var items = [isc.addProperties(properties, {
			type: "V3IntegerBoxItems",
			isAbsoluteForm: true,
			formatEditorValue: (this.DisplayFormat && this.DisplayFormat.displayFormat) ? this.formatDisplayValue : null,
			formatOnFocusChange: true,
		})]
		this.items = items;
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
	getBindFields: function(){
		return [this.ColumnName];
	},
	//显示格式的几个方法抽到这里
	formatDisplayValue: function (value, record, form, item) {
		if (value != undefined && value != null) {
			if (this.form.DisplayFormat && this.form.DisplayFormat.displayFormat) {
				var numType = this.form.DisplayFormat.numType;
				var pattern = this.form.DisplayFormat.displayFormat;
				//把真实值记录下来
				var itemFieldName = "_realValue" + item.name;
				if (isc.isA.Date(value)) {
					item[itemFieldName] = value.toJapanShortDate();
				} else {
					item[itemFieldName] = value;
				}
				return this.form.valueFormat(value, pattern, numType);
			}
		}
		return value;
	},
	blurCheck: function () {
		var _currVal = this.items.last().getValue();
		// 录入数字不能超过整型最大值：(2^31)-1
		var _maxVal = 2147483647;
		var _minVal = -2147483648;
		//只能录入数字
		var reg = /^[-\+]?\d+$/;
		if (!reg.test(_currVal)) {
			this.items.last().setValue(null);
		} else if (_currVal > _maxVal) {
			this.items.last().setValue(_maxVal);
		} else if (_currVal < _minVal) {
			this.items.last().setValue(_minVal);
		} else { // this.MaxLength
			_currVal = (_currVal + "").substring(0, this.MaxLength) * 1;
			this.items.last().setValue(_currVal);
		}
	},

	windowInited: function(){
        //解析显示格式表达式
        if (this.DisplayFormat && this.DisplayFormat.displayFormat) {
			var numType = this.DisplayFormat.numType;
			var pattern = this.DisplayFormat.displayFormat;
			//如果是自定义显示格式需要进行表达式解析add by liyc 20160517
			if ('8' == numType) {
				this.DisplayFormat.displayFormat = this._v3ExpHandler(pattern);
				for (var i = 0; i < this.items.length; i++) {
					if (this.items[i] && this.items[i].displayFormat) {
						this.items[i].displayFormat = this.DisplayFormat.displayFormat;
					}
				}
			}
        }
	}

});
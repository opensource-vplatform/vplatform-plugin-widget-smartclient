/**
 * 期次控件
 * @class JGPeriod
 * @extends JGBaseFormWidget
 * @example
 * isc.JGPeriod.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGPeriod", "JGBaseFormWidget");

// 定义v3ui控件属性
isc.JGPeriod.addProperties({
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
	//
	LabelTextAlign: 'center',
	//JGPeriod提供的事件列表
	listener: ['change', 'focus', 'blur', 'keydown', 'click', 'titleClick'],
	//绑定字段名称
	ColumnName: '',
	TitleWidth: 94,
	// 显示格式
	DisplayFormatString: {
		"year": "yyyy年",
		"halfyear": "yyyy年bb半年",
		"quarter": "yyyy年qq季",
		"month": "yyyy年MM月",
		"tendays": "yyyy年MM月xx旬",
		"week": "yyyy年ww周"
	},
	// 期次类型
	PeriodType: 'year',
	WidgetStyle: "JGDateItem"
});

isc.JGPeriod.addMethods({
	_initProperties: function (properties) {
		this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
		this.styleName = "JGBaseFormWidget JGPeriod";
		if (this.ReadOnly) {
			this.styleName += " JGPeriodReadOnly";
		}
		if (!this.Enabled) {
			this.styleName += " JGPeriodDisabled";
		}
		if (this.WidgetStyle == "JGPeriod") {
			this.WidgetStyle = "JGFormIcon"
		}
		this.items = [isc.addProperties(properties, {
			type: "V3PeriodItem",
			isAbsoluteForm: true,
		})]
	},
	setPeriodType: function (periodType) {
		if (!this.isDisabled()) {
			var _formItems = this.items.last();
			if (_formItems) {
				// 为了触发db重置值
				var columnName = this.ColumnName;
				var values = this.getValues();
				for (var attr in values) {
					if (attr === columnName)
						values[attr] = "";
				}
				this.setValues(values);

				_formItems.sdatetype = periodType;
				_formItems.sdatetype_real = periodType;
				_formItems.displayFormat = _formItems._displayFormat[periodType];
				_formItems.picker = null;

				_formItems.form._dataSyn();
			}
		}
	},
	getPeriodType: function () {
		return this.items[0].sdatetype;
	},

	setV3PeriodType: function(periodType) {
        if (!this.isDisabled())
            this.setPeriodType(periodType);
    },

	getV3MethodMap: function(){
		var result = this.Super("getV3MethodMap",arguments);
		result.setPeriodType = "setV3PeriodType";
		return result;
	}

});
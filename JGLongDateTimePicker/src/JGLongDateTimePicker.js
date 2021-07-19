/**
 * 长日期控件
 * @class JGLongDateTimePicker
 * @extends JGBaseFormWidget
 * @mixes IWindowAop
 * @example
 * isc.JGLongDateTimePicker.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGLongDateTimePicker", "JGBaseFormWidget");
isc.ClassFactory.mixInInterface("JGLongDateTimePicker", "IWindowAop");

// 定义v3ui控件属性
isc.JGLongDateTimePicker.addProperties({

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
	//JGLongDateTimePicker提供的事件列表
	listener: ['change', 'focus', 'blur', 'keydown', 'click', 'titleClick'],
	//绑定字段名称
	ColumnName: '',
	// 显示格式
	DisplayFormat: null,
	WidgetStyle: "JGDateItem"
});


isc.JGLongDateTimePicker.addMethods({
	_initProperties: function (properties) {
		this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
		this.styleName = "JGBaseFormWidget JGLongDateTimePicker";
		if (this.ReadOnly) {
			this.styleName += " JGLongDateTimePickerReadOnly";
		}
		if (!this.Enabled) {
			this.styleName += " JGLongDateTimePickerDisabled";
		}
		if (this.WidgetStyle == "JGLongDateTimePicker") {
			this.WidgetStyle = "JGFormIcon";
		}

		this.items = [isc.addProperties(properties, {
			type: "V3LongDateTimeItem",
			isAbsoluteForm: true,
		})]
	},
	setMinDate: function (date) {
		// 判断日期有效性
		var _date = new Date(date);
		if (_date + "" === "Invalid Date")
			return;

		var items = this.items;
		if (items) {
			var len = items.length,
				formItem = items[0];
			if (!formItem)
				return;
			formItem.minDate = date;

			var _picker = formItem.picker;
			if (!_picker)
				return;
			_picker.minDate = date;

			var _centerPicker = _picker.center;
			if (!_centerPicker)
				return;
			_centerPicker.minDate = date;
		}
	},
	setMaxDate: function (date) {
		// 判断日期有效性
		var _date = new Date(date);
		if (_date + "" === "Invalid Date")
			return;

		var items = this.items;
		if (items) {
			var len = items.length,
				formItem = items[0];
			if (!formItem)
				return;
			formItem.maxDate = date;

			var _picker = formItem.picker;
			if (!_picker)
				return;
			_picker.maxDate = date;

			var _centerPicker = _picker.center;
			if (!_centerPicker)
				return;
			_centerPicker.maxDate = date;
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
	},

    setEnabled: function(state) {
        this.setItemEnabled(state);
    },

    setReadOnly: function(state) {
        this.setItemReadOnly(state);
    }

});
/**
 * 日期控件
 * @class JGDateTimePicker
 * @mixes IWindowAop
 * @example
 * isc.JGDateTimePicker.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGDateTimePicker", "JGBaseFormWidget");
isc.ClassFactory.mixInInterface("JGDateTimePicker", "IWindowAop");

// 定义v3ui控件属性
isc.JGDateTimePicker.addProperties({
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


isc.JGDateTimePicker.addMethods({
	_initProperties: function (properties) {
		this.TitleWidth = properties.LabelWidth;
		this.styleName = "JGBaseFormWidget JGDateTimePicker";
		if (this.ReadOnly) {
			this.styleName += " JGDateTimePickerReadOnly";
		}
		if (!this.Enabled) {
			this.styleName += " JGDateTimePickerDisabled";
		}
		if (this.WidgetStyle == "JGDateTimePicker") {
			this.WidgetStyle = "JGFormIcon"
		}
		this.items = [isc.addProperties(properties, {
			type: "V3DateTimeItem",
			isAbsoluteForm: true,
		})]

		//		        
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

    setReadOnly: function(state) {
        var classArr = this.styleName ? this.styleName.split(" ") : [];
        if(state && classArr.indexOf("JGDateTimePickerReadOnly") == -1){
        	classArr.push("JGDateTimePickerReadOnly");
        	this.setClassName(classArr.join(" "));
        }else if(!state && classArr.indexOf("JGDateTimePickerReadOnly") != -1){
        	classArr.splice(classArr.indexOf("JGDateTimePickerReadOnly"),1);
        	this.setClassName(classArr.join(" "));
        }
        this.setItemReadOnly(state);
    },

	getV3MethodMap : function(){
        return {
            setFocus : "setV3Focus",
            setValue : "setV3Value",
            getValue : "getV3Value"
        };
    }
});
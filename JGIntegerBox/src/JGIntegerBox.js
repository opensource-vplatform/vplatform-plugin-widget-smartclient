/**
 * 整数
 * @class JGIntegerBox
 * @extends JGBaseFormWidget
 * @mixes JGFormatHelper
 * @mixes IWindowAop
 * @example
 * isc.JGIntegerBox.create({
 * 	autoDraw: true
 * });
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
	},

	setReadOnly: function(state) {
		this.setItemReadOnly(state);
	}

});
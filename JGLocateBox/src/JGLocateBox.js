/**
 * 检索控件
 * @class JGLocateBox
 * @extends JGBaseWidget
 * 
 */
isc.ClassFactory.defineClass("JGLocateBox", "JGBaseFormWidget");
isc.JGLocateBox.addProperties({

	/**
	 * 上边距
	 *
	 * @param {int}
	 */
	Top: 0,
	/**
	 * 左边距
	 */
	Left: 0,
	/**
	 * 宽度
	 */
	Width: 0,
	/**
	 * 高度
	 */
	Height: 0,

	/**
	 * 中文标题
	 */
	SimpleChineseTitle: "",
	/**
	 * 只读
	 */
	readonly: false,

	/**
	 * 禁用
	 */
	disabled: false,

	/**
	 * "Tab"键的遍历顺序
	 */
	TabIndex: -1,
	/**
	 * 按钮长度
	 */
	ButtonWidth: 0,
	/**
	 * 事件注册
	 */
	listener: ['focus', 'blur', 'keydown', 'click'],
	/**
	 * 值文本对齐
	 */
	ValueTextAlign: 'center',
	/**
	 * 使能
	 */
	Enabled: true,

	Hint: isc.I18N.get("输入关键字搜索", "普通窗体检索提示文字"),
	WidgetStyle: "JGLocateBox"

});

isc.JGLocateBox.addMethods({
	_initProperties: function (properties) {
		if (!this.className) {
			this.className = "";
		}
		this.className += " JGLocateBox";
		//		        this.initFormProperties();
		this.titleWidth = 0;
		// 根据检索的长度，文本
		var items = [];
		this.isShowTitle = false;


		items[items.length] = isc.addProperties(properties, {
			type: "V3LocateItem",
			isAbsoluteForm: true,
			SimpleChineseTitle: this.SimpleChineseTitle || this.Hint,
		});
		this.items = items;
		this._afterInitWidget();
	},
	_afterInitWidget: function () {
		this.TitleWidth=0;
		var _this = this;
		this.numCols = 1;
		isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(_this, null, null, function (record) {
			isc.DataBindingUtil.setWidgetValue(_this, record);
		});
		isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(_this, null, null, function () {
			isc.DataBindingUtil.clearWidgetValue(_this);
		});
		var handler = function (itemCode, eventCode, args) {
			_this[eventCode]();
		}
		_this.registerItemEventHandler(handler);

		_this.registerV3ExpressionHandler(this._expressionHandler);
	},
	// **
	// 给检索的值
	// @param {String}
	// val 全值
	// *
	setItemValue: function (val) {
		this.items.last().setValue(val);
	},
	getColumnName: function () {
		return this.ColumnName;
	},
	/**
	 * 获取值
	 */
	getV3Value: function () {
		return this.items.last().getValue();
	},
	/**
	 * 获取焦点(支持光标跳转控制规则)
	 */
	setControlFocus: function () {
		this.items.last().focusInItem(); //多个item的情况,默认跳到第一个item内
	},

	_functionEventEnter: function (obj, item) {

		if (event.keyCode == 13) {
			this._callEvent(this, 'click');
		}
		this._callEvent(this, 'keydown');
	},
	/**
	 * 设置只读状态
	 * @param readOnly 只读状态
	 */
	setReadOnly: function (readOnly) { },
	setHandleReadOnly: function (readOnly) { },

	updatePropertys: function (params) {
		var propertyMap = params.propertys;
		var widget = params.widget;
		var propertys = propertyMap.Properties;
		if (propertys) {
			for (var property in propertys) {
				if (propertys.hasOwnProperty(property)) {
					var val = propertys[property];
					if ((property == "MultiWidth" || property == "MultiHeight") && typeof (val) == "number") {
						widget[key] = val + "";
					} else if (property == "RowWidthMode" && val == "PercentWidth") {
						for (var i = 0, len = widget.fields.length; i < len; i++) {
							var field = widget.fields[i];
							var width = Math.floor((parseInt(field.width) / parseInt(widget.Width) * 10000) / 100) + "%";
							field.width = width;
						}
					} else {
						widget[property] = propertys[property];
					}
				}
			}
		}
	},


	setV3Value: function (propertyValue) {
		this.setItemValue(propertyValue);
	},

	setEnabled: function (state) {
		this.setItemEnabled && this.setItemEnabled(state);
	},

	cleanSelectedControlValue: function (onlyCleanSelectedRecord) {
		this.setV3Value("");
	},

	getV3MethodMap: function(){
		return {
			getValue: "getV3Value",
			setValue: "setV3Value",

		}
	}
});








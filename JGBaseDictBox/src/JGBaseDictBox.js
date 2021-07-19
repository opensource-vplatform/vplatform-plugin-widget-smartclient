/**
 * 弹出选择
 * @class JGBaseDictBox
 * @extends JGBaseFormWidget
 * @example
 * isc.JGBaseDictBox.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGBaseDictBox", "JGBaseFormWidget");

// 定义v3ui控件属性
isc.JGBaseDictBox.addProperties({
	/**
	 * 标识字段
	 */
	IDColumnName: null,
	/**
	 * 上边距
	 */
	Top: 0,
	/**
	 * 名称
	 */
	Name: null,
	/**
	 * 顺序号
	 */
	TabIndex: '',
	/**
	 * 简体中文标题
	 */
	SimpleChineseTitle: '',
	/**
	 * 只读标记
	 */
	ReadOnly: false,
	/**
	 * 左边距
	 */
	Left: 0,
	/**
	 * 高度
	 */
	Height: 50,
	/**
	 * 必填标记
	 */
	IsMust: false,
	/**
	 * 显示字段
	 */
	ColumnName: null,
	/**
	 * 显示格式
	 */
	DisplayFormat: null,
	/**
	 * 显示标记
	 */
	Visible: true,
	/**
	 * 使能标记
	 */
	Enabled: false,

	_form: null,

	// 事件注册
	listener: ['keydown', 'change', 'focus', 'blur', 'titleClick', 'layerClck', "iconClick"],
	WidgetStyle: "JGBaseDictBox"

});

isc.JGBaseDictBox.addMethods({
	_initProperties: function (properties) {
		this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
		this.className += " JGBaseDictBox";
		this.items = [isc.addProperties(properties, {
			type: "V3BaseDictBoxItems",
			isAbsoluteForm: true
		})];
	},
	/*
	 **验证提示信息
	 */
	showError: function () {},
	hideError: function () {},
	//放在容器中按布局排版时缩放
	resized: function (deltaX, deltaY) {
		this.Super("resized", arguments);
		if (this.Dock != "None") {
			var allWidth = this.getWidth();
			var titleWidth = this.TitleWidth;
			//没有标签是否显示，只有标签宽度
			var valueItemWidth = titleWidth && titleWidth > 0 ? (allWidth - titleWidth) : allWidth;
			var item = this.getItems()[0];
			if (item) {
				if (item.setWidth) {
					item.setWidth(valueItemWidth);
				}
				if (item.items && item.items[0] && item.items.setWidth) {
					item.setWidth(valueItemWidth - 2);
				}
			}
		}
	},
	getItem: function (field) {
		var item = this.Super("getItem", arguments);
		if (!item && field == "id" && this.IsEdit) { //可编辑下，没有id的item会多次新增记录的问题
			item = {
				isSetToDefaultValue: function () {}
			};
		}
		return item;
	},
	getBindFields: function () {
		return [this.IDColumnName, this.ColumnName];
	},
	setColumnName: function (value) {
		var refield = this.ColumnName;
		var record = {}
		record[refield] = value;
		this.setWidgetData(widgetId, record);
	},

	setIDColumnName: function (value) {
		var refield = this.IDColumnName;
		var record = {}
		record[refield] = value;
		this.setWidgetData(widgetId, record);
	},

	getIDColumnName: function () {
		return this.IDColumnName;
	},

	getColumnName: function () {
		return this.ColumnName;
	},

	getVal: function (columnName) {
		var record = this.getWidgetData();
		if (record) {
			var value = record[columnName];
			if (undefined == value || null == value)
				return "";
			return value;
		}
		return "";
	},

	getText: function () {
		return this.getVal(this.ColumnName);
	},

	getV3IdValue: function () {
		return this.getVal(this.IDColumnName);
	},

	setV3Value: function (value) {
		var record = this.getWidgetData() || {};
		record[this.IDColumnName] = value;
		this.setWidgetData(record);
	},

	setReadOnly: function (state) {
		this._$readOnly = state;
		this.Super("setReadOnly", arguments);
	},

	getReadOnly: function () {
		return this.isReadOnly();
	},

	setEnabled: function (state) {
		this.setItemEnabled(state);
	},

	getVisible: function () {
		return this.isVisible();
	},

	cleanSelectedControlValue: function (cleanSelected) {
		this.clearWidgetBindDatas(cleanSelected);
	},

	setLabelText: function (title) {
		this.setSimpleChineseTitle(title);
	},

	getLabelText: function () {
		return this.getSimpleChineseTitle();
	},

	setV3Focus: function () {
		this.setControlFocus();
	},

	getV3MethodMap: function () {
		return {
			setFocus: "setV3Focus",
			setValue: "setV3Value",
			getValue: "getV3IdValue"
		};
	}

});
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
		this._initEventAndDataBinding();
	},

	_filterData: function(fields,record){
		var rs = {};
		for(var i=0,l=fields.length;i<l;i++){
			var field = fields[i];
			if(record.hasOwnProperty(field)){
				rs[field] = record[field];
			}
		}
		rs.id = record.id;
		return rs;
	},

	_initEventAndDataBinding: function(){
        var _this = this;
        isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function(record) {
			//复制已有的数据，然后再添加/修改数据，最后同步到vm，不然出现数据被清空的情况
			var oldValues = _this.getValues();
			var newValues = {};
			if(oldValues){
				Object.assign(newValues, oldValues);
			}
			var fields = _this.getBindFields();
			var recordData = _this._filterData(fields,record);
			for(var key in recordData){
				if(recordData.hasOwnProperty(key)){
					newValues[key] = recordData[key];
				}
			}
			_this.setValues(newValues);
		});
		isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(this, null, null, function() {
			isc.DataBindingUtil.clearWidgetValue(_this);
		});
        isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded);
		isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(this, null, this.OnValueChanged);
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
		isc.WidgetDatasource.setSingleRecordMultiValue(this, record);
	},

	setIDColumnName: function (value) {
		var refield = this.IDColumnName;
		var record = {}
		record[refield] = value;
		isc.WidgetDatasource.setSingleRecordMultiValue(this, record);
	},

	getIDColumnName: function () {
		return this.IDColumnName;
	},

	getColumnName: function () {
		return this.ColumnName;
	},

	getVal: function (columnName) {
		var record = widgetDatasource.getSingleValue(this, columnName);
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
		var record = {};
		record[this.IDColumnName] = value;
		isc.WidgetDatasource.setSingleRecordMultiValue(this, record);
	},

	getDefaultValue: function() {
		var retMap = {};
		var retValue = null;
		var retText = null;
		var data = this.DropDownSource;
		if (data) {
			if (typeof data !== "object")
				data = isc.JSON.decode(data);
			var constData = data.uiData;
			if (constData) {
				for (var i = 0; i < constData.length; i++) {
					var data = constData[i];
					if (data["default"] == true) {
						retValue = data["id"];
						retText = data["text"];
						break;
					}
				}
			}
			retMap[widget.IDColumnName] = retValue;
			retMap[widget.ColumnName] = retText;
		}
		return retMap;
	},

	setReadOnly: function (state) {
		this._$readOnly = state;
		this.Super("setReadOnly", arguments);
	}

});
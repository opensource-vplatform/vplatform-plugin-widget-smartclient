/**
 * 弹出选择
 * @class JGBaseDictBox
 * @extends JGBaseFormWidget
 * @example
 * var ds = isc.V3Datasource.create({
	fields:[{
		name: "id",
		primaryKey:true,
		type: "text",
		title: "主键id"
	},{
		name: "a",
		type: "text",
		title: "字段a"
	},{
		name: "b",
		type: "text",
		title: "字段b"
	}]
});
var info = isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton3",
    SimpleChineseTitle: "事件信息",
    Height: 88,
    Width: 390,
    Top: 122,
    Left: 485
});
var ipt = isc.JGBaseDictBox.create({
    autoDraw: true,
    Code: "JGBaseDictBox311",
	SimpleChineseTitle:" 使能",
    Top: 80,
    Left: 485,
	Width:235,
	Height:26,
	Enabled:true,
	Visible:true,
	LabelWidth:94,
	OnValueChanged: function () {
		info.setSimpleChineseTitle("值改变事件触发！");
	},
	OnValueLoaded: function () {
		info.setSimpleChineseTitle("值加载事件触发！");
	},
	OnEnter: function () {
		info.setSimpleChineseTitle("焦点获取事件触发！");
	},
	OnLeave: function () {
		info.setSimpleChineseTitle("焦点离开事件触发！");
	},
	OpenModuleAction: function () {
		info.setSimpleChineseTitle("链接事件触发！");
	},
	OnLabelClick: function () {
		info.setSimpleChineseTitle("标题点击事件触发！");
	},
	TableName:ds,
	IDColumnName:"a",
	ColumnName: "b"
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton2111",
    SimpleChineseTitle: "使能",
    Width: 59,
    Top: 80,
    Left: 816,
	OnClick:function(){
		ipt.setEnabled(true);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton221",
    SimpleChineseTitle: "禁用",
    Width: 59,
    Top: 80,
    Left: 741,
    OnClick: function () {
		ipt.setEnabled(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton22",
    SimpleChineseTitle: "只读",
    Width: 59,
    Top: 48,
    Left: 741,
    OnClick: function () {
		ipt1.setReadOnly(true);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton211",
    SimpleChineseTitle: "编辑",
    Width: 59,
    Top: 48,
    Left: 816,
    OnClick: function () {
		ipt1.setReadOnly(false);
	}
});
var ipt1 = isc.JGBaseDictBox.create({
    autoDraw: true,
    Code: "JGBaseDictBox31",
    SimpleChineseTitle: "只读",
    Top: 48,
    Left: 485,
	Width:235,
	Height:26,
	Enabled:true,
	Visible:true,
	LabelWidth:94
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton21",
    SimpleChineseTitle: "隐藏",
    Width: 59,
    Top: 16,
    Left: 816,
    OnClick: function () {
		ipt2.setVisible(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton2",
    SimpleChineseTitle: " 显示 ",
    Width: 59,
    Top: 16,
    Left: 741,
	OnClick:function(){
		ipt2.setVisible(true);
	}
});
var ipt2 = isc.JGBaseDictBox.create({
    autoDraw: true,
    Code: " JGBaseDictBox3 ",
    SimpleChineseTitle: " 显示 ",
    Top: 16,
    Left: 485,
	Width:235,
	Height:26,
	Enabled:true,
	Visible:true,
	LabelWidth:94
});
isc.JGButton.create({
    autoDraw: true,
    Code: " JGButton1 ",
    SimpleChineseTitle: "改值",
    Width: 59,
    Top: 90,
    Left: 282,
	OnClick:function(){
		var record = ds.getCurrentRecord();
        if (!record) {
            record = ds.createRecord();
            datasource.insertRecords([ record ]);
            record = datasource.getRecordById(record.id);
        }
        record = {
            id : record.id
        }; 
        record.a = "aa";
		record.b = "bb";
        ds.updateRecords([ record ]);
	}
});
isc.JGBaseDictBox.create({
    autoDraw: true,
    Code: " JGBaseDictBox2 ",
    SimpleChineseTitle: " 弹出选择 ",
    Top: 91,
    Left: 19,
	Width:235,
	Height:26,
	Enabled:true,
	Visible:true,
	LabelWidth:94,
	TableName:ds,
	IDColumnName:"a",
	ColumnName:"b"
});
isc.JGBaseDictBox.create({
    autoDraw: true,
    Code: "JGBaseDictBox1",
    SimpleChineseTitle: "弹出选择",
    Width: 325,
    Height: 50,
    Top: 16,
    Left: 19,
	Enabled:true,
	Visible:true,
    LabelWidth:150,
	Placeholder:"提醒文字"
});
ds.load([{
	id : "1",
	a : "a",
	b : "b"
}]);
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
/**
 * v平台布尔控件
 * @class JGCheckBox
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
		type: "boolean",
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
			type: "boolean",
			title: "字段a"
		}]
	});
}

var info = isc.JGButton.create({
    autoDraw: true,
	Code:"JGButton6",
	SimpleChineseTitle:"事件信息",
	Height:69,
	Width:377,
	Top:131,
	Left:494,
});

isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox10",
    SimpleChineseTitle: "布尔",
    Top: 199,
    Left: 3,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	LabelVisible:true,
    TableName: ds,
    ColumnName: "a",
    Value: false
});
isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox9",
    SimpleChineseTitle: "布尔",
    Top: 167,
    Left: 4,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	LabelVisible:true,
    Value: false
});
isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox8",
    SimpleChineseTitle: "浮动-提醒",
    Top: 125,
    Left: 4,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	LabelVisible:true,
    ToolTip: "&quot;浮动提示&quot;",
    Placeholder: "提醒文字",
    Value: false
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton4",
    SimpleChineseTitle: "改值",
    Width: 59,
    Top: 98,
    Left: 747,
    OnClick: function () {
		var record = ds.getCurrentRecord();
        if (!record) {
            record = ds.createRecord();
            datasource.insertRecords([ record ]);
            record = datasource.getRecordById(record.id);
        }
        var data = {
            id : record.id
        }; 
        data.a = !record.a;
        ds.updateRecords([ data ]);
	},
});
isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox7",
    SimpleChineseTitle: "布尔",
    Top: 99,
    Left: 494,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	TableName:ds,
	ColumnName:"a",
	LabelVisible:true,
    Value: false
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton22",
    SimpleChineseTitle: "使能",
    Width: 59,
    Top: 67,
    Left: 812,
    OnClick: function () {
		chk.setEnbabled(true);
	},
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton3",
    SimpleChineseTitle: "禁用",
    Width: 59,
    Top: 66,
    Left: 747,
    OnClick: function () {
		chk.setEnbabled(false);
	},
});
var chk = isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox6",
    SimpleChineseTitle: "使能",
    Top: 67,
    Left: 494,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	LabelVisible:true,
	TableName:ds,
	ColumnName:"a",
    OnValueChanged: function () {
		info.setSimpleChineseTitle("值改变事件触发！");
	},
    OnValueLoaded: function () {
		info.setSimpleChineseTitle("值加载事件触发！");
	},
    OnLabelClick: function () {
		info.setSimpleChineseTitle("标题点击事件触发！");
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton21",
    SimpleChineseTitle: "编辑",
    Width: 59,
    Top: 35,
    Left: 812,
    OnClick: function () {
		chk1.setReadOnly(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton2",
    SimpleChineseTitle: "只读",
    Width: 59,
    Top: 35,
    Left: 747,
    OnClick: function () {
		chk1.setReadOnly(true);
	}
});
var chk1 = isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox5",
    SimpleChineseTitle: "只读",
    Top: 35,
    Left: 494,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	LabelVisible:true,
    Value: false
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton11",
    SimpleChineseTitle: "隐藏",
    Width: 59,
    Top: 3,
    Left: 812,
    OnClick: function () {
		chk2.setVisible(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton1",
    SimpleChineseTitle: "显示",
    Width: 59,
    Top: 3,
    Left: 747,
    OnClick: function () {
		chk2.setVisible(true);
	}
});
var chk2 = isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox4",
    SimpleChineseTitle: "显示",
    Top: 3,
    Left: 494,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	LabelVisible:true,
    Value: false
});
isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox3",
    SimpleChineseTitle: "布尔",
    Top: 93,
    Left: 4,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
    LabelVisible: false,
    Value: false
});
var chk6 = isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox2",
    SimpleChineseTitle: "默认值true",
    Top: 60,
    Left: 4,
	Width:235,
	Height:26,
	LabelWidth:94,
	Enabled:true,
	Visible:true,
	TableName:createTempDS("ColumnName"),
	ColumnName:"ColumnName",
	LabelVisible:true,
    DefaultValue: true
});

chk6.setV3Value(chk6.getDefaultValue());

isc.JGCheckBox.create({
    autoDraw: true,
    Code: "JGCheckBox1",
    SimpleChineseTitle: "标题宽度",
    Width: 286,
    Height: 50,
    Top: 3,
    Left: 3,
	Enabled:true,
	Visible:true,
    LabelWidth: 150,
	LabelVisible:true,
    Value: false
});
ds.load([{
	id : "1",
	a : true
}]);
 */
isc.ClassFactory.defineClass("JGCheckBox", "JGBaseFormWidget");
isc.addGlobal("JGCheckBox", isc.JGCheckBox);

isc.JGCheckBox.addProperties({

    TableName: null,

    listener: [
        'change',

        'focus',

        'blur',

        'keydown',

        'click',

        'titleClick',

        'labelclick'
    ],
    WidgetStyle: "JGBoxGroup"
});


isc.JGCheckBox.addMethods({

    _initProperties: function (properties) {
        this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
        this.className += " JGCheckBox";
        this.items = [isc.addProperties(properties, {
            type: "V3CheckBoxItems",
            isAbsoluteForm: true,
        })];
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

    /**
     * 根据isCheck的值,使变checkbox是否选中
     * 
     * @param {boolean}
     *            isCheck 是否选中 true/false
     */
    setChecked: function (isCheck) {
        this.setValue(isCheck);
    },
    //清除校验导致值改变触发两次
    clearErrors: function () {},
    /**
     * 根据传入的值,返回该ITEM是否被选中
     * @return {boolean}
     * 			  是否选中
     */
    isChecked: function () {
        var item = this._form.getItem();
        return item._value;
    },

    getDefaultValue: function () {
        var value = isc.WidgetDatasource.getSingleColumnWidgetDefaultValue(this);
        if ("" == value) {
            var reMap = {};
            reMap[this.ColumnName] = false;
            return reMap;
        }
        return value;
    },

    getV3Value: function () {
        var value = isc.WidgetDatasource.getSingleValue(this);
        if (undefined == value || null == value) {
            return false;
        }
        if(typeof value == "string"){
			if(value.toLocaleLowerCase() == "true")
				value = true;
			else
				value = false;
		}
		return value;
    },

    getBindFields: function(){
        return [this.ColumnName];
    }

});
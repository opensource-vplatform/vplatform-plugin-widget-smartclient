/**
 * v平台文本控件
 * @class JGTextBox
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
			type: "text",
			title: "字段a"
		}]
	});
}

var txt = isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox15",
    SimpleChineseTitle: "改实体值",
    Top: 198,
    Left: 376,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	TableName:ds,
	ColumnName:"a"
});

isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton11",
    SimpleChineseTitle: "改实体值",
    Width: 77,
	Top:198,
	Left:618,
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
        record.a = "test";
        ds.updateRecords([ record ]);
	}
});
isc.JGTextBox.create({
	autoDraw:true,
	Code:"JGTextBox14",
	SimpleChineseTitle:"浮动 - 提醒",
	Width:358,
	Height:50,
	Visible:true,
	Enabled:true,
    Top: 238,
    Left: 376,
	LabelWidth:150,
	ToolTip:"\"浮动提示\"",
	Placeholder:"提醒文字"
});

var info = isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton10",
    SimpleChineseTitle: "事件信息",
	Height:56,
    Width: 235,
	Top:232,
	Left:4
});

isc.JGButton.create({
	autoDraw:true,
	Code:"JGButton9",
	SimpleChineseTitle:"改控件值",
	Width:77,
    Top: 166,
    Left: 618,
	OnClick:function(){
		txt1.setV3Value("test");
	}
});

var txt1 = isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox13",
    SimpleChineseTitle: "该值",
    Top: 167,
    Left: 376,
	Visible:true,
	Width:235,
	Height:26,
	Enabled:true,
	ColumnName: "ColumnName",
	TableName:createTempDS("ColumnName")
});

isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton6",
    SimpleChineseTitle: "设置标题",
    Width: 77,
	Top:100,
	Left:618,
	OnClick:function(){
		txt2.setSimpleChineseTitle("标题已改变");
	}
});

var txt2 = isc.JGTextBox.create({
	autoDraw:true,
	Code:"JGTextBox11",
	SimpleChineseTitle:"设置标题",
	Top:101,
	Left:376,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true
});

isc.JGButton.create({
	autoDraw:true,
	Code:"JGButton51",
	SimpleChineseTitle:"不只读",
	Width:65,
    Top: 68,
    Left: 684,
	OnClick:function(){
		txt3.setReadOnly(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton5",
    SimpleChineseTitle: "只读",
    Width: 59,
	Top:67,
	Left:618,
	OnClick:function(){
		txt3.setReadOnly(true);
	}
});

var txt3 = isc.JGTextBox.create({
	autoDraw:true,
	Code:"JGTextBox10",
	SimpleChineseTitle:" 只读 - 标题事件 ",
	Top:68,
	Left:376,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	OnLabelClick:function(){
		info.setSimpleChineseTitle("键盘按下！");
	}
});

var txt4 = isc.JGTextBox.create({
	autoDraw:true,
	Code:"JGTextBox9",
	SimpleChineseTitle:"显示",
	Top:36,
	Left:376,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true
});

isc.JGButton.create({
	autoDraw:true,
	Code:" JGButton41 ",
	SimpleChineseTitle:" 不显示 ",
	Width:65,
    Top: 35,
    Left: 684,
	OnClick: function(){
		txt4.setVisible(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton4",
    SimpleChineseTitle: "显示",
    Width: 59,
	Top:36,
	Left:618,
	OnClick: function(){
		txt4.setVisible(true);
	}
});

isc.JGButton.create({
	autoDraw:true,
	Code:" JGButton3 ",
	SimpleChineseTitle:" 不使能 ",
	Width:65,
    Top: 3,
    Left:684,
	OnClick:function(){
		txt5.setEnabled(false);
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton2",
    SimpleChineseTitle: "使能",
    Width: 59,
	Top:3,
	Left:618,
	OnClick:function(){
		txt5.setEnabled(true);
	}
});
var txt5 = isc.JGTextBox.create({
	autoDraw:true,
	Code:" JGTextBox8 ",
	SimpleChineseTitle:" 使能 - 标题事件 ",
	Top:4,
	Left:376,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	OnLabelClick:function(){
		info.setSimpleChineseTitle("键盘按下！");
	}
});

isc.JGTextBox.create({
	autoDraw:true,
	Code:" JGTextBox7 ",
	SimpleChineseTitle:" 失去焦点 ",
	Top:167,
	Left:4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	OnLeave:function(){
		info.setSimpleChineseTitle("失去焦点！");
	}
});

isc.JGButton.create({
	autoDraw:true,
	Code:" JGButton1 ",
	SimpleChineseTitle:" 按钮1 ",
	Width:59,
    Top: 134,
    Left: 258
});
isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox6",
    SimpleChineseTitle: "获取焦点",
    Top: 134,
    Left: 4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	OnEnter:function(){
		info.setSimpleChineseTitle("获取焦点！");
	}
});
isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox5",
    SimpleChineseTitle: "键盘按下",
    Top: 199,
    Left: 4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	OnKeyDown:function(){
		info.setSimpleChineseTitle("键盘按下！");
	}
});
isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox4",
    SimpleChineseTitle: "单击标题",
    Top: 101,
    Left: 4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	OnLabelClick:function(){
		info.setSimpleChineseTitle("标题点击事件触发！");
	}
});
isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox3",
    SimpleChineseTitle: "值加载",
    Top: 68,
    Left: 4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	ValueForeColor:"#ff0000",
	OnValueLoaded:function(){
		info.setSimpleChineseTitle("值加载事件触发！");
	}, 
	TableName:ds,
	ColumnName:"a"
});
isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox2",
    SimpleChineseTitle: "值改变",
    Top: 36,
    Left: 4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	TableName:ds,
	ColumnName:"a",
	OnValueChanged:function(){
        info.setSimpleChineseTitle("值改变事件触发！");
	}
});
var txt6 = isc.JGTextBox.create({
    autoDraw: true,
    Code: "JGTextBox1",
    SimpleChineseTitle: "默认值",
    Top: 4,
    Left:4,
	Width:235,
	Height:26,
	Visible:true,
	Enabled:true,
	DefaultValue:"\"我是默认值\"",
	ColumnName:"ColumnName",
	TableName:createTempDS("ColumnName")
});
txt6.setV3Value(txt6.getDefaultValue());
ds.load([{
	id : "1",
	a : "a"
}]);
 */
isc.ClassFactory.defineClass("JGTextBox", "JGBaseFormWidget");

isc.JGTextBox.addProperties({
    /**
     * 是否必填
     * @memberof JGTextBox
     * @property {Boolean}
     * @instance
     */
    IsMust: false,
    /**
     * 标题宽度
     * @memberof JGTextBox
     * @property {Integer}
     * @instance
     */
    LabelWidth: 94,
    /**
     * 高度
     * @memberof JGTextBox
     * @property {Integer}
     * @instance
     */
    Height: 26,
    //最大输入长度
    TextLength: 50,
    //是否显示
    Visible: true,
    //只读
    ReadOnly: false,
    //使能
    Enabled: true,
    //标题宽度
    TitleWidth: 76,
    //
    //LabelTextAlign: 'center',
    //JGTextBox提供的事件列表
    //listener:['change','focus','blur','keydown','click','titleClick','mouseover'],
    //绑定字段名称
    ColumnName: 'columnName',
    WidgetStyle: "JGTextBox",

    //事件监听队列
    listener: ['OnValueLoaded','OnValueChanged','OnLabelClick', 'OnKeyDown', 'OnEnter', 'OnLeave']
});

isc.JGTextBox.addMethods({

    _initProperties: function (properties) {
        this.TitleWidth = this.LabelWidth;
        this.TitleVisible = this.LabelVisible;
        if (this.WidgetStyle == "JGTextBox") {
            this.WidgetStyle = "JGForm"
        }
        // 处理文字内容格式化
        var valueFormats = this._decodeValueFormat(this.ValueFormat),
            valueFormat = valueFormats ? valueFormats[0] : null,
            //_fixedValuePos = valueFormats ? valueFormats[1] : "",
            _valueFormat = valueFormat !== null && valueFormat !== "" ? valueFormat : null;

        this.items = [isc.addProperties(properties, {
            type: "V3TextItems",
            isAbsoluteForm: true,
            mask: _valueFormat,
            maskBackUp: _valueFormat, //用于处理从只读到非只读时，重新获取对应的信息
        })]
        this._initEventAndDataBind();
    },
    _initEventAndDataBind: function(){
        var _this = this;
        isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(_this, null, null, function(record) {
			isc.DataBindingUtil.setWidgetValue(_this,record);
		});
		isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(_this, null, null, function() {
			isc.DataBindingUtil.clearWidgetValue(_this);
		});
        isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded);
		isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(this, null, this.OnValueChanged);
    },
    _decodeValueFormat: function (valFormat) {
        if (!(valFormat && valFormat !== ""))
            return null;
        var _valFormat = JSON.parse(valFormat).ValueFormat;
        var len = _valFormat ? _valFormat.length : 0;
        if (len === 0)
            return null;
        var _result = "",
            _fixedCharPos = ",",
            _results = [],
            lastLen = -1;
        for (var i = 0; i < len; i++) {
            var tmpVar = _valFormat[i];
            var tmpConValue = this._convertMaskRule(tmpVar);
            var length = (tmpVar.Valuelength ? tmpVar.Valuelength : 1);
            if (tmpVar.Type === "FixedCharacter") {
                lastLen += tmpVar.Value.length;
            } else if (tmpVar.Type === "Separator") {
                for (var j = 0, num = tmpVar.Value.length; j < num; j++) {
                    _fixedCharPos += (lastLen + j + 1) + ",";
                }
                lastLen = lastLen + tmpVar.Value.length;
            } else
                lastLen += tmpVar.Valuelength
            _result += tmpConValue
        }
        _results.push(_result);
        _results.push(_fixedCharPos);
        return _results
    },
    _convertMaskRule: function (value) {
        var result = "",
            caseResult = "",
            tmpcurMaskValue = "",
            curMaskType = value.Type,
            curMaskValue = value.Value,
            curMaskValLimit = value.ValueLimit,
            curMaskLength = value.Valuelength;

        if (curMaskValLimit === "Lowercase")
            caseResult = "<"
        else if (curMaskValLimit === "Upercase")
            caseResult = ">"

        if (curMaskType === "Digit") {
            for (var i = 0; i < curMaskLength; i++)
                result += "#"
        } else if (curMaskType === "AnyCharacter") {
            for (var i = 0; i < curMaskLength; i++)
                result += caseResult + "C"
        } else if (curMaskType === "Character") {
            for (var i = 0; i < curMaskLength; i++)
                result += caseResult + "[a-zA-Z]"
        } else if (curMaskType === "FixedCharacter") {
            var curMaskValues = curMaskValue.split("");
            for (var i = 0, len = curMaskValues.length; i < len; i++) {
                // if(curMaskValues[i].trim() == " ")
                // 	curMaskValues[i].replace(" ", "&nbsp;");
                tmpcurMaskValue += "\\" + curMaskValues[i] + "";
            }
            result += tmpcurMaskValue;
        } else if (curMaskType === "Separator") {
            var curMaskValues = curMaskValue.split("");
            for (var i = 0, len = curMaskValues.length; i < len; i++)
                tmpcurMaskValue += "\\" + curMaskValues[i];
            result += tmpcurMaskValue;
        }

        return result;
    },

    /**
     * 设置控件值
     * @param val 控件值
     */
    setItemValue: function (val) {
        val = (val != undefined && val != null) ? val : '';
        this.items.last().setValue(val);
    },

    getBoundFieldNames: function () {
        return [this.ColumnName];
    },

    getBindFields : function(){
        return this.getBoundFieldNames();
    },

    destroy: function () {
        isc.EventHandler.clearWidgetRef(this.ID);
        this.Super("destroy", arguments);
    }
});
/**
 * v平台文本控件
 * @class JGTextBox
 * @extends JGBaseFormWidget
 * @example
 * isc.JGTextBox.create({
 *  autoDraw : true
 * });
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
/**
 * 单选组控件
 * @class JGRadioGroup
 * @extends JGGroupItem 
 * @mixes IWindowAop
 * @example
 * isc.JGRadioGroup.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGRadioGroup", "JGGroupItem");
isc.ClassFactory.mixInInterface("JGRadioGroup", "IWindowAop");
isc.addGlobal("JGRadioGroup", isc.JGRadioGroup);

isc.JGRadioGroup.addProperties({
	TableName: "",
	WidgetStyle: "JGBoxGroup",
	dropdownSourceHandler: function(){}
});

isc.JGRadioGroup.addMethods({
	_initProperties: function (properties) {
		this.TitleTextAlign = properties.LabelTextAlign;
		this.TitleVisible = properties.LabelVisible;
		this.TitleWidth = properties.LabelWidth;
		this.type = "VRadioGroup";
		this.textField = "";
		this.valueField = "";
		if (properties.IDColumnName)
		this.textField = properties.IDColumnName;
		else {
			this.IDColumnName = "IDColumnName";
			this.textField = "IDColumnName";
		}
		if (properties.ColumnName)
		this.valueField = properties.ColumnName;
		else {
			this.valueField = "ColumnName";
			this.ColumnName = "ColumnName";
		}
		this.multiple = false; //如果是下拉,则需要这个参数
		//tabIndex特殊处理，因为有两个子item（其中一个为隐藏的），多了2
		if (properties.TabIndex >= 2) {
			this.TabIndex = properties.TabIndex - 2;
		}
		if (properties.ColumnName) {
			this.textField = properties.ColumnName;
		} else {
			this.textField = "ColumnName";
			this.ColumnName = "ColumnName";
		}
		if (properties.IDColumnName) {
			this.valueField = properties.IDColumnName;
		} else {
			this.IDColumnName = "IDColumnName";
			this.valueField = "IDColumnName";
		}
		this.NumCols = 1;//内部使用表单布局
		this.className += " JGRadioGroup";
		this.items = [isc.addProperties(properties, {
			type: "V3RadioGroupItems",
			isAbsoluteForm: true
		})];
		this._initEventAndDataBinding();
		this._observerDropdownSource();
	},

	_initEventAndDataBinding: function(){
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function(record) {
			isc.DataBindingUtil.setWidgetValue(_this, record);
			if(_this.hasErrors()&&_this.values && _this.values[_this.IDColumnName] && _this.values[_this.IDColumnName] != ""){
            	_this.clearErrors();
                _this.redraw();
            }
		});
		isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(this, null, null, function() {
			isc.DataBindingUtil.clearWidgetValue(_this);
			// 特殊处理value清除不干净导致控件下次无法触发值改变
            var groupBoxItem = _this.getItems().last();
            var vRadioGroupItem = groupBoxItem && groupBoxItem.items && groupBoxItem.items[0];
            if (vRadioGroupItem)
                vRadioGroupItem.setValue(null);
            if(_this.hasErrors()&&_this.values && _this.values[_this.IDColumnName] && _this.values[_this.IDColumnName] != ""){
            	_this.clearErrors();
                _this.redraw();
            }
		});
		isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded);
		isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(this, [this.IDColumnName], this.OnValueChanged);
	},

	_observerDropdownSource: function(){
		var dropDownSource = this.getDropDownSource();
        if (typeof dropDownSource !== "object") {
			try{
            	dropDownSource = isc.JSON.decode(dropDownSource);
			}catch(e){}
        }
        if (dropDownSource && dropDownSource.DataSourceSetting && dropDownSource.DataSourceSetting.DataSourceType == "Entity") {
            var dataSourceSetting = dropDownSource.DataSourceSetting;
            var dataConfig = dataSourceSetting.DataConfig;
            var entityName = dataConfig.SourceName;
            if (entityName) {
				var datasource = isc.JGDataSourceManager.get(this,entityName);
				if(datasource){
					var _this = this;
					//DB加载
					datasource.on(datasource.Events.LOAD,null,function(){
						_this.dropdownSourceHandler();
					});
					//DB新增
					datasource.on(datasource.Events.INSERT,null,function(){
						_this.dropdownSourceHandler();
					});
					//DB删除
					datasource.on(datasource.Events.DELETE,null,function(){
						_this.dropdownSourceHandler();
					});
				}
            }
        }
	},
	/**
	 * 过滤更新事件
	 * 只有当标识字段更改了才触发更新事件
	 * @memberof JGRadioGroup
	 * @method
	 * @instance
	 * @param {Object} changed 更改记录
	 * @returns {Boolean}
	 */
	filterChanged: function(changed){
		return changed&&changed.hasOwnProperty(this.IDColumnName);
	},
	/**
	 * 根据传入的值,选中
	 */
	setChecked: function (newValue, isCheck) {
		var radio = this._form.getItem()
		var item = radio.itemForValue(newValue);
		var element = item.getDataElement();
		item.setElementValue(newValue);
		item.updateValue();
		item._handleElementChanged();
		return element.checked = isCheck;
	},
	getBindFields: function(){
		return [this.IDColumnName,this.ColumnName];
	},
	/**
     * 提供获取备选项数据源的接口
     */
	 setDropDownSource: function(dropdownSource) {
		 this.DropDownSource = dropdownSource;
    },

    /**
     * 提供获取备选项数据源的接口
     */
    getDropDownSource: function() {
        return this.DropDownSource;
    },

    getIDColumnName: function() {
        return this.IDColumnName;
    },

    getColumnName: function() {
        return this.ColumnName;
    },

    setV3Value: function(val) {
        var record = {}
        record[this.IDColumnName] = val;
        isc.WidgetDatasource.setSingleRecordMultiValue(this, record);
    },

    getDefaultValue: function() {
        var retMap = {};
        var retValue = null;
        var retText = null;
        var data = this.DropDownSource;
        if (typeof data !== "object"){
			try{
            	data = isc.JSON.decode(data);
			}catch(e){}
		}
        // 从uiData中获取常量
        var constData = data && data.uiData;
        if (constData && constData.length > 0) {
            for (var i = 0; i < constData.length; i++) {
                var data = constData[i];
                if (data["default"] == true) {
                    retValue = data["id"];
                    retText = data["text"]
                }
            }
        }
        retMap[this.IDColumnName] = retValue;
        retMap[this.ColumnName] = retText;
        return retMap;
    },

    getConstData: function(dataSourceSetting) {
        var data;
        var dataConfig = dataSourceSetting.DataConfig;
        if (dataConfig) {
            switch (dataSourceSetting.DataSourceType) {
                case "Entity":
                    if (dataConfig.EntityConstData) {
                        data = dataConfig.EntityConstData.ConstData;
                    }
                    break;
                case "TableQuery":
                    if (dataConfig.SqlQueryConstData) {
                        data = dataConfig.SqlQueryConstData.ConstData;
                    }
                    break;
                case "CustomConst":
                    if (dataConfig) {
                        data = dataConfig.ConstData;
                    }
                    break;
                default:
                    break;
            }
        }
        return data;
    },

    setDefaultRecord: function() {
		var data = this.getDefaultValue();
		if (data){
			this.setWidgetData(data);
		}
    },

    getV3Value: function() {
        var datasource = isc.WidgetDatasource.getDatasource(this);
        var record = datasource.getCurrentRecord();
        if (record) {
            return record[this.IDColumnName];
        } else {
            return "";
        }
    },

    getText: function() {
		var datasource = isc.WidgetDatasource.getDatasource(this);
        var record = datasource.getCurrentRecord();
        return record[this.ColumnName];
    },

	beforeDataLoad: function(){
		if(this.BeforeDataLoadAction){
			this.BeforeDataLoadAction();
		}
	},

	getV3MethodMap: function(){
		return {
			getValue: "getV3Value",
			setValue: "setV3Value"
		}
	}
});
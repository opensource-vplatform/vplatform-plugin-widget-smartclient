/**
 * 多选组控件
 * @class JGCheckBoxGroup
 * @extends JGGroupItem
 * @mixes IWindowAop
 * @example
 * isc.JGCheckBoxGroup.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGCheckBoxGroup", "JGGroupItem");
isc.ClassFactory.mixInInterface("JGCheckBoxGroup", "IWindowAop");
isc.addGlobal("JGCheckBoxGroup", isc.JGCheckBoxGroup);

isc.JGCheckBoxGroup.addProperties({
	TableName: "",
	WidgetStyle: "JGBoxGroup"

});

isc.JGCheckBoxGroup.addMethods({
	_initProperties: function (properties) {
		this.TitleTextAlign = properties.TitleTextAlign = properties.LabelTextAlign;
		this.TitleVisible = properties.TitleVisible = properties.LabelVisible;
		this.TitleWidth = properties.TitleWidth = properties.LabelWidth;
		this.type = "checkBoxGroup";
		this.multiple = true; // 如果是下拉,则需要这个参数
		this.AutoWrap = false;
		this.textField = "";
		this.valueField = "";
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
		// tabIndex特殊处理，因为有两个子item（其中一个为隐藏的），多了2
		if (properties.TabIndex >= 2) {
			this.TabIndex = properties.TabIndex - 2;
		}
		this.NumCols = 1; //内部使用表单布局
		this.className += " JGCheckBoxGroup";
		var _this = this;
		this.items = [isc.addProperties(properties, {
			type: "V3CheckBoxGroupItems",
			isAbsoluteForm: true,
			getData: function () {
				return _this.getDropDownSource();
			}
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

	getBindFields: function(){
		return [this.IDColumnName,this.ColumnName];
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

	beforeDataLoad: function(){
		if(this.BeforeDataLoadAction){
			this.BeforeDataLoadAction();
		}
	},

	/**
	 * 提供获取备选项数据源的接口
	 */
	 getDropDownSource: function() {
		return this.DropDownSource;
	},

	/**
	 * 提供获取备选项数据源的接口
	 */
	setDropDownSource: function(dropdownSource) {
		this.DropDownSource = dropdownSource;
	},

	getIDColumnName: function() {
		return this.IDColumnName;
	},

	getColumnName: function() {
		return this.ColumnName;
	},

	getV3Value: function() {
		var value = isc.WidgetDatasource.getSingleValue(this, this.IDColumnName);
		if (undefined == value || null == value)
			return "";
		return value;
	},

	setV3Value: function(propertyValue) {
		var record = {}
		record[this.IDColumnName] = propertyValue;
		isc.WidgetDatasource.setSingleRecordMultiValue(this, record);
	},
	
	getSelectedItmesNum: function() {
		if (!this.values[this.IDColumnName]) {
			if (!this.values.IDColumnName) {
				this.SelectedItmesNum = 0;
			} else {
				this.SelectedItmesNum = this.values.IDColumnName.length;
			}

		} else {
			this.SelectedItmesNum = this.values[this.IDColumnName].length;
		}
		return this.SelectedItmesNum;
	},

	_getDefaultValue: function(){
		var retMap = {};
		var retValue = null;
		var retText = null;
		var data =this.DropDownSource;
		if (data) {
			if (typeof data !== "object"){
				try{
					data = isc.JSON.decode(data);
				}catch(e){}
			}
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
			retMap[this.IDColumnName] = retValue;
			retMap[this.ColumnName] = retText;
		}
		return retMap;
	},

	getDefaultValue: function() {
		return this._getDefaultValue();
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
						data = dataConfig.EntityConstData.ConstData;
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
		var data = this._getDefaultValue();
		if (data){
			isc.WidgetDatasource.setSingleRecordMultiValue(data);
		}
    },
	
    getText: function() {
        var datasource = isc.WidgetDatasource.getDatasource(this);
        var record = datasource.getCurrentRecord();
        return record[this.ColumnName];
    },

	getV3MethodMap: function(){
		return {
			getValue: "getV3Value",
			setValue: "setV3Value"
		}
	}
});
isc.JGFormLayout.addMethods({

	getReadOnlyJGComboBox: function (itemCode) {
		return this.getItemReadOnly(itemCode);
	},

	getEnabledJGComboBox: function (itemCode) {
		return this.getItemEnabled(itemCode);
	},
	//TODO
	cleanSelectedControlValueJGComboBox: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	setIsMustJGComboBox: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getLabelTextJGComboBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGComboBox: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGComboBox: function (itemCode) {
		return this.getItemVisible(itemCode);
	},

	getValueJGComboBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGComboBox: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	getTextJGComboBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走统一赋值接口
			return this.getMulitDsText(this.Code, itemCode, "displayField");
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.displayField);
	},

	setReadOnlyJGComboBox: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGComboBox: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGComboBox: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueMapJGComboBox: function (widgetCode, dropDownSource, valueField, textField) {
		var widget = this;
		this._createDropdownSourceObserver({
			"widgetId": widgetCode,
			"dataSource": dropDownSource,
			"valueField": valueField,
			"textField": textField,
			"handler": function (valueMap, defaultValue, params) {
				var formItem = widget.getItemByCode(widgetCode);
				if (!formItem || !formItem.form) {
					return;
				}
				var cacheDatas = (formItem.form.dataSource && formItem.form.dataSource.getCacheData()) || [];
				//            	formItem.clearValue();
				//排序key
				formItem._$OrderKeys = params ? params.keys : null;
				formItem.setValueMap(valueMap);
				formItem.setDefaultVal(defaultValue);
				if (cacheDatas.length > 0) {
					var cacheData;
					for (var i = 0; i < cacheDatas.length; i++) {
						var rec = cacheDatas[i];
						if (formItem.form.values && rec.id == formItem.form.values.id) {
							cacheData = rec;
							break
						}
					}
					if (undefined != cacheData && null != cacheData) {
						var valueInDB = cacheData[formItem.IDColumnName];
						if (undefined != valueInDB && null != valueInDB) {
							formItem.setValue(valueInDB)
						}
					}
				}

			}
		});
	},

	setValueJGComboBox: function (itemCode, value) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			this.setMultiDsValue(this.Code, itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id: record.id
		};
		data[item.name] = value;
		datasource.updateRecords([data]);
	},
	setDropDownSourceJGComboBox: function (itemCode, val) {
		var pros = this;
		if (pros && pros.fields && pros.fields.length > 0) {
			for (var i = 0, l = pros.fields.length; i < l; i++) {
				var field = pros.fields[i];
				if (field.code == itemCode) {
					field.DropDownSource = val;
					break;
				}
			}
		}
	},

	getDropDownSourceJGComboBox: function (itemCode) {
		var pros = this;
		if (pros && pros.fields && pros.fields.length > 0) {
			for (var i = 0, l = pros.fields.length; i < l; i++) {
				var field = pros.fields[i];
				if (field.code == itemCode) {
					return field.DropDownSource;
				}
			}
		}
		return null;
	},

	getIDColumnNameJGComboBox : function (itemCode) {
		if (itemCode) {
			var item = this.getItemByCode(itemCode);
			return item.IDColumnName;
		}
		return this.IDColumnName;
	},

	getColumnNameJGComboBox : function (itemCode) {
		if (itemCode) {
			var item = this.getItemByCode(itemCode);
			return item.ColumnName;
		}
		return this.ColumnName;
	},

	loadDataJGComboBox: function (itemCode, data) {
		//已经通过数据源监听处理
		var formItem = this.getItemByCode(itemCode);
		this.setValueMapJGComboBox(itemCode, formItem.DropDownSource, formItem.IDColumnName, formItem.ColumnName);
	}

});
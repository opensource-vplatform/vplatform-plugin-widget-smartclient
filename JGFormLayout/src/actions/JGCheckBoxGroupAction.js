isc.JGFormLayout.addMethods({

	getReadOnlyJGCheckBoxGroup: function (itemCode) {
		return this.getItemReadOnly(itemCode);
	},
	getEnabledJGCheckBoxGroup: function (itemCode) {
		return this.getItemEnabled(itemCode);
	},
	cleanSelectedControlValueJGCheckBoxGroup: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},
	setIsMustJGCheckBoxGroup: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getLabelTextJGCheckBoxGroup: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	setLabelTextJGCheckBoxGroup: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},
	getVisibleJGCheckBoxGroup: function (itemCode) {
		return this.getItemVisible(itemCode);
	},

	getValueJGCheckBoxGroup: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(widgetCode, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGCheckBoxGroup: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	getTextJGCheckBoxGroup: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return datasourceUtil.getSingleValue(datasource, item.displayField);
	},

	setReadOnlyJGCheckBoxGroup: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGCheckBoxGroup: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGCheckBoxGroup: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},
	setValueMapJGCheckBoxGroup: function (itemCode, dropDownSource, valueField, textField) {
		var widget = this;
		this._createDropdownSourceObserver({
			"widgetId": itemCode,
			"dataSource": dropDownSource,
			"valueField": valueField,
			"textField": textField,
			"handler": function (valueMap, defaultValue, params) {
				var formItem = widget.getItemByCode(itemCode);
				var cacheDatas = (formItem.form.dataSource && formItem.form.dataSource.getCacheData()) || [];
				//排序key
				formItem._$OrderKeys = params ? params.keys : null;
				formItem.setValueMap(valueMap);
				formItem.setItems();
				formItem.getDefaultVal(defaultValue);
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
			},
		});
	},

	setDropDownSourceJGCheckBoxGroup: function (itemCode, val) {
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
	getDropDownSourceJGCheckBoxGroup: function (itemCode) {
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
	getSelectedItmesNumJGCheckBoxGroup: function (itemCode) {

		var item = this.getItemByCode(itemCode);
		if (item._value instanceof Array === true) {
			if (item._value.length > 0) {
				return item._value.length;
			} else if (item._value.length == 0) {
				return 0;
			}
		} else {
			if (item._value) {
				return item._value.split(',').length;
			} else {
				return 0;
			}
		}
	},
	loadDataJGCheckBoxGroup: function (itemCode, data) {
		//已经通过数据源监听处理
		//
		//var formItem = this.getItemByCode(itemCode);
		//formItem.setValueMap(data);
	},
});
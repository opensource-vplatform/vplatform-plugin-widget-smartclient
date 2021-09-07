isc.JGFormLayout.addMethods({

	getReadOnlyJGBaseDictBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGBaseDictBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	//TODO
	cleanSelectedControlValueJGBaseDictBox: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	getLabelTextJGBaseDictBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGBaseDictBox: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGBaseDictBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGBaseDictBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode, "IDColumnName");
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.IDColumnName);
	},

	getDefaultValueJGBaseDictBox: function (itemCode) {

	},

	setIsMustJGBaseDictBox: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getTextJGBaseDictBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走统一赋值接口
			return this.getMulitDsText(this.Code, itemCode, "ColumnName");
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.ColumnName);
	},

	setReadOnlyJGBaseDictBox: function (itemCode, isReadonly) {
		var item = this.getItemByCode(itemCode);
		if (!isReadonly) {
			item.readOnlyDisplay = "readOnly";
		} else {
			item.readOnlyDisplay = null;
		}
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGBaseDictBox: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGBaseDictBox: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGBaseDictBox: function (itemCode, value) {

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

	getDropDownSourceJGBaseDictBox: function (itemCode) {
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

	setDropDownSourceJGBaseDictBox: function (itemCode, val) {
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

	setValueMapJGBaseDictBox : function (itemCode, dropDownSource, valueField, textField) {
		var widget = this;
		this._createDropdownSourceObserver({
			"widgetId": itemCode,
			"dataSource": dropDownSource,
			"valueField": valueField,
			"textField": textField,
			"handler": function (valueMap, defaultValue, params, descInfo) {
				var formItem = widget.getItemByCode(itemCode);
				formItem.clearValue();
				//排序key
				formItem._$OrderKeys = params ? params.keys : null;
				formItem.setValueMap(valueMap);
				formItem._valueMap = valueMap;
				formItem.setDefaultVal(defaultValue);
				formItem.setDescInfo(descInfo);
				var ds = isc.JGDataSourceManager.get(widget,formItem.SourceTableName);
				var IDColumnName = formItem.IDColumnName.split(formItem.form.multiDsSpecialChar)[1];
				if (ds.getCurrentRecord()) {
					var value = ds.getCurrentRecord()[IDColumnName];
					formItem.setValue(value);
					formItem.addStorage();
				}
			}
		});
	}
});
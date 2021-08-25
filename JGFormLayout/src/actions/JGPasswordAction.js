isc.JGFormLayout.addMethods({

	getReadOnlyJGPassword: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	setIsMustJGPassword: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getEnabledJGPassword: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	getLabelTextJGPassword: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGPassword: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},
	//TODO
	cleanSelectedControlValueJGPassword: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},


	getVisibleJGPassword: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},
	getValueJGPassword: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGPassword: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGPassword: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGPassword: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGPassword: function (itemCode, value) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			this.setMultiDsValue(this.Code, itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id: record.id
		}
		data[item.name] = value;
		datasource.updateRecords([data]);
	},

	getDefaultValueJGPassword: function (itemCode) {
		return this.getDefaultValue(itemCode);
	}

});
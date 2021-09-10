isc.JGFormLayout.addMethods({

	getReadOnlyJGIntegerBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGIntegerBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	setIsMustJGIntegerBox: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getLabelTextJGIntegerBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	cleanSelectedControlValueJGIntegerBox: function (itemCode, onlyCleanSelectedRecord) {
		this.clearItemSelectValue(itemCode, onlyCleanSelectedRecord);
	},
	setLabelTextJGIntegerBox: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},
	getVisibleJGIntegerBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGIntegerBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGIntegerBox: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGIntegerBox: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGIntegerBox: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGIntegerBox: function (itemCode, value) {
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

	getDefaultValueJGIntegerBox: function (itemCode) {
		return this.getDefaultValue(itemCode);
	}
});
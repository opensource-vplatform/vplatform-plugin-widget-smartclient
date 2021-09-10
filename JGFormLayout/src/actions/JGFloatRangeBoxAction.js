isc.JGFormLayout.addMethods({

	getReadOnlyJGFloatRangeBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGFloatRangeBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	cleanSelectedControlValueJGFloatRangeBox: function (itemCode, onlyCleanSelectedRecord) {
		var item = this.getItemByCode(itemCode);
		this.clearItemSelectValue(itemCode, onlyCleanSelectedRecord,[item.StartColumnName,item.EndColumnName]);
	},

	setIsMustJGFloatRangeBox: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getLabelTextJGFloatRangeBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGFloatRangeBox: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGFloatRangeBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGFloatRangeBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGFloatRangeBox: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGFloatRangeBox: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGFloatRangeBox: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGFloatRangeBox: function (itemCode, value) {
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
	
	getDefaultValueJGFloatRangeBox: function (itemCode) {
		return this.getDefaultValue(itemCode);
	}
});
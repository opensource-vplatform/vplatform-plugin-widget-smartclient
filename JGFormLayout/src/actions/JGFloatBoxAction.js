isc.JGFormLayout.addMethods({

	getReadOnlyJGFloatBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGFloatBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	setIsMustJGFloatBox: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getLabelTextJGFloatBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGFloatBox: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGFloatBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGFloatBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGFloatBox: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGFloatBox: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	cleanSelectedControlValueJGFloatBox: function (itemCode, onlyCleanSelectedRecord) {
		this.clearItemSelectValue(itemCode, onlyCleanSelectedRecord);
	},

	setVisibleJGFloatBox: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGFloatBox: function (itemCode, value) {
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

	getDefaultValueJGFloatBox: function (itemCode) {
		return this.getDefaultValue(itemCode);
	}
});
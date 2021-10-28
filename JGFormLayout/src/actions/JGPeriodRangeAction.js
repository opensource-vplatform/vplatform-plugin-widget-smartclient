isc.JGFormLayout.addMethods({

	getReadOnlyJGPeriodRange: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	setIsMustJGPeriodRange: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getEnabledJGPeriodRange: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	cleanSelectedControlValueJGPeriodRange: function (itemCode, onlyCleanSelectedRecord) {
		var item = this.getItemByCode(itemCode);
		this.clearItemSelectValue(itemCode, onlyCleanSelectedRecord,[item.StartColumnName,item.EndColumnName]);
	},

	getLabelTextJGPeriodRange: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGPeriodRange: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGPeriodRange: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGPeriodRange: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.SourceTableName);
		return datasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGPeriodRange: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	setReadOnlyJGPeriodRange: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGPeriodRange: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGPeriodRange: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGPeriodRange: function (itemCode, value) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			this.setMultiDsValue(this.Code, itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.SourceTableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id : record.id
		}
		data[item.name] = value;
		datasource.updateRecords([data]);
	},

	setPeriodTypeJGPeriodRange: function(itemCode, type){
		this.getItemByCode(itemCode).setPeriodType(type);
	}
});
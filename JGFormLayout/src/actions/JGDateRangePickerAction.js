isc.JGFormLayout.addMethods({

	getReadOnlyJGDateRangePicker: function (itemCode) {

		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGDateRangePicker: function (itemCode) {

		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	setIsMustJGDateRangePicker: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},
	//TODO
	cleanSelectedControlValueJGDateRangePicker: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	getLabelTextJGDateRangePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGDateRangePicker: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGDateRangePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGDateRangePicker: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGDateRangePicker: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	setReadOnlyJGDateRangePicker: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGDateRangePicker: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGDateRangePicker: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGDateRangePicker: function (itemCode, value) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			this.setMultiDsValue(this.Code, itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		var record = datasource.getCurrentRecord();

		var data = {
			id: record.id
		};
		data[item.name] = value;
		datasource.updateRecords([data]);
	}
});
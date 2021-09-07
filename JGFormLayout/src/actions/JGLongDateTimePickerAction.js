isc.JGFormLayout.addMethods({

	getReadOnlyJGLongDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	setIsMustJGLongDateTimePicker: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getEnabledJGLongDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	getLabelTextJGLongDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	//TODO
	cleanSelectedControlValueJGLongDateTimePicker: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	setLabelTextJGLongDateTimePicker: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGLongDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGLongDateTimePicker: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGLongDateTimePicker: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	setReadOnlyJGLongDateTimePicker: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGLongDateTimePicker: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGLongDateTimePicker: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGLongDateTimePicker: function (itemCode, value) {
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
	}
});
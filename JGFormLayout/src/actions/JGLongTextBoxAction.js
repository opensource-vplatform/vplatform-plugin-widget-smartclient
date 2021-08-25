isc.JGFormLayout.addMethods({

	getReadOnlyJGLongTextBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	setIsMustJGLongTextBox: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	getEnabledJGLongTextBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	getLabelTextJGLongTextBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGLongTextBox: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	//TODO
	cleanSelectedControlValueJGLongTextBox: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	getVisibleJGLongTextBox: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGLongTextBox: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGLongTextBox: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGLongTextBox: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},
	
	setVisibleJGLongTextBox: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGLongTextBox: function (itemCode, value) {
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
	},

	getDefaultValueJGLongTextBox: function (itemCode) {
		return this.getDefaultValue(itemCode);
	}
});
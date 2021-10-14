isc.JGFormLayout.addMethods({

	getReadOnlyJGButton: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGButton: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	//TODO
	cleanSelectedControlValueJGButton: function (itemCode, onlyCleanSelectedRecord) {
		//isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	getLabelTextJGButton: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGButton: function (itemCode, title) {
		var item = this.getItemByCode(itemCode);
		item.SimpleChineseTitle = title;
		item.title = title;
		item.redraw();
	},

	getVisibleJGButton: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGButton: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGButton: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGButton: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGButton: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGButton: function (itemCode, value) {
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id: record.id
		};
		data[item.name] = value;
		datasource.updateRecords([data]);
	},

	getDefaultValueJGButton: function (itemCode) {}

});
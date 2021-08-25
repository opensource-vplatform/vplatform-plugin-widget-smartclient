isc.JGFormLayout.addMethods({

	getReadOnlyJGHyperLink: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGHyperLink: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	getLabelTextJGHyperLink: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	//TODO	
	cleanSelectedControlValueJGHyperLink: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	setLabelTextJGHyperLink: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGHyperLink: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGHyperLink: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGHyperLink: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	setReadOnlyJGHyperLink: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGHyperLink: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGHyperLink: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGHyperLink: function (itemCode, value) {
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
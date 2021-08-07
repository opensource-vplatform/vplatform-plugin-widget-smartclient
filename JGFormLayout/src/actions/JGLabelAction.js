isc.JGFormLayout.addMethods({

	getDefaultValueJGLabel: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	getReadOnlyJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	//TODO
	cleanSelectedControlValueJGLabel: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	getLabelTextJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGLabel: function (itemCode, title) {
		var item = this.getItemByCode(itemCode);
		item.SimpleChineseTitle = title;
		item.setValue(title);
	},

	setForeColorJGLabel: function (itemCode, color) {
		var item = this.getItemByCode(itemCode);
		item.setForeColor(color);
	},

	setFontStyleJGLabel: function (itemCode, fontStyle) {
		var item = this.getItemByCode(itemCode);
		item.setFontStyle(fontStyle);
	},

	getForeColorJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ForeColor;
	},

	getFontStyleJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.FontStyle;
	},

	getVisibleJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGLabel: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGLabel: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGLabel: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGLabel: function (itemCode, value) {
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
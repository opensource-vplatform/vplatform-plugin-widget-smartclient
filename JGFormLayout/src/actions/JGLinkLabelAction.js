isc.JGFormLayout.addMethods({

	getReadOnlyJGLinkLabel: function (itemCode) {
		// var item = this.getItemByCode(itemCode);
		// return item.ReadOnly;
	},

	getEnabledJGLinkLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	getLabelTextJGLinkLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	cleanSelectedControlValueJGLinkLabel: function (itemCode, onlyCleanSelectedRecord) {
		// this.clearItemSelectValue(itemCode, onlyCleanSelectedRecord);
	},

	setLabelTextJGLinkLabel: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getDefaultValueJGLinkLabel: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	getVisibleJGLinkLabel: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGLinkLabel: function (itemCode) {
		// var item = this.getItemByCode(itemCode);
		// var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		// return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	setReadOnlyJGLinkLabel: function (itemCode, isReadonly) {
		// this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGLinkLabel: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGLinkLabel: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},

	setValueJGLinkLabel: function (itemCode, value) {
		
	},

	setForeColorJGLinkLabel:function(itemCode, color){
		var item = this.getItemByCode(itemCode);
		item && item.setForeColor && item.setForeColor(color);
	}
	
});
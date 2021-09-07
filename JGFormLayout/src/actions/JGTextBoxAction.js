
isc.JGFormLayout.addMethods({
	
	getValueJGTextBox : function (itemCode) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code,itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},
	
	setIsMustJGTextBox : function(itemCode,isMust){
		this.setItemIsMust(itemCode, isMust);
	}, 
	
	getReadOnlyJGTextBox : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},
	//TODO
	cleanSelectedControlValueJGTextBox : function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},
	
	getVisibleJGTextBox : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},
	
	getEnabledJGTextBox : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	
	getLabelTextJGTextBox : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	
	setLabelTextJGTextBox : function(itemCode, title){
		this.setLabelText(title,itemCode);
	},
	
	setReadOnlyJGTextBox : function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGTextBox : function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGTextBox : function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},
	//TODO
	setValueJGTextBox : function(itemCode, value) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			this.setMultiDsValue(this.Code,itemCode, value);
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
	
	getDefaultValueJGTextBox : function(itemCode) {
		return this.getDefaultValue(itemCode);
	}

});
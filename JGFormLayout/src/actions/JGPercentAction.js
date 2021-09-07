isc.JGFormLayout.addMethods({

	getReadOnlyJGPercent : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},
	
	getEnabledJGPercent : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	
	getLabelTextJGPercent : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	//TODO
	cleanSelectedControlValueJGPercent : function(itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},
	
	getVisibleJGPercent : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGPercent : function(itemCode) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.SourceTableName);
		return datasourceUtil.getSingleValue(datasource, item.name);
	},
	
	getDefaultValueJGPercent : function(itemCode) {
		return this.getDefaultValue( itemCode);
	},

	setReadOnlyJGPercent : function(itemCode, isReadonly) {
		this.setItemReadOnly( itemCode, isReadonly);
	},

	setEnabledJGPercent : function(itemCode, isEnable) {
		this.setItemEnabled( itemCode, isEnable);
	},

	setVisibleJGPercent : function(itemCode, isShow) {
		this.setItemVisible( itemCode, isShow);
	},
	
	setValueJGPercent : function(itemCode, value) {
		
		if(widget.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
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
});
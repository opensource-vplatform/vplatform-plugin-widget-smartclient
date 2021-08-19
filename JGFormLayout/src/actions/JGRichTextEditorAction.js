isc.JGFormLayout.addMethods({

	getReadOnlyJGRichTextEditor : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},
	
	getEnabledJGRichTextEditor : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	
	setIsMustJGRichTextEditor : function(itemCode,isMust){
		this.setItemIsMust(itemCode, isMust);
	},
	
	getLabelTextJGRichTextEditor : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	//TODO
	cleanSelectedControlValueJGRichTextEditor : function(itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},
	
	getVisibleJGRichTextEditor : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGRichTextEditor : function(itemCode) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code,itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},
	
	getDefaultValueJGRichTextEditor : function(itemCode) {
		return this.getDefaultValue(itemCode);
	},

	setReadOnlyJGRichTextEditor : function(itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGRichTextEditor : function(itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGRichTextEditor : function(itemCode, isShow) {
		var item = this.getItemByCode(itemCode);
		if(isShow){
			item.canvas.show();
			item.show();
		}else{
			item.canvas.hide();
			item.hide();
		}
	},
	
	setValueJGRichTextEditor : function(itemCode, value) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			this.setMultiDsValue(this.Code,itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id : record.id
		}
		data[item.name] = value;
		datasource.updateRecords([data]);
	}
});
isc.JGFormLayout.addMethods({

	getValueJGRichTextViewer : function (itemCode) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code,itemCode);
		}
		var item = widget.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		return datasourceUtil.getSingleValue(datasource, item.name);
	},
	
	setIsMustJGRichTextViewer : function(itemCode,isMust){
		this.setItemIsMust(itemCode, isMust);
	}, 
	
	getDefaultValueJGRichTextViewer : function(itemCode) {
		return this.getDefaultValue(itemCode);
	},
	//TODO
	cleanSelectedControlValueJGRichTextViewer : function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},

	setVisibleJGRichTextViewer : function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},
	
	getReadOnlyJGRichTextViewer : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},
	
	getEnabledJGRichTextViewer : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	
	getLabelTextJGRichTextViewer : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	
	getVisibleJGRichTextViewer : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},
	
	setValueJGRichTextViewer : function(itemCode, value) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			this.setMultiDsValue(this.Code,itemCode, value);
			return;
		}
		var item = widget.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id : record.id
		}
		data[item.name] = value;
		datasource.updateRecords([record]);
	}
	
	
});
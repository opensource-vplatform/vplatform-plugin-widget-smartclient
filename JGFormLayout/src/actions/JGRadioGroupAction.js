isc.JGFormLayout.addMethods({
	
	getReadOnlyJGRadioGroup : function(itemCode) {
		var item = TouchList.getItemByCode(itemCode);
		return item.isReadOnly();
	},
	
	setIsMustJGRadioGroup : function(itemCode,isMust){
		this.setItemIsMust(itemCode, isMust);
	},
	
	getEnabledJGRadioGroup : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return !item.isDisabled();
	},
	//TODO
	cleanSelectedControlValueJGRadioGroup : function(itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},
	
	getLabelTextJGRadioGroup : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	
	setLabelTextJGRadioGroup : function(itemCode, title){
		this.setLabelText(title,itemCode);
	},
	
	
	getVisibleJGRadioGroup : function(itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.isVisible();
	},

	getValueJGRadioGroup : function(itemCode) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			return this.getMultiDsValue(itemCode, "IDColumnName");
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},
	
	getDefaultValueJGRadioGroup : function(itemCode) {
		return this.getDefaultValue(itemCode);
	},
	
	getTextJGRadioGroup : function(itemCode) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走统一赋值接口
			return this.getMulitDsText(itemCode, "ColumnName");
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.displayField);
	},

	setReadOnlyJGRadioGroup : function(itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGRadioGroup : function(itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGRadioGroup : function(itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},
	
	setValueJGRadioGroup : function(itemCode, value) {
		if(this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()){//多数据源走同一赋值接口
			this.setMultiDsValue(itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item.TableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id: record.id
		};
		data[item.name] = value;
		datasource.updateRecords([data]);
	},
	//TODO
	setValueMapJGRadioGroup: function(itemCode,dropDownSource,valueField,textField){
		var widget = this;
		this._createDropdownSourceObserver({
            "widgetId" : itemCode,
            "dataSource" : dropDownSource,
            "valueField" : valueField,
            "textField" : textField,
            "handler" : function(valueMap,defaultValue, params){
            	var formItem = widget.getItemByCode(itemCode);
            	var cacheDatas = (formItem.form.dataSource && formItem.form.dataSource.getCacheData()) || [];
            	//排序key
            	formItem._$OrderKeys = params ? params.keys : null;
            	formItem.setDefaultVal(defaultValue);
            	formItem.setValueMap(valueMap);
            	if(cacheDatas.length > 0){
            		var cacheData;
                    for (var i = 0; i < cacheDatas.length; i++) {
                        var rec = cacheDatas[i];
                        if (formItem.form.values && rec.id == formItem.form.values.id) {
                            cacheData = rec;
                            break
                        }
                    }
                    if (undefined != cacheData && null != cacheData) {
                        var valueInDB = cacheData[formItem.IDColumnName];
                        if (undefined != valueInDB && null != valueInDB) {
                            formItem.setValue(valueInDB)
                        }
                    }
            	}
            }
        });                
	},
	
	setDropDownSourceJGRadioGroup : function(itemCode,val){
		var pros = this;
		if(pros&&pros.fields&&pros.fields.length>0){
			for(var i=0,l=pros.fields.length;i<l;i++){
				var field = pros.fields[i];
				if(field.code==itemCode){
					field.DropDownSource = val;
					break;
				}
			}
		}
	},
	
	getDropDownSourceJGRadioGroup : function(itemCode){
		var pros = this;
		if(pros&&pros.fields&&pros.fields.length>0){
			for(var i=0,l=pros.fields.length;i<l;i++){
				var field = pros.fields[i];
				if(field.code==itemCode){
					return field.DropDownSource;
				}
			}
		}
		return null;
	},
	
	loadDataJGRadioGroup : function(itemCode,data){
		//已经通过数据源监听处理
		//var widget = widgetContext.get(widgetCode, "widgetObj");
		//var formItem = widget.getItemByCode(itemCode);
		//formItem.setValueMap(data);
	}
	
});
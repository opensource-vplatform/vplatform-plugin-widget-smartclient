/**
 * 控件数据源工具类
 * @class WidgetDatasource
 */
isc.ClassFactory.defineClass("WidgetDatasource");
isc.WidgetDatasource.addClassMethods({

    /**
     * 获取控件绑定数据源
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource=} datasource 数据源实例
     * @returns {V3Datasource}
     */
    getDatasource: function(widget,datasource){
        if (undefined == datasource || null == datasource){
            datasource = widget.TableName
        }
		if (undefined == datasource || null == datasource){
			return;
        }
        return datasource;
    },

    /**
     * 获取控件绑定字段
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Array=} fields 绑定字段
     * @returns {Array}
     */
    getFields: function(widget,fields){
        if (undefined == fields || null == fields){
            if(!widget.getBindFields){
                throw Error("控件未提供getBindFields接口，无法绑定更新回调！控件类型："+widget.getClassName());
            }
            fields = widget.getBindFields();
        }
		if (!Array.isArray(fields)){
			fields = [ fields ];
        }
        return fields;
    },

    /**
     * 添加控件值更新操作回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource=} datasource 数据源实例
     * @param {Array=} fields 绑定字段
     * @param {Function} handler 回调
     */
    addBindDatasourceCurrentRecordUpdateEventHandler: function(widget,datasource, fields, handler){
        datasource = isc.WidgetDatasource.getDatasource(widget,datasource);
		if(datasource){
            fields = isc.WidgetDatasource.getFields(widget,fields);
            var observer = isc.CurrentRecordObserver.create({
                fields : fields,
                setValueHandler: handler
            });
            datasource.addObserver(observer);
        }
    },

    /**
     * 添加控件值清空操作回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource=} datasource 数据源实例
     * @param {Array=} fields 绑定字段
     * @param {Function} handler 回调
     */
    addBindDatasourceCurrentRecordClearEventHandler: function(widget, datasource, fields, handler){
        datasource = isc.WidgetDatasource.getDatasource(widget,datasource);
		if(datasource){
            fields = isc.WidgetDatasource.getFields(widget,fields);
            var observer = isc.CurrentRecordObserver.create({
                fields : fields,
                clearValueHandler: handler
            });
            datasource.addObserver(observer);
        }
    },

    /**
     * 添加数据源事件回调
     * @private
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {String} eventName 回调名称
     * @param {Function} handler 事件回调
     */
    _addDatasourceEventHandler: function(widget, datasource,eventName, handler){
        datasource = isc.WidgetDatasource.getDatasource(widget,datasource);
        if(datasource){
            var params = {};
            params[eventName] = handler;
            var observer = isc.DatasourceObserver.create(params);
            datasource.addObserver(observer);
        }
    },

    /**
     * 添加数据源当前行切换事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
    addBindDatasourceCurrentEventHandler: function(widget, datasource, handler) {
		isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"currentHandler",handler);
	},

    /**
     * 添加数据源选中记录变更事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
	addBindDatasourceSelectEventHandler: function(widget, datasource, handler) {
		isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"selectHandler",handler);
	},

    /**
     * 添加数据源加载事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
    addBindDatasourceLoadEventHandler: function(widget, datasource, handler) {
        isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"loadHandler",handler);
	},

    /**
     * 添加数据源数据加载前事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
	addBindDatasourceFetchEventHandler: function(widget, datasource, handler) {
        isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"fetchHandler",handler);
	},
    
	/**
     * 添加数据源数据加载后事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
	addBindDatasourceFetchedEventHandler: function(widget, datasource, handler) {
		isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"fetchedHandler",handler);
	},

    /**
     * 添加数据源新增事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
    addBindDatasourceInsertEventHandler: function(widget, datasource, handler) {
		isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"insertHandler",handler);
	},

    /**
     * 添加数据源更新事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {String} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
    addBindDatasourceUpdateEventHandler: function(widget, datasource, handler) {
        isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"updateHandler",handler);
	},

    /**
     * 添加数据源删除事件回调
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {String} datasource 数据源实例
     * @param {Function} handler 事件回调
     */
	addBindDatasourceDeleteEventHandler: function(widget, datasource, handler) {
        isc.WidgetDatasource._addDatasourceEventHandler(widget,datasource,"deleteHandler",handler);
	},

    /**
     * 清空数据源字段值
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Boolean} cleanSeleted 是否只清空选中记录
     */
    clearValue: function(widget,cleanSeleted){
        var datasource = widget.TableName;
        if(datasource){
            var fields = isc.WidgetDatasource.getFields(widget);
            var records = cleanSeleted ? datasource.getSelectedRecords():datasource.getAllRecords();
            var updatedRecords = [];
            if(fields&&fields.length>0&&records&&records.length>0){
                for(var i=0,l=records.length;i<l;i++){
                    var record = records[i];
                    var data = {
                        id : record.id
                    };
                    for(var j=0,len=fields.length;j<len;j++){
                        data[fields[j]] = null;
                    }
                    updatedRecords.push(data);
                }
            }
            if(updatedRecords.length>0){
                datasource.updateRecords(updatedRecords);
            }
        }
    },

    /**
	 * 设置单值控件的值
     * @memberof WidgetDatasource
     * @method
     * @static
	 * @param {Object} widget 控件实例
	 * @param {String} value 控件值
	 */
	setSingleValue: function(widget, value) {
		var datasource = isc.WidgetDatasource.getDatasource(widget);
		var fields = isc.WidgetDatasource.getFields(widget);
		if (fields.length > 1)
			throw new Error("接口调用错误，控件【" + widget.getClassName() + "】绑定了多个字段！");
		var field = fields[0];
        var record = datasource.getCurrentRecord();
        if (!record) {
            record = datasource.createRecord();
            datasource.insertRecords([ record ]);
            record = datasource.getRecordById(record.id);
        }
        record = {
            id : record.id
        }; 
        record[field] = value;
        datasource.updateRecords([ record ]);
	},

    /**
     * 设置控件的多个值
     * @memberof WidgetDatasource
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Object} record 控件值
     */
    setSingleRecordMultiValue: function(widget,record){
        var datasource = isc.WidgetDatasource.getDatasource(widget);
		var currentRecord = datasource.getCurrentRecord();
		if (!currentRecord) {
			currentRecord = datasource.createRecord();
			datasource.insertRecords({
				"records" : [ currentRecord ]
			});
			currentRecord = datasource.getRecordById(currentRecord.id);
		}
        var values = {
            id: currentRecord.id
        };
		for ( var key in record) {
            if(record.hasOwnProperty(key)){
                values[key] = record[key];
            }
		}
		datasource.updateRecords( [ values ]);
    },

    /**
	 * 获取单值控件的值
	 * @memberof WidgetDatasource
     * @method
     * @static
	 * @param {Object} widget 控件实例
	 * @return {String} 控件值
	 */
    getSingleValue: function(widget){
        var datasource = isc.WidgetDatasource.getDatasource(widget);
		var fields = isc.WidgetDatasource.getFields(widget);
		var value = null;
		if (datasource == null || fields.length < 1) {
            var methodName = "getValue";
            if(widget.getV3MethodMap){
                var map = widget.getV3MethodMap();
                methodName = map[methodName] ? map[methodName]:methodName;
            }
			value = widget[methodName]();
		} else {
			var currentRecord = datasource.getCurrentRecord();
			if (currentRecord) {
				var field = fields[0];
				value = currentRecord[field];
			}
		}
		return value;
    },

    /**
	 * 获取单值控件的默认值
	 * @memberof WidgetDatasource
     * @method
     * @static
	 * @param {Object} widget 控件实例
	 */
    getSingleColumnWidgetDefaultValue: function(widget){
        var defaultValueScript = widget.DefaultValue;
		if (defaultValueScript) {
			return defaultValueScript;
		}
		if (undefined == defaultValueScript || null == defaultValueScript) {
			return "";
		} else {
			var columnName = widget.ColumnName;
			var reMap = {};
			reMap[columnName] = defaultValueScript
			return reMap;
		}
    }
});
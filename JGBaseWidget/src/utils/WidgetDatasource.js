/**
 * 控件数据源工具类
 * @class WidgetDatasource
 */
isc.ClassFactory.defineClass("WidgetDatasource");
isc.WidgetDatasource.addClassMethods({

    _getDatasource: function(widget,datasource){
        if (undefined == datasource || null == datasource){
            datasource = widget.TableName
        }
		if (undefined == datasource || null == datasource){
			return;
        }
    },

    _getFields: function(widget,fields){
        if (undefined == fields || null == fields){
            if(!widget.getBindFields){
                throw Error("控件未提供getBindFields接口，无法绑定更新回调！控件类型："+widget.getClassName());
            }
            fields = widget.getBindFields();
        }
		if (Array.isArray(fields)){
			fields = [ fields ];
        }
        return fields;
    },

    /**
     * 添加控件值更新操作回调
     * @memberof WidgetDatasource
     * @method
     * @instance
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Array} fields 绑定字段
     * @param {Function} handler 回调
     */
    addBindDatasourceCurrentRecordUpdateEventHandler: function(widget,datasource, fields, handler){
        datasource = isc.WidgetDatasource._getDatasource(widget,datasource);
		if(datasource){
            fields = isc.WidgetDatasource._getFields(widget,fields);
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
     * @instance
     * @param {Object} widget 控件实例
     * @param {V3Datasource} datasource 数据源实例
     * @param {Array} fields 绑定字段
     * @param {Function} handler 回调
     */
    addBindDatasourceCurrentRecordClearEventHandler: function(widget, datasource, fields, handler){
        datasource = isc.WidgetDatasource._getDatasource(widget,datasource);
		if(datasource){
            fields = isc.WidgetDatasource._getFields(widget,fields);
            var observer = isc.CurrentRecordObserver.create({
                fields : fields,
                clearValueHandler: handler
            });
            datasource.addObserver(observer);
        }
    }
});
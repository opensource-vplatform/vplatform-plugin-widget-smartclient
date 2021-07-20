/**
 * 数据源工具类
 * @class DatasourceUtil
 */
 isc.ClassFactory.defineClass("DatasourceUtil");
 isc.DatasourceUtil.addClassMethods({

    /**
     * 添加数据源当前行事件回调
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     * @returns 
     */
    addDatasourceCurrentEventHandler: function(widget, handler){
        var datasource = isc.WidgetDatasource.getDatasource(widget);
		if (undefined == datasource || null == datasource){
			return;
        }
		datasource.on({
			"eventName" : datasource.Events.CURRENT,
			"handler" : function() {
				handler.apply(datasource,arguments);
			}
		});
    },

    /**
     * 添加数据源更新事件回调
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     * @returns 
     */
    addDatasourceUpdateEventHandler: function(widget, handler){
        var datasource = isc.WidgetDatasource.getDatasource(widget);
		if (undefined == datasource || null == datasource)
			return;
		datasource.on({
			"eventName" : datasource.Events.UPDATE,
			"handler" : function() {
				handler.apply(datasource,arguments);
			}
		});
    },

    /**
     * 添加数据源删除事件回调
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     * @returns 
     */
    addDatasourceDeleteEventHandler: function(widget, handler){
        var datasource = isc.WidgetDatasource.getDatasource(widget);
		if (undefined == datasource || null == datasource)
			return;
		datasource.on({
			"eventName" : datasource.Events.DELETE,
			"handler" : function() {
				handler.apply(datasource,arguments);
			}
		});
    }

 });
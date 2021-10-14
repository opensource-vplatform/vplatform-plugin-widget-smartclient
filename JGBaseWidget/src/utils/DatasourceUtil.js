/**
 * 数据源工具类
 * @class DatasourceUtil
 */
isc.ClassFactory.defineClass("DatasourceUtil");
isc.DatasourceUtil.addClassMethods({

    _checkDatasource: function (datasource) {
        if (undefined == datasource || null == datasource || typeof (datasource) == 'string') {
            return false;
        }
        return true;
    },

    /**
     * 添加数据源当前行事件回调
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     */
    addDatasourceCurrentEventHandler: function (widget, handler) {
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        if (widget && handler) {
            datasource.on(datasource.Events.CURRENT, null, function () {
                handler.apply(datasource, arguments);
            });
        }
    },

     /**
     * 添加数据源选中行事件回调
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     */
    addDatasourceSelectEventHandler: function(widget, handler){
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        if (widget && handler) {
            datasource.on(datasource.Events.SELECT, null, function () {
                handler.apply(datasource, arguments);
            });
        }
    },

    /**
     * 添加数据源更新事件回调
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     */
    addDatasourceUpdateEventHandler: function (widget, handler) {
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        if (widget && handler) {
            datasource.on(datasource.Events.UPDATE, null, function () {
                handler.apply(datasource, arguments);
            });
        }
    },

    /**
     * 添加数据源字段更新事件
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Array=} fields 控件绑定字段
     * @param {Function} handler 事件回调
     */
    addDatasourceFieldUpdateEventHandler: function (widget, fields, handler) {
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        var fields = isc.WidgetDatasource.getFields(widget, fields);
        if (undefined == fields || null == fields)
            return;
        if (widget && handler) {
            datasource.on(datasource.Events.UPDATE, null, function (params) {
                var result = params.resultSet;
                var isChanged = false;
                loop:for (var i = 0, l = result.length; i < l; i++) {
                    var record = result[i];
                    for (var j = 0; j < fields.length; j++) {
                        var field = fields[j];
                        if (record.hasOwnProperty(field)) {
                            isChanged = true;
                            break loop;
                        }

                    }
                }
                if (isChanged) {
                    handler(params);
                }
            });
        }
    },

    /**
     * 添加数据源删除事件回调
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     */
    addDatasourceDeleteEventHandler: function (widget, handler) {
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        if (widget && handler) {
            datasource.on(datasource.Events.DELETE, null, function () {
                handler.apply(datasource, arguments);
            });
        }
    },

    /**
     * 添加数据源加载事件回调
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     */
    addDatasourceLoadEventHandler: function (widget, handler) {
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        if (widget && handler) {
            datasource.on(datasource.Events.LOAD, null, function () {
                handler.apply(datasource, arguments);
            });
        }
    },

    /**
     * 添加数据源新增事件回调
     * @memberof DatasourceUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} handler 事件回调
     */
    addDatasourceInsertEventHandler: function (widget, handler) {
        var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return;
        }
        if (widget && handler) {
            datasource.on(datasource.Events.INSERT, null, function () {
                handler.apply(datasource, arguments);
            });
        }
    },

    getSingleValue : function(widget, field) {
		var datasource = isc.WidgetDatasource.getDatasource(widget);
        if (!this._checkDatasource(datasource)) {
            return null;
        }
		var currentRecord = datasource.getCurrentRecord();
		return currentRecord ? currentRecord[field]:null;
	}

});
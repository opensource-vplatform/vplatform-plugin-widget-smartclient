/**
 * 数据源观察者
 * @interface IDatasourceObserver
 */
 isc.ClassFactory.defineInterface("IDatasourceObserver");

 isc.IDatasourceObserver.addInterfaceMethods({

    /**
     * 数据源数据变化时触发
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Object} params 事件信息
     * {
     *  eventName : String, 事件名称
     *  datasource: V3Datasource,数据源实例
     * }
     */
     fire : function(params){
        var eventName = params.eventName;
        var ds = params.datasource;
        switch(eventName){
            case ds.Events.LOAD:
                return this._fireHandler(this._v3LoadHandler,params);
            case ds.Events.INSERT:
                return this._fireHandler(this._v3InsertHandler,params);
            case ds.Events.UPDATE:
                return this._fireHandler(this._v3UpdateHandler,params);
            case ds.Events.DELETE:
                return this._fireHandler(this._v3DeleteHandler,params);
            case ds.Events.CURRENT:
                return this._fireHandler(this._v3CurrentHandler,params);
            case ds.Events.SELECT:
                return this._fireHandler(this._v3SelectHandler,params);
            case ds.Events.FETCH:
                return this._fireHandler(this._v3FetchHandler,params);
            case ds.Events.FETCHED:
                return this._fireHandler(this._v3FetchedHandler,params);
        }
    },
    /**
     * 设置加载事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setLoadHandler: function(handler){
        this._v3LoadHandler = handler;
    },

    /**
     * 设置新增事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setInsertHandler: function(handler){
        this._v3InsertHandler = handler;
    },

    /**
     * 设置更新事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setUpdateHandler: function(handler){
        this._v3UpdateHandler = handler;
    },

    /**
     * 设置删除事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setDeleteHandler: function(handler){
        this._v3DeleteHandler = handler;
    },

    /**
     * 设置当前行变更事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setCurrentHandler: function(handler){
        this._v3CurrentHandler = handler;
    },

    /**
     * 设置选中行变更事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setSelectHandler: function(handler){
        this._v3SelectHandler = handler;
    },

    /**
     * 设置获取数据前事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setFetchHandler: function(handler){
        this._v3FetchHandler = handler;
    },

    /**
     * 设置获取数据后事件回调
     * @memberof IDatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setFetchedHandler: function(handler){
        this._v3FetchedHandler = handler;
    },

    _fireHandler: function(handler,args){
        if(typeof(handler)=="function"){
            handler.call(this,args);
        }
    }
 });
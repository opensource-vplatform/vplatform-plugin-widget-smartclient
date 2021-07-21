/**
 * 数据源观察者
 * @class DatasourceObserver
 */
 isc.ClassFactory.defineClass("DatasourceObserver");

 isc.DatasourceObserver.addProperties({
    /**
     * 加载事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    loadHandler: null,
    /**
     * 新增事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    insertHandler: null,
    /**
     * 更新事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    updateHandler: null,
    /**
     * 删除事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    deleteHandler: null,
    /**
     * 当前行事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    currentHandler: null,
    /**
     * 新增事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    selectHandler: null,
    /**
     * 数据获取前事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    fetchHandler: null,
    /**
     * 数据获取后事件回调
     * @property {Function}
     * @memberof DatasourceObserver
     * @instance
     */
    fetchedHandler: null

 });

 isc.DatasourceObserver.addMethods({

    /**
     * 数据源数据变化时触发
     * @memberof DatasourceObserver
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
                return this._fireHandler(this.loadHandler,params);
            case ds.Events.INSERT:
                return this._fireHandler(this.insertHandler,params);
            case ds.Events.UPDATE:
                return this._fireHandler(this.updateHandler,params);
            case ds.Events.DELETE:
                return this._fireHandler(this.deleteHandler,params);
            case ds.Events.CURRENT:
                return this._fireHandler(this.currentHandler,params);
            case ds.Events.SELECT:
                return this._fireHandler(this.selectHandler,params);
            case ds.Events.FETCH:
                return this._fireHandler(this.fetchHandler,params);
            case ds.Events.FETCHED:
                return this._fireHandler(this.fetchedHandler,params);
        }
    },
    /**
     * 设置加载事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setLoadHandler: function(handler){
        this.loadHandler = handler;
    },

    /**
     * 设置新增事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setInsertHandler: function(handler){
        this.insertHandler = handler;
    },

    /**
     * 设置更新事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setUpdateHandler: function(handler){
        this.updateHandler = handler;
    },

    /**
     * 设置删除事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setDeleteHandler: function(handler){
        this.deleteHandler = handler;
    },

    /**
     * 设置当前行变更事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setCurrentHandler: function(handler){
        this.currentHandler = handler;
    },

    /**
     * 设置选中行变更事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setSelectHandler: function(handler){
        this.selectHandler = handler;
    },

    /**
     * 设置获取数据前事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setFetchHandler: function(handler){
        this.fetchHandler = handler;
    },

    /**
     * 设置获取数据后事件回调
     * @memberof DatasourceObserver
     * @method
     * @instance
     * @param {Function} handler 事件回调
     */
    setFetchedHandler: function(handler){
        this.fetchedHandler = handler;
    },

    _fireHandler: function(handler,args){
        if(typeof(handler)=="function"){
            handler.call(this,args);
        }
    }
 });
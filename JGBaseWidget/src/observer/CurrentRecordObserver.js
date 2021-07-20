/**
 * 当前行记录观察者
 * @class CurrentRecordObserver
 */
isc.ClassFactory.defineClass("CurrentRecordObserver");

isc.CurrentRecordObserver.addProperties({

    /**
     * 绑定字段
     * @property {Array}
     * @memberof CurrentRecordObserver
     * @instance
     */
    fields: null,

    /**
     * 设置控件值回调
     * @property {Function}
     * @memberof CurrentRecordObserver
     * @instance
     */
    setValueHandler: null,

    /**
     * 清空控件值回调
     * @property {Function}
     * @memberof CurrentRecordObserver
     * @instance
     */
    clearValueHandler: null

});

isc.CurrentRecordObserver.addMethods({

    /**
     * 数据源数据变化时触发
     * @param {String} eventName 事件名称
     * @param {Array} args 
     */
    fire: function (params) {
        var eventName = params.eventName;
        var ds = params.datasource;
        switch (eventName) {
            case ds.Events.LOAD:
                return this._loadAction.apply(this, [params]);
            case ds.Events.UPDATE:
                return this._updateAction.apply(this, [params]);
            case ds.Events.DELETE:
                return this._deleteAction.apply(this, [params]);
            case ds.Events.CURRENT:
                return this._currentAction.apply(this, [params]);
        }
    },

    _loadAction: function (params) {
        var isAppend = params.isAppend;
        if (!isAppend) {
            this._fireHandler(this.clearValueHandler,[]);
        }
    },

    _updateAction: function (params) {
        var changed = params.resultSet,
            datasource = params.datasource;
        for (var i = 0, l = changed.length; i < l; i++) {
            var ch = changed[i];
            if (datasource.isCurrentRecord(ch)) {
                this._handleValue(ch);
                break;
            }
        }
    },

    _isChanged: function (data) {
        var fields = this.getBindFields();
        if (fields && fields.length > 0) {
            for (var j = 0, len = fields.length; j < len; j++) {
                var field = fields[j];
                if (data.hasOwnProperty(field)) {
                    return true;
                }
            }
        }
        return false;
    },

    _handleValue: function (data) {
        if(this._isChanged(data)){
            this._fireHandler(this.setValueHandler,[data]);
        }
    },

    _fireHandler : function(handler,args){
        if(handler){
            handler.apply(this,args);
        }
    },

    _deleteAction: function () {
        this._fireHandler(this.clearValueHandler,[]);
    },

    _currentAction: function (params) {
        var data = params.currentRecord;
        this._handleValue(data);
    },


    /**
     * 获取控件绑定字段
     * @memberof CurrentRecordObserver
     * @method
     * @instance
     * @returns {Array} 绑定字段
     */
    getBindFields: function () {
        return this.fields || [];
    },

    /**
     * 设置控件值
     * @memberof CurrentRecordObserver
     * @method
     * @instance
     * @param {Function} handler 设置控件值回调
     */
    setWidgetValueHandler: function (handler) {
        this.setValueHandler = handler;
    },

    /**
     * 清空控件值
     * @memberof CurrentRecordObserver
     * @method
     * @instance
     * @param {Function} handler 清空控件值回调
     */
    clearWidgetValueHandler: function (handler) {
        this.clearValueHandler = handler;
    }

});
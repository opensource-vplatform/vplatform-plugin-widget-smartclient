/**
 * 当前行记录观察者
 * @interface IRecordObserver
 */
isc.ClassFactory.defineInterface("IRecordObserver");

isc.IRecordObserver.addInterfaceProperties({

    __loadHandler :[],

    __updateHandler : []

});

isc.IRecordObserver.addInterfaceMethods({

    /**
     * 数据源数据变化时触发
     * @param {String} eventName 事件名称
     * @param {*} args 
     */
    fire : function(params){
        var eventName = params.eventName;
        var ds = params.datasource;
        switch(eventName){
            case ds.Events.LOAD:
                return this._loadAction.apply(this,[params]);
            case ds.Events.UPDATE:
                return this._updateAction.apply(this,[params]);
            case ds.Events.DELETE:
                return this._deleteAction.apply(this,[params]);
            case ds.Events.CURRENT:
                return this._currentAction.apply(this,[params]);
        }
    },

    _loadAction : function(params){
        var isAppend = params.isAppend;
        if(!isAppend){
            this.clearWidgetData();
        }
        this._$fireEventHandler(this.__loadHandler);
    },

    _updateAction : function(params){
        var changed = params.resultSet,datasource=params.datasource;
        for(var i=0,l=changed.length;i<l;i++){
            var ch = changed[i];
            if(datasource.isCurrentRecord(ch)){
                this._handleValue(ch);
                if(this._isChanged(ch)){
                    this._$fireEventHandler(this.__updateHandler);
                }
                break;
            }
        }
    },

    _isChanged : function(data){
        var fields = this.getBindFields();
        if(fields&&fields.length>0){
            for(var j=0,len=fields.length;j<len;j++){
                var field = fields[j];
                if(data.hasOwnProperty(field)){
                    return true;
                }
            }
        }
        return false;
    },

    _handleValue : function(data){
        var fields = this.getBindFields();
        if(fields&&fields.length>0){
            if(fields.length>1){
                var vals = {};
                for(var j=0,len=fields.length;j<len;j++){
                    var field = fields[j];
                    if(data.hasOwnProperty(field)){
                        vals[field] = data[field];
                    }
                }
                this.setWidgetData(vals,data);
            }else{
                var field = fields[0];
                if(data.hasOwnProperty(field)){
                    this.setWidgetData(data[field],data);
                }
            }
        }
    },

    _$fireEventHandler : function(handlers){
        for(var i=0,l=handlers.length;i<l;i++){
            var handler = handlers[i];
            handler.apply(this,[]);
        }
    },

    _deleteAction : function(){
        this.clearWidgetData();
    },

    _currentAction : function(params){
        var data = params.currentRecord;
        this._handleValue(data);
    },

    onLoadListener : function(handler){
        if(typeof(handler)=="function"){
            this.__loadHandler.push(handler);
        }
    },

    onChangedListener : function(handler){
        if(typeof(handler)=="function"){
            this.__updateHandler.push(handler);
        }
    },

    /**
     * 获取控件绑定字段
     * @memberof IRecordObserver
     * @method
     * @instance
     * @returns {Array} 绑定字段
     */
    getBindFields :function(){
        return [];
    },

    /**
     * 设置控件值
     * @memberof IRecordObserver
     * @method
     * @instance
     * @param {Any} data 值
     */
    setWidgetData : function(data,record){
        
    },

    /**
     * 清空控件值
     * @memberof IRecordObserver
     * @method
     * @instance
     * @returns {Any}
     */
    clearWidgetData : function(){
        
    }

});
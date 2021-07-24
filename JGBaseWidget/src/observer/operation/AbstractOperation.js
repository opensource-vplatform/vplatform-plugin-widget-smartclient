/**
 * 数据源操作抽象
 * @class AbstractOperation
 */
isc.ClassFactory.defineClass("AbstractOperation");

isc.AbstractOperation.addProperties({
    /**
     * 数据源事件回调参数信息
     */
    params: null,
    /**
     * 是否已销毁
     * @memberof AbstractOperation
     * @instance
     * @property {Boolean}
     */
    destroyed: false,
    /**
     * 操作位置
     * @memberof AbstractOperation
     * @instance
     * @property {Integer}
     */
    operationPosition: -1,

    /**
     * 记录位置映射
     * @memberof AbstractOperation
     * @instance
     * @property {Object}
     */
    recordPositions: null

});

isc.AbstractOperation.addMethods({

    init : function(){
        this.recordPositions = {};
    },

    _iterate:function(rs,handler){
        for(var i=0,l=rs.length;i<l;i++){
            var rd = rs[i];
            var rs = handler.apply(this,[rd,i]);
            if(rs === false){
                break;
            }else if(typeof rs == "number"){
                i = rs;
            }
        }
    },

    /**
     * 设置操作位置
     * @memberof AbstractOperation
     * @method
     * @instance
     * @param {Integer} position 操作位置
     */
    setOperationPosition :　function(position){
        this.operationPosition = position;
    },
    /**
     * 设置记录与操作位置映射关系
     * @memberof AbstractOperation
     * @method
     * @instance
     * @param {Object} record 记录
     * @param {Integer} position 操作位置
     */
    setRecordPosition : function(record,position){
        this.recordPositions[record]=position;
    },
    /**
     * 获取记录操作位置
     * @memberof AbstractOperation
     * @method
     * @instance
     * @param {Object} record 记录
     * @returns {Integer}
     */
    getRecordPosition : function(record){
        return this.recordPositions.hasOwnProperty(record) ? this.recordPositions[record]:this.operationPosition;
    },
    /**
     * 获取操作位置
     * @memberof AbstractOperation
     * @method
     * @instance
     * @returns {Integer}
     */
    getOperationPosition : function(){
        return this.operationPosition;
    },

    /**
     * 当前动作是否销毁
     * @memberof AbstractOperation
     * @method
     * @instance
     * @returns {Boolean}
     */
    isDestroyed : function(){
        return this.destroyed;
    },

    /**
     * 获取参数信息
     * @memberof AbstractOperation
     * @method
     * @instance
     * @returns {Object}
     */
    getParams : function(){
        return this.params;
    },

    /**
     * 标记动作已销毁
     * @memberof AbstractOperation
     * @method
     * @instance
     */
    markDestroy : function(){
        this.destroyed = true;
    },

    /**
     * 合并动作
     * @memberof AbstractOperation
     * @method
     * @instance
     * @param {AbstractOperation} operation 操作
     * @param {Boolean} isBehind 是否在后，为true时，代表operation在当前操作之后
     */
    combine : function(operation,isBehind){
        var params = operation.getParams();
        var eventName = params.eventName;
        switch(eventName){
            case Datasource.Events.LOAD :
                this._combineLoad(operation,isBehind);
                break;
            case Datasource.Events.INSERT :
                this._combineInsert(operation,isBehind);
                break;
            case Datasource.Events.UPDATE :
                this._combineUpdate(operation,isBehind);
                break;
            case Datasource.Events.DELETE :
                this._combineDelete(operation,isBehind);
                break;
            case Datasource.Events.CURRENT :
                this._combineCurrent(operation,isBehind);
                break;
            case Datasource.Events.SELECT :
                this._combineSelect(operation,isBehind);
                break;
            case Datasource.Events.FETCH :
                this._combineFetch(operation,isBehind);
                break;
            case Datasource.Events.FETCHED :
                this._combineFetched(operation,isBehind);
                break;
        }
    },
    
    _combineLoad : function(){
        
    },
    
    _combineCurrent : function(){
        
    },
    
    _combineDelete : function(){
        
    },
    
    _combineFetch : function(){
        
    },
    
    _combineInsert : function(){
        
    },
    
    _combineSelect : function(){
        
    },
    
    _combineUpdate : function(){
        
    },
    _combineFetched:function(){
        
    }

});
/**
 * 当前行操作
 * @class CurrentOperation
 * @extends AbstractOperation
 */
 isc.ClassFactory.defineClass("CurrentOperation","AbstractOperation");

 isc.CurrentOperation.addMethods({

    _isBefore : function(o){
        return o.getOperationPosition()>this.getOperationPosition();
    },
    
    _combineCurrent : function(operation){
        if(this._isBefore(operation)){
            this.markDestroy();
        }else{
            operation.markDestroy();
        }
    },
    
    _combineLoad : function(operation){
        if(this._isBefore(operation)){
            var params = operation.getParams();
            var isAppend = params.isAppend;
            if(!isAppend){//如果以覆盖方式加载
                this.markDestroy();
            }
        }
    },
    
    _combineDelete : function(operation){
        utils.destroyCurrent(this,operation);
    }

 });
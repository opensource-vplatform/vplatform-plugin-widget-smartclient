/**
 * 删除操作
 * @class CurrentOperation
 * @extends AbstractOperation
 */
 isc.ClassFactory.defineClass("DeleteOperation","AbstractOperation");

 isc.CurrentOperation.addMethods({

    _combineLoad : function(operation){
        isc.OperationUtils.destroyWhenLoad(this,operation);
    },
    
    _combineDelete : function(operation){
        isc.OperationUtils.combine(this,operation);
    },
    
    _combineInsert : function(operation){
        isc.OperationUtils.destroy(operation,this);
    },
    
    _combineUpdate : function(operation){
        isc.OperationUtils.destroy(operation,this);
    },
    
    _combineCurrent : function(operation){
        isc.OperationUtils.destroyCurrent(operation,this);
    },
    
    _combineSelect : function(operation){
        isc.OperationUtils.opSelectWhenDelete(operation,this);
    }

 });
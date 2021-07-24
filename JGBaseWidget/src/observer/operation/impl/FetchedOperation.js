/**
 * 数据获取后操作
 * @class FetchedOperation
 * @extends AbstractOperation
 */
 isc.ClassFactory.defineClass("FetchedOperation","AbstractOperation");

 isc.FetchedOperation.addMethods({

    _combineFetch: function(operation,isBehind){
        operation.markDestroy();
        this.markDestroy();
    }
    
 });
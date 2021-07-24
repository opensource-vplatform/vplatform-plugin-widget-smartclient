/**
 * 数据获取前操作
 * @class FetchOperation
 * @extends AbstractOperation
 */
 isc.ClassFactory.defineClass("FetchOperation","AbstractOperation");

 isc.FetchOperation.addMethods({

    _combineFetched : function(operation,isBehind){
        this.markDestroy();
        operation.markDestroy();
    }	

 });
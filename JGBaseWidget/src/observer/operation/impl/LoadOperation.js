/**
 * 加载操作
 * @class LoadOperation
 * @extends AbstractOperation
 */
isc.ClassFactory.defineClass("LoadOperation", "AbstractOperation");

isc.LoadOperation.addMethods({

    _combineLoad: function (operation, isBehind) {
        var params = operation.getParams();
        var isAppend = params.isAppend;
        if (!isAppend) {
            this.markDestroy();
        }
        /*else{
                    this.getParams().resultSet.combine(params.resultSet);
                    operation.markDestroy();
                }*/
    },

    _combineInsert: function (operation) {
        isc.OperationUtils.destroyWhenLoad(operation, this);
    },

    _combineUpdate: function (operation) {
        isc.OperationUtils.destroyWhenLoad(operation, this);
    },

    _combineDelete: function (operation) {
        isc.OperationUtils.destroyWhenLoad(operation, this);
    },
    _combineCurrent: function (operation) {
        var params = operation.getParams();
        var isAppend = params.isAppend;
        if (!isAppend && (operation.getOperationPosition() < this.getOperationPosition())) {
            operation.markDestroy();
        }
    },
    _combineSelect: function (operation) {
        isc.OperationUtils.destroyWhenLoad(operation, this);
    }

});
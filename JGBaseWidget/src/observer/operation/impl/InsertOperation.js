/**
 * 新增操作
 * @class InsertOperation
 * @extends AbstractOperation
 */
isc.ClassFactory.defineClass("InsertOperation", "AbstractOperation");

isc.InsertOperation.addMethods({

    /**
     * 合并删除
     * 当
     */
    _combineDelete: function (operation) {
        isc.OperationUtils.destroy(this, operation);
    },

    _combineLoad: function (operation) {
        isc.OperationUtils.destroyWhenLoad(this, operation);
    },

    _combineUpdate: function (operation) {
        isc.OperationUtils.opUpdateWhenInsert(this, operation);
    },

    _combineInsert: function (operation) {
        isc.OperationUtils.combine(this, operation);
    }

});
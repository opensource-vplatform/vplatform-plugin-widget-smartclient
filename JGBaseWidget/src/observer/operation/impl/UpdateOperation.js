/**
 * 更新操作
 * @class UpdateOperation
 * @extends AbstractOperation
 */
isc.ClassFactory.defineClass("UpdateOperation", "AbstractOperation");

isc.UpdateOperation.addMethods({

    _combineResuleSet: function (rs, rs1) {
        this._iterate(rs,function(next){
            this._iterate(rs1,function(next1,index){
                if (next.id == next1.id) {
                    var pre = next;
                    var changes = next1;
                    isc.addProperties(pre, changes);
                    rs1.splice(index,1);
                    return false;
                }
            });
        });
        this._iterate(rs1,function(record){
            rs.push(record);
        });
    },

    _combineUpdate: function (operation) {
        var rs = operation.getParams().resultSet,
            _this = this;
        this._iterate(rs,function (rd) {
            _this.setRecordPosition(rd, operation.getRecordPosition(rd));
        });
        this._combineResuleSet(this.getParams().resultSet, rs);
        this._combineResuleSet(this.getParams().oldResultSet, operation.getParams().oldResultSet);
        operation.markDestroy();
    },

    _combineLoad: function (operation) {
        isc.OperationUtils.destroyWhenLoad(this, operation);
    },

    _combineDelete: function (operation) {
        isc.OperationUtils.destroyBefore(this, operation);
    },

    _combineInsert: function (operation) {
        isc.OperationUtils.opUpdateWhenInsert(operation, this);
    }
});
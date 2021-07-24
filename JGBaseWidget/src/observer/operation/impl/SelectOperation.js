/**
 * 选中操作
 * @class SelectOperation
 * @extends AbstractOperation
 */
isc.ClassFactory.defineClass("SelectOperation", "AbstractOperation");

isc.SelectOperation.addMethods({

    _combineLoad: function (operation) {
        isc.OperationUtils.destroyWhenLoad(this, operation);
    },

    _combineDelete: function (operation) {
        isc.OperationUtils.opSelectWhenDelete(this, operation);
    },

    _combineSelect: function (operation) {
        var isSel = this.getParams().isSelect;
        var opSel = operation.getParams().isSelect;
        var rs = this.getParams().resultSet;
        var oRs = operation.getParams().resultSet;
        if (isSel ^ opSel) {
            this._iterate(oRs,function(next,index){
                this._iterate(rs,function(sel,i){
                    if (sel.id == next.id) {
                        if (this.getRecordPosition(sel) > operation.getRecordPosition(next)) {
                            oRs.splice(index,1);
                            index--;
                        } else {
                            rs.splice(i,1);
                        }
                        return false;
                    }
                });
                return index;
            });
            if (oRs.length==0) {
                operation.markDestroy();
            }
            if (rs.length == 0) {
                this.markDestroy();
            }
        } else {
            var _this = this;
            this._iterate(oRs,function (rd) {
                rs.addRecord(rd);
                _this.setRecordPosition(rd, operation.getRecordPosition(rd));
            });
            operation.markDestroy();
        }
    }

});
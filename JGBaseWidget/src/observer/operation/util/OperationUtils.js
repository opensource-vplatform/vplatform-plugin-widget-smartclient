
isc.ClassFactory.defineClass("OperationUtils");

isc.OperationUtils.addClassMethods({

    _iterate:function(rs,handler){
        for(var i=0,l=rs.length;i<l;i++){
            var rd = rs[i];
            var rs = handler.apply(this,[rd,i]);
            if(rs === false){
                break;
            }
        }
    },

    _removeByIndexs : function(rs,indexs){
        var array = indexs.sort(function(item,next){return item-next;});
        while(array.length>0){
            var i = array.pop();
            rs.splice(i,1);
        }
    },

    combine: function(aim,source){
		var params = source.getParams();
		var rs = aim.getParams().resultSet;
        this._iterate(params.resultSet,function(rd){
            aim.setRecordPosition(rd,source.getRecordPosition(rd));
			rs.push(rd);
        });
		source.markDestroy();
	},
	
	destroy: function(before,after){
		var rs = before.getParams().resultSet,opRs=after.getParams().resultSet;
		var remove = [],remove1=[];
        this._iterate(rs,function(rd,i){
			var id = rd.id;
            this._iterate(opRs,function(record,index){
				if((id==record.id)&&(after.getRecordPosition(record)>before.getRecordPosition(rd))){
					remove.push(i);
					remove1.push(index);
					return false;
				}
			});
		});
        this._removeByIndexs(rs,remove);
        this._removeByIndexs(opRs,remove1);
		if(opRs.length==0){
			after.markDestroy();
		}
		if(rs.length==0){
			before.markDestroy();
		}
	},
	
	destroyBefore: function(before,after){
		var bRs = before.getParams().resultSet,aRs=after.getParams().resultSet;
		var remove = [];
		this._iterate(bRs,function(rd,i){
			var id = rd.id;
			this._iterate(aRs,function(record,index){
				if((id==record.id)&&(after.getRecordPosition(record)>before.getRecordPosition(rd))){
					remove.push(i);
					return false;
				}
			});
		});
		this._removeByIndexs(bRs,remove);
		if(bRs.length == 0){
			before.markDestroy();
		}
	},
	
	opUpdateWhenInsert: function(insert,update){
		var resultSet = update.getParams().resultSet;
		var iRs = insert.getParams().resultSet;
		var toRemove = [];
		this._iterate(resultSet,function(rd,index){
			var id = rd.id;
			this._iterate(iRs,function(record){
				if((record.id==id)&&(update.getRecordPosition(rd)>insert.getRecordPosition(record))){
					var pre = rd;
					var changes = record;
					changes = changes||{};
					isc.addProperties(changes,pre);
                    isc.addProperties(record,changes);
					toRemove.push(index);
					return false;
				}
			});
		});
		this._removeByIndexs(resultSet,toRemove);
		if(resultSet.length==0){
			update.markDestroy();
		}
	},
	
	destroyCurrent: function(current,operation){
		var resultSet = operation.getParams().resultSet;
		if(resultSet){
			var id = current.getParams().currentRecord.id;
			this._iterate(resultSet,function(rd,i){
				if(rd.id==id&&(operation.getRecordPosition(id)>current.getRecordPosition(id))){
					current.markDestroy();
					return false;
				}
			});
		}
	},
	
	destroyWhenLoad: function(operation,load){
		var params = load.getParams();
		var isAppend = params.isAppend;
		if(!isAppend){//如果以覆盖方式加载
			var rs = operation.getParams().resultSet;
			if(rs){
				var toRemove = [];
				this._iterate(rs,function(rd,index){
					if(operation.getRecordPosition(rd)<load.getOperationPosition()){
						toRemove.push(index);
					}
				});
				this._removeByIndexs(rs,toRemove);
				if(rs.length==0){
					operation.markDestroy();
				}
			}
		}
	},
	
	opSelectWhenDelete: function(select,deleted){
		var rs = deleted.getParams().resultSet,sRs = select.getParams().resultSet;
		var index = {};
		this._iterate(rs,function(rd){
			index[rd.id]=rd;
		});
		var toRemove = [];
		this._iterate(sRs,function(rd,index){
			var id = rd.id;
			if(index[id]&&(deleted.getRecordPosition(id)>select.getRecordPosition(id))){
				toRemove.push(index);
			}
		});
		this._removeByIndexs(sRs,toRemove);
		if(sRs.length == 0){
			select.markDestroy();
		}
	}
});
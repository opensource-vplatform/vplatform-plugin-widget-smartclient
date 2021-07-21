/**
 * 数据绑定工具类
 * @class DataBindingUtil
 */
isc.ClassFactory.defineClass("DataBindingUtil");
isc.DataBindingUtil.addClassMethods({

    _getVM: function(widget){
        var ds = widget.TableName;
        var id = isc.JGV3ValuesManager.genId(ds.ID, widget.scopeId, widget.code);
        var vm = isc.JGV3ValuesManager.getById(id, ds);
        /*if(null == vm){
            dsName = widget.SourceTableName;
            var extendId = windowScope.getExtendId();
            if(extendId != null){
                var targetId = ScopeManager.checkEntity({
                    scopeId : extendId,
                    datasourceName : dsName
                });
                if(targetId != null){
                    var code = isc.WidgetUtils.genWidgetRefId(targetId, dsName);
                    vm = ScopeManager.createScopeHandler({
                        scopeId : targetId,
                        handler : function(name){
                            id = isc.JGV3ValuesManager.genId(name, targetId, widgetCode);
                            var vm = isc.JGV3ValuesManager.getById(id, widget.dataSource) ;
                            return vm;
                        }
                    })(code);
                }
            }
        }*/
		return vm;
	},

    _filterData: function(fields,record){
		var rs = {};
		for(var i=0,l=fields.length;i<l;i++){
			var field = fields[i];
			rs[field] = record[field];
		}
		rs.id = record.id;
		return rs;
	},

    /**
     * 设置控件值
     * @memberof DataBindingUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Object} record 数据源记录
     */
    setWidgetValue: function(widget,record){
        var vm = isc.DataBindingUtil._getVM(widget);
        if(!widget.getBindFields){
            throw Error("控件未提供getBindFields接口，无法绑定更新回调！控件类型："+widget.getClassName());
        }
        var fields = widget.getBindFields();
		vm.setFieldCodes && vm.setFieldCodes([].concat(fields)); //保存当前绑定的字段
		//复制已有的数据，然后再添加/修改数据，最后同步到vm，不然出现数据被清空的情况
		var oldValues = vm.getValues();
		var newValues = {};
		if(oldValues){
			Object.assign(newValues, oldValues);
		}
//		//存在不绑定控件的字段，但值为null，同步会导致有值的字段被清空的问题
		for(var key in newValues){
			if(newValues.hasOwnProperty(key) && key != "id" && fields.indexOf(key) == -1){
				delete newValues[key];
			}
		}
		var recordData = isc.DataBindingUtil._filterData(fields,record);
		for(var key in recordData){
			if(recordData.hasOwnProperty(key)){
				newValues[key] = recordData[key];
			}
		}
		vm.editRecord(newValues); 
    },

    /**
     * 清空控件值
     * @memberof DataBindingUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     */
    clearWidgetValue: function(widget){
        var vm = isc.DataBindingUtil._getVM(widget);
		vm.clearValues();
    },

    /**
     * 绑定控件事件
     * @memberof DataBindingUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {String} eventName 事件名称
     * @param {Function} handler 事件回调
     */
    bindEvent: function (widget, eventName, handler) {
        widget.on(eventName, handler);
    }
});
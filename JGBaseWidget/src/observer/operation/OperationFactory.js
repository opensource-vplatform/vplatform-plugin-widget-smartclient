/**
 * 数据源操作工厂
 */
isc.ClassFactory.defineClass("OperationFactory");

isc.OperationFactory.addClassProperties({

    contructopMap : {
        "CURRENT": isc.CurrentOperation,
        "DELETE": isc.DeleteOperation,
        "LOAD": isc.LoadOperation,
        "FETCH": isc.FetchOperation,
        "FETCHED": isc.FetchedOperation,
        "INSERT": isc.InsertOperation,
        "SELECT": isc.SelectOperation,
        "UPDATE": isc.UpdateOperation
    }

});

isc.OperationFactory.addClassMethods({

    create : function(params){
        var eventName = params.eventName;
		var Contructor = isc.OperationFactory.contructopMap[eventName];
		Contructor = Contructor ? Contructor:isc.UnknowOperation;
		/**
		 * 处理错误场景：当使用窗体集成时，父窗体数据源被子窗子控件绑定，
		 * 此时数据源Observer存在两个（父、子窗体），
		 * 当进行动作合并时，事件参数是引用关系，会操作到resultSet，导致另外一个窗体拿到的数据不正确引发问题
		 * 解决方案：将resultSet克隆
		 */
		var paramObj = Object.create(params);
		if(paramObj.resultSet){
			paramObj.resultSet = paramObj.resultSet.concat([]);
		}
        return Contructor.create({params:paramObj})
    }

});
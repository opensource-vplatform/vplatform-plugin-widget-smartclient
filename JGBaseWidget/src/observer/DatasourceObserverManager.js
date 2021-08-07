isc.ClassFactory.defineClass("DatasourceObserverManager");

isc.DatasourceObserverManager.addClassProperties({

    asyncObservers: [],

    unAsyncObservers: []

});

isc.DatasourceObserverManager.addClassMethods({

    /**
	 * 添加observer
	 * @param {Observer} observer实例
	 */
	addObserver: function(datasource,observer){
		var dsName = observer.getDatasourceName();
		var scopeId = windowMappingManager.getScopeId(dsName);
		var id = uuid.generate();
		scopeManager.createScopeHandler({
			scopeId : scopeId,
			handler : function(){
				var storage = _getObserverStorage();
				observer.setInstanceId(id);
				//是否是异步观察者
				var isAsync = observer.isAsync();
				var observers = storage.get(dsName);
				if(storage.containsKey(dsName)){
					observers = storage.get(dsName);
				}else{
					observers = {};
					observers[AsyncKey] = [];
					observers[NotAsyncKey] = [];
					storage.put(dsName,observers);
				}
				if(isAsync){
					observers[AsyncKey].push(observer);
				}else{
					observers[NotAsyncKey].push(observer);
				}
			}
		})();
	}

});
	
	var _getObserverStorage = function(){
		var scope = scopeManager.getScope();
		var storage;
		if(scope.has(storageToken)){
			storage = scope.get(storageToken);
		}else{
			storage = storageManager.newInstance(storageManager.TYPES.MAP);
			scope.set(storageToken,storage);
		}
		return storage;
	}
	
	
	/**
	 * 触发observer
	 * @param {Object} params 参数信息
	 * {
	 * 		"datasourceName" : {String} 数据源名称
	 * 		"eventName" : {Datasource.Events} 事件
	 * 		"resultSet" : {ResultSet} 结果集
	 * }
	 */
	exports.fire = function(params){
		if(_combineOperation){
			datasourceOperationManager.addOperation(params);
			var storage = _getObserverStorage();
			var ds = params.datasource;
			var metadata = ds.getMetadata();
			var dsName = metadata.getDatasourceName();
			if(storage.containsKey(dsName)){
				var observers = storage.get(dsName);
				var notAsync = observers[NotAsyncKey];
				for(var i=0,observer;observer=notAsync[i];i++){
					observer.fire(params);
				}
			}
		}else{
			this._callAsyncObservers(params);
		}
	}
	
	exports._callAsyncObservers = function(params){
		var storage = _getObserverStorage();
		var ds = params.datasource;
		var metadata = ds.getMetadata();
		var dsName = metadata.getDatasourceName();
		if(storage.containsKey(dsName)){
			var observers = storage.get(dsName);
			var asyncObservers = observers[AsyncKey];
			for(var i=0,observer;observer=asyncObservers[i];i++){
				observer.fire(params);
			}
		}
	}
	
	/**
	 * 获取已有观察者的数据源名称 
	 * @return Array
	 */
	exports.getBindedDatasourceNames = function(){
		var storage = _getObserverStorage();
		var rs = [];
		storage.iterate(function(dsName,observers){
			rs.push(dsName);
		});
		return rs;
	}
	/**
	 *  销毁
 	 *	 @param {Object} ids
	 */
	exports.destroy = function(ids){
		var storage = _getObserverStorage();
		for(var i=0,l=ids.length;i<l;i++){
			storage.iterate(function(key,val){
				var asyncData = val[AsyncKey];
				for(j=0; j<asyncData.length; j++){
					if(ids[i]==asyncData[j].getInstanceId()){
						arrayUtil.remove(asyncData,asyncData[j]);
					}
				}
				var notAsync = val[NotAsyncKey];
				for(j=0;j<notAsync.length;j++){
					if(ids[i]==notAsync[j].getInstanceId()){
						arrayUtil.remove(notAsync,notAsync[j]);
					}
				}
			});
		}
	}
	
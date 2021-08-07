define('./DatasourceOperationManager',function(require, exports, module){
	
	var observerManager,operationFactory,token="WINDOW_INSTANCE_OBSERVER_COMBINE_STORAGE",scopeManager,storageManager,DatasourceObserver,ScopeTask,taskManager;
	
	var observerTask = {};
	
	exports.initModule = function(sb){
		observerManager = require("vjs/framework/extension/platform/data/manager/runtime/observer/api/DatasourceObserverManager");
		operationFactory = require("vjs/framework/extension/platform/data/manager/runtime/observer/impl/OperationFactory");
		scopeManager = sb.getService("vjs.framework.extension.platform.interface.scope.ScopeManager");
		storageManager = sb.getService("vjs.framework.extension.platform.interface.storage.StorageManager");
		DatasourceObserver = require("vjs/framework/extension/platform/data/manager/runtime/observer/impl/DatasourceObserver");
		ScopeTask = sb.getService("vjs.framework.extension.platform.global.task.ScopeTask");
		taskManager = sb.getService("vjs.framework.extension.platform.global.task.TaskManager");
	}
	
	var getDatasourceObserver = function(datasourceName){
		var scope = scopeManager.getWindowScope();
		var storage;
		if(scope.has(token)){
			storage = scope.get(token);
		}else{
			storage = storageManager.newInstance(storageManager.TYPES.MAP);
			scope.set(token,storage);
		}
		if(storage.containsKey(datasourceName)){
			return storage.get(datasourceName);
		}else{
			var observer = new DatasourceObserver(datasourceName);
			storage.put(datasourceName,observer);
			return observer;
		}
	}
	
	var getAll = function(){
		var scope = scopeManager.getWindowScope();
		var storage = scope.get(token);
		var rs = [];
		if(storage){
			storage.iterate(function(key,val){
				rs.push(val);
			});
		}
		return rs;
	}
	
	var apply = function(){
		var scopeId = getScopeId();
		delete observerTask[scopeId];
		var observers = getAll();
		for(var i=0,len=observers.length;i<len;i++){
			var observer = observers[i];
			observer.combine();
			var operations = observer.getOperations();
			observer.clear();
			for(var j=0,l=operations.length;j<l;j++){
				observerManager._callAsyncObservers(operations[j].getParams());
			}
		}
	}
	
	var getScopeId = function(){
		var scope = scopeManager.getWindowScope();
		return scope.getInstanceId();
	}
	
	var addObserverTask = function(){
		var instanceId = getScopeId();
		if(!observerTask.hasOwnProperty(instanceId)){
			var scopeTask = new ScopeTask(instanceId,true,apply);
			taskManager.addTask(scopeTask);
			observerTask[instanceId]=true;
		}
	}
	
	exports.addOperation = function(params){
		var operation = operationFactory.create(params);
		var ds = params.datasource;
		var metadata = ds.getMetadata();
		var dsName = metadata.getDatasourceName();
		var observer = getDatasourceObserver(dsName);
		observer.addOperation(operation);
		addObserverTask();
	}
	
});
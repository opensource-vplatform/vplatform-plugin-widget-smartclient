

isc.ClassFactory.defineClass("JGFormLayout", "JGFormWidget");

isc.JGFormLayout.addProperties({
	lastValidateResult: true,
	//子控件额外事件，因为注册item事件(registerItemEventHandler)只有一个函数,在JGFormLayout注册，但是每个子控件另有自己的事件，先在JGFormLayout设置切面，让子控件注入事件
	itemExtraEvents: {}
});
isc.JGFormLayout.addMethods({
	hasGroupSelection: function () {
		var parentElement = this._getParentWidget(this.Code);
		if ((this.Dock == "Top" || (parentElement && parentElement.ContentAlignment == "Vertical")) && this.hasGroupTitle()) {
			this.isGroup = false;
			return true;
		}
		return false;
	},
	init: function () {
		if(!this.ID){
			//去除此逻辑，会引发条件状态设置中条件值为实体字段失效
			this.ID = this.Code + "_" + (new Date).getTime();
		}
		var ret = this.Super("init", arguments);
		this.initDataBinding();
		this.initEvent();
		return ret;
	},
	/**
	 * 注册表单项额外事件，先触发额外事件，再触发其他事件（触发顺序可以调整）
	 * @param	{String}	itemCode	表单项编码
	 * @param	{String}	eventCode	事件编码
	 * @param	{Function}	handler		事件
	 * */
	registerItemExtraEvent: function (itemCode, eventCode, handler) {
		this.itemExtraEvents[eventCode] = handler;
	},
	/**
	 * 触发表单项额外事件
	 * @param	{String}	itemCode	表单项编码
	 * @param	{String}	eventCode	事件编码
	 * @param	{Array}		args		事件参数
	 * */
	fireItemExtraEvent: function (itemCode, eventCode, args) {
		if (typeof (this.itemExtraEvents[eventCode]) == "function") {
			this.itemExtraEvents[eventCode].apply(this, args);
		}
	},
	/**
	 * 判断表单项是否存在额外事件
	 * @param	{String}	itemCode	表单项编码
	 * @param	{String}	eventCode	事件编码
	 * */
	existItemExtraEvent: function (itemCode, eventCode) {
		return typeof (this.itemExtraEvents[eventCode]) == "function";
	},
	validateWidget: function () {
		var valid;
		if (this.Visible === false) {
			valid = true;
		} else
			valid = this.validate();
		this.lastValidateResult = valid;
		return valid;
	},
	itemChanged: function (item, newValue) {
		this.Super("itemChanged", arguments);
		//				this.notifyParentValidateChanged();
	},
	notifyParentValidateChanged: function () {
		var parentElement = this.parentElement;
		while (parentElement) {
			if (parentElement.onChildValidateResultChanged) {
				parentElement.onChildValidateResultChanged(true)
			}
			parentElement = parentElement.parentElement;
		}
	},
	firePlatformEventBefore: function (eventName, proxyWidgetCode, itemCode) {
		if (itemCode) {
			var item = this.getItemByCode(itemCode);
			if (item && typeof (item.firePlatformEventBefore) == "function") {
				item.firePlatformEventBefore(eventName);
			}
		}
	},
	firePlatformEventAfter: function (eventName, proxyWidgetCode, itemCode) {
		var item = this.getItemByCode(itemCode);
		if (item && typeof (item.firePlatformEventAfter) == "function") {
			item.firePlatformEventAfter(eventName);
		}
	},

	initEvent: function () {
		var dsInfo = this.multiDataSourceInfo;
		//处理多数据源实体加载和改变
		var _this = this;
		for (var dsName in dsInfo) {
			var ds = isc.JGDataSourceManager.get(this, dsName);
			if (ds) {
				ds.on(ds.Events.UPDATE, null, function (params) {
					var items = _this.getItems();
					if (items && items.length > 0) {
						var resultSet = params.resultSet;
						var datasource = params.datasource;
						for (var i = 0, l = items.length; i < l; i++) {
							var item = items[i];
							if (!item.getValueChangeFields) continue;
							var fields = item.getValueChangeFields();
							if (fields && fields.length > 0) {
								var founded = false;
								for (var j = 0, len = fields.length; j < len; j++) {
									var fieldName = fields[j];
									for (var k = 0, length = resultSet.length; k < length; k++) {
										var changedData = resultSet[k];
										if (changedData) {
											for (var key in changedData) {
												if (datasource.dbName + item.form.multiDsSpecialChar + key === fieldName || ds.dbName + item.form.multiDsSpecialChar + key === item.EndColumnName) {
													founded = true;
													break;
												}
											}
										}
									}
									if (founded) {
										break;
									}
								}
								if (founded) {
									_this._eventHandler(item.Code, "OnValueChanged")();
								}
							}
						}
					}
				});
				ds.on(ds.Events.LOAD, null, function (params) {
					var items = _this.getItems();
					if (items && items.length > 0) {
						for (var i = 0, l = items.length; i < l; i++) {
							var item = items[i];
							_this._eventHandler(item.Code, "OnValueLoaded")();
						}
					}
				});
				ds.on(ds.Events.DELETE, null, function (params) {
					var records = params.datasource && params.datasource.getAllRecords();
					if (records) {
						if (records.length == 0) {
							_this.clearErrors();
						}
					}
				});
			}
		}
		//处理表单项值改变事件

		var handler = function (itemCode, eventCode, args) {
			//触发表单项额外事件
			if (_this.existItemExtraEvent(itemCode, eventCode)) {
				_this.fireItemExtraEvent(itemCode, eventCode, args);
			}
			var success = typeof (args[0]) == "function" ? args[0] : null;
			var fail = typeof (args[1]) == "function" ? args[1] : null;
			var hd = _this._eventHandler(itemCode, eventCode, success, fail);
			hd();
		}
		this.registerItemEventHandler(handler);
		this.registerV3ExpressionHandler(this._expressionHandler);
		var fields = this.fields;
		if (fields && fields.length > 0) {
			for (var i = 0, l = fields.length; i < l; i++) {
				var field = fields[i];
				var type = field.type;
				if(this["initEvent"+type]){
					this["initEvent"+type](field.Code);
				}
			}
		}
		this.fields.forEach(function (item) {
			if (item.type == "JGRadioGroup") {
				_this.setValueMapJGRadioGroup(item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
			} else if (item.type === 'JGComboBox') {
				_this.setValueMapJGComboBox(item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
			} else if (item.type === 'JGCheckBoxGroup') {
				_this.setValueMapJGCheckBoxGroup(item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
			} else if (item.type === 'JGBaseDictBox') {
				if (item.DropDownSource) {
					item.DropDownSource = typeof(item.DropDownSource)=="string" ?JSON.parse(item.DropDownSource):item.DropDownSource;
					_this.setValueMapJGBaseDictBox(item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
				}
			}
			item._validators = item.validators;
		})
	},

	/**
	 * 获取默认值
	 */
	getDefaultValue: function (field) {
		var defValue = null;
		var widget = this;
		var items = widget.getItemsByFields(field);
		if (items) {
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items[i];
				defValue = this.getWidgetDefaultValue(item, widget);
			}
		} else {
			var item = widget.getItemByCode(field);
			if (item) {
				defValue = this.getWidgetDefaultValue(item, widget);
			}
		}
		return defValue;
	},

	getWidgetDefaultValue: function (item, widget) {
		var defValue;
		var exp = item.getV3DefaultValue ? item.getV3DefaultValue() : item.DefaultValue;
		if (item.type == "JGCheckBox" && exp != null) {
			exp = typeof (item.DefaultValue) == "string" ? item.DefaultValue : "" + item.DefaultValue;
		}
		if (exp == null || exp == "") {
			defValue = "";
			if (widget.type === "JGQueryConditionPanel" && item.type != "JGCheckBox") {
				defValue = null;
			}
		} else if (typeof (exp) == "object") {
			defValue = exp;
		} else {
			defValue = this._expressionHandler(exp);
		}
		return defValue;
	},

	/**
	 * 修改使能属性
	 */
	setItemEnabled: function (itemCode, isEnable) {
		var item = this.getV3Item(itemCode);
		//放在开头是避免赋值Enabled或者setDisabled影响了readonly，其实isReadOnly里的逻辑不应该把使能和只读混一起的
		var readonly = item.isReadOnly();
		item.Enabled = isEnable;
		item.validators = isEnable && !item.ReadOnly ? item._validators ? item._validators : item.IsMust ? [{
			type: "required"
		}] : null : null;
		//    	if(item.type == "JGBaseDictBox"){
		//    		var enabled = !item.ReadOnly && isEnable;//使能和只读不一样的属性，不能混一起
		//    		item.setDisabled(!isEnable);
		//    	}else{
		//    		item.setDisabled(!isEnable);
		//    	}
		item.setDisabled(!isEnable);

		if (isEnable && item.ReadOnly != readonly) { //兼容处理：使能属性配置为false，初始化时会把只读变成true
			item.setCanEdit(!item.ReadOnly);
		}
		item.redraw();
	},

	/**
	 * 修改显示属性
	 */
	setItemVisible: function (itemCode, isShow) {
		var item = this.getV3Item(itemCode);
		if ((item.type == "JGButton" || item.type == "JGPassword") && item._ReadOnly) {
			return;
		}
		item.Visible = isShow;
		if (isShow) {
			item.show();
		} else {
			item.hide();
		}
		if (this.type == "JGQueryConditionPanel") {
			if (this.setItemVisible) { //Task20200527029
				this.setItemVisible(item, isShow);
			}
			if (this.setFooterBtnCol) {
				this.setFooterBtnCol();
			}
			if (this.formLayout && this.formLayout.redraw) {
				this.formLayout.redraw()
			}
		}
	},

	getItemReadOnly: function (itemCode) {
		var item = this.getV3Item(itemCode);
		return item.isReadOnly();
	},

	getItemEnabled: function (itemCode) {
		var item = this.getV3Item(itemCode);
		return !item.isDisabled();
	},

	getVisible: function () {
		return this.getVisible();
	},

	getV3Item: function (itemCode) {
		return this.getItemByCode(itemCode);
	},
	/**
	 * 初始化数据绑定
	 */
	initDataBinding: function () {
		var widget = this;
		var dsList = widget.getMultiDataSourceInfo();
		this.bindWidgetToDatasource(this.TableName);
		if (dsList) {
			for (var dsName in dsList) {
				var ds = isc.JGDataSourceManager.get(this,dsName);
				if(!ds){
					continue;
				}
				var fields = dsList[dsName].fields;
				var observer = isc.CurrentRecordObserver.create({
					fields: fields,
					setValueHandler: (function (_fields) {
						return function (record,datasource) {
							var dsName = datasource.dbName;
							var prefix = dsName + widget.multiDsSpecialChar;
							var oldVals = widget.getValues();
							var id;
							if (oldVals && oldVals.id) {
								id = oldVals.id;
							} else {
								var record = datasource.createRecord();
								id = record.id;
								widget.dataSource.addData(record, null, {});
							}
							var data = {};
							if (oldVals) {
								Object.assign(data, oldVals);
							}
							data.id = id;
							data[prefix + "id"] = record.id;
							for (var i = 0, l = _fields.length; i < l; i++) {
								var fieldCode = _fields[i];
								if (fieldCode.indexOf(widget.multiDsSpecialChar) != -1) {
									fieldCode = fieldCode.split(widget.multiDsSpecialChar)[0];
								}
								data[prefix + fieldCode] = record[fieldCode];
							}
							widget.setValues(data);
						}
					})(fields),
					clearValueHandler: (function (_dsName, _fields) {
						return function () {
							var data = widget.values;
							if (data) {
								try {
									for (var i = 0, l = _fields.length; i < l; i++) {
										var fieldCode = _fields[i];
										if (fieldCode.indexOf(widget.multiDsSpecialChar) != -1) {
											delete data[fieldCode];
										} else {
											delete data[_dsName + widget.multiDsSpecialChar + fieldCode];
										}
									}
								} catch (e) {}
								widget.setValues(data);
							}
						}
					})(dsName, fields)
				});
				ds.addObserver(observer);
			}
		} else {
			var fields = [];
			var items = widget.getItems();
			if (items && items.length > 0) {
				for (var i = 0, l = items.length; i < l; i++) {
					var item = items[i];
					if (item && item.getBindFields) {
						var fieldCodes = item.getBindFields();
						if (fieldCodes && fieldCodes.length > 0) {
							for (var j = 0, len = fieldCodes.length; j < len; j++) {
								var fieldCode = fieldCodes[j];
								if (fieldCode && fieldCode.length > 0 && fields.indexOf(fieldCode) == -1) {
									fields.push(fieldCode);
								}
							}
						}
					}
				}
			}

			var observer = isc.CurrentRecordObserver.create({
				fields:fields,
				setValueHandler:function (record,datasource) {
					var data = {
						id: record.id
					};
					record = datasource.getRecordById(record.id);
					for (var i = 0, l = fields.length; i < l; i++) {
						var fieldCode = fields[i];
						data[fieldCode] = record[fieldCode];
					}
					widget.setValues(data);
				},
				clearValueHandler: function () {
					widget.clearValues();
				}
			});
			widget.TableName.addObserver(observer);
		}
	},

	bindWidgetToDatasource: function(dataSource){
		var _newDS = dataSource;
		 var dsList = this.getMultiDataSourceInfo();
		 if (dsList) {
			 var newDsName = [];
			 var newFields = [];
			 for (var dsName in dsList) {
				 var dsObj = dsList[dsName].datasource;
				 dsObj = isc.JGDataSourceManager.get(this,dsName);
				 if (dsObj) {
					 dsList[dsName].datasource = dsObj;
					 var fields = dsObj.getFields();
					 newDsName.push(dsName);
					 for(var fieldName in fields){
						if(fields.hasOwnProperty(fieldName)){
							var field = fields[fieldName];
							var newField = {
								name: dsName + this.multiDsSpecialChar + field.name,
								title: field.title,
								type: field.type
							};
							newFields.push(newField)
						}
					 }
				 }
			 }
			 newFields.push({
				 name : "id",
				 title: "主键",
				 primaryKey: true,
				 type : "text"
			 });
			 _newDS = isc.V3MultiDatasource.create({
				dbName:newDsName.join(this.multiDsSpecialChar),
				scopeId:this.scopeId,
				clientOnly: true,
				fields:newFields,
				multiDsSpecialChar: this.multiDsSpecialChar,
				dataList: dsList
			 });
		 }
		 this.bindDataSource(_newDS);
	},

	/*initEvent: function () {
		var widget = this;
		var dsInfo = widget.multiDataSourceInfo;
		var ds = null;
		//处理多数据源实体加载和改变
		for(var dsName in dsInfo){
			ds = isc.JGDataSourceManager.get(this,dsName);
			if(ds){
				ds.on({
					eventName: ds.Events.UPDATE,
					handler: function (params) {
						var items = widget.getItems();
						if (items && items.length > 0) {
							var resultSet = params.resultSet;
							for (var i = 0, l = items.length; i < l; i++) {
								var item = items[i];
								if (!item.getValueChangeFields) continue;
								var fields = item.getValueChangeFields();
								if (fields && fields.length > 0) {
									var founded = false;
									for (var j = 0, len = fields.length; j < len; j++) {
										for(var k=0,length = resultSet.length;k<length;k++){
											var changedData = resultSet[k];
											if(changedData){
												for(var key in changedData){
													if(record.metadata.dataSourceName + item.form.multiDsSpecialChar + key === item.name || record.metadata.dataSourceName + item.form.multiDsSpecialChar + key === item.EndColumnName){
														founded = true;
														return false;
													}
												}
											}
										}
										resultSet.iterate(function (record) {
											var changedData = record.getChangedData();
											
										});
										if (founded) {
											break;
										}
									}
									if (founded) {
										var handler = eventManager.fireEvent(item.Code, "OnValueChanged");
										handler();
									}
								}
							}
						}
					}
				});
				ds.on({
					eventName: ds.Events.LOAD,
					handler: function (params) {
						var wd = widgetContext.get(widgetCode, "widgetObj");
						var metdata = params.datasource.getMetadata();
						var fields = metdata.getFieldCodes();
						var items = wd.getItemsByFields(fields);
						var items = wd.getItems();
						if (items && items.length > 0) {
							for (var i = 0, l = items.length; i < l; i++) {
								eventManager.fireEvent(items[i].Code, "OnValueLoaded")();
							}
						}
					}
				});
				ds.on({
					eventName:ds.Events.DELETE,
					handler:function(params){
						var records = params.datasource && params.datasource.getAllRecords();
						if(records){
							if(records.datas.length == 0){
								var wd = widgetContext.get(widgetCode, "widgetObj");
								wd.clearErrors();
							}
						}
					}
				})
			}
		}
		//处理表单项值改变事件
		
		var handler = function (itemCode, eventCode, args) {
			//触发表单项额外事件
			if(widget.existItemExtraEvent(itemCode, eventCode)){
				widget.fireItemExtraEvent(itemCode, eventCode, args);
			}
			var success = typeof(args[0]) == "function" ? args[0] : null;
			var fail = typeof(args[1]) == "function" ? args[1] : null;
			var hd = widget._eventHandler(itemCode, eventCode, success, fail);
			hd();
		}
		widget.registerItemEventHandler(handler);
		widget.registerV3ExpressionHandler(this._expressionHandler);
		var fields = widget.fields;
		if(fields&&fields.length>0){
			for(var i=0,l=fields.length;i<l;i++){
				var field = fields[i];
				var type = field.type;
				if(this["initEvent"+type]){
					this["initEvent"+type](field.Code);
				}
			}
		}
		widget.fields.forEach(function(item){
    		if(item.type == "JGRadioGroup"){
				widget.setValueMapJGRadioGroup(item.Code,item.DropDownSource,item.IDColumnName,item.ColumnName);
    		}else if(item.type === 'JGComboBox'){
				widget.setValueMapJGComboBox(item.Code,item.DropDownSource,item.IDColumnName,item.ColumnName);
    		}else if(item.type === 'JGCheckBoxGroup'){
				widget.setValueMapJGCheckBoxGroup(item.Code,item.DropDownSource,item.IDColumnName,item.ColumnName);
    		}else if(item.type === 'JGBaseDictBox'){
    			if(item.DropDownSource){
    				item.DropDownSource = JSON.parse(item.DropDownSource);
					widget.setValueMapJGBaseDictBox(item.Code,item.DropDownSource,item.IDColumnName,item.ColumnName);
    			}
    		}
    		item._validators = item.validators;
    	})
	},*/

	/**
     * 修改只读属性
     */
	 setItemReadOnly: function(itemCode, isReadonly){
    	if(this.canEditReadOnly === false){//窗体只读且不允许修改
    		return;
    	}
    	var item = this.getV3Item(itemCode);
		item.ReadOnly = isReadonly;
		item.validators = isReadonly || !item.Enabled ? null : item._validators ? item._validators : item.IsMust ? [{type:"required"}] : null;
		if(item.type == "JGBaseDictBox"){
			isReadonly = isReadonly || !item.Enabled;
		}
		item.setCanEdit(!isReadonly);
		item.redraw();
    },

	getItemVisible: function (itemCode) {
		var item = this.getV3Item(itemCode);
		return item.isVisible();
	},

	setItemIsMust: function(itemCode,isMust){
		var item = this.getV3Item(itemCode);
		item.IsMust = isMust;
		item.setRequired(isMust);
		if(!isMust){
			item.validate();
		}
	}
});

isc.JGFormLayout.addClassMethods({

	/**
	 * 获取最大标题长度
	 * @param	{Object}	params
	 * {
	 * 		"calculateLength"	{Function}	计算长度函数，参数1：标题(String)
	 * 		"property"			{Object}	控件属性,
	 * 		"fieldName"			{String}	字段标识，默认fields
	 * }
	 * @return {Number}	最大标题长度
	 * */
	 getMaxTitleLength: function (params) {
		var maxLength = 0;
		var fieldWidgets = params.property.fields;
		if (params.fieldName) {
			fieldWidgets = params.property[params.fieldName];
		}
		params.property._$isAutoTitleWidth = true;
		if (fieldWidgets && fieldWidgets.length > 0) {
			isc.JGFormLayout.MaxTitleLengthFunc = params.calculateLength;
			for (var i = 0, len = fieldWidgets.length; i < len; i++) {
				var fieldWidget = fieldWidgets[i];
				if (fieldWidget.type == "JGLabel") {
					continue;
				}
				var titleLen = params.calculateLength(fieldWidget.SimpleChineseTitle);
				if (titleLen > maxLength) {
					maxLength = titleLen;
				}
			}
		}
		return maxLength;
	},

	processFormLayout: function (widget, infos) {
		var fields = widget.fields;
		if (!fields)
			return;
		for (var i = 0, len = fields.length; i < len; i++) {
			var field = fields[i];
			var info = infos[field.SourceTableName];
			if (!info)
				continue;
			isc.JGFormLayout.setFormat(field,infos);
		}
	},

	setFormat: function (field,currencyFields) {
		for (var key in currencyFields) {
			if (field.SourceTableName == key) {
				if (field.ColumnName && currencyFields[key][field.ColumnName]) {
					var ColumnDisplay = currencyFields[key][field.ColumnName];
					field.DisplayFormat = {
						displayFormat: ColumnDisplay.displayFormat ? ColumnDisplay.displayFormat : field.DisplayFormat.displayFormat,
						numType: ColumnDisplay.displayFormat ? ColumnDisplay.numType : field.DisplayFormat.displayFormat,
						Index: field.DisplayFormat.Index
					}
				}
				if (field.StartColumnName && currencyFields[key][field.StartColumnName]) {
					var startColumnDisplay = currencyFields[key][field.StartColumnName];
					field.StartDisplayFormat = {
						displayFormat: startColumnDisplay.displayFormat ? startColumnDisplay.displayFormat : field.DisplayFormat.displayFormat,
						numType: startColumnDisplay.displayFormat ? startColumnDisplay.numType : field.DisplayFormat.displayFormat,
						Index: field.DisplayFormat.Index
					}
				}
				if (field.EndColumnName && currencyFields[key][field.EndColumnName]) {
					var endColumnDisplay = currencyFields[key][field.EndColumnName];
					field.EndDisplayFormat = {
						displayFormat: endColumnDisplay.displayFormat ? endColumnDisplay.displayFormat : field.DisplayFormat.displayFormat,
						numType: endColumnDisplay.displayFormat ? endColumnDisplay.numType : field.DisplayFormat.displayFormat,
						Index: field.DisplayFormat.Index
					}
				}
			}
		}
	},

	updateProperty: function (parmas) {
		if (!parmas || !parmas.propertys || !parmas.widget) {
			return;
		}
		var propertyMap = parmas.propertys;
		var widget = parmas.widget;
		var propertys = propertyMap.Properties;
		if (propertys) {
			for (var property in propertys) {
				if (propertys.hasOwnProperty(property)) {
					var val = propertys[property];
					if ((property == "MultiWidth" || property == "MultiHeight") && typeof (val) == "number") {
						widget[property] = val + "";
					} else if (property == "NumCols" && typeof (val) == "string") {
						widget[property] = Number(val);
					} else if (property == "TitleWidth") {
						widget[property] = propertys[property];
						if (val == "auto") {
							var titleWidth = isc.JGFormLayout.getMaxTitleLength({
								"calculateLength": isc.JGFormLayout.MaxTitleLengthFunc,
								"property": widget,
								"fieldName": "fields" //最新标题在此处
							});
							widget[property] = titleWidth;
						}
					} else {
						widget[property] = propertys[property];
					}
				}
			}
		}
		var childProps = propertyMap.Widgets;
		if (childProps) {
			var fieldsMap = {};
			var fields = widget.fields;
			for (var i = 0, len = fields.length; i < len; i++) {
				var field = fields[i];
				fieldsMap[field.Code] = field;
			}
			var newFields = [];
			var existId = [];
			for (var i = 0, len = childProps.length; i < len; i++) {
				var childProp = childProps[i];
				var widgetId = childProp.WidgetCode;
				existId.push(widgetId);
				var sourceField = fieldsMap[widgetId];
				newFields.push(sourceField);
				var cp = childProp.Properties;
				if (cp) {
					for (var key in cp) {
						if (cp.hasOwnProperty(key)) {
							var val = cp[key];
							if (key == "LabelText") {
								sourceField.SimpleChineseTitle = val;
							} else if ((key == "MultiWidth" || key == "MultiHeight") && typeof (val) == "number") {
								sourceField[key] = val + "";
							} else if (key == "NumCols" && typeof (val) == "string") {
								sourceField[key] = Number(val);
							} else if (key == "DefaultValue") {
								if (Number(val) + "" == "NaN" && val != "true" && val != "false") {
									val = "\"" + val + "\""
								}
								sourceField[key] = val;
							} else {
								sourceField[key] = val;
							}
						}
					}
				}
			}
			for (var i = 0, len = fields.length; i < len; i++) {
				var field = fields[i];
				var widgetId = field.Code;
				if (existId.indexOf(widgetId) == -1) {
					newFields.push(field)
				}
			}
			widget.fields = newFields;
		}
	}

});
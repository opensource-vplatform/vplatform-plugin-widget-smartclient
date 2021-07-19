/**
 * 下拉选择控件
 * @class JGComboBox
 * @extends JGBaseWidget
 * @mixes IWindowAop
 * @example
 * var ds = isc.V3Datasource.create({
 * 	fields:[{
 * 		id : ""
 * 	}]
 * });
 * isc.JGComboBox.create({
 * 	TableName: ds,
 * 	autoDraw: true
 * });
 */

isc.ClassFactory.defineClass("JGComboBox", "JGBaseFormWidget");
isc.ClassFactory.mixInInterface("JGComboBox", "IWindowAop");

isc.addGlobal("JGComboBox", isc.JGComboBox);

isc.JGComboBox.addProperties({
	listener: [
		'click',
		'focus',
		'blur',
		'expand',
		'keydown',
		'loaddata',
		'labelclick'
	],

	/**
	 * 数据值
	 */
	valueField: 'iDColumnName',

	/**
	 * 文本值
	 */
	textField: 'columnName',

	DropDownSource: null,
	WidgetStyle: "JGComboBox",
	//下来选择不需要值校验(跟zhangll沟通) add by xiedh 2014-03-28
	disableValidation: true,

	dropdownSourceHandler: function(){}

});

isc.JGComboBox.addMethods({
	_initProperties: function (properties) {
		this.TitleWidth = properties.TitleWidth = properties.LabelWidth;
		this.textField = "";
		this.valueField = "";
		if (properties.ColumnName) {
			this.textField = properties.ColumnName;
		} else {
			this.textField = "ColumnName";
			this.ColumnName = "ColumnName";
		}
		if (properties.IDColumnName) {
			this.valueField = properties.IDColumnName;
		} else {
			this.IDColumnName = "IDColumnName";
			this.valueField = "IDColumnName";
		}
		this.NumCols = 1; //内部使用表单布局
		if (this.WidgetStyle == "JGComboBox") {
			this.WidgetStyle = "JGFormIcon";
		}
		this.className += " JGComboBox";
		var _this = this;
		this.items = [isc.addProperties(properties, {
			type: "V3ComboBoxItems",
			isAbsoluteForm: true,
			getData: function () {
				return _this.getDropDownSource();
			}
		})]
		this._observerDropdownSource();
	},
	_observerDropdownSource: function(){
		var dropDownSource = this.getDropDownSource();
        if (typeof dropDownSource !== "object") {
			try{
            	dropDownSource = isc.JSON.decode(dropDownSource);
			}catch(e){}
        }
        if (dropDownSource && dropDownSource.DataSourceSetting && dropDownSource.DataSourceSetting.DataSourceType == "Entity") {
            var dataSourceSetting = dropDownSource.DataSourceSetting;
            var dataConfig = dataSourceSetting.DataConfig;
            var entityName = dataConfig.SourceName;
            if (entityName) {
				var datasource = isc.JGDataSourceManager.get(this,entityName);
				if(datasource){
					var _this = this;
					//DB加载
					datasource.on(datasource.Events.LOAD,null,function(){
						_this.dropdownSourceHandler();
					});
					//DB新增
					datasource.on(datasource.Events.UPDATE,null,function(){
						_this.dropdownSourceHandler();
					});
					//DB删除
					datasource.on(datasource.Events.DELETE,null,function(){
						_this.dropdownSourceHandler();
					});
				}
            }
        }
	},
	editRecord: function (record) {
		if (this.valueMap) {
			var obj = {};
			isc.addProperties(obj, record);
			var needToSave = false;
			//补全字段值
			if (record && !record.hasOwnProperty(this.textField) && record.hasOwnProperty(this.valueField)) {
				obj[this.textField] = this.valueMap[obj[this.valueField]];
				needToSave = true;
			} else if (record && !record.hasOwnProperty(this.valueField) && record.hasOwnProperty(this.textField)) {
				var textVal = obj[this.textField];
				for (var attr in this.valueMap) {
					if (textVal == this.valueMap[attr]) {
						obj[this.valueField] = attr;
						needToSave = true;
						break;
					}
				}
			}
			var rs = this.editRecord(obj);
			if (needToSave) {
				//this.dataSyn();
			}
			return rs;
		}
		return this.editRecord(record);
	},
	/**
	 * 加载数据，旧的数据会被替换
	 * 
	 * @param {Object}
	 *            data 传递的数据
	 */
	loadData: function (data) {
		if (data && data.length === 0) {
			this.setValueMap(data)
		} else if (data && data.length > 0) {
			var results = this.dataToValueMapNew(data);
			this.setValueMap(results.valueMap, results.keys);
		}
	},

	/**
	 * 设置值
	 * 
	 * @param {Object}
	 *            valueMap 给组重新设置数据
	 * 
	 */
	setValueMap: function (valueMap, keys) {
		this.valueMap = valueMap;
		if (keys) {
			this._$OrderKeys = keys;
		}
		var combobox = this.getBaseComboboxItem();
		if (combobox) {
			//仅支持设置valueMap不为空对象情况
			if (!isc.isAn.emptyObject(valueMap)) {
				combobox.setValueMap(valueMap);

				if (valueMap.length === 0) {
					// 当下拉数据源数据为空的时，清空所有下拉数据
					if (!combobox.pickList)
						combobox.$192 = [];
					else {
						//只有在下拉数据显示过有才存在picklist
						if (combobox.pickList.data != undefined) {
							combobox.pickList.data.clearAll();
							// 处理数据源更新后下拉数据未更新
							combobox.orderItemArray = [];
						}
					}
				}
			}

			var isPickListFields = this.DropDownSource && this.DropDownSource.DataSourceSetting.DataConfig.IsPickListFields + "";

			var curValue = combobox.getElementValue();
			if (isPickListFields === "true")
				combobox._saveEleValue = curValue; //存储该值，用于键盘按下事件时还原输入框框值

			if (isPickListFields !== "true" || combobox._isAutomaticPrompt + "" !== "true") { // 处理清空输入值后无法再选中下拉框值
				// 2015-05-22 liangchaohui
				// 以下代码实现：刷新控件不会清除已选值，即使控件的备选项被删除也不会影响已选值，如果备选项还原回来会根据已选值自动勾选
				// 从控件绑定的数据源中获取已选值再把值赋值到控件中
				var cacheDatas = this.dataSource.getCacheData();
				if (cacheDatas.length > 0) {
					var cacheData;
					for (var i = 0; i < cacheDatas.length; i++) {
						var rec = cacheDatas[i];
						if (rec.id == this.getData().id) {
							cacheData = rec;
							break;
						}
					}

					if (undefined != cacheData && null != cacheData) {
						var valueInDB = cacheData[this.getIDColumnName()];
						if (undefined != valueInDB && null != valueInDB) {
							var valueArry = valueInDB.split(",");
							var value = [];
							for (var i = 0; i < valueArry.length; i++) {
								value.push(valueArry[i]);
							}
							combobox.setValue(value);
						}
					}
				}
			}
		}

	},

	dataToValueMapNew: function (data) {
		var valueMap = {};
		//标识值顺序
		var keys = [];
		var results = {
			keys: keys,
			valueMap: valueMap,
		};
		this.defaultValue = [];
		var valueFieldItem = this.getBaseComboboxItem(); //.getValueFieldItem();
		valueFieldItem.orderItemArray = [];
		var _isSameKeyValue = valueFieldItem._displayName === valueFieldItem.name;
		var isPickListFields = this.DropDownSource.DataSourceSetting.DataConfig.IsPickListFields + "" === "true";
		for (i = 0; i < data.length; i++) {
			var itemObj = this._reGenObj(data[i]);

			if (!itemObj)
				continue

			var itemText = itemObj[this.ColumnName];
			// 处理键值配置同一个字段
			var itemVal = _isSameKeyValue && !isPickListFields && itemObj["text"] ? itemObj["text"] : itemObj[this.IDColumnName];
			keys.push(itemVal);
			if (_isSameKeyValue && !isPickListFields)
				valueMap[itemObj["text"]] = itemObj["text"];
			else
				valueMap[itemVal] = itemText;

			if (itemObj["default"]) this.defaultValue.add(itemVal);
			var orderRecord = {};

			if (isPickListFields) {
				orderRecord = itemObj;
				orderRecord[this.valueField] = itemVal;
			} else if (this.AutomaticPrompt && (this.AutomaticPrompt + "").toLowerCase() === "true") {
				// 处理在自动提示的时候无法显示下拉框值
				orderRecord[this.textField] = itemText;
				orderRecord[this.valueField] = itemVal;
			} else
				orderRecord[this.valueField] = itemVal;

			valueFieldItem.orderItemArray.add(orderRecord)
		}
		return results
	},
	_reGenObj: function (obj) {
		if (!obj)
			return null;
		var resultObj = {};
		for (var param in obj)
			if (obj.hasOwnProperty(param))
				resultObj[param] = this._reverseHtmlChar(obj[param]);
		return resultObj
	},
	_reverseHtmlChar: function (data) {
		// 处理自定义下拉数据源的数据在开发系统是转换了 > < 字符
		return (data + "").replace(/&gt;/g, ">").replace(/&lt;/g, "<")
	},
	getBaseComboboxItem: function () {
		return this.items[0];
	},

	getDropDownSource: function () {
		return this.DropDownSource;
	},

	setDropDownSource: function (DropDownSource) {
		this.DropDownSource = DropDownSource;
	},

	getColumnName: function () {
		return this.textField;
	},

	getIDColumnName: function () {
		return this.valueField;
	},

	getBindFields: function(){
		return [this.IDColumnName,this.ColumnName];
	},

	/**
	 * 过滤更新事件
	 * 只有当标识字段更改了才触发更新事件
	 * @memberof JGRadioGroup
	 * @method
	 * @instance
	 * @param {Object} changed 更改记录
	 * @returns {Boolean}
	 */
	 filterChanged: function(changed){
		return changed&&changed.hasOwnProperty(this.IDColumnName);
	},

	beforeDataLoad: function(){
		if(this.BeforeDataLoadAction){
			this.BeforeDataLoadAction();
		}
	},

	getV3Value: function() {
		var isAutomaticPrompt = this.AutomaticPrompt + "";
		// 可输入值的下拉框，从输入框值获取
		// 否则从DB获取
		if (isAutomaticPrompt && isAutomaticPrompt.toLowerCase() === "true") {
			var valFieldItem = this.getBaseComboboxItem().getValueFieldItem();
			var	curEleVal = valFieldItem && valFieldItem.getElementValue();
			return curEleVal;
		} else {
			var record = this.getWidgetData();
			if (record) {
				return record[this.IDColumnName];
			} else {
				return "";
			}
		}
	},

	setV3Value: function(propertyValue) {
		var refield = this.getIDColumnName();
		var record = {};
		record[refield] = propertyValue;
		// 处理当设置了Key值无法显示正确的显示值
		var isAutomaticPrompt = this.AutomaticPrompt;
		if ((isAutomaticPrompt + "").toLowerCase() !== "true") {
			var _displayField = this.getColumnName();
			var _displayVal = this.items && this.items[1] && this.items[1].mapValueToDisplay(propertyValue);
			if (_displayVal + "" !== "null" && _displayVal + "" !== "undefined")
				record[_displayField] = _displayVal;
		}
		var ds = this.TableName;
        if(ds){
            var fields = [this.IDColumnName];
            var current = ds.getCurrentRecord();
            var changed = {};
            if(!current){
                current = ds.createRecord();
                ds.insertRecords([current]);
            }
            changed.id = current.id;
			for(var i=0,l=fields.length;i<l;i++){
				var field = fields[i];
				changed[field] = record[field];
			}
            ds.updateRecords([changed]); 
        }
	},

	getText: function() {
        var record = this.getWidgetData();
        if (record) {
            return record[this.ColumnName];
        } else {
            return "";
        }
    },

	_getDefaultValue: function(){
		var retMap = {};
		var retValue = null;
		var retText = null;
		var data =this.DropDownSource;
		if (data) {
			if (typeof data !== "object"){
				try{
					data = isc.JSON.decode(data);
				}catch(e){}
			}
			var constData = data.uiData;
			if (constData) {
				for (var i = 0; i < constData.length; i++) {
					var data = constData[i];
					if (data["default"] == true) {
						retValue = data["id"];
						retText = data["text"];
						break;
					}
				}
			}
			retMap[this.IDColumnName] = retValue;
			retMap[this.ColumnName] = retText;
		}
		return retMap;
	},

	getDefaultValue: function(fieldCode) {
		var retMap = this._getDefaultValue();
		return retMap[fieldCode];
	},

	getConstData: function(dataSourceSetting) {
		var data;
		var dataConfig = dataSourceSetting.DataConfig;
		if (dataConfig) {
			switch (dataSourceSetting.DataSourceType) {
				case "Entity":
					if (dataConfig.EntityConstData) {
						data = dataConfig.EntityConstData.ConstData;
					}
					break;
				case "TableQuery":
					if (dataConfig.SqlQueryConstData) {
						data = dataConfig.SqlQueryConstData.ConstData;
					}
					break;
				case "CustomConst":
					if (dataConfig) {
						data = dataConfig.ConstData;
					}
					break;
				default:
					break;
			}
		}
		return data;
	},

	setDefaultRecord: function() {
		var data = this._getDefaultValue();
		if (data){
			this.setWidgetData(data);
		}
    }
});
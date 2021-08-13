/**
 * 属性编辑器
 * @class JGPropertyEditor
 * @extends JGBaseWidget
 * 
 */
isc.ClassFactory.defineClass("JGPropertyEditor", "JGBaseWidget");

isc.JGPropertyEditor.addProperties({

	Name: '',
	//Top: 10,
	//Left: 10,
	Width: 300,
	Height: 600,
	Visible: true,
	Enabled: true,
	ReadOnly: false,
	TabIndex: 1,

	//提供的事件列表
	listener: ['itemChange'],
	WidgetStyle: "JGPropertyEditor"

});

isc.JGPropertyEditor.addMethods({
	//自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
	_initWidget: function () {
		this.className = this.WidgetStyle + "Stack";
		this._dynamicForm = isc.DynamicForm.create({
			showCustomScrollbars: false,
			overflow: "auto",
			cellPadding: 0,
			width: this.Width,
			height: this.Height,
			titleAlign: "center",
			canEdit: !this.ReadOnly,
			disabled: !this.Enabled,
			itemChange: this._referEvent(this, 'itemChange'),
			titlePrefix: '',
			titleSuffix: '',
			requiredRightTitlePrefix: "",
			requiredRightTitleSuffix: "",
			requiredTitlePrefix: "<span style='color:#CC0000;margin-right: 3px;'>*</span>",
			requiredTitleSuffix: "",
			numCols: 2,
			colWidths: ['35%', "*"],
			border: "1px solid #ababab",
			//初始化时默认显示一个面板
			items: [{ defaultValue: isc.I18N.get("属性", "普通窗体控件属性编辑器标题"), type: "section", sectionExpanded: true, baseStyle: this.WidgetStyle + "Header" }]
		});

		//必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		this.addChild(this._dynamicForm);
		this._initEventAndDataBind();
	},

	_initEventAndDataBind: function () {
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, function (record) {
			if (record.datasource) {
				var map = record.datasource.getSelectedRecords().toArray();
				if (map.length > 0) {
					_this.setRowValue(map, this);
				}
			}
		});

	},

	_afterInitWidget: function () {
		var _this = this;
		isc.DataBindingUtil.bindEvent(this, "itemChange", function (item, newValue, oldValue) {
			if ((item.hasDoUpdateDataValue && item.hasDoUpdateDataValue == newValue) || newValue == "已设置") {
				return;
			}
			var dsName = isc.WidgetDatasource.getBindDatasourceName(this);
			var datasource = _this._lookup(dsName);
			var selRecords = datasource.getSelectedRecords().toArray();
			if (item && item.name && selRecords && selRecords.length > 0) {
				for (var i = 0; i < selRecords.length; i++) {
					var selRecord = selRecords[i];
					var field = selRecord.get(dsName + ".propertyName");
					if (field == item.name) {
						selRecord.set(dsName + ".propertyValue", newValue);
					}
				}
				datasource.updateRecords({
					"records": selRecords
				});
			}
		});

	},

	getV3MethodMap: function () {
		return {
			loadProperty: "loadActivityProperty"
		}
	},

	setRowValue: function (dbSelectedRows, widgetId) {
		// 获取关联的流程画布控件ID
		var propertyDatas = {};
		var ds = isc.WidgetDatasource.getBindDatasource(this);
		var dataSourceName = ds.dsName;
		for (var i = 0; i < dbSelectedRows.length; i++) {
			var propertyValueObj = dbSelectedRows[i];
			var field = propertyValueObj[dataSourceName + ".propertyName"];
			var propertyValue = propertyValueObj[dataSourceName + ".propertyValue"];
			propertyDatas[field] = propertyValue;
		}
		this.loadData(propertyDatas);
	},
	/**
	 * 获取使能状态
	 */
	isEnabled: function () {
		return this.Enabled;
	},
	/**
	 * 设置使能状态
	 */
	setEnabled: function (enable) {
		this.Enabled = enable;
		if (enable) {
			this.enable();
		} else {
			this.disable();
		}
	},

	/**
	* 载入属性
	*/
	loadProperty: function (propertys) {
		for (var i = 0, num = propertys.length; i < num; i++) {
			if (propertys[i].readOnlyEditorType) {
				propertys[i].titleStyle = this.WidgetStyle + "Title";
				propertys[i].cellStyle = this.WidgetStyle + "Cell";
				propertys[i].textBoxStyle = this.WidgetStyle + "Text";
			} else {
				propertys[i].baseStyle = this.WidgetStyle + "Header"
			}
		}
		this._dynamicForm.setItems(propertys);
	},

	loadActivityProperty: function (propertys, propertyTypes, graphWidgetId, widgetId) {
		var propertyConfig = PropertyConvertUtil.convertProperty(this.code, propertys, propertyTypes, graphWidgetId, this);
		this.loadProperty(propertyConfig);
	},

	/**
	* load数据
	*/
	loadData: function (values) {
		//弹出已修改为formatEditorValue/parseEditorValue方式，不设置Mask、hint了
		//this._setFormatter(values);//设置弹出的显示格式(hint属性)
		this._dynamicForm.setValues(values);
	},

	/**
	* 设置格式
	*/
	_setFormatter: function (values) {
		var items = this._dynamicForm.getItems();
		if (items && items.length > 0) {
			for (i = 0; i < items.length; i++) {
				var item = items[i];
				var formatText = item.formatText;
				var showHintInField = item.showHintInField;
				if (showHintInField && formatText) {
					var field = item.name;
					if (values[field]) {
						//已经设置了值
						if (item.setMask) {
							item.setMask(formatText);
						}
						if (item.setHint) {
							item.setHint(formatText);
						}
					}
				}
			}
		}
	},

	/**
	 * 获取修改的值,并通知更新到DB
	*/
	updateData: function () {
		var formItem = this._dynamicForm.getFocusItem();
		//弹出，下拉不用主动更新值
		if (formItem && formItem.getDataElement() && formItem.type != 'select' && formItem.propertyType != "BaseDictBox") {
			//formItem.blurItem();			
			var newValue = formItem.getDataElement().value;
			if (newValue != formItem.getValue()) {
				this._callEvent(this, 'itemChange', formItem, formItem.getDataElement().value);
				formItem.hasDoUpdateDataValue = newValue;
			}
		}
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this._dynamicForm.setWidth(percentWidth);
		//this._dynamicForm.getItems()[0].setWidth(percentWidth);
		this._dynamicForm.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this._dynamicForm.setHeight(percentHeight);
		//this._dynamicForm.getItems()[0].setHeight(percentHeight);
		this._dynamicForm.setHeight("100%");
	},

	destroy: function () {
		//var f = this._dynamicForm;
		//if(f){
		this._dynamicForm = null;
		//f.destroy();
		//}
		this.Super("destroy", arguments);
	},

	parentReadOnly: function (newState) {
		this.setEnabled(!newState);
	},

	bindWidgetData: function (datasourceName) {
		var _this = this;
		this.putWidgetContextProperty(this.code,"bindDatasourceName",datasourceName);
		var ds = isc.JGDataSourceManager.get(this,datasourceName);
		isc.DatasourceUtil.addDatasourceSelectEventHandler(ds, function (valueObj) {
			var values = valueObj.resultSet;
			if (values && values.length > 0) {
				_this.setRowValue(values, _this.code);
			}
		});

		isc.DatasourceUtil.addDatasourceUpdateEventHandler(ds, function (params) {
			var datasource = params.datasource;
			var selectedRows = datasource.getSelectedRecords();
			if (selectedRows && selectedRows.length > 0) {
				_this.setRowValue(selectedRows, _this.code);
			}
		});
	}

});

/**
 * 属性转换工具
 */
var PropertyConvertUtil = {};

/**
 * 属性转换
 * @param widgetId
 * @param propertyConfigs
 * @param typeConfigs
 * @param graphWidgetId 
 */
PropertyConvertUtil.convertProperty = function (widgetId, propertyConfigs, typeConfigs, graphWidgetId, widgetObj) {
	var sections = [];
	var sectionMap = {};
	for (var i = 0; i < typeConfigs.length; i++) {
		var typeConfig = typeConfigs[i];
		var typeCode = typeConfig.TypeCode;
		var defaultValue = typeConfig.TypeName;
		var orderNo = typeConfig.OrderNo;
		var section = {
			defaultValue: defaultValue,
			typeCode: typeCode,
			type: "section",
			sectionExpanded: true,
			orderNo: orderNo,
			itemIds: []
		};
		sections.push(section);
		sectionMap[typeCode] = section;
	}

	PropertyConvertUtil.sortByOrderNo(sections);

	var properties = [];
	var typeToPropertiesMap = {};
	for (var i = 0; i < propertyConfigs.length; i++) {
		var widgetProperty = propertyConfigs[i];
		var propertyType = widgetProperty.PropertyTypeCode;
		var propertyName = widgetProperty.PropertyName;
		var propertyWidgetType = widgetProperty.EditorType;
		var orderNo = widgetProperty.OrderNo;
		var visible = widgetProperty.Visible; //是否可见
		if (propertyWidgetType && visible) {
			var funcName = propertyWidgetType + "WidgetGen";
			if (typeof (PropertyConvertUtil[funcName]) == 'function') {
				var formItem = PropertyConvertUtil[funcName](widgetId, widgetProperty, graphWidgetId, widgetObj);
				properties.push(formItem);
				sectionMap[propertyType].itemIds.push(propertyName);
				if (typeof typeToPropertiesMap[propertyType] == "undefined") {
					typeToPropertiesMap[propertyType] = [];
				}
				typeToPropertiesMap[propertyType].push(formItem);
			}
		}
	}

	var sectionAndPropertyArray = [];
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		var typeCode = section.typeCode;
		sectionAndPropertyArray.push(section);
		var sectionProperties = typeToPropertiesMap[typeCode];
		if (sectionProperties) {
			for (var j = 0; j < sectionProperties.length; j++) {
				var sectionProperty = sectionProperties[j];
				sectionAndPropertyArray.push(sectionProperty);
			}
		}
	};

	return sectionAndPropertyArray;
};

/**
 * 按照orderNo属性进行排序，要求array里每一项都必须存在orderNo属性
 * @items 排序列表
 */
PropertyConvertUtil.sortByOrderNo = function (items) {
	// 按照sortNo进行排序
	if (items && items.length > 0) {
		items.sort(function (preItem, curItem) {
			var mark = "0000000000";
			var compareField = "orderNo";
			var compareLength = 5;
			if (typeof preItem[compareField] != 'undefined' && typeof curItem[compareField] != 'undefined') {
				var num1 = (mark + preItem[compareField]);
				var num2 = (mark + curItem[compareField]);
				var strNum1 = num1.substring(num1.length - compareLength);
				var strNum2 = num2.substring(num2.length - compareLength);
				if (num1 > num2) {
					return 1;
				} else if (num1 === num2) {
					return 0;
				}
				return -1;
			}
			return 1;
		});
	}
};

/**
 * 设置公共的属性
 */
PropertyConvertUtil.BaseWidgetGen = function (widgetId, widgetProperty) {
	var formItem = {};
	formItem.name = widgetProperty.PropertyName;
	formItem.title = widgetProperty.SimpleChineseName;
	formItem.required = widgetProperty.IsMust;
	formItem.canEdit = !widgetProperty.ReadOnly;
	formItem.changeOnKeypress = false;
	formItem.defaultValue = widgetProperty.DefaultValue ? widgetProperty.DefaultValue : null;
	formItem.titleStyle = 'propertyFormTitle';
	formItem.cellStyle = 'propertyFormCell';
	formItem.width = '*';
	formItem.titleAlign = 'left';
	return formItem;
}

/**
 * 生成文本型
 */
PropertyConvertUtil.JGTextBoxWidgetGen = function (widgetId, widgetProperty) {
	var formItem = PropertyConvertUtil.BaseWidgetGen(widgetId, widgetProperty);
	formItem.type = "text";
	formItem.readOnlyEditorType = formItem.type;
	return formItem;
}

/**
 * 生成长文本型
 */
PropertyConvertUtil.JGLongTextBoxWidgetGen = function (widgetId, widgetProperty) {
	var formItem = PropertyConvertUtil.BaseWidgetGen(widgetId, widgetProperty);
	formItem.type = "textArea";
	formItem.readOnlyEditorType = formItem.type;
	return formItem;
}

/**
 * 生成数字型
 */
PropertyConvertUtil.JGFloatBoxWidgetGen = function (widgetId, widgetProperty) {
	var formItem = PropertyConvertUtil.BaseWidgetGen(widgetId, widgetProperty);
	formItem.type = "float";
	formItem.readOnlyEditorType = formItem.type;
	return formItem;
}

/**
 * 生成布尔型
 */
PropertyConvertUtil.JGCheckBoxWidgetGen = function (widgetId, widgetProperty) {
	var formItem = PropertyConvertUtil.BaseWidgetGen(widgetId, widgetProperty);
	formItem.type = "checkbox";
	formItem.readOnlyEditorType = formItem.type;
	formItem.labelAsTitle = true;
	return formItem;
}

/**
 * 生成下拉型
 */
PropertyConvertUtil.JGComboBoxWidgetGen = function (widgetId, widgetProperty, graphWidgetId, widgetObj) {
	var formItem = PropertyConvertUtil.BaseWidgetGen(widgetId, widgetProperty);
	formItem.type = "select";//设置类型为select，选项不能编辑
	formItem.readOnlyEditorType = formItem.type;
	formItem.multiple = false;
	formItem.multipleAppearance = "picklist";

	var dataSource = "";
	var dropData = "";
	var valueFieldName = widgetProperty.PropertyName;
	var textFieldName = "";
	if (widgetProperty.TextFieldName) {
		textFieldName = widgetProperty.TextFieldName;
	}
	if (widgetProperty.DataSource) {
		dataSource = widgetProperty.DataSource;
	}
	dataSource = isc.JSON.decode(dataSource);
	if (dataSource) {
		dropData = widgetObj._getDropDownData(dataSource, valueFieldName, textFieldName)
	}

	//将开发系统中的数据转成sc需要的格式
	//data 包含多个ITEM的对象 [{"id":"a","text":"Java"},{"id":"b","text":"VB"}]
	//转换为valueMap {a:Java,b:VB}
	var valueMap = {};
	if (dropData) {
		for (i = 0; i < dropData.length; i++) {
			var itemObj = dropData[i];
			var itemText = itemObj[textFieldName];
			var itemVal = itemObj[valueFieldName];
			valueMap[itemVal] = itemText;
			if (itemObj['default']) {
				formItem.defaultValue = itemVal; // 设置默认值
			}
		}
	}
	formItem.valueMap = valueMap;

	return formItem;
}

/**
 * 生成弹出型
 */
PropertyConvertUtil.JGBaseDictBoxWidgetGen = function (widgetId, widgetProperty, graphWidgetId, widgetObj) {
	var formItem = PropertyConvertUtil.BaseWidgetGen(widgetId, widgetProperty);
	formItem.type = "text";
	formItem.propertyType = "BaseDictBox";//弹出类型用来作判断的
	formItem.readOnlyEditorType = formItem.type;
	var canEditItem = formItem.canEdit;//是否可用
	formItem.canEdit = false;//不管是否只读，input框都是不能输入的
	//弹出已修改为formatEditorValue/parseEditorValue方式，不设置Mask、hint了
	//formItem.showHintInField = true;
	//formItem.formatText = "已设置";
	//formItem.mask = "";
	//formItem.hint = " ";
	formItem.showPickerIcon = true;
	formItem.pickerIconSrc = '[SKIN]/DynamicForm/property_formItem_icon.png';
	formItem.pickerIconHeight = 20;
	formItem.pickerIconWidth = 20;
	formItem.pickerIconHSpace = 3;
	formItem.showPicker = function () { };//重写方法，不弹出原生的小框框
	formItem.formatEditorValue = function (value, record, form, item) {
		if (value != undefined && value != null && value != "") {
			return "已设置";
		}
		return value;
	};
	formItem.parseEditorValue = function (value, form, item) {
		var itemValue = item.getValue();
		if (itemValue != undefined && itemValue != null) {
			return itemValue;
		}
		return value;
	};

	var dataSource = {};
	var dataSourceJsonStr = "";
	var valueFieldName = widgetProperty.PropertyName;
	var textFieldName = "";
	if (widgetProperty.TextFieldName) {
		textFieldName = widgetProperty.TextFieldName;
	}
	if (textFieldName == "") {
		textFieldName = valueFieldName;
	}
	if (widgetProperty.DataSource) {
		dataSource = widgetProperty.DataSource;
		dataSourceJsonStr = isc.JSON.encode(dataSource);
	}
	if (dataSourceJsonStr && canEditItem) {
		formItem.iconIsDisabled = function (icon) { return false };//重写方法，弹出图标不禁用,移动到上面时有手形
		formItem.click = function (form, item) {
			widgetObj._exeExpression("PropertyEditorJGBaseDictBoxOpenSwitcher("+dataSourceJsonStr + ",\"" + graphWidgetId + "\")");
		};
	}

	return formItem;
}


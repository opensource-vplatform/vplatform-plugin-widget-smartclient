import "./items/IV3FormItem";
import "./items/IV3LocalStorage";
import "./items/JGAttachmentFormItem";
import "./items/JGBaseDictBoxFormItem";
import "./items/JGButtonFormItem";
import "./items/JGCheckBoxFormItem";
import "./items/JGCheckBoxGroupFormItem";
import "./items/JGComBoxFormItem";
import "./items/JGDateRangePickerFormItem";
import "./items/JGDateTimePickerFormItem";
import "./items/JGFloatBoxFormItem";
import "./items/JGFloatRangeBoxFormItem";
import "./items/JGHyperLinkFormItem";
import "./items/JGImageFormItem";
import "./items/JGIntegerBoxFormItem";
import "./items/JGLabelFormItem";
import "./items/JGLinkLabelFormItem";
import "./items/JGLongDateTimePickerFormItem";
import "./items/JGLongTextBoxFormItem";
import "./items/JGPasswordFormItem";
import "./items/JGPercentFormItem";
import "./items/JGPeriodFormItem";
import "./items/JGPeriodRangeFormItem";
import "./items/JGRadioGroupFormItem";
import "./items/JGRichTextEditorFormItem";
import "./items/JGRichTextViewerFormItem";
import "./items/JGTextBoxFormItem";

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
		var ret = this.Super("init", arguments);
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
			MaxTitleLengthFunc = params.calculateLength;
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
							var titleWidth = this.getMaxTitleLength({
								"calculateLength": MaxTitleLengthFunc,
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
	},

	setFormat: function (field) {
		var currencyFields = this._getCurrencyField();
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

	processFormLayout: function (widget, infos) {
		var fields = widget.fields;
		if (!fields)
			return;
		for (var i = 0, len = fields.length; i < len; i++) {
			var field = fields[i];
			var info = infos[field.SourceTableName];
			if (!info)
				continue;
			this.setFormat(field);
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
						for (var i = 0, l = items.length; i < l; i++) {
							var item = items[i];
							if (!item.getValueChangeFields) continue;
							var fields = item.getValueChangeFields();
							if (fields && fields.length > 0) {
								var founded = false;
								for (var j = 0, len = fields.length; j < len; j++) {
									for (var k = 0, length = resultSet.length; k < length; k++) {
										var changedData = resultSet[k];
										if (changedData) {
											for (var key in changedData) {
												if (ds.dbName + item.form.multiDsSpecialChar + key === item.name || ds.dbName + item.form.multiDsSpecialChar + key === item.EndColumnName) {
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
		widget.registerV3ExpressionHandler(this._expressionHandler);
		var fields = widget.fields;
		if (fields && fields.length > 0) {
			for (var i = 0, l = fields.length; i < l; i++) {
				var field = fields[i];
				var type = field.type;
				var fieldAction = exports[type];
				if (fieldAction && fieldAction.initEvent) {
					fieldAction.initEvent(field.Code);
				}
			}
		}
		widget.fields.forEach(function (item) {
			if (item.type == "JGRadioGroup") {
				JGRadioGroup.setValueMap(widgetCode, item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
			} else if (item.type === 'JGComboBox') {
				JGComboBox.setValueMap(widgetCode, item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
			} else if (item.type === 'JGCheckBoxGroup') {
				JGCheckBoxGroup.setValueMap(widgetCode, item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
			} else if (item.type === 'JGBaseDictBox') {
				if (item.DropDownSource) {
					item.DropDownSource = JSON.parse(item.DropDownSource);
					JGBaseDictBox.setValueMap(widgetCode, item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
				}
			}
			item._validators = item.validators;
		})
	}
});
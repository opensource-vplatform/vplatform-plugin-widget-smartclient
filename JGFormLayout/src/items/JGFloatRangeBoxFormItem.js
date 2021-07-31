isc.ClassFactory.defineClass("JGFloatRangeBoxFormItem", "TextItem");
isc.ClassFactory.mixInInterface("JGFloatRangeBoxFormItem", "JGFormatHelper");
isc.ClassFactory.mixInInterface("JGFloatRangeBoxFormItem", "IV3FormItem");

isc.JGFloatRangeBoxFormItem.addProperties({
	LabelVisible: true
});
isc.JGFloatRangeBoxFormItem.addMethods({
	init: function () {
		this.title = this.SimpleChineseTitle;
		this.tabIndex = this.TabIndex;
		this.visible = this.Visible;
		this.name = this.StartColumnName;
		this.shouldSaveValue = true;
		this.showTitle = this.LabelVisible;
		if (!this.showTitle) {
			this.cellStyle += " formItemNoLabel";
		}
		this.canEdit = !this.ReadOnly && this.Enabled;
		this.disabled = !this.Enabled;
		this.required = this.IsMust;
		this.value = this.Value;
		this.keyPressFilter = "[0-9.\-]";
		this.decimalPad = this.FractionalPartLength;
		this.formatOnFocusChange = true;
		this.hint = null;
		if (this.StartDisplayFormat && this.StartDisplayFormat.displayFormat) {
			this.startNumType = this.StartDisplayFormat.numType;
			this.startPattern = this.StartDisplayFormat.displayFormat;
		}
		if (this.EndDisplayFormat && this.EndDisplayFormat.displayFormat) {
			this.endNumType = this.EndDisplayFormat.numType;
			this.endPattern = this.EndDisplayFormat.displayFormat;
		}
		this.startPlaceholder = this.Placeholder ? this.Placeholder : "";
		this.endPlaceholder = this.PlaceholderEnd ? this.PlaceholderEnd : "";
		//                this.textAlign = this.getTextAlign();
		this.mustRefocusOnRedraw = false;
		this.length = parseInt(this.IntegralPartLength) + parseInt(this.FractionalPartLength) + 1;
		this.formatEditorValue = (this.DisplayFormat && this.DisplayFormat.displayFormat) ? this.formatDisplayValue : null;
		this.getElementHTML = function (_1) {
			var _this = this;
			this.startId = this.ID + '_start';
			this.endId = this.ID + '_end';
			var html = '<div class = "float-range-wrapper" style = "width:100%">' +
				'<input type = "tel" style="ime-mode: disabled;" onkeyup="value=value.replace(/[\u4e00-\u9fa5]/ig,\'\')" onKeyPress = "' + _this.getItemID() + '.keyPress()" position = "start" ID = "' + this.startId + '" class = "float-range-start" $89="text" $9a="$9b" AUTOCOMPLETE=OFF onblur = "' + _this.getItemID() + '.blur(\'' + this.startId + '\',\'start\')" oninput="' + _this.getItemID() + '._handleInput(this,\'start\')" onfocus = "' + _this.getItemID() + '.focus(\'' + this.startId + '\',\'start\')" handleNativeEvents="false" placeholder = "' + this.startPlaceholder + '" />' +
				'<span class = "float-range-separator">~</span>' +
				'<input type = "tel" style="ime-mode: disabled;" onkeyup="value=value.replace(/[\u4e00-\u9fa5]/ig,\'\')" onKeyPress = "' + _this.getItemID() + '.keyPress()" position = "end" ID = "' + this.endId + '" class = "float-range-end" $89="text" $9a="$9b" AUTOCOMPLETE=OFF onblur = "' + _this.getItemID() + '.blur(\'' + this.endId + '\',\'end\')" oninput="' + _this.getItemID() + '._handleInput(this,\'end\')" onfocus = "' + _this.getItemID() + '.focus(\'' + this.endId + '\',\'end\')" handleNativeEvents="false" placeholder = "' + this.endPlaceholder + '" />' +
				'</div>';
			return html;
		};
		this.blur = function (id, position) {
			this.getInputById(id).parentNode.classList.remove('float-range-wrapper-focused');
			this._blurCheck(id, position);
			this.setInputValues(id, this.formatDisplayValue(this.getValues(id), null, null, this))
			if ((this.startValue || this.startValue === 0) && (this.endValue || this.endValue === 0)) {
				this.startValue = parseFloat(this.startValue)
				this.endValue = parseFloat(this.endValue)
				if (this.endValue < this.startValue) {
					this.form.setValue(this.StartColumnName, this.endValue);
					this.form.setValue(this.EndColumnName, this.startValue);
					var _value = this.endValue;
					this.endValue = this.startValue;
					this.startValue = _value;
				}
			}
			this.validate();
			this.getV3EventHandlerWithDataSyn(this.Code, "OnLeave")();
		};
		this.focus = function (id, position) {
			this.getInputById(id).parentNode.classList.add('float-range-wrapper-focused');
			this.formatEditorValue = null;
			var value = this.setPositionValue(position);
			if (value != undefined && value != null) {
				this.setInputValues(id, value)
			}
			this.getV3EventHandler(this.Code, "OnEnter")();
		}
		this._handleInput = function (input, position) {
			var value = input.value.replace(/[^\d.-]/ig, '');
			//                	value = value && value != "" ? parseFloat(value) : null;
			input.value = value;
			//                	if(position == "start"){
			//                		this.startValue = value;
			//                	}else{
			//                		this.endValue = value;
			//                	}
		}
		this.titleClick = this.getV3EventHandler(this.Code, "OnLabelClick");
		this.keyDown = this.getV3KeyDownEventHandler(this.Code);
		this.itemHoverHTML = this.getToolTipHandler(this.Code, this.ToolTip);
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
		this.Super("init", arguments);
	},
	keyPress: function () {
		if (event.keyCode != 37 && event.keyCode != 39 && event.keyCode != 8 && event.keyCode != 46 && event.keyCode != 45 && event.keyCode < 48 || event.keyCode > 57) {
			event.returnValue = false
		}
	},
	setPositionValue: function (position) {
		var valueName = "",
			id = "",
			columnName = "";
		if (position == "start") {
			valueName = "startValue";
			id = this.startId;
			columnName = "StartColumnName";
		} else {
			valueName = "endValue";
			id = this.endId;
			columnName = "EndColumnName";
		}
		var _value = this.getNumValue(this.getValues(id));
		this.form.setValue(this[columnName], _value);
		return _value;
	},
	getNumValue: function (_value) {
		if (_value) {
			if (_value.indexOf(',') != -1) {
				_value = _value.replaceAll(',', '');
			}
			if (_value.indexOf('$') != -1) {
				_value = _value.replaceAll('$', '');
			}
			if (_value.indexOf('￥') != -1) {
				_value = _value.replaceAll('￥', '');
			}
			if (_value.indexOf('US$') != -1) {
				_value = _value.replaceAll('US$', '');
			}
		}
		return _value ? parseFloat(_value) : null;
	},
	getValues: function (id) {
		var value = this.getInputById(id).value;
		return value == "" ? null : value;
	},
	clearValues: function () {
		this.startValue = null;
		this.endValue = null;
		this.setInputValues(this.startId, null, true);
		this.setInputValues(this.endId, null);
	},
	setInputValues: function (id, value) {
		if (value === undefined) {
			value = null
		}
		var input = this.getInputById(id);
		if (input) {
			input.value = value;
			var position = $(input).attr('position')
			this.setPositionValue(position);
		}

	},
	setRangeValue: function (start, end) {
		this.startValue = start;
		var startValue = start || start === 0 ? this.valueFormat(start, this.startPattern, this.startNumType) : null;
		this.setInputValues(this.startId, startValue, true);
		this.endValue = end;
		var endValue = end || end === 0 ? this.valueFormat(end, this.endPattern, this.endNumType) : null;
		this.setInputValues(this.endId, endValue);
	},
	setValues: function (start, end) {
		this.setRangeValue(start, end);
	},
	getInputById: function (id) {
		var form = this.form._clipDiv ? $(this.form._clipDiv) : $(this.form.$q3);
		return form.find('#' + id)[0];
	},
	getTextAlign: function () {
		var entityCode = this.SourceTableName;
		if (this.ColumnName == "") {
			return "left";
		} else {
			var fieldName = this.ColumnName.split(this.form.multiDsSpecialChar)[1];
			var currencyField = this.form._getCurrencyField();
			if (currencyField && currencyField[entityCode] && currencyField[entityCode][fieldName]) {
				return "right";
			} else {
				return "left"
			}
		}
	},
	_blurCheck: function (id, position) {
		var _currVal = this.getValues(id) ? parseFloat(this.getValues(id)) : null;
		//只能录入数字
		var reg = /^[-\+]?\d+(\.\d+)?$/;
		if (!reg.test(_currVal)) {
			if (_currVal && _currVal.indexOf(',') != -1) {
				if (position == "start") {
					this.startValue = _currVal;
				} else {
					this.endValue = _currVal;
				}
				this.setInputValues(id, _currVal);
			} else {
				if (position == "start") {
					this.startValue = null;
				} else {
					this.endValue = null;
				}
				this.setInputValues(id, null);
			}
		} else {
			this.funEfficacy(id, _currVal, position);
		}

	},
	funEfficacy: function (id, _currVal, position) {
		_currVal = _currVal.toString(); //通过字符串来定位
		var partLength = _currVal.length; //总长度
		var partAgo = _currVal.indexOf("."); //小数点前	
		var newVal = _currVal ? parseFloat(_currVal) : null;
		if (partAgo > 0) { //证明有小数点
			var partAfter = parseInt(partLength - partAgo - 1); //小数点后
			if (partAgo > parseInt(this.IntegralPartLength) || partAfter > parseInt(this.FractionalPartLength) || partLength > parseInt(this.IntegralPartLength) + parseInt(this.FractionalPartLength) + 1) { //加1 是因为还有一个小数点
				newVal = _currVal.substr(0, partAgo + parseInt(this.FractionalPartLength) + 1);
				this.setInputValues(id, newVal);
			}
		} else {
			if (partLength > parseInt(this.IntegralPartLength)) {
				newVal = _currVal.substr(0, partAgo + parseInt(this.FractionalPartLength) + 1);
				this.setInputValues(id, newVal);
			}
		}
		if (position == "start") {
			this.startValue = newVal;
		} else {
			this.endValue = newVal;
		}
	},
	//显示格式的几个方法抽到这里
	formatDisplayValue: function (value, record, form, item) {
		if (value != undefined && value != null) {
			if (this.StartDisplayFormat && this.StartDisplayFormat.displayFormat) {
				return this.valueFormat(value, this.startPattern, this.startNumType)
			}
			if (this.EndDisplayFormat && this.EndDisplayFormat.displayFormat) {
				return this.valueFormat(value, this.endPattern, this.endNumType)
			}
		}
		return value;
	},
	getValueChangeFields: function () {
		return [this.name, this.EndColumnName];
	},

	getBindFields: function () {
		return [this.name];
	},
	parentReadOnly: function (readOnly) {
		var readOnly = this.ReadOnly || readOnly;
		//            	this.ReadOnly = readOnly;
		this.setCanEdit(!readOnly);
	},
	setCanEdit: function (canEdit) {
		this.Super('setCanEdit', arguments);
		if (this.form.useStaticReadonly) {
			if (!this._value || this._value == "") {
				this.getReadOnlyHTML = function () {
					return "<div class = 'v3FormItemReadonly'>-</div>";
				}
				this.redraw();
			} else {
				this.getReadOnlyHTML = function (_1, _2) {
					return this.getElementHTML(_1, _2);
				}
			}
		}
	},
	isReadOnly: function () {
		var _1 = this;
		while (_1.parentItem != null) {
			if (_1.canEdit != null) {
				return !_1.canEdit
			}
			_1 = _1.parentItem
		}
		return _1.ReadOnly || _1._ReadOnly || !_1.canEdit;
	}
});
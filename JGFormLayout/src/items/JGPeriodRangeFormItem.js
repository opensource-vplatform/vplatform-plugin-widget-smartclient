isc.ClassFactory.defineClass("JGPeriodRangeFormItem", "SDateItem");
isc.ClassFactory.mixInInterface("JGPeriodRangeFormItem", "IV3FormItem");

isc.JGPeriodRangeFormItem.addProperties({
    WidgetStyle: "JGFormIcon",
    PeriodType: 'year',
    DisplayFormatString: {
        "year": "yyyy年",
        "halfyear": "yyyy年B",
        "quarter": "yyyy年qq季",
        "month": "yyyy年MM月",
        "tendays": "yyyy年MM月X",
        "week": "yyyy年ww周"
    },
    LabelVisible: true
});

isc.JGPeriodRangeFormItem.addMethods({
    init: function () {
        this.layoutType = "formLayout";
        this.title = this.SimpleChineseTitle;
        this.name = this.StartColumnName;
        this.tabIndex = this.TabIndex;
        this.visible = this.Visible;
        this.disabled = !this.Enabled;
        this.required = this.IsMust;
        this.showTitle = this.LabelVisible;
        if (!this.showTitle) {
            this.cellStyle += " formItemNoLabel";
        }
        this.itemHoverHTML = this.getToolTipHandler(this.Code, this.ToolTip);
        //                this.canEdit = !this.ReadOnly && this.Enabled;
        this.cellStyle = "JGDateRangePicker";
        //                this.canEdit = true;
        this.canEdit = false;
        this.pickerConstructor = "SDateRangeChooser";
        this.value = this.Value;
        this.sdatetype = this.PeriodType;
        this.startDate = this.getDate(this.StartDate);
        this.endDate = this.getDate(this.EndDate);
        this.displayMode = "singlePanel";
        this.disableIconsOnReadOnly = false;


        this.pickerIconHSpace = 1;
        this.implicitSave = false;
        this.implicitSaveOnBlur = false;
        //this.controlStyle = this.WidgetStyle + "Cell";
        this.editPendingCSSText = "";
        this.displayFormat = this.DisplayFormatString[this.PeriodType];
        this.pickerIconStyle = this.WidgetStyle + "Icon";
        //                this.blur = this.form.getV3EventHandlerWithDataSyn(this.Code,"OnLeave");
        //	            this.blur = this.getV3EventHandlerWithDataSyn(this.Code,"OnLeave");
        this.changed = this.getFormSyncDataHandler(this.Code);
        this.focus = this.getV3EventHandler(this.Code, "OnEnter");
        this.titleClick = this.getV3EventHandler(this.Code, "OnLabelClick");
        this.setRangeValue(null, null);
        this.keyDown = this.getV3KeyDownEventHandler(this.Code);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
        this.Super("init", arguments);
    },

    getValueChangeFields: function () {
        return [this.StartColumnName, this.EndColumnName];
    },

    getBindFields: function () {
        return this.getValueChangeFields();
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
    },
    setValues: function (startValue, endValue) {
        this.startValue = startValue ? this.getDate(startValue) : null;
        this.endValue = endValue ? this.getDate(endValue) : null;
        this.setRangeValue(this.startValue, this.endValue);
    },
    clearValues: function () {
        this.startValue = null;
        this.endValue = null;
        this.setRangeValue(this.startValue, this.endValue);
    },
    getDate: function (date) {
        if (!date) {
            return null;
        }
        return isc.SDateUtil.split(date, this._patterns[this.sdatetype]);
        //            	var newDate = new Date(date);
        //            	return {
        //            		year : newDate.getFullYear(),
        //            		month : newDate.getMonth() + 1,
        //            		day : newDate.getDate()
        //            	}
    },
    fixedHandler: function (value) {
        value = value.replace(/\s*/g, "");
        var _value = value.split('至');
        var start = null,
            end = null;
        if (_value && _value.length > 1) {
            start = value.split('至')[0];
            end = value.split('至')[1];
        } else if (value.indexOf('以后') != -1) {
            start = value.split('以后')[0];
            end = null;
        } else if (value.indexOf('以前') != -1) {
            start = null;
            end = value.split('以前')[0];
        } else {
            start = null;
            end = null;
        }
        this.form.setValue(this.StartColumnName, start);
        this.form.setValue(this.EndColumnName, end);
        this.setElementValue(value);
        this.form._dataSyn();
    },
});
isc.ClassFactory.defineClass("JGDateRangePickerFormItem", "SDateItem");
isc.ClassFactory.mixInInterface("JGDateRangePickerFormItem", "IV3FormItem");

isc.JGDateRangePickerFormItem.addProperties({
    WidgetStyle: "JGDateItem",
    DisplayFormatString: {
        "year": "yyyy",
        "month": "yyyy-MM",
        "date": "yyyy-MM-dd"
    },
    LabelVisible: true
});
isc.JGDateRangePickerFormItem.addMethods({
    init: function () {
        this.layoutType = "formLayout";
        this.title = this.SimpleChineseTitle;
        this.tabIndex = this.TabIndex;
        this.visible = this.Visible;
        this.maxDate = this.MaxDate == "2090-12-31" || this.MaxDate == "2090/12/31" ? "9998-12-31" : this.MaxDate;
        this.minDate = this.MinDate == "1970-1-1" || this.MinDate == "1970/1/1" ? "1753-01-01" : this.MinDate;
        //                this.minDate = this.MinDate;
        //                this.maxDate = this.MaxDate;
        this.name = this.StartColumnName;
        this.startDate = this.getDate(this.StartDate);
        this.endDate = this.getDate(this.EndDate);
        this.cellStyle = "JGDateRangePicker";
        this.showTitle = this.LabelVisible;
        if (!this.showTitle) {
            this.cellStyle += " formItemNoLabel";
        }
        //                this.canEdit = !this.ReadOnly && this.Enabled;
        this.canEdit = false;
        this.useTextField = true;
        this.required = this.IsMust;
        this.disabled = this.ReadOnly || !this.Enabled;
        this.value = this.Value;
        this.shouldSaveValue = true;
        this.disableIconsOnReadOnly = false;
        this.pickerConstructor = "SDateRangeChooser";
        this.displayMode = "singlePanel";
        this._patterns = {
            // 重写父类方法
            'month': 'yyyy-MM-dd', // 月
            'year': 'yyyy-MM-dd', // 年
            'date': 'yyyy-MM-dd', // 日期
        };
        this.sdatetype = this.DateDisplay ? this.DateDisplay : "date";
        this.displayFormat = this.DisplayFormatString[this.DateDisplay];
        //                this.blur = this.getFormSyncDataHandler();
        this.fixedHandler = this.fixedHandler;
        this.itemHoverHTML = this.getToolTipHandler(this.Code, this.ToolTip);
        this.titleClick = this.getV3EventHandler(this.Code, "OnLabelClick");
        this.setRangeValue(null, null);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
        this.Super("init", arguments);
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
    _placeholderClick: function () {
        this.eventParent._setPlaceholderStyle("hide");
    },
    getValueChangeFields: function () {
        return [this.StartColumnName, this.EndColumnName];
    },
    getBindFields: function () {
        return [this.StartColumnName];
    },
    parentReadOnly: function (readOnly) {
        var readOnly = this.ReadOnly || readOnly;
        //            	this.ReadOnly = readOnly;
        this.setCanEdit(!readOnly);
    },
    getDate: function (date) {
        var newDate = new Date(date);
        return {
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate()
        }
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
    setValues: function (startValue, endValue) {
        this.startValue = startValue && Date.parse(startValue).toString() != "NaN" ? this.getDate(startValue) : null;
        this.endValue = endValue && Date.parse(endValue).toString() != "NaN" ? this.getDate(endValue) : null;
        this.setRangeValue(this.startValue, this.endValue);
    },
    clearValues: function () {
        this.startValue = null;
        this.endValue = null;
        this.setRangeValue(this.startValue, this.endValue);
    },
});
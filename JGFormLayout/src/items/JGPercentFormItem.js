isc.ClassFactory.defineClass("JGPercentFormItem", "Progressbar");
isc.ClassFactory.mixInInterface("JGPercentFormItem", "IV3FormItem");

isc.JGPercentFormItem.addProperties({
    _percentDone: 0,
    LabelVisible: true
});

isc.JGPercentFormItem.addMethods({
    init: function () {
        this.name = this.ColumnName;
        this.tabIndex = this.TabIndex;
        this.visible = this.Visible;
        this.value = this.Value;
        this.click = this.getV3EventHandler(this.Code, "OnClick");
        this.showTitle = true;
        this.title = "0%";
        this.showTitle = this.LabelVisible;
        if (!this.showTitle) {
            this.cellStyle += " formItemNoLabel";
        }
        this.percentDone = this._percentDone;
        //                this.width = this.Width;
        //                this.height = this.Height;
        this.horizontalItems = [{
                name: "h_start",
                size: 0
            },
            {
                name: "h_redstretch",
                size: 0
            },
            {
                name: "h_end",
                size: 0
            },
            {
                name: "h_empty_start",
                size: 0
            },
            {
                name: "h_emptystretch",
                size: 0
            },
            {
                name: "h_empty_end",
                size: 0
            }
        ];
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
        this.Super("init", arguments);
    },

    getBindFields: function () {
        return [this.name];
    },
    setValues: function (value) {
        var _percentValue = Math.round(value * 10000) / 100;
        var progressBar = this;
        progressBar.setPercentDone(_percentValue);
        progressBar.setTitle(_percentValue + '%');
        this._percentDone = value;
    },
    isReadOnly: function () {
        var _1 = this;
        while (_1.parentItem != null) {
            if (_1.canEdit != null) {
                return !_1.canEdit
            }
            _1 = _1.parentItem
        }
        return _1.ReadOnly || _1._ReadOnly;
    }
});
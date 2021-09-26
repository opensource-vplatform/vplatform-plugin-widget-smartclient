isc.JGFormLayout.addMethods({

	getReadOnlyJGDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},

	getEnabledJGDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},

	setIsMustJGDateTimePicker: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},
	
	cleanSelectedControlValueJGDateTimePicker: function (itemCode, onlyCleanSelectedRecord) {
		this.clearItemSelectValue(itemCode, onlyCleanSelectedRecord);
	},

	getLabelTextJGDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},

	setLabelTextJGDateTimePicker: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGDateTimePicker: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},

	getValueJGDateTimePicker: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(this.Code, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},

	getDefaultValueJGDateTimePicker: function (itemCode) {
		return this.getDefaultValue(itemCode);
	},

	setReadOnlyJGDateTimePicker: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},

	setEnabledJGDateTimePicker: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},

	setVisibleJGDateTimePicker: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},
	
	setValueJGDateTimePicker: function (itemCode, value) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			this.setMultiDsValue(this.Code, itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.SourceTableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id: record.id
		};
		data[item.name] = value;
		datasource.updateRecords([data]);
	},

	setMinDateJGDateTimePicker: function(itemCode, date) {
		// 判断日期有效性
		var _date = new Date(date);
		if (_date + "" === "Invalid Date")
			return;
		var item = this.getItemByCode(itemCode);
		if(item){
			item.minDate = date;
			var _picker = item.picker;
			if (!_picker)
				return;
			_picker.minDate = date;

			var _centerPicker = _picker.center;
			if (!_centerPicker)
				return;
			_centerPicker.minDate = date;
		}
	},
	setMaxDateJGDateTimePicker: function(itemCode, date) {
		// 判断日期有效性
		var _date = new Date(date);
		if (_date + "" === "Invalid Date")
			return;
		var item = this.getItemByCode(itemCode);
		if (item) {
			item.maxDate = date;
			var _picker = item.picker;
			if (!_picker)
				return;
			_picker.maxDate = date;
			var _centerPicker = _picker.center;
			if (!_centerPicker)
				return;
			_centerPicker.maxDate = date;
		}
	}
});
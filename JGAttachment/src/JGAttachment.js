isc.ClassFactory.defineClass("JGAttachment", "JGBaseFormWidget");

isc.JGAttachment.addProperties({});

isc.JGAttachment.addMethods({

	_initProperties: function (properties) {
		this.initBindDataAndUIEvent();

		// ----------------- init -----------------
		this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
		this.upload_url = '?operation=FileUpload';
		this.swfu_base = 'itop/common/smartclient/extra/thirdpart/swfupload';
		this.button_image_url = '?operation=FileButtonImage';
		this.file_size_limit = isNaN(properties.FileSize) ? 0 : parseFloat(properties.FileSize) * 1024;
		this.file_upload_limit = properties.MaxCount;
		// ----------------- END -----------------

		if (this.WidgetStyle == "JGAttachment") {
			this.WidgetStyle = "JGForm";
		}

		this.setHandleDisabled = function (disabled) {
			if (this.isDrawn()) {
				if (this.redrawOnDisable)
					this.markForRedraw("setDisabled");
				this.disableKeyboardEvents(disabled, null, true)
			}
			this._disabled = false;
			var items = this.getItems();
			for (var i = 0; i < items.length; i++)
				items[i].setDisabled(disabled);

		};

		this.className += " JGAttachment";
		this.items = [isc.addProperties(properties, {
			type: "V3AttachmentFormItems",
			isAbsoluteForm: true,
			initWindowScope: function () {
				if (scopeManager && this.form) {
					// 修改
					this.windowCode = properties.windowCode;
				}
			},
		})]
	},
	/**
	 * 获取组件this
	 */
	getComponent: function (widget) {
		var items = widget.items;
		return items && items[0];
	},

	initBindDataAndUIEvent: function () {
		var comp = this.getComponent(this);
		var _this = this;
		// 当没有权限时，调用action是返回null的，没有权限就临时处理为什么都不做，等权限整好后再调整
		if (!comp) {
			return;
		}

		is.WidgetDatasource.addBindDatasourceLoadEventHandler(this, null, function (params) {
			var resultset = params.datasource.getAllRecords().toArray();

			if (comp.isMultiUpload()) {
				if (resultset.length > 0) {
					comp.setUploadId("");
					comp.setSucessUploadCount(resultset.length);
					comp.clearFileQueue();
				}
			} else {
				if (resultset.length == 0) {
					comp.setSucessUploadCount(0);
					comp.clearFileQueue();
				}
			}
		});

		isc.WidgetDatasource.addBindDatasourceInsertEventHandler(this, null, function (params) {
			if (comp.isMultiUpload()) {
				comp.setSucessUploadCount(comp.getSucessUploadCount() + 1);
			}
		});

		isc.WidgetDatasource.addBindDatasourceDeleteEventHandler(this, null, function (params) {
			if (comp.isMultiUpload()) {
				comp.setSucessUploadCount(comp.getSucessUploadCount() - 1);
				comp.clearFileQueue();
			} else {
				comp.setUploadId("");
				comp.setSucessUploadCount(0);
				comp.clearFileQueue();
			}
		});

		isc.WidgetDatasource.addBindDatasourceUpdateEventHandler(this, null, function (params) {
			if (comp.isMultiUpload()) { } else {
				comp.setSucessUploadCount(0);
				comp.clearFileQueue();
			}
		});

		isc.WidgetDatasource.addBindDatasourceCurrentEventHandler(this, null, function (params) {
			var resultset = params.datasource.getAllRecords().toArray();
			if (resultset.length < 1)
				return;
			if (comp.isMultiUpload()) {
				comp.setUploadId(resultset[0].getSysId());
			} else {
				comp.setUploadId(resultset[0].getSysId());
				comp.setSucessUploadCount(0);
			}
		});

		var handler = function (exp) {
			_this._expHandler(exp);
		};
		this.registerV3ExpressionHandler(handler);
	},

	getWidgetRefField: function (widget) {
		var datasource = isc.WidgetDatasource.getBindDatasource(widget);
		var fileIdField = widget.ColumnName;
		var fileNameColumn = widget.FileNameColumn;
		var fileSizeColumn = widget.FileSizeColumn;

		// 忽略 不存在的属性
		if (fileNameColumn && !datasource.getField(fileNameColumn)) {
			fileNameColumn = null;
		}
		// 忽略 不存在的属性
		if (fileSizeColumn && !datasource.getField(fileSizeColumn)) {
			fileSizeColumn = null;
		}
		return {
			fileIdField: fileIdField,
			fileNameField: fileNameColumn,
			fileSizeField: fileSizeColumn
		}
	},

	getV3MethodMap: function () {
		return {
			getProperty: "getV3Property",
			setProperty: "setV3Property"
		}
	},

	getV3Property: function () {
		return this.MaxChildNum;
	},

	setV3Property: function (propertyValue) {
		this.setMaxChildNum(propertyValue);
	},

	getFileNameColumn: function () {
		return this.FileNameColumn;
	},

	getFileSizeColumn: function () {
		return this.FileSizeColumn;
	},

	upload: function (callback, params) {
		var comp = this.getComponent(this);
		if (comp) {
			var cfg = {};
			cfg.componentCode = this.componentCode;
			cfg.windowCode = this.widgetCode;
			comp.upload(callback, cfg, params);
		}
	},

	importData: function (cfg, callback) {
		var comp = this.getComponent(this);
		cfg.componentCode = this.componentCode;
		cfg.windowCode = this.widgetCode;
		comp.importData(cfg, callback);
	},

	isMultiUpload: function () {
		var comp = this.getComponent(this);
		return comp.isMultiUpload();
	},

	setEnabled: function (state) {
		var comp = this.getComponent(this);
		this.setItemEnabled && this.setItemEnabled(state);
		comp._retry_handle_disable(!state);
		comp.redraw();
	},

	getVisible: function () {
		return this.isVisible();
	},

	setReadOnly: function (state) {
		this.setItemReadOnly && this.setItemReadOnly(state);
		if (!state) {
			var comp = this.getComponent(this);
			comp.redraw();
		}
	},

	getReadOnly: function () {
		return this.isReadOnly();
	},

	setLabelText: function (title) {
		this.setSimpleChineseTitle(title);
		var comp = this.getComponent(widgetId);
		comp.redraw();
	},

	getLabelText: function () {
		return this.getSimpleChineseTitle();
	},

	setLabelForeColor: function (color) {
		this.setLabelForeColor(color);
		var comp = this.getComponent(this);
		comp.redraw();
	},

	setLabelBackColor: function (color) {
		this.setLabelBackColor(color);
		var comp = this.getComponent(this);
		comp.redraw();
	},

	setLabelFontStyle: function (fontStyle) {
		var comp = this.getComponent(this);
		comp.redraw();
	},

	setValueForeColor: function (color) {
		this.setValueForeColor(color);
		var comp = this.getComponent(this);
		comp.redraw();
	},

	setValueBackColor: function (color) {
		this.setValueBackColor(color);
		var comp = this.getComponent(this);
		comp.redraw();
	},

	setValueFontStyle: function (fontStyle) {
		var comp = this.getComponent(this);
		comp.redraw();
	},

	getDefaultValue: function () {
		return isc.WidgetDatasource.getSingleColumnWidgetDefaultValue(this);
	},

	cleanSelectedControlValue: function (onlyCleanSelectedRecord) {
		var comp = this.getComponent(this);
		widgetDatasource.clearValue(this, onlyCleanSelectedRecord);
		comp.clearFileQueue();
	},

	setFileSize: function (fileSize) {
		var comp = this.getComponent(this);
		comp.setUploadFileSize(fileSize);
	},

	setFileType: function (fileType) {
		var comp = this.getComponent(this);
		comp.setUploadFileType(fileType);
	},

	// MaxCount
	setMaxCount: function (maxCount) {
		var comp = this.getComponent(this);
		comp.setMaxUploadCount(maxCount);
	},

	getFileProgress: function (fileInfos, errorCB) {
		var result = {};
		var canUpload = false;
		var callback = function (value) {
			result["canUpload"] = true;
			result["ids"] = value.data;
		}
		var errorBack = function (value) {
			if (typeof (errorCB) == "function") {
				errorCB(value);
			} else {
				if (value.name && value.name == "NetworkException") {
					result["message"] = "无法连接服务器";
				} else if (value.message) {
					result["message"] = value.message;
				} else {
					result["message"] = "无法连接服务器";
				}
				result["canUpload"] = false;
				result["ids"] = {};
			}
		}

		var sConfig = {
			"isAsyn": false,
			"componentCode": this.componentCode,
			"windowCode": this.widgetCode,
			ruleSetCode: "FileUploadProgess",
			isRuleSetCode: false,
			commitParams: [{
				"paramName": "InParams",
				"paramType": "char",
				"paramValue": fileInfos
			}],
			afterResponse: callback,
			error: errorBack
		}
		this._remoteMethodAccessor(sConfig);
		return result;
	},

	getFileUploaded: function () {
		var _this = this;
		var handler = function (obj, value) {
			//新增实体记录
			var refFields = _this.getWidgetRefField(_this);
			var comp = _this.getComponent(_this);
			// 单文件上传，如果文件选择后，当前实体没有记录，就增加一条新记录
			// 主要是避免出现以下情况：选择文件--设置其他字段值(新增记录)--文件控件被触发insert和select事件
			// --文件队列被清除
			var datasource = isc.WidgetDatasource.getBindDatasource(_this);
			if (!comp.isMultiUpload()) {
				var currentRow = datasource.getCurrentRecord();
				if (!currentRow) {
					currentRow = datasource.createRecord();
					datasource.insertRecords([currentRow]);
				}
			}

			// 多文件上传添加新的记录,单文件上传无需新增记录
			if (comp.isMultiUpload()) {
				var row = datasource.createRecord();
				if (row) {
					datasource.insertRecords([row]);
				}
			}

			// 统一进行保存，文件名文件大小属于可选字段，如果配置了则进行设置，否则不予理会
			var record = {};
			record[refFields.fileIdField] = value.dataId;
			if (refFields.fileNameField) {
				record[refFields.fileNameField] = value.fileName;
			}
			if (refFields.fileSizeField) {
				record[refFields.fileSizeField] = value.fileSize;
			}
			isc.WidgetDatasource.setSingleRecordMultiValue(_this, record);
		}

		return handler;
	},

	OnKeyDown: function (itemCode, eventCode, args) {
		this.handleKeyDown(itemCode, eventCode);
	},

	afterUpload: function (itemCode, eventCode, args) {
		var value = args[0];
		var refFields = this.getWidgetRefField(this);
		var comp = this.getComponent(this);
		// 单文件上传，如果文件选择后，当前实体没有记录，就增加一条新记录
		// 主要是避免出现以下情况：选择文件--设置其他字段值(新增记录)--文件控件被触发insert和select事件
		// --文件队列被清除
		var datasource = isc.WidgetDatasource.getBindDatasource(this);
		if (!comp.isMultiUpload()) {
			var currentRow = datasource.getCurrentRecord();
			if (!currentRow) {
				currentRow = datasource.createRecord();
				datasource.insertRecords([currentRow]);
			}
		}

		// 多文件上传添加新的记录,单文件上传无需新增记录
		if (comp.isMultiUpload()) {
			var row = datasource.createRecord();
			if (row) {
				datasource.insertRecords([row]);
			}
		}

		// 统一进行保存，文件名文件大小属于可选字段，如果配置了则进行设置，否则不予理会
		var record = {};
		record[refFields.fileIdField] = value.dataId;
		if (refFields.fileNameField) {
			record[refFields.fileNameField] = value.fileName;
		}
		if (refFields.fileSizeField) {
			record[refFields.fileSizeField] = value.fileSize;
		}
		isc.WidgetDatasource.setSingleRecordMultiValue(this, record);
	},

	deleteSingleUploadItem: function (itemCode, eventCode, args) {
		// 删除单条上传后的记录
		var _widgetId = args[0];
		var _fileId = args[1];

		if (_fileId == undefined || _fileId == "") return;
		//获取绑定字段
		var refFields = this.getWidgetRefField(this);
		var coloumn = "fileId";
		//获取绑定的文件id字段
		if (refFields != undefined && refFields.fileIdField != undefined) {
			coloumn = refFields.fileIdField;
		}
		//获取绑定数据源对象
		var datasource = isc.WidgetDatasource.getBindDatasource(this);
		if (undefined != datasource) {
			var updateRecord = [];
			var records = datasource.getAllRecords().toArray();
			if (null != records && records.length > 0) {
				for (var index = 0; index < records.length; index++) {
					var record = records[index];
					var id = record.id;
					var _target_value = record.coloumn;
					if (_target_value == _fileId) {
						record.coloumn = null;
						updateRecord.push(record);
						break;
					}
				}
			}
			if (undefined != updateRecord && updateRecord.length > 0) {
				// 修改数据
				datasource.updateRecords(updateRecord);
			}
		}
	},

	getFileUploadProgess: function (itemCode, eventCode, args) { //获取上传文件的进度
		var comp = this.getComponent(this);
		var fileArray = args[0];

		var fileInfos = [];
		var ids = [];
		for (var i = 0; i < fileArray.length; i++) {
			var file = fileArray[i];
			var fileInfo = {};
			fileInfo["name"] = file.name;
			fileInfo["size"] = file.size ? file.size : 0;
			fileInfo["type"] = file.type;
			fileInfo["fileId"] = file.fileIdIden;
			ids.push(file.fileIdIden);
			fileInfos.push(fileInfo);
		}
		var obj = isc.JSONEncoder.create({ prettyPrint: false });
		var result = this.getFileProgress(obj.encode(fileInfos), args && args[1]);
		var ids = result["ids"];
		for (var i = 0; i < fileArray.length; i++) {
			var file = fileArray[i];
			if (null != ids[file.fileIdIden]) {
				if (ids[file.fileIdIden]["size"] == file.size) {
					file.status = 5;
				}
				file.loaded = ids[file.fileIdIden]["size"];
				file.chunk_size = Number(file.size - ids[file.fileIdIden]["size"]);
				file.fileIdIden = ids[file.fileIdIden]["newId"];
			}
		}
		comp._setCanUpload(result);
	},

	checkFileType: function (itemCode, eventCode, args) {
		var fileInfos = args[0];
		var comp = this.getComponent(this);
		var obj = isc.JSONEncoder.create({ prettyPrint: false });
		var result = this._checkFileType(this, obj.encode(fileInfos));
		comp._setFileTypeInfo(result["ids"]);
	},

	_checkFileType: function (widget, files) {
		var result = {};
		var canUpload = false;
		var callback = function (value) {
			result["canUpload"] = true;
			result["ids"] = value.data;
		}
		var errorBack = function (value) {
			if (value.name && value.name == "NetworkException") {
				result["message"] = "无法连接服务器";
			} else if (value.message) {
				result["message"] = value.message;
			} else {
				result["message"] = "无法连接服务器";
			}
			result["canUpload"] = false;
			result["ids"] = {};
		}

		var sConfig = {
			"isAsyn": false,
			"componentCode": widget.componentCode,
			"windowCode": widget.widgetCode,
			ruleSetCode: "CheckFileType",
			isRuleSetCode: false,
			commitParams: [{
				"paramName": "InParams",
				"paramType": "char",
				"paramValue": files
			}],
			afterResponse: callback,
			error: errorBack
		}
		widget._remoteMethodAccessor(sConfig);
		return result;
	}
});
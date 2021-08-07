isc.JGFormLayout.addMethods({

	setIsMustJGAttachment: function (itemCode, isMust) {
		this.setItemIsMust(itemCode, isMust);
	},

	initEventJGAttachment: function (itemCode) {
		this.initUIEventJGAttachment(itemCode);
	},

	getReadOnlyJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.ReadOnly;
	},
	//TODO
	cleanSelectedControlValueJGAttachment: function (itemCode, onlyCleanSelectedRecord) {
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
	},
	getEnabledJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Enabled;
	},
	getLabelTextJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.SimpleChineseTitle;
	},
	setLabelTextJGAttachment: function (itemCode, title) {
		this.setLabelText(title, itemCode);
	},

	getVisibleJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.Visible;
	},
	getValueJGAttachment: function (itemCode) {
		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			return this.getMultiDsValue(widgetCode, itemCode);
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		return isc.DatasourceUtil.getSingleValue(datasource, item.name);
	},
	getDefaultValueJGAttachment: function () {

	},
	setReadOnlyJGAttachment: function (itemCode, isReadonly) {
		this.setItemReadOnly(itemCode, isReadonly);
	},
	setEnabledJGAttachment: function (itemCode, isEnable) {
		this.setItemEnabled(itemCode, isEnable);
	},
	setVisibleJGAttachment: function (itemCode, isShow) {
		this.setItemVisible(itemCode, isShow);
	},
	setValueJGAttachment: function (itemCode, value) {

		if (this.getMultiDataSourceInfo && this.getMultiDataSourceInfo()) { //多数据源走同一赋值接口
			this.setMultiDsValue(widgetCode, itemCode, value);
			return;
		}
		var item = this.getItemByCode(itemCode);
		var datasource = isc.JGDataSourceManager.get(this, item.TableName);
		var record = datasource.getCurrentRecord();
		var data = {
			id: record.id
		};
		data[item.name] = value;
		datasource.updateRecords([data]);
	},
	getFileNameColumnJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.FileNameColumn;
	},

	getFileSizeColumnJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.FileSizeColumn;
	},

	initUIEventJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		var _this = this;
		isc.DataBindingUtil.bindEvent(item, "afterUpload", function (value) {
			var refFields = _this.getWidgetRefField(itemCode);
			// 单文件上传，如果文件选择后，当前实体没有记录，就增加一条新记录
			// 主要是避免出现以下情况：选择文件--设置其他字段值(新增记录)--文件控件被触发insert和select事件
			// --文件队列被清除
			var datasource = isc.JGDataSourceManager.get(_this, item.TableName);
			if (!item.isMultiUpload()) {
				var currentRow = datasource.getCurrentRecord();
				if (!currentRow) {
					currentRow = datasource.createRecord();
					datasource.insertRecords([currentRow]);
				}
			}
			// 多文件上传添加新的记录,单文件上传无需新增记录
			if (item.isMultiUpload()) {
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
			isc.WidgetDatasource.setSingleRecordMultiValue(datasource, record);
		});
		if (this.form && this.form.registerItemExtraEvent) {
			this.form.registerItemExtraEvent(itemCode, "deleteSingleUploadItem", function (_widgetId, _fileId) { //删除单条上传后的记录
				if (_fileId == undefined || _fileId == "") return;
				//获取绑定字段
				var refFields = _this.getWidgetRefField(widgetId);
				var coloumn = "fileId",
					fileNameColumnName, fileSizeColumnName;
				//获取绑定的文件id字段
				if (refFields != undefined && refFields.fileIdField != undefined) {
					coloumn = refFields.fileIdField;
					fileNameColumnName = refFields.fileNameField;
					fileSizeColumnName = refFields.fileSizeField;
				} //获取绑定数据源对象
				var datasource = isc.JGDataSourceManager.get(_this, item.TableName);
				if (undefined != datasource) {
					var updateRecord = [];
					var records = datasource.getAllRecords();
					if (null != records && records.length > 0) {
						for (var index = 0; index < records.length; index++) {
							var record = records[index];
							datasource.setCurrentRecord(record)
							var _target_value = record[coloumn];
							if (_target_value == _fileId) {
								record[coloumn] = null;
								record[fileNameColumnName] = null;
								record[fileSizeColumnName] = null;
								updateRecord.push(record);
								break;
							}
						}
					}
					if (undefined != updateRecord && updateRecord.length > 0) {
						// 修改数据
						var data = {
							id: record.id
						};
						data[item.name] = value;
						datasource.updateRecords([data]);
					}
				}
			});
			this.form.registerItemExtraEvent(itemCode, "getFileUploadProgess", function (fileArray) {
				if (!fileArray) {
					return;
				}
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
				var result = _this.getFileProgress(JSON.stringify(fileInfos));
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
				_this._setCanUpload(result);
			});
			this.form.registerItemExtraEvent(widgetId, "checkFileType", function (fileInfos) {
				if (fileInfos) {
					var result = _this.checkFileType(JSON.stringify(fileInfos));
					_this._setFileTypeInfo(result["ids"]);
				}
			});
		}
	},

	/**
	 * 获取文件控件的配置属性
	 */
	getWidgetRefField: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		var fileIdField = item.ColumnName;
		var fileNameColumn = item.FileNameColumn;
		var fileSizeColumn = item.FileSizeColumn;
		var tableName = item.TableName;
		var datasource = isc.JGDataSourceManager.get(this, tableName);
		// 忽略 不存在的属性
		if (fileNameColumn && !datasource.getField(fileNameColumn)) {
			fileNameColumn = null;
		} // 忽略 不存在的属性
		if (fileSizeColumn && !datasource.getField(fileSizeColumn)) {
			fileSizeColumn = null;
		}
		return {
			fileIdField: fileIdField,
			fileNameField: fileNameColumn,
			fileSizeField: fileSizeColumn
		}
	},

	getFileUploadedJGAttachment: function () {
		var _this = this;
		return function (widget, value) {
			var columnName = widget.ColumnName.indexOf(this.form.multiDsSpecialChar) != -1 ? widget.ColumnName.split(widget.form.multiDsSpecialChar)[1] : widget.ColumnName;
			var refFields = {
				fileIdField: columnName,
				fileNameField: this.FileNameColumn,
				fileSizeField: this.FileSizeColumn
			}
			var comp = widget;
			var datasource = isc.JGDataSourceManager.get(_this, widget.TableName);
			if (!comp.isMultiUpload()) {
				var currentRow = datasource.getCurrentRecord();
				if (!currentRow) {
					currentRow = datasource.createRecord();
					datasource.insertRecords([currentRow])
				}
			}
			if (comp.isMultiUpload()) {
				var row = datasource.createRecord();
				if (row)
					datasource.insertRecords([row]);
			}
			var record = {};
			record[refFields.fileIdField] = value.dataId;
			if (refFields.fileNameField)
				record[refFields.fileNameField] = value.fileName;
			if (refFields.fileSizeField)
				record[refFields.fileSizeField] = value.fileSize;
			isc.WidgetDatasource.setSingleRecordMultiValue(_this, record);
		}
	},
	/**
	 * 控件上传对开提供的接口
	 * @param {String},widgetId 控件编码
	 * @param {Function},callback 控件上传完成后执行的回调
	 * @param {Object},params 其他参数
	 * {
	 * 	'singleFileUploaded':Function//单个文件上传后调用的函数
	 * },	 * */
	uploadJGAttachment: function (itemCode, callback, params) {
		if (!params.singleFileUploaded) { //未知，先补偿
			params.singleFileUploaded = this.getFileUploaded();
		} //提供控件方法，由规则重新包装
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].Code == itemCode) {
				var cfg = {};
				cfg.componentCode = this.componentCode;
				cfg.windowCode = this.windowCode;
				this.items[i].upload(callback, cfg, params)
			}
		}
	},
	importDataJGAttachment: function (itemCode, cfg, callback) {
		var widget = this.getItemByCode(itemCode);
		cfg.componentCode = this.componentCode;
		cfg.windowCode = this.windowCode;
		widget.importData(cfg, callback);
	},
	isMultiUploadJGAttachment = function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.isMultiUpload();
	},
	getEnabledJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return !item.isDisabled();
	},
	getVisibleJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.isVisible();
	},
	getReadOnlyJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return item.isReadOnly();
	},
	getDefaultValueJGAttachment: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		return isc.WidgetDatasource.getSingleColumnWidgetDefaultValue(item);
	},
	//TODO
	cleanSelectedControlValueJGAttachment : function (itemCode, onlyCleanSelectedRecord) {
		var item = this.getItemByCode(itemCode);
		isc.WidgetDatasource.clearValue(itemCode, onlyCleanSelectedRecord);
		item.clearFileQueue();
	},
	checkFileType: function (files) {
		var result = {};
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
			result["ids"] = {}
		}
		var sConfig = {
				"isAsyn": false,
				"componentCode": this.componentCode,
				"windowCode": this.windowCode,
				ruleSetCode: "CheckFileType",
				isRuleSetCode: false,
				commitParams: [{
					"paramName": "InParams",
					"paramType": "char",
					"paramValue": files
				}],
				afterResponse: callback,
				error: errorBack
			},
			this._remoteMethodAccessor(sConfig);
		return result;
	},
	/**
	 * 获取文件上传进度，多个进度用逗号分隔
	 * */
	getFileProgress: function (fileInfos) {
		var result = {},
			var canUpload = false;
		var callback = function (value) {
				result["canUpload"] = true;
				result["ids"] = value.data;
			},
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
				"componentCode": this.componentCode,
				"windowCode": this.windowCode,
				ruleSetCode: "FileUploadProgess",
				isRuleSetCode: false,
				commitParams: [{
					"paramName": "InParams",
					"paramType": "char",
					"paramValue": fileInfos
				}],
				afterResponse: callback,
				error: errorBack
			},
			this._remoteMethodAccessor(sConfig);
		return result;
	},
	customRequiredValidateJGAttachment : function (itemCode) {
		var item = this.getItemByCode(itemCode);
		var refFields = this.getWidgetRefField(itemCode);
		var datasource = isc.JGDataSourceManager.get(this,item);
		if (item.isMultiUpload()) {
			var allRecords = datasource.getAllRecords();
			if (allRecords && allRecords.length > 0) {
				for (var index in allRecords) {
					var record = allRecords[index];
					var fileId = record[refFields.fileIdField];
					if (fileId && fileId.length > 0) {
						return true;
					}
				}
				return false;
			}else {
				return false;
			}
		}else {
			var currentRow = datasource.getCurrentRecord();
			if (currentRow && currentRow[refFields.fileIdField]) {
				return true;
			}else {
				return false;
			}
		}
	}
});
isc.ClassFactory.defineClass("JGAttachmentFormItem", "V3AttachmentFormItems");
isc.JGAttachmentFormItem.addProperties({

});

isc.JGAttachmentFormItem.addMethods({
	customRequiredValidate: function () {
		var datasource = this.form.TableName;
		if (this.isMultiUpload()) {
			var allRecords = datasource.getAllRecords();
			if (allRecords && allRecords.length > 0) {
				for (var index in allRecords) {
					var record = allRecords[index];
					var fileId = record[this.ColumnName];
					if (fileId && fileId.length > 0) {
						return true;
					}
				}
				return false;
			} else {
				return false;
			}
		} else {
			var currentRow = datasource.getCurrentRecord();
			if (currentRow && currentRow[this.ColumnName]) {
				return true;
			} else {
				return false;
			}
		}
	},
	init: function () {
		this.Super("init", arguments);
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
	},
	initWindowScope: function () {
		if (this.form) {
			this.windowCode = this.form.windowCode;
		}
	},
	checkFileType: function (files) {
		var result = {};
		if (this.form && this.form._remoteMethodAccessor) {
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
				"componentCode": this.form.componentCode,
				"windowCode": this.form.windowCode,
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
			this.form._remoteMethodAccessor(sConfig);
		}
		return result;
	}
});
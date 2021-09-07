/**
 * 弹出选择
 * @class JGRichTextBox
 * @extends JGBaseFormWidget
 * @example
 * isc.JGRichTextBox.create({
 * 	autoDraw: true
 * });
 */
// 定义v3ui控件类型--富文本 
isc.ClassFactory.defineClass("JGRichTextBox", "JGBaseFormWidget");
isc.ClassFactory.defineClass("JGRichTextEditor", "JGRichTextBox");

// 定义v3ui控件属性
isc.JGRichTextBox.addProperties({
});

isc.JGRichTextBox.addMethods({
	_initProperties: function (properties) {
		if (this.WidgetStyle == "JGTextBox") {
			this.WidgetStyle = "JGForm"
		}
		this.disabled = false;
		var _this = this;
		this.TitleWidth = 0;
		var blurDataSync = function(){
			var newValue = _this.items[0].getContent();
			isc.WidgetDatasource.setSingleValue(_this, newValue);
		};
		this.items = [isc.addProperties(properties, {
			type: "V3RichTextEditorItem",
			isAbsoluteForm: true,
			blurDataSync: blurDataSync
		})];

		this.initBindDataAndUIEvnet();
	},

	/**
	 * 获取只读状态
	 * @return 只读状态
	 */
	getReadOnly: function () {
		return this.ReadOnly;
	},

	/* 设置只读状态
	 * @param readOnly 只读状态
	 */
	setHandleReadOnly: function (readOnly) {
		if (this.isDrawn() && this.items[0].editor && this.items[0].editor.body) {
			if (readOnly) {
				this.items[0].editor.setDisabled();
			} else {
				this.items[0].editor.setEnabled();
			}
		}
	},

	setHandleDisabled: function (disabled) {
		if (this.isDrawn() && this.items[0].editor && this.items[0].editor.body) {
			if (disabled) {
				this.items[0].editor.setDisabled();
			} else {
				this.items[0].editor.setEnabled();
			}
		}
	},

	/**
	 * 获取使能状态
	 * @return 使能状态
	 */
	getEnabled: function () {
		return this.Enabled;
	},

	/**
	 * 设置使能状态
	 * @param enable 使能
	 * @return {String}
	 */
	setEnabled: function (enable) {
		this.Enabled = enable;

		if (this.isDrawn() && this.items[0].editor && this.items[0].editor.body) {
			if (enable) {
				this.items[0].editor.setEnabled();
			} else {
				this.items[0].editor.setDisabled();
			}
		}
	},

	/**
	 * 清空值
	 */
	clearValues: function () {
		this.items[0].editor.setContent("");
	},

	/**
	 * 获取焦点
	 */
	setControlFocus: function () {
		this.items[0].editor.focus();
	},

	/**
	 * 设置控件值
	 * 
	 * @param 控件值
	 */
	getValue: function () {
		return this.getContent();
	},

	/**
	 * 设置控件值
	 * 
	 * @param val
	 *            控件值
	 */
	setValue: function (val) {
		// 处理默认值值类型不能为 Int, 只能为 String
		val = (val != undefined && val != null) ? val + "" : '';
		this.setContent(val);
	},

	/**
	 * 之前因为还没有draw。所以保存了数据，等draw之后再加载数据
	 */
	restoreContent: function () {
		if (this._loadedContent) {
			this.setContent(this._loadedContent);
			this._loadedContent = null;
		}
	},

	restoreState: function () {
		if (this.isDisabled() || this.isReadOnly()) {
			this.items[0].editor.setDisabled();
		} else {
			this.items[0].editor.setEnabled();
		}
	},

	/**
	 * 赋值
	 */
	setContent: function (val) {
		//如果还没有draw，暂时缓存起来
		if (!this.isDrawn()) {
			this._loadedContent = val;//此处记录在父级可能没用了，因为抽出来item不读这个属性
			return;
		}
		isc.JGV3ValuesManager.getByDataSource(this.TableName).setValue(this.ColumnName, val); //同步JGFormItemModel
		//如果控件不显示或者编辑器对象不存在，则先缓存数据，问题场景：控件默认不显示
		var editor = this.items[0].editor;
		if (!this.isVisible() || !editor) {
			this.items[0].initLoadDataTempValue = val;
			return;
		}
		//当配置了加载时就新增数据规则，editor还没有渲染出来就set值的话，ueditor里会出错，这里捕获一下，不往外提示错误
		try {
			if (this.items[0].editor.getContent() != val) {
				this.items[0].editor.setContent(val);
				//this.editor.reset();
			}
		} catch (e) {
			//把加载的初始值缓存起来，等渲染后再设进去
			if (val) {
				this.items[0].editor.initLoadDataTempValue = val;
			}
		}
	},

	//取此控件的打印的内容
	getPrintInnerHTML: function () {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}
		
		return this.items[0].editor.getContent();
	},

	/**
	 * 取值
	 */
	getContent: function () {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.getContent();
	},

	/**
	 * 取值(不含网页要素）
	 */
	getContentTxt: function () {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.getContentTxt();
	},

	/**
	 * 取值(不含网页要素）
	 */
	getPlainTxt: function () {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.getPlainTxt();
	},

	/**
	 * 取值长度(不含网页要素）
	 */
	getPlainTxtLength: function () {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.getContentLength(true);
	},

	/**
	 * 判断是否有值
	 */
	hasContents: function () {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.hasContents();
	},

	/**
	 * 封装queryCommandState
	 */
	queryCommandState: function (name) {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.queryCommandState(name);
	},

	/**
	 * 获得内容之前
	 */
	beforegetcontent: function (id, editorOption) {
		this.items[0].editor.beforegetcontent();
	},

	/**
	 * 获得内容之后
	 */
	aftergetcontent: function (id, editorOption) {
		this.items[0].editor.aftergetcontent();
	},

	/**
	 * 设置内容之前
	 */
	beforesetcontent: function (id, editorOption) {
		this.items[0].editor.beforesetcontent();
	},

	/**
	 * 设置内容之后
	 */
	aftersetcontent: function (id, editorOption) {
		this.items[0].editor.aftersetcontent();
	},

	/**
	 * 在选区改变之前触发
	 */
	beforeselectionchange: function (id, editorOption) {
		this.items[0].editor.beforeselectionchange();
	},

	/**
	 * 改变选区触发
	 */
	selectionchange: function (id, editorOption) {
		this.items[0].editor.selectionchange();
	},

	/**
	 * 在执行命令之前触发
	 */
	beforeexeccommand: function (id, editorOption) {
		this.items[0].editor.beforeexeccommand();
	},

	/**
	 * 执行命令之后触发
	 */
	afterexeccommand: function (id, editorOption) {
		this.items[0].editor.afterexeccommand();
	},

	/**
	 * 执行命令
	 */
	execCommand: function (cmdName, value) {
		if (this.items == undefined || this.items == null || !(this.items instanceof Array)) {
			return null;
		}
		if (this.items[0].editor == undefined || this.items[0].editor == null) {
			return null;
		}

		return this.items[0].editor.execCommand(cmdName, value);
	},
	/**
	 * 复写方法 
	 * @param {Object} dataSource
	 * @param {Object} fields
	 */
	setDataSource: function (dataSource, fields) {

	},
	/**
	 * 复写方法 
	 */
	parentVisibilityChanged: function (visible) {
		if (visible == "hidden") {
			if (this.items[0].editor) {
				this.items[0].editor.hide();
			}
		} else {
			if (this.items[0].editor) {
				this.items[0].editor.show();
			}
		}
	},

	//放在容器中按布局排版时缩放
	resized: function () {
		this.Super("resized", arguments);
		if (this.Dock != "None" && this.isDrawn() && this.items[0].editor.isReady) {
			var newHeight = this.getHeight() + "px";
			var newWidth = this.getWidth() + "px";
			if (!this.items[0].editor.ui.getDom()) {
				return;
			}
			if (this.Dock == "Fill" || !this.StaticLayoutSize) {
				this.items[0].editor.ui.getDom().style.height = newHeight;
				this.items[0].editor.ui.getDom().style.width = newWidth;
				this.items[0].editor.ui.getDom('iframeholder').style.width = newWidth;
				var toolbarboxHeight = this.items[0].editor.ui.getDom('toolbarbox').offsetHeight;
				var contentHeight = this.getHeight() - toolbarboxHeight;
				this.items[0].editor.ui.getDom('iframeholder').style.height = contentHeight + "px";
			} else {
				//是否固定高或固定宽，Top/Bottom时是否固定高，Left/Right时是否固定宽
				if (this.Dock == "Top" || this.Dock == "Bottom") {
					this.items[0].editor.ui.getDom().style.width = newWidth;
					this.items[0].editor.ui.getDom('iframeholder').style.width = newWidth;
					var toolbarboxHeight = this.items[0].editor.ui.getDom('toolbarbox').offsetHeight;
					var contentHeight = this.getHeight() - toolbarboxHeight;
					this.items[0].editor.ui.getDom('iframeholder').style.height = contentHeight + "px";
				} else if (this.Dock == "Left" || this.Dock == "Right") {
					this.items[0].editor.ui.getDom().style.height = newHeight;
					//var toolbarboxHeight = this.editor.ui.getDom('toolbarbox').offsetHeight;
					//var contentHeight = this.getHeight() - toolbarboxHeight;
					//this.editor.ui.getDom('iframeholder').style.height = contentHeight + "px";
				}
			}
		}
	},

	setVisible: function (visible) {//问题场景：通过规则把控件隐藏后再显示，之前值无法还原
		if (!visible && this.isVisible() && this.items[0].getContent) {//隐藏前，保存当前值
			this.items[0].initLoadDataTempValue = this.items[0].getContent();
		}
		this.Super("setVisible", arguments);
	},

	initBindDataAndUIEvnet: function() {
		var _this = this;
		isc.DatasourceUtil.addDatasourceCurrentEventHandler(this, function() {
			var datasource = isc.WidgetDatasource.getDatasource(_this);
			var record = datasource.getCurrentRecord();
			_this.setValue(_this.filterRecord(record, _this));
		});

		isc.DatasourceUtil.addDatasourceUpdateEventHandler(this, function() {
            var datasource = isc.WidgetDatasource.getDatasource(_this);
			var record = datasource.getCurrentRecord();
			_this.setValue(_this.filterRecord(record, _this));
        });

		isc.DatasourceUtil.addDatasourceDeleteEventHandler(this, function() {
            _this.clearValues();
        });

		//注册值改变事件
		isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(this, this.ColumnName, this._eventHandler(this.code, "OnValueChanged")); 
		//注册值加载事件
		isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded); 
	},

	filterRecord: function (record, widget) {
		if (record) {
			var fields = isc.WidgetDatasource.getFields(widget);
			return record[fields[0]];
		}
		return null;
	},

	getDefaultValue: function() {
		// 如果默认值是整数，需要转换成字符串处理
        return  isc.WidgetDatasource.getSingleColumnWidgetDefaultValue(this);
	},

	setV3Value: function(propertyValue) {
    	isc.WidgetDatasource.setSingleValue(this, propertyValue);
    },

	getVisible: function() {
        return this.isVisible();
    },

	setFocus: function() {
        this.setControlFocus();
    },

	cleanSelectedControlValue: function(onlyCleanSelectedRecord) {
        isc.WidgetDatasource.clearValue(this, onlyCleanSelectedRecord);
    },

	getPlainText: function() {
        return this.getPlainTxt();
    },

	getPlainTextLength: function(){
        return this.getPlainTxtLength();
    },
	getBindFields: function() {
        return [this.ColumnName];
    },

	getV3MethodMap : function(){
        return {
            setValue : "setV3Value"
        };
    }
});
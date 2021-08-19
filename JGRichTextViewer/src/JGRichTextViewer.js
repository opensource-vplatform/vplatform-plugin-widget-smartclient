/**
 * 弹出选择
 * @class JGRichTextViewer
 * @extends JGBaseFormWidget
 * @example
 * isc.JGRichTextViewer.create({
 * 	autoDraw: true
 * });
 */
// 定义v3ui控件类型--富文本浏览
isc.ClassFactory.defineClass("JGFormatTextDisplay", "JGBaseFormWidget");
isc.ClassFactory.defineClass("JGRichTextViewer", "JGFormatTextDisplay");

isc.JGFormatTextDisplay.addProperties({
	/**
	 * 控件绝对定位上边距
	 *
	 * @type {Number}
	 */
	Top: 0,

	/**
	 * 控件绝对定位左边距
	 *
	 * @type {Number}
	 */
	Left: 0,

	/**
	 * 控件高度
	 *
	 * @type {Number}
	 */
	Height: 100,

	/**
	 * 是否显示
	 *
	 * @type {Boolean}
	 */
	Visible: true,

	/**
	 * 是否只读
	 *
	 * @type {Boolean}
	 */
	ReadOnly: false,

	/**
	 * 是否使能
	 *
	 * @type {Boolean}
	 */
	Enabled: true,

	/**
	 * 是否显示容器默认边框
	 *
	 * @type {Boolean}
	 */
	showEdges: false,

	/**
	 * 边框样式
	 *
	 * @type {String}
	 */
	//			BorderStyle : "1px solid #999",

	//			BorderWidth : "1",

	/**
	 * 背景色
	 *
	 * @type {String}
	 */
	BackColor: "#f2f2f2",

	/**
	 * 内间距
	 *
	 * @type {Number}
	 */
	Padding: 0,

	/**
	 * 滚动条配置
	 *
	 * @type {String}
	 */
	overflow: 'auto',

	/**
	 * 包含的内容
	 *
	 * @type {String}
	 */
	Contents: "",

	/**
	 * 绑定字段名称
	 *
	 * @type {String}
	 */
	ColumnName: '',

	/**
	 * 事件类型
	 *
	 * @type {Array}
	 */
	listener: [
		'load'
	]
});

isc.JGFormatTextDisplay.addMethods({
	_initProperties: function (properties) {
		// 未处理
		// -- init --
		var borderWidth = this.BorderWidth ? this.BorderWidth : "1px";
		var borderColor = this.BorderColor ? this.BorderColor : "#d9dae0";
		var backColor = this.BackColor ? this.BackColor : "white";
		var styles = [];
		if (borderWidth && borderWidth != "1px" || borderColor && borderColor != "#d9dae0") {
			styles.push("border: " + borderWidth + " solid " + borderColor + "!important");
		}
		if (backColor && backColor != "white") {
			styles.push("background-color:" + backColor + "!important");
		}
		if (styles.length > 0 && this.items && this.items[0] && this.items[0].editorDivId) {
			isc.Environment.parseCssStr("#" + this.items[0].editorDivId + ">div.edui-editor.edui-default{" + styles.join(";") + "}");
		}
		// -- END --

		this.TitleWidth = 0;
		this.itemLayout = "absolute";
		this.overflow = isc.Canvas.IGNORE;
		this.items = [isc.addProperties(properties, {
			type: "V3RichTextEditorItem",//"V3RichTextViewItems",//富文本编辑添加预览模式，富文本改用编辑，设置成预览模式：原预览没有样式隔离
			isAbsoluteForm: true,
			viewonly: true
		})];

		this._initBindDataAndUIEvent();
	},

	/*
	生成边框样式
   */
	_genBorderStyle: function (borderWidth, borderColor) {
		//  borderWidth = isc.isA.Number(borderWidth) ? borderWidth : '1';
		borderColor = isc.isA.nonemptyString(borderColor) ? borderColor : '#dedede';
		return borderWidth + ' solid ' + borderColor + ";word-break: break-all;word-wrap: break-word;word-spacing: normal;";
	},

	/**
	 * 引用控件函数
	 */
	_referPartFunc: function () {
		this.Super("_referPartFunc", arguments);
		this._referFuncs(this.getItems()[0], ['setFocus', 'setBorder', 'getBorder']);
	},

	/**
	 * 设置控件值
	 * @param {String}
	 * 		    val 控件值
	 */
	setValue: function (val) {
		val = (val != undefined && val != null) ? val : '';
		this.getItems()[0].setContent(val);
		this.fireEvent("load");
	},

	getPrintHTML: function () {
		return this.getItems()[0].getContent();
	},

	/**
	 * 控件打印预览
	 */
	controlPrintPreview: function (controls) {
		//当页面有滚动条时，把它滚到0,0，因为弹出的打印窗体默认是在0,0上的
		if (isc.Page && (isc.Page.getScrollTop() > 0 || isc.Page.getScrollLeft() > 0)) {
			isc.Page.scrollTo(0, 0);
		}
		//isc.Canvas.showPrintPreview(controls,{"absPos":true});
		isc.Canvas.showPrintPreview(controls);
	},

	/**
	 * 控件打印
	 */
	controlPrint: function (controls) {
		//isc.Canvas.printComponents(controls,{"absPos":true});
		isc.Canvas.printComponents(controls);
	},
	/**
	 * 获取控件值
	 * @return 控件值
	 */
	getValue: function () {
		return this.getItems()[0].getContent();
	},

	/**
	 * 获取值背景色
	 * @return 值背景色
	 */
	getValueBackColor: function () {
		return this.BackColor;
	},

	/**
	 * 设置值背景色
	 * @param {String}
	 * color 值背景色
	 */
	setValueBackColor: function (color) {
		this.BackColor = color;
		// this.getItems()[0].setBackgroundColor(color);//旧版服务也没有效果，等有需求再支持
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.setWidth(percentWidth);
		//this.Super("setPercentWidth", arguments);
		//this.setWidth(percentWidth);
		//this.getItems()[0].setWidth(percentWidth);
		//this.setWidth("100%");
		//this.getItems()[0].setWidth("100%");
		//if(this.getItems()[0].HTMLF){
		//	this.getItems()[0].HTMLF.setWidth("100%");
		//}
		//if(this.getItems()[0].canvas){
		//	this.getItems()[0].canvas.setWidth("100%");
		//}
	},
	setPercentHeight: function (percentHeight) {
		this.setHeight(percentHeight);
		//this.Super("setPercentHeight", arguments);
		//this.setHeight(percentHeight);
		//this.getItems()[0].setHeight(percentHeight);
		//this.setHeight("100%");
		//this.getItems()[0].setHeight("100%");
		//if(this.getItems()[0].HTMLF){
		//	this.getItems()[0].HTMLF.setHeight("100%");
		//}
		//if(this.getItems()[0].canvas){
		//	this.getItems()[0].canvas.setHeight("100%");
		//}
	},

	setVisible: function (visible) {//问题场景：通过规则把控件隐藏后再显示，之前值无法还原
		if (!visible && this.isVisible() && this.items[0].getContent) {//隐藏前，保存当前值
			this.items[0].initLoadDataTempValue = this.items[0].getContent();
		}
		this.Super("setVisible", arguments);
	},

	_initBindDataAndUIEvent: function () {
		// initBindData
		var _this = this;
		isc.DatasourceUtil.addDatasourceCurrentEventHandler(this, function () {
			var datasource = isc.WidgetDatasource.getDatasource(_this);
			var record = datasource.getCurrentRecord();
			_this.setValue(record[_this.ColumnName]);
		});

		isc.DatasourceUtil.addDatasourceUpdateEventHandler(this, function () {
			var datasource = isc.WidgetDatasource.getDatasource(_this);
			var record = datasource.getCurrentRecord();
			_this.setValue(record[_this.ColumnName]);
		});

		isc.DatasourceUtil.addDatasourceDeleteEventHandler(this, function () {
			_this.setValue('');
		});

		// initUIEvent
		//注册值加载事件
		isc.DatasourceUtil.addDatasourceLoadEventHandler(this, this.OnValueLoaded);
	},

	getField: function (fieldName) {
        var field = this[fieldName];
        if (field) {
            return { "field": field };
        } else {
            return {};
        }
    },

	/**
	* 获取控件属性
	*
	* @param widgetId
	*            控件元素
	* @param propertyName
	*            属性名称
	* @return value
	*/
	getProperty: function () {
		this.getValue();
	},

	/**
	 * 设置控件属性
	 *
	 * @param widgetId
	 *            控件元素
	 * @param propertyName
	 *            属性名称
	 * @param propertyValue
	 *            属性值
	 */
	setProperty: function (propertyValue) {
		this.setValue(propertyValue);
	},

	/**
	 * 获取控件的使能值
	 */
	getEnabled: function () {
		return !this.isDisabled();
	},


	setV3Value: function (propertyValue) {
		isc.WidgetDatasource.setSingleValue(this, propertyValue);
	},

	getV3Value: function () {
		var value = isc.WidgetDatasource.getSingleValue(this);
		if (undefined == value || null == value) {
			return "";
		}
		return value;
	},

	getVisible: function () {
		return this.isVisible();
	},

	setBackColor: function (color) {
		this.BackColor = color;
	},

	getV3MethodMap: function () {
		return {
			setFocus: "setV3Focus",
			setValue: "setV3Value",
			getValue: "getV3Value"
		};
	}
});



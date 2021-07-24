//百分比
/**
 * 百分比控件
 * @class JGPercent
 * @extends JGBaseWidget
 * @mixes IRecordObserver
 * @mixes JGStyleHelper
 * isc.JGPercent.create({
 * 	autoDraw: true
 * });
 */
isc.ClassFactory.defineClass("JGPercent", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGPercent", "IRecordObserver");
isc.ClassFactory.mixInInterface("JGPercent", "JGStyleHelper");


// 定义v3ui控件属性
isc.JGPercent.addProperties({

	/**
	 *比例颜色
	 */
	FrontColor: null,

	/**
	 *字体颜色
	 */
	FontColor: null,

	/**
	 *背景颜色
	 */
	BgColor: null,

	/**
	 *左边距
	 */
	Left: 0,

	/**
	 *宽度
	 */
	Width: 100,

	/**
	 *字段
	 */
	ColumnName: null,

	/**
	 *表名
	 */
	TableName: null,

	/**
	 *上边距
	 */
	Top: 0,

	/**
	 *字体
	 */
	ValueFont: null,
	/**
	 *高度
	 */
	Height: 0,

	/**
	 *垂直、水平标记（默认水平）
	 */
	Vertical: false,

	/**
	 *显示
	 */
	Visible: true,


	/**
	 *事件类型
	 */
	listener: ['OnClick'],

	_progressBar: null,
	//百分比的值
	_percentDone: 0

});


isc.JGPercent.addMethods({

	/**
	 * 自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
	 */
	_initWidget: function () {
		//this.Super("init", arguments);

		if(this.TableName&&this.TableName.addObserver){
			this.TableName.addObserver(this);
		}

		this.ValueFont = this.ValueFontStyle;

		//默认标题
		var _title = '0%';

		var _jGPercent = this;

		var frontImg = 'h_redstretch';

		//比例颜色
		if (this.FrontColor == 'red-line') {
			frontImg = 'h_redstretch';
		} else if (this.FrontColor == 'orange-line') {
			frontImg = 'h_orangestretch';
		} else if (this.FrontColor == 'yellow-line') {
			frontImg = 'h_yellowstretch';
		} else if (this.FrontColor == 'green-line') {
			frontImg = 'h_greenstretch';
		} else if (this.FrontColor == 'blue-line') {
			frontImg = 'h_bluestretch';
		} else if (this.FrontColor == 'purple-line') {
			frontImg = 'h_purplestretch';
		} else if (this.FrontColor == 'pink-line') {
			frontImg = 'h_pinkstretch';
		} else if (this.FrontColor == 'brown-line') {
			frontImg = 'h_brownstretch';
		} else if (this.FrontColor == 'lightblue-line') {
			frontImg = 'h_lightbluestretch';
		}

		this.className = this.WidgetStyle + "Normal";

		//构造百分比对象
		this._progressBar = isc.Progressbar.create({
			vertical: this.Vertical,
			length: this.Width,
			percentDone: this._percentDone,
			breadth: this.Height,
			showTitle: false,
			skinImgDir: '[APP]/itop/common/images/progressbar/',
			title: _title,
			click: this._referEvent(this, 'OnClick'),
			horizontalItems: [{
					name: "h_start",
					size: 0
				},
				{
					name: frontImg,
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
			]
		});

		this._label = isc.Label.create({

			height: this.Height,
			width: this.Width,
			align: 'center',
			contents: '0%',
			showEdges: false,
			canFocus: false, //是否可获取焦点
			showFocusOutline: false,
			click: this._referEvent(this, 'OnClick'),
			cssText: this.genFontCssText(this.ValueFont, this.FontColor)
			//backgroundColor:this.BackColor,
		});

		// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		this.addChild(this._progressBar);
		this.addChild(this._label);
		this._initBindData();
	},

	_initBindData: function(){
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function(record) {
			var value = isc.WidgetDatasource.getSingleValue(_this);
			_this.setValue(value);
		});
	},

	/**
	 * 复写方法 
	 * @param {Object} dataSource
	 */
	bindDataSource: function (dataSource) {

	},

	/**
	 *获取百分比的值
	 *@return Integer
	 */
	getValue: function () {
		return parseFloat(this._percentDone);
	},

	/**
	 *设置百分比的值
	 *@param value{String},比分比值
	 */
	setValue: function (value) {
		var _percentValue = Math.round(value * 10000) / 100;
		var progressBar = this._progressBar;
		progressBar.setPercentDone(_percentValue);
		progressBar.setTitle(_percentValue + '%');
		this._label.setContents(_percentValue + '%');
		this._percentDone = value;
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		this._progressBar.setWidth("100%");
		this._label.setWidth("100%");
	},

	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		this._progressBar.setHeight("100%");
		this._label.setHeight("100%");
	},
	destroy: function () {
		this._progressBar = null;
		this._label = null;
		this.Super("destroy", arguments);
	},
	setWidgetData: function(val){
		this.setValue(val);
	},

	clearWidgetData: function(){
		this.setValue(0);
	},

	getBindFields: function(){
		return [this.ColumnName];
	},

	getV3Value: function() {
		var value = isc.WidgetDatasource.getSingleValue(this);
		if (undefined == value || null == value) {
			return "";
		}
		return value;
	},

	setV3Value: function(value) {
		iscWidgetDatasource.setSingleValue(this, value);
	},

	getVisible: function() {
		return this.isVisible();
	},

	getDefaultValue: function() {
		return isc.WidgetDatasource.getSingleColumnWidgetDefaultValue(this);
	},

	getV3MethodMap: function(){
		return {
			getValue: "getV3Value",
			setValue: "setV3Value"
		}
	}


});
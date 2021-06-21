/**
 * @interface IV3BaseWidget v平台控件基础定义
 * @catalog Client Reference/V平台扩展
 */
isc.ClassFactory.defineInterface("IV3BaseWidget");

isc.IV3BaseWidget.addInterfaceProperties({
	/**
	 * @property {Number} 上边距
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	Top: 0,

	/**
	 * @property {Number} 左边距
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	Left: 0,
	/**
	 * @ignore
	 */
	Width: null,

	/**
	 * 1、content 根据内容设置宽度
	 * 2、**% 百分比宽度
	 * 3、**px 固定宽度
	 * @property {String} 控件宽度
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	MultiWidth: null,

	Height: null,

	/**
	 * 1、content 根据内容设置高度
	 * 2、**% 百分比高度
	 * 3、**px 固定高度
	 * @property {String} 控件高度
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	MutiHeight: null,

	/**
	 * @property {String} 内容排列
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	ContentAlignment: null,

	/**
	 * @property {String} 水平位置
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	HorizontalAlign: null,

	/**
	 * @property {String} 垂直位置
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	VerticalAlign: null,
	/**
	 * @ignore
	 * 原始宽高值
	 */
	_orginalRect: null
});

isc.IV3BaseWidget.addInterfaceMethods({

	/**
	 * 初始化v3平台控件
	 * @method
	 * @memberof IV3BaseWidget
	 * @instance
	 */
	initV3Widget: function () {
		this.id = isc.WidgetUtils.genWidgetRefId(this.scopeId, this.widgetId);
		var rect = [this.Width, this.Height];
		/*if(!this.isOldWindowLayoutConfig || !this.isOldWindowLayoutConfig()){//新布局
			var mulitWidth = this.MultiWidth;
			var multiHeight = this.MultiHeight;
			if(null != mulitWidth && "" != mulitWidth && mulitWidth != "space"){
				mulitWidth = Number(mulitWidth.replace("px",""));
				if(!isNaN(mulitWidth)){
					rect[0] = mulitWidth;
				}
			}
			
			if(null != multiHeight && "" != multiHeight && multiHeight != "space"){
				multiHeight = Number(multiHeight.replace("px",""));
				if(!isNaN(multiHeight)){
					rect[1] = multiHeight;
				}
			}
		}*/
		this._orginalRect = rect;
		isc.JGWidgetManager.putWidget(this.id, this);
	},

	_processRect: function (val, pro) {
		if (typeof (val) == 'string') {
			if (val == 'content') {
				return 20;
			} else if (val.endsWith('%')) {
				return val;
			} else if (val.endsWith('px')) {
				return parseInt(val)
			}
		}
		return val;
	},

	_processContentVal: function (val) {
		return parseInt(0.5 * val);
	},

	/**
	 * 获取处理后的高度
	 */
	getProcessedHeight: function () {
		return this._processRect(this.MultiHeight, 'height');
	},
	/**
	 * 获取处理后的宽度
	 */
	getProcessedWidth: function () {
		return this._processRect(this.MultiWidth, 'width');
	},
	/**
	 * 设置百分比高度 
	 */
	setPercentHeight: function (val) {
		this.setHeight(val);
	},
	/**
	 * 设置百分比宽度
	 */
	setPercentWidth: function (val) {
		this.setWidth(val);
	},

	/**
	 * 获取原始宽高值
	 */
	getOrginalRect: function () {
		return this._orginalRect;
	},

	/**
	 * 添加v3平台子控件
	 */
	addV3Child: function (child) {
		this.addChild(child);
	},
	/**
	 * 构建控件父子关系
	 */
	buildRelation: function () {
		var children = this.layoutChildWidgets();
		if (children && children.length > 0) {
			for (var i = 0, child; child = children[i]; i++) {
				this.addV3Child(child);
			}
		}
		var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
		if (childrenIds && childrenIds.length > 0) {
			for (var i = 0, childId; childId = childrenIds[i]; i++) {
				var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
				var child = isc.JGWidgetManager.getWidget(childRefId);
				if (!child) continue;
				child.buildRelation();
			}
		}
	},
	/**
	 * 获取内容排列
	 * @method
	 * @memberof IV3BaseWidget
	 * @instance
	 * @returns String
	 */
	getContentAlignment: function () {
		return this.ContentAlignment;
	},
	/**
	 * 获取水平位置
	 * @method
	 * @memberof IV3BaseWidget
	 * @instance
	 * @returns String
	 */
	getHorizontalAlign: function () {
		return this.HorizontalAlign;
	},

	/**
	 * 获取垂直位置
	 * @method
	 * @memberof IV3BaseWidget
	 * @instance
	 * @returns {String} 垂直位置
	 */
	getVerticalAlign: function () {
		return this.VerticalAlign;
	},
	parentReadOnly: function (newState) {
		if (this.type == "JGGroupPanel") {
			if (newState && this.childrenWidgets && this.childrenWidgets.length == 1) {
				this.realHeight = this.getVisibleHeight();
				this.setHeight(0);
			} else if (typeof (this.realHeight) == 'number') {
				this.setHeight(this.realHeight);
			}
		}
		if (this.ReadOnly)
			return;
		this._ReadOnly = newState;
		if (this.setHandleReadOnly)
			this.setHandleReadOnly(newState);
		if (this.childrenWidgets)
			this.childrenWidgets.map("parentReadOnly", newState)
	},
	on: function (eventName, handler) {
		if (eventName == "ConfigChanged") {
			handler();
		}
		if (!this.listener) {
			this.listener = [];
		}
		if (this.listener.hasOwnProperty(eventName)) {
			var handlers = this.listener[eventName];
			handlers.push(handler);
		} else if (eventName != "ConfigChanged") {
			throw Error("控件[" + this.getClassName() + "]不支持[" + eventName + "]事件！");
		}
	},
	un: function (eventName) {
		if (this.listener) {
			if (this.listener.hasOwnProperty(eventName)) {
				this.listener[eventName] = [];
			} else {
				throw Error("控件[" + this.getClassName() + "]不支持[" + eventName + "]事件！");
			}
		}
	},
	/**
	 * 用于兼容旧布局窗体
	 * return	{String}	null或""是旧配置	
	 * */
	getLayoutVersion: function () {
		//等开发系统出配置方案
		return this._$windowVersion;
	},
	/**
	 * 判断是否旧窗体配置
	 * */
	isOldWindowLayoutConfig: function () {
		var version = this.getLayoutVersion();
		if (null == version || "" == version) {
			return true;
		}
		var widthNotEqual = typeof this.Width == "number" && this.MultiWidth.indexOf("px") != -1 && this.MultiWidth != this.Width + "px";
		var heightNotEqual = typeof this.Height == "number" && this.MultiHeight.indexOf("px") != -1 && this.MultiHeight != this.Height + "px"
		if (widthNotEqual && heightNotEqual) {
			return true;
		}
		return false;
	},
	/**
	 * 触发平台事件前事件，各个控件自行覆写
	 * @memberof IV3BaseWidget
	 * @instance
	 * @param	eventName		{String}	事件名称
	 * @param	proxyWidgetCode	{String}	代理控件编码，如果没有代理控件，此值为当前控件编码
	 * @param	itemCode		{String}	子控件编码，如果没有代理控件，此值跟参数二一致
	 * */
	firePlatformEventBefore: function (eventName, proxyWidgetCode, itemCode) {},
	/**
	 * 触发平台事件后事件，各个控件自行覆写
	 * @memberof IV3BaseWidget
	 * @instance
	 * @param	eventName		{String}	事件名称
	 * @param	proxyWidgetCode	{String}	代理控件编码，如果没有代理控件，此为控件编码
	 * @param	itemCode		{String}	子控件编码，如果没有代理控件，此值跟参数二一致
	 * */
	firePlatformEventAfter: function (eventName, proxyWidgetCode, itemCode) {}
});
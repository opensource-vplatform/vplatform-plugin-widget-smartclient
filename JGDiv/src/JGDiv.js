/**
 * 控件渲染器
 */
/**
 * UI定义（此方法只运行一次）
 * 
 * 在这里可以基于第三方UI进行定制
 */

isc.ClassFactory.defineClass("JGDiv", "JGBaseWidget");
isc.JGDiv.addProperties({
	//可以选择里面的文本
	canSelectText: true,
	//鼠标形状为自动
	cursor: 'auto',
	_renderFn: null,
});
isc.JGDiv.addMethods({
	//自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
	_initWidget: function () {
		try {
			delete this.click;
			delete this.onchange1;
		} catch (e) {

		}
		this.initEvent();
	},
	onRenderFn: function (fn) {
		if (this.isDrawn()) {
			fn.call(this, this.widgetId, this);
		} else {
			this._renderFn = fn;
		}
	},
	onDraw: function () {
		var _this = this;
		this.overflow = "hidden";
		this.templateDIVId = 'templateDIV_' + this.scopeId + '_' + this.getId();
		var dock = this.Dock;
		var width = this.Width;
		var height = this.Height;
		var arr = ["Fill", "Top", "Bottom", "Right", "Left"];
		if (this.StaticLayoutSize == false) {
			switch (dock) {
				case "Top":
				case "Bottom":
					height = "100%";
					break;
				case "Left":
				case "Right":
					width = "100%";
					break;
			}
		}
		var getStyle = function (val) {
			if (val == "overflow") {
				return _this.MultiHeight != "content" && _this.MultiWidth != "content" ? "auto" : "unset";
			} else {
				return !val ? "auto" : (val + "").indexOf("%") != -1 ? val : val + "px";
			}

		}
		//				var templateDIV = '<div id="' + this.templateDIVId + '"  style="width:'+getStyle(width)+';height:'+getStyle(height)+';overflow-x:'+getStyle('overflow-x')+';overflow-y:'+getStyle('overflow-y')+'"></div>';
		var templateDIV = '<div id="' + this.templateDIVId + '"  style="width:' + getStyle(width) + ';height:' + getStyle(height) + ';overflow:' + getStyle('overflow') + '"></div>';
		var params = {
			width: "100%",
			height: "100%",
			canFocus: true,//是否可获取焦点
			contents: templateDIV,
			canSelectText: true,
			cursor: 'auto',
			overflow: "hidden",
			//					overflow:this.MultiWidth == "content" && this.MultiHeight == "content" ? "visible" : this.MultiWidth == "content" ? "clip-v" : this.MultiHeight == "content" ? "clip-h" : "visible",
			redraw: function () {
				this.Super('redraw', arguments);
				var $element = $("#" + _this.templateDIVId);
				$element.css('overflow', 'auto');
			},
		};
		if (arr.indexOf(dock) != -1 || this.MultiHeight == "space" || this.MultiWidth == "space" || this.MultiHeight == "content" || this.MultiWidth == "content") {
			params.useClipDiv = false;
		}
		this._boxPanel = isc.Canvas.create(params);
		// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		this.addChild(this._boxPanel);
		this.Super("draw");
		if (this._renderFn) {
			this._renderFn(this.widgetId, this);
			this._renderFn = null;
		}
		this._boxPanel.setRight("0");
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		var arr = ["Fill", "Top", "Bottom"];
		if (arr.indexOf(this.Dock) != -1) {
			if (this._boxPanel) {
				this._boxPanel.setWidth('100%');
			} else {
				this.Width = "100%";
			}
		}

	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		var dock = this.Dock;
		var arr = ["Fill", "Right", "Left"];
		if (arr.indexOf(dock) != -1) {
			if (this._boxPanel) {
				this._boxPanel.setHeight('100%');
			} else {
				this.Height = "100%";
			}
		}
	},
	updateProperty: function (parmas) {
		if (!parmas || !parmas.propertys || !parmas.widget) {
			return;
		}
		var propertyMap = parmas.propertys;
		var widget = parmas.widget;
		var propertys = propertyMap.Properties;
		if (propertys) {
			for (var property in propertys) {
				if (propertys.hasOwnProperty(property)) {
					var val = propertys[property];
					widget[property] = propertys[property];
				}
			}
		}
	},

	initEvent: function() {
		var vueObj = this._$vueObj;
		if(vueObj && vueObj.vueInstance && typeof(vueObj.vueInstance._$registerDataLoadedEvent) == 'function'){
			vueObj.vueInstance._$registerDataLoadedEvent();
		}
		this.onRenderFn(this.initRenderVue);
	},

	initRenderVue: function (widgetCode, widget) {
		//初始化JGDiv
		var pros = this.getWidgetTemplateParams(widgetCode);
		var $element = $("#templateDIV_" + widget.scopeId + '_' + widgetCode);
		if ($element.length > 0) {
			var vue = this._createVPlatformVue($element[0], widgetCode);
			widget._$vueObj = vue;
			widget._$getCurrentVue = (function (_this) {
				return function () {
					if (_this._$vueObj) {
						return _this._$vueObj.vueInstance;
					}
					return null;
				}
			})(widget);
	
		}
	},
	resizeDIV: function(wd,templateDIV,attr,value){
		if(attr == "width"){
			var element = templateDIV.firstChild;
			var width = element.offsetWidth;
			wd._boxPanel.setWidth(width);
			wd.setWidth(width);
			templateDIV.style.overflow = "auto";
		}else if(attr == "height"){
			templateDIV.style.overflow = "auto";
			var height = templateDIV.offsetHeight;
			wd._boxPanel.setHeight(height);
			wd.setHeight(height);
		}
	},
	/**
	 * 组装模板脚本参数
	 * */
	getWidgetTemplateParams : function(widgetCode){
		var widgetTemplate = this.getWidgetContextProperty(widgetCode, "WidgetTemplate");
		var pros;
		if(widgetTemplate==null){//旧配置
			pros = {};
			pros.Entities = this.getWidgetContextProperty(widgetCode,"EntityCodes");
			pros.Html = this.getWidgetContextProperty(widgetCode,"Html");
			pros.ModuleJavaScript = this.getWidgetContextProperty(widgetCode,"ModuleJavaScript");
			pros.Css = this.getWidgetContextProperty(widgetCode,"Css");
			pros.JavaScript = this.getWidgetContextProperty(widgetCode,"JavaScript");
			pros.ModuleCss = this.getWidgetContextProperty(widgetCode,"ModuleCss");
		}else{
			pros = widgetTemplate;
		}
		return pros;
	},
	/**
	 * 打开窗体到标签容器
	 * @param {Object} params 窗体参数
	 * {
	 * 		componentCode:'构件编码',
	 * 		windowCode:'窗体编码',
	 * 		title:'窗体标题',
	 * 		info:'其他信息',
	 * 		callback:Function,//
	 * 		closeback:Function//
	 * }
	 * */
	setopenWindowToDivContainer: function(params){
		//替换构件包映射信息
    	var newInfo = this.handleComponentPackInfo(params.componentCode,params.windowCode);
    	if(newInfo){
    		params.componentCode = newInfo.componentCode;
    		params.windowCode = newInfo.windowCode;
		}
    		/* 获取窗体映射信息 */
    		var windowMappingInfo = this.handleWindowMapping(params.componentCode,params.windowCode);
    		/* 若窗体映射信息不为空的话，则表示是配置相应的映射信息，需替换 */
    		if(windowMappingInfo!=null){
    			params.componentCode = windowMappingInfo.componentCode;
    			params.windowCode = windowMappingInfo.windowCode;
    		}
		var vue = this._$getCurrentVue();
		var containerCode = params.containerCode;
		if(vue && containerCode){
			vue._$fireVuiTagEvent(containerCode, "open", params);
		}
	},

	/**
	 * 触发vue事件
	 * @param {Object} params 参数
	 * {
	 * 		vuiCode : 'vui标签编码',
	 * 		eventName : '事件名称',
	 * 		params : '需要更新页签的数据'
	 * }
	 * */
	fireVueEvent : function(params){
		var widgetId = params.widgetId;
		var vuiCode = params.vuiCode;
		var eventName = params.eventName;
		var args = params.params;
		if(widgetId && vuiCode && eventName){
			var vue = this._$getCurrentVue();
			if(vue){
				vue._$fireVuiTagEvent(vuiCode, eventName, args);
			}
		}
	},
	/**
	 * 更新vui容器信息
	 * @param {String} widgetId div控件id
	 * @param {Object} params 容器标签信息
	 * */
    updateVuiContainerInfo : function(widgetId,params){
    	var vuiCode = params.vuiCode;
    	fireVueEvent({
    		widgetId : widgetId,
    		vuiCode : vuiCode,
    		eventName :'update',
    		params : params
    	})
    },
	renderWindowToVuiContainer : function(containerCode, params){
    	this.windowrenderToVuiContainer(this.code,containerCode)
    },
	//打开链接地址要用
	setfireVueEvent: function(params){
		fireVueEvent(params);
	},
    /**
     * 校验必填
     * */
	validate: function(widgetCode,entityCodes){
		var vue = this._$vueObj;
    	if(vue){
    		v3VueUtils.validate(vue,entityCodes);
    	}
    }
});



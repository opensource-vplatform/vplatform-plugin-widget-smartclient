/**
 * 网页控件
 * @class JGWebBrowser
 * @extends JGBaseWidget
 * 
 */
isc.ClassFactory.defineClass("JGWebBrowser", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGWebBrowser", "IWindowAop");

// 定义v3ui控件属性
isc.JGWebBrowser.addProperties({
	_WebBrowser: null,
	Width: 0,
	Height: 0,
	Top: 0,
	Left: 0,
	WebURL: null,
	WebParam: null,
	// 是否显示
	Visible: true
});

isc.JGWebBrowser.addMethods({
	_initWidget: function () {
		this.Super("initWidget", arguments);

		this.WebBrowser = isc.Canvas.create({
			//autoDraw : false,
			//autoDraw : false,
			//layoutLeftMargin : 0,
			//layoutRightMargin : 0,
			//layoutTopMargin : 0,
			//layoutBottomMargin : 0,
			//canDragReposition : false,
			//showHeader : false,
			//showStatusBar : true,
			//status : 'status',
			//showTitle : false,
			width: this.Width,
			height: this.Height,
			// src: "http://www.baidu.com/s"+"?wd=smartclient",
			//visibility : this.Visible ? "visible" : "hidden",
			//src : this.WebURL,
			//autoSize:true,
			contentsType: "page"
			//menu : ""


		});
		this.addChild(this.WebBrowser);

	},
	setParam: function (param) {
		this.WebParam = param;

	},

	draw: function () {
		this.Super('draw', arguments);
		var handle = this.WebBrowser.getHandle();
		if (handle) {
			handle.style.width = '100%';
			handle.style.height = '100%';
		}
	},

	reload: function (url) {
		var param = this.WebParam
		url = url + (url.indexOf('?') === -1 ? '?' : '&') + param;
		this.WebURL = url;
		this.WebBrowser.setContentsURL(url);
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this.WebBrowser.setWidth(percentWidth);
		this.WebBrowser.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this.WebBrowser.setHeight(percentHeight);
		this.WebBrowser.setHeight("100%");
	},

	destroy: function () {
		this.WebBrowser = null;
		this.Super("destroy", arguments);
	},

	/**
	 * 获取控件属性
	 * 
	 *            控件元素
	 * @param propertyName
	 *            属性名称
	 */
	getV3Param : function(propertyValue) {
		propertyValue = isc.JSON.decode(propertyValue);
		var retValue = '';
		if (propertyValue && propertyValue.NewDataSet && propertyValue.NewDataSet.dtParameter) {
			var params = propertyValue.NewDataSet.dtParameter;
			if (params) {
				if (params.length) {
					for (var i = 0, len = params.length; i < len; i++) {
						var param = params[i];
						retValue += this.parseParam(param);
						if (i + 1 < len)
							retValue += "&";
					}
				} else {
					retValue += this.parseParam(params);
				}
			}
		}
		return retValue;
	},

	parseParam : function(param) {
		var paramType = param.ParaType;
		var paraVariane = param.ParaVariane;
		var paraName = param.ParaName;
		var paramVal;
		var retValue = "";
		switch (paramType) {
		case "SystemVar":
			paramVal = null;
			break;
		case "ComponentVar":
			paramVal = this.windowVariantHandler(paraVariane);
			break;
		case "Field":
			var dbname = paraVariane.split(".");
			if (dbname.length > 1) {
				paramVal = this.fieldValueHandler(dbname[0], dbname[1]);

			} else {
				paramVal = paraVariane;
			}
			break;

		default:
			paramVal = paraVariane;
		}
		retValue += paraName;
		retValue += "=";
		retValue += encodeURIComponent(paramVal);
		return retValue;
	},
	afterDataLoad: function(){
		var url = this.WebURL;
		var param = this.parseWebParam(this.WebParam);
		if (url) {
			if (param) {
				this.setParam(param);
			} else {
				this.setParam('');
			}
			this.reload(url);

		}
	},

	parseWebParam: function(propertyValue) {
		propertyValue = isc.JSON.decode(propertyValue);
		var retValue = '';
		if (propertyValue && propertyValue.NewDataSet && propertyValue.NewDataSet.dtParameter) {
			var params = propertyValue.NewDataSet.dtParameter;
			if (params) {
				if (params.length) {
					for (var i = 0, len = params.length; i < len; i++) {
						var param = params[i];
						retValue += this.parseParam(param);
						if (i + 1 < len)
							retValue += "&";
					}
				} else {
					retValue += this.parseParam(params);
				}
			}
		}
		return retValue;
	},

	getV3MethodMap: function(){
		return {
			getParam: "getV3Param",
		

		}
	}

});







/**
 * 新闻列表
 * @class JGNewsList
 * @extends JGBaseWidget
 * @mixes JGStyleHelper
 * 
 */
isc.ClassFactory.defineClass("JGNewsList", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGNewsList", "JGStyleHelper");

isc.JGNewsList.addProperties({
	TitleHeight: 20, //标题高度
	TitleBgColor: '', //标题背景色
	TitleFontColor: '', //标题字体颜色
	TitleFont: '', //标题字体
	ColWidth1: 0,
	ColField1: '',
	ColFontColor1: '',
	ColFont1: '',
	ColWidth2: 0,
	ColField2: '',
	ColFontColor2: '',
	ColFont2: '',
	_stopMoving: false, //内部参数,控制是否停止滚动,默认为false
	backgroundColor: 'white', //默认设置背景色为白色
	AutoScroll: false, //是否自动滚动
	DoMoreClick: '',
	DoLink: '',
	listener: ['DoLink', 'DoMoreClick', 'currentRowClick'],
	WidgetStyle: "JGNewsList"
});

isc.JGNewsList.addMethods({
	_initWidget: function () {
		this.TitleText = this.SimpleChineseTitle;
		this.TitleBgColor = this.LabelBackColor;
		this.TitleFontColor = this.LabelForeColor;
		this.TitleFont = this.LabelFont;
		this.TitleHeight = this.LabelHeight;
		if (this.BorderWidth != "1px" || this.BorderColor != "")
		this.border = this.BorderWidth + " solid " + this.BorderColor;
		// 处理边框宽度
		var _borderWidth = this.BorderWidth + "" !== "" ? this.BorderWidth.replace("px", "") * 2 : 2;
		this.Height = this.Height - _borderWidth;
		this.Width = this.Width - _borderWidth;
		this.className = this.WidgetStyle;
		this.overflow = isc.Canvas.HIDDEN;
		this.contents = this.initDom();
	},
	_afterInitWidget: function () {
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceLoadEventHandler(this,null, function (params) {
			var resultset = params.resultSet;
			var datas = [];
			for (var i = 0, l = resultset.length; i < l; i++) {
				datas.push(resultset[i]);
			}
			_this.setDatas(datas);
		});
		isc.WidgetDatasource.addBindDatasourceUpdateEventHandler(this,null, function (params) {
			var resultset = params.resultSet;
			var datas = [];
			for (var i = 0, l = resultset.length; i < l; i++) {
				var tmpData = {};
				var _tmpRecrod = resultset[i];
				tmpData.id = _tmpRecrod.id;
				tmpData.changedData = _tmpRecrod;
				datas.push(tmpData);
			}
			_this.updateDatas(datas);
		});
		isc.WidgetDatasource.addBindDatasourceDeleteEventHandler(this, null,function (params) {
			var resultset = params.resultSet;
			var datas = [];
			for (var i = 0, l = resultset.length; i < l; i++) {
				var _tmpRecrod = resultset[i];
				datas.push(_tmpRecrod.id)
			}
			_this.deleteDatas(datas);
		});
		isc.WidgetDatasource.addBindDatasourceInsertEventHandler(this,null, function (params) {
			var resultset = params.resultSet;
			var datas = [];
			for (var i = 0, l = resultset.length; i < l; i++) {
				datas.push(resultset[i]);
			}
			_this.insertDatas(datas);
		});
		this.on("DoLink", this.OnItemClick);
		this.on("DoMoreClick", this.OnMoreClick);
		isc.DataBindingUtil.bindEvent(this, "currentRowClick", function (id) {
			var datasource = isc.WidgetDatasource.getBindDatasource(_this);
			var selectedRecord = datasource.getRecordById(id);
			if (selectedRecord)
				datasource.setCurrentRecord(selectedRecord);
		});
	},
	/*初始化DOM结构*/
	initDom: function () {
		var _titleStyle = this.TitleHeight + "" === "0" ? " display: none;" : "";
		//var _titleHeight = this.TitleHeight + "px;";
		if (this.Dock + "" === "None") {
			var _ulHeight = this.Height - this.TitleHeight;
			_ulHeight += "px";
			var _height = this.Height + "px";
			var _width = this.Width + "px;"
		} else {
			var _ulHeight = "100%";
			if (this.Dock + "" !== "Left" && this.Dock + "" !== "Right" && this.Dock + "" !== "Fill") {
				_ulHeight = this.Height - this.TitleHeight;
				_ulHeight += "px"
			}
			var _height = "100%";
			var _width = "100%"
		}

		return '<div class="" style="height:' + _height + ';width:' + _width + ';">'
			+ '<div class="' + this.className + 'Head" style="height:' + this.TitleHeight + 'px;line-height:' + this.TitleHeight + 'px;' + _titleStyle + ';background-color:' + this.TitleBgColor + ';' + this.genFontCssText(this.TitleFont, this.TitleFontColor) + '">'
			+ '<span class="' + this.className + 'TitleLeft">' + this.TitleText + '</span>'
			+ '<a href="javascript:void(0)" onclick="' + this.ID + '.doMoreClick();" style="background: url(itop/common/smartclient/isomorphic/skins/default/images/headerIcons/ico-dot.png) center center no-repeat; float: right; margin-right:'
			+ '6px; height:' + this.TitleHeight + 'px; width:24px;">'
			+ '</a>'
			+ '</div>'
			+ '<div style="overflow: hidden;"><ul style="overflow:auto;margin:0; padding:0; height:' + _ulHeight + ';"></ul><div>'
			+ '</div>';
	},
	doMoreClick: function () {
		this._callEvent(this, ["DoMoreClick"]);
		return false;
	},
	doRecordClick: function (_li) {
		var eventHandler = this.listener["currentRowClick"];
		if (eventHandler && eventHandler.length > 0) {
			var _widgetIDLen = this.ID.length,
				_id = $(_li).attr("id").substr(_widgetIDLen + 1); // id 由控件ID组成
			for (var j = 0, l = eventHandler.length; j < l; j++) {
				var handler = eventHandler[j];
				handler.apply(this, [_id])
			}
		}
		var eventHandler = this.listener["DoLink"];
		if (eventHandler && eventHandler.length > 0)
			for (var j = 0, l = eventHandler.length; j < l; j++) {
				var handler = eventHandler[j];
				handler.apply(this, arguments)
			}
		return false;
	},
	draw: function () {
		this.Super("draw", arguments);
	},
	insertDatas: function (data) {
		if (!data) { return; }
		var _self = this;
		var liDom = this._genLiDom(data);
		var _canvasName = this.getCanvasName();
		var _$ul = $("#" + _canvasName).find("ul:first");
		if (_$ul) {
			var len = _$ul[0].children.length;
			_$ul.append(liDom);
			if (!len) {
				if (this.AutoScroll + "" === "true") {
					var $ul_height = $("#" + _canvasName).height() - this.TitleHeight;
					var $li_height = _$ul.children().length * _$ul.find("li:first").height();
					if ($li_height < $ul_height) { return; }
					var _scrollInt = this.ScrollInterval + "";
					if (parseInt(_scrollInt, 10) !== NaN)
						_scrollInt = parseInt(_scrollInt, 10) * 1000;
					else
						_scrollInt = 2000; //默认2s切换

					_$ul.hover(function () {
						clearInterval(_self._interval)
					}, function () {
						if (_self._interval)
							clearInterval(_self._interval);
						_self._interval = setInterval(function () {
							var height = _$ul.find("li:first").height();
							_$ul.animate({
								"marginTop": -height + "px"
							}, 600, function () {
								_$ul.css({
									marginTop: 0
								}).find("li:first").appendTo(_$ul)
							})
						}, _scrollInt)
					}).trigger("mouseleave");
				}
			}
		}
	},
	updateDatas: function (datas) {
		// datas: [{id:xxx, changedData:{xxx:yyy,...}},...]
		if (!datas || datas.length === 0)
			return;

		for (var i = 0, len = datas.length; i < len; i++) {
			var tmpObj = datas[i];
			var _changedData = tmpObj.changedData;
			for (var fieldName in _changedData) {
				if (fieldName + "" === this.ColField1) {
					$("#" + this.ID + "_" + tmpObj.id + " > a").html(_changedData[fieldName])
				} else if (fieldName + "" === this.ColField2) {
					$("#" + this.ID + "_" + tmpObj.id + " > span").html(_changedData[fieldName])
				}
			}
		}
	},
	deleteDatas: function (datas) {
		// datas: ['xxx',...] xxx为ID字段值
		if (!datas || datas.length === 0)
			return;

		for (var i = 0, len = datas.length; i < len; i++)
			$("#" + this.ID + "_" + datas[i]).remove()
	},
	_setColWidth: function (_liDom, liWidth) {
		var li = $(_liDom);
		if (!this._aWidth) {
			var temEl = $("#newListmp");
			if (!temEl.size()) {
				$(document.body).append('<div id="newListmp"></div>');
				temEl = $("#newListmp");
				temEl.css({
					"position": "absolute",
					"z-index": "-999",
					"width": liWidth + "px",
					"opacity": 0
				})
			}
			$(_liDom).appendTo(temEl);
			var _aWidth = temEl.find("li").children("a").innerWidth();
			var _lipadleft = parseInt(temEl.find("li").css("padding-left"));
			var _lipadright = parseInt(temEl.find("li").css("padding-right"));
			var _spanWidth = temEl.find("li").children("span").innerWidth();
			//liWidth -_spanWidth -_lipadright - _lipadleft -5    左右间距 + 两列间间隙
			this._aWidth = liWidth - _spanWidth - _lipadright - _lipadleft - 30 + "px";
			temEl.find("li").children("a").css("width", this._aWidth);
			_liDom = temEl.find("li")[0].outerHTML;
			temEl.remove();
		} else {
			var _cloneliel = $(_liDom).clone()
			_cloneliel.children("a").css("width", this._aWidth);
			_liDom = _cloneliel[0].outerHTML;
		}
		return _liDom;
	},
	_genLiDom: function (datas) {
		var liDom = "";
		var liWidth = this.getWidth();
		var _col1FieldName = this.ColField1;
		var _col2FieldName = this.ColField2;
		var _col1Width = this.ColWidth1 + "" === "0" ? 0 : this.ColWidth1 - 16; //padding-left: 16px;
		var _col2Width = this.ColWidth2 + "" === "0" ? 0 : this.ColWidth2 - 8; //padding-right: 8px; 设置宽度无意义，因为 css

		var col1Width = "",
			col2Width = "",
			_col2float = "",
			removeFloat = "",
			liStyle = "",
			childStyle = "",
			childAStyle = "",
			childSpanStyle = "";
		if (this.Dock + "" !== "Fill") { // Dock 泊靠
			col1Width = "width: " + (_col1Width - 8) + "px;";
			col2Width = "width: " + _col2Width + "px;";
			//_col2float = "float: none;";  //第二列改为紧贴右边
		} else if (this.Dock + "" === "Fill") {
			removeFloat = " ";
			liStyle = " display: table; table-layout: fixed;width: 100%;";

			childStyle = "";
			childAStyle = "" //"padding: 0 0 0 16px;"
			childSpanStyle = "" //"padding-right: 8px;"
			col2Width = "" //"width: " + new Number(this.ColWidth2 / (this.Width - 16) * 100).toFixed(2) + "%;";
		}
		var liDoms = "";
		for (var i = 0, len = datas.length; i < len; i++) {
			var _tmpData = datas[i];
			var _col1Data = _tmpData[_col1FieldName] ? _tmpData[_col1FieldName] : "";
			var _col2Data = _tmpData[_col2FieldName] ? _tmpData[_col2FieldName] : "";
			//原型工具样式，里面图片路径跟普通版不一致
			var lastIden = "";
			if (window.IsVPlatformPrototypeIden && window.extraBasePathPrefix) {
				lastIden = "Prototype";
			}
			var _liDom = '<li id="' + this.ID + '_' + _tmpData.id + '" style="' + liStyle + '" class="clear_float ' + this.className + 'RecordLine' + lastIden + '" onclick="' + this.ID + '.doRecordClick(this);">'

			if (_col1Width > 0) {
				var _titleData = _col1Data ? _col1Data.replace(/<[^>]+>/g, "") : ""; //处理特殊场景下数据包含HTML标签

				_liDom += '<a class="' + this.className + 'RecordLineCol1" style="' + removeFloat + childStyle + childAStyle + ';' + this.genFontCssText(this.ColFont1, this.ColFontColor1) + '" href="javascript:void(0)" title="' + _titleData + '">' + _col1Data + '</a>'
			}
			if (_col2Width > 0)
				_liDom += '<span class="' + this.className + 'RecordLineCol2" style="overflow: hidden;' + _col2float + removeFloat + childStyle + childSpanStyle + ';' + this.genFontCssText(this.ColFont2, this.ColFontColor2) + '">' + _col2Data + '</span>'

			_liDom += '</li>';
			_liDom = this._setColWidth(_liDom, liWidth);
			liDoms += _liDom;
		}
		return liDoms;
		//清除浮动
	},

	setDatas: function (data) {
		if (!data)
			return;

		var _self = this;
		var liDom = this._genLiDom(data);
		var _canvasName = this.getCanvasName();
		var _$ul = $("#" + _canvasName).find("ul:first");
		if (_$ul)
			_$ul.html("").append(liDom);
		//新闻循环列表 塞入
		if (this.AutoScroll + "" === "true") {
			var $ul_height = $("#" + _canvasName).height() - this.TitleHeight;
			var $li_height = _$ul.children().length * _$ul.find("li:first").height();
			if ($li_height < $ul_height) { return; } //新闻少时不滚动
			var _scrollInt = this.ScrollInterval + "";
			if (parseInt(_scrollInt, 10) !== NaN)
				_scrollInt = parseInt(_scrollInt, 10) * 1000;
			else
				_scrollInt = 2000; //默认2s切换

			_$ul.hover(function () {
				clearInterval(_self._interval)
			}, function () {
				if (_self._interval)
					clearInterval(_self._interval);
				_self._interval = setInterval(function () {
					var height = _$ul.find("li:first").height();
					_$ul.animate({
						"marginTop": -height + "px"
					}, 600, function () {
						_$ul.css({
							marginTop: 0
						}).find("li:first").appendTo(_$ul)
					})
				}, _scrollInt)
			}).trigger("mouseleave");
		}
	},
	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		var _borderWidth = this.BorderWidth.replace("px", "") * 1;
		var _curWidth = this.width - _borderWidth * 2;
		var _$contents = $(this.contents);
		if (this.Dock + "" === "Top" || this.Dock + "" === "Bottom")
			this.contents = _$contents.css({
				//新版的width计算不正确，先使用百分比Task20200929113
				"width": percentWidth.indexOf("%") != -1 ? percentWidth : _curWidth + "px"
			})[0].outerHTML
		else if (this.Dock + "" === "Fill") {
			this.contents = _$contents.css({
				"width": "100%"
			})[0].outerHTML
		}
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		var _borderWidth = this.BorderWidth.replace("px", "") * 1;
		var _curHeight = this.height - _borderWidth * 2;
		var _curWidth = this.width - _borderWidth;
		if (this.Dock + "" === "Fill")
			_curWidth -= _borderWidth;
		var _$contents = $(this.contents);
		if (this.Dock + "" === "Left" || this.Dock + "" === "Right")
			this.contents = _$contents.css({
				"height": _curHeight + "px",
				"width": _curWidth + "px"
			})[0].outerHTML
		else if (this.Dock + "" === "Fill") {
			this.contents = _$contents.css({
				"height": "100%",
				"width": "100%"
			})[0].outerHTML
		}
	},
	bindDataSource: function (dataSource) { },
	destroy: function () {
		this.Super("destroy", arguments);
	},

	getSimpleChineseTitle: function () {
		return this.TitleText;
	},

	getValue: function () {
		var value = isc.WidgetDatasource.getSingleValue(this);
		if (undefined == value || null == value) {
			return "";
		}
		return value;
	},

	setValue: function (value) {
		isc.widgetDatasource.setSingleValue(this, value);
	},

	getVisible: function () {
		return this.isVisible();
	}

});
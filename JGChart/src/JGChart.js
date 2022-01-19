/**
 * 图表
 * @class JGChart
 * @extends JGBaseWidget
 * @mixes JGFormatHelper
 * 
 */
isc.ClassFactory.defineClass("JGChart", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGChart", "JGFormatHelper");
isc.JGChart.addClassProperties({
	_obj_Map: {}
});
isc.JGChart.addClassMethods({

	getJGChartObj: function (el_Id) {
		return isc.JGChart._obj_Map[el_Id];
	},
	setJGChartObj: function (el_Id, obj) {
		isc.JGChart._obj_Map[el_Id] = obj;
	}

});
isc.JGChart.addProperties({
	Width: null,
	Height: null,
	Left: null,
	Top: null,
	TabIndex: 0,
	//必须设置成hidden，否则放置在BorderLayout中，缩小浏览器窗口时，图表不会自适应大小 2018-07-05
	overflow: isc.Canvas.HIDDEN,
	//使能
	Enabled: false,

	//是否显示
	Visible: true,

	GraphSettings: null,
	//chartConfig:null,

	/**选中的信息*/
	_chartClickInfo: {
		series: null,
		xvalue: null,
		yvalue: null,
		zvalue: null
	},

	_chartData: null,
	_chartQuery: null,

	listener: [
		'chartClick'
	],

	canFocus: false,
	canSelectText: true,

	//antoDraw:true
	//backgroundColor: '#D9D9D9',
	//当前点击的条码数据
	clickBarData: {},
	LoadDataErrorText: "错误在加载数据.",
	XMLLoadingText: "检索数据，请稍候.",
	InvalidXMLText: "无效的数据.",
	ChartNoDataText: "没有数据显示.",
	ReadingDataText: "读取数据，请稍候.",
	ChartNotSupported: "图表类型不支持."
});

isc.JGChart.addMethods({

	/**
	 * 初始化控件
	 */
	_initWidget: function () {
		this.contents = "<div id='" + this.getFlashDivID() + "' style='width:100%;height:100%;'></div>";
		isc.JGChart.setJGChartObj(this.getFlashDivID(), this);
		//把js加载到缓存，在draw时在去缓存直接获取
		//		seajs.use(['itop/v3/controls/chart/fusionchart/Chart', 'itop/v3/controls/chart/V3_ChartTrans',
		//				'itop/v3/controls/chart/fusionchart/jsonUtil', 'itop/v3/controls/chart/fusionchart/js/fusionCharts'
		//			])
		//			//var self = this;
		//this._referFuncs(this,'chartClick');
		this._initEventAndDataBind();
	},

	_initEventAndDataBind: function () {
		var _this = this;
		//初始化数据时，加载图表
		this.loadData(this);
		//var datasourceName = widgetDatasource.getBindDatasourceName(widgetId);
		isc.DatasourceUtil.addDatasourceLoadEventHandler(this, function (rd) {
			_this.loadData(_this);
		});
		isc.DatasourceUtil.addDatasourceInsertEventHandler(this, function (rd) {
			_this.loadData(_this);
		});
		isc.DatasourceUtil.addDatasourceUpdateEventHandler(this, function (rd) {
			_this.loadData(_this);
		});
		isc.DatasourceUtil.addDatasourceDeleteEventHandler(this, function (rd) {
			_this.loadData(_this);
		});
	},

	_afterInitWidget: function () {
		this.on("chartClick", this.OnChartClick());
	},

	loadData: function (widgetId) {
		var isQuery = false;
		var datasource = isc.WidgetDatasource.getDatasource(this);
		var datas = datasource.getAllRecords();
		var dataMaps = datas.toArray();

		var chartdata = {};
		chartdata["recordCount"] = dataMaps.length;
		chartdata["values"] = dataMaps;
		this.drawchart(chartdata, isQuery);
	},

	//taoyz修改，不用getInnerHTML来创建DIV，用this.contents来创建，因为redraw时会重取innerHTML后图表dom结构都掉失了
	getInnerHTML_bak: function () {
		var template = [
			"<div ", //0
			"id='", //1
			, //2
			"' style='", //3
			, //4
			"'>", //5
			"</div>" //6
		];
		template[2] = this.getFlashDivID();
		template[4] = "width:100%;height:100%;";

		return template.join(isc.emptyString);

	},

	getFlashDivID: function () {
		return this.id + "_flashDiv";
	},
	getFlashDivObj: function () {
		return window[this.id + "_flashDiv"];
	},

	draw: function () {
		this.Super("draw", arguments);
		this.restoreChart(); //恢复渲染前加载的流程图
	},

	restoreChart: function () {
		if (this._loadedChartData) {
			this.drawchart(this._loadedChartData, this._loadedIsQuery);
			this._loadedChartData = null;
			this._loadedIsQuery = null
		}
	},

	loadRes: function (libs, callback) {
		var res = window._$chartLoadedResources;
		if (!res) {
			res = [];
			window._$chartLoadedResources = res;
		}
		var toLoad = [];
		if (res.length != 0) {
			for (var i = 0, l = libs.length; i < l; i++) {
				var lib = libs[i];
				if (res.indexOf(lib) == -1) {
					toLoad.push(lib);
				}
			}
		} else {
			toLoad = libs;
		}
		seajs.use(toLoad, function () {
			window._$chartLoadedResources = res.concat(toLoad);
			if (callback) {
				callback();
			}
		});
	},

	/**
	 * 外部使用的方法
	 * @param data 需要显示的数据
	 * @param isQuery 是否查询
	 */
	drawchart: function (data, isQuery) {
		if (!this.isDrawn()) {
			this._loadedChartData = data;
			this._loadedIsQuery = isQuery
			return;
		}
		var self = this; //el = self.el[0], opts = self.options;

		var formatData;
		formatData = $.extend(true, formatData, data);
		if (formatData &&
			formatData.values &&
			formatData.values.length &&
			self.formateValueToNum &&
			self.fields &&
			self.fields.length) {
			for (var i = 0; i < formatData.values.length; i++) {
				for (var j = 0; j < self.fields.length; j++) {
					formatData.values[i][self.fields[j].name] = self.formateValueToNum(
						formatData.values[i][self.fields[j].name],
						self.fields[j].pattern,
						self.fields[j].numType)
				}
			}
		}
		self._chartData = formatData || self._chartData;

		//配置前处理
		self._chartQuery = isQuery;
		if (!self.GraphSettings) {
			return;
		}

		//临时处理
		if (self.GraphSettings.chartType == undefined) {
			self.GraphSettings = eval("(" + self.GraphSettings + ")");
		}

		if (self.GraphSettings.is3D == "false") {
			this.loadRes([
					'itop/common/smartclient/extra/thirdpart/chart/V3_ChartPalette.js',
					'itop/common/smartclient/extra/thirdpart/chart/echarts/echarts.all.min.js',
					'itop/common/smartclient/extra/thirdpart/chart/V3_echarts.js'
				],
				function () {
					if (!window.ActiveXObject && !("ActiveXObject" in window)) {
						var style = self.getFlashDivObj().parentElement.style;
						//style.width = '100%';
						//style.height = '100%';
						style.overflow = 'visible';
					}
					createChart(self.getFlashDivID(), self.GraphSettings, self._chartData);

					if (!window.echartClick) {
						window.echartClick = function (el_id, params) {
							//用于事件绑定
							var el = document.getElementById(el_id);
							var v3chart = $.data(el, 'v3chart');
							v3chart.fireEvent('chartClick');
						}
					}

					window.echartClick = function (el_id, params) {
						//2D图表的点击
						//处理点击条码行的数据
						var chartObj = isc.JGChart.getJGChartObj(el_id);
						if (chartObj) {
							//图例值
							chartObj.clickBarData.seriesName = params.seriesName;
							//纵坐标值
							chartObj.clickBarData.value = params.value;
							//横坐标值
							chartObj.clickBarData.name = params.name;
							//横坐标值
							chartObj.clickBarData.data = params.data;
							//条码颜色值
							chartObj.clickBarData.color = params.color;
							chartObj.OnChartClick(chartObj);
						}
					}
					//处理分组隐藏下，当前图表控件未显示，此时渲染会出现异常Task20200510028
					self.resized();
				})
		} else {

			//图标XY轴字体设置
			if (!self.GraphSettings.outCanvas)
				self.GraphSettings.outCanvas = {
					alpha: "100",
					bgColor: null,
					font: "黑体",
					fontColor: "#000000",
					fontSize: "12"
				};
			//图标里面字体设置
			if (!self.GraphSettings.inCanvas)
				self.GraphSettings.inCanvas = {
					alpha: "100",
					bgColor: null,
					font: "黑体",
					fontColor: "#000000",
					fontSize: "12"
				};

			self._dataConvert(self, self.GraphSettings);

			this.loadRes(['itop/v3/controls/chart/fusionchart/js2/FusionCharts',
					'itop/v3/controls/chart/fusionchart/Chart',
					'itop/v3/controls/chart/V3_ChartTrans',
					'itop/v3/controls/chart/fusionchart/jsonUtil',
					'itop/v3/controls/chart/fusionchart/js/fusionCharts'
				],
				function (FusionChart, V3ChartTrans) {
					//当此容器div还没有渲染完，就开始画图表的话，Fusionchart里会出错，这里捕获一下，不往外提示错误
					try {
						var chartType = self.GraphSettings.chartType.toLowerCase();
						switch (chartType) {
							// 线
							case "line": //x
								self._chart = new FusionChart.Line();
								break;
								// 圆
							case "pie": //x
								self._chart = new FusionChart.Pie();
								break;
								// 横柱
							case "bar":
							case "stackbar": //x
								self._chart = new FusionChart.Bar();
								break;
								// 柱
							case "column":
							case "stackcolumn": //x
								self._chart = new FusionChart.Column();
								break;
								// 面职
							case "area":
							case "stackarea": //x
								self._chart = new FusionChart.Area();
								break;
								// 双Y
							case "combidy":
							case "stackcolumnlinedy":
							case "columnlinedy": //x
								self._chart = new FusionChart.CombiDY();
								break;
								// 组合
							case "combination": //x
								self._chart = new FusionChart.Combination();
								break;
								//多柱
							case "stack": //x
								self._chart = new FusionChart.Stack();
								break;
								// 圆环
							case "dough": //x
								self._chart = new FusionChart.Dough();
								break;
								// 雷达
							case "radar":
								self._chart = new FusionChart.Radar();
								break;
								// 散点
							case "scatter": //x
								self._chart = new FusionChart.Scatter();
								break;
								// 仪表盘
							case "angular": //x
								self._chart = new FusionChart.Angular();
								break;
								// 气泡
							case "bubble": //x
								self._chart = new FusionChart.Bubble();
								break;
						}
						self._chart.setConfig(self.GraphSettings);
						self._chart.setContainer(self.getFlashDivObj());

						var trans = new V3ChartTrans.ChartTrans(self.GraphSettings, self._chartData);
						self._chart.draw(trans);
					} catch (e) {
						//画图不成功
						//self._chart = null;
					}

					if (self._chart && self._chart._container && self._chart._container.firstChild) {
						self._chart._container.firstChild.style.visibility = 'inherit';
						if (self.Dock != "None") {
							//设置了泊靠，放到了border布局中去了
							self._chart._container.firstChild.style.width = '100%';
							self._chart._container.firstChild.style.height = '100%';
						}
					} //渲染出来后把控件设置为根据父窗体的显示而显示

					window.fusionchartClick = function (el_id, series, category, value) {
						//3D图表的点击
						var chartObj = isc.JGChart.getJGChartObj(el_id);
						if (chartObj) {
							chartObj.setChartInfo({
								'series': series,
								'xvalue': category,
								'yvalue': value,
								'zvalue': null
							});
							chartObj.OnChartClick(chartObj);
						}

					}

				});
		}

	},
	resized: function () {
		if (document.getElementById(this.getFlashDivID())) {
			var flashObj = this.getFlashDivObj();
			var style = flashObj.parentElement.style;
			style.width = this.getWidth();
			style.height = this.getHeight();
			if (window.echarts) {
				var charts = echarts.getInstanceByDom(this.getFlashDivObj());
				if (charts) charts.resize({
					width: this.getWidth(),
					height: this.getHeight()
				});
			}
		}
	},
	/*方法重写，防止加载时候销毁图表*/
	redraw: function () {

	},
	/*
	 * 内置方法，数据转换
	 */
	_dataConvert: function (opts, graphSettings) {
		//统一大小写(设计平台那边有时会不统一)
		if (graphSettings["DataInfo"]) {
			graphSettings.dataInfo = graphSettings["DataInfo"];
			delete graphSettings["DataInfo"];
		}
		if (graphSettings.dataInfo) { //opts.chartQuery && 已统一不需要表名前缀 2012年11月14日
			graphSettings.dataInfo.name = ""; //删除前缀
		}

		//取控件的高宽
		graphSettings.size = {
			width: opts.width,
			height: opts.height
		};

		return graphSettings;
	},

	/**
	 * flash触发事件之后，通过这个接口把相关的信息传递过来
	 */
	setChartInfo: function (chartClickInfo) {
		this._chartClickInfo = $.extend({}, chartClickInfo);
	},

	getChartInfo: function () {
		var rs = this._chartClickInfo ? this._chartClickInfo : null;
		if (rs) {
			//操作兼容(建议使用小写,统一风格)
			rs.Series = rs.series;
			rs.Xvalue = rs.xvalue;
			rs.Yvalue = rs.yvalue;
			rs.Zvalue = rs.zvalue;
		}
		return rs;
	},

	/**
	 * 获取x轴的值
	 */
	getXvalue: function () {
		return this._chartClickInfo ? this._chartClickInfo.xvalue : null;
	},

	/**
	 * 获取Y轴的值
	 * @return {*}
	 */
	getYvalue: function () {
		return this._chartClickInfo ? this._chartClickInfo.yvalue : null;
	},

	/**
	 * 获取Z轴的值
	 * @return {*}
	 */
	getZvalue: function () {
		return this._chartClickInfo ? this._chartClickInfo.zvalue : null;
	},

	/**
	 * @param {Object} dataSource
	 */
	bindDataSource: function (dataSource) {

	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this._chart.setWidth(percentWidth);
		//this._chart.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this._chart.setHeight(percentHeight);
		//this._chart.setHeight("100%");
	},
	/**
	 * 获取主标题
	 * @return 主标题
	 */
	getTitle: function () {
		return this.GraphSettings.title.title;
	},
	/**
	 * 设置主标题
	 * @param title
	 * 
	 */
	setTitle: function (title) {

		this.GraphSettings.title.title = title;
		if (typeof (echarts) == 'undefined') return;

		//var myChart = document.getElementById(this.getFlashDivObj());
		var myChart = this.getFlashDivObj();
		if (myChart == null) return;

		myChart = echarts.getInstanceByDom(myChart);
		if (typeof (myChart) == 'undefined') return;

		var option = myChart.getOption();
		option.title[0].text = title; // 主标题				
		myChart.setOption(option);
	},
	/**
	 * 获取副标题
	 * @return 副标题
	 */
	getSubTitle: function () {
		return this.GraphSettings.subtitle.title;
	},
	/**
	 * 设置副标题	 
	 * @param title
	 */
	setSubTitle: function (title) {
		this.GraphSettings.subtitle.title = title;

		if (typeof (echarts) == 'undefined') return;

		//var myChart = document.getElementById(this.getFlashDivObj());
		var myChart = this.getFlashDivObj();
		if (myChart == null) return;

		myChart = echarts.getInstanceByDom(myChart);
		if (typeof (myChart) == 'undefined') return;

		var option = myChart.getOption();
		option.title[0].subtext = title; // 副标题
		myChart.setOption(option);
	}
});
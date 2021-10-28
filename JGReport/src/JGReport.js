isc.ClassFactory.defineClass("JGReport", "JGBaseWidget");
isc.ClassFactory.defineClass("V3ActiveXControl", "ActiveXControl");
isc.ClassFactory.mixInInterface("JGReport", "IWindowAop");

var SHOWTYPE_INPUT = "SHOWTYPE_INPUT";
var SHOWTYPE_FORMULA = "SHOWTYPE_FORMULA";
var SHOWTYPE_VIEW = "SHOWTYPE_VIEW";
var FORM_TYPE = "Form";

var REPORT_TYPE = "Report";

var ID_FIELD_CODE = "id";	
		

var spreadNS = GC.Spread.Sheets;
isc.V3ActiveXControl.addProperties({
	getInnerHTML: function () {
		var accum = isc.StringBuffer.newInstance();

		var classID = this.classID ? this.classID : "clsid:" + this.uuid;
		accum.append("<object name='" + this.widgetId + "' classid='", classID, "' codebase='", this.codeBase,
			"' id='" + this.getPluginID(), "' width='100%' height='" + this.height + "'");
		if (this.extraHTML) {
			accum.append(" ", this.extraHTML);
		}
		accum.append(">");
		accum.append("<param name='iscCanvasID' value='", this.getID(), "'>");
		if (this.params) {
			for (var key in this.params) {
				accum.append("<param name='", key, "' value='", this.params[key], "'>");
			}
		}
		accum.append("</object>");
		width = this.width;
		height = this.height;
		return accum.toString();
	}
});


isc.JGReport.addProperties({
	Width: null,
	Height: null,
	Left: null,
	Top: null,

	//使能
	Enabled: true,

	//显示工具条
	IsShowToolbar: true,
	reportType: null,

	/**数据源*/
	_toolBarMembers: null,

	_version: "3.9.5.0",
	_contextPath: "itop/thirdpart/chinaexcel",

	_v3Report: null,
	_activeX: null,

	/**是否已安装控件标志,为空表示安装成功，否则为错误信息*/
	_activeErrMessage: null,

	/** 配置 */
	_config: null,
	_configXml: null,
	/**是否已加载数据*/
	_isload: false,
	/** 超级报表的数据源xml格式 */
	_dataSet: null,
	/** 容器{String} */
	_containerId: null,

	autoDraw: false,

	ReportCode: null,

	className: "JGReportNormal"

});

isc.JGReport.addMethods({
		
	//自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
	_initWidget: function (type) {
		this.Height -= 3; //高度需要包含边框，内容实际高度需减去边框
		//ToolBar布局
		this.toolBar = isc.ToolStrip.create({
			width: "100%",
			ID: "toolbar_" + this.ID
		});

		if (this.IsShowToolbar) {
			this._setToolStripItems(type);

			this.fetch1 = isc.HLayout.create({
				align: "center",
				height: "25",
				width: "100%",
				members: [this.toolBar]
			});
			this.fetch2 = isc.VLayout.create({
				border: "1px solid gray",
				width: "100%",
				height: "100%",

				//visibility: this.Visible ? "visible":"hidden",
				enabled: this.Enabled,
				members: [this.fetch1]
			});
		} else {
			this.fetch2 = isc.VLayout.create({
				border: "1px solid gray",
				width: "100%",
				height: "100%",

				//visibility: this.Visible ? "visible":"hidden",
				enabled: this.Enabled,
				members: []
			});
		}



		// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		//this.addChild(this._v3Report);
		this.addChild(this.fetch2);

		this._initActiveX();

		this.fetch2.addMember(this._v3Report);
	},
	getDivHeight: function () {
		return this.getInnerHeight() - (this.IsShowToolbar ? 35 : 0);
	},

	getDivWidth: function () {
		return this.getInnerWidth() - 5;
	},

	IsShowToolbar: function () {
		return this.IsShowToolbar;
	},

	pluginID: function () {
		if (this._v3Report == null)
			return null;

		return this._v3Report.id;
	},

	_initActiveX: function () {
		this._v3Report = isc.V3ActiveXControl.create({
			widgetId: this.widgetId,
			classID: "CLSID:15261F9B-22CC-4692-9089-0C40ACBDFDD8",
			id: "v3Report_" + this.ID,
			width: this.Width - 2,
			height: (this.IsShowToolbar ? this.Height - 32 : this.Height - 2),
			autoDraw: false,
			style: "background: #FFFFFF; ",
			usePlaceholderDragMask: false,
			codeBase: this._contextPath + "/chinaexcelweb3.9.4.cab#version=3,9,4,0",
			canSelectText: true,
			//draw:this._referFunc(this,'_draw')
		});
	},

	resized: function () {
		var activeXObj = this._v3Report && this._v3Report.getPluginHandle();
		if (activeXObj) {
			activeXObj.style.height = this.getInnerHeight() - (this.IsShowToolbar ? 35 : 0) + "px";
			this._v3Report.setHeight(this.getInnerHeight() - (this.IsShowToolbar ? 35 : 0));
			var pluginID = this.pluginID();
			if (pluginID) {
				var obj = $("#" + pluginID);
				if (obj) {
					var spread = obj.data("workbook");
					if (spread) {
						//如果是spread，修改spread.height、spread.width，并刷新。
						obj.height(this.getInnerHeight() - (this.IsShowToolbar ? 35 : 0));
						obj.width(this.getInnerWidth() - 5);
						spread.refresh();
					}
				}
			}
		}
		this.Super("resized", arguments);
	},


	//根据类型、打印设置，创建打印工具栏（ “超级报表”、“c-lodop”）
	//type：打印方式
	//print：打印设置
	draw: function (type, print) {
		this.reportType = type;
		if (typeof type != "undefined") {
			if (type != "TooneReport") {
				//使用超级报表
				this.Super("draw", arguments);
				if (this.IsShowToolbar) {
					this._setToolStripItems("ChinaExcelLib", print);
				}
				if (this._v3Report != null) {
					//注册ActiveX
					this._registerReport();

					//_activeX
					var tempActiveX = this._v3Report.getPluginHandle();
					if (tempActiveX) {
						var version = tempActiveX.GetCurrentVersion && tempActiveX.GetCurrentVersion();
						this.resized();
						if (typeof version == "undefined") {
							this._activeErrMessage = "code1";
							this._showDownload(this._activeErrMessage);

							this._v3Report.destroy(); //report销毁
							return;
						} else if (version < this._version) {
							this._activeErrMessage = "code2";
							this._showDownload(this._activeErrMessage);

							this._v3Report.destroy(); //report销毁
							return;
						}
					}
				}
			} else if (type == "TooneReport") {
				//使用 c-lodop
				this.Super("draw", arguments);
				if (this.IsShowToolbar) {
					this._setToolStripItems("TooneReport", print);
				}
			}
		}
	},

	getV3draw:function(data, reportConfig){
		this.drawReport(data, reportConfig);
	},

	//使用超级报表打印
	//reportData：报表数据
	//reportCfg：报表模板
	drawReport: function (reportData, reportCfg) {
		if (this._v3Report == null || this._v3Report.destroyed) {
			return;
		}
		this.draw("");
		var result = this.Super("drawReport", arguments);

		var tempActiveX = this._v3Report.getPluginHandle();
		if (tempActiveX) {
			if (reportData != undefined) {
				this.setDataSet(reportCfg, reportData);
			}

			if (reportCfg.template != undefined) {
				var xab = reportCfg.template.replace(/\＆/g, '&');
				this.setConfigXml(xab);
			} else {
				this.setConfig(reportCfg.templateFile);
			}

			var xml = this.getDataSet();
			if (typeof xml == "object") { //if dataset is object,so i g is mutil ds
				for (var p in xml) {
					var fp = p.replace(/\_/g, "");
					tempActiveX.SetStatDataFromString(fp, xml[p])
				}
			} else {
				tempActiveX.ReadStatDataFromString(xml);
			}
			//如果模板没有刷新，则数据变化也不显示的
			this._isload = tempActiveX.Calculate();
		}

		//tempActiveX.show();
		return result;
	},

	getDataSet: function () {
		return this._dataSet;
	},

	setDataSet: function (reportCfg, reportData) {
		if (typeof reportData == "object") {
			//如果是主从报表，需要走专门的主从表格式转换方法
			//alert(reportCfg.reportType);
			if (reportCfg.reportType.toUpperCase() == 'MASTERSLAVE') {
				this._dataSet = this.convertJsonXml4MasterSub(reportCfg, reportData);
			} else {
				this._dataSet = this.convertJsonXml(reportCfg, reportData);
			}
		} else {
			this._dataSet = reportData; //字符类型
		}
	},

	setConfig: function (cfg) {
		var tempActiveX = this._v3Report.getPluginHandle();
		if (tempActiveX == null) {
			return;
		}

		var fullPath = window.document.location.href;
		if (fullPath.substring(0, 8) === "file:///") {
			var idx = fullPath.lastIndexOf('/') + 1;
			var rpt = fullPath.substring(8, idx).replace(/\//g, "\\");
			tempActiveX.openFile(rpt + cfg); //这是以本地方式加载文件,测试时用
		} else {
			tempActiveX.ReadHttpFile(cfg);
		}
		this._config = cfg;
		this._isload = false;
	},

	setConfigXml: function (cfg) {
		var tempActiveX = this._v3Report.getPluginHandle();
		if (tempActiveX == null) {
			return;
		}

		tempActiveX.ReadDataFromString(cfg); //如果模板没有刷新，则数据变化也不显示的
		this._configXml = cfg;
		this._isload = false;
	},

	convertJsonXml4MasterSub: function (reportCfg, reportData) {
		var tempActiveX = this._v3Report.getPluginHandle();
		if (tempActiveX == null) {
			return;
		}

		//1.表示是文本数据格式,2是XML数据格式
		//暂时全部转换成获取XML数据格式
		var dataType = tempActiveX.GetStatScriptItem("stat:data:dataflag", 1); //后面的"1"表示是"统计脚本x"
		if (dataType != 2) {
			tempActiveX.SetStatScriptItem("stat:data:dataflag", 2, 1); //改为XML型
		}
		var reportDS = reportCfg.dataSource.split(";");

		//默认第一个数据源等于主表，这个需要约定考虑
		//可以开放设置主表数据源的标记，需要开发系统支持
		var xml = "<data> <master> ";
		var masterTable = reportDS[0];
		var masterRows = reportData.values[masterTable];
		var item = masterRows[0]; //只取第一行
		for (var p in item) {
			var fd = p.replace(masterTable + '.', '');
			xml += "<" + fd + ">" + this._replaceVal(item[p]) + "</" + fd + ">";
		}

		var childTable = reportDS[1],
			items = reportData.values[childTable];
		var detailLen = items.length;
		xml += "</master><detail> <count>" + detailLen + "</count>";
		for (var i = 0; i < detailLen;) {
			var item = items[i++];
			xml += "<row" + i + ">";
			for (var p in item) {
				var fd = p.replace(childTable + '.', ''); //去掉数据源标识
				xml += "<" + fd + ">" + this._replaceVal(item[p]) + "</" + fd + ">";
			}
			xml += "</row" + i + ">";
		}
		xml += "</detail></data>";
		return xml;
	},

	convertJsonXml: function (reportCfg, reportData) {
		var tempActiveX = this._v3Report.getPluginHandle();
		if (tempActiveX == null) {
			return;
		}

		//1.表示是文本数据格式,2是XML数据格式
		//暂时全部转换成获取XML数据格式
		var dataType = tempActiveX.GetStatScriptItem("stat:data:dataflag", 1); //后面的"1"表示是"统计脚本x"
		if (dataType != 2) {
			tempActiveX.SetStatScriptItem("stat:data:dataflag", 2, 1); //改为XML型
		}

		//报表数据源，支持多数据源
		var reportDS = reportCfg.dataSource.split(";");
		var rst = {};
		for (var ds = 0, le = reportDS.length; ds < le; ds++) {
			var dataSource = reportDS[ds];
			var items = reportData.values[dataSource];
			var itemLen = items.length;
			//xml的下标由1开始
			var xml = "<data><count>" + itemLen + "</count>";
			var fd = null;
			var item = null;
			for (var i = 0; i < itemLen;) {
				item = items[i++];
				xml += "<row" + i + ">";
				for (var p in item) {
					fd = p.replace(dataSource + '.', ''); //去掉数据源标识
					xml += "<" + fd + ">" + this._replaceVal(item[p]) + "</" + fd + ">";
				}
				xml += "</row" + i + ">";
			}
			xml += "</data>";
			rst[dataSource] = xml;
		}
		return rst;
	},

	_replaceVal: function (_val) {
		if (_val == null || _val == undefined) {
			_val = "";
		} else if (typeof (_val) == "string") {
			if (_val.indexOf('<') > -1) {
				_val = _val.replaceAll('<', "＜");
			}
			if (_val.indexOf('>') > -1) {
				_val = _val.replaceAll('>', '＞');
			}
			if (_val.indexOf('&') > -1) {
				_val = _val.replaceAll('&', '＆');
			}
		}
		return _val;
	},

	//*  ActiveX Register *//
	_registerReport: function () {
		try {
			var tempActiveX = this._v3Report.getPluginHandle();

			tempActiveX.SetPath(this.getContextPath() + this._contextPath);
			tempActiveX.Login("项目管理", "5675abcde6cbafae59e4335a8355ac23", "广东同望科技股份有限公司");

			var _version = tempActiveX.GetCurrentVersion();
			//alert(_version);
			var ver2 = _version.replace(".", "").replace(".", "").replace(".", "").substring(0, 3);

			if (ver2 < '394') {
				this._activeErrMessage = "code2"
			}
		} catch (e) {
			//code1:没有安装报表控件！
			this._activeErrMessage = "code1";
		}
	},

	getContextPath: function () {
		//找上下文路径
		var contextPath = document.location.pathname;
		var index = contextPath.substr(1).indexOf("/");

		if (contextPath != "") {
			contextPath = contextPath.substr(0, index + 1) + "/";
		} else {
			contextPath = contextPath.substr(0, index + 1);
		}
		return contextPath;
	},

	//* Set ToolStrip Members  *//
	_setToolStripItems: function (type, print) {
		var pluginID = this.pluginID();
		this.toolBar.members = new Array();
		$(".toolStrip[eventproxy=toolbar_" + this.ID + "] [eventproxy=toolbar_" + this.ID + "]").html("&nbsp;");
		var _self = this;
		if (type == "TooneReport") {
			if (print != null && print != "") {
				var btnPrint = isc.Button.create({
					width: "60",
					title: "打印",
					icon: this._contextPath + "/img/print.gif",
					align: "center",
					border: "1px solid gray",
					widgetId: pluginID,
					print: print,
					click: function () {
						var widgetId = pluginID;
						var printt = this.print;
						var workbook = $("#" + widgetId).data("workbook");
						var sheet = workbook.getActiveSheet();
						var printInfo = sheet.printInfo();
						var print = JSON.parse(printt);
						var printset = {};
						if (print) {
							if (print["tMargin"] && print["tMargin"] != "null") {
								printset["top"] = Number(print["tMargin"]);
							}
							if (print["bMargin"] && print["bMargin"] != "null") {
								printset["bottom"] = Number(print["bMargin"]);
							}
							if (print["lMargin"] && print["lMargin"] != "null") {
								printset["left"] = Number(print["lMargin"]);
							}
							if (print["rMargin"] && print["rMargin"] != "null") {
								printset["right"] = Number(print["rMargin"]);
							}
							if (print["headerMargin"] && print["headerMargin"] != "null") {
								printset["header"] = Number(print["headerMargin"]);
							}
							if (print["ftMargin"] && print["ftMargin"] != "null") {
								printset["footer"] = Number(print["ftMargin"]);
							}
						}
						if (print["zoomScale"] && print["zoomScale"] != "null") {
							printInfo.zoomFactor(Number(print["zoomScale"]));
						}
						if (print["orient"] == "2") {
							printInfo.orientation(GC.Spread.Sheets.Print.PrintPageOrientation.landscape); //横向
						} else {
							printInfo.orientation(GC.Spread.Sheets.Print.PrintPageOrientation.portrait); //纵向
						}
						if (print["printGrid"] == "1") {
							printInfo.showGridLine(true);
						} else {
							printInfo.showGridLine(false);
						}
						printInfo.showBorder(false);

						printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide);
						printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide);

						var paperSizeMap = {
							"null": GC.Spread.Sheets.Print.PaperKind.a4,
							"8": GC.Spread.Sheets.Print.PaperKind.a3,
							"11": GC.Spread.Sheets.Print.PaperKind.a5,
							"66": GC.Spread.Sheets.Print.PaperKind.a2,
							"70": GC.Spread.Sheets.Print.PaperKind.a6
						};
						if (print["paperSize"]) {
							var paperKind;
							if (print["paperSize"] != null) {
								paperKind = paperSizeMap[print["paperSize"]];
							} else {
								paperKind = print["paperSize"];
							}

							printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(paperKind));
						}
						if (print["repeatRowStart"] != "null") {
							printInfo.repeatRowStart(Number(print["repeatRowStart"]) - 1);
						}
						if (print["repeatRowEnd"] != "null") {
							printInfo.repeatRowEnd(Number(print["repeatRowEnd"]) - 1);
						}
						if (print["cFtTitle"] != "null" && print["cFtTitle"] != "") {
							printInfo.footerCenter(print["cFtTitle"]);
						}
						if (print["cHeaderTitle"] != "null" && print["cHeaderTitle"] != "") {
							printInfo.headerCenter(print["cHeaderTitle"]);
						}
						if (print["lFtTitle"] != "null" && print["lFtTitle"] != "") {
							printInfo.footerLeft(print["lFtTitle"]);
						}
						if (print["lHeaderTitle"] != "null" && print["lHeaderTitle"] != "") {
							printInfo.headerLeft(print["lHeaderTitle"]);
						}
						if (print["rFtTitle"] != "null" && print["rFtTitle"] != "") {
							printInfo.footerRight(print["rFtTitle"]);
						}
						if (print["rHeaderTitle"] != "null" && print["rHeaderTitle"] != "") {
							printInfo.headerRight(print["rHeaderTitle"]);
						}

						//				            	headerLeft: 表头区域左部分的文本及样式。
						//				            	headerCenter: 表头区域中间部分的文本及样式。
						//				            	headerRight: 表头区域右部分的文本及样式。
						//				            	footerLeft: 表脚区域左部分的文本及样式。
						//				            	footerCenter: 表脚区域中间部分的文本及样式。
						//				            	footerRight: 表脚区域右部分的文本及样式。


						var pageRows = Number(print["pageRows"])
						if (pageRows != 0) {
							var rowCount = sheet.getRowCount();
							for (var r = 1; r <= rowCount; r++) {
								if (r % pageRows == 0) {
									//					            			sheet.setRowPageBreak(r, true);//强制分页和  重复行打印   重复行没有生效
								}
							}
						}

						printInfo.margin(printset); //边框和页眉页脚 页眉  页脚不生效	
						workbook.print();
					}
				});
				this.toolBar.addMember(btnPrint);
			}

			var btnExcel = isc.Button.create({
				width: "60",
				title: "导出",
				icon: this._contextPath + "/img/excel.gif",
				align: "center",
				border: "1px solid gray",
				widgetId: pluginID,
				click: function () {
					var widgetId = pluginID;
					var fileName = "导出报表.xlsx";
					var workbook = $("#" + widgetId).data("workbook");
					var json = workbook.toJSON({ includeBindingSource: true });
					var excelIO = new GC.Spread.Excel.IO();
					excelIO.save(json, function (blob) {
						saveAs(blob, fileName);
					}, function (e) {
						console.log(e);
					});
				}
			});
			this.toolBar.addMember(btnExcel);
		} else if (type == "ChinaExcelLib") {
			var btnPrintSet = isc.Button.create({
				width: "80",
				title: "打印设置",
				icon: this._contextPath + "/img/printpapaerset.gif",
				align: "center",
				border: "1px solid gray",
				click: function () {
					//_self._activeX.OnPrintSetup();
					_self._v3Report.getPluginHandle().OnPrintSetup();
				}

			});
			this.toolBar.addMember(btnPrintSet);

			var btnPreview = isc.Button.create({
				width: "60",
				title: "预览",
				icon: this._contextPath + "/img/printpreview.gif",
				align: "center",
				border: "1px solid gray",
				click: function () {
					//liuzj 2014/2/13 超级报表3.9.x存在Bug，导致设置列头的报表预览出现多余的列信息，
					//解决办法，获取报表的列头--取消列头设置--预览（打印、导出）--重新设置列头
					var _colNum = _self._v3Report.getPluginHandle().GetColLabel();
					_self._v3Report.getPluginHandle().SetColLabel(0);
					_self._v3Report.getPluginHandle().OnFilePrintPreview();
					_self._v3Report.getPluginHandle().SetColLabel(_colNum);
				}

			});
			this.toolBar.addMember(btnPreview);

			var btnPrint = isc.Button.create({
				width: "60",
				title: "打印",
				icon: this._contextPath + "/img/print.gif",
				align: "center",
				border: "1px solid gray",
				click: function () {
					//liuzj 2014/2/13 超级报表3.9.x存在Bug，导致设置列头的报表预览出现多余的列信息，
					//解决办法，获取报表的列头--取消列头设置--预览（打印、导出）--重新设置列头
					var _colNum = _self._v3Report.getPluginHandle().GetColLabel();
					_self._v3Report.getPluginHandle().SetColLabel(0);
					_self._v3Report.getPluginHandle().OnFilePrint();
					_self._v3Report.getPluginHandle().SetColLabel(_colNum);
				}

			});
			this.toolBar.addMember(btnPrint);

			var btnExcel = isc.Button.create({
				width: "60",
				title: "导出",
				icon: this._contextPath + "/img/excel.gif",
				align: "center",
				border: "1px solid gray",
				click: function () {
					//_self._activeX.OnPrintSetup();
					_self._v3Report.getPluginHandle().OnFileExport();
				}
			});
			this.toolBar.addMember(btnExcel);
		}
	},

	setV3ToolStripItemsForTooneReport : function (reportEvents, reportType, toolBarItems, showType, listLineContainMultiRow) {
		if ("WindowReport" == reportType) {
			this.setToolStripItemsForConfig(toolBarItems, showType, listLineContainMultiRow);
		} else {
			this.setToolStripItemsForHistory(reportEvents, showType, listLineContainMultiRow);
		}
	},

	//设置打印方式为TooneReport的工具栏
	setToolStripItemsForTooneReport: function (excelArgs, quickPrintArgs, generatePrintArgs, previewPrintArgs, saveArgs) {
		var pluginID = this.pluginID();
		this.toolBar.members = new Array();
		$(".toolStrip[eventproxy=toolbar_" + this.ID + "] [eventproxy=toolbar_" + this.ID + "]").html("&nbsp;");
		var _self = this;

		if (excelArgs != null) {
			var excelDisplayText = excelArgs["displayText"];
			var listLineContainMultiRow = excelArgs["listLineContainMultiRow"];
			var btnExcel = isc.Button.create({
				width: "95",
				title: excelDisplayText,
				icon: this._contextPath + "/img/excel.png",
				align: "center",
				border: "1px solid white;border-width: 0px 5px 0px 5px;color:#ffffff;background:#356bbc",
				widgetId: pluginID,
				click: function () {
					var widgetId = pluginID;
					var fileName = excelDisplayText + ".xlsx";
					var spread = $("#" + widgetId).data("workbook");

					var json = spread.toJSON({ includeBindingSource: true });
					if (listLineContainMultiRow != null && listLineContainMultiRow) {
						for (var pro in json.sheets) {
							if (json.sheets.hasOwnProperty(pro)) {
								var sheet = json.sheets[pro];
								if (sheet && sheet.tables) {
									delete sheet.tables;
								}
							}
						}
					}
					var excelIO = new GC.Spread.Excel.IO();
					excelIO.save(json, function (blob) {
						saveAs(blob, fileName);
					}, function (e) {
						console.log(e);
					});
				}
			});
			this.toolBar.addMember(btnExcel);
		}

		if (quickPrintArgs != null) {
			var displayText = quickPrintArgs["displayText"];
			var clickEvent = quickPrintArgs["clickEvent"];
			var btnQuickPrint = isc.Button.create({
				width: "95",
				title: displayText,
				icon: this._contextPath + "/img/quickPrint.png",
				align: "center",
				border: "1px solid white;border-width: 0px 5px 0px 5px;color:#ffffff;background:#356bbc",
				widgetId: pluginID,
				click: clickEvent,
			})
			this.toolBar.addMember(btnQuickPrint);
		}

		if (generatePrintArgs != null) {
			var displayText = generatePrintArgs["displayText"];
			var clickEvent = generatePrintArgs["clickEvent"];
			var btnGeneralPrint = isc.Button.create({
				width: "95",
				title: displayText,
				icon: this._contextPath + "/img/generatePrint.png",
				align: "center",
				border: "1px solid white;border-width: 0px 5px 0px 5px;color:#ffffff;background:#356bbc",
				widgetId: pluginID,
				click: clickEvent,
			})
			this.toolBar.addMember(btnGeneralPrint);
		}

		if (previewPrintArgs != null) {
			var displayText = previewPrintArgs["displayText"];
			var clickEvent = previewPrintArgs["clickEvent"];
			var btnPreviewPrint = isc.Button.create({
				width: "95",
				title: displayText,
				icon: this._contextPath + "/img/previewPrint.png",
				align: "center",
				border: "1px solid white;border-width: 0px 5px 0px 5px;color:#ffffff;background:#356bbc",
				widgetId: pluginID,
				click: clickEvent,
			})
			this.toolBar.addMember(btnPreviewPrint);
		}

		if (saveArgs != null) {
			var displayText = saveArgs["displayText"];
			var clickEvent = saveArgs["clickEvent"];
			var btnSave = isc.Button.create({
				width: "95",
				title: displayText,
				icon: this._contextPath + "/img/save.png",
				align: "center",
				border: "1px solid white;border-width: 0px 5px 0px 5px;color:#ffffff;background:#356bbc",
				widgetId: pluginID,
				click: clickEvent,
			})
			this.toolBar.addMember(btnSave);
		}
	},

	//* Show ActiveX Download *//
	_showDownload: function (msg) {
		var result = null;
		if (msg == "code1") {
			result = "<a href='" + this._contextPath + "/chinaexcelwebocx.exe' target='_blank'><!--install3.9.2.exe-->手动超报表插件(安装前请关闭浏览器)</a><br>或者设置本服务受信站点后，浏览器会自动安装";
		} else if (msg == "code2") {
			result = "报表版本号过低：<a href='" + this._contextPath + "/chinaexcelwebocx.exe' target='_blank'><!--install3.9.2.exe-->手动超报表插件(安装前请关闭浏览器)</a><br>或者设置本服务受信站点后，浏览器会自动安装";
		}
		isc.say(result);
	},

	/**
	 * 获取使能状态
	 * @return 使能状态
	 */
	isEnabled: function () {
		return this.Enabled;
	},

	/**
	 * 设置使能状态
	 * @param enable 使能
	 */
	setEnabled: function (enable) {
		this.Enabled = enable;
		this.fetch2.setDisabled(!this.Enabled);
	},

	/**
	 * @param {Object} dataSource
	 */
	bindDataSource: function (dataSource) {

	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this.fetch2.setWidth(percentWidth);
		this.toolBar.setWidth("100%");
		this._v3Report.setWidth("100%");
		this.fetch2.setWidth("100%");
	},

	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this.fetch2.setHeight(percentHeight);
		this._v3Report.setHeight("100%");
		this.fetch2.setHeight("100%");
	},



	getSpread: function () {
		var pluginID = this.pluginID();
		var spread = $("#" + pluginID).data("workbook");
		return spread;
	},

	/** 获取首个选中行索引
	 * @param sheet 
	 */
	getFirstSelectRowIndex: function (sheet) {
		var selRanges = sheet.getSelections();
		if (selRanges.length > 0) {
			return selRanges[0].row;
		}
		return -1;
	},

	/** 根据行索引，从表格集合中获取表格
	 * @param tables 表格集合
	 * @param rowIndex 行索引
	 */
	getTable: function (tables, rowIndex) {
		if (tables == null) {
			return null;
		}

		for (var i = 0; i < tables.length; i++) {
			var table = tables[i];
			var index = this.getReportRecordIndex(table, rowIndex);
			if (index >= 0) {
				return table;
			}
		}

		return null;
	},

	/** 根据报表实体、表格、id，获取选中行索引
	 * @param reportEntities 报表实体集合
	 * @param table 表格
	 * @param id id值
	 */
	getRowIndex: function (reportEntities, table, id) {
		var reportEntityCode = table.bindingPath();
		var tableRange = table.range();
		var tableRowIndex = tableRange.row;

		var reportEntity = reportEntities[reportEntityCode];
		if (reportEntity instanceof Array) {
			for (var i = 0; i < reportEntity.length; i++) {
				var reportRecord = reportEntity[i];
				var tmpId = reportRecord["id"];
				if (id == tmpId) {
					return tableRowIndex + i;
				}
			}
		}

		return tableRowIndex;
	},

	/** 根据表格、行索引，获取表格数据索引
	 * @param table 表格
	 * @param rowIndex 行索引
	 */
	getReportRecordIndex: function (table, rowIndex) {
		//获取表格范围
		var tableRange = table.range();
		var tableRowIndex = tableRange.row;
		var tableRowCount = tableRange.rowCount;
		//删除的行索引是否在表格范围内
		if (rowIndex >= tableRowIndex && rowIndex < (tableRowIndex + tableRowCount)) {
			//获取行索引所在的表格索引
			var index = rowIndex - tableRowIndex;
			return index;
		} else {
			return -1;
		}
	},

	/** 根据表格、选中行索引，从报表实体集合中获取报表实体记录
	 * @param reportEntities 报表实体集合
	 * @param table 表格
	 * @param rowIndex 行索引
	 */
	getReportRecord: function (reportEntities, table, rowIndex) {
		var index = this.getReportRecordIndex(table, rowIndex);
		if (index < 0) {
			return null;
		}

		var reportEntityCode = table.bindingPath();
		var reportEntity = reportEntities[reportEntityCode];
		var reportRecord = reportEntity[index];

		return reportRecord;
	},

	/** 获取报表主表实体记录
	 * @param reportEntities 报表实体集合
	 * @param groupFieldMappings 分组字段映射集合
	 */
	getMasterRecord: function (reportEntities, groupFieldMappings) {
		var masterRecord = null;
		if (groupFieldMappings) {
			var masterEntityName = groupFieldMappings.entityName;
			var reportEntity = reportEntities[masterEntityName];
			if (reportEntity != null && false == reportEntity instanceof Array) {
				masterRecord = reportEntity;
			}
		}
		return masterRecord;
	},

	/** 是否主从、分组报表
	 * @param groupFieldMappings 分组字段映射集合
	 */
	isGroupReport: function (groupFieldMappings) {
		if (groupFieldMappings == null || groupFieldMappings.entityName == null) {
			return false;
		}
		return true;
	},

	/**
	 * 交叉单元格是否为空
	 * @param tag 单元格Tag
	 */
	isEmptyCrossData: function (tag) {
		if (tag && tag.eventArgs && tag.eventArgs != "") {
			var isEmpty = tag.eventArgs["isEmpty"];
			if (isEmpty) {
				return true;
			}
		}
		return false;
	},

	//#endregion

	//#region 工具栏

	doTooneQuickPrintClick: function () {
		var _this=this;
		if (this.showType == SHOWTYPE_INPUT || this.showType == SHOWTYPE_FORMULA) {
			_this.doPrintInput(this.reportCode, "print");
		} else {
			if (this.htmlData == null || this.htmlData == "") {
				alert("正在获取打印数据，请稍候...");
			} else {
				var cfg = this.htmlData;
				_this.doPrint(cfg, null,"print");
			}
		}
	},

	doTooneGeneratePrintClick: function () {
		var _this=this;
		if (this.showType == SHOWTYPE_INPUT || this.showType == SHOWTYPE_FORMULA) {
			_this.doPrintInput(this.reportCode, "selectPrint");
		} else {
			if (this.htmlData == null || this.htmlData == "") {
				alert("正在获取打印数据，请稍候...");
			} else {
				var cfg = this.htmlData;
				_this.doPrint(cfg, null,"selectPrint");
			}
		}
	},

	doToonePreviewPrintClick: function () {
		var _this=this;
		if (this.showType == SHOWTYPE_INPUT || this.showType == SHOWTYPE_FORMULA) {
			_this.doPrintInput(this.reportCode, "preview");
		} else {
			if (this.htmlData == null || this.htmlData == "") {
				alert("正在获取打印数据，请稍候...");
			} else {
				var cfg = this.htmlData;
				_this.doPrint(cfg, null,"preview");
			}
		}
	},

	doTooneReportSaveClick: function (widget,saveEventCode) {
		var _this=this;
		if (saveEventCode) {
			_this.executeWindowRoute({
				"ruleSetCode": saveEventCode,
				"args": null,
				"success": function (args) { },
				"fail": function (args) {
					alert("操作失败。");
				}
			});
		}
	},

	/** 打印填报
	 * @param widget 报表控件ID
	 * @param rptCode 报表编码
	 * @param printType 打印方式
	 */
	doPrintInput: function (rptCode, printType) {
		var _this=this;
		var spread = this.getSpread();
		if (!spread)
			return;

		var sheet = spread.getActiveSheet();

		var reportEntities = sheet.getDataSource().getSource();
		var rptDatas = JSON.stringify(reportEntities);

		var params = {
			"isAsyn": true,
			"componentCode": this.componentCode,
			"windowCode": this.windowCode,
			ruleSetCode: "GetPrintData",
			isRuleSetCode: false,
			commitParams: [{
				"paramName": "rptCode",
				"paramType": "char",
				"paramValue": rptCode
			}, {
				"paramName": "rptDatas",
				"paramType": "char",
				"paramValue": rptDatas
			}],
			afterResponse: function (result) {
				var success = result["success"];
				if (success == true) {
					var data = result["data"];
					var printData = data.printData;
					//设置数据源
					var datasource = [];
					datasource.push(printData);

					var cfg = {};
					// 服务器名称
					cfg.serviceHost = "";
					// 服务器类型
					cfg.serverHostType = "local";
					// 打印机名称
					cfg.printerName = "";
					// 打印份数
					cfg.printNum = 1;
					// 数据源
					cfg.datasource = datasource;

					if (printType == "print") {
						_this.doPrint(cfg, null,"print");
					} else if (printType == "selectPrint") {
						_this.doPrint(cfg, null,"selectPrint");
					} else {
						_this.doPrint(cfg, null,"preview");
					}
				}
			}
		}
		this.remoteMethodAccessor(params);
	},

	createExcelArgs: function (displayText, listLineContainMultiRow) {
		var excelArgs = {};
		excelArgs["displayText"] = displayText;
		excelArgs["listLineContainMultiRow"] = listLineContainMultiRow;
		return excelArgs;
	},

	createQuickPrintArgs: function (displayText) {
		var quickPrintArgs = {};
		quickPrintArgs["displayText"] = displayText;
		var _this = this;
		quickPrintArgs["clickEvent"] = function () {
			_this.doTooneQuickPrintClick.apply(_this, [_this]);
		}
		return quickPrintArgs;
	},

	createGeneratePrintArgs: function (displayText) {
		var generalPrintArgs = {};
		generalPrintArgs["displayText"] = displayText;
		var _this = this;
		generalPrintArgs["clickEvent"] =function () {
			_this.doTooneGeneratePrintClick.apply(_this, [_this]);
		}
		return generalPrintArgs;
	},

	createPreviewPrintArgs: function (displayText) {
		var previewPrintArgs = {};
		previewPrintArgs["displayText"] = displayText;
		var _this = this;
		previewPrintArgs["clickEvent"] = function () {
			_this.doToonePreviewPrintClick.apply(_this, [_this]);
		}
		return previewPrintArgs;
	},

	createSaveArgs: function (displayText, clickEventCode) {
		var saveArgs = {};
		saveArgs["displayText"] = displayText;
		var _this = this;
		saveArgs["clickEvent"] =function () {
			_this.doTooneReportSaveClick.apply(_this, [_this,clickEventCode]);
		}
		return saveArgs;
	},

	/** 设置工具栏（兼容旧配置）
	 * @param widget 报表控件ID
	 */
	setToolStripItemsForHistory: function (reportEvents, showType, listLineContainMultiRow) {
		var saveEventCode = null;
		if (reportEvents) {
			for (var i = 0; i < reportEvents.length; i++) {
				var reportEvent = reportEvents[i];
				if ("saveEvent" == reportEvent.eventType) {
					saveEventCode = reportEvent.eventCode;
				}
			}
		}

		var excelArgs = this.createExcelArgs("导出Excel", listLineContainMultiRow);
		var quickPrintArgs = this.createQuickPrintArgs("快速打印");
		var generalPrintArgs = this.createGeneratePrintArgs("普通打印");
		var previewPrintArgs = this.createPreviewPrintArgs("预览打印");
		var saveArgs = this.createSaveArgs("保存", saveEventCode);
		if (showType == SHOWTYPE_INPUT) {
			this.setToolStripItemsForTooneReport(excelArgs, quickPrintArgs, generalPrintArgs, previewPrintArgs, saveArgs);
		} else {
			this.setToolStripItemsForTooneReport(excelArgs, quickPrintArgs, generalPrintArgs, previewPrintArgs);
		}
	},

	setToolStripItemsForConfig: function (toolBarItems, showType, listLineContainMultiRow) {
		var excelArgs, quickPrintArgs, generalPrintArgs, previewPrintArgs, saveArgs;
		if (toolBarItems && toolBarItems.size() > 0) {
			for (var i = 0; i < toolBarItems.size(); i++) {
				var toolBarItem = toolBarItems[i];
				var displayText = toolBarItem.displayText;
				var clickEvent = toolBarItem.clickEvent;
				var toolBarKey = toolBarItem.toolBarKey;
				if ("ExportExcel" == toolBarKey) {
					//导出参数
					var excelArgs = this.createExcelArgs(displayText, listLineContainMultiRow);
				} else if ("QuickPrinting" == toolBarKey) {
					//快速打印事件参数
					var quickPrintArgs = this.createQuickPrintArgs(displayText);
				} else if ("GeneralPrinting" == toolBarKey) {
					//普通打印事件参数
					var generalPrintArgs = this.createGeneratePrintArgs(displayText);
				} else if ("PrintPreview" == toolBarKey) {
					//预览打印事件参数
					var previewPrintArgs = this.createPreviewPrintArgs(displayText);
				} else if ("Save" == toolBarKey) {
					//保存事件参数
					var saveArgs = this.createSaveArgs(displayText, clickEvent);
				}
			}
		}

		if (showType == SHOWTYPE_INPUT) {
			this.setToolStripItemsForTooneReport(excelArgs, quickPrintArgs, generalPrintArgs, previewPrintArgs, saveArgs);
		} else {
			this.setToolStripItemsForTooneReport(excelArgs, quickPrintArgs, generalPrintArgs, previewPrintArgs);
		}
	},

	//#endregion

	//#region 加载报表

	parseObjects: function (value) {
		var result;
		if (value && value != "") {
			result = JSON.parse(value);
		}
		return result;
	},

	getShowType: function (isInput, formReportEntityRelas, dataSources, formulaCells, listLineContainMultiRow) {
		var showType = SHOWTYPE_VIEW;
		if (listLineContainMultiRow) {
			if ("true" == listLineContainMultiRow) {
				return showType;
			}
		}

		if (isInput) {
			if (formReportEntityRelas && formReportEntityRelas.length > 0) {
				if (dataSources && dataSources.size() > 0) {
					showType = SHOWTYPE_INPUT;
				} else {
					showType = SHOWTYPE_VIEW;
				}
			} else {
				if (dataSources && dataSources.size() > 0) {
					showType = SHOWTYPE_FORMULA;
				} else {
					showType = SHOWTYPE_VIEW;
				}
			}
		} else {
			if (formulaCells && formulaCells.size() > 0) {
				if (dataSources && dataSources.size() > 0) {
					showType = SHOWTYPE_FORMULA;
				}
			}
		}

		return showType;
	},

	/** 加载报表
	 * @param widgetId  报表控件ID
	 * @param data 报表数据
	 * @param isInput 是否填报
	 */
	innerTooneReport: function (data, isInput) {
		//报表类型
		var reportType = data.reportType;
		//报表编码
		var reportCode = data.reportCode;
		//报表数据
		var reportData = data.reportData;
		//报表实体集合
		var dataSources = this.parseObjects(data.reportDataSources);
		//分组字段映射集合
		var groupFieldMappings = this.parseObjects(data.reportGroupFieldMappings);
		//公式单元格集合
		var formulaCells = this.parseObjects(data.reportFormulaCells);
		//报表事件集合
		var reportEvents = this.parseObjects(data.reportEvents);
		//窗体实体和报表实体映射集合
		var formReportEntityRelas = this.parseObjects(data.reportFormReportEntityRelas);
		//交叉报表或字段横向显示报表：单元格索引和实体记录索引映射集合
		var crossCellIndexMappings = this.parseObjects(data.reportCrossCellIndexMappings);
		//工具栏
		var toolBarItems = this.parseObjects(data.reportToolBarItems);
		//复制公式的单元格集合
		var copyFormulaCells = this.parseObjects(data.reportCopyFormulaCells);
		//是否包含多动态行
		var listLineContainMultiRow = data.reportListLineContainMultiRow;

		//报表显示方式
		var showType = this.getShowType(isInput, formReportEntityRelas, dataSources, formulaCells, listLineContainMultiRow);

		//加载报表控件
		//如果报表控件加载过其他报表，需要销毁上份报表
		var spread = this.getSpread();
		if (spread) {
			spread.destroy();
		}

		this.draw("TooneReport", null);
		this.showType = showType;
		this.reportCode = reportCode;
		//加载报表控件工具栏
		this.setV3ToolStripItemsForTooneReport(reportEvents, reportType, toolBarItems, showType, listLineContainMultiRow);

		//#region 替换控件标签 原来为object标签
		var border_top = this.IsShowToolbar ? " 1px solid gray;" : "none;";
		var pluginID = this.pluginID();
		var html =
			"<div class='sample-turtorial' id='TooneReport_" + pluginID + "'>" +
			"	<div id='" + pluginID + "' style='width:" + this.getDivWidth() + "px;height:" + this.getDivHeight() + "px;border-top:" + border_top + "'></div>" +
			"	<div class='demo-options'></div>" +
			"</div>";
		if ($("#TooneReport_" + pluginID).size() > 0) {
			$("#TooneReport_" + pluginID).parent().append(html);
			$("#TooneReport_" + pluginID).remove();
		} else {
			$("#" + pluginID).parent().append(html);
			$("#" + pluginID).remove();
		}
		//#endregion

		//#region 注册授权码并加载报表
		var errormsg = "";
		var validateSpread;
		this.tooneBeforeReport.relicense();
		try {
			validateSpread = new GC.Spread.Sheets.Workbook;
			validateSpread.getSheet(0).setValue(0, 0, "test");
		} catch (e) {
			errormsg = "error";
		}

		if (errormsg == "") {
			validateSpread && validateSpread.destroy();
			console.warn("授权码:" + GC.Spread.Sheets.LicenseKey);
		}

		if (errormsg == "" && GC.Spread.Sheets.LicenseKey) {
			//创建Spread对象
			this.createSpread(pluginID, showType, reportData, dataSources, groupFieldMappings, formulaCells, formReportEntityRelas, crossCellIndexMappings, copyFormulaCells);
			this.tooneBeforeReport.drawInnerText(pluginID);
		} else {
			this.tooneBeforeReport.relicenserror(pluginID);
			console.warn("控件" + this.widgetId + "授权码:" + GC.Spread.Sheets.LicenseKey);
		}
		//#endregion
	},

	tooneBeforeReport: {
		license_inner: {
			1: "10.*|192.*,415593559754313#A0OinjIklkIs4XZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TQNxmSyFmSvA5V62iS0NHeshUVx8WOKJWQ8olRplWMZNWS4sWNa3mattWRNx4UwsyMIN6TZFzS7hka754ZI9mTz3EWVdlNhpmVw26RotyLh94Z4F7YiJiOiMlIsQTN8ETNyQjN0IicfJye\x26Qf35VfiMjY6cmI0IyQiwiIxEjL6ByUKBCZhVmcwNlI0IiTis7W0ICZyBlIsIiNxETM9ADI4IjMxgTMwIjI0ICdyNkIsIiKuITOxwiKuATMiojIz5GRiwiI8+Y9sWY9QmZ0Jyp93uL9hKI0Aqo9Re09byp9MCZ9iojIh94QiwiIzEzM4UzN9UTNzkTe3nD",
			2: "127.0.0.1,415593559754313#A0IOIQWSiwSflNHbhZmOiI7ckJye0ICbuFkI1pjIEJCLi4TPRRVbrcDMEJkbD3UU5l4YNJzVHFzTMN6QwVXbxIWUpxENlFGavFjVPFGUk34QxQGUohnR8BnenRFVw5EOxcmZXNzbvNjQDVmT8N7cHFUTBh5RW5EdCJnI0IyUiwyNzIzNyMjMxEjM0IicfJye#4Xfd5nIzImNnJiOiMkIsISMx8idgMlSgQWYlJHcTJiOi8kI1tlOiQmcQJCLiYDN8EDOwASNyITM8EDMyIiOiQncDJCLiEjLw8CMucjMxIiOiMXbEJCLig1jlzahlDZmpnInm71ukHqgoDoimH9pnvJnmzIklLiOiEmTDJCLiMTMzQTN7kTN5MTO5U1MtI"
		},
		warnText: {
			inner: "获取正式商业授权涉及费用，收费标准请发送邮件到<br>vdept@toone.com.cn咨询。",
			error: "未找到有效许可证。<br>获取正式商业授权涉及费用，收费标准请发送邮件到<br>vdept@toone.com.cn咨询。"
		},
		isInner: function () {
			var hostname = location.hostname;
			var isAIp_inner = /^(10\.)/g;
			//var isBIp_inner = /^(172\.)/g;
			var isCIp_inner = /^(192\.168\.)/g;
			var islocahost = /^(127\.0\.0\.1|localhost)/g
			var type = false;
			if (
				isAIp_inner.test(hostname) ||
				isCIp_inner.test(hostname)
			) {
				type = 1;
			}
			/*
			if(isBIp_inner.test(hostname)){
				var _$hostname=hostname.split(".");
				if(_$hostname[1]>=16 && _$hostname[1] <=31){
					type = 1;
				}
			}*/
			if (islocahost.test(hostname)) {
				type = 2;
			}
			return type;
		},
		relicense: function (type) {
			var type = this.isInner();
			if (type) {
				//add by xiedh 如果不是内网ip，则无需重新设置license 2019-01-05
				GC.Spread.Sheets.LicenseKey = this.license_inner[type];
			}
		},
		drawInnerText: function (pluginID) {
			var type = this.isInner();
			if (type) {
				var el = document.createElement("div");
				el.className = "report_inner_show";
				el.innerHTML = this.warnText.inner;
				$("#" + pluginID).find("canvas").eq(0).after(el);
			};
		},
		relicenserror: function (pluginID) {
			var el = $("#" + pluginID);
			var errorEl =
				'<div class="report_error">' +
				'<span class="report_error_img"></span>' +
				'<span class="report_error_text">' + this.warnText.error + '</span>' +
				'<p></p>' +
				'</div>';
			el.append(errorEl);
		}
	},



	createSpread: function (pluginID, showType, reportData, dataSources, groupFieldMappings, formulaCells, formReportEntityRelas, crossCellIndexMappings, copyFormulaCells) {
		var _this=this;
		var cacheRegistedObjs = {};
		if (showType == SHOWTYPE_INPUT) {
			//缓存，避免填报时窗体实体注册的事件重复触发
			var reportEntityCodes = Object.keys(dataSources[0]);
			var currentId = _this.uuid;
			for (var i = 0; i < reportEntityCodes.size(); i++) {
				var reportEntityCode = reportEntityCodes[i];
				var formEntityCode = this.getFormEntityCode(reportEntityCode, formReportEntityRelas);
				var currentKey = this.id + "_" + formEntityCode;
				cacheRegistedObjs[currentKey] = currentId;
				this.currentId = currentId;
			}

			//同步窗体实体数据
			this.synFormEntity(dataSources, formReportEntityRelas);
		}

		var spread = new GC.Spread.Sheets.Workbook(document.getElementById(pluginID), {
			sheetCount: 1
		});

		//#region 右键菜单

		initContextMenu(spread);
		var _this=this;
		function initContextMenu(spread) {

			spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
				var row = hitInfo.worksheetHitInfo.row;
				var col = hitInfo.worksheetHitInfo.col;
				var currentSheet = spread.getActiveSheet();
				currentSheet.setSelection(row, col, 1, 1);
				//获取所有表格
				var tables = currentSheet.tables.all();
				//检测是否是表格行
				var table = _this.getTable(tables, row);
				if (table == null) {
					for (var j = itemsDataForShown.size() - 1; j >= 0; j--) {
						var itemData = itemsDataForShown[j];
						var name = itemData["name"];
						if (name) {
							if ("autoFitColumn" != name) {
								itemsDataForShown.removeAt(j);
							}
						} else {
							itemsDataForShown.removeAt(j);
						}
					}
				}
			};

			var menuData = spread.contextMenu.menuData;
			for (var i = menuData.length - 1; i >= 0; i--) {
				menuData.splice(i, 1);
			}

			var commandManager = spread.commandManager();
			var autoFitColumnMenuItem = {
				text: "自适应列宽",
				name: "autoFitColumn",
				workArea: "viewportrowHeader",
				command: "autoFitColumnCommand"
			};
			spread.contextMenu.menuData.splice(0, 0, autoFitColumnMenuItem);
			commandManager.register("autoFitColumnCommand", autoFitColumnCommand, null, false, false, false, false
			);

			var separatorMenuItem = {
				type: "separator"
			};
			spread.contextMenu.menuData.splice(1, 0, separatorMenuItem);

			if (showType == SHOWTYPE_INPUT) {
				var addRowsMenuItem = {
					text: "增加",
					name: "addRows",
					workArea: "viewportrowHeader",
					command: "addRowsCommand"
				};
				spread.contextMenu.menuData.splice(2, 0, addRowsMenuItem);
				commandManager.register("addRowsCommand",addRecordCommand, null, false, false, false, false
				);

				var commandManager = spread.commandManager();
				var insertRowsMenuItem = {
					text: "插入",
					name: "insertRows",
					workArea: "viewportrowHeader",
					command: "insertRowsCommand"
				};
				spread.contextMenu.menuData.splice(3, 0, insertRowsMenuItem);
				commandManager.register("insertRowsCommand",insertRecordCommand, null, false, false, false, false
				);

				var deleteRowsMenuItem = {
					text: "删除",
					name: "deleteRows",
					workArea: "viewportrowHeader",
					command: "deleteRowsCommand"
				};
				spread.contextMenu.menuData.splice(4, 0, deleteRowsMenuItem);
				commandManager.register("deleteRowsCommand",deleteRecordCommand, null, false, false, false, false
				);
			}
		}

		function addRecordCommand() {
			spread.suspendPaint();
			try {
				var sheet = spread.getActiveSheet();
				_this.addRecord(sheet, 1, true);
			} catch (ex) {
				alert(ex);
			} finally {
				spread.resumePaint();
			}
		}

		function insertRecordCommand() {
			spread.suspendPaint();
			try {
				var sheet = spread.getActiveSheet();
				_this.addRecord(sheet, 1, false);
			} catch (ex) {
				alert(ex);
			} finally {
				spread.resumePaint();
			}
		}

		function deleteRecordCommand() {
			spread.suspendPaint();
			try {
				var sheet = spread.getActiveSheet();
				_this.deleteRecord(sheet);
			} catch (ex) {
				alert(ex);
			} finally {
				spread.resumePaint();
			}
		}

		function autoFitColumnCommand() {
			spread.suspendPaint();
			try {
				var sheet = spread.getActiveSheet();
				var colIndex = sheet.getActiveColumnIndex();
				sheet.autoFitColumn(colIndex);
			} catch (ex) {
				alert(ex);
			} finally {
				spread.resumePaint();
			}
		}

		if (this.registerHyperLinkOnClick) {
			spread.registerHyperLinkOnClick = this.registerHyperLinkOnClick;
		}

		if (this.registerCellClick) {
			spread.registerCellClick = this.registerCellClick;
		}

		//#endregion

		//#region Spread事件

		if (showType == SHOWTYPE_INPUT) {
			//数据校验事件
			spread.bind(GC.Spread.Sheets.Events.ValidationError, function (e, args) {
				var sheet = args.sheet;
				var rowIndex = args.row;
				var colIndex = args.col;
				var validator = sheet.getDataValidator(rowIndex, colIndex);
				var msg = validator.inputMessage();
				alert(msg);

				args.validationResult = GC.Spread.Sheets.DataValidation.DataValidationResult.discard;
			});

			//单元格值编辑完成事件
			spread.bind(GC.Spread.Sheets.Events.EditEnding, function (e, args) {
				var sheet = args.sheet;
				var rowIndex = args.row;
				var colIndex = args.col;
				var cell = sheet.getCell(rowIndex, colIndex);
				var oldValue = cell.value();
				var newValue = args.editingText;
				if (newValue != oldValue) {
					var dataValidators = sheet.getParent().dataValidators;
					var entityCode = "";
					var fieldCode = "";
					var bindingPath = cell.bindingPath();
					if (bindingPath) {
						var names = bindingPath.split(".");
						if (names.length > 1) {
							entityCode = names[0];
							fieldCode = names[1];
						}
					} else {
						var tag = cell.tag();
						if (tag) {
							var eventArgs = tag.eventArgs;
							if (eventArgs) {
								entityCode = eventArgs.entityName;
								fieldCode = eventArgs.fieldName;
							}
						}
					}

					if (dataValidators) {
						var items = dataValidators[entityCode];
						if (items) {
							var dv = items[fieldCode];
							if (dv) {
								var vad = sheet.getDataValidator(rowIndex, colIndex);
								if (vad == null) {
									sheet.setDataValidator(rowIndex, colIndex, dv);
								}
								if (dv.isValid(sheet, rowIndex, colIndex, newValue)) {
									sheet.setDataValidator(rowIndex, colIndex, null);
								} else {
									//args.cancel = true;
								}
							}
						}
					}
				}
			});

			//单元格值改变事件
			spread.bind(GC.Spread.Sheets.Events.ValueChanged,
				function (e, args) {
						var sheet = args.sheet;
						var rowIndex = args.row;
						var colIndex = args.col;
						var oldValue = args.oldValue;
						var newValue = args.newValue;
						var srcDirtyCells = sheet.getDirtyCells();
						if (newValue != oldValue) {
							_this.editRecord(sheet, rowIndex, colIndex, newValue);
							//修改受其影响的其他单元格字段的值
							setTimeout(function () {
									var curDirtyCells = sheet.getDirtyCells();
									var changedDirtyCells = _this.getChangedDirtyCells(srcDirtyCells, curDirtyCells);
									for (var i = 0; i < changedDirtyCells.length; i++) {
										var item = changedDirtyCells[i];
										_this.editRecord(sheet, item.row, item.col, item.newValue);
									}
								}
							,0);
						}
					}
			)

			//进入单元格事件
			spread.bind(GC.Spread.Sheets.Events.EnterCell,function (e, args) {
				
						var sheet = args.sheet;
						var rowIndex = args.row;
						var colIndex = args.col;

						var tag = sheet.getTag(rowIndex, colIndex);
						var isEmpty = _this.isEmptyCrossData(tag);
						if (isEmpty) {
							var cell = sheet.getCell(rowIndex, colIndex);
							cell.locked(true);
						}

						var reportEntities = sheet.getDataSource().getSource();
						var tables = sheet.tables.all();
						_this.synSelectFormEntity(sheet, reportEntities, tables, rowIndex, colIndex);

						sheet.setActiveCell(rowIndex, colIndex);
						sheet.startEdit(true);
					}
			)
		}

		//单元格点击事件
		spread.bind(spreadNS.Events.CellClick,function (e, args) {
					var rowIndex = args.row;
					var colIndex = args.col;
					var sheet = args.sheet;
					var value = sheet.getTag(rowIndex, colIndex);
					if (value && value.hasOwnProperty("eventCode")) {
						var isEmpty = _this.isEmptyCrossData(value);
						if (isEmpty) {
							return;
						}

						//单元格绑定的事件
						var cellType = sheet.getCellType(rowIndex, colIndex);
						if (cellType instanceof GC.Spread.Sheets.CellTypes.HyperLink) {
							var cellValue = sheet.getCell(rowIndex, colIndex).value();
							if (cellValue == null || cellValue == "") {
								_this.doCellClick(sheet, rowIndex, colIndex, value);
							}
						} else {
							_this.doCellClick(sheet, rowIndex, colIndex, value);
						}
					} else {
						//规则“加载数据到报表”绑定的事件（超链接单元格点击的时候，触发超链接事件）
						var cellType = sheet.getCellType(rowIndex, colIndex);
						if (cellType instanceof GC.Spread.Sheets.CellTypes.HyperLink) {
							_this.doHyperLinkClick(sheet, rowIndex, colIndex, value);
						}
					}
				}
			
		);

		spread.bind(spreadNS.Events.ActiveSheetChanged,function (e, args) {
					var sheet = args.newSheet;
					_this.setScrollbarVisible(sheet);
				}
		);

		spread.bind(spreadNS.Events.RowChanged,function (e, args) {
					var sheet = args.sheet;
					_this.setScrollbarVisible(sheet);
				}
		);

		//#endregion

		//#region 加载数据

		var spreadData = JSON.parse(reportData);
		spread.suspendPaint();
		try {
			spread.fromJSON(spreadData);
			spread.options.tabStripVisible = false;
			spread.options.tabEditable = false;
			spread.options.newTabVisible = false;
			//是否复制样式
			spread.options.allowCopyPasteExcelStyle = true;
			spread.options.scrollbarMaxAlign = true;
			spread.options.scrollbarShowMax = true;

			var sheets = spread.sheets;
			//行高自适应
			var size = sheets.size();
			if (size > 1) {
				spread.options.tabStripVisible = true;
			}

			//复制公式
			this.bindingCopyFormulaCells(sheets, copyFormulaCells);

			if (showType == SHOWTYPE_INPUT || showType == SHOWTYPE_FORMULA) {
				//报表实体
				var reportEntityCodes = Object.keys(dataSources[0]);

				spread.groupFieldMappings = groupFieldMappings;
				spread.formReportEntityRelas = formReportEntityRelas;
				spread.crossCellIndexMappings = crossCellIndexMappings;

				//绑定报表实体
				this.bindingDataSources(sheets, dataSources);

				if (showType == SHOWTYPE_INPUT) {
					var dataValidators = this.createAllDataValidators(formReportEntityRelas);
					spread.dataValidators = dataValidators;
					spread.options.highlightInvalidData = true;
					//绑定同步事件
					this.bindingSynEvent(reportEntityCodes, formReportEntityRelas);
				}

				//绑定公式
				this.bindingFormulaCells(sheets, formulaCells);

				this.resetValueByFormulaCells(sheets, formulaCells);

				this.resetValueByCopyFormulaCells(sheets, copyFormulaCells);
			}

			for (var i = 0; i < size; i++) {
				var tmpSheet = spread.getSheet(i);
				tmpSheet.options.frozenlineColor = 'transparent';
				tmpSheet.options.allowCellOverflow = false;
				var rowCount = tmpSheet.getRowCount();
				var colCount = tmpSheet.getColumnCount();
				for (var j = 0; j < rowCount; j++) {
					this.doAutoFitRow(tmpSheet, j, colCount, showType);
				}
			}

			_this.setScrollbarVisible(spread.getSheet(0));

		} finally {
			spread.resumePaint();
		}

		//#endregion

	},

	updataReportEntityRecord: function (sheet, rowIndex, colIndex, reportEntities) {
		var tag = sheet.getTag(rowIndex, colIndex);
		if (tag != null && tag.eventArgs != null) {
			var entityName = tag.eventArgs.entityName;
			var fieldName = tag.eventArgs.fieldName;
			var id = tag.eventArgs.id;
			var value = sheet.getCell(rowIndex, colIndex).value();
			var reportEntity = reportEntities[entityName];
			for (var i = 0; i < reportEntity.size(); i++) {
				var reportRecord = reportEntity[i];
				if (id == reportRecord["id"]) {
					reportRecord[fieldName] = value;
					break;
				}
			}
		}
	},

	resetValueByFormulaCells: function (sheets, allFormulaCells) {
		if (allFormulaCells) {
			var count = sheets.size();
			for (var i = 0; i < count; i++) {
				var sheet = sheets[i];
				var reportEntities = sheet.getDataSource().getSource();
				var formulaCells = allFormulaCells[i];
				for (var j = 0; j < formulaCells.length; j++) {
					var formulaCellObj = formulaCells[j];
					var rowIndex = formulaCellObj.rowIndex;
					var colIndex = formulaCellObj.colIndex;
					this.updataReportEntityRecord(sheet, rowIndex, colIndex, reportEntities);
				}
			}
		}
	},

	resetValueByCopyFormulaCells: function (sheets, allFormulaCells) {
		if (allFormulaCells) {
			var count = sheets.size();
			for (var i = 0; i < count; i++) {
				var sheet = sheets[i];
				var reportEntities = sheet.getDataSource().getSource();
				var formulaCells = allFormulaCells[i];
				for (var j = 0; j < formulaCells.length; j++) {
					var formulaCellObj = formulaCells[j];
					var rowIndex = formulaCellObj.destRowIndex;
					var colIndex = formulaCellObj.destColIndex;
					this.updataReportEntityRecord(sheet, rowIndex, colIndex, reportEntities);
				}
			}
		}
	},

	//#region 根据映射关系，查找窗体实体，清除数据，增加数据

	synFormEntity: function (dataSources, formReportEntityRelas) {
		if (!dataSources)
			return;

		if (!formReportEntityRelas)
			return;

		var destEntities = this.concatDataSource(dataSources);
		var entityNames = Object.keys(destEntities);
		for (var i = 0; i < entityNames.size(); i++) {
			var entityName = entityNames[i];
			var entity = destEntities[entityName];
			for (var j = 0; j < formReportEntityRelas.size(); j++) {
				var relaObj = formReportEntityRelas[j];
				var reportEntityCode = relaObj.reportEntityCode;
				var formEntityCode = relaObj.formEntityCode;
				var fieldMappings = relaObj.fieldMappings;
				if (entityName == reportEntityCode) {
					var formEntity = isc.JGDataSourceManager.get(this,formEntityCode);

					var destDatas = [];
					for (var k = 0; k < entity.size(); k++) {
						var record = entity[k];
						var destRecord = this.toFormEntityRecord(record, fieldMappings);
						destDatas.push(destRecord);
					}

					if (formEntity) {
						formEntity.clear();

						formEntity.load(destDatas);
					}
				}
			}
		}
	},

	concatDataSource: function (dataSourceObjs) {
		var destEntities = {};
		for (var i = 0; i < dataSourceObjs.size(); i++) {
			var dataSourceObj = dataSourceObjs[i];
			var entityNames = Object.keys(dataSourceObj);
			for (var j = 0; j < entityNames.length; j++) {
				var entityName = entityNames[j];
				var entity = dataSourceObj[entityName];
				if (destEntities[entityName]) {
					if (entity instanceof Array) {
						destEntities[entityName] = destEntities[entityName].concat(entity);
					} else {
						destEntities[entityName].push(entity);
					}
				} else {
					if (entity instanceof Array) {
						destEntities[entityName] = entity;
					} else {
						var tmp = [];
						tmp.push(entity);
						destEntities[entityName] = tmp;
					}
				}
			}
		}
		return destEntities;
	},

	toFormEntityRecord: function (record, fieldMappings) {
		var destRecord = {};
		var fieldCodes = Object.keys(record);
		for (var i = 0; i < fieldCodes.size(); i++) {
			var fieldCode = fieldCodes[i];
			var fieldValue = record[fieldCode];
			for (var j = 0; j < fieldMappings.size(); j++) {
				var fieldMapping = fieldMappings[j];
				var reportFieldCode = fieldMapping.reportField;
				var formFieldCode = fieldMapping.formField;
				if (reportFieldCode == fieldCode) {
					destRecord[formFieldCode] = fieldValue;
				}
			}
		}
		return destRecord;
	},

	//#endregion

	createAllDataValidators: function (formReportEntityRelas) {
		var dataValidators = {};
		for (var i = 0; i < formReportEntityRelas.length; i++) {
			var formReportEntityRela = formReportEntityRelas[i];
			var entityCode = formReportEntityRela.reportEntityCode;
			var items = {};
			dataValidators[entityCode] = items;
			var fieldMappings = formReportEntityRela.fieldMappings;
			for (var j = 0; j < fieldMappings.length; j++) {
				var fieldMapping = fieldMappings[j];
				var fieldCode = fieldMapping.reportField;
				var fieldType = fieldMapping.fieldType;
				var length = fieldMapping.length;
				var precision = fieldMapping.precision;
				if (length <= 0) {
					continue;
				}

				//string、number、integer、boolean、date、longDate
				if ("number" == fieldType) {
					var dv = this.createNumberValidator(length, precision);
					items[fieldCode] = dv;
				} else if ("integer" == fieldType) {
					var dv = this.createIntegerValidator(length);
					items[fieldCode] = dv;
				}
			}
		}
		return dataValidators;
	},

	createNumberValidator: function (length, precision) {
		var maxValue = "";
		var size = length - precision;
		for (var i = 0; i < size; i++) {
			maxValue = maxValue + "9";
		}

		if (precision > 0) {
			maxValue = maxValue + "."
			for (var i = 0; i < precision; i++) {
				maxValue = maxValue + "9";
			}
		}

		var minValue = (-1) * maxValue;

		var dv = GC.Spread.Sheets.DataValidation.createNumberValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, minValue, maxValue, false);
		dv.showInputMessage(false);
		dv.inputMessage("请输入小数。");
		dv.inputTitle("提示");
		return dv;
	},

	createIntegerValidator: function (length) {
		var maxValue = "";
		for (var i = 0; i < length; i++) {
			maxValue = maxValue + "9";
		}

		var minValue = (-1) * maxValue;

		var dv = GC.Spread.Sheets.DataValidation.createNumberValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, minValue, maxValue, true);
		dv.showInputMessage(false);
		dv.inputMessage("请输入整数。");
		dv.inputTitle("提示");
		return dv;
	},

	getChangedDirtyCells: function (srcDirtyCells, dirtyCells) {
		var result = [];
		for (var i = 0; i < dirtyCells.length; i++) {
			var dirtyCell = dirtyCells[i];
			if (i >= srcDirtyCells.length) {
				result.push(dirtyCell);
			} else {
				var srcDirtyCell = srcDirtyCells[i];
				var srcValue = srcDirtyCell.oldValue;
				var value = dirtyCell.oldValue;
				if (srcValue != value) {
					result.push(dirtyCell);
				}
			}
		}
		return result;
	},


	bindingDataSources: function (sheets, dataSources) {
		var count = sheets.size();
		for (var i = 0; i < count; i++) {
			var sheet = sheets[i];
			var reportEntities = null;
			if (i >= dataSources.length) {
				reportEntities = dataSources[dataSources.length - 1];
			} else {
				reportEntities = dataSources[i];
			}
			var bindingSource = new spreadNS.Bindings.CellBindingSource(reportEntities);
			sheet.setDataSource(bindingSource);
		}
	},

	bindingSynEvent: function (reportEntityCodes, formReportEntityRelas) {
		var currentId = this.currentId;
		for (var i = 0; i < reportEntityCodes.size(); i++) {
			var reportEntityCode = reportEntityCodes[i];
			var formEntityCode = this.getFormEntityCode(reportEntityCode, formReportEntityRelas);
			var formEntity = isc.JGDataSourceManager.get(this,formEntityCode);
			if (formEntity) {
				formEntity.on({
					"eventName": formEntity.Events.SELECT,
					"handler": function (params) {
						this.synSelectDataSource(params, currentId);
					}
				});

				formEntity.on({
					"eventName": formEntity.Events.INSERT,
					"handler": function (params) {
						this.synInsertDataSource(params, currentId);
					}
				});

				formEntity.on({
					"eventName": formEntity.Events.UPDATE,
					"handler": function (params) {
						this.synUpdateDataSource(params, currentId);
					}
				});

				formEntity.on({
					"eventName": formEntity.Events.DELETE,
					"handler": function (params) {
						this.synDeleteDataSource(params, currentId);
					}
				});
			}
		}
	},

	bindingFormulaCells: function (sheets, allFormulaCells) {
		if (allFormulaCells) {
			var count = sheets.size();
			for (var i = 0; i < count; i++) {
				var sheet = sheets[i];
				var formulaCells = allFormulaCells[i];
				for (var j = 0; j < formulaCells.length; j++) {
					var formulaCellObj = formulaCells[j];
					var formula = formulaCellObj.formula;
					if (formula.indexOf("C_ROW()") >= 0) {
						formula = formula.replace("C_ROW()", "ROW()");
					}
					sheet.setFormula(formulaCellObj.rowIndex, formulaCellObj.colIndex, formula);
					sheet.getCell(formulaCellObj.rowIndex, formulaCellObj.colIndex).locked(true);
				}
			}
		}
	},

	bindingCopyFormulaCells: function (sheets, allCopyFormulaCells) {
		if (allCopyFormulaCells) {
			var options = GC.Spread.Sheets.CopyToOptions.formula;
			var count = sheets.size();
			for (var i = 0; i < count; i++) {
				var sheet = sheets[i];
				var copyFormulaCells = allCopyFormulaCells[i];
				for (var j = 0; j < copyFormulaCells.length; j++) {
					var copyCell = copyFormulaCells[j];
					sheet.copyTo(copyCell.srcRowIndex, copyCell.srcColIndex, copyCell.destRowIndex, copyCell.destColIndex, 1, 1, options);
				}
			}
		}
	},

	/** 自适应行高，并注册超链接点击事件
	 * @param sheet 
	 * @param rowIndex 行索引
	 * @param colCount 列个数
	 */
	doAutoFitRow: function (sheet, rowIndex, colCount, showType) {
		var srcHeight = sheet.getRowHeight(rowIndex);
		if (srcHeight == 0) {
			//高度为0，代表此行隐藏，跳过
			return;
		}

		sheet.autoFitRow(rowIndex);
		var destHeight = sheet.getRowHeight(rowIndex);
		if (srcHeight > destHeight) {
			sheet.setRowHeight(rowIndex, srcHeight);
		}

		var spread = sheet.getParent();
		for (var colIndex = 0; colIndex < colCount; colIndex++) {
			var cell = sheet.getCell(rowIndex, colIndex);
			if (showType != SHOWTYPE_INPUT) {
				cell.locked(true);
			}
			var cellType = sheet.getCellType(rowIndex, colIndex);
			if (cellType instanceof GC.Spread.Sheets.CellTypes.HyperLink) {
				if (spread.registerHyperLinkOnClick) {
					this.setHyperLinkEvent(sheet, cellType);
				} else {
					var value = sheet.getTag(rowIndex, colIndex);
					if (value && value.hasOwnProperty("eventCode")) {
						this.setHyperLinkEvent(sheet, cellType);
					}
				}
			}
		}
	},

	/** 注册超链接点击事件
	 * @param sheet 
	 * @param cellType
	 */
	setHyperLinkEvent: function (sheet, cellType) {
		var _this=this;
		cellType.onClickAction(function (args) {
					var rowIndex = args.row;
					var colIndex = args.col;
					var value = args.sheet.getTag(rowIndex, colIndex);
					if (value && value.hasOwnProperty("eventCode")) {
						//单元格绑定的事件
						_this.doCellClick(sheet, rowIndex, colIndex, value);
					} else {
						//规则“加载数据到报表”绑定的事件（超链接单元格点击的时候，触发超链接事件）
						_this.doHyperLinkClick(sheet, rowIndex, colIndex, value);
					}
				}
		)
	},

	// 执行超链接点击事件
	doHyperLinkClick: function (sheet, rowIndex, colIndex, value) {
		var spread = sheet.getParent();
		if (spread.registerHyperLinkOnClick) {
			if (value) {
				var eventArgs = value.eventArgs;
				if (eventArgs) {
					var srcEntityName = eventArgs.entityName;
					value.data = {};
					value.data[srcEntityName] = eventArgs.data;
				}
			}

			spread.registerHyperLinkOnClick(value,
				function (args) {
					if (args) {
						var items = Object.keys(args);
						if (items.length <= 0) {
							return;
						}

						spread.suspendPaint();
						try {
							var reportDataSource = sheet.getDataSource();
							if (reportDataSource == null)
								return;

							var reportEntities = reportDataSource.getSource();
							var tables = sheet.tables.all();
							var tableNames = Object.keys(args);
							for (var i = 0; i < tableNames.length; i++) {
								var reportEntityCode = tableNames[i];
								var tableValue = args[reportEntityCode];

								var reportRecord = null;
								var table = this.getTable(tables, rowIndex);
								if (table) {
									reportRecord = getReportRecord(reportEntities, table, rowIndex);
								} else {
									reportRecord = reportEntities[reportEntityCode];
								}

								if (reportRecord == null)
									continue;

								var fieldCodes = Object.keys(tableValue);
								for (var j = 0; j < fieldCodes.length; j++) {
									var fieldCode = fieldCodes[j];
									var fieldValue = tableValue[fieldCode];
									reportRecord[fieldCode] = fieldValue;
								}
							}
						} finally {
							spread.resumePaint();
						}
					}
				},
				function (args) {
					//todo
				}
			);
		}
	},

	//执行单元格点击事件
	doCellClick: function (sheet, rowIndex, colIndex, value) {
		var spread = sheet.getParent();
		if (value && spread.registerCellClick) {
			var reportDataSource = sheet.getDataSource();
			if (reportDataSource == null)
				return;

			var reportEntities = reportDataSource.getSource();
			var tables = sheet.tables.all();
			var table = this.getTable(tables, rowIndex);
			var reportEntityCode;
			var reportRecord;
			if (table) {
				reportEntityCode = table.bindingPath();
				reportRecord = this.getReportRecord(reportEntities, table, rowIndex);
				if (!reportRecord) {
					return;
				}
				var id = reportRecord["id"];
				if (!id) {
					return;
				}
			} else {
				var bindingPath = sheet.getBindingPath(rowIndex, colIndex);
				if (bindingPath) {
					var names = bindingPath.split(".");
					reportEntityCode = names[0];
					reportRecord = reportEntities[reportEntityCode];
				}
			}

			value.entityName = reportEntityCode;
			value.data = reportRecord;

			spread.registerCellClick(value,
				function (args) {
					var spread = sheet.getParent();
					spread.resumePaint();
				},
				function (args) {
					var spread = sheet.getParent();
					spread.resumePaint();
				}
			);
		}
	},

	//#endregion

	//#region 选中行、增、删、改

	//根据报表实体记录，更新单元格值
	changeCellValueByReportRecord: function (cell, reportRecord) {
		var bindingPath = cell.bindingPath();
		if (bindingPath) {
			var names = bindingPath.split(".");
			if (names.length > 1) {
				var fieldCode = names[1];
				var value = reportRecord[fieldCode];
				cell.value(value);
			}
		}
	},

	//报表实体是否为空（报表实体始终有一条记录，当只有一条记录，且id为空时，代表实体为空）
	reportEntityIsEmpty: function (reportEntity) {
		var isEmpty = false;
		var firstReportRecord = reportEntity[0];
		var id = firstReportRecord["id"];
		if (id == null || id == "") {
			isEmpty = true;
		}
		return isEmpty;
	},

	//创建报表实体记录，设置主外键值、其他字段值为null
	createReportRecord: function (reportEntity, reportEntityCode, groupFieldMappings, masterRecord) {
		var srcReportRecord = reportEntity[0];
		var destReportRecord = {};
		for (var fieldCode in srcReportRecord) {
			destReportRecord[fieldCode] = null;
		}
		this.ID_FIELD_CODE = this.genUUID();
		destReportRecord["id"] = this.ID_FIELD_CODE;
		this.updateReportRecordFKValue(destReportRecord, reportEntityCode, groupFieldMappings, masterRecord);

		return destReportRecord;
	},

	genUUID:function() {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
	},

	//设置报表实体记录外键值
	updateReportRecordFKValue: function (reportRecord, reportEntityCode, groupFieldMappings, masterRecord) {
		var isGroup = this.isGroupReport(groupFieldMappings);
		if (isGroup && masterRecord != null) {
			var detailObj = groupFieldMappings.slaves[reportEntityCode];
			var detailFieldMappings = detailObj.fieldMappings;
			var detailFieldMappingObjs = Object.keys(detailFieldMappings);
			for (var i = 0; i < detailFieldMappingObjs.length; i++) {
				var masterFieldName = detailFieldMappingObjs[i];
				var detailFieldName = detailFieldMappings[masterFieldName];
				reportRecord[detailFieldName] = masterRecord[masterFieldName];
			}
		}
	},

	//创建报表实体记录集合
	createReportRecords: function (reportEntity, reportEntityCode, num, groupFieldMappings, masterRecord) {
		var result = [];
		for (var i = 0; i < num; i++) {
			var reportRecord = this.createReportRecord(reportEntity, reportEntityCode, groupFieldMappings, masterRecord);
			result.push(reportRecord);
		}
		return result;
	},

	//报表实体增加记录
	addReportRecords: function (reportEntity, reportEntityCode, index, num, isAppend, groupFieldMappings, masterRecord) {

		var isEmpty = this.reportEntityIsEmpty(reportEntity);
		var reportRecords = this.createReportRecords(reportEntity, reportEntityCode, num, groupFieldMappings, masterRecord);
		if (isEmpty) {
			reportEntity.splice(0, 1);
		}

		if (isAppend) {
			index = index + 1;
		}
		for (var i = 0; i < reportRecords.size(); i++) {
			var reportRecord = reportRecords[i];
			reportEntity.splice(index, 0, reportRecord);
			index = index + 1;
		}

		return reportRecords;
	},

	//根据报表实体，刷新sheet
	updateSheetRows: function (sheet, reportEntity, index, rowIndex, colIndex, num, isAppend) {
		var nextIndex = index + 1;
		var nextRowIndex = rowIndex + 1;
		var sheetColCount = sheet.getColumnCount();
		var selRowHeight = sheet.getRowHeight(rowIndex);
		var copyToOptions = GC.Spread.Sheets.CopyToOptions;
		var options = copyToOptions.bindingPath | copyToOptions.comment |
			copyToOptions.conditionalFormat | copyToOptions.formula |
			copyToOptions.outline | copyToOptions.span |
			copyToOptions.sparkline | copyToOptions.style | copyToOptions.tag;

		var recordCount = reportEntity.length;
		//原表格最后一条记录的行索引
		var bottomRowIndex = rowIndex + recordCount - num - index
		for (var i = 0; i < num; i++) {
			sheet.setRowHeight(bottomRowIndex + i, selRowHeight);
			sheet.copyTo(rowIndex, 0, bottomRowIndex + i, 0, 1, sheetColCount, options);
		}

		//设置新增单元格locked
		for (var i = 0; i < num; i++) {
			for (var j = 0; j < sheetColCount; j++) {
				var cell = sheet.getCell(rowIndex, j);
				var nextCell = sheet.getCell(nextRowIndex + i, j);
				nextCell.locked(cell.locked());
			}
		}

		var newIndex = index;
		var newRowIndex = rowIndex;
		if (isAppend) {
			newIndex = nextIndex;
			newRowIndex = nextRowIndex;
		}

		//清除新增单元格计算公式的值
		for (var i = 0; i < num; i++) {
			var record = reportEntity[newIndex + i];
			for (var j = 0; j < sheetColCount; j++) {
				var cell = sheet.getCell(newRowIndex + i, j);
				this.changeCellValueByReportRecord(cell, record);
			}
		}

		//选中新增行
		sheet.setSelection(newRowIndex, colIndex, 1, 1);
	},

	addRecordForSingle: function (sheet, table, index, selRowIndex, selColIndex, num, isAppend) {
		//获取报表实体集合
		var reportEntities = sheet.getDataSource().getSource();
		//分组字段映射
		var groupFieldMappings = sheet.getParent().groupFieldMappings;
		//获取主表记录
		var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
		//获取报表实体编码
		var reportEntityCode = table.bindingPath();
		//获取从表实体
		var reportEntity = reportEntities[reportEntityCode];
		//从表实体是否为空
		var isEmpty = this.reportEntityIsEmpty(reportEntity);

		//从表实体增加记录
		var changedReportRecords = this.addReportRecords(reportEntity, reportEntityCode, index, num, isAppend, groupFieldMappings, masterRecord);

		//增加行的索引
		var addRowIndex = selRowIndex + 1;
		//删除行的索引
		var deleteRowIndex = addRowIndex + num;
		if (isEmpty) {
			deleteRowIndex = deleteRowIndex - 1;
		}
		//因为数据层加了一条数据，调用addRows，会在最后增加一行数据
		sheet.addRows(addRowIndex, 1);
		//删除多增加的行
		sheet.deleteRows(deleteRowIndex, 1);

		//更新sheet行
		this.updateSheetRows(sheet, reportEntity, index, selRowIndex, selColIndex, num, isAppend);

		//同步窗体实体
		if (isAppend) {
			this.synInsertFormEntity(sheet, reportEntityCode, changedReportRecords, "AFTER");
		} else {
			this.synInsertFormEntity(sheet, reportEntityCode, changedReportRecords, "BEFORE");
		}
	},

	addRecordForLast: function (sheet, table, index, selRowIndex, selColIndex, num, isAppend) {
		//获取报表实体集合
		var reportEntities = sheet.getDataSource().getSource();
		//分组字段映射
		var groupFieldMappings = sheet.getParent().groupFieldMappings;
		//获取主表记录
		var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
		//获取报表实体编码
		var reportEntityCode = table.bindingPath();
		//获取从表实体
		var reportEntity = reportEntities[reportEntityCode];

		//从表实体增加记录
		var changedReportRecords = this.addReportRecords(reportEntity, reportEntityCode, index, num, isAppend, groupFieldMappings, masterRecord);

		//增加行的索引
		var addRowIndex = selRowIndex + 1;
		//删除行的索引
		var deleteRowIndex = addRowIndex + num;
		//因为数据层加了一条数据，调用addRows，会在最后增加一行数据
		sheet.addRows(addRowIndex, 1);
		//删除多增加的行
		sheet.deleteRows(deleteRowIndex, 1);

		//更新sheet行
		this.updateSheetRows(sheet, reportEntity, index, selRowIndex, selColIndex, num, isAppend);

		//同步窗体实体
		if (isAppend) {
			this.synInsertFormEntity(sheet, reportEntityCode, changedReportRecords, "AFTER");
		} else {
			this.synInsertFormEntity(sheet, reportEntityCode, changedReportRecords, "BEFORE");
		}
	},

	addRecordForOther: function (sheet, table, index, selRowIndex, selColIndex, num, isAppend) {
		//获取报表实体集合
		var reportEntities = sheet.getDataSource().getSource();
		//分组字段映射
		var groupFieldMappings = sheet.getParent().groupFieldMappings;
		//获取主表记录
		var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
		//获取报表实体编码
		var reportEntityCode = table.bindingPath();
		//获取从表实体
		var reportEntity = reportEntities[reportEntityCode];
		//从表实体增加记录
		var changedReportRecords = this.addReportRecords(reportEntity, reportEntityCode, index, num, isAppend, groupFieldMappings, masterRecord);

		//增加行的索引
		var addRowIndex = selRowIndex + 1;
		//删除行的索引
		var deleteRowIndex = addRowIndex;
		//增加行
		sheet.addRows(addRowIndex, 1);
		//删除多增加的行
		sheet.deleteRows(deleteRowIndex, 1);

		//更新sheet行
		this.updateSheetRows(sheet, reportEntity, index, selRowIndex, selColIndex, num, isAppend);

		//同步窗体实体
		if (isAppend) {
			this.synInsertFormEntity(sheet, reportEntityCode, changedReportRecords, "AFTER");
		} else {
			this.synInsertFormEntity(sheet, reportEntityCode, changedReportRecords, "BEFORE");
		}
	},

	/** 增加记录
	 * @param sheet 
	 * @param num 记录数
	 * @param isAppend 是否增加
	 */
	addRecord: function (sheet, num, isAppend) {
		//获取选中行索引
		var selRowIndex = this.getFirstSelectRowIndex(sheet);
		if (selRowIndex < 0)
			return;

		//获取选中列索引
		var selColIndex = sheet.getActiveColumnIndex();

		//选中行是否是表格
		var tables = sheet.tables.all();
		var table = this.getTable(tables, selRowIndex);
		if (table == null)
			return;

		var reportEntities = sheet.getDataSource().getSource();
		if (reportEntities == null)
			return;

		var isSingle = true;
		var reportEntityCode = table.bindingPath();
		var reportEntity = reportEntities[reportEntityCode];
		//是否只有一条记录
		if (reportEntity.length > 1) {
			isSingle = false;
		}

		var isLast = false;
		var index = this.getReportRecordIndex(table, selRowIndex);
		if (index == reportEntity.length - 1) {
			isLast = true;
		}

		if (isSingle) {
			this.addRecordForSingle(sheet, table, index, selRowIndex, selColIndex, num, isAppend);
		} else if (isLast) {
			this.addRecordForLast(sheet, table, index, selRowIndex, selColIndex, num, isAppend);
		} else {
			this.addRecordForOther(sheet, table, index, selRowIndex, selColIndex, num, isAppend);
		}
	},

	/** 删除记录
	 * @param sheet 
	 */
	deleteRecord: function (sheet) {
		var reportEntities = sheet.getDataSource().getSource();
		var selRanges = sheet.getSelections();
		if (selRanges.length <= 0)
			return;

		var allIds = {};
		//循环选中行
		for (var i = selRanges.length - 1; i >= 0; i--) {
			//获取选中行的行索引
			var selRowIndex = selRanges[i].row;
			//获取所有表格
			var tables = sheet.tables.all();
			//检测是否是表格行
			var table = this.getTable(tables, selRowIndex);
			if (table == null)
				continue;

			var reportEntityCode = table.bindingPath();
			var index = this.getReportRecordIndex(table, selRowIndex);
			var reportRecord = this.getReportRecord(reportEntities, table, selRowIndex);
			var id = reportRecord["id"];
			var ids = allIds[reportEntityCode];
			if (!ids) {
				ids = [];
				allIds[reportEntityCode] = ids;
			}
			ids.push(id);

			var reportEntity = reportEntities[reportEntityCode];
			if (reportEntity.length == 1) {
				this.deleteReportRecord(reportEntity, index);

				var bindingSource = new spreadNS.Bindings.CellBindingSource(reportEntities);
				sheet.setDataSource(bindingSource);
			} else {
				sheet.deleteRows(selRowIndex, 1);
			}
		}
		this.synDeleteFormEntity(sheet, allIds);
	},

	deleteReportRecord: function (reportEntity, index) {
		if (reportEntity.length == 1) {
			//删除最后一条记录
			var record = reportEntity[0];
			for (var fieldCode in record) {
				record[fieldCode] = null;
			}
			//var tableRange = table.range();
			//var rowIndex = tableRange.row;
			//sheet.setRowVisible(rowIndex, false);
		} else {
			reportEntity.splice(index, 1);
			//sheet.deleteRows(selRowIndex, 1);
		}
	},

	/** 修改记录
	 * @param sheet 
	 * @param selRowIndex 
	 * @param selColIndex 
	 * @param value 
	 */
	editRecord: function (sheet, selRowIndex, selColIndex, value) {
		var reportEntities = sheet.getDataSource().getSource();
		if (reportEntities) {
			var cell = sheet.getCell(selRowIndex, selColIndex);
			var bindingPath = cell.bindingPath();
			if (bindingPath) {
				var names = bindingPath.split(".");
				var reportEntityCode = names[0];
				this.editRecordForCommon(sheet, reportEntityCode, selRowIndex);
			} else {
				var tag = cell.tag();
				this.editRecordForCross(sheet, tag, value);
			}
		}
	},

	//修改普通报表
	editRecordForCommon: function (sheet, reportEntityCode, selRowIndex) {
		var reportEntities = sheet.getDataSource().getSource();
		var table = sheet.tables.findByName(reportEntityCode);
		if (table) {
			var tableRange = table.range();
			var tableRowIndex = tableRange.row;
			//获取行所在的表格索引
			var index = selRowIndex - tableRowIndex;
			var reportEntity = reportEntities[reportEntityCode];
			var reportRecord = reportEntity[index];
			this.synUpdateFormEntity(sheet, reportEntityCode, reportRecord);

		} else {
			var reportRecord = reportEntities[reportEntityCode];
			this.synUpdateFormEntity(sheet, reportEntityCode, reportRecord);
		}
	},

	//修改交叉报表
	editRecordForCross: function (sheet, crossData, value) {
		if (crossData && crossData.eventArgs) {
			var reportEntityCode = crossData.eventArgs.entityName;
			var reportFieldCode = crossData.eventArgs.fieldName;
			var id = crossData.eventArgs.id;
			if (id) {
				var spread = sheet.getParent();
				var formReportEntityRelas = spread.formReportEntityRelas;
				var entityRela = this.getEntityRelaByReportEntityCode(reportEntityCode, formReportEntityRelas);
				var formEntityCode = entityRela.formEntityCode;
				var formEntity = isc.JGDataSourceManager.get(this,formEntityCode);

				var formRecords = [];
				var formFieldCode = this.getFormFieldCode(reportFieldCode, entityRela);
				var formRecord = formEntity.getRecordById(id);
				formRecord.set(formFieldCode, value);
				formRecords.push(formRecord);

				formEntity.updateRecords(formRecords);

				var reportEntities = sheet.getDataSource().getSource();
				var reportEntity = reportEntities[reportEntityCode];
				for (var i = 0; i < reportEntity.size(); i++) {
					var reportRecord = reportEntity[i];
					var curId = reportRecord["id"];
					if (curId == id) {
						reportRecord[reportFieldCode] = value;
					}
				}
			}
		}
	},

	getEntityRela: function (formReportEntityRelas, entityCode, entityCodeType) {
		if (formReportEntityRelas) {
			for (var i = 0; i < formReportEntityRelas.size(); i++) {
				var entityRela = formReportEntityRelas[i];
				var reportEntityCode = entityRela.reportEntityCode;
				var formEntityCode = entityRela.formEntityCode;
				if (entityCodeType == FORM_TYPE) {
					if (entityCode == formEntityCode) {
						return entityRela;
					}
				} else {
					if (entityCode == reportEntityCode) {
						return entityRela;
					}
				}
			}
		}
		return null;
	},

	/** 根据报表实体编码获取实体映射
	 * @param reportEntityCode 报表实体编码
	 * @param formReportEntityRelas 窗体实体报表实体映射集合
	 */
	getEntityRelaByReportEntityCode: function (reportEntityCode, formReportEntityRelas) {
		return this.getEntityRela(formReportEntityRelas, reportEntityCode, REPORT_TYPE);
	},

	/** 根据窗体实体编码获取实体映射
	 * @param formEntityCode 窗体实体编码
	 * @param formReportEntityRelas 窗体实体报表实体映射集合
	 */
	getEntityRelaByFormEntityCode: function (formEntityCode, formReportEntityRelas) {
		return this.getEntityRela(formReportEntityRelas, formEntityCode, FORM_TYPE);
	},

	getEntityCode: function (formReportEntityRelas, entityCode, entityCodeType) {
		var entityRela = this.getEntityRela(formReportEntityRelas, entityCode, entityCodeType);
		if (entityRela == null)
			return null;

		var reportEntityCode = entityRela.reportEntityCode;
		var formEntityCode = entityRela.formEntityCode;
		if (entityCodeType == FORM_TYPE) {
			if (entityCode == formEntityCode) {
				return reportEntityCode;
			}
		} else {
			if (entityCode == reportEntityCode) {
				return formEntityCode;
			}
		}
	},

	/** 根据窗体实体编码，获取报表实体编码
	 * @param formEntityCode 窗体实体编码
	 * @param formReportEntityRelas 窗体实体报表实体映射集合
	 */
	getReportEntityCode: function (formEntityCode, formReportEntityRelas) {
		return this.getEntityCode(formReportEntityRelas, formEntityCode, FORM_TYPE);
	},

	/** 根据报表实体编码，获取窗体实体编码
	 * @param reportEntityCode 报表实体编码
	 * @param formReportEntityRelas 窗体实体报表实体映射集合
	 */
	getFormEntityCode: function (reportEntityCode, formReportEntityRelas) {
		return this.getEntityCode(formReportEntityRelas, reportEntityCode, REPORT_TYPE);
	},

	getFieldCode: function (fieldCode, entityRela, fieldCodeType) {
		var fieldMappings = entityRela.fieldMappings
		for (var i = 0; i < fieldMappings.size(); i++) {
			var fieldMapping = fieldMappings[i];
			var reportFieldCode = fieldMapping.reportField;
			var formFieldCode = fieldMapping.formField;
			if (fieldCodeType == FORM_TYPE) {
				if (formFieldCode == fieldCode) {
					return reportFieldCode;
				}
			} else {
				if (reportFieldCode == fieldCode) {
					return formFieldCode;
				}
			}
		}
		return null;
	},

	/** 根据窗体字段编码，实体映射，获取报表字段编码
	 * @param formFieldCode 
	 * @param entityRela
	 */
	getReportFieldCode: function (formFieldCode, entityRela) {
		return this.getFieldCode(formFieldCode, entityRela, FORM_TYPE);
	},

	/** 根据报表字段编码，实体映射，获取窗体字段编码
	 * @param reportFieldCode 
	 * @param entityRela
	 */
	getFormFieldCode: function (reportFieldCode, entityRela) {
		return this.getFieldCode(reportFieldCode, entityRela, REPORT_TYPE);
	},

	/** 给报表记录赋值
	 * @param formRecord 窗体记录
	 * @param reportRecord 报表记录
	 * @param fieldMappings 字段映射
	 */
	formRecordToReportRecord: function (formRecord, reportRecord, entityRela) {
		var changedData = formRecord.getChangedData();
		for (var reportFieldCode in reportRecord) {
			var formFieldCode = this.getFormFieldCode(reportFieldCode, entityRela);
			if (formFieldCode && changedData.hasOwnProperty(formFieldCode)) {
				reportRecord[reportFieldCode] = changedData[formFieldCode];
			}
		}
	},

	/** 给窗体记录赋值
	 * @param formRecord 窗体记录
	 * @param reportRecord 报表记录
	 * @param fieldMappings 字段映射
	 */
	reportRecordToFormRecord: function (formRecord, reportRecord, entityRela) {
		var originalData = formRecord;
		for (var formFieldCode in originalData) {
			var reportFieldCode = this.getReportFieldCode(formFieldCode, entityRela);
			if (reportFieldCode&&reportFieldCode!="id") {
				formRecord[formFieldCode]=reportRecord[reportFieldCode];
			}
		}
	},

	//#endregion

	//#region 操作窗体实体同步报表实体相关

	idExist: function (entity, id) {
		for (var i = 0; i < entity.size(); i++) {
			var record = entity[i];
			if (id == record["id"]) {
				return true;
			}
		}
		return false;
	},

	//通过分组字段映射、窗体实体和报表实体字段映射、实体记录，获取窗体实体外键值。用于获取选中的sheet
	getFKValue: function (groupFieldMapping, entityRela, formRecord) {
		var fieldMappings = groupFieldMapping.fieldMappings;
		for (var masterFieldName in fieldMappings) {
			if (masterFieldName == "id") {
				//获取主表id对应的从表外键
				var detailFieldName = fieldMappings[masterFieldName];
				var fieldList = entityRela.fieldMappings;
				for (var i = 0; i < fieldList.size(); i++) {
					var reportFieldCode = fieldList[i].reportField;
					var formFieldCode = fieldList[i].formField;
					//根据报表实体和窗体实体映射关系，获取窗体实体字段名称
					if (detailFieldName == reportFieldCode) {
						return formRecord.get(formFieldCode);
					}
				}
			}
		}

		return null;
	},

	changeCellValueByFormRecord: function (sheet, rowIndex, formRecord, entityRela) {
		var sheetColCount = sheet.getColumnCount();
		var changedData = formRecord.getChangedData();
		for (var formFieldCode in changedData) {
			var formFieldValue = changedData[formFieldCode];
			var reportFieldCode = this.getReportFieldCode(formFieldCode, entityRela);
			if (reportFieldCode) {
				for (var i = 0; i < sheetColCount; i++) {
					var cell = sheet.getCell(rowIndex, i);
					var bindingPath = cell.bindingPath();
					if (bindingPath) {
						var names = bindingPath.split(".");
						if (names.length > 1) {
							var fieldCode = names[1];
							if (reportFieldCode == fieldCode) {
								cell.value(formFieldValue);
							}
						}
					}
				}
			}
		}
	},

	createReportRecordsByFormRecords: function (reportEntity, reportEntityCode, groupFieldMappings, entityRela, masterRecord, formRecords) {
		var result = [];
		for (var i = 0; i < formRecords.size(); i++) {
			var formRecord = formRecords[i];
			var reportRecord = this.createReportRecord(reportEntity, reportEntityCode, groupFieldMappings, masterRecord);
			this.formRecordToReportRecord(formRecord, reportRecord, entityRela);
			result.push(reportRecord);
		}
		return result;
	},

	addReportRecordsByFormRecords: function (reportEntity, reportEntityCode, index, isAppend, groupFieldMappings, entityRela, masterRecord, formRecords) {
		//从表实体是否为空
		var isEmpty = this.reportEntityIsEmpty(reportEntity);
		var reportRecords = this.createReportRecordsByFormRecords(reportEntity, reportEntityCode, groupFieldMappings, entityRela, masterRecord, formRecords);
		if (isEmpty) {
			reportEntity.splice(0, 1);
		}

		if (isAppend) {
			index = index + 1;
		}
		for (var i = 0; i < reportRecords.size(); i++) {
			var reportRecord = reportRecords[i];
			reportEntity.splice(index, 0, reportRecord);
			index = index + 1;
		}

		return reportRecords;
	},

	addRecordForSingleByFormRecords: function (sheet, table, index, selRowIndex, selColIndex, formRecords, formEntityCode, isAppend) {
		var num = formRecords.size();
		//获取报表实体集合
		var reportEntities = sheet.getDataSource().getSource();
		//分组字段映射
		var groupFieldMappings = sheet.getParent().groupFieldMappings;
		//获取主表记录
		var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
		//获取报表实体编码
		var reportEntityCode = table.bindingPath();
		//获取从表实体
		var reportEntity = reportEntities[reportEntityCode];
		//获取实体映射		
		var formReportEntityRelas = sheet.getParent().formReportEntityRelas;
		var entityRela = this.getEntityRelaByFormEntityCode(formEntityCode, formReportEntityRelas);
		//从表实体是否为空
		var isEmpty = this.reportEntityIsEmpty(reportEntity);

		//报表实体增加记录
		this.addReportRecordsByFormRecords(reportEntity, reportEntityCode, index, isAppend, groupFieldMappings, entityRela, masterRecord, formRecords);

		//增加行的索引
		var addRowIndex = selRowIndex + 1;
		//删除行的索引
		var deleteRowIndex = addRowIndex + num;
		if (isEmpty) {
			deleteRowIndex = deleteRowIndex - 1;
		}
		//因为数据层加了一条数据，调用addRows，会在最后增加一行数据
		sheet.addRows(addRowIndex, 1);
		//删除多增加的行
		sheet.deleteRows(deleteRowIndex, 1);

		//更新sheet行
		this.updateSheetRows(sheet, reportEntity, index, selRowIndex, selColIndex, num, isAppend);
	},

	addRecordForLastByFormRecords: function (sheet, table, index, selRowIndex, selColIndex, formRecords, formEntityCode, isAppend) {
		var num = formRecords.size();
		//获取报表实体集合
		var reportEntities = sheet.getDataSource().getSource();
		//分组字段映射
		var groupFieldMappings = sheet.getParent().groupFieldMappings;
		//获取主表记录
		var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
		//获取报表实体编码
		var reportEntityCode = table.bindingPath();
		//获取从表实体
		var reportEntity = reportEntities[reportEntityCode];
		//获取实体映射		
		var formReportEntityRelas = sheet.getParent().formReportEntityRelas;
		var entityRela = this.getEntityRelaByFormEntityCode(formEntityCode, formReportEntityRelas);

		//报表实体增加记录
		this.addReportRecordsByFormRecords(reportEntity, reportEntityCode, index, isAppend, groupFieldMappings, entityRela, masterRecord, formRecords);

		//增加行的索引
		var addRowIndex = selRowIndex + 1;
		//删除行的索引
		var deleteRowIndex = addRowIndex + num;
		//因为数据层加了一条数据，调用addRows，会在最后增加一行数据
		sheet.addRows(addRowIndex, 1);
		//删除多增加的行
		sheet.deleteRows(deleteRowIndex, 1);

		//更新sheet行
		this.updateSheetRows(sheet, reportEntity, index, selRowIndex, selColIndex, num, isAppend);
	},

	addRecordForOtherByFormRecords: function (sheet, table, index, selRowIndex, selColIndex, formRecords, formEntityCode, isAppend) {
		var num = formRecords.size();
		//获取报表实体集合
		var reportEntities = sheet.getDataSource().getSource();
		//分组字段映射
		var groupFieldMappings = sheet.getParent().groupFieldMappings;
		//获取主表记录
		var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
		//获取报表实体编码
		var reportEntityCode = table.bindingPath();
		//获取从表实体
		var reportEntity = reportEntities[reportEntityCode];
		//获取实体映射		
		var formReportEntityRelas = sheet.getParent().formReportEntityRelas;
		var entityRela = this.getEntityRelaByFormEntityCode(formEntityCode, formReportEntityRelas);

		//报表实体增加记录
		this.addReportRecordsByFormRecords(reportEntity, reportEntityCode, index, isAppend, groupFieldMappings, entityRela, masterRecord, formRecords);

		//增加行的索引
		var addRowIndex = selRowIndex + 1;
		//删除行的索引
		var deleteRowIndex = addRowIndex;
		//增加行
		sheet.addRows(addRowIndex, 1);
		//删除多增加的行
		sheet.deleteRows(deleteRowIndex, 1);

		//更新sheet行
		this.updateSheetRows(sheet, reportEntity, index, selRowIndex, selColIndex, num, isAppend);
	},

	addRecordByFormRecords: function (sheet, table, currentId, formRecords, formEntityCode, isAppend) {
		var selColIndex = sheet.getActiveColumnIndex();
		var reportEntities = sheet.getDataSource().getSource();
		var selRowIndex = this.getRowIndex(reportEntities, table, currentId);

		var reportEntityCode = table.bindingPath();
		var reportEntity = reportEntities[reportEntityCode];

		//是否只有一条记录
		var isSingle = true;
		if (reportEntity.length > 1) {
			isSingle = false;
		}

		//是否最后一条记录
		var isLast = false;
		var index = this.getReportRecordIndex(table, selRowIndex);
		if (index == reportEntity.length - 1) {
			isLast = true;
		}

		if (isSingle) {
			this.addRecordForSingleByFormRecords(sheet, table, index, selRowIndex, selColIndex, formRecords, formEntityCode, isAppend);
		} else if (isLast) {
			this.addRecordForLastByFormRecords(sheet, table, index, selRowIndex, selColIndex, formRecords, formEntityCode, isAppend);
		} else {
			this.addRecordForOtherByFormRecords(sheet, table, index, selRowIndex, selColIndex, formRecords, formEntityCode, isAppend);
		}
	},

	synInsertDataSource: function (params, registId) {
		var spread = this.getSpread();
		if (!spread)
			return;

		spread.suspendPaint();
		try {
			var position = params.position;
			var currentId = params.datasource.currentId;
			var resultSet = params.resultSet;
			var formEntityCode = resultSet.metadata.getDatasourceName();
			var currentKey = this.id + "_" + formEntityCode;
			var currentId = cacheRegistedObjs[currentKey];
			if (registId != currentId) {
				return;
			}

			var datas = resultSet.datas;
			var datasLength = datas.length;
			var firstFormRecord = datas[0];

			var formReportEntityRelas = spread.formReportEntityRelas;
			var entityRela = this.getEntityRelaByFormEntityCode(formEntityCode, formReportEntityRelas);
			var reportEntityCode = entityRela.reportEntityCode;

			var fkValue = null;
			var groupFieldMappings = spread.groupFieldMappings;
			var groupFieldMapping = groupFieldMappings.slaves[reportEntityCode];
			var isGroup = this.isGroupReport(groupFieldMappings);
			if (isGroup) {
				fkValue = this.getFKValue(groupFieldMapping, entityRela, firstFormRecord);
			}

			var sheets = spread.sheets;
			for (var i = 0; i < sheets.size(); i++) {
				var sheet = sheets[i];
				var table = sheet.tables.findByName(reportEntityCode);
				if (!table) {
					continue;
				}

				var reportDataSource = sheet.getDataSource();
				if (reportDataSource) {
					var reportEntities = reportDataSource.getSource();
					if (isGroup) {
						var masterRecord = this.getMasterRecord(reportEntities, groupFieldMappings);
						if (masterRecord["id"] != fkValue) {
							continue;
						}
					} else {
						//非分组或主从报表，从表数据加在首个sheet上
						if (i > 0) {
							continue;
						}
					}

					var reportEntity = reportEntities[reportEntityCode];
					var isAppend = true;
					var selectId = currentId;
					if (position == "BEFORE") {
						isAppend = false;
					} else if (position == "TOP") {
						isAppend = false;
						selectId = reportEntity[0]["id"];
					} else if (position == "BOTTOM") {
						isAppend = true;
						selectId = reportEntity[reportEntity.length - 1]["id"];
					}

					var formRecords = [];

					for (var j = 0; j < datasLength; j++) {
						var formRecord = datas[j];
						var id = formRecord.get("id");
						var isExist = this.idExist(reportEntity, id);
						if (isExist) {
							continue;
						}
						formRecords.push(formRecord);
					}

					this.addRecordByFormRecords(sheet, table, selectId, formRecords, formEntityCode, isAppend);
				}
			}
		} finally {
			spread.resumePaint();
		}
	},

	synUpdateDataSource: function (params, registId) {
		var spread = this.getSpread();
		if (!spread)
			return;

		spread.suspendPaint();
		try {
			var resultSet = params.resultSet;
			var formEntityCode = resultSet.metadata.getDatasourceName();
			var currentKey = this.id + "_" + formEntityCode;
			var currentId = cacheRegistedObjs[currentKey];
			if (registId != currentId) {
				return;
			}

			var formReportEntityRelas = spread.formReportEntityRelas;
			var entityRela = this.getEntityRelaByFormEntityCode(formEntityCode, formReportEntityRelas);
			var reportEntityCode = entityRela.reportEntityCode;

			var crossCellIndexMappings = spread.crossCellIndexMappings;
			var isCross = this.isCrossReport(reportEntityCode, crossCellIndexMappings);
			if (false == isCross) {
				this.synUpdateDataSourceForCommon(params, spread, entityRela);
			} else {
				this.synUpdateDataSourceForCross(params, spread, entityRela, crossCellIndexMappings);
			}

		} finally {
			spread.resumePaint();
		}
	},

	isCrossReport: function (reportEntityCode, allCrossCellIndexMappings) {
		if (allCrossCellIndexMappings) {
			var entity = allCrossCellIndexMappings[reportEntityCode];
			if (entity) {
				return true;
			}
		}
		return false;
	},

	synUpdateDataSourceForCommon: function (params, spread, entityRela) {
		var reportEntityCode = entityRela.reportEntityCode;
		var sheets = spread.sheets;
		var resultSet = params.resultSet;
		var iterator = resultSet.iterator();
		while (iterator.hasNext()) {
			var formRecord = iterator.next();
			var originalData = formRecord.getOriginalData();
			var id = originalData["id"];
			for (var i = 0; i < sheets.size(); i++) {
				sheet = sheets[i];
				var reportDataSource = sheet.getDataSource();
				if (reportDataSource) {
					var reportEntities = reportDataSource.getSource();
					var reportEntity = reportEntities[reportEntityCode];
					var table = sheet.tables.findByName(reportEntityCode);
					if (table) {
						var tableRange = table.range();
						var tableRowIndex = tableRange.row;
						for (var j = 0; j < reportEntity.size(); j++) {
							var reportRecord = reportEntity[j];
							if (id == reportRecord["id"]) {
								var index = tableRowIndex + j;
								this.changeCellValueByFormRecord(sheet, index, formRecord, entityRela);
								this.formRecordToReportRecord(formRecord, reportRecord, entityRela);
								break;
							}
						}
					} else {
						var reportRecord = reportEntity;
						if (id == reportRecord["id"]) {
							this.formRecordToReportRecord(formRecord, reportRecord, entityRela);
							break;
						}
					}
				}
			}
		}
	},

	synUpdateDataSourceForCross: function (params, spread, entityRela, allCrossCellIndexMappings) {
		var reportEntityCode = entityRela.reportEntityCode;
		var sheets = spread.sheets;
		var resultSet = params.resultSet;
		var iterator = resultSet.iterator();
		while (iterator.hasNext()) {
			var formRecord = iterator.next();
			var originalData = formRecord.getOriginalData();
			var id = originalData["id"];
			var crossCellIndexMappings = allCrossCellIndexMappings[reportEntityCode];
			if (crossCellIndexMappings != null) {
				var cellIndexMapping = crossCellIndexMappings[id];
				if (cellIndexMapping != null) {
					var changedData = formRecord.getChangedData();
					for (var formFieldCode in changedData) {
						var formFieldValue = changedData[formFieldCode];
						var reportFieldCode = getReportFieldCode(formFieldCode, entityRela);
						for (var i = 0; i < cellIndexMapping.size(); i++) {
							var cellIndexItem = cellIndexMapping[i];
							var sheetIndex = cellIndexItem["sheetIndex"];
							var rowIndex = cellIndexItem["rowIndex"];
							var colIndex = cellIndexItem["colIndex"];
							var sheet = sheets[sheetIndex];
							var cell = sheet.getCell(rowIndex, colIndex);
							var tag = sheet.getTag(rowIndex, colIndex);
							var fieldCode = tag.eventArgs.fieldName;
							if (fieldCode == reportFieldCode) {
								cell.value(formFieldValue);

								var reportEntities = sheet.getDataSource().getSource();
								var reportEntity = reportEntities[reportEntityCode];
								for (var j = 0; j < reportEntity.size(); j++) {
									var reportRecord = reportEntity[j];
									var curId = reportRecord["id"];
									if (curId == id) {
										reportRecord[reportFieldCode] = formFieldValue;
									}
								}
							}
						}
					}
				}
			}
		}
	},

	synDeleteDataSource: function (params, registId) {
		var spread = this.getSpread();
		if (!spread)
			return;

		spread.suspendPaint();
		try {
			var resultSet = params.resultSet;
			var formEntityCode = resultSet.metadata.getDatasourceName();
			var currentKey = this.id + "_" + formEntityCode;
			var currentId = cacheRegistedObjs[currentKey];
			if (registId != currentId) {
				return;
			}

			var sheets = spread.sheets;
			var formReportEntityRelas = spread.formReportEntityRelas;
			var entityRela = this.getEntityRelaByFormEntityCode(formEntityCode, formReportEntityRelas);
			var reportEntityCode = entityRela.reportEntityCode;

			var iterator = resultSet.iterator();
			while (iterator.hasNext()) {
				var formRecord = iterator.next();
				var originalData = formRecord.getOriginalData();
				var id = originalData["id"];
				for (var i = 0; i < sheets.size(); i++) {
					sheet = sheets[i];
					var reportDataSource = sheet.getDataSource();
					if (reportDataSource) {
						var reportEntities = reportDataSource.getSource();
						var reportEntity = reportEntities[reportEntityCode];
						if (reportEntity instanceof Array) {
							var size = reportEntity.size();
							for (var j = size - 1; j >= 0; j--) {
								var reportRecord = reportEntity[j];
								if (id == reportRecord["id"]) {
									//删除一条记录
									this.deleteReportRecord(reportEntity, j);

									var bindingSource = new spreadNS.Bindings.CellBindingSource(reportEntities);
									sheet.setDataSource(bindingSource);

									break;
								}
							}
						}
					}
				}
			}
		} finally {
			spread.resumePaint();
		}
	},

	synSelectDataSource: function (params, registId) {
		var spread = this.getSpread();
		if (!spread)
			return;

		spread.suspendPaint();
		try {
			if (params.isSelect) {
				var resultSet = params.resultSet;
				var formEntityCode = resultSet.metadata.getDatasourceName();
				var currentKey = this.id + "_" + formEntityCode;
				var currentId = cacheRegistedObjs[currentKey];
				if (registId != currentId) {
					return;
				}

				var formReportEntityRelas = spread.formReportEntityRelas;
				var reportEntityCode = this.getReportEntityCode(formEntityCode, formReportEntityRelas);

				var selectedIds = params.datasource.selectIds;
				var selectedId = selectedIds[0];

				var sheets = spread.sheets;
				for (var i = 0; i < sheets.size(); i++) {
					sheet = sheets[i];
					var table = sheet.tables.findByName(reportEntityCode);
					if (table == null)
						break;

					var tableRange = table.range();
					var tableRowIndex = tableRange.row;

					var selColIndex = sheet.getActiveColumnIndex();
					var reportEntities = sheet.getDataSource().getSource();
					var reportEntity = reportEntities[reportEntityCode];
					if (reportEntity instanceof Array) {
						for (var j = 0; j < reportEntity.size(); j++) {
							var reportRecord = reportEntity[j];
							if (reportRecord["id"] == selectedId) {
								var rowIndex = tableRowIndex + j;
								sheet.setSelection(rowIndex, selColIndex, 1, 1);
							}
						}
					}
				}
			}
		} finally {
			spread.resumePaint();
		}
	},

	//#endregion

	//#region 操作报表实体同步窗体实体相关

	synInsertFormEntity: function (sheet, reportEntityCode, reportRecords, position) {
		var spread = sheet.getParent();
		var formReportEntityRelas = spread.formReportEntityRelas;
		var entityRela = this.getEntityRelaByReportEntityCode(reportEntityCode, formReportEntityRelas);
		var formEntityCode = entityRela.formEntityCode;

		var formEntity =isc.JGDataSourceManager.get(this,formEntityCode);

		var formRecords = [];
		for (var i = 0; i < reportRecords.size(); i++) {
			var formRecord = formEntity.createRecord();
			var reportRecord = reportRecords[i];
			this.reportRecordToFormRecord(formRecord, reportRecord, entityRela);
			formRecord.id=this.ID_FIELD_CODE;
			formRecords.push(formRecord);
		}
        
		formEntity.insertRecords(formRecords,position);
	},

	synUpdateFormEntity: function (sheet, reportEntityCode, reportRecord) {
		var spread = sheet.getParent();
		var formReportEntityRelas = spread.formReportEntityRelas;
		var entityRela = this.getEntityRelaByReportEntityCode(reportEntityCode, formReportEntityRelas);
		var formEntityCode = entityRela.formEntityCode;
		var formEntity = isc.JGDataSourceManager.get(this,formEntityCode);

		var formRecords = [];
		var id = reportRecord["id"];
		var formRecord = formEntity.getRecordById(id);
		formRecord = JSON.parse(JSON.stringify(formRecord));
		this.reportRecordToFormRecord(formRecord, reportRecord, entityRela);
		formRecords.push(formRecord);

		formEntity.updateRecords(formRecords);
	},

	synDeleteFormEntity: function (sheet, allIds) {
		var spread = sheet.getParent();
		var formReportEntityRelas = spread.formReportEntityRelas;
		for (var reportEntityCode in allIds) {
			var entityRela = this.getEntityRelaByReportEntityCode(reportEntityCode, formReportEntityRelas);
			var formEntityCode = entityRela.formEntityCode;
			var formEntity =isc.JGDataSourceManager.get(this,formEntityCode);

			var ids = allIds[reportEntityCode];
			formEntity.removeRecordByIds(ids);
		}
	},

	synSelectFormEntity: function (sheet, reportEntities, tables, selRowIndex, selColIndex) {
		var spread = sheet.getParent();
		var formReportEntityRelas = spread.formReportEntityRelas;

		var tag = sheet.getTag(selRowIndex, selColIndex);
		if (tag && tag.eventArgs && tag.eventArgs != "") {
			var eventArgs = tag.eventArgs;
			var reportEntityCode = eventArgs["entityName"];
			var id = eventArgs["id"];
			if (id) {
				this.synSelectFormRecord(reportEntityCode, formReportEntityRelas, id);
			}
		} else {
			var table = this.getTable(tables, selRowIndex);
			if (table) {
				var reportEntityCode = table.bindingPath();
				var index = this.getReportRecordIndex(table, selRowIndex);
				if (index < 0)
					return;

				var reportEntity = reportEntities[reportEntityCode];
				var reportRecord = reportEntity[index];
				if (reportRecord) {
					var id = reportRecord["id"];
					if (id) {
						this.synSelectFormRecord(reportEntityCode, formReportEntityRelas, id);
					}
				}
			} else {
				var cell = sheet.getCell(selRowIndex, selColIndex);
				var bindingPath = cell.bindingPath();
				if (bindingPath) {
					var names = bindingPath.split(".");
					if (names.length > 1) {
						var reportEntityCode = names[0];
						var reportRecord = reportEntities[reportEntityCode];
						if (reportRecord) {
							var id = reportRecord["id"];
							if (id) {
								this.synSelectFormRecord(reportEntityCode, formReportEntityRelas, id);
							}
						}
					}
				}
			}
		}
	},

	synSelectFormRecord: function (reportEntityCode, formReportEntityRelas, id) {
		var entityRela = this.getEntityRelaByReportEntityCode(reportEntityCode, formReportEntityRelas);
		var formEntityCode = entityRela.formEntityCode;
		var formEntity = isc.JGDataSourceManager.get(this,formEntityCode);

		if (formEntity) {
			var formRecord = formEntity.getRecordById(id);
			try {
				formEntity.selectRecords([formRecord],true);
			} catch (ex) {

			}
		}
	},

	V3Show: function (widgetId) {
		return this.setVisible(true);
	},

	V3Hide: function (widgetId) {
		return this.setVisible(false);
	},

	disabled: function (widgetId) {
		return this.setEnabled(false);
	},

	enabled: function (widgetId) {
		return this.setEnabled(true);
	},

	getEnabled: function (widgetId) {
		return !this.isDisabled();
	},

	getVisible: function (widgetId) {
		return this.isVisible();
	},

	getReadOnly: function (widgetId) {

		return this.isReadOnly();
	},

	getReportSelect: function (widgetId) {

		return this.ReportSelector;
	},

	/** 浏览
	 * @param widgetId 报表控件ID
	 * @param data 报表数据
	 */
	tooneReport: function (data, isInput) {
		this.innerTooneReport(data, isInput);
	},

	/** 填报
	 * @param widgetId 报表控件ID
	 * @param data 报表数据
	 */
	tooneReportInput: function (data, isInput) {
		this.innerTooneReport(data, isInput);
	},

	/** 设置打印数据(html)
	 * @param widgetId 
	 * @param htmlData 
	 */
	tooneReportHtmlData: function (htmlData) {
		this.htmlData = htmlData;
	},

	/** 注册报表事件
	 * @param widgetId 
	 * @param eventCode 
	 * @param callback 
	 */
	registReportEvent: function (eventCode, callback) {
		if (eventCode == "HyperLinkOnClick") {
			this.registerHyperLinkOnClick = callback;
		} else if (eventCode == "SaveOnClick") {
			this.registerSaveOnClick = callback;
		} else if (eventCode == "CellClick") {
			this.registerCellClick = callback;
		}
	},
	setScrollbarVisible: function (sheet) {
		// var spread = sheet.getParent();
		// var bottomRowNum = sheet.getViewportBottomRow(1) + 1;
		// var rightColNum = sheet.getViewportRightColumn(1) + 1;

		// var colCount = sheet.getColumnCount();
		// var rowCount = sheet.getRowCount();
		// if (rightColNum < colCount) {
		// 	spread.options.showHorizontalScrollbar = true;
		// } else {
		// 	spread.options.showHorizontalScrollbar = false;
		// }
		// if (bottomRowNum < rowCount) {
		// 	spread.options.showVerticalScrollbar = true;
		// } else {
		// 	spread.options.showVerticalScrollbar = false;
		// }
	},
	windowLoaded: function () {
		var _this=this;
		var rptCode = this.ReportCode;
		if (rptCode && rptCode != "") {
			var componentCode = this.componentCode;
			var windowCode = this.windowCode;
			rptCode = windowCode + "." + rptCode;
			var params = {
				"isAsyn": true,
				"componentCode": componentCode,
				"windowCode": windowCode,
				ruleSetCode: "GetReportEvents",
				isRuleSetCode: false,
				commitParams: [{
					"paramName": "rptCode",
					"paramType": "char",
					"paramValue": rptCode
				}],
				afterResponse: function (result) {
					var success = result["success"];
					if (success == true) {
						var data = result["data"];
						var reportEvents = data.reportEvents;
						if (reportEvents) {
							for (var i = 0; i < reportEvents.size(); i++) {
								var reportEvent = reportEvents[i];
								var eventType = reportEvent.eventType;
								if ("reportOnLoad" == eventType) {
									var eventCode = reportEvent.eventCode;
									_this.executeWindowRoute({
										"ruleSetCode": eventCode,
										"args": null,
										"success": function (args) { },
										"fail": function (args) {
											alert("执行方法 " + eventCode + " 失败。" + args);
										}
									});
								}
							}
						}
					}
				}
			}
			this.remoteMethodAccessor(params);
		}
	},

	getV3MethodMap: function () {
		return {
			setToolStripItemsForTooneReport: "setV3ToolStripItemsForTooneReport",
			show: "V3Show",
			hide: "V3Hide",
			draw: "getV3draw"

		}
	},


	showFrmSelectPrinter : function (printer, cfg, offset, printType) {
		var _this=this;
		var html = this.createFrmSelectPrinter();
		this._createModal({
			title: "选择打印机",
			width: 400,
			height: 260,
			rendered: function (containerCode, closeFunc, setTitleFunc) {
				$("#" + containerCode).html(html);

				var srcPrinterName = cfg["printerName"];
				var srcPrintNum = cfg["printNum"];
				_this.getAllPrinter(printer, srcPrinterName, srcPrintNum);

				$("#btnOK").click(function () {
					var selPrinterName = $("#cmbPrinterName").val();
					var selPrintNumVal = $("#txtPrintNum").val();
					var selPrintNum = _this.getPrintNum(selPrintNumVal);
					if (selPrintNum > 0) {
						// 打印机名称
						cfg["printerName"] = selPrinterName;
						// 打印份数
						cfg["printNum"] = selPrintNum;
						//执行打印
						_this.executePrint(printer, cfg, offset, "print");
						//关闭页面
						closeFunc();
					} else {
						alert("请输入大于0的整数。");
					}
				});

				$("#btnCancel").click(function () {
					closeFunc();
				});
			},
			closed: function (containerCode, closeHandle) {
				closeHandle();
			},
			resized: function (containerCode) {

			},
			formBorderStyle: "FixedSingle",
			maximizeBox: false,
			windowState: "Normal"
		})
	},

	createFrmSelectPrinter : function () {
		var html =
			"<style>" +
			"body{padding:0;margin:0}" +
			".m-printModel {font-size:12px;}" +
			".m-printModel ul{padding:24px;list-style:none;}" +
			".m-printModel ul li{margin-bottom:16px;}" +
			".m-printModel ul li:after{content:'';clear:both;display:table}" +
			".m-printModel ul li label{text-align: right;vertical-align: middle;float: left;font-size: 12px;color: #515a6e;line-height: 32px;padding: 0 8px 0  0;box-sizing: border-box;color: #0a0a0a;width:90px;}" +
			".m-printModel .m-inputs {box-sizing:border-box;width:240px;height:32px;line-height:1.5;padding:4px 7px;color: #515a6e;background:#fff;border:1px solid #ddd;border-radius:4px;transition: border .2s ease-in-out,background .2s ease-in-out,box-shadow .2s ease-in-out;}" +
			".m-printModel .m-inputs:hover {border-color: #57a3f3;}" +
			".m-printModel .m-inputs:focus {border-color: #57a3f3;outline: 0;box-shadow: 0 0 0 2px rgba(45,140,240,.2);}" +
			".m-printModel .formItem {float:left;line-height:32px;font-weight:bold;}" +
			".m-printModel-toolBar {padding:16px;border-top:1px solid #eee;text-align:right;}" +
			".m-printModel-toolBar .modalBtn {display: inline-block;margin-left:4px;padding:5px 15px 6px;font-size:12px;text-align: center;border: 1px solid transparent;border-radius:4px;cursor:pointer;user-select:none;transition: color .2s linear,background-color .2s linear,border .2s linear,box-shadow .2s linear;text-decoration:none;}" +
			".m-printModel-toolBar .modalBtn:focus {box-shadow: 0 0 0 2px rgba(45,140,240,.2);}" +
			".m-printModel-toolBar .modalBtn-primary{color:#fff;background-color: #2d8cf0;border-color: #2d8cf0;}" +
			".m-printModel-toolBar .modalBtn-primary:hover{background-color: #57a3f3;border-color: #57a3f3;}" +
			".m-printModel-toolBar .modalBtn-default{color: #515a6e;background:#fff;border-color:#dcdee2;}" +
			".m-printModel-toolBar .modalBtn-default:hover{color:#2d8cf0;border-color:#2d8cf0;}" +
			"</style>" +

			"<div class=\"m-printModel\">" +
			"<ul>" +
			"<li>" +
			"<label>目标打印机：</label>" +
			"<div class=\"formItem\">" +
			"<select id=\"cmbPrinterName\" class=\"m-inputs\"></select>" +
			"</div>" +
			"</li>" +
			"<li>" +
			"<label>打印份数：</label>" +
			"<div class=\"formItem\">" +
			"<input type=\"text\" id=\"txtPrintNum\" class=\"formItem m-inputs\" value=\"1\">" +
			"</div>" +
			"</li>" +
			"<li>" +
			"<label id=\"lblMsg\"></label>" +
			"</li>" +
			"</ul>" +
			"<div class=\"m-printModel-toolBar\">" +
			"<a href=\"#\" id=\"btnCancel\" class=\"modalBtn modalBtn-default\">取消</a>" +
			"<a href=\"#\" id=\"btnOK\" class=\"modalBtn modalBtn-primary\">确定</a>" +
			"</div>" +
			"</div>"
		return html;
	},

	getAllPrinter : function (printer, srcPrinterName, srcPrintNum) {
		var isExist = false;
		var iPrinterCount = printer.GET_PRINTER_COUNT();
		for (var i = 0; i < iPrinterCount; i++) {
			var option = document.createElement('option');
			var printName = printer.GET_PRINTER_NAME(i);
			if (printName == srcPrinterName) {
				isExist = true;
			}
			option.innerHTML = printName;
			option.value = printName;
			document.getElementById('cmbPrinterName').appendChild(option);
		};

		if (isExist) {
			$("#cmbPrinterName").val(srcPrinterName);
		}

		var val = this.getPrintNum(srcPrintNum);
		if (val > 0) {
			$("#txtPrintNum").val(srcPrintNum);
		} else {
			$("#txtPrintNum").val(1);
		}
	},

	getPrintNum : function (printNumVal) {
		var val = -1;
		var r = /^\+?[1-9][0-9]*$/;
		var flag = r.test(printNumVal);
		if (flag) {
			var printNum = Number(printNumVal);
			if (printNum > 0) {
				val = printNum;
			}
		}
		return val;
	},

	// 准备打印
	doPrint : function (cfg, offset, printType) {
		var _this=this;
		if (offset == null) {
			offset = {}
			offset.offsetLeft = 0;
			offset.offsetTop = 0;
		}
		var service = cfg["serviceHost"];
		var isService = true;
		if (service == '' || service === undefined) {
			isService = false;
		}

		var serviceHost = _this.getServiceHost(cfg);
		var result = _this.checkServiceHost(serviceHost);
		if (!result) {
			var params = {};
			params.title = "打印服务地址检查";
			params.msgHeader = "";
			params.msg = "打印服务地址是非法的URL，请检查！";
			frontEndAlerter.error(params);

			return;
		}

		var printer = null;
		//最大重试次数
		var maxTryTimes = 300;
		//当前重试次数
		var curTryTimes = 0;
		//timer轮询
		var printerTimer = self.setInterval(function () {
			if (printer != null) {
				window.clearInterval(printerTimer);
				//注册许可证信息
				_this.registerLicenses(printer);
				if (printType == "selectPrint") {
					//选择打印机
					_this.showFrmSelectPrinter(printer, cfg, offset, printType);
				} else {
					//执行打印
					_this.executePrint(printer, cfg, offset, printType);
				}
			} else {
				if (curTryTimes > maxTryTimes) {
					window.clearInterval(printerTimer);
				}
				curTryTimes++;
			}
		}, 100)

		// 组装打印服务地址, 加载CLodopfuncs.js 
		var lodopFuncsUrl = serviceHost + "CLodopfuncs.js";
		head.js(lodopFuncsUrl, function () {
			if (typeof LODOP === "undefined" || !LODOP || !LODOP.VERSION) {
				if (!isService) {
					lodopFuncsUrl = "http://localhost:18000/CLodopfuncs.js";
					head.js(lodopFuncsUrl, function () {
						if (typeof LODOP === "undefined" || !LODOP || !LODOP.VERSION) {
							_this.showPrinterInstallTips(serviceHost);
						} else {
							var isSucess = _this.checkLodopVersion(LODOP);
							if (false == isSucess) {
								_this.showPrinterUpdateTips(serviceHost);
							} else {
								printer = LODOP;
							}
						}
					});
				} else {
					_this.showPrinterInstallTips(serviceHost);
				}
			} else {
				var isSucess = _this.checkLodopVersion(LODOP);
				if (false == isSucess) {
					_this.showPrinterUpdateTips(serviceHost);
				} else {
					printer = LODOP;
				}
			}
		});
	},

	// 获取打印服务地址
	getServiceHost : function (cfg) {
		var serviceHost = cfg["serviceHost"];
		if (serviceHost == '' || serviceHost === undefined) {
			serviceHost = "http://localhost:8000/";
		}
		//开头补全http://
		if (serviceHost.indexOf("http://") < 0) {
			serviceHost = "http://" + serviceHost;
		}
		//结尾补全/
		var str = serviceHost.charAt(serviceHost.length - 1);
		if (str != "/") {
			serviceHost = serviceHost + "/";
		}
		cfg["serviceHost"] = serviceHost;
		return serviceHost;
	},

	// 校验打印服务地址是否有效
	checkServiceHost : function (url) {
		var result = false;
		var strRegex = "^((https|http|ftp|rtsp|mms)?://)" +
			"?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
			+
			"(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
			+
			"|" // 允许IP和DOMAIN（域名）
			+
			"([0-9a-z_!~*'()-]+\.)*" // 域名- www.
			+
			"([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
			+
			"[a-z]{2,6})" // first level domain- .com or .museum
			+
			"(:[0-9]{1,4})?" // 端口- :80
			+
			"((/?)|" // a slash isn't required if there is no file name
			+
			"(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
		var regExp = new RegExp(strRegex);
		if (regExp.test(url)) {
			result = true;
		}

		return result;
	},

	// 检查版本是否大于6.2.2.1， 提示用户升级打印插件
	// 检查LODOP.CVERSION版本是否大于4.1.4.2， 提示用户升级打印插件。为了解决Chrome浏览器94版跨域问题
	checkLodopVersion : function (LODOP) {
		var version = LODOP.CVERSION;
		if (version) {
			var srcItems = version.split(".");
			var destItems = "4.1.4.2".split(".");
			for (var i = 0; i < srcItems.length; i++) {
				var srcItem = srcItems[i];
				var destItem = "0";
				if (i < destItems.length) {
					destItem = destItems[i]
				}

				var srcValue = parseInt(srcItem);
				var destValue = parseInt(destItem);
				if (srcValue < destValue) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	},

	// 注册许可证信息
	registerLicenses : function (printer) {
		printer.SET_LICENSES("同望科技股份有限公司", "227D7CB7AB0D5C4BECD8D05CDF543847", "同望科技股份有限公司", "C5E74B2EF91B7F622D4FB3966183E7CA");
		printer.SET_LICENSES("THIRD LICENSE", "", "TOONE TECHNOLOGY Co.,LTD.", "0988934F7AD14981887653ECC0FB78D2");
	},

	// 打印提示信息
	showPrinterAlertTips : function (serviceHost, title, btnTitle) {
		if (!serviceHost)
			serviceHost = "";

		var obj = $("#divV3PrinterAlertTips");
		if (obj.length > 0) {
			obj.remove();
		}
		var tips = $('<div id="divV3PrinterAlertTips" style="z-index:99999999;position:fixed;top:0;left:0;right:0;height:38px;line-height:38px;padding:0 16px;background:#e6f7ff;font-size:14px;">' +
			'<span style="color:#333;font-size:inherit;">' + serviceHost + "  " + title + '</span>' +
			'<a href="itop/common/CLodop_Setup_for_Win32NT.exe" style="display:inline-block;font-size:inherit;border:1px solid #0079fe;border-radius:4px;background:#fff;color:#0079fe;text-decoration:none;line-height:28px;padding:0 8px;">' + btnTitle + '</a>' +
			'</div>');
		var tipsCloser = $('<div style="position:absolute;right:10px;font-family:微软雅黑;font-size:14px;vertical-align:middle;top:0px;font-weight:bold;color:#0079fe;cursor:pointer;width:30px;text-align:center;">X</div>');
		tipsCloser.click(function () {
			tips.remove();
		});
		tips.append(tipsCloser);
		$('body').append(tips);
	},

	// 提示用户安装启动打印插件
	showPrinterInstallTips : function (serviceHost) {
		this.showPrinterAlertTips(serviceHost, "打印服务未安装启动，使用管理员权限执行安装，安装后请重启浏览器。", "立即安装");
	},

	// 提示用户升级打印插件
	showPrinterUpdateTips : function (serviceHost) {
		this.showPrinterAlertTips(serviceHost, "打印服务需要升级，使用管理员权限执行升级，升级后请重启浏览器。", "立即升级");
	},

	// 执行打印
	executePrint : function (printer, cfg, offset, printType) {
		var _this=this;
		// 服务器类型
		var serverHostType = cfg["serverHostType"];
		// 打印机名称
		var printerName = cfg["printerName"];
		// 左偏移量
		var offsetLeft = offset["offsetLeft"];
		// 上偏移量
		var offsetTop = offset["offsetTop"];
		// 打印份数
		var printNum = Number(cfg["printNum"]);
		// 获取打印机序号
		var printerIndex =this.getPrinterIndex(printer, printerName);
		// 获取打印极所有纸张
		var printerPapers = this.getPrinterPapers(printer, printerName);
		// 打印数据源
		var datasource = cfg["datasource"];
		// 打印比例
		var zoomScale = 100;
		var map = {};
		for (var i = 0; i < datasource.length; i++) {
			// 获取报表数据
			var objs = datasource[i];
			var obj = JSON.parse(objs);
			// 获取打印设置
			var printSetting = JSON.parse(obj["print"]);
			// 打印方向
			var orient = printSetting["orient"];
			// 打印纸张名称
			var paperName = this.getPaperName(printSetting["paperSize"]);
			// 打印比例
			var zoomScaleStr = printSetting["zoomScale"];
			if (zoomScaleStr == null || zoomScaleStr == "" || zoomScaleStr == "null")
				zoomScale = 100;
			else
				zoomScale = Number(zoomScaleStr) * 100;
			// 根据纸张方向尺寸生成关键字，用于批量打印时归类（横向，纵向）打印
			var mapKey = orient + "_" + paperName;
			if (map[mapKey] == null) {
				var htmls = [];
				htmls.push(obj);
				map[mapKey] = htmls;
			} else {
				var htmls = map[mapKey];
				htmls.push(obj);
			}
		}

		if (Object.keys(map).length > 1 && printType == "preview") {
			alert("打印纸张，方向不统一，无法预览");
			return;
		}

		var printReportTimer = null;
		//最大重试次数
		var printReportMaxTime = 300;
		//当前重试次数
		var printReportCurTime = 0;

		var doPrintReport = function () {
			if (printer.webskt && printer.webskt.readyState == 1) {
				this.clearTimeout(printReportTimer);
				var isNewPage = false;
				for (var key in map) {
					//打印初始化
					printer.PRINT_INITA(offsetTop, offsetLeft, 800, 600, "打印_" + key);
					printer.SET_PRINTER_INDEX(printerIndex);
					var orient = key.split("_")[0]; //打印方向横向纵向
					var paperName = key.split("_")[1]; //打印纸张名称
					if (printerPapers.contains(paperName)) {
						printer.SET_PRINT_PAGESIZE(orient, 0, 0, paperName);
					} else {
						for (var i = 0; i < printerPapers.length; i++) {
							var printerPaper = printerPapers[i];
							if (printerPaper.indexOf(paperName) > -1) {
								printer.SET_PRINT_PAGESIZE(orient, 0, 0, printerPaper);
								break;
							}
						}
					}

					printer.SET_PRINT_MODE("RESELECT_PRINTER", 1); //设置是否可以重新选择打印机。
					printer.SET_PRINT_MODE("RESELECT_PAGESIZE", 1); //设置是否可以重新选择纸张。
					printer.SET_PRINT_MODE("RESELECT_ORIENT", 1); //设置是否可以重新选择打印方向。

					//获取纸张长度（mm）
					var paperLength = printer.GET_PRINTER_NAME(printerIndex + ":PaperLength") / 10;
					if (orient == "2") {
						printer.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", true);
						paperLength = printer.GET_PRINTER_NAME(printerIndex + ":PaperWidth") / 10;
					}

					var l2Margin = 0; //上个模板的右边距
					var objs = map[key];
					for (var j = 0; j < objs.length; j++) {
						var obj = objs[j];
						//页眉
						var pageHeader = obj["pageHeader"];
						var pageHeaderHeight = 0;
						var pageHeaderHeightPx = obj["pageHeaderHeight"];
						if (pageHeaderHeightPx != null) {
							pageHeaderHeight = Number(pageHeaderHeightPx) * 0.254;
						}
						//页脚
						var pageFooter = obj["pageFooter"];
						var pageFooterHeight = 0;
						var pageFooterHeightPx = obj["pageFooterHeight"];
						if (pageFooterHeightPx != null) {
							pageFooterHeight = Number(pageFooterHeightPx) * 0.254;
						}
						//正文
						var html = obj["html"];
						var printSetting = JSON.parse(obj["print"]);
						var tMarginPx = Number(printSetting["tMargin"]); //上边距
						var lMarginPx = Number(printSetting["lMargin"]); //左边距
						var rMarginPx = Number(printSetting["rMargin"]); //右边距
						var bMarginPx = Number(printSetting["bMargin"]); //下边距
						var tMargin = tMarginPx * 0.254;
						var lMargin = lMarginPx * 0.254;
						var rMargin = rMarginPx * 0.254;
						var bMargin = bMarginPx * 0.254;
						//打印页眉
						if (pageHeaderHeight > 0) {
							printer.ADD_PRINT_HTM(tMargin + "mm", lMargin + "mm", "RightMargin:" + rMargin + "mm", pageHeaderHeight + "mm", pageHeader);
							printer.SET_PRINT_STYLEA(0, "ItemType", 1);
						}
						//打印页脚
						if (pageFooterHeight > 0) {
							var topLength = paperLength - pageFooterHeight - bMargin;
							printer.ADD_PRINT_HTM(topLength + "mm", lMargin + "mm", "RightMargin:" + rMargin + "mm", pageFooterHeight + "mm", pageFooter);
							printer.SET_PRINT_STYLEA(0, "ItemType", 1);
						}

						//是否连打
						var continuousPrint = obj["continuousPrint"];
						//是否动态报表
						var isList = obj["isList"];
						//图片
						var imgs = obj["imgs"];
						imgs = JSON.parse(imgs);
						//分割成多个table（一个table代表一个Sheet）
						var tables = html.split("<div style=\"page-break-after:always\">&nbsp;</div>");
						//获取上边距
						var topValue = tMargin + pageHeaderHeight;
						//获取下边距
						var bottomValue = bMargin + pageFooterHeight;
						for (var tableIndex = 0; tableIndex < tables.length; tableIndex++) {
							var ht = tables[tableIndex];
							if (ht != "") {
								//每页打印行数（再分页数）
								var childTables = ht.split("<p style=\"page-break-after:always\">&nbsp;</p>");
								if (childTables.length <= 1) {
									if (continuousPrint) {
										var bLMargin = lMargin - l2Margin; //计算出本次模板距离纸张的左边距
										_this.addImg(printer, imgs, tableIndex, topValue, lMargin);
										printer.ADD_PRINT_TABLE(topValue + "mm", bLMargin + "mm", "RightMargin:" + rMargin + "mm", "BottomMargin:" + bottomValue + "mm", "<!DOCTYPE html>" + ht);
										printer.SET_PRINT_STYLEA(0, "LinkedItem", -1); //模板连打
										if (!isList) {
											printer.SET_PRINT_STYLEA(0, "LinkNewPage", "True");
										}
										l2Margin = l2Margin + bLMargin;
									} else {
										if (false == isNewPage) {
											printer.NEWPAGEA();
											isNewPage = true;
										}
										_this.addImg(printer, imgs, tableIndex, topValue, lMargin);
										printer.ADD_PRINT_TABLE(topValue + "mm", lMargin + "mm", "RightMargin:" + rMargin + "mm", "BottomMargin:" + bottomValue + "mm", "<!DOCTYPE html>" + ht);
										isNewPage = false;
									}
								} else {
									if (false == isNewPage) {
										printer.NEWPAGEA();
										isNewPage = true;
									}
									_this.addImg(printer, imgs, tableIndex, topValue, lMargin);
									//每页打印行数
									for (var n = 0; n < childTables.length; n++) {
										var childHt = childTables[n];
										if (childHt != "") {
											if (false == isNewPage) {
												printer.NEWPAGEA();
												isNewPage = true;
											}
											printer.ADD_PRINT_TABLE(topValue + "mm", lMargin + "mm", "RightMargin:" + rMargin + "mm", "BottomMargin:" + bottomValue + "mm", "<!DOCTYPE html>" + childHt);
											isNewPage = false;
										}
									}
								}
							}
						}
					}

					if (zoomScale != 100) {
						var printPagePercent = zoomScale + "%";
						printer.SET_PRINT_MODE("PRINT_PAGE_PERCENT", printPagePercent);
					}

					if (printType == "print") {
						if (printNum > 1) {
							printer.SET_PRINT_COPIES(printNum);
						}
						printer.PRINT();
					} else {
						if ("local" != serverHostType) {
							printer.PREVIEW("_dialog"); //远程弹窗预览
						} else {
							printer.PREVIEW();
						}
					}
				}
			} else {
				if (printReportCurTime > printReportMaxTime) {
					this.clearTimeout(printReportTimer);
				} else {
					printReportTimer = this.setTimeout(doPrintReport, 100);
					printReportCurTime++;
				}
			}
		}

		doPrintReport();
	},

	//获取打印机序号
	getPrinterIndex : function (printer, printerName) {
		if (printerName != "") {
			var count = printer.GET_PRINTER_COUNT();
			for (var i = 0; i < count; i++) {
				var name = printer.GET_PRINTER_NAME(i);
				if (name == printerName) {
					return i;
				}
			}
		}
		return -1;
	},

	// 获取打印机所支持的所有纸张
	getPrinterPapers : function (printer, printerName) {
		var pageSizeList;
		if (printerName != "") {
			printer.SET_PRINTER_INDEXA(printerName) //设置打印机
			pageSizeList = printer.GET_PAGESIZES_LIST(printerName, "\n"); //获取当前打印机纸张信息
		} else {
			pageSizeList = printer.GET_PAGESIZES_LIST(-1, "\n"); //获取默认打印机纸张信息
		}
		var printerPapers = pageSizeList.split("\n");
		return printerPapers;
	},

	// 获取纸张名称
	getPaperName : function (paperSize) {
		var paperNames = {
			"null": "A4",
			"8": "A3",
			"11": "A5",
			"66": "A2",
			"70": "A5"
		}
		var paperSize = paperNames[paperSize];
		return paperSize;
	},

	getHost : function (path) {
		var host = window.location.protocol + "//" + window.location.host + "/" + path;
		return host;
	},

	addImg : function (printer, imgs, tableIndex, tMargin, lMargin) {
		if (imgs == null) {
			return;
		}
		for (var j = 0; j < imgs.length; j++) {
			var img = imgs[j];
			var index = img["index"];
			if (index != tableIndex) {
				continue;
			}

			var reportImagePrintType = img["reportImagePrintType"];
			var topPx = img["top"];
			var leftPx = img["left"];
			var widthPx = img["width"];
			var heightPx = img["height"];
			var path = img["path"];

			var top = (topPx * 0.254 + tMargin) + "mm";
			var left = (leftPx * 0.254 + lMargin) + "mm";
			var width = (widthPx * 0.254 + 4) + "mm";
			var height = (heightPx * 0.254 + 4) + "mm";
			var imgUrl = "<img border='0' src='" + this.getHost(path) + "' style='z-index:-1; position:absolute;width:" + widthPx + "px;height:" + heightPx + "px'>";
			printer.ADD_PRINT_IMAGE(top, left, width, height, imgUrl);

			if (reportImagePrintType == "FirstPage") {
				// 不用加，分组报表时，第一页都要打印
				//printer.SET_PRINT_STYLEA(0, "PageIndex", "First");
			} else if (reportImagePrintType == "EachPage") {
				printer.SET_PRINT_STYLEA(0, "PageIndex", "Odd,Even");
				printer.SET_PRINT_STYLEA(0, "TransColor", "#FFFFFF");
			} else if (reportImagePrintType == "LastPage") {
				printer.SET_PRINT_STYLEA(0, "PageIndex", "Last");
				printer.SET_PRINT_STYLEA(0, "TransColor", "#FFFFFF");
			}
		}
	}

});
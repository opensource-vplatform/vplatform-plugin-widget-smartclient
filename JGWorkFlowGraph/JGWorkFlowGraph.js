/**
 * 流程图
 * @class JGWorkFlowGraph
 * @extends JGBaseWidget
 * 
 */
isc.ClassFactory.defineClass("JGWorkFlowGraph", "JGBaseWidget");

isc.JGWorkFlowGraph.addClassProperties({
	currentInstanceId: ''
});

isc.JGWorkFlowGraph.addProperties({
	listener: [
		'SelectAction', //选中节点
		'NoneSelected', //反选节点
		'insertEdge', //插入线
		'deleteCell', //删除对象
		'SelectedWF', //激活流程图
		'ActivityDrop', //拖拽活动到流程图中
		'CopyActivity' //复制节点
	],
	_currentInstanceId: '',
	_graph: null, //当前流程图对象
	_sourceCells: null, //记录被复制的节点
	redrawOnResize: false,
	autoDraw: false,
	ReadOnly: false,
	canFocus: true, //是否可获取焦点
	Bgcolor: '#9AB6B6',
	Background: '',
	IsShow: true,
	canAcceptDrop: true,
	canDrop: true, //不允许内部拖动
	/*存储未渲染之前加载的流程*/
	_loadedGraph: null,
	className: "JGWorkFlowGraphNormal",
	_ProcessSetting: null
});


isc.JGWorkFlowGraph.addMethods({


	_initWidget: function () {
		this.initTool();
		this.initAttribute();
		this._initEventAndDataBind();
	},

	_initEventAndDataBind: function () {
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceUpdateEventHandler(function (params) {
			var resultSet = params.resultSet,
				datasource = params.datasource;
			var activityIds = [];
			for (var k = 0; k < resultSet.length; k++) {
				var activityId = resultSet[k].activityId;
				if (activityIds.indexOf(activityId) == -1) {
					activityIds.push(activityId);
				}
			}

			for (var i = 0; i < activityIds.length; i++) {
				var id = activityIds[i];

				var resultSet = datasource.getAllRecords();
				var records = [];
				for (var j = 0, l = resultSet.length; j < l; j++) {
					var record = resultSet[j];
					if (record.activityId == id) {
						records.push(record);
					}
				}

				for (var n = 0, l = resultSet.length; n < l; n++) {
					var record = resultSet[n];
					_this.changLabel(id, record.propertyValue);
				}
			}

		});
	},

	_afterInitWidget: function () {
		var datasource = this.getDataSource();

		if (datasource && datasource.markMultipleSelect) {
			datasource.markMultipleSelect();

		}
		this.on("SelectAction", this.SelectAction());
		this.on("SelectAction", this.OnActivitySelected());
		this.on("NoneSelected", this.NoneSelected());
		this.on("insertEdge", this.insertEdge());
		this.on("SelectedWF", this.SelectedWF());
		this.on("ActivityDrop", this.ActivityDrop());
		this.on("CopyActivity", this.CopyActivity());

		isc.DataBindingUtil.bindEvent(this, "deleteCell", function (idArray) {
			// 兼容参数为非数组的形式
			if (Object.prototype.toString.apply(idArray) != '[object Array]') {
				idArray = [idArray];
			}
			var recordIds = [];
			// 此处可能会同时删除多个活动。
			for (var i = 0; i < idArray.length; i++) {
				var id = idArray[i];

				var resultSet = datasource.getAllRecords();
				var records = [];
				for (var n = 0, l = resultSet.length; n < l; n++) {
					var record = resultSet[n];
					if (record.activityId == id) {
						records.push(record);
					}
				}
				for (var j = 0; j < records.length; j++) {
					var row = records[j];
					recordIds.push(row.id);
				}

			}
			// 如果没有选中活动记录，无需删除
			if (recordIds.length != undefined && recordIds.length > 0) {
				datasource.removeRecordByIds(recordIds);
			}
		});
	},

	getV3MethodMap: function () {
		return {
			setGraphXML: "loadWorkGraph",
			loadGraph: "loadWorkGraph",
			getGraph: "getWorkGraph",
			selectActivity: "selectGraphActivity",
			changLabel: "changeActivityLabel",
			getAllActivityID: "getGraphAllActivityID",
			getCellAttr: "getGraphCellAttr",
			setCellAttr: "setGraphCellAttr",
			setCellStyle: "setGraphCellStyle",
			setEdgeStyle: "setGraphEdgeStyle",
			getSourceIdAndTargetIdByEdgeId: "getGraphSourceIdAndTargetIdByEdgeId",
		}
	},

	//初始化右侧小地图
	initOutline: function () {
		var _mxgrpah = this._graph;
		var graphContainer = document.getElementById(this.getGraphID()).parentNode;

		// _mxgrpah.panningHandler.useLeftButtonForPanning = true;
		// _mxgrpah.panningHandler.popupMenuHandler = false;

		var outlineContainer = "<div id='outlineContainer' style='z-index:1;position:absolute;overflow:hidden;top:0px;right:8px;width:160px;height:120px;background:#ffffff;border-style:solid;border-color:lightgray;'></div>";

		var outlineContainers = document.createElement("div");
		outlineContainers.innerHTML = outlineContainer;
		graphContainer.appendChild(outlineContainers);

		var outline = document.getElementById('outlineContainer');
		if (_mxgrpah.IS_QUIRKS) {
			document.body.style.overflow = 'hidden';
			new mxDivResizer(outline);
		}
		var outln = new mxOutline(_mxgrpah, outline);
	},

	//初始化工具栏
	initTool: function () {
		var layout = isc.HLayout.create({
			canDragReposition: true,
			height: 35,
			snapTo: "TL",
			//snapOffsetTop:-20,
			//snapOffsetLeft:-20,
			layoutMargin: 6,
			membersMargin: 6

		});

		var lable1 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '放大',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			// backgroundImage:'data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwM DAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAg ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCABYADgDAREA AhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABQYDBAABAgf/xAA9EAACAQIDBQQFCgUFAAAAAAAB AgMEEQAFEgYTFCExIkFRcRUyYXOUIzQ2VJGxstHS0xZVVoGVB0JTYpL/xAAZAQACAwEAAAAAAAAA AAAAAAAAAwECBAX/xAAoEQACAQIGAAYDAQAAAAAAAAAAAQIDERITITFBUQRhcYGh8CMywSL/2gAM AwEAAhEDEQA/AH2np4JYEmmQSzSgSSSSDUzM3Mkk3JuTjstnFSL9BkMVbv8AdRQjh4mmfUv+1etr A88UlUsXjSuVeCo/+CP/AMjFsTK4UJ+2VOsuZ5dlzM3o9t5UNRhjuTMNKCTd+rqCm17YlK7VyG7J 2KX8PZR9XX7MOy0JzGFM8/09pcm4XiYoH4uITR7u5sp8bqvPCqbjPbgbUU4b8gxMly+ndZ6ePczw kSRTR9l0deasrDmCCORwx00LVRj5RfM4Pdr92Ey3HR2G7Ic+gEE8UsFJDuaRgjlQrSsoACsSe1q7 x34yVKfrua6VX02AOZV/GziXcRU9l06IV0r1Jvbx54fCNhE5XEXaz6R5Z7mX8S4fATMJbPZ56GrX qeFiq9cZj3cwuouwN/Ps4tVp41bYpSqYHfcdNsdsaIUUNNTQ0VXxdFokkTSzQMykaVsTp035DGOh Qd7u6szZ4jxCtZWd0ebSeo3kcdE5w2COOAtBFmEc0UTFEkEEzghTYWZBpPmMZb34NVrcm7n62nw1 T+WD2+UHv8My5+tp8NU/lg9vlB7/AAwHtFR5COFzOvz2OCqSZqeKm3MrMUKBidyFMtgQO36vd1OI x2exOC63KHGbM/zofBVf6MMzn0UyV2ZxmzP86HwVX+jBnPoMldktNLsxPUxQNniosrqhd6WpjUBj a5d0CqPa3IYh1n0CorsZaL5nB7tfuxWW5aOwTTJs2kRZEo5mRwGVghsQehGF5kexmXLogqaSppnE dRE0Lkagrixt48/LEppkOLW4kbXIp2jyy4v8jL+JcNgKmWcvyiszGYwUNMaiVV1lEFzpBAv9pw2U lHcVGDlsXZ9jdoYIZJ5sskSKJS8jlRYKouSfIYoq0HyXdCa4A0kce7bsjoe7DRI3UXzOD3a/djNL c1R2CaZzm0aLGlZMqIAqqHNgB0AwvLj0MzJdkFTV1NS4kqJWmcDSGc3NvDn54lJIhyb3Enaz6R5b 7mX8S4dATMs5fmeYZdMZ6GdqeVl0F05HSSDb7RhsoKW4qM3HYvT7XbSzwyQTZjM8UqlJEJ5FWFiD 5jFFQguC7rzfIGk9RvI4aKGwLROWkpaSRKZ2LQqapkOgm63VUYDl3Xxl15fwatOF8m91H9Xf4yT9 vBf7YPu5m6j+rv8AGSft4L/bB93AW0eZZBRilp3ySWrzeWZpI34nSohCAMd9pL3LEdjTbvviP9X0 JWG2pQ9Lw/063+Qf9nF/yFL0zPS8P9Ot/kH/AGcH5AvTJKfOaBaiJqnZ6QUwdTPorTI2i/asjRKG Nu4kX8cQ1UJTpjfke6vQiVN5GRGGS9r3AHdilTkvT4CWYwUKZtmEbkwxxmTh1QctYPZX2DC4t4UM mliZtIqZtnJZREBUJUIhm6kghj/bBd4/YLLB7nne1n0jyz3Mv4lxpgZ5h2OChfYqeoFOorIqyOM1 HVirKxt7B5YG3meViLLL87lWmjyhczy4R6quGQRcXFJ8naVjZlBHVRy88WeKz4KrDdcnG1cENPn2 ZwwoI4o5pFRF5AAHoMFF3gvQKytN+oZyvM4aVIHEkYmhUApLpNmAtzVvDCpwuNhOxek2kLzzTmeA SVEbRSkCMXVuvTv9vXFMovmnKbQqlCaIS0+4bmbiMtfx1dbi/I4MrW+oZultBI2ocSZ5l86dqBEk iaYeprJVgurpe2HREy2CEW0VXHlTZWu44R7lgYoy5bn2tZGrUL8j3Yu6axYuSiqPDh4NfxBV8VSV LNC8lDEsFOGjRl0ICFupFmIv1ODLVmuwzHdPohzXNKjNap6ifdtUy8jukVNTHvIQC7EnriYxUVYi UnJ3GdKyuqRxLyqjT/KFI4odK6+dhqRjyv3nGfCloaMTepJbMN2JN627JsH3MNifC+7xGhOpknHx uUklZHHVWigB+wx4NA1FzafaXaKlmosoop4Yknd6l6o08TTdkBBHzUx6ed/Uv7cGXdhmWRSizDbK WRY4szMkjclRaWlJJ9gEOGOiuxarPo64vbbRI/pBtEJtM3CU1kJNgGO55c/HEZS7Jzn0cw55tbTz R1HpFJtywk3UlNTaG0m+ltEatY252IOJdAheIGii+Zwe7X7sVluWjsNmyhCU8r1hQULSIIN504m/ ZI8h1xlr+W/8NdDz2/oBzBapa6cVfznWd7fxw+NraGed767iPtZ9I8s9zL+JcOgKmS0KVT1kC0mr ijIu40etrv2bf3w2Vra7CI3vpuPG3heTKVNG8TJFPbPdwLXrdCjWf+vUeftxi8N+2vt6G7xX66d6 +p5/J6jeRxvMA4Q0eaQRiCShl1w/Jkrpt2eXeRjI5RfJrUZLgk3eY2twU9vDs/qxGnZNn0YY8xJu aKcnx7P6sGnYWfQAz3ZjaKtr6PMoqF9xBrgZSRr7Vm1W6W5eOLKpFPcq6cmtjkbP5+putFKCOhBX 88NzYismRv0BtDYjg5bN6wuvPz7WDNiGVI0Nmc/lYRCikBkOkE6bc+XPmcDrRBUZH//Z',
			click: (function (_this) {
				return function () {
					_this._graph.zoomIn();
				}
			}(this)),
			backgroundPosition: '0 0'
		});
		layout.addMembers(lable1);

		var lable2 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '缩小',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			//backgroundImage:'data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwM DAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAg ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCABYADgDAREA AhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABQYDBAABAgf/xAA9EAACAQIDBQQFCgUFAAAAAAAB AgMEEQAFEgYTFCExIkFRcRUyYXOUIzQ2VJGxstHS0xZVVoGVB0JTYpL/xAAZAQACAwEAAAAAAAAA AAAAAAAAAwECBAX/xAAoEQACAQIGAAYDAQAAAAAAAAAAAQIDERITITFBUQRhcYGh8CMywSL/2gAM AwEAAhEDEQA/AH2np4JYEmmQSzSgSSSSDUzM3Mkk3JuTjstnFSL9BkMVbv8AdRQjh4mmfUv+1etr A88UlUsXjSuVeCo/+CP/AMjFsTK4UJ+2VOsuZ5dlzM3o9t5UNRhjuTMNKCTd+rqCm17YlK7VyG7J 2KX8PZR9XX7MOy0JzGFM8/09pcm4XiYoH4uITR7u5sp8bqvPCqbjPbgbUU4b8gxMly+ndZ6ePczw kSRTR9l0deasrDmCCORwx00LVRj5RfM4Pdr92Ey3HR2G7Ic+gEE8UsFJDuaRgjlQrSsoACsSe1q7 x34yVKfrua6VX02AOZV/GziXcRU9l06IV0r1Jvbx54fCNhE5XEXaz6R5Z7mX8S4fATMJbPZ56GrX qeFiq9cZj3cwuouwN/Ps4tVp41bYpSqYHfcdNsdsaIUUNNTQ0VXxdFokkTSzQMykaVsTp035DGOh Qd7u6szZ4jxCtZWd0ebSeo3kcdE5w2COOAtBFmEc0UTFEkEEzghTYWZBpPmMZb34NVrcm7n62nw1 T+WD2+UHv8My5+tp8NU/lg9vlB7/AAwHtFR5COFzOvz2OCqSZqeKm3MrMUKBidyFMtgQO36vd1OI x2exOC63KHGbM/zofBVf6MMzn0UyV2ZxmzP86HwVX+jBnPoMldktNLsxPUxQNniosrqhd6WpjUBj a5d0CqPa3IYh1n0CorsZaL5nB7tfuxWW5aOwTTJs2kRZEo5mRwGVghsQehGF5kexmXLogqaSppnE dRE0Lkagrixt48/LEppkOLW4kbXIp2jyy4v8jL+JcNgKmWcvyiszGYwUNMaiVV1lEFzpBAv9pw2U lHcVGDlsXZ9jdoYIZJ5sskSKJS8jlRYKouSfIYoq0HyXdCa4A0kce7bsjoe7DRI3UXzOD3a/djNL c1R2CaZzm0aLGlZMqIAqqHNgB0AwvLj0MzJdkFTV1NS4kqJWmcDSGc3NvDn54lJIhyb3Enaz6R5b 7mX8S4dATMs5fmeYZdMZ6GdqeVl0F05HSSDb7RhsoKW4qM3HYvT7XbSzwyQTZjM8UqlJEJ5FWFiD 5jFFQguC7rzfIGk9RvI4aKGwLROWkpaSRKZ2LQqapkOgm63VUYDl3Xxl15fwatOF8m91H9Xf4yT9 vBf7YPu5m6j+rv8AGSft4L/bB93AW0eZZBRilp3ySWrzeWZpI34nSohCAMd9pL3LEdjTbvviP9X0 JWG2pQ9Lw/063+Qf9nF/yFL0zPS8P9Ot/kH/AGcH5AvTJKfOaBaiJqnZ6QUwdTPorTI2i/asjRKG Nu4kX8cQ1UJTpjfke6vQiVN5GRGGS9r3AHdilTkvT4CWYwUKZtmEbkwxxmTh1QctYPZX2DC4t4UM mliZtIqZtnJZREBUJUIhm6kghj/bBd4/YLLB7nne1n0jyz3Mv4lxpgZ5h2OChfYqeoFOorIqyOM1 HVirKxt7B5YG3meViLLL87lWmjyhczy4R6quGQRcXFJ8naVjZlBHVRy88WeKz4KrDdcnG1cENPn2 ZwwoI4o5pFRF5AAHoMFF3gvQKytN+oZyvM4aVIHEkYmhUApLpNmAtzVvDCpwuNhOxek2kLzzTmeA SVEbRSkCMXVuvTv9vXFMovmnKbQqlCaIS0+4bmbiMtfx1dbi/I4MrW+oZultBI2ocSZ5l86dqBEk iaYeprJVgurpe2HREy2CEW0VXHlTZWu44R7lgYoy5bn2tZGrUL8j3Yu6axYuSiqPDh4NfxBV8VSV LNC8lDEsFOGjRl0ICFupFmIv1ODLVmuwzHdPohzXNKjNap6ifdtUy8jukVNTHvIQC7EnriYxUVYi UnJ3GdKyuqRxLyqjT/KFI4odK6+dhqRjyv3nGfCloaMTepJbMN2JN627JsH3MNifC+7xGhOpknHx uUklZHHVWigB+wx4NA1FzafaXaKlmosoop4Yknd6l6o08TTdkBBHzUx6ed/Uv7cGXdhmWRSizDbK WRY4szMkjclRaWlJJ9gEOGOiuxarPo64vbbRI/pBtEJtM3CU1kJNgGO55c/HEZS7Jzn0cw55tbTz R1HpFJtywk3UlNTaG0m+ltEatY252IOJdAheIGii+Zwe7X7sVluWjsNmyhCU8r1hQULSIIN504m/ ZI8h1xlr+W/8NdDz2/oBzBapa6cVfznWd7fxw+NraGed767iPtZ9I8s9zL+JcOgKmS0KVT1kC0mr ijIu40etrv2bf3w2Vra7CI3vpuPG3heTKVNG8TJFPbPdwLXrdCjWf+vUeftxi8N+2vt6G7xX66d6 +p5/J6jeRxvMA4Q0eaQRiCShl1w/Jkrpt2eXeRjI5RfJrUZLgk3eY2twU9vDs/qxGnZNn0YY8xJu aKcnx7P6sGnYWfQAz3ZjaKtr6PMoqF9xBrgZSRr7Vm1W6W5eOLKpFPcq6cmtjkbP5+putFKCOhBX 88NzYismRv0BtDYjg5bN6wuvPz7WDNiGVI0Nmc/lYRCikBkOkE6bc+XPmcDrRBUZH//Z',
			click: (function (_this) {
				return function () {
					_this._graph.zoomOut();
				}
			}(this)),
			backgroundPosition: '0 -22px'
		});
		layout.addMembers(lable2);

		var lable3 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '原始大小',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			//backgroundImage:'data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwM DAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAg ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCABYADgDAREA AhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABQYDBAABAgf/xAA9EAACAQIDBQQFCgUFAAAAAAAB AgMEEQAFEgYTFCExIkFRcRUyYXOUIzQ2VJGxstHS0xZVVoGVB0JTYpL/xAAZAQACAwEAAAAAAAAA AAAAAAAAAwECBAX/xAAoEQACAQIGAAYDAQAAAAAAAAAAAQIDERITITFBUQRhcYGh8CMywSL/2gAM AwEAAhEDEQA/AH2np4JYEmmQSzSgSSSSDUzM3Mkk3JuTjstnFSL9BkMVbv8AdRQjh4mmfUv+1etr A88UlUsXjSuVeCo/+CP/AMjFsTK4UJ+2VOsuZ5dlzM3o9t5UNRhjuTMNKCTd+rqCm17YlK7VyG7J 2KX8PZR9XX7MOy0JzGFM8/09pcm4XiYoH4uITR7u5sp8bqvPCqbjPbgbUU4b8gxMly+ndZ6ePczw kSRTR9l0deasrDmCCORwx00LVRj5RfM4Pdr92Ey3HR2G7Ic+gEE8UsFJDuaRgjlQrSsoACsSe1q7 x34yVKfrua6VX02AOZV/GziXcRU9l06IV0r1Jvbx54fCNhE5XEXaz6R5Z7mX8S4fATMJbPZ56GrX qeFiq9cZj3cwuouwN/Ps4tVp41bYpSqYHfcdNsdsaIUUNNTQ0VXxdFokkTSzQMykaVsTp035DGOh Qd7u6szZ4jxCtZWd0ebSeo3kcdE5w2COOAtBFmEc0UTFEkEEzghTYWZBpPmMZb34NVrcm7n62nw1 T+WD2+UHv8My5+tp8NU/lg9vlB7/AAwHtFR5COFzOvz2OCqSZqeKm3MrMUKBidyFMtgQO36vd1OI x2exOC63KHGbM/zofBVf6MMzn0UyV2ZxmzP86HwVX+jBnPoMldktNLsxPUxQNniosrqhd6WpjUBj a5d0CqPa3IYh1n0CorsZaL5nB7tfuxWW5aOwTTJs2kRZEo5mRwGVghsQehGF5kexmXLogqaSppnE dRE0Lkagrixt48/LEppkOLW4kbXIp2jyy4v8jL+JcNgKmWcvyiszGYwUNMaiVV1lEFzpBAv9pw2U lHcVGDlsXZ9jdoYIZJ5sskSKJS8jlRYKouSfIYoq0HyXdCa4A0kce7bsjoe7DRI3UXzOD3a/djNL c1R2CaZzm0aLGlZMqIAqqHNgB0AwvLj0MzJdkFTV1NS4kqJWmcDSGc3NvDn54lJIhyb3Enaz6R5b 7mX8S4dATMs5fmeYZdMZ6GdqeVl0F05HSSDb7RhsoKW4qM3HYvT7XbSzwyQTZjM8UqlJEJ5FWFiD 5jFFQguC7rzfIGk9RvI4aKGwLROWkpaSRKZ2LQqapkOgm63VUYDl3Xxl15fwatOF8m91H9Xf4yT9 vBf7YPu5m6j+rv8AGSft4L/bB93AW0eZZBRilp3ySWrzeWZpI34nSohCAMd9pL3LEdjTbvviP9X0 JWG2pQ9Lw/063+Qf9nF/yFL0zPS8P9Ot/kH/AGcH5AvTJKfOaBaiJqnZ6QUwdTPorTI2i/asjRKG Nu4kX8cQ1UJTpjfke6vQiVN5GRGGS9r3AHdilTkvT4CWYwUKZtmEbkwxxmTh1QctYPZX2DC4t4UM mliZtIqZtnJZREBUJUIhm6kghj/bBd4/YLLB7nne1n0jyz3Mv4lxpgZ5h2OChfYqeoFOorIqyOM1 HVirKxt7B5YG3meViLLL87lWmjyhczy4R6quGQRcXFJ8naVjZlBHVRy88WeKz4KrDdcnG1cENPn2 ZwwoI4o5pFRF5AAHoMFF3gvQKytN+oZyvM4aVIHEkYmhUApLpNmAtzVvDCpwuNhOxek2kLzzTmeA SVEbRSkCMXVuvTv9vXFMovmnKbQqlCaIS0+4bmbiMtfx1dbi/I4MrW+oZultBI2ocSZ5l86dqBEk iaYeprJVgurpe2HREy2CEW0VXHlTZWu44R7lgYoy5bn2tZGrUL8j3Yu6axYuSiqPDh4NfxBV8VSV LNC8lDEsFOGjRl0ICFupFmIv1ODLVmuwzHdPohzXNKjNap6ifdtUy8jukVNTHvIQC7EnriYxUVYi UnJ3GdKyuqRxLyqjT/KFI4odK6+dhqRjyv3nGfCloaMTepJbMN2JN627JsH3MNifC+7xGhOpknHx uUklZHHVWigB+wx4NA1FzafaXaKlmosoop4Yknd6l6o08TTdkBBHzUx6ed/Uv7cGXdhmWRSizDbK WRY4szMkjclRaWlJJ9gEOGOiuxarPo64vbbRI/pBtEJtM3CU1kJNgGO55c/HEZS7Jzn0cw55tbTz R1HpFJtywk3UlNTaG0m+ltEatY252IOJdAheIGii+Zwe7X7sVluWjsNmyhCU8r1hQULSIIN504m/ ZI8h1xlr+W/8NdDz2/oBzBapa6cVfznWd7fxw+NraGed767iPtZ9I8s9zL+JcOgKmS0KVT1kC0mr ijIu40etrv2bf3w2Vra7CI3vpuPG3heTKVNG8TJFPbPdwLXrdCjWf+vUeftxi8N+2vt6G7xX66d6 +p5/J6jeRxvMA4Q0eaQRiCShl1w/Jkrpt2eXeRjI5RfJrUZLgk3eY2twU9vDs/qxGnZNn0YY8xJu aKcnx7P6sGnYWfQAz3ZjaKtr6PMoqF9xBrgZSRr7Vm1W6W5eOLKpFPcq6cmtjkbP5+putFKCOhBX 88NzYismRv0BtDYjg5bN6wuvPz7WDNiGVI0Nmc/lYRCikBkOkE6bc+XPmcDrRBUZH//Z',
			click: (function (_this) {
				return function () {
					_this._graph.zoomActual();
				}
			}(this)),
			backgroundPosition: '0 -44px'
		});
		layout.addMembers(lable3);

		var lable4 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '删除',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			// backgroundImage:'data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwM DAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAg ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCABYADgDAREA AhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABQYDBAABAgf/xAA9EAACAQIDBQQFCgUFAAAAAAAB AgMEEQAFEgYTFCExIkFRcRUyYXOUIzQ2VJGxstHS0xZVVoGVB0JTYpL/xAAZAQACAwEAAAAAAAAA AAAAAAAAAwECBAX/xAAoEQACAQIGAAYDAQAAAAAAAAAAAQIDERITITFBUQRhcYGh8CMywSL/2gAM AwEAAhEDEQA/AH2np4JYEmmQSzSgSSSSDUzM3Mkk3JuTjstnFSL9BkMVbv8AdRQjh4mmfUv+1etr A88UlUsXjSuVeCo/+CP/AMjFsTK4UJ+2VOsuZ5dlzM3o9t5UNRhjuTMNKCTd+rqCm17YlK7VyG7J 2KX8PZR9XX7MOy0JzGFM8/09pcm4XiYoH4uITR7u5sp8bqvPCqbjPbgbUU4b8gxMly+ndZ6ePczw kSRTR9l0deasrDmCCORwx00LVRj5RfM4Pdr92Ey3HR2G7Ic+gEE8UsFJDuaRgjlQrSsoACsSe1q7 x34yVKfrua6VX02AOZV/GziXcRU9l06IV0r1Jvbx54fCNhE5XEXaz6R5Z7mX8S4fATMJbPZ56GrX qeFiq9cZj3cwuouwN/Ps4tVp41bYpSqYHfcdNsdsaIUUNNTQ0VXxdFokkTSzQMykaVsTp035DGOh Qd7u6szZ4jxCtZWd0ebSeo3kcdE5w2COOAtBFmEc0UTFEkEEzghTYWZBpPmMZb34NVrcm7n62nw1 T+WD2+UHv8My5+tp8NU/lg9vlB7/AAwHtFR5COFzOvz2OCqSZqeKm3MrMUKBidyFMtgQO36vd1OI x2exOC63KHGbM/zofBVf6MMzn0UyV2ZxmzP86HwVX+jBnPoMldktNLsxPUxQNniosrqhd6WpjUBj a5d0CqPa3IYh1n0CorsZaL5nB7tfuxWW5aOwTTJs2kRZEo5mRwGVghsQehGF5kexmXLogqaSppnE dRE0Lkagrixt48/LEppkOLW4kbXIp2jyy4v8jL+JcNgKmWcvyiszGYwUNMaiVV1lEFzpBAv9pw2U lHcVGDlsXZ9jdoYIZJ5sskSKJS8jlRYKouSfIYoq0HyXdCa4A0kce7bsjoe7DRI3UXzOD3a/djNL c1R2CaZzm0aLGlZMqIAqqHNgB0AwvLj0MzJdkFTV1NS4kqJWmcDSGc3NvDn54lJIhyb3Enaz6R5b 7mX8S4dATMs5fmeYZdMZ6GdqeVl0F05HSSDb7RhsoKW4qM3HYvT7XbSzwyQTZjM8UqlJEJ5FWFiD 5jFFQguC7rzfIGk9RvI4aKGwLROWkpaSRKZ2LQqapkOgm63VUYDl3Xxl15fwatOF8m91H9Xf4yT9 vBf7YPu5m6j+rv8AGSft4L/bB93AW0eZZBRilp3ySWrzeWZpI34nSohCAMd9pL3LEdjTbvviP9X0 JWG2pQ9Lw/063+Qf9nF/yFL0zPS8P9Ot/kH/AGcH5AvTJKfOaBaiJqnZ6QUwdTPorTI2i/asjRKG Nu4kX8cQ1UJTpjfke6vQiVN5GRGGS9r3AHdilTkvT4CWYwUKZtmEbkwxxmTh1QctYPZX2DC4t4UM mliZtIqZtnJZREBUJUIhm6kghj/bBd4/YLLB7nne1n0jyz3Mv4lxpgZ5h2OChfYqeoFOorIqyOM1 HVirKxt7B5YG3meViLLL87lWmjyhczy4R6quGQRcXFJ8naVjZlBHVRy88WeKz4KrDdcnG1cENPn2 ZwwoI4o5pFRF5AAHoMFF3gvQKytN+oZyvM4aVIHEkYmhUApLpNmAtzVvDCpwuNhOxek2kLzzTmeA SVEbRSkCMXVuvTv9vXFMovmnKbQqlCaIS0+4bmbiMtfx1dbi/I4MrW+oZultBI2ocSZ5l86dqBEk iaYeprJVgurpe2HREy2CEW0VXHlTZWu44R7lgYoy5bn2tZGrUL8j3Yu6axYuSiqPDh4NfxBV8VSV LNC8lDEsFOGjRl0ICFupFmIv1ODLVmuwzHdPohzXNKjNap6ifdtUy8jukVNTHvIQC7EnriYxUVYi UnJ3GdKyuqRxLyqjT/KFI4odK6+dhqRjyv3nGfCloaMTepJbMN2JN627JsH3MNifC+7xGhOpknHx uUklZHHVWigB+wx4NA1FzafaXaKlmosoop4Yknd6l6o08TTdkBBHzUx6ed/Uv7cGXdhmWRSizDbK WRY4szMkjclRaWlJJ9gEOGOiuxarPo64vbbRI/pBtEJtM3CU1kJNgGO55c/HEZS7Jzn0cw55tbTz R1HpFJtywk3UlNTaG0m+ltEatY252IOJdAheIGii+Zwe7X7sVluWjsNmyhCU8r1hQULSIIN504m/ ZI8h1xlr+W/8NdDz2/oBzBapa6cVfznWd7fxw+NraGed767iPtZ9I8s9zL+JcOgKmS0KVT1kC0mr ijIu40etrv2bf3w2Vra7CI3vpuPG3heTKVNG8TJFPbPdwLXrdCjWf+vUeftxi8N+2vt6G7xX66d6 +p5/J6jeRxvMA4Q0eaQRiCShl1w/Jkrpt2eXeRjI5RfJrUZLgk3eY2twU9vDs/qxGnZNn0YY8xJu aKcnx7P6sGnYWfQAz3ZjaKtr6PMoqF9xBrgZSRr7Vm1W6W5eOLKpFPcq6cmtjkbP5+putFKCOhBX 88NzYismRv0BtDYjg5bN6wuvPz7WDNiGVI0Nmc/lYRCikBkOkE6bc+XPmcDrRBUZH//Z',
			click: (function (_this) {
				return function () {
					_this._graph.removeCells();
				}
			}(this)),
			backgroundPosition: '0 -66px'
		});
		layout.addMembers(lable4);

		var lable5 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '直线',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			click: (function (_this) {
				return function () {
					var _mxgraph = _this._graph;
					var selectedCells = _mxgraph.getSelectionCells(); //储存选中节点

					_mxgraph.clearSelection(); //去除选中节点
					_mxgraph.getStylesheet().getDefaultEdgeStyle().edgeStyle = null;
					var allEdges = _mxgraph.getChildEdges();

					if (!allEdges || allEdges.length <= 0)
						return;

					for (var i = 0, len = allEdges.length; i < len; i++) {
						var tmpEdge = allEdges[i];
						_mxgraph.refresh(tmpEdge);
					}

					selectedCells && selectedCells.length > 0 && _mxgraph.setSelectionCells(selectedCells); //重新选中节点
				}
			}(this)),
			backgroundPosition: '0 -110px'
		});
		layout.addMembers(lable5);

		var lable6 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '折线',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			click: (function (_this) {
				return function () {
					var _mxgraph = _this._graph;
					var selectedCells = _mxgraph.getSelectionCells(); //储存选中节点
					_mxgraph.clearSelection();
					_mxgraph.getStylesheet().getDefaultEdgeStyle().edgeStyle = mxEdgeStyle.ElbowConnector;
					var allEdges = _mxgraph.getChildEdges();

					if (!allEdges || allEdges.length <= 0)
						return;

					if (allEdges && allEdges.length > 0) {
						for (var i = 0, len = allEdges.length; i < len; i++) {
							var tmpEdge = allEdges[i];
							_mxgraph.refresh(tmpEdge);
						}
					}

					selectedCells && selectedCells.length > 0 && _mxgraph.setSelectionCells(selectedCells); //重新选中节点
				}
			}(this)),
			backgroundPosition: '0 -88px' //dd['backgroundPosition'] = '-252px -88px';
		});
		layout.addMembers(lable6);

		//自动布局按钮,纵向
		var lable7 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '纵向展示',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			click: (function (_this) {
				return function () {
					var _mxgraph = _this._graph;
					var selectedCells = _mxgraph.getSelectionCells(); //储存选中节点
					var CompactTreeLayouts = new mxCompactTreeLayout(_mxgraph, false);

					_this.initLayout(CompactTreeLayouts, _mxgraph, selectedCells, true);
				}
			}(this)),
			backgroundPosition: '0 -132px'
		});
		layout.addMembers(lable7);

		//自动布局按钮，横向
		var lable8 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '横向展示',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			click: (function (_this) {
				return function () {
					var _mxgraph = _this._graph;
					var selectedCells = _mxgraph.getSelectionCells(); //储存选中节点
					var CompactTreeLayouts = new mxCompactTreeLayout(_mxgraph);

					_this.initLayout(CompactTreeLayouts, _mxgraph, selectedCells, false);
				}
			}(this)),
			backgroundPosition: '0 -154px'
		});
		layout.addMembers(lable8);

		var lable9 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '撤销全部',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			// backgroundImage:'data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwM DAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAg ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCABYADgDAREA AhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABQYDBAABAgf/xAA9EAACAQIDBQQFCgUFAAAAAAAB AgMEEQAFEgYTFCExIkFRcRUyYXOUIzQ2VJGxstHS0xZVVoGVB0JTYpL/xAAZAQACAwEAAAAAAAAA AAAAAAAAAwECBAX/xAAoEQACAQIGAAYDAQAAAAAAAAAAAQIDERITITFBUQRhcYGh8CMywSL/2gAM AwEAAhEDEQA/AH2np4JYEmmQSzSgSSSSDUzM3Mkk3JuTjstnFSL9BkMVbv8AdRQjh4mmfUv+1etr A88UlUsXjSuVeCo/+CP/AMjFsTK4UJ+2VOsuZ5dlzM3o9t5UNRhjuTMNKCTd+rqCm17YlK7VyG7J 2KX8PZR9XX7MOy0JzGFM8/09pcm4XiYoH4uITR7u5sp8bqvPCqbjPbgbUU4b8gxMly+ndZ6ePczw kSRTR9l0deasrDmCCORwx00LVRj5RfM4Pdr92Ey3HR2G7Ic+gEE8UsFJDuaRgjlQrSsoACsSe1q7 x34yVKfrua6VX02AOZV/GziXcRU9l06IV0r1Jvbx54fCNhE5XEXaz6R5Z7mX8S4fATMJbPZ56GrX qeFiq9cZj3cwuouwN/Ps4tVp41bYpSqYHfcdNsdsaIUUNNTQ0VXxdFokkTSzQMykaVsTp035DGOh Qd7u6szZ4jxCtZWd0ebSeo3kcdE5w2COOAtBFmEc0UTFEkEEzghTYWZBpPmMZb34NVrcm7n62nw1 T+WD2+UHv8My5+tp8NU/lg9vlB7/AAwHtFR5COFzOvz2OCqSZqeKm3MrMUKBidyFMtgQO36vd1OI x2exOC63KHGbM/zofBVf6MMzn0UyV2ZxmzP86HwVX+jBnPoMldktNLsxPUxQNniosrqhd6WpjUBj a5d0CqPa3IYh1n0CorsZaL5nB7tfuxWW5aOwTTJs2kRZEo5mRwGVghsQehGF5kexmXLogqaSppnE dRE0Lkagrixt48/LEppkOLW4kbXIp2jyy4v8jL+JcNgKmWcvyiszGYwUNMaiVV1lEFzpBAv9pw2U lHcVGDlsXZ9jdoYIZJ5sskSKJS8jlRYKouSfIYoq0HyXdCa4A0kce7bsjoe7DRI3UXzOD3a/djNL c1R2CaZzm0aLGlZMqIAqqHNgB0AwvLj0MzJdkFTV1NS4kqJWmcDSGc3NvDn54lJIhyb3Enaz6R5b 7mX8S4dATMs5fmeYZdMZ6GdqeVl0F05HSSDb7RhsoKW4qM3HYvT7XbSzwyQTZjM8UqlJEJ5FWFiD 5jFFQguC7rzfIGk9RvI4aKGwLROWkpaSRKZ2LQqapkOgm63VUYDl3Xxl15fwatOF8m91H9Xf4yT9 vBf7YPu5m6j+rv8AGSft4L/bB93AW0eZZBRilp3ySWrzeWZpI34nSohCAMd9pL3LEdjTbvviP9X0 JWG2pQ9Lw/063+Qf9nF/yFL0zPS8P9Ot/kH/AGcH5AvTJKfOaBaiJqnZ6QUwdTPorTI2i/asjRKG Nu4kX8cQ1UJTpjfke6vQiVN5GRGGS9r3AHdilTkvT4CWYwUKZtmEbkwxxmTh1QctYPZX2DC4t4UM mliZtIqZtnJZREBUJUIhm6kghj/bBd4/YLLB7nne1n0jyz3Mv4lxpgZ5h2OChfYqeoFOorIqyOM1 HVirKxt7B5YG3meViLLL87lWmjyhczy4R6quGQRcXFJ8naVjZlBHVRy88WeKz4KrDdcnG1cENPn2 ZwwoI4o5pFRF5AAHoMFF3gvQKytN+oZyvM4aVIHEkYmhUApLpNmAtzVvDCpwuNhOxek2kLzzTmeA SVEbRSkCMXVuvTv9vXFMovmnKbQqlCaIS0+4bmbiMtfx1dbi/I4MrW+oZultBI2ocSZ5l86dqBEk iaYeprJVgurpe2HREy2CEW0VXHlTZWu44R7lgYoy5bn2tZGrUL8j3Yu6axYuSiqPDh4NfxBV8VSV LNC8lDEsFOGjRl0ICFupFmIv1ODLVmuwzHdPohzXNKjNap6ifdtUy8jukVNTHvIQC7EnriYxUVYi UnJ3GdKyuqRxLyqjT/KFI4odK6+dhqRjyv3nGfCloaMTepJbMN2JN627JsH3MNifC+7xGhOpknHx uUklZHHVWigB+wx4NA1FzafaXaKlmosoop4Yknd6l6o08TTdkBBHzUx6ed/Uv7cGXdhmWRSizDbK WRY4szMkjclRaWlJJ9gEOGOiuxarPo64vbbRI/pBtEJtM3CU1kJNgGO55c/HEZS7Jzn0cw55tbTz R1HpFJtywk3UlNTaG0m+ltEatY252IOJdAheIGii+Zwe7X7sVluWjsNmyhCU8r1hQULSIIN504m/ ZI8h1xlr+W/8NdDz2/oBzBapa6cVfznWd7fxw+NraGed767iPtZ9I8s9zL+JcOgKmS0KVT1kC0mr ijIu40etrv2bf3w2Vra7CI3vpuPG3heTKVNG8TJFPbPdwLXrdCjWf+vUeftxi8N+2vt6G7xX66d6 +p5/J6jeRxvMA4Q0eaQRiCShl1w/Jkrpt2eXeRjI5RfJrUZLgk3eY2twU9vDs/qxGnZNn0YY8xJu aKcnx7P6sGnYWfQAz3ZjaKtr6PMoqF9xBrgZSRr7Vm1W6W5eOLKpFPcq6cmtjkbP5+putFKCOhBX 88NzYismRv0BtDYjg5bN6wuvPz7WDNiGVI0Nmc/lYRCikBkOkE6bc+XPmcDrRBUZH//Z',
			click: (function (_this) {
				return function () {
					_this.loadGraph(_this.reloadGraph);
				}
			}(this)),
			backgroundPosition: '0 -177px'
		});
		layout.addMembers(lable9);

		var lable10 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '后退',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			// backgroundImage:'data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwM DAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAg ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCABYADgDAREA AhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABQYDBAABAgf/xAA9EAACAQIDBQQFCgUFAAAAAAAB AgMEEQAFEgYTFCExIkFRcRUyYXOUIzQ2VJGxstHS0xZVVoGVB0JTYpL/xAAZAQACAwEAAAAAAAAA AAAAAAAAAwECBAX/xAAoEQACAQIGAAYDAQAAAAAAAAAAAQIDERITITFBUQRhcYGh8CMywSL/2gAM AwEAAhEDEQA/AH2np4JYEmmQSzSgSSSSDUzM3Mkk3JuTjstnFSL9BkMVbv8AdRQjh4mmfUv+1etr A88UlUsXjSuVeCo/+CP/AMjFsTK4UJ+2VOsuZ5dlzM3o9t5UNRhjuTMNKCTd+rqCm17YlK7VyG7J 2KX8PZR9XX7MOy0JzGFM8/09pcm4XiYoH4uITR7u5sp8bqvPCqbjPbgbUU4b8gxMly+ndZ6ePczw kSRTR9l0deasrDmCCORwx00LVRj5RfM4Pdr92Ey3HR2G7Ic+gEE8UsFJDuaRgjlQrSsoACsSe1q7 x34yVKfrua6VX02AOZV/GziXcRU9l06IV0r1Jvbx54fCNhE5XEXaz6R5Z7mX8S4fATMJbPZ56GrX qeFiq9cZj3cwuouwN/Ps4tVp41bYpSqYHfcdNsdsaIUUNNTQ0VXxdFokkTSzQMykaVsTp035DGOh Qd7u6szZ4jxCtZWd0ebSeo3kcdE5w2COOAtBFmEc0UTFEkEEzghTYWZBpPmMZb34NVrcm7n62nw1 T+WD2+UHv8My5+tp8NU/lg9vlB7/AAwHtFR5COFzOvz2OCqSZqeKm3MrMUKBidyFMtgQO36vd1OI x2exOC63KHGbM/zofBVf6MMzn0UyV2ZxmzP86HwVX+jBnPoMldktNLsxPUxQNniosrqhd6WpjUBj a5d0CqPa3IYh1n0CorsZaL5nB7tfuxWW5aOwTTJs2kRZEo5mRwGVghsQehGF5kexmXLogqaSppnE dRE0Lkagrixt48/LEppkOLW4kbXIp2jyy4v8jL+JcNgKmWcvyiszGYwUNMaiVV1lEFzpBAv9pw2U lHcVGDlsXZ9jdoYIZJ5sskSKJS8jlRYKouSfIYoq0HyXdCa4A0kce7bsjoe7DRI3UXzOD3a/djNL c1R2CaZzm0aLGlZMqIAqqHNgB0AwvLj0MzJdkFTV1NS4kqJWmcDSGc3NvDn54lJIhyb3Enaz6R5b 7mX8S4dATMs5fmeYZdMZ6GdqeVl0F05HSSDb7RhsoKW4qM3HYvT7XbSzwyQTZjM8UqlJEJ5FWFiD 5jFFQguC7rzfIGk9RvI4aKGwLROWkpaSRKZ2LQqapkOgm63VUYDl3Xxl15fwatOF8m91H9Xf4yT9 vBf7YPu5m6j+rv8AGSft4L/bB93AW0eZZBRilp3ySWrzeWZpI34nSohCAMd9pL3LEdjTbvviP9X0 JWG2pQ9Lw/063+Qf9nF/yFL0zPS8P9Ot/kH/AGcH5AvTJKfOaBaiJqnZ6QUwdTPorTI2i/asjRKG Nu4kX8cQ1UJTpjfke6vQiVN5GRGGS9r3AHdilTkvT4CWYwUKZtmEbkwxxmTh1QctYPZX2DC4t4UM mliZtIqZtnJZREBUJUIhm6kghj/bBd4/YLLB7nne1n0jyz3Mv4lxpgZ5h2OChfYqeoFOorIqyOM1 HVirKxt7B5YG3meViLLL87lWmjyhczy4R6quGQRcXFJ8naVjZlBHVRy88WeKz4KrDdcnG1cENPn2 ZwwoI4o5pFRF5AAHoMFF3gvQKytN+oZyvM4aVIHEkYmhUApLpNmAtzVvDCpwuNhOxek2kLzzTmeA SVEbRSkCMXVuvTv9vXFMovmnKbQqlCaIS0+4bmbiMtfx1dbi/I4MrW+oZultBI2ocSZ5l86dqBEk iaYeprJVgurpe2HREy2CEW0VXHlTZWu44R7lgYoy5bn2tZGrUL8j3Yu6axYuSiqPDh4NfxBV8VSV LNC8lDEsFOGjRl0ICFupFmIv1ODLVmuwzHdPohzXNKjNap6ifdtUy8jukVNTHvIQC7EnriYxUVYi UnJ3GdKyuqRxLyqjT/KFI4odK6+dhqRjyv3nGfCloaMTepJbMN2JN627JsH3MNifC+7xGhOpknHx uUklZHHVWigB+wx4NA1FzafaXaKlmosoop4Yknd6l6o08TTdkBBHzUx6ed/Uv7cGXdhmWRSizDbK WRY4szMkjclRaWlJJ9gEOGOiuxarPo64vbbRI/pBtEJtM3CU1kJNgGO55c/HEZS7Jzn0cw55tbTz R1HpFJtywk3UlNTaG0m+ltEatY252IOJdAheIGii+Zwe7X7sVluWjsNmyhCU8r1hQULSIIN504m/ ZI8h1xlr+W/8NdDz2/oBzBapa6cVfznWd7fxw+NraGed767iPtZ9I8s9zL+JcOgKmS0KVT1kC0mr ijIu40etrv2bf3w2Vra7CI3vpuPG3heTKVNG8TJFPbPdwLXrdCjWf+vUeftxi8N+2vt6G7xX66d6 +p5/J6jeRxvMA4Q0eaQRiCShl1w/Jkrpt2eXeRjI5RfJrUZLgk3eY2twU9vDs/qxGnZNn0YY8xJu aKcnx7P6sGnYWfQAz3ZjaKtr6PMoqF9xBrgZSRr7Vm1W6W5eOLKpFPcq6cmtjkbP5+putFKCOhBX 88NzYismRv0BtDYjg5bN6wuvPz7WDNiGVI0Nmc/lYRCikBkOkE6bc+XPmcDrRBUZH//Z',
			click: (function (_this) {
				return function () {
					_this.undoMng.undo();
				}
			}(this)),
			backgroundPosition: '0 -221px'
		});
		layout.addMembers(lable10);

		var lable11 = isc.Label.create({
			_parent: this,
			height: 21,
			width: 28,
			prompt: '前进',
			backgroundImage: 'itop/common/widget/smartclient/JGWorkFlowGraph/images/JGWorkFlowGraph_Background.png',
			click: (function (_this) {
				return function () {
					_this.undoMng.redo();
				}
			}(this)),
			backgroundPosition: '0 -199px'
		});
		layout.addMembers(lable11);
		/*
		//复制，粘贴按钮
		var lable5 = isc.Label
			.create({
				_parent:this,
				height:21,
				width:28,
				backgroundImage:'itop/common/wooui/themes/default/images/btn-bg.jpg',
				click:(function (_this) {
					return function () {
						_this.copy();
					}
				}(this)),
				backgroundPosition:'0 -66px'
			})

		layout.addMembers(lable5);
	    
		var lable6 = isc.Label
			.create({
				_parent:this,
				height:21,
				width:28,
				backgroundImage:'itop/common/wooui/themes/default/images/btn-bg.jpg',
				click:(function (_this) {
					return function () {
						_this.paste(); 
					}
				}(this)),
				backgroundPosition:'0 -66px'
			})

		layout.addMembers(lable6);
		*/

		this.addChild(layout);
	},

	//初始化mxgraph面板的监听
	initUndoManager: function () {
		var _mxgraph = this._graph;
		var undoMng = new mxUndoManager();
		var listener = function (sender, evt) {
			undoMng.undoableEditHappened(evt.getProperty('edit'));
		};
		_mxgraph.getModel().addListener(mxEvent.UNDO, listener);
		_mxgraph.getView().addListener(mxEvent.UNDO, listener);
		this.undoMng = undoMng;
	},

	//初始化自动布局
	initLayout: function (layout, _mxgraph, selectedCells, status) {
		layout.useBoundingBox = false;
		layout.edgeRouting = false;
		layout.sortEdges = true;
		layout.nodeDistance = 66;

		// this.getCellsInfo(status);

		// var first = layout;
		// var second = new mxEdgeLabelLayout(_mxgraph);
		// var layouts = new mxCompositeLayout(_mxgraph, [first, second], first);
		layout.execute(_mxgraph.getDefaultParent());
		layout.resizeParent = true;

		// layout.execute(_mxgraph.getDefaultParent());
		_mxgraph.clearSelection();
		var style = _mxgraph.getStylesheet().getDefaultEdgeStyle();
		style[mxConstants.STYLE_ROUNDED] = false;
		style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;

		_mxgraph.alternateEdgeStyle = 'elbow=vertical';
		// _mxgraph.getStylesheet().getDefaultEdgeStyle().edgeStyle = mxEdgeStyle.ElbowConnector;
		var allEdges = _mxgraph.getChildEdges();

		if (!allEdges || allEdges.length <= 0)
			return;

		if (allEdges && allEdges.length > 0) {
			for (var i = 0, len = allEdges.length; i < len; i++) {
				var tmpEdge = allEdges[i];
				_mxgraph.orderCells(true);
				_mxgraph.refresh(tmpEdge);
			}
		}

		selectedCells && selectedCells.length > 0 && _mxgraph.setSelectionCells(selectedCells); //重新选中节点

		mxEdgeHandler.prototype.virtualBendsEnabled = true;
		mxEdgeHandler.prototype.manageLabelHandle = true;
		mxEdgeHandler.prototype.checkLabelHandle();
		mxEdgeHandler.prototype.dblClickRemoveEnabled = true;
		// 使线在所有节点的底下
		setTimeout(function () {
			_mxgraph.orderCells(true);
		}, 0)

	},

	initAttribute: function () {
		// mxResources.loadDefaultBundle = false;
		// mxResources.loadSpecialBundle = false;

		mxConstants.VERTEX_SELECTION_STROKEWIDTH = 0; // 活动选择时，边框宽度
		mxConstants.EDGE_SELECTION_DASHED = false; // 活动选择时，边框的样式
		mxConstants.VERTEX_SELECTION_COLOR = '#78FA7B'; // 颜色

		mxConstants.HANDLE_SIZE = 5; // 拉伸块的高宽
		mxConstants.HANDLE_FILLCOLOR = '#97C500'; // 拉伸块的填充颜色
		mxConstants.HANDLE_STROKECOLOR = '#458700'; // 拉伸块的边的颜色

		mxConstants.DEFAULT_VALID_COLOR = '#CFE870'; // 鼠标移到活动上方时，高亮框的颜色
		mxConstants.HIGHLIGHT_STROKEWIDTH = 2; // 鼠标移到活动上方时高亮框的宽度

		mxConstants.VERTEX_SELECTION_DASHED = false; // 连线被选择时，边框的样式

		mxConstants.VALID_COLOR = '#5F98C3'; // 拉线时，有效的线的颜色
		mxConstants.INVALID_COLOR = 'red'; // 拉线时，无效的线的颜色

		/*
		 // 连线时，距活动有一定距离
		 mxGraphViewGetPerimeterPoint = mxGraphView.prototype.getPerimeterPoint;
		 mxGraphView.prototype.getPerimeterPoint = function(terminal, next, orthogonal, border) {
		 var point = mxGraphViewGetPerimeterPoint.apply(this, arguments);
		 if (point != null) {
		 var perimeter = this.getPerimeterFunction(terminal);

		 if (terminal.text != null && terminal.text.boundingBox != null) {
		 // Adds a small border to the label bounds
		 var b = terminal.text.boundingBox.clone();
		 b.grow(3);
		 if (mxUtils.rectangleIntersectsSegment(b, point, next)) {
		 point = perimeter(b, terminal, next, orthogonal);
		 }
		 }
		 }
		 return point;
		 };
		 */
	},

	draw: function () {
		this.Super("draw", arguments);
		//this.graphDestroy();
		this.initGraph();
		this.bindEvents();

		this.restoreGraph(); //恢复渲染前加载的流程图
	},

	restoreGraph: function () {
		if (this._loadedGraph) {
			this.loadGraph(this._loadedGraph);
			this._loadedGraph = null;
		}

	},

	redraw: function () {
		//此控件不提供redraw方法。如果调用redraw会把之前draw的dom元素清理掉。第三方控件就失效了。
		//this.Super("redraw", arguments);
		//this.graphDestroy();
		//this.initGraph();
		//this.bindEvents();
	},

	//对象摧毁
	graphDestroy: function () {
		if (this._graph != null) {
			this._graph.destroy();
		}
	},

	//初始化DIV对象
	getInnerHTML: function () {
		var accum = isc.StringBuffer.newInstance();
		accum.append('<div ');
		accum.append('id ="' + this.getGraphID() + '" ');
		if (!this.Background) {
			//		            this.Background = 'url(itop/common/wooui/themes/default/images/grid.gif)';
			this.Background = "#fff";
		}
		if (this.Dock == "None") {
			//泊靠为None时，没有放到布局中，就是固定大小
			accum.append('style="overflow:auto;background:' + this.Background + ';width:' + this.Width + 'px;height:' + this.Height + 'px;top: 0;left: 0">');
		} else {
			//有布局时要随着窗口的变化而变化
			accum.append('style="overflow:auto;background:' + this.Background + ';width:100%;height:100%;top: 0;left: 0">');
		}
		accum.append('</div>');
		return accum.toString();
	},

	//统一DIV ID
	getGraphID: function () {
		return (this.id ? this.id : '') + '_graphContainer';
	},

	//取DIV
	getGraphContainer: function () {
		return window[this.getGraphID()];
	},

	//边缘连线，中间拖动，目前未使用此功能
	initConnectionConstraints: function (graph) {
		if (graph.connectionHandler.connectImage == null) {
			graph.connectionHandler.isConnectableCell = function (cell) {
				return false;
			};
			mxEdgeHandler.prototype.isConnectableCell = function (cell) {
				return graph.connectionHandler.isConnectableCell(cell);
			};
		}
		mxGraph.prototype.getAllConnectionConstraints = function (terminal, source) {
			if (terminal != null && terminal.shape != null) {
				if (terminal.shape.stencil != null) {
					if (terminal.shape.stencil != null) {
						return terminal.shape.stencil.constraints;
					}
				}
				else if (terminal.shape.constraints != null) {
					return terminal.shape.constraints;
				}
			}

			return null;
		};

		// Defines the default constraints for all shapes
		mxShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
		new mxConnectionConstraint(new mxPoint(0.5, 0), true),
		new mxConnectionConstraint(new mxPoint(0.75, 0), true),
		new mxConnectionConstraint(new mxPoint(0, 0.25), true),
		new mxConnectionConstraint(new mxPoint(0, 0.5), true),
		new mxConnectionConstraint(new mxPoint(0, 0.75), true),
		new mxConnectionConstraint(new mxPoint(1, 0.25), true),
		new mxConnectionConstraint(new mxPoint(1, 0.5), true),
		new mxConnectionConstraint(new mxPoint(1, 0.75), true),
		new mxConnectionConstraint(new mxPoint(0.25, 1), true),
		new mxConnectionConstraint(new mxPoint(0.5, 1), true),
		new mxConnectionConstraint(new mxPoint(0.75, 1), true)];

		// Edges have no connection points
		mxPolyline.prototype.constraints = null;
	},

	initGraph: function () {

		// 禁止右键默认菜单
		mxEvent.disableContextMenu(this.getGraphContainer());
		//创建graph对象
		var _this = this;
		this._graph = new mxGraph(this.getGraphContainer());
		var element = document.getElementById(this.getGraphID());
		this.addScrollListener(this, element, this.wheelHandle);
		// mxGraph.prototype.setPanning = function(enabled) {

		// 	_this._graph.panningHandler.panningEnabled = enabled;
		// }
		// this.initConnectionConstraints(this._graph);
		// 禁止连线上的文字单独移动
		this._graph.edgeLabelsMovable = false;

		//禁止两个节点之间同一方向有多条连线
		this._graph.multigraph = false;
		//禁止多条连线校验失败时弹出alert
		this._graph.validationAlert = function () {
			return null;
		}


		// 是否允许线不连接活动
		this._graph.allowDanglingEdges = false;
		// 是否允许流程图整体移动，使用鼠标右键移动
		// this._graph.setPanning(true);
		// 允许提示
		this._graph.setTooltips(true);
		this._graph.setConnectable(true);

		// 是否允许缩放活动
		this._graph.setCellsResizable(true);

		// 不可以断开线
		this._graph.setCellsDisconnectable(false);

		// createTarget是否在拉线的时候生成新的活动，默认不生成为false
		this._graph.connectionHandler.createTarget = false;

		mxGraphHandler.prototype.guidesEnabled = true;
		mxEdgeHandler.prototype.snapToTerminals = true;

		// 是否允许连接
		if (this.ReadOnly) {
			this._graph.setConnectable(false);
			this._graph.setCellsMovable(false);
			this._graph.setCellsResizable(false); // 是否允许缩放活动
			this._graph.setCellsDeletable(false);
		} else {
			this._graph.setConnectable(true);
			this._graph.setCellsMovable(true);
			this._graph.setCellsResizable(true); // 是否允许缩放活动
			this._graph.setCellsDeletable(true);
		}

		//不允许双击编辑名称
		this._graph.setCellsEditable(false);

		// 禁止弯曲连接线
		// this._graph.setCellsBendable(false);
		// this._graph.panningHandler.panningEnabled = true;


		// 多选框 范围选择
		new mxRubberband(this._graph);

		this._graph.parent = this._graph.getDefaultParent();

		var defaultVertexStyle = this._graph.getStylesheet().getDefaultVertexStyle();
		defaultVertexStyle[mxConstants.STYLE_FONTCOLOR] = '#000000'; // 设置活动文字的颜色
		defaultVertexStyle[mxConstants.STYLE_DASHED] = '1'; // 边框变成虚线
		defaultVertexStyle[mxConstants.STYLE_PERIMETER_SPACING] = 6; // 线的结点距离活动的距离

		var defaultEdgeStyle = this._graph.getStylesheet().getDefaultEdgeStyle();
		defaultEdgeStyle[mxConstants.STYLE_STROKECOLOR] = '#5F98C3';
		defaultEdgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
		defaultEdgeStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#ffffff';

		if (this._graph.isShow !== true) {
			// wrap.hide();
		}
		this.initOutline();
	},

	drop: function (event, eventInfo) {
		var _mxgraph = this._graph;
		var activityPanel = isc.EventHandler.getDragTarget().parentElement;
		if (activityPanel && activityPanel.widgetId) {
			// if(activityPanel._lastSelectedTileRecord.commonName === '结束'){
			// 	this.getOverCellInfo();
			// }
			//this._callEvent(this, 'ActivityDrop', activityPanel.widgetId, event.x + 10, event.y + 10);
			this.ActivityDrop(activityPanel.widgetId, event.x + 10, event.y + 10);
		}
	},

	getOverCellInfo: function () {
		var mxGraph = this._graph;
		var parent = mxGraph.getDefaultParent();
		var parentChildren = parent.children;
		var overCellVertex = '';
		//获取所有信息
		for (var i = 0; i < parentChildren.length; i++) {
			var child = parentChildren[i];
			if (!child.isVisible()) {
				continue;
			}
			if (child.isVertex()) {
				if (child.value === '结束' && overCellVertex == '') {
					overCellVertex = child.id;
					// 			var obj = new Object();
					// 　　　　　　 obj.ID = child.id;
					// 　　　　　　 obj.Name = child.value;
					// 　　　　　　 obj.LeftTopX = child.geometry.x;
					// 　　　　　　 obj.LeftTopY = child.geometry.y;
					// 　　　　　　 overCellVertex.push(obj);
				}
			}
		}
		this.overCellVertex = overCellVertex;
	},

	getCellsInfo: function (status) {
		var mxGraph = this._graph;
		var parent = mxGraph.getDefaultParent();
		var parentChildren = parent.children;
		var arrVertexLeftTopX = [];
		var arrVertexLeftTopY = [];
		var index = 0;
		//获取所有信息
		for (var i = 0; i < parentChildren.length; i++) {
			var child = parentChildren[i];
			if (!child.isVisible()) {
				continue;
			}
			if (child.isVertex()) {
				arrVertexLeftTopX.push(child.geometry.x);
				arrVertexLeftTopY.push(child.geometry.y);
				if (child.value == this.overCellVertex) {
					index = i;
				}
			}
		}
		if (status == true) {
			parentChildren[index].geometry.y = Math.max.apply(null, arrVertexLeftTopY) + 10;
		} else {
			parentChildren[index].geometry.x = Math.max.apply(null, arrVertexLeftTopX) + 10;
		}
	},

	//绑定事件
	bindEvents: function () {
		this._graph.addListener(mxEvent.Select, (function (_this) {
			return function (sender, evt) {

				//_this.focus();
				//_this.blur();
				//_this.getClipHandle().focus();
				if (evt.name != "fireMouseEvent") {
					if (_this.getID() != isc.JGWorkFlowGraph.currentInstanceId || _this.getID() != _this._currentInstanceId) {
						isc.JGWorkFlowGraph.currentInstanceId = _this.getID();
						_this._currentInstanceId = _this.getID();
						//console && console.log('_graph SelectedWF');
						_this.SelectedWF(_this);
						//console && console.log('mxGraph Select');
						//_this._callEvent(_this, 'NoneSelected', null, _this, _this);
					}
				}
			}
		})(this));

		this._graph.addListener(mxEvent.CLICK, (function (_this) {
			return function (sender, evt) {

				//必须先获取焦点，属性编辑器的编辑框会失去焦点，从而进行值同步
				_this.focus();
				_this.blur();
				_this.getClipHandle().focus();
				_this.getClipHandle().blur();
				_this._graph.container.focus();


				var cell = evt.getProperty('cell'); // cell may be null
				var consumed = evt.consumed;
				if ((!cell || cell == null) && !consumed) {
					//console && console.log('mxGraph Click');
					_this.NoneSelected(null, _this, _this);
				}
				//_this._callEvent(_this, 'NoneSelected', null, _this, _this);
			}
		})(this));


		this._graph.getSelectionModel().addListener(mxEvent.CHANGE, (function (_this) {
			return function (sender, evt) {

				//先获取焦点，属性编辑器的编辑框会失去焦点，从而进行值同步。
				//已改为在规则中自动触发更新数据
				//_this.focus();
				//_this.blur();
				//_this.getClipHandle().focus();

				var cells = this.graph.getSelectionCells();
				//判断是否为数组
				if (cells != undefined && Object.prototype.toString.apply(cells) === '[object Array]') {
					if (cells.length > 0) {
						//提取选中的cell的id
						var cellIDArray = [];
						for (var i = 0; i < cells.length; i++) {
							cellIDArray.push({ 'id': cells[i].getId(), 'isEdge': cells[i].isEdge() });
						}
						//console && console.log('SelectionModel CHANGE');
						_this.SelectAction(_this, cellIDArray);
					} // else {
					// console && console.log('_graph NoneSelected');
					//    _this._callEvent(_this, 'NoneSelected', null, _this, _this);
					//}
				}
			}
		})(this));


		//监听线增加事件
		this._graph.addListener(mxEvent.CELLS_ADDED, (function (_this) {
			return function (sender, evt) {
				var cellsAdded = evt.properties.cells;
				if (cellsAdded.length > 0) {
					//默认获取第一个
					var cell = evt.properties.cells[0];
					if (cell.isEdge()) {
						var sourceID = evt.properties.source.getId();
						var targetID = evt.properties.target.getId()
						_this.insertEdge(_this, cell.getId(), sourceID, targetID);
					}
				}
			}
		})(this));


		//监听活动删除事件
		this._graph.addListener(mxEvent.REMOVE_CELLS, (function (_this) {
			return function (sender, evt) {
				var cellsDeleted = evt.properties.cells;

				var actArray = [];
				for (var i = 0; i < cellsDeleted.length; i++) {
					var tmpCell = cellsDeleted[i];
					// 排除连线
					actArray.push(tmpCell.id);
				}

				// 触发删除活动事件
				if (actArray.length > 0) {
					_this._callEvent(_this, 'deleteCell', actArray);
				}
			}
		})(this));

		this._graph.isRightMouseButton = function (evt) {
			console.log(11)
		}

		// 监听键盘del按钮
		_this = this;
		this._keyHandler = new mxKeyHandler(this._graph);
		//delete
		this._keyHandler.bindKey(46, function (evt) {
			if (_this._graph.isEnabled()) {
				_this._graph.removeCells();
			}
		});
		//copy
		this._keyHandler.bindControlKey(67, function (evt) {
			if (_this._graph.isEnabled()) {
				_this.copy();
			}
		});
		//paste
		this._keyHandler.bindControlKey(86, function (evt) {
			if (_this._graph.isEnabled()) {
				_this.paste();
			}
		});
		// ctrl+z
		this._keyHandler.bindControlKey(90, function (evt) {
			if (_this._graph.isEnabled()) {
				_this.undoMng.undo();
			}
		});
		// ctrl+y
		this._keyHandler.bindControlKey(89, function (evt) {
			if (_this._graph.isEnabled()) {
				_this.undoMng.redo();
			}
		});
		//move(空格按键)
		// this._keyHandler.bindKey(32, function(evt) {
		//     if (_this._graph.isEnabled()) {
		// 		mxPanningHandler.prototype.start(evt);
		// 		// this._graph.isRightMouseButton(evt);
		//     }
		// });

		// 重写mxGraph滚轮事件
		mxEvent.addMouseWheelListener(function (evt, up) {

		});
	},

	/**
	 * 复制
	 */
	copy: function () {
		//先清空被复制的记录
		this._sourceCells = null;
		var graph = this._graph;
		var cells = new Array();
		cells = graph.getSelectionCells();
		this._sourceCells = cells;
		mxClipboard.copy(graph, cells);
	},


	/**
	 * 粘贴
	 */
	paste: function () {
		var graph = this._graph;
		mxClipboard.paste(graph);
		var sourceCells = this._sourceCells;
		var cells = graph.getSelectionCells();
		//判断是否为数组
		if (cells != undefined && Object.prototype.toString.apply(cells) === '[object Array]') {
			if (cells.length > 0) {
				for (var i = 0; i < cells.length; i++) {
					//提取选中的cell的id
					var cellIDArray = [];
					cellIDArray.push({ 'id': cells[i].getId(), 'sourceId': sourceCells[i].getId(), 'isEdge': cells[i].isEdge() });
					this.CopyActivity(this, cellIDArray);
					// 复制后自动选中环节
					this.SelectAction(this, cellIDArray);
				}
			}
		}
		//粘贴完后，把被复制的记录清空
		//有可能一次复制多次粘贴的，所这里不清空处理
		//this._sourceCells = null;
	},

	//监听是否是在画布区域
	addScrollListener: function (_this, element, wheelHandle) {
		if (typeof element != 'object') return;
		if (typeof wheelHandle != 'function') return;

		// 监测浏览器
		if (typeof arguments.callee.browser == 'undefined') {
			var user = navigator.userAgent;
			var b = {};
			b.opera = user.indexOf("Opera") > -1 && typeof window.opera == "object";
			b.khtml = (user.indexOf("KHTML") > -1 || user.indexOf("AppleWebKit") > -1 || user.indexOf("Konqueror") > -1) && !b.opera;
			b.ie = user.indexOf("MSIE") > -1 && !b.opera;
			b.gecko = user.indexOf("Gecko") > -1 && !b.khtml;
			arguments.callee.browser = b;
		}
		if (element == window)
			element = document;
		if (arguments.callee.browser.ie)
			element.attachEvent('onmousewheel', function () {
				wheelHandle.apply(_this, arguments)
			});
		else
			element.addEventListener(arguments.callee.browser.gecko ? 'DOMMouseScroll' : 'mousewheel', wheelHandle.bind(_this), false);
	},
	//滚轮事件
	wheelHandle: function (e) {
		var upcheck;
		var _this = this;
		if (e.wheelDelta) {
			upcheck = e.wheelDelta > 0 ? 1 : 0;
		} else {
			upcheck = e.detail < 0 ? 1 : 0;
		}
		if (upcheck) {
			_this._graph.zoom(1.1);
		}
		else {
			_this._graph.zoom(0.9);
		}

		if (window.event) {
			e.returnValue = false;
			window.event.cancelBubble = true;
		} else {
			e.preventDefault();
			e.stopPropagation();
		}
	},
	/**
	 * 取画布对象
	 */
	getGraph: function () {
		var _mxgraph = this._graph;
		var encoder = new mxCodec();
		var node = encoder.encode(_mxgraph.getModel());

		// 处理折线直线保存到XML文件中
		if (node) {
			if (!node.hasAttribute("class"))
				node.setAttribute("class", "");

			var curClassName = node.getAttribute("class");
			var newClassName = curClassName.replace(/\s?broken-line\s?/g, "");

			if (_mxgraph.getStylesheet().getDefaultEdgeStyle().edgeStyle) {


				var newClassName = "";

				if (!curClassName)
					newClassName = "broken-line";
				else {
					newClassName = curClassName.replace(/\s?broken-line\s?/g, "");
					newClassName += " broken-line";
				}

				node.setAttribute("class", newClassName);
			}

		}
		this.reloadGraph = mxUtils.getPrettyXml(node);
		return mxUtils.getPrettyXml(node);
	},
	/**
	 * 取画布对象中的画线对象
	 */
	getGraphChildEdges: function () {
		var encoder = new mxCodec();
		var childEdges = this._graph.getChildEdges();
		var jsonStr = '[';

		var array = [];
		for (var i = 0; i < childEdges.length; i++) {

			var arrayTemp = {};
			arrayTemp.id = childEdges[i].id;
			if (childEdges[i].source)
				arrayTemp.source = childEdges[i].source.id;
			if (childEdges[i].target)
				arrayTemp.target = childEdges[i].target.id;
			array.push(arrayTemp)
		}
		return array;
	},
	/**
	 * 初始化加载画布对象
	 */
	loadGraph: function (str) {

		if (!this.isDrawn()) {
			this._loadedGraph = str;
			return;
		}


		if (!mxClient.isBrowserSupported()) {
			mxUtils.error('Browser is not supported!', 200, false);
		} else {

			this._graph.getModel().beginUpdate();
			this._graph.isHtmlLabel = function (cell) {
				return true;
			};

			if (str != null && str != '') {
				var xmlDom = null
				if (document.all) {
					xmlDom = new ActiveXObject("Microsoft.XMLDOM");
					xmlDom.loadXML(str);
				} else {
					xmlDom = new DOMParser().parseFromString(str, "text/xml");
				}

				if (xmlDom) {
					// 处理折线和直线连接线设置
					var _mxgraph = this._graph;
					if (str.indexOf("broken-line") !== -1)
						_mxgraph.getStylesheet().getDefaultEdgeStyle().edgeStyle = mxEdgeStyle.ElbowConnector;
					else
						_mxgraph.getStylesheet().getDefaultEdgeStyle().edgeStyle = null;

					var dec = new mxCodec(xmlDom);

					dec.decode(xmlDom.documentElement, this._graph.getModel());
					this.reloadGraph = str;
				}
			} else {
				this.deleteActivitys();
			}
			this._graph.getModel().endUpdate();
			this.initUndoManager();

		}
		//加载完后，触发一下点空白的动作
		this.NoneSelected(null, this, this);
	},
	/**
   * 获取流程图XML
   */
	getGraphXML: function () {
		return this.getGraph();
	},
	/**
   * 获取流程图XML
   */
	getProcessFileXML: function (widgetId) {
		// 获取流程活动环节配置数据
		var datasource = this.getDataSource();
		var processFileDatas = datasource.getAllRecords();
		for (var i = 0; i < processFileDatas.length; i++) {
			if (undefined == processFileDatas[i].activityId)
				processFileDatas.splice(i, 1)
		}
		var processFileXml = this._generateProcessXml(processFileDatas);
		return processFileXml;
	},

	
    /**
     * 将前台数据提交后台，并生成XML数据
     * 
     * @param processFileDatas
     *            活动环节DB数据
     */
    _generateProcessXml: function(processFileDatas) {
        var componentCode = this.componentCode;
        var windowCode = this.widgetCode;
        var params = {
            "processFileDatas": processFileDatas,
            "moduleId": windowCode
        }
        var ret = {};
        var requestParams = {
            "componentCode": componentCode,
            "windowCode": windowCode,
            "operation": "GenerateWorkFlowProcessXML",
            "isAsync": false,
            "params": params,
            "success": function(result) {
                ret = result == null ? {} : result.data.xml;
            },
            "error": function(result) {
				if(window.console&&window.console.warn){
					window.console.error("生成流程定义文件XML失败\n->" + result.message);
				}
                throw new Error("生成流程定义文件XML失败\n->" + result.message);
            }
        };
		this._remoteOperation(requestParams);
        return ret;
    },

	getDefinitionJson: function (widgetId) {
		var dsName = this.getTableNameFormVM(this.code);
		var datasource = this._getEntity(dsName);// this.getDataSource();//序列化需要使用平台实体
		return isc.JSON.encode(datasource.serialize());
	},

	setDefinitionJson: function (widgetId, definitionJson) {
		var datasource = this.getDataSource();
		datasource.clear();
		var unserializedb = this.createDatasourceFromJson(definitionJson);
		datasource.insertRecords({
			"records": unserializedb.getAllRecords().toArray()
		})
	},
	/*
	 * 设置线的样式
	 *
	 * fromCellId 线的起点节点id
	 * toCellId 线的重点节点id
	 * type 样式类型 此处可选 1:未运行 2:已运行
	 */
	setEdgeStyle: function (type, fromCellId, toCellId) {
		if (!fromCellId && !toCellId) { //如果两个参数都没传递，认为是修改所有线
			var edges = this._graph.getChildEdges();
		} else {
			var cell1 = this._graph.getModel().getCell(fromCellId);
			var cell2 = this._graph.getModel().getCell(toCellId);
			var edges = this._graph.getEdgesBetween(cell1, cell2, true);
		}
		this._setEdgeStyle(edges, type);
	},

	_setEdgeStyle: function (edges, type) {
		if (edges != null) {
			if (type == 1) {
				this._graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#CCCCCC', edges);
				this._graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 2, edges);
			} else if (type == 2) {
				this._graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#458800', edges);
				this._graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 3, edges);
			}
		}
	},

	//根据线id取两端的对象ids
	getSourceIdAndTargetIdByEdgeId: function (edgeId) {
		var edgeCell = this._graph.getModel().getCell(edgeId);
		var retObj = { "sourceId": "", "targetId": "" };
		if (edgeCell && edgeCell.source) {
			retObj["sourceId"] = edgeCell.source.id;
		}
		if (edgeCell && edgeCell.target) {
			retObj["targetId"] = edgeCell.target.id;
		}
		return retObj;
	},

	/*
	 * 获取所有的活动id
	 * 返回值：['id1','id2',...]
	 */
	getAllActivityID: function () {
		var res = [];
		var verties = this._graph.getChildVertices();
		if (verties.length) {
			for (var i = 0; i < verties.length; i++) {
				res.push(verties[i].getId());
			}
		}
		return res;
	},

	setCellAttr: function (id, name, value) {
		var cell = this._graph.getModel().getCell(id);
		cell[name] = value;
		cell.setAttribute(name, value);
	},


	getCellAttr: function (id, name) {
		var cell = this._graph.getModel().getCell(id);
		if (cell) {
			return cell[name] ? cell[name] : null;
		} else {
			return null;
		}
	},

	/*
	 * 获取当前选中的cell @para isIncludeEdges 是否包含边 默认不包含
	 */
	getSelectedCell: function (isIncludeEdges) {
		isIncludeEdges = (isIncludeEdges == undefined) ?
			false :
			isIncludeEdges;

		var actArray = [];
		var selectedCells = this._graph.getSelectionCells();
		for (var i = 0; i < selectedCells.length; i++) {
			var selectedCell = selectedCells[i];

			if (selectedCell != null && selectedCell.id != undefined) { // 有效判断

				if (!isIncludeEdges && selectedCell.isEdge()) {
					continue; // 如果是边而且不包含边，则跳过
				}
				actArray.push(selectedCell.id);
			}
		}

		return actArray;
	},

	/**
	 * 通过id选中某一个活动，并触发选中事件
	 */
	selectActivity: function (id) {
		if (this._graph.getModel().getCell(id)) {
			this._graph.setSelectionCell(this._graph.getModel().getCell(id));

			var cellIDArray = [];
			cellIDArray.push({ 'id': id, 'isEdge': false });	
			this.SelectAction(_this, cellIDArray);
			
		}
	},

	/**
	 * 删除所有的活动
	 */
	deleteActivitys: function () {
		this._graph.removeCells(this._graph.getChildCells());
	},

	/**
	 * 添加画布对象
	 */
	addGraph: function (imgSrc, x, y, value) {
		// 计算xy坐标
		var offset = mxUtils.getOffset(this._graph.container);
		var origin = mxUtils.getScrollOrigin(this._graph.container);
		x = x - offset.x + origin.x;
		y = y - offset.y + origin.y;
		var scale = this._graph.view.scale;
		var tr = this._graph.view.translate;
		// 处理缩放
		x = x / scale - tr.x;
		y = y / scale - tr.y;

		this.parent = this._graph.getDefaultParent();
		this._graph.getModel().beginUpdate();
		var cellId = null;
		try {
			var doc = mxUtils.createXmlDocument();

			var cell = this._graph
				.insertVertex(
					this.parent,
					null,
					value,
					x,
					y,
					32,
					32,
					'shape=image;image=' +
					imgSrc +
					';verticalLabelPosition=bottom;verticalAlign=top');
			cellId = cell.getId();
		} finally {
			this._graph.getModel().endUpdate();
		}
		return cellId;
	},

	/**
	 * @param {Object} dataSource
	 */
	bindDataSource: function (dataSource) {

	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this._graph.setWidth(percentWidth);
		//this._graph.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this._graph.setHeight(percentHeight);
		//this._graph.setHeight("100%");
	},

	destroy: function () {

		//关闭监听鼠标事件。
		//如果不关闭，当控件关闭弹出窗口时，会同时触发mxclient的鼠标事件，
		//而mxclient已经被销毁，此时将导致空指针错误。
		this._graph.getView().captureDocumentGesture = false;

		//graphView的销毁事件会跳过事件的关闭，所以手动调用
		mxEvent.removeAllListeners(document);
		mxEvent.release(this._graph.container);
		this._graph.getView().destroy();

		//销毁键盘监听
		this._keyHandler.destroy();

		//销毁整个第三方控件
		this._graph.destroy();

		//销毁sc部分控件
		this.Super("destroy", arguments);
	},
	/**
 * 增加活动
 */
	addActivity: function (activity, x, y, activityName) {
		return this.addGraph(activity, x, y, activityName);
	},

	/**
	 * 获取当前选择的所有活动
	 */
	getSelectedActivitys: function () {
		return this.getSelectedCell();
	},

	/**
	 * 获取所有的线
	 */
	getEdges: function () {
		return this.getGraphChildEdges();
	},

	/**
	 * 更新lable值
	 */
	changeActivityLabel: function (activityId, lableName) {
		this.changLabel(activityId, lableName);
	},

	/**
	 * 设置活动环节的背景图片样式
	 */
	setGraphCellStyle: function (activityId, imgSrc) {
		this.setCellStyle(activityId, imgSrc);
	},

	/**
	 * 获取默认值
	 */
	getProcessDefaultValue: function () {
		var _ProcessSetting = this._ProcessSetting;
		var type = "Process";
		this._genProcessSetting();
		if (_ProcessSetting && _ProcessSetting[type]) {
			var activityConfig = _ProcessSetting[type];
			if (activityConfig != null && activityConfig && activityConfig.property) {
				var activityData = activityConfig.property;
				var defaultObj = {};
				if (activityData && activityData.length > 0) {
					for (var i = 0, len = activityData.length; i < len; i++) {
						var propertyObj = activityData[i];
						var propertyName = propertyObj.PropertyName;
						var defaultValue = propertyObj.DefaultValue;
						defaultObj[propertyName] = defaultValue;
					}
				}
				return defaultObj;
			}
		} else {
			if (window.console && window.console.warn) {
				window.console.warn("无法根据流程获取属性编辑器信息!");
			}
			return null;
		}
	},

	/**
	 * 获取默认值
	 */
	getEdgeDefaultValue: function () {
		var _ProcessSetting = this._ProcessSetting;
		var type = "edge";
		this._genProcessSetting();
		if (_ProcessSetting && _ProcessSetting[type]) {
			var activityConfig = _ProcessSetting[type];
			if (activityConfig && activityConfig.property) {
				var activityData = activityConfig.property;
				var defaultObj = {};
				if (activityData && activityData.length > 0) {
					for (var i = 0, len = activityData.length; i < len; i++) {
						var propertyObj = activityData[i];
						var propertyName = propertyObj.PropertyName;
						var defaultValue = propertyObj.DefaultValue;
						defaultObj[propertyName] = defaultValue;
					}
				}
				return defaultObj;
			}
		} else {
			if (window.console && window.console.warn) {
				window.console.warn("无法根据流程获取属性编辑器信息!");
			}
			return null;
		}
	},

	/**
	 * 获取流程所有属性信息
	 */
	getProcessPropertyInfo: function () {
		var _ProcessSetting = this._ProcessSetting;
		this._genProcessSetting();
		if (!_ProcessSetting)
			return;
		var type = "Process";
		var activityConfig = _ProcessSetting[type];
		if (activityConfig && activityConfig.property) {
			return activityConfig.property;
		} else {
			if (window.console && window.console.warn) {
				window.console.warn("无法根据流程获取属性编辑器信息!");
			}
			return null;
		}
	},

	_getActivityConfig: function (type) {
		this._genProcessSetting();
		if (this._ProcessSetting) {
			return this._ProcessSetting[type];
		}
		return null;
	},

	/**
	 * 获取流程所有属性信息
	 */
	getProcessPropertyTypeInfo: function () {
		var activityConfig = this._getActivityConfig("Process");
		if (activityConfig && activityConfig.property) {
			return activityConfig.propertyType;
		} else {
			if (window.console && window.console.warn) {
				window.console.warn("无法根据流程获取属性编辑器信息!");
			}
			return null;
		}
	},

	// 获取活动线所有信息
	getEdgePropertyInfo: function (activityType) {
		var activityConfig = this._getActivityConfig(activityType);
		if (activityConfig && activityConfig.property) {
			return activityConfig.property;
		} else {
			if (window.console && window.console.warn) {
				window.console.warn("无法根据流程活动线类型（" + activityType + "）获取属性信息!");
			}
			return null;
		}
	},

	// 获取活动线所有分类信息
	getEdgePropertyTypeInfo: function (activityType) {
		var activityConfig = this._getActivityConfig(activityType);
		if (activityConfig && activityConfig.property) {
			return activityConfig.propertyType;
		} else {
			if (window.console && window.console.warn) {
				window.console.warn("无法根据流程活动线类型（" + activityType + "）获取属性分类信息!");
			}
			return null;
		}
	},

	_genProcessSetting: function () {
		// _ProcessSetting 写法有误，需每次获取新数据，不能作为全局对象
		//var pSettingStr = widgetContext.get(widgetId, "ProcessSetting");
		var pSettingStr = this.ProcessSetting;
		// 兼容ProcessSetting属性配置为对象的
		if (pSettingStr) {
			if (typeof pSettingStr == "object") {
				this._ProcessSetting = pSettingStr;
			} else if (typeof pSettingStr == "string" && pSettingStr != "") {
				var pSettring = isc.JSON.decode(pSettingStr);
				if (pSettring && pSettring.setting && pSettring.setting.Process && pSettring.setting.edge) {
					this._ProcessSetting = pSettring;
				}
			}
		}
	},

	getRelaJGActivityPanel: function () {
		return this.RelaJGActivityPanel;
	},

	getRelaJGPropertyEditor: function () {
		return this.RelaJGPropertyEditor;
	},

	getProcessSetting: function () {
		return this.ProcessSetting;
	},

	getCurActivityId: function () {
		var activityIds = this.getSelectedActivitys();
		var curActivityId = null;
		if (activityIds && activityIds.length > 0) {
			curActivityId = activityIds[0];
		}
		return curActivityId;
	},

	// 修改活动状态
	changeActivityState: function (widgetId, activityId, state) {
		if (_hasID(widgetId, activityId)) {
			// 根据状态获取图片路径
			var stateImageName = state + "Image",
				newStateImagePath = this.getCellAttr(activityId, stateImageName);

			if (newStateImagePath && newStateImagePath != "") {
				// 调用接口更新活动状态
				this.setCellStyle(activityId, newStateImagePath);
			}
		}
	},

	/**
	 * 获取流程图数据状态信息
	 */
	getHasInsertOrDeleteData: function (widgetId) {
		var datasource = this.getDataSource();
		// 取数据的状态信息
		var insertedRecords = datasource.getInsertedRecords();
		var deletedRecords = datasource.getDeletedRecords();
		return (insertedRecords && insertedRecords.size() > 0) || (deletedRecords && deletedRecords.size() > 0);
	},

	loadWorkGraph: function (xml) {
		this.loadGraph(xml);
	},

	getWorkGraph: function () {
		return this.getGraph();
	},

	selectGraphActivity: function (activityID) {
		this.selectActivity(activityID);
	},

	getGraphAllActivityID: function () {
		return this.getAllActivityID();
	},

	getGraphCellAttr: function (activityId, name) {
		return this.getCellAttr(activityId, name);
	},

	setGraphCellAttr: function (activityId, name, value) {
		this.setCellAttr(activityId, name, value);
	},

	setGraphEdgeStyle: function (type, fromCellId, toCellId) {
		this.setEdgeStyle(type, fromCellId, toCellId);
	},
	getGraphSourceIdAndTargetIdByEdgeId: function (edgeId) {
		return this.getSourceIdAndTargetIdByEdgeId(edgeId);
	},
	getDataSource: function () {
		var dsName = this.getTableNameFormVM(this.code);
		return isc.JGDataSourceManager.get(this, dsName);
	},
	setCellStyle: function(id, imgSrc) {
		var cell = this._graph.getModel().getCell(id);
		if (cell) {
			this._graph.setCellStyles('image', imgSrc, [cell]);
		}
	}

});

mxGraphViewGetPerimeterPoint = mxGraphView.prototype.getPerimeterPoint;
mxGraphView.prototype.getPerimeterPoint = function (terminal, next, orthogonal, border) {
	var point = mxGraphViewGetPerimeterPoint.apply(this, arguments);
	if (point != null) {
		var perimeter = this.getPerimeterFunction(terminal);

		if (terminal.text != null && terminal.text.boundingBox != null) {
			// Adds a small border to the label bounds
			var b = terminal.text.boundingBox.clone();
			b.grow(3);
			if (mxUtils.rectangleIntersectsSegment(b, point, next)) {
				point = perimeter(b, terminal, next, orthogonal);
			}
		}
	}
	return point;
};



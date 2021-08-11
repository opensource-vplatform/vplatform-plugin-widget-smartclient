isc.ClassFactory.defineClass("JGSteps", "JGBaseWidget");

// 定义v3ui控件属性
isc.JGSteps.addProperties({
	//绑定字段名称
	ColumnName: 'columnName',
	//事件监听队列
	listener: ['click', 'iconClick', 'titleClick', 'descClick'],
	DoneStatus: "Done",
	DoingStatus: "Doing",
	ToDoStatus: "ToDo",
	dynamicStep: null//动态步骤的实体信息：跳到指定步骤

});


isc.JGSteps.addMethods({
	_initWidget: function () {
		// initBindDataAndUIEvent();
		this.initBindDataAndUIEvent();
		// END

		this.stepBarBoxId = 'new_stepBar_' + this.getID();
		var _positionStyle = "";
		var _stepBarLine = '';
		if (this.Direction == "Horizontal") {
			_positionStyle = "new_JGStepBar"
			_stepBarLine = '<div class="new_JGStepBar-line"></div>';
		} else {
			_positionStyle = "new_JGStepBar-list"
		}
		if (this.OnTitleClick && this.OnTitleClick != "") {
			_positionStyle += " new_JGStepBarHasTitleClick";
		}
		if (this.OnDescClick && this.OnDescClick != "") {
			_positionStyle += " new_JGStepBarHasDescClick";
		}
		if (this.OnIconClick && this.OnIconClick != "") {
			_positionStyle += " new_JGStepBarHasIconClick";
		}
		var stepBar_box = '' + '<ul id="' + this.stepBarBoxId + '" class="new_VStepBar ' + _positionStyle + '"></ul>';

		this._stepBar_sc_obj = isc.Canvas.create({
			width: this.Width,
			height: this.Height,
			contents: stepBar_box,
		});
		this.overflow = "hidden";
		this.addChild(this._stepBar_sc_obj);
	},
	draw: function () {
		this.Super("draw", arguments);
		if (this.stepItems) {
			this.setStepBarItem(this.stepItems);
		}
	},
	bindDataSource: function () {
	},
	iconClick: function (id) {
		this._callEvent(this, 'iconClick', id);
	},
	titleClick: function (id) {
		this._callEvent(this, 'titleClick', id);
	},
	descClick: function (id) {
		this._callEvent(this, 'descClick', id);
	},
	creatStatus: function (items) {
		if (items && items.length > 0) {
			for (var i = 0; i < items.length; i++) {
				if (!this.statusColumn) {
					statusCode = i == 0 ? this.DoingStatus : this.ToDoStatus;
				} else {
					var statusCode = items[i][this.statusColumn];
					if (statusCode == null) {
						statusCode = i == 0 ? this.DoingStatus : this.ToDoStatus;
					}
				}
				var stepId = items[i][this.idColumn];
				this.setStepStatus(statusCode, stepId);
			}
		}
	},
	setStepStatus: function (statusCode, _id) {
		var target = $("#" + this.stepBarBoxId).find("li");
		if (target) {
			for (var i = 0; i < target.length; i++) {
				if ($(target[i]).data("stepid") == _id) {
					var _tar = $(target[i]);
					this.changeStepStyle(_tar, statusCode, _id);
				}
			}
		}
	},
	changeStepStyle: function (target, statusCode, _id) {
		var index = target.find(".new_JGStepBar-cont-number").attr("index");
		switch (statusCode) {
			case this.DoneStatus:
				target.find(".new_JGStepBar-cont-number").html("");
				target.removeClass("new_step-active").removeClass("new_step-undone").addClass("new_step-done");
				target.find(".new_JGStepBar-cont-number").addClass("iconfont icon-check");
				break;
			case this.DoingStatus:
				this.currentId = _id;
				target.find(".new_JGStepBar-cont-number").html(index);
				target.find(".new_JGStepBar-cont-number").removeClass("iconfont icon-check");
				target.removeClass("new_step-undone").removeClass("new_step-done").addClass("new_step-active");
				break;
			case this.ToDoStatus:
				target.removeClass("new_step-active").removeClass("new_step-done").addClass("new_step-undone");
				target.find(".new_JGStepBar-cont-number").removeClass("iconfont icon-check");
				target.find(".new_JGStepBar-cont-number").html(index);
				break;
		}
	},
	setStepBarItem: function (items) {
		this.stepItems = items;
		var datas = [];
		if (items.length > 0) {
			for (var i = 0, length = items.length; i < length; i++) {
				var tmpRecord = items[i];
				var temp = {};
				temp["_id"] = tmpRecord[this.idColumn];
				temp["title"] = tmpRecord[this.titleColumn];
				temp["desc"] = tmpRecord[this.descColumn];
				temp["status"] = tmpRecord[this.statusColumn];
				datas.push(temp);
			}
		}
		this.stepDatas = datas;
		var target = $("#" + this.stepBarBoxId);
		if (!target || target.length == 0) {
			return;
		}
		target.html("");
		var _StepLi = this.creartStepLi(datas);
		this.setClumnNum(target, datas);
		target.append(_StepLi);
		this.creatStatus(items);
	},
	creartStepLi: function (datas) {
		var direction = this.Direction;
		var stepBar_content = this.creatStepSurface(direction, datas);
		return stepBar_content;
	},
	creatStepSurface: function (direction, datas) {
		var stepBar_content = "";
		for (var i = 0; i < datas.length; i++) {
			var stepTitle = datas[i].title == "null" || datas[i].title == null ? "" : datas[i].title;
			var stepDesc = datas[i].desc == "null" || datas[i].desc == null ? "" : datas[i].desc;
			var stepID = datas[i]._id;
			var index = i + 1;
			if (direction == "Horizontal") {

				var _stepBarLine = '<div class="new_JGStepBar-line"></div>';
				if (i == 0) {
					stepBar_content += '<li class="new_step-start" data-stepID="' + stepID + '">' +
						_stepBarLine +
						'<div class="new_JGStepBar-cont">' +
						'<span class="new_JGStepBar-cont-number" onclick="' + this.ID + '.iconClick(\'' + stepID + '\');return false;" index = "' + index + '">' + index + '</span>' +
						'<p class="new_JGStepBar-cont-text" onclick="' + this.ID + '.titleClick(\'' + stepID + '\');return false;"><span>' + stepTitle + '</span></p>' +
						'<p class="new_JGStepBar-cont-comment" onclick="' + this.ID + '.descClick(\'' + stepID + '\');return false;">' + stepDesc + '</p>' +
						'</div>' +
						'</li>';
				} else if (i == datas.length - 1) {
					stepBar_content += '<li class="new_step-end" data-stepID="' + stepID + '">' +
						_stepBarLine +
						'<div class="new_JGStepBar-cont">' +
						'<span class="new_JGStepBar-cont-number" onclick="' + this.ID + '.iconClick(\'' + stepID + '\');return false;" index = "' + index + '">' + index + '</span>' +
						'<p class="new_JGStepBar-cont-text" onclick="' + this.ID + '.titleClick(\'' + stepID + '\');return false;"><span>' + stepTitle + '</span></p>' +
						'<p class="new_JGStepBar-cont-comment" onclick="' + this.ID + '.descClick(\'' + stepID + '\');return false;">' + stepDesc + '</p>' +
						'</div>' +
						'</li>';
				} else {
					stepBar_content += '<li class="" data-stepID="' + stepID + '">' +
						_stepBarLine +
						'<div class="new_JGStepBar-cont">' +
						'<span class="new_JGStepBar-cont-number" onclick="' + this.ID + '.iconClick(\'' + stepID + '\');return false;" index = "' + index + '">' + index + '</span>' +
						'<p class="new_JGStepBar-cont-text" onclick="' + this.ID + '.titleClick(\'' + stepID + '\');return false;"><span>' + stepTitle + '</span></p>' +
						'<p class="new_JGStepBar-cont-comment" onclick="' + this.ID + '.descClick(\'' + stepID + '\');return false;">' + stepDesc + '</p>' +
						'</div>' +
						'</li>';
				}
			} else {
				if (i == datas.length - 1) {
					stepBar_content += '<li class="new_step-end new_step-line" data-stepID="' + stepID + '">' +
						'<div class="new_step-content">' +
						'<span class="new_JGStepBar-cont-number" onclick="' + this.ID + '.iconClick(\'' + stepID + '\');return false;" index = "' + index + '">' + index + '</span>' +
						'<p class="new_JGStepBar-cont-text" onclick="' + this.ID + '.titleClick(\'' + stepID + '\');return false;"><span>' + stepTitle + '</span></p>' +
						'<p class="new_JGStepBar-cont-comment" onclick="' + this.ID + '.descClick(\'' + stepID + '\');return false;">' + stepDesc + '</p>' +
						'</div>' +
						'</li>';
				} else {
					stepBar_content += '<li class="new_step-line" data-stepID="' + stepID + '">' +
						'<div class="new_step-content">' +
						'<span class="new_JGStepBar-cont-number" onclick="' + this.ID + '.iconClick(\'' + stepID + '\');return false;" index = "' + index + '">' + index + '</span>' +
						'<p class="new_JGStepBar-cont-text" onclick="' + this.ID + '.titleClick(\'' + stepID + '\');return false;"><span>' + stepTitle + '</span></p>' +
						'<p class="new_JGStepBar-cont-comment" onclick="' + this.ID + '.descClick(\'' + stepID + '\');return false;">' + stepDesc + '</p>' +
						'</div>' +
						'</li>';
				}
			}
		}

		return stepBar_content;
	},
	setClumnNum: function (target, datas) {
		var _datalen = datas.length;

		if (!!!_datalen)
			return;

		var clumnStyle = "";
		switch (_datalen) {
			case 2:
				target.addClass("new_JGStepBar-2");
			case 3:
				target.addClass("new_JGStepBar-3");
				break;
			case 4:
				target.addClass("new_JGStepBar-4");
				break;
			case 5:
				target.addClass("new_JGStepBar-5");
				break;
			case 6:
				target.addClass("new_JGStepBar-6");
				break;
			default:
				//		                var _wSty = 100 % (_datalen - 1);
				//		                target.css("width", _wSty);
				//步骤条find的li为0
				var _wSty = parseInt(100 / _datalen) + "%";
				target.find("li").css("width", _wSty);
				break;
		}
		return;
	},
	setCurrentStep: function (currentId) {
		if (!this.stepDatas) {
			return false;
		}
		var currentIndex = this.stepDatas.findIndex(function (data) {
			return data[this.idColumn] = currentId;
		})
		if (!current || currentIndex < 0) {
			return false;
		}
		for (var i = 0; i < this.stepDatas.length; i++) {
			var stepId = this.stepDatas[i][this.idColumn];
			this.setV3StepStatus(i < currentIndex ? this.DoneStatus : i = currentIndex ? this.DoingStatus : this.ToDoStatus, stepId);
		}
		return true;
	},
	/**
	 * 绑定字段步骤
	 * @param {String} entityCode 实体编码
	 * @param {String} fieldCode 字段编码
	 * */
	bindStepStatus: function (entityCode, fieldCode) {
		if (this.dynamicStep || !entityCode || !fieldCode) {
			return;
		}
		var fun = (function (_this) {
			return function () {
				var info = _this.dynamicStep;
				if (!info) {
					return;
				}
				var datasource = isc.WidgetDatasource.getDatasource(_this);
				if (datasource) {
					//取当前动态值
					var currentValue = _this._expHandler("[" + info.entityCode + "].[" + info.fieldCode + "]")
					var records = datasource.getAllRecords().toArray();
					var _currentRecord = records.find(function (item) {
						return item.get(_this.idColumn) == currentValue;
					});
					if (_currentRecord) {
						var id = _currentRecord.get("id");
						var record = datasource.getRecordById(id)
						datasource.setCurrentRecord({
							record: record
						})
					}
				}
			}
		})(this);
		var observer = isc.CurrentRecordObserver.create({
			fields: [fieldCode],
			setValueHandler: fun,
			clearValueHandler: fun
		});
		datasource.addObserver(observer);
		this.dynamicStep = {
			"entityCode": entityCode,
			"fieldCode": fieldCode
		}
	},

	initBindDataAndUIEvent: function () {
		var _this = this;
		if (this.StepDownSource) {
			var stepDownSource = isc.JSON.decode(this.StepDownSource);
			stepDownSource = stepDownSource.DataSourceSetting;
			if (stepDownSource.DataSourceType == "Entity") {
				var config = stepDownSource.DataConfig;
				this.dsName = config.SourceName;
				this.idColumn = config.SaveColumn;
				this.titleColumn = config.ShowColumn;
				this.descColumn = config.DescColumn;
				this.statusColumn = config.StatusColumn;

				var datasource = this._lookup(this.dsName);
				datasource = datasource.getOrginalDatasource().getOrginalDatasource();
				isc.DatasourceUtil.addDatasourceInsertEventHandler(datasource, this.eventHandler(this));
				isc.DatasourceUtil.addDatasourceUpdateEventHandler(datasource, this.eventHandler(this));
				isc.DatasourceUtil.addDatasourceLoadEventHandler(datasource, this.eventHandler(this));
			}
		}
	},

	_afterInitWidget: function() {
		var _this = this;
		this.on("iconClick", function (id) {
			_this._fireEvent(_this, id, "OnIconClick");
		});
		this.on("titleClick", function (id) {
			_this._fireEvent(_this, id, "OnTitleClick");
		});
		this.on("descClick", function (id) {
			_this._fireEvent(_this, id, "OnDescClick");
		});
	},

	eventHandler: function (widget) {
		var _this = widget;
		var handle = function (params) {
			var items = params.datasource.getAllRecords().toArray();
			_this.setStepBarItem(items);
		};
		return handle;
	},

	_fireEvent: function (widget, id, eventName) {
		widget.setCurrentRecord(id);
		widget._eventHandler(widget.code, eventName)();
	},

	setCurrentRecord: function (currentId) {
		var datasource = this._lookup(this.dsName)
		if (datasource) {
			var _this = this;
			var records = datasource.getAllRecords().toArray();
			var _currentRecord = records.find(function (item) {
				return item.get(_this.idColumn) == currentId;
			});
			if (_currentRecord) {
				var id = _currentRecord.get("id");
				var record = datasource.getRecordById(id)
				datasource.setCurrentRecord({
					record: record
				})
			}
		}
	},

	getVisible: function () {
		return this.isVisible();
	},

	getCurrentStep: function () {
		var datasource = isc.WidgetDatasource.getDatasource(this);
		var currentRecord = datasource.getCurrentRecord();
		return currentRecord.get(widget.idColumn);
	},

	setV3StepStatus: function (statusCode) {
		var datasource = this._lookup(this.dsName);
		var currentRecord = datasource.getCurrentRecord();
		this.setStepStatus(statusCode, currentRecord.get(this.idColumn));
	},

	setV3CurrentStep: function (currentId) {
		if (this.dsName) {
			this.setCurrentRecord(currentId)
		}
	},

	setBrotherStep: function (type) {
		var datasource = this._lookup(this.dsName);
		var recordLength = datasource.getCurrentDataAmount();
		var currentRecord = datasource.getCurrentRecord();
		var currentIndex = datasource.getIndexById(currentRecord.get("id"));

		if (type == "next") {
			var index = currentIndex + 1;
			if (index > recordLength - 1) {
				return;
			}
		} else if (type == "previous") {
			var index = currentIndex - 1;
			if (index < 0) {
				return;
			}
		}
		currentId = datasource.getRecordByIndex(index).get(this.idColumn);
		this.setCurrentRecord(currentId);
	},

	getV3MethodMap: function(){
        return {
            setStepStatus: "setV3StepStatus",
			setCurrentStep: "setV3CurrentStep"
        }
    }
});
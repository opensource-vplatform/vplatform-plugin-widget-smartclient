isc.ClassFactory.defineClass("JGCalendar", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGCalendar", "IWindowAop");
isc.ClassFactory.mixInInterface("Calendar", "JGStyleHelper");
isc.ClassFactory.mixInInterface("MonthSchedule", "JGStyleHelper");
isc.GridRenderer.standardStyleSuffixes = ["", "Over", "Selected", "SelectedOver", "Disabled", "DisabledOver", "DisabledSelected", "DisabledSelectedOver", "Dark", "OverDark", "SelectedDark", "SelectedOverDark", "DisabledDark"]
isc.GridRenderer.addProperties({
	setFastCellUpdates: function () {
		this.fastCellUpdates = false;
		return;
	}
});


isc.MonthScheduleBody.addProperties({
	redraw: function (reason, b, c, d) {
		this.Super("redraw", arguments);

		var _calendar = this.parentElement && this.parentElement.parentElement && this.parentElement.parentElement.parentElement && this.parentElement.parentElement.parentElement.parentElement && this.parentElement.parentElement.parentElement.parentElement.parentElement && this.parentElement.parentElement.parentElement.parentElement.parentElement;

		if (_calendar && _calendar._selectedCellsInfo && _calendar._selectedCellsInfo.length > 0) {
			var _selectedCellsInfo = _calendar._selectedCellsInfo;
			for (var i = 0, len = _selectedCellsInfo.length; i < len; i++) {
				var tmpObj = _selectedCellsInfo[i];
				if (tmpObj.record) {
					this.shouldRefreshCellHTML(tmpObj.record, tmpObj.rowNum, tmpObj.colNum, tmpObj.cancelSelected);
				}
			}

			// 移除最后一个取消选中的Cell
			if (_selectedCellsInfo[len - 1].cancelSelected) {
				_selectedCellsInfo.pop();
			}
		}
	},
	setRowHeight: function () { },
	shouldRefreshCellHTML: function (record, rowNum, colNum, cancelSelected) {
		if (!record || isNaN(colNum)) {
			return;
		}
		var _className = this.getCellStyle(record, rowNum, colNum);
		var _classTitle = "";
		var _rowNum = "";
		if (_className.indexOf("ToDay") > -1) {
			if (rowNum % 2 != 0) {
				_classTitle = this.grid.creator.toDayHeaderBaseStyle;
			} else {
				_classTitle = this.grid.creator.toDayBodyBaseStyle;
			}
		}
		if (rowNum % 2 != 0) {
			_rowNum = rowNum - 1;
			if (_classTitle == "")
				_classTitle = _className.substring(0, _className.indexOf("Day") + 3) + "Header";
		} else {
			_rowNum = rowNum + 1;
			if (_classTitle == "")
				_classTitle = _className.substring(0, _className.indexOf("Day") + 3) + "Body";
		}

		if (cancelSelected) {
			_className = "Over";
		} else {
			if (_className.indexOf("Over") > -1) {
				_className = "Over";
			} else if (_className.indexOf("Selected") > -1) {
				_className = "Selected";
			} else {
				if (this.getCellStyle(record, _rowNum, colNum).indexOf("Selected") > -1) {
					this.getTableElement(rowNum, colNum).className = _className + "Selected";
					_className = "Selected";
				} else {
					_className = "";
				}
			}
		}
		this.getTableElement(_rowNum, colNum).className = _classTitle + _className;
		return this.showHiliteInCells;
	},
	getCellStyleName: function (styleIndex, record, rowNum, colNum) {
		var standardSuffixes = isc.GridRenderer.standardStyleSuffixes;
		if (this.getBaseStyle) {
			var baseStyle = "";
			var _date = new Date();
			var _date1 = record["date" + (colNum + 1)];
			if (_date1.getDate() == _date.getDate() && _date1.getMonth() == _date.getMonth() && _date1.getYear() == _date.getYear()) {
				if (rowNum % 2 == 0) {
					baseStyle = this.grid.creator.toDayHeaderBaseStyle;
				} else {
					baseStyle = this.grid.creator.toDayBodyBaseStyle;
				}
			} else {
				baseStyle = this.getBaseStyle(record, rowNum, colNum);
			}
			if (baseStyle !== this.baseStyle) {
				if (styleIndex == 0) return baseStyle;
				return baseStyle + standardSuffixes[styleIndex];
			}
		}
		if (!this._cellStyles) {
			this._cellStyles = [];
			for (var i = 0; i < standardSuffixes.length; i++) {
				this._cellStyles[i] = this.baseStyle + standardSuffixes[i];
			}
		}
		return this._cellStyles[styleIndex];
	}
});

isc.MonthSchedule.addProperties({
	canDrag: false,
	dragAppearance: "none",
	canDragSelect: false,
	showHover: false,
	mimimumDayHeight: 10,
	init: function () {
		this.Super("init");
		this.className = this.creator.listGridStyle;
		this.headerButtonProperties.baseStyle = this.creator.headerStyle
	},
	getCellCSSText: function (record, rowNum, colNum) {
		if (this.dateStyle) {
			var date = record["date" + (colNum + 1)]
			var month = date.getMonth() + 1;
			var dateString = date.getFullYear() + "-" + (month > 9 ? month : "0" + month) + "-" + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
			var cssDate = this.dateStyle[dateString];
			if (cssDate) {
				if (rowNum % 2 == 0) {
					return this.cssTextExtend(null, cssDate["head"])
				}
				return this.cssTextExtend(null, cssDate["body"])
			}
		}
	},
	updateGridComponents: function () {
		var title = [
			isc.I18N.get("周一", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
			isc.I18N.get("周二", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
			isc.I18N.get("周三", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
			isc.I18N.get("周四", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
			isc.I18N.get("周五", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
			isc.I18N.get("周六", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
			isc.I18N.get("周日", "普通窗体日历控件表格头,建议不要过长,3-6个字符为佳"),
		];
		var _fields = this.fields;
		for (var i = 0, num = _fields.length; i < num; i++) {
			//_fields[i].title = "周" + _fields[i].title;
			_fields[i].title = title[i];
			_fields[i].align = "left";
		}
		this.setMembers(this.getGridMembers());
	},
	getSelectedCellData: function (copyDownFromTopRow, copyRightFromLeftColumn) {
		if (this.canSelectCells) {
			var records = [],
				values = {},
				undef;
			var selection = this.selection.getSelectedCells();
			if (selection.length == 0) return [];
			var value, index = 0,
				origCol = selection[index][1];
			while (index < selection.length) {
				var record = {},
					addRecord = false,
					firstRow = selection[index][0],
					firstCol = selection[index][1];
				while (index < selection.length) {
					var row = selection[index][0];
					var col = selection[index][1];
					if (row != firstRow) break;
					if (col == firstCol || !copyRightFromLeftColumn) {
						var gridRecord = this.getCellRecord(row, col);
						if (this.shouldShowRecordComponent(gridRecord, col)) {
							value = gridRecord["date" + (col + 1)];
							if (value === undef && this.copyEmptyCells) value = null;
							addRecord = true;
						} else value = undef;
					}
					var targetCol = col - origCol;
					if (copyDownFromTopRow) {
						var binding = values[targetCol];
						if (binding !== undef) value = binding;
						else values[targetCol] = value;
					}
					if (value !== undef) record[targetCol] = value;
					index++;
				}
				if (addRecord) records.add(record);
			}
			return records;
		}
		return null;
	},
	cellClick: function (record, rowNum, colNum) {
		// 处理选中背景色
		var _calendar = this.creator && this.creator.parentElement && this.creator.parentElement.parentElement;
		if (_calendar) {
			var curClickedDate = _calendar._getDateFormRecord(record, colNum);

			// 如果为单选日历，则需要清除已选中日期
			if ((_calendar.getCalendar()._isMulSelect + "").toLowerCase() !== "true") {
				var oldSelectedDates = _calendar._getSelectedDate();
				if (oldSelectedDates && oldSelectedDates.length > 0) {
					_calendar._handleBGColorInClick(oldSelectedDates, true);
					//_calendar._selectedDates = [];
				}
			}

			//if (_calendar.getCalendar()._isMulSelect) { //多选状态下才能选中多个单元格
			var isSelected = _calendar._checkDateExists(curClickedDate);
			_calendar._handleBGColorInClick([curClickedDate], isSelected);

			// 存储当前点击的日期
			_calendar._setSelectedDate([curClickedDate]);
		}

		this.creator.selectDate.apply(this, arguments); //选择日期触发事件
	},

	rowClick: function () {
		var throwError = this.calendar ? true : false;//如果点击事件配置当前页面跳转（打开链接地址），当前控件已销毁，后续触发当前控件的行点击的逻辑应该忽略错误或者不执行Task20210615006
		try {
			this.Super("rowClick", arguments);
		} catch (e) {
			if (throwError) {
				throw e;
			}
		}
	},
	descriCellClick: function (record, rowNum, colNum) {
		// 处理选中背景色
		var _calendar = this.creator && this.creator.parentElement && this.creator.parentElement.parentElement;
		if (_calendar) {
			var curClickedDate = _calendar._getDateFormRecord(record, colNum);

			// 如果为单选日历，则需要清除已选中日期
			if ((_calendar.getCalendar()._isMulSelect + "").toLowerCase() !== "true") {
				var oldSelectedDates = _calendar._getSelectedDate();
				if (oldSelectedDates && oldSelectedDates.length > 0) {
					_calendar._handleBGColorInClick(oldSelectedDates, true);
					//_calendar._selectedDates = [];
				}
			}

			//if (_calendar.getCalendar()._isMulSelect) { //多选状态下才能选中多个单元格
			var isSelected = _calendar._checkDateExists(curClickedDate);
			_calendar._handleBGColorInClick([curClickedDate], false);

			// 存储当前点击的日期
			_calendar._setSelectedDate([curClickedDate]);
		}
	}
});


/*农历计算*/
isc.Calendar.addProperties({
	lunarinfo: new Array(
		0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
		0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
		0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
		0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
		0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
		0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
		0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
		0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
		0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
		0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
		0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
		0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
		0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
		0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
		0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0),
	//==== 传回农历 y年的总天数

	lyeardays: function (y) {
		var i, sum = 348;
		for (i = 0x8000; i > 0x8; i >>= 1) sum += (this.lunarinfo[y - 1900] & i) ? 1 : 0;
		return (sum + this.leapdays(y));
	},

	//==== 传回农历 y年闰月的天数

	leapdays: function (y) {
		if (this.leapmonth(y)) return ((this.lunarinfo[y - 1900] & 0x10000) ? 30 : 29)
		else return (0)
	},

	//==== 传回农历 y年闰哪个月 1-12 , 没闰传回 0

	leapmonth: function (y) {
		return (this.lunarinfo[y - 1900] & 0xf)
	},

	//====================================== 传回农历 y年m月的总天数

	monthdays: function (y, m) {
		return ((this.lunarinfo[y - 1900] & (0x10000 >> m)) ? 30 : 29)
	},

	//==== 算出农历, 传入日期物件, 传回农历日期物件

	//     该物件属性有 .year .month .day .isleap .yearcyl .daycyl .moncyl

	lunar: function (objdate) {
		var i, leap = 0,
			temp = 0;
		var basedate = new Date(1900, 0, 31);
		var offset = (objdate - basedate) / 86400000;
		var obj = {};
		obj.daycyl = offset + 40;
		obj.moncyl = 14;
		for (i = 1900; i < 2050 && offset > 0; i++) {
			temp = this.lyeardays(i);
			offset -= temp;
			obj.moncyl += 12;
		}
		if (offset < 0) {
			offset += temp;
			i--;
			obj.moncyl -= 12;
		}
		obj.year = i;
		obj.yearcyl = i - 1864;
		leap = this.leapmonth(i); //闰哪个月
		obj.isleap = false
		for (i = 1; i < 13 && offset > 0; i++) {
			//闰月
			if (leap > 0 && i == (leap + 1) && obj.isleap == false) {
				--i;
				obj.isleap = true;
				temp = this.leapdays(obj.year);
			} else {
				temp = this.monthdays(obj.year, i);
			}
			//解除闰月
			if (obj.isleap == true && i == (leap + 1)) obj.isleap = false
			offset -= temp
			if (obj.isleap == false) obj.moncyl++
		}
		if (offset == 0 && leap > 0 && i == leap + 1)
			if (obj.isleap) {
				obj.isleap = false;
			} else {
				obj.isleap = true;
				--i;
				--obj.moncyl;
			}
		if (offset < 0) {
			offset += temp;
			--i;
			--obj.moncyl;
		}
		obj.month = i
		obj.day = offset + 1;
		return obj;
	},
	cday: function (m, d) {
		var nstr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');
		var nstr2 = new Array('初', '十', '廿', '卅', '　');
		var s = "";
		if (d == 1) {
			if (m > 10) {
				s = '十' + nstr1[m - 10]
			} else {
				s = nstr1[m]
			}
			s += '月'
			if (s == "十二月") s = "腊月";
			if (s == "一月") s = "正月";
		}
		switch (d) {
			case 10:
				s += '初十';
				break;
			case 20:
				s += '二十';
				break;
			case 30:
				s += '三十';
				break;
			default:
				s += nstr2[Math.floor(d / 10)];
				s += nstr1[parseInt(d % 10)];
		}
		return (s);
	}
});

isc.JGCalendar.addProperties({
	showOtherDays: false, //是否显示非本月日期
	showDayView: false, //是否天视图
	showWeekView: false, //是否星期视图
	showControlsBar: false, //是否需要显示工具条
	canEditEvents: false, //是否可以编辑
	canCreateEvents: false, //是否可以创建
	dateStyle: [],
	headTitle: [],
	TableName: null,
	NameField: null,
	DescriptionField: null,
	StartDateField: null,
	EndDateField: null,
	className: "JGCalendarNormal",
	Left: '',
	Top: '',
	Width: '',
	Height: '',
	listener: ['selectDate', 'selectSchedule', 'selectMore', 'scheduleSync', 'changeMonth'],
	WidgetsStyle: "JGCalendar"
});

isc.JGCalendar.addMethods({
	/**
	 * 为了处理实体加载中不触发事件
	 */
	dataLoaded: function () {
		if(this.hasChangeMonthHandler != undefined &&  this.hasChangeMonthHandler != null) {
			this.hasChangeMonthHandler();
			this.hasChangeMonthHandler = null;
		}
	},

	_initWidget: function () {
		// initBindDataAndUIEvent()
		this.initBindDataAndUIEvent();

		// 处理初始化时dataStyle未清除
		this.dateStyle = [];

		this._calendar = isc.Calendar.create({
			_alwaysShowMoreLink: (this.AlwaysShowMoreLink + "").toLowerCase() === "true" ? true : false,
			_isMulSelect: (this.IsMulSelect + "").toLowerCase() === "true" ? true : false,
			baseStyle: this.WidgetsStyle,
			dayHeaderBaseStyle: this.WidgetsStyle + "DayHeader",
			dayBodyBaseStyle: this.WidgetsStyle + "DayBody",
			otherDayHeaderBaseStyle: this.WidgetsStyle + "OtherDayHeader",
			otherDayBodyBaseStyle: this.WidgetsStyle + "OtherDayBody",
			toDayHeaderBaseStyle: this.WidgetsStyle + "ToDayHeader",
			toDayBodyBaseStyle: this.WidgetsStyle + "ToDayBody",
			moreBaseStyle: this.WidgetsStyle + "More",
			monthFontStyle: this.WidgetsStyle + "MoreFont",
			listGridStyle: this.WidgetsStyle + "ListGrid",
			headerStyle: this.WidgetsStyle + "Header",
			//showOtherDays:false,//是否显示非本月日期
			showDayView: false, //是否天视图
			showWeekView: false, //是否星期视图
			showControlsBar: false, //是否需要显示工具条
			//chosenDate :new Date("2015-10-10"),//设置显示时间
			canEditEvents: false, //是否可以编辑
			canCreateEvents: false, //是否可以创建
			nameField: this.NameField,
			descriptionField: this.DescriptionField,
			startDateField: this.StartDateField,
			previousButtonHoverText: isc.I18N.get("上一月", "普通窗体日历控件上一月按钮,最多6个字符"),
			nextButtonHoverText: isc.I18N.get("下一月", "普通窗体日历控件下一月按钮,最多6个字符"),
			endDateField: this.EndDateField,
			Width: this.Width,
			Height: this.Height,
			dateStyle: this.dateStyle,
			headTitle: this.headTitle,
			getDayBodyHTML: this.getDayBodyHTML,
			getDayHeaderHTML: function (date, events, calendar, rowNum, colNum) {
				var _date = this.dateToString(date, true);
				var headTitle = this.headTitle[_date];
				var cssDate = this.dateStyle[_date] && this.cssTextExtend(null, this.dateStyle[_date].headDate);
				if (cssDate == null && (colNum == 5 || colNum == 6)) { //设置周六日显示为红色字体
					cssDate = this.baseStyle + "WeekDay"
				}
				var cssTitle = this.dateStyle[_date] && this.cssTextExtend(null, this.dateStyle[_date].headTitle);
				var isShowHeadTitle = isc.I18N.isUseLanguage('zh');
				if (!isShowHeadTitle) {
					headTitle = "";
				} else if (headTitle == null) {
					var _china = this.lunar(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
					headTitle = this.cday(_china.month, _china.day);
				}
				return "<table width='100%' role='presentation' cellspacing='0' cellpadding='0' border='0' style='font: inherit;height: inherit;'><tr><td align=left class='" +
					cssDate + "'>" + (date.getDate() == 1 ? (date.getMonth() + 1) + "." + date.getDate() : date.getDate()) + "</td><td align=right style='" + cssTitle + "'>" + headTitle + "</td></tr></table>";
			},
			getSelectDate: function (id) {
				//选择日程触发事件
				var obj = this.parentElement.parentElement; //获取JGCalendar控件
				obj._callEvent(obj, 'scheduleSync', id);
				/*
					点击描述触发日期选择，但不触发选择日期事件
				*/
				var monthTable = window[this.ID + "_monthView_body"];
				var rowNum = 0,
					colNum = 0,
					record = null;
				if (monthTable) {
					rowNum = monthTable.getEventRow();
					colNum = monthTable.getEventColumn();
					record = monthTable.getCellRecord(rowNum, colNum)
					monthTable.grid && monthTable.grid.descriCellClick(record, rowNum, colNum);
				}
				obj._callEvent(obj, 'selectSchedule');
			},
			getSelectMore: function (id, recordId) { //选择日程更多触发事件
				var obj = this.parentElement.parentElement; //获取JGCalendar控件
				obj._callEvent(obj, 'scheduleSync', recordId);
				this.selectMoreDate = id;
				/*
					点击更错触发日期选择，但不触发选择日期事件
				*/
				var monthTable = window[this.ID + "_monthView_body"];
				var rowNum = 0,
					colNum = 0,
					record = null;
				if (monthTable) {
					rowNum = monthTable.getEventRow();
					colNum = monthTable.getEventColumn();
					record = monthTable.getCellRecord(rowNum, colNum)
					monthTable.grid && monthTable.grid.descriCellClick(record, rowNum, colNum);
				}
				obj._callEvent(obj, 'selectMore', id);
			},
			dateToString: function (date, showDate) {
				//格式转换
				if (date) {
					var dateYear = date.getFullYear();
					var dateMonth = (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1));
					if (showDate)
						return dateYear + "-" + dateMonth + "-" + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
					else
						return dateYear + "" + dateMonth;
				}
				return "";
			},
			setChosenDate: function () {
				this.Super("setChosenDate", arguments);
				var obj = this.parentElement.parentElement; //获取JGCalendar控件
				var nday = this.dateToString(arguments[0], false);
				if (nday != this._v3DateChooser.items[0].getValue()) {
					this._v3DateChooser.items[0].setValue(nday);

					obj._callEvent(obj, 'changeMonth');
					obj.hasChangeMonthHandler = function () {
						obj._callEvent(obj, 'changeMonth');
					};
				}
			},
			selectDate: this._referEvent(this, 'selectDate') //选择日期触发事件
		});
		this.setToolBar();
		this._Layout = isc.VLayout.create({
			width: "100%",
			height: "100%",
			minHeight: "400",
			minWidth: "600",
			contents: "",
			members: [this._calendar.controlsBar, this._calendar]
		});

		this.addChild(this._Layout);
		if (this.percentWidth) {
			this._calendar.setWidth(this.percentWidth);
			this._calendar.controlsBar.setWidth(this.percentWidth);
		}
		if (this.percentHeight) {
			this._calendar.setHeight(this.percentHeight);
		}
	},
	_addSelectedCellsInfo: function (_record, _rowNum, _colNum) {
		// cellInfo结构： {'record': _record, 'rowNum': _reowNum, 'colNum': _colNum}
		if (!this._selectedCellsInfo)
			this._selectedCellsInfo = [];

		var _curSelectedCellsInfo = this._selectedCellsInfo;

		var _curCellInfo = {
			'record': _record,
			'rowNum': _rowNum,
			'colNum': _colNum
		};
		var _newCellsInfo = [],
			_isExistsCell = false;
		if (_curSelectedCellsInfo.length > 0) {
			for (var i = 0, len = _curSelectedCellsInfo.length; i < len; i++) {
				var tmpObj = _curSelectedCellsInfo[i];
				if (tmpObj && tmpObj.rowNum === _rowNum && tmpObj.colNum === _colNum) {
					_isExistsCell = true;
					continue;
				} else if (tmpObj) {
					_newCellsInfo.push(tmpObj);
				}
			}
		}

		if (_isExistsCell) {
			_curCellInfo['cancelSelected'] = true;
		}

		_newCellsInfo.push(_curCellInfo);

		this._selectedCellsInfo = _newCellsInfo;
	},
	_getSelectedDate: function () {
		return this._selectedDates;
	},
	_setSelectedDate: function (dates) {
		if (!this._selectedDates)
			this._selectedDates = [];

		var curSelectedDates = this._selectedDates;
		var results = [];
		var removeDates = []; // 存储需要删除的数据
		var addDates = [];
		var _oldSelectedDates = [];
		var _newSelectedDates = []; //存储目标日期中，日历已选中的
		if (dates instanceof Array && curSelectedDates instanceof Array && dates.length > 0) {
			if (this.getCalendar()._isMulSelect) {
				outter: for (var j = 0, jLen = dates.length; j < jLen; j++) {
					var isExists = false;
					var tmpDate = dates[j];
					if (tmpDate) {
						inner: for (var i = 0, len = curSelectedDates.length; i < len; i++) {
							if (tmpDate === curSelectedDates[i]) {
								removeDates.push(tmpDate);
								continue outter;
							}
						}

						addDates.push(tmpDate);
					}
				}

				//组装数据
				removeDatesStr = removeDates.join(",");
				for (var k = 0, kLen = curSelectedDates.length; k < kLen; k++) {
					if (removeDatesStr === "" || curSelectedDates[k].indexOf(removeDatesStr) === -1)
						results.push(curSelectedDates[k]);
				}

				results.addList(addDates);
			}
			else {
				// 非多选，保存当前保存值
				results.push(dates[0]);
			}
		}
		delete results.$ef;
		this._selectedDates = results;
	},
	_handleBGColorInClick: function (dates, isSelected) {
		// dates格式为 ["2017-02-06","2017-02-07"...]

		if (!dates)
			return null;

		// 单选模式下仅支持选中第一个日期
		if ((this.IsMulSelect + "").toLowerCase() !== 'true' && dates && dates instanceof Array && dates.length > 1)
			dates = [dates[0]];

		var BGColor = "undefined",
			cssDataJsonStr = '{';
		if (!isSelected)
			BGColor = "#e6f7ff";

		for (var i = 0, len = dates.length; i < len; i++) {
			var date = dates[i];

			if (i !== 0 && i < len)
				cssDataJsonStr += ",";

			cssDataJsonStr += '"' + date + '":{"head":{"background-color":"' + BGColor + '"},"body":{"background-color":"' + BGColor + '"}}'
		}
		cssDataJsonStr += '}';
		// 可以这样解析的
		this.setDateStyle(JSON.parse(cssDataJsonStr));
	},
	_checkDateExists: function (date) {
		var selectedDates = this._selectedDates;

		if (!selectedDates || !date)
			return false;

		var _result = false;
		for (var i = 0, len = selectedDates.length; i < len; i++) {
			var tmpDate = selectedDates[i];
			if (date + "" === tmpDate + "") {
				_result = true;
				break;
			}
		}

		return _result;
	},
	_getDateFormRecord: function (dateRecord, colNum) {
		var _clickDateObj = dateRecord["date" + (colNum + 1)];
		if (_clickDateObj && _clickDateObj instanceof Date) {

			var month = _clickDateObj.getMonth() * 1 + 1;
			if (month >= 1 && month <= 9)
				month = "0" + month;

			var strDate = _clickDateObj.getDate();
			if (strDate >= 0 && strDate <= 9)
				strDate = "0" + strDate

			return _clickDateObj.getFullYear() + "-" + month + "-" + strDate;
		} else
			return null;
	},
	getCalendar: function () {
		return this._calendar
	},
	getCurrentMonth: function () {
		return this._calendar._v3DateChooser.getItems()[0].getValue();
	},
	/*
	 *改造工具控件，使用V3控件和添加今天按钮
	 */
	setToolBar: function () {
		var _this = this;
		var cbMems = [];
		//上月图表-默认
		this._previousButton = this._calendar.createAutoChild("previousButton", {
			width: 30,
			height: 30,
			src: "[SKINIMG]actions/pic-left-btn.png"
		});
		//下月图表-默认
		this._nextButton = this._calendar.createAutoChild("nextButton", {
			width: 30,
			height: 30,
			src: "[SKINIMG]actions/pic-right-btn.png"
		});
		//添加V3控件-改造
		this._calendar._v3DateChooser = isc.JGFormItemView.create({
			_initProperties: function () {
				var displayFormat = isc.I18N.isUseLanguage('zh') ? "yyyy年MM月" : "yyyy-MM";
				this.left = 0;
				this.top = 0;
				this.height = 30;
				this.width = 140;
				this.itemLayout = 'absolute';
				this.writeFormTag = false;
				this.items = [{
					top: 0,
					left: 7,
					width: 120,
					height: 30,
					type: "V3SDateItem",
					canEdit: true,
					sdatetype: 'month',
					readOnlyEditorType: "V3SDateItem",
					displayFormat: displayFormat,
					textBoxStyle: _this.WidgetStyle + "MonthDate",
					showTitle: false,
					storeValue: function (sdate) {
						if (null == sdate) {
							return;
						}
						var date = new Date(sdate.substring(0, 4), sdate.substring(4) - 1, "01")
						_this._calendar.setChosenDate(date);
					}
				}]
				this.redraw = function () {
					this.Super("redraw", arguments);
					this.items[0].setValue(_this._calendar.dateToString(new Date(), false))
				}
			}
		});
		//今天按钮-新增控件
		this._toDay = isc.V3Button.create({
			title: isc.I18N.get("今日", "普通控件日历今日按钮,最多6个字符"),
			width: 64,
			height: 30,
			baseStyle: this.WidgetsStyle + "Button",
			_cssText: "",
			click: function () {
				_this._calendar._v3DateChooser.items[0].setValue(_this._calendar.dateToString(new Date(), false));
				_this._calendar.setChosenDate(new Date);
				//点击今日，强制触发月份切换事件
				_this._callEvent(_this, 'changeMonth');
			}
		});


		cbMems.add(this._previousButton);
		cbMems.add(this._nextButton);
		cbMems.add(this._calendar._v3DateChooser);
		cbMems.add(isc.VLayout.create({
			width: "100%"
		}));
		cbMems.add(this._toDay);

		this._calendar.controlsBar = this._calendar.createAutoChild("controlsBar", {
			defaultLayoutAlign: "left",
			styleName: this.WidgetsStyle + "ToolHeader",
			contents: "",
			//处理两端对齐
			width: "100%",
			members: cbMems,
			layoutBottomMargin: 8
		});
	},
	/*
	 *改造方法，设置显示值格式 默认前面有时分显示
	 */
	getDayBodyHTML: function (date, events, calendar, rowNum, colNum) {
		var day = date.getDay();
		var evtArr = events,
			lineHeight = 26,
			lineWidth = this.monthView.innerWidth / 100,
			record = this.monthView.data ? this.monthView.data[1] : null,
			rHeight = this.monthView.getRowHeight(record, 1);
		var retVal = "";
		var curID = "";
		for (var i = 0; i < evtArr.length; i++) {
			var _val = evtArr[i][this.nameField];
			if (_val && _val.length > lineWidth) {
				_val = _val.substring(0, lineWidth) + "...";
			}
			if (_val != "" && _val != null) {
				var index = i + 1 == evtArr.length ? i + 1 : i + 2;
				if (index * lineHeight > rHeight) break;
				if (typeof _val == "string")
					_val = _val.replace(/\</g, "\x26lt;").replace(/\>/g, "\x26gt;");
				curID = evtArr[i]["id"];
				retVal += "<div class='" + this.monthFontStyle + "' onmousedown='" + this.ID + ".getSelectDate(\"" + curID + "\");return false;' >" + _val + "</div>";
			}

		}
		if ((i < evtArr.length - 1) || (this._alwaysShowMoreLink && evtArr.length > 0)) {
			retVal += " <div class='" + this.moreBaseStyle + "' onmousedown='" + this.ID + ".getSelectMore(\"" + this.dateToString(date, true) + "\", \"" + curID + "\");return false;'>更多...</div>";
		}
		return retVal;
	},
	_getDate: function (_date) {
		if (_date > 9) {
			return _date;
		} else {
			return "0" + _date
		}
	},
	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		this.percentWidth = "100%";
		//this._calendar.setWidth("100%");
		//this._calendar.controlsBar.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		this.percentHeight = "100%";
		//this._calendar.setHeight("100%");
	},
	_getSelectDay: function () {
		var _monthDate = {};
		var chooseMon = this._calendar._v3DateChooser && this._calendar._v3DateChooser.items[0].getValue();
		var _year = null;
		var _month = null;
		if (chooseMon && chooseMon.length == 6) {
			_year = chooseMon.substring(0, 4);
			_month = chooseMon.substring(4);
		} else {
			var _date = new Date();
			_year = _date.getFullYear();
			_month = _date.getMonth() + 1;
		}
		_monthDate.year = _year;
		_monthDate.month = _month;
		var selectView = this._calendar.monthView && this._calendar.monthView.getSelectedCellData();
		var chooseDay = [];
		for (var i = 0, num = selectView.length; i < num; i++) {
			for (var j in selectView[i]) {
				var _title = this._calendar.dateToString(selectView[i][j], true);
				if (_title.indexOf(_year + "-" + _month) > -1 && chooseDay.toString().indexOf(_title) == -1)
					chooseDay.add(_title);
			}
		}
		_monthDate.chooseDay = chooseDay
		return _monthDate;
	},
	/**
	 * 获取大日历选中的时间与非选中日期,返回格式是数组
	 * 如：在页面显示2013年12月的日历
	 *  并选中2,3这个2天
	 *   返回数据为{day:31,chooseDay:['2013-12-02','2013-12-03'],noChooseDay:['2013-12-01','2013-12-14'.....]}
	 *              
	 */
	getSelectMonthView: function () {
		if (this._calendar && this._calendar.monthView) {
			var monthDay = {};
			var _selectDay = this._getSelectDay();
			var chooseDay = _selectDay.chooseDay,
				_year = _selectDay.year,
				_month = _selectDay.month;

			var _date = new Date(_year, _month, 0);
			var noChooseDay = [];
			for (var i = 1, num = _date.getDate() + 1; i < num; i++) {
				var _title = _year + "-" + _month + "-" + this._getDate(i);
				if (chooseDay.toString().indexOf(_title) == -1)
					noChooseDay.add(_title);
			}
			monthDay.day = _date.getDate();
			monthDay.chooseDay = chooseDay;
			monthDay.noChooseDay = noChooseDay;
			return monthDay;
		}
	},
	/**
	 * 获取大日历选中的时间与非选中日期,返回格式是数组
	 * 如：在页面显示2013年12月的日历
	 *  并选中2,3这个2天
	 *   返回数据为[[date:'2013-12-01',week:0,isWork:0],[date:'2013-12-02',week:1,isWork:1]}
	 *  date表示时间，week表示前面date这天是星期几（0-6），isWork表示是否选中，（选中为1）
	 *
	 */
	getSelectHoliday: function () {
		if (this._calendar && this._calendar.monthView) {
			var monthDay = [];
			var _selectDay = this._getSelectDay();
			var chooseDay = _selectDay.chooseDay,
				_year = _selectDay.year,
				_month = _selectDay.month;

			var _date = new Date(_year, _month, 0);
			var day = null;
			for (var i = 1, num = _date.getDate() + 1; i < num; i++) {
				var _title = _year + "-" + _month + "-" + this._getDate(i);
				day = new Object();
				day["date"] = _title;
				day["week"] = (new Date(_title)).getDay();
				if (chooseDay.toString().indexOf(_title) == -1) {
					day["isWork"] = 0;
				} else {
					day["isWork"] = 1;
				}
				monthDay.push(day);
			}
			return monthDay;
		}
	},
	/**
	 * 获取大日历选中的时间,返回格式是数组
	 * 如：在页面显示2013年12月的日历
	 *  并选中2,3,9,10,16,17这个6天
	 *   返回数据为['2013-12-2','2013-12-3','2013-12-9'
	 *              ,'2013-12-10','2013-12-16','2013-12-17']
	 */
	getSelectDateView: function () {
		if (this._calendar && this._calendar.monthView) {
			return this._getSelectDay().chooseDay;
		}
	},
	/**
	 * 获取大日历点击更多事件,返回日期
	 * 如：在页面显示2013年12月的日历选中2号
	 *   返回数据为'2013-12-2'
	 */
	getSelectMoreDate: function () {
		if (this._calendar && this._calendar.selectMoreDate) {
			return this._calendar.selectMoreDate;
		}
	},
	/**
	 * 获取大日历选中的时间,返回格式是数组
	 * 如：在页面显示2013年12月的日历选中2号
	 *   返回数据为'2013-12-2'
	 */
	getSelectDate: function () {
		if (this._calendar && this._calendar.monthView) {
			var ls = this._getSelectDay().chooseDay;
			if (ls.length > 0)
				return this._getSelectDay().chooseDay[0];
		}
	},
	/**
	 * 获取大日历选中的时间,返回格式是数组
	 * 如：在页面显示2013年12月的日历
	 *  并选中2,3,9,10,16,17这个6天
	 *   返回数据为['2013-12-2','2013-12-3','2013-12-9'
	 *              ,'2013-12-10','2013-12-16','2013-12-17']
	 */
	getSelectHeaderView: function () {
		if (this._calendar && this._calendar.monthView) {
			var _headerTitle = [];
			var _selectDay = this._getSelectDay();
			var _chooseDay = _selectDay.chooseDay,
				_year = _selectDay.year,
				_month = _selectDay.month;
			for (var i = 0, num = _chooseDay.length; i < num; i++) {
				var _title = this.headTitle[_chooseDay[i]] + "";
				if (_title.indexOf(_year + "-" + _month) > -1 && _chooseDay.toString().indexOf(_title) == -1 && _title)
					headerTitle.add(_title);
			}
			return _headerTitle;
		}
	},
	/**
	 *  设置头部标题的样式
	 *    参数：json格式
	 *  var headTitle = { 
	 *      "2013-11-09": "注意" ,
	 *  }
	 *
	 */
	setHeaderTitle: function (headTitle) {
		this.headTitle = headTitle;
		if (this._calendar && this._calendar.monthView) {
			this._calendar.headTitle = headTitle;
			this._calendar.monthView.refreshEvents();
		}
	},
	/**
	 *  设置特定日期对应格子的样式
	 *  headDate设置日期样式， headTitle设置标题格式，head设置头部样式，body设置显示内容样式
	 *    参数：json格式
	 *      var cssData = {
	 *      "2013-11-11": {
	 *          headDate:{"font-weight": "bold", "color": "red"},
	 *          headTitle:{"font-weight": "bold", "color": "red" },
	 *          head:{"background-color": "#ffc0c0"},
	 *          body:{"font-weight": "bold", "color": "red", "background-color": "#ffc0c0"}
	 *      },
	 *      ...
	 *       ...
	 *  }
	 *
	 */
	setDateStyle: function (cssData) {
		var oldCssData = this.dateStyle;
		if (!oldCssData) oldCssData = {};
		for (var _date in cssData)
			oldCssData[_date] = cssData[_date];
		this.dateStyle = oldCssData;
		if (this._calendar && this._calendar.monthView) {
			this._calendar.monthView.dateStyle = oldCssData; //设置样式
			this._calendar.monthView.refreshEvents(); //重新设置日历
		}
	},
	bindDataSource: function (ds) {
		this.setDataSource(ds, null);
	},
	getYearMonth: function () {
		return this.getCurrentMonth();
	},
	getYear: function () {
		var _viewYearMonth = this.getCurrentMonth();

		return _viewYearMonth.substr(0, 4);
	},
	getMonth: function () {
		var _viewYearMonth = this.getCurrentMonth();

		return _viewYearMonth.substr(4, 2);
	},

	initBindDataAndUIEvent: function () {
		var _this = this;

		// initBindData
		isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function (record) {
			var dataSource = isc.WidgetDatasource.getDatasource(_this);
			_this.getCalendar().setData(_this.getData(dataSource, _this));
		});

		isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(this, null, null, function () {
			var dataSource = isc.WidgetDatasource.getDatasource(_this);
			_this.getCalendar().setData(_this.getData(dataSource, _this));
		});
	},

	_afterInitWidget: function () {
		var _this = this;

		this.on("selectSchedule", this._eventHandler(this.Code, "OnScheduleClick"));

		this.on("selectDate", function (record, rowNum, colNum, selectedDateObj) {
			_this._eventHandler(_this.Code, "OnDateClick")();
		});

		this.on("selectMore", this._eventHandler(this.Code, "OnMoreClick"));
		this.on("changeMonth", this._eventHandler(this.Code, "OnMonthClick"));

		// Handler init method
		isc.DataBindingUtil.bindEvent(this, "scheduleSync", function (id) {
			// 兼容处理显示更多事件为 true
			if (id === null || id === undefined)
				return;

			var datasource = isc.WidgetDatasource.getBindDatasource(_this);
			var record = datasource.getRecordById(id);
			datasource.setCurrentRecord(record);
		});
	},

	getBindFields: function () {
		return [this.NameField, this.DescriptionField, this.StartDateField, this.EndDateField];
	},

	getData: function (dataSource, widget) {
		if (dataSource && dataSource.testData) {
			var nameColumn = widget["NameField"];
			var descriptionColumn = widget["DescriptionField"];
			var startColumn = widget["StartDateField"];
			var endColumn = widget["EndDateField"];
			var _data = dataSource.testData;
			var _dataSource = new Array;
			for (var i = 0, nums = _data.length; i < nums; i++) {
				var _start = _data[i][startColumn];
				var _end = _data[i][endColumn];
				if (_start) {
					_start = _start.replaceAll("-", "/");
					_start = new Date(_start);
				} else
					_start = new Date();
				if (_end) {
					_end = _end.replaceAll("-", "/");
					_end = new Date(_end);
				} else
					_end = new Date();
				var _syear = _start.getFullYear();
				var _smonth = _start.getMonth();
				var _sdate = _start.getDate();

				var _eyear = _end.getFullYear();
				var _emonth = _end.getMonth();
				var _edate = _end.getDate();

				//                var days = (new Date(_eyear, _emonth - 1, _edate).getTime() - new Date(_syear, _smonth - 1, _sdate).getTime()) / 1E3 / 60 / 60 / 24;
				var days = (new Date(_eyear, _emonth, _edate).getTime() - new Date(_syear, _smonth, _sdate).getTime()) / 1E3 / 60 / 60 / 24;
				days++;
				for (var j = 0; j < days; j++) {
					var _object = new Object;
					_object[nameColumn] = _data[i][nameColumn];
					_object[descriptionColumn] = _data[i][descriptionColumn];
					_object[startColumn] = new Date(_syear, _smonth, _sdate + j);
					_object[endColumn] = new Date(_syear, _smonth, _sdate + j);
					_object["id"] = _data[i]["id"];
					_dataSource.push(_object)
				}
			}
			return _dataSource
		}
		return dataSource.testData;
	},

	getSelectedDate: function () {
		if (this)
			return this._getSelectedDate();
		else
			return [];
	},

	getValue: function () {
		var value = "";
		if (this) {
			var valueArray = this._getSelectedDate();
			if (null != valueArray && valueArray.length > 0) {
				for (var i = 0; i < valueArray.length; i++) {
					value = value + valueArray[i] + ",";
				}
				if (value != "" && value.substring(value.length - 1, value.length) == ",") {
					value = value.substring(0, value.length - 1);
				}
			}
		}
		return value;
	},

	selectCellByDate: function (dates) {
		//isc_JGCalendar_0._handleBGColorInClick("2017-03-05", false)
		if (this) {
			// 清空现已选中值和选中效果
			var selectedDates = this._getSelectedDate();
			if (selectedDates && selectedDates.length > 0) {
				this._handleBGColorInClick(selectedDates, true);
				this._selectedDates = [];
			}

			// 选中对应数据
			this._setSelectedDate(dates);
			this._handleBGColorInClick(dates, false);
		}
	},

	setValue: function (dates) {
		//isc_JGCalendar_0._handleBGColorInClick("2017-03-05", false)
		if (this) {
			// 清空现已选中值和选中效果
			var selectedDates = this._getSelectedDate();
			if (selectedDates && selectedDates.length > 0) {
				this._handleBGColorInClick(selectedDates, true);
				this._selectedDates = [];
			}
			var paramDates = [];
			if (dates) {
				if (dates.indexOf(",") != -1) {
					paramDates = dates.split(",");
				} else {
					paramDates.push(dates);
				}
			}
			// 选中对应数据
			this._setSelectedDate(paramDates);
			this._handleBGColorInClick(paramDates, false);
		}
	},

	clearSelectedCell: function () {
		if (this) {
			// 清空现已选中值和选中效果
			var selectedDates = this._getSelectedDate();
			if (selectedDates && selectedDates.length > 0) {
				this._handleBGColorInClick(selectedDates, true);
				this._selectedDates = [];
				this.dateStyle = [];
			}
		}
	}
});
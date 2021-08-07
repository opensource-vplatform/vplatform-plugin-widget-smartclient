isc.ClassFactory.defineClass("InlineButtonGroupItem", "FormItem");

isc.InlineButtonGroupItem.addProperties({
	shouldSaveValue: false,
	buttons: []
});

isc.InlineButtonGroupItem.addMethods({

	getElementHTML: function (_1) {
		var btnHtml = [];
		for (var i = 0, l = this.buttons.length; i < l; i++) {
			btnHtml.push('<button handleNativeEvents = "false" buttonIndex = "' + i + '" class = "' + this.buttons[i].baseStyle + '">');
			btnHtml.push(this.buttons[i].title);
			btnHtml.push('</button>');
		}
		var _3 = "";
		if (isc.Browser.isIE && isc.Browser.isTransitional) {
			_3 = "border:0px solid transparent;"
		}
		return "<div style='padding:0px;margin:0px;" + _3 + "' ID='" + this.getID() + "$18z'>" + btnHtml.join('') + "</div>"
	},
	cellClick: function (form, cell, target) {
		var index = target.nativeTarget.getAttribute("buttonIndex");
		if (index) {
			var btn = this.buttons[index];
			btn.click();
		}
	}
});

/**
 * 查询面板
 * @class JGQueryConditionPanel
 */
isc.ClassFactory.defineClass("JGQueryConditionPanel", "JGBaseWidget");

isc.JGQueryConditionPanel.addProperties({

	_Canvas: null,

	/**
	 * 控件宽度
	 *
	 * @type {Number}
	 */
	//			Width : 300,

	/**
	 * 控件高度
	 *
	 * @type {Number}
	 */
	//			Height : 100,

	/**
	 * 是否只读
	 *
	 * @type {Boolean}
	 */
	ReadOnly: false,

	/**
	 * 是否使能
	 *
	 * @type {Boolean}
	 */
	Enabled: true,

	/**
	 * 是否显示容器默认边框
	 *
	 * @type {Boolean}
	 */
	showEdges: false,
	/**
	 * 背景色
	 *
	 * @type {String}
	 */
	BackColor: "#f6f7fb",

	/**
	 * 控件支持的事件
	 *
	 * @type {Array}
	 */
	LayoutType: 'none',
	/*
	 * 默认的边框样式
	 */
	$DefaultBorderWidth: '1px',
	$DefaultBorderStyle: 'solid',
	$DefaultBorderColor: '#e9e9e9',
	footerBtnCol: 2,
	_$conditionQueryTitle: isc.I18N.get('条件查询', '普通窗体查询面板控件条件查询文字'),
	_$expendQueryTitle: isc.I18N.get('展开查询', '普通窗体查询面板控件展开查询按钮标题'),
	_$clearQueryTitle: isc.I18N.get('清空查询', '普通窗体查询面板控件清空查询按钮标题'),
	_$foldQueryTitle: isc.I18N.get('收起查询', '普通窗体查询面板控件收起查询按钮标题'),
	_$showMoreTitle: isc.I18N.get('显示更多', '普通窗体查询面板控件显示更多按钮文字'),
	_$selectedTitle: isc.I18N.get('已选条件', '普通窗体查询面板控件已选条件文字'),
	_$queryBtnTitle: isc.I18N.get('查询', '普通窗体查询面板控件的查询按钮的文字'),
	_$conditionSelectTitle: isc.I18N.get('条件筛选', '普通窗体查询面板控件条件筛选的文字'),
	_$lessThanTitle: isc.I18N.get('小于等于', '普通窗体查询面板控件小数范围的文字'),
	_$moreThanTitle: isc.I18N.get('大于等于', '普通窗体查询面板控件条件筛选的文字'),
	_$booleanTitle: isc.I18N.get('是', '普通窗体查询面板控件布尔条件为true的文字'),
	_$toTitle: isc.I18N.get('至', '普通窗体查询面板控件日期范围、期次范围的文字'),
	_$beforeTitle: isc.I18N.get('以前', '普通窗体查询面板控件日期范围、期次范围的文字'),
	_$afterTitle: isc.I18N.get('以后', '普通窗体查询面板控件日期范围、期次范围的文字'),
	locateBoxTitle: "快速检索" //生成的查询条件中，快速检索的条件标题
	//		    DefaultExpand:false
});

isc.JGQueryConditionPanel.addMethods({
	_initCanvas: function () {
		this.Super('_initCanvas', arguments);
		this.height = 20;
		this.Height = 20;
	},
	/**
	 * 初始化控件
	 * 自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
	 */
	_initWidget: function () {
		this.displayMode = "expand"
		this._id = isc.WidgetUtils.genLayoutId(this.scopeId, this.getId());
		this.ItemWidthMode = "test";
		if (this.ItemWidthMode == "StaticWidth") {
			this.useStack = true;
		} else {
			this.useStack = false;
		}

		this.ShowToolbar = this.ShowToolbar == "True" || this.ShowToolbar == "true" || this.ShowToolbar == true ? true : false;
		this.SearchBoxEnabled = this.SearchBoxEnabled == "False" || this.SearchBoxEnabled == "false" || this.SearchBoxEnabled == false ? false : true;
		this.FilterVisible = this.FilterVisible == "True" || this.FilterVisible == "true" || this.FilterVisible == true ? true : false;
		this.DefaultExpand = this.DefaultExpand == "True" || this.DefaultExpand == "true" || this.DefaultExpand == true ? true : false;
		this.showMore = true;
		this.initHeaderAndPanel();

		// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系

		this.removeHideFieldsFromFormLayout();

	},
	clearNotVisibleData: function () {
		var datasourceName = this.SourceTableName;
		var datasource = isc.JGDataSourceManager.get(this, datasourceName);
		var currentRecord = datasource.getCurrentRecord();
		if (currentRecord) {
			this.unVisibleField.forEach(function (item) {
				if (item.ColumnName) {
					currentRecord[item.ColumnName] = null;
				}
				if (item.IDColumnName) {
					currentRecord[item.IDColumnName] = null;
				}
				if (item.StartColumnName) {
					currentRecord[item.StartColumnName] = null;
					currentRecord[item.EndColumnName] = null;
				}
			})
			datasource.updateRecords([currentRecord]);
		}
	},
	getLayout: function (layoutFields, notChange) {
		//				var ConditionDataSource = JSON.parse(this.ConditionDataSource);
		//				var items = ConditionDataSource.CommonConditions.Items;
		var items = layoutFields;
		this.addVisibleInfo(items);
		items = items.filter(function (item) {
			if (item.visible == undefined) {
				item.visible = item.Visible;
			}
			return item.Visible && item.visible;
		});

		if (items) {
			var layout = items.filter(function (item) {
				return item.Hide != true
			})
			if (notChange) {
				//						var expandLayout = this.getLayoutArr(this.showLayoutFields.concat(this.hideLayoutFields));
				var expandLayout = this.getLayoutArr(this.expandLayoutFields);
				var collapseLayout = this.getLayoutArr(this.showLayoutFields);
			} else {
				var collapseLayout = this.getLayoutArr(layout);
				var expandLayout = this.getLayoutArr(items);
			}
			return {
				collapseLayout: collapseLayout,
				expandLayout: expandLayout
			}
		}
	},
	getLayoutArr: function (layout) {
		var arr = [
			[]
		];
		var j = 0;
		for (var i = 0; i < layout.length; i++) {
			if (!layout[i].colSpan && layout[i].TypeError == "inlineButtonGroup") {
				continue;
			}
			if (parseInt(layout[i].colSpan) + 1 + j <= this.ColumnCount * 2) {
				arr[arr.length - 1].push(layout[i])
			} else {
				j = 0;
				arr.push([layout[i]]);
			}
			j += parseInt(layout[i].colSpan) + 1;
		}
		return arr;
	},
	addVisibleInfo: function (items) {
		var _this = this;
		//				items.forEach(function(item){
		//					var widgetField = _this.fields.find(function(field){
		//						return field.Code == item.InputStyle.InputRelevance;
		//					})
		//					item.Visible = widgetField.Visible;
		//				})
	},
	initHeaderAndPanel: function () {
		var id = isc.WidgetUtils.genLayoutId(this.scopeId, this.getId());
		this.searchBox = this.getSearchBox(id);
		this._contentLayout = this._initContent(this.searchBox, id);

		this.panel = isc.VLayout.create({
			autoDraw: false,
			width: "100%",
			canFocus: true,
			defaultHeight: 40,
			members: [],
			animateMembers: false,
		})
		if ((this.ShowToolbar && (this.DefaultExpand || this.displayMode === 'expand')) || !this.ShowToolbar) {
			this.panel.addMember(this._contentLayout);
		}
		if (this.ShowToolbar) {
			var headerLayout = this.getHeaderLayout(id);
			if (this.ShowToolbar && ((this.childWidgets && ((this.childWidgets.left && this.childWidgets.left.length > 1) || (this.childWidgets.right && this.childWidgets.right.length > 0))) || this.displayMode === 'collapseAll')) {
				this.panel.addMember(headerLayout, 0);
			}
		} else {
			if (!this.DefaultExpand && this.displayMode === 'collapseAll') {
				this._contentLayout.removeMember(this.formLayout);
			}
		}
		this.addChild(this.panel);
	},
	getItemsByFields: function (fields) {
		return this.formLayout.getItemsByFields(fields);
	},
	getItemByCode: function (itemCode) {
		return this.formLayout.getItemByCode(itemCode);
	},
	//获取顶部状态栏内控件
	getHeaderControlsWidget: function () {
		var widgets = {};
		if (this.ToolbarSetting) {
			var widgetPosition = JSON.parse(this.ToolbarSetting).Items;
			if (this.headerControls) {
				for (var i = 0; i < this.headerControls.length; i++) {
					for (var j = 0; j < widgetPosition.length; j++) {
						var wd = widgetPosition[j];
						if (this.headerControls[i] == wd.ItemRelevance) {
							if (!widgets[wd.Align]) {
								widgets[wd.Align] = [];
							}
							var widget = this._getWidgetContextProperty(this.headerControls[i], "widgetObj");
							widgets[wd.Align].push(widget)
							break;
						}
					}
				}
			}
		}
		if (!widgets.left) {
			widgets.left = [];
		}
		widgets.left.push(isc.LayoutSpacer.create({}));
		return widgets;
	},
	//绑定实体
	bindDataSource: function (ds) {
		if (!this.Visible) {
			return;
		}
		this.dataSource = ds;
		if (this.formLayout) {
			this.formLayout.items[this.formLayout.items.length - 1].sizeCanvas = function () {};
			if (this.DefaultExpand || this.displayMode === 'expand') {
				this.formLayoutBindDataSource(this.dataSource);
			}
		}
		if (this._locateBoxCanvas) {
			this._locateBoxCanvas.bindDataSource(this.dataSource);
		}
		var vm = isc.JGV3ValuesManager.getByDataSource(ds);
		var dy = vm.getMember(this.ID);
		if (!dy) {
			vm.addMember(this);
		}
	},
	formLayoutBindDataSource: function (ds) {
		var vm = isc.JGV3ValuesManager.getByDataSource(ds);
		var dy = vm.getMember(this.formLayout.ID);
		if (!dy) {
			vm.addMember(this.formLayout);
		}
	},
	getTitleLayout: function (id) {
		this._initTitleCanvas();
		this.selectTitle = isc.Label.create({
			contents: this._$conditionQueryTitle,
			styleName: 'v-query-condition-panel-select-value-title',
			width: 70,
			height: 40
		})
		var titleLayout = isc.HLayout.create({
			id: 'contentHLayoutTitle' + id,
			autoDraw: false,
			width: "100%",
			members: [
				this.selectTitle,
				this._Canvas
			],
			membersMargin: 8,
			zIndex: 20010900,
			styleName: this.displayMode == 'expand' || this.DefaultExpand ? 'content-h-layout-title' : 'content-h-layout-title-unborder'
		})
		return titleLayout;
	},
	getHeaderLayout: function (id) {
		var _this = this;
		this.childWidgets = this.getHeaderControlsWidget();
		var moreLabel = this.getMoreLabel();
		if (this.displayMode === "expand") {
			moreLabel.hide();
		}
		var headerLayout = isc.HLayout.create({
			ID: 'headerHLayout' + id,
			autoDraw: false,
			width: "100%",
			height: 40,
			defaultLayoutAlign: "center",
			membersMargin: 4,
			parentObj: 'JGQueryConditionPanel',
			members: [
				moreLabel
			],
			click: function () {
				return false;
			},
			styleName: 'header-layout'
		})
		if (this.childWidgets.right && this.childWidgets.right.length > 0) {
			headerLayout.addMembers(this.childWidgets.right, 0);
		}
		if (this.childWidgets.left && this.childWidgets.left.length > 0) {
			headerLayout.addMembers(this.childWidgets.left, 0);
		}
		return headerLayout;
	},
	getMoreLabel: function () {
		var _this = this;
		var showMoreContent = this._$expendQueryTitle + '<i class = "system system-icon-unfold "></i>';
		var showBackContent = this._$foldQueryTitle + '<i class = "system system-icon-fold "></i>';
		var labelContent = this.DefaultExpand ? showBackContent : showMoreContent;
		this.moreLabel = isc.Label.create({
			contents: labelContent,
			//            		width:50,
			height: 40,
			defaultWidth: 80,
			isMore: this.DefaultExpand ? false : true,
			baseStyle: 'header-more',
			click: function () {
				if (this.isMore) {
					if (_this.displayMode === 'collapseAll' && _this._Canvas.tiles.length > 0) {
						_this.removeLabel.setHeight(30);

						_this.titleLayout.removeMember(_this.removeLabel);
						_this._Canvas.addTile(_this.removeLabel);
					}
					var formValue = _this.formLayout.values;
					if (!_this.panel.members.contains(_this._contentLayout)) {
						if (_this.SearchBoxEnabled && !_this.titleLayout.members.contains(_this.searchBox)) {
							_this.titleLayout.addMember(_this.searchBox);
						}
						_this._contentLayout.addMember(_this.formLayout);
						_this.formLayout.show();
						_this.panel.addMembers(_this._contentLayout);
						_this._contentLayout.show();
						_this.formLayoutBindDataSource(_this.dataSource);
					} else {
						_this._contentLayout.addMembers(_this.formLayout);
						_this.formLayout.animateShow(null, null, 150, 'smoothEnd');
						if (_this.ShowToolbar && _this.SearchBoxEnabled && !_this.titleLayout.members.contains(_this.searchBox)) {
							_this.titleLayout.addMember(_this.searchBox);
						}
						_this.formLayoutBindDataSource(_this.dataSource);
					}
					_this.formLayout.setValues(formValue);
					_this.titleLayout.setStyleName('content-h-layout-title');
					this.setContents(showBackContent);
					this.isMore = false;
					_this.panelIsExpand = true;
				} else {
					_this.panelCollapse(showMoreContent);
				}
			}
		})
		return this.moreLabel;
	},
	panelCollapse: function (showMoreContent) {
		var _this = this;
		_this.panelIsExpand = false;
		if ($(_this.$q3).find('.select-wrapper').length > 0 || !_this.ShowToolbar) {
			if (_this.ShowToolbar) {
				_this.titleLayout.removeMember(_this.searchBox);
			}
			this.formLayout.animateHide(null, function () {
				_this._contentLayout.removeMember(_this.formLayout);
				_this.titleLayout.setStyleName('content-h-layout-title-unborder');
			}, 150, 'smoothEnd');

		} else {
			this._contentLayout.hide();
			_this.panel.removeMember(_this._contentLayout)
			_this.titleLayout.setStyleName('content-h-layout-title-unborder');
		}
		if (_this.displayMode === 'collapseAll' && _this._Canvas.tiles.length > 0) {
			_this.removeLabel.setHeight(40);
			if (!_this.titleLayout.members.contains(_this.removeLabel)) {
				if (_this.ShowToolbar) {
					_this.titleLayout.addMember(_this.removeLabel);
				} else {
					if (_this.SearchBoxEnabled) {
						_this.titleLayout.addMember(_this.removeLabel, _this.titleLayout.members.length - 2);
					} else {
						_this.titleLayout.addMember(_this.removeLabel, _this.titleLayout.members.length - 1);
					}
				}
			}

			_this._Canvas.removeTile(_this.removeLabel);
		}

		this.moreLabel.setContents(showMoreContent);
		this.moreLabel.isMore = true;
	},
	/**
	 * 初始化整个面板的layout
	 * @param {是否显示尾栏的layout} showMoreLayout 
	 * @param {*} id 
	 */
	_initContent: function (searchBox, id) {
		var contentLayout = this._getVAndHLayout();

		this.titleLayout = this.getTitleLayout(id);
		if (this.SearchBoxEnabled) {
			this.titleLayout.addMember(searchBox);
		}
		if (!this.ShowToolbar && this.displayMode === 'collapseAll') {
			var moreLabel = this.getMoreLabel();
			this.titleLayout.addMember(moreLabel);
		}

		if (this.FilterVisible || this.SearchBoxEnabled || this.displayMode === 'collapseAll') {
			contentLayout.addMember(this.titleLayout, 0)
		}
		if (!this.Visible) {
			contentLayout.Visibility = "hidden";
		}
		return contentLayout;
	},
	getSearchBox: function (id) {
		this.getLocateBoxField();
		this._locateBoxCanvas = isc.DynamicForm.create({
			autoFocus: true,
			styleName: 'search-box',
			fields: [{
				type: 'hidden',
				name: 'id'
			}],
			height: 40,
			bindDataSource: function (ds) {
				var vm = isc.JGV3ValuesManager.getByDataSource(ds);
				var dy = vm.getMember(this.ID);
				if (!dy) {
					vm.addMember(this);
				}
			},
			showHighlight: function () {
				var styleName = this.styleName;
				if (styleName || styleName.indexOf(" v3ComponentHighlight") == -1) {
					styleName = styleName ? styleName + " v3ComponentHighlight" : "v3ComponentHighlight";
					this.setStyleName(styleName)
				}
			},
			hideHighlight: function () {
				var styleName = this.styleName;
				if (styleName && styleName.indexOf(" v3ComponentHighlight") != -1) {
					styleName = styleName.replace(" v3ComponentHighlight", "");
					this.setStyleName(styleName)
				}
			}
		})
		var _this = this;
		this._locateBoxCanvas.addField({
			type: "V3SIconItem",
			titleVAlign: "bottom",
			pickerIconStyle: "locateBoxIcon",
			controlStyle: 'locateBoxCell',
			hint: this.locateBox.SimpleChineseTitle || this.locateBox.Hint,
			showHintInField: true,
			/*pickerIconHeight: 20,*/ // 处理图标高度导致控件高度过高
			pickerIconWidth: 20,
			getIconHTML: function (_1, _2, _3, _4) {
				return "<span class='iconfont icon-search v-query-condition-panel-locate-search-icon' " + isc.DynamicForm.$9a + "='" + _1.name + "'></span>";
			},
			mustRefocusOnRedraw: false,
			hasFocus: false,
			showTitle: false,
			name: this.locateBox.ColumnName,
			blur: function () {
				_this._locateBoxCanvas.performImplicitSave(_this._locateBoxCanvas, false);
				setTimeout(function () {
					_this.locateSearchIconBindHandler();
				}, 100)
			},
			handleKeyUp: function () {
				this.Super('handleKeyUp', arguments);
				_this.locateSearchIconBindHandler();
				return false;
			},
			pickerDefaults: {
				width: 20,
				height: 20,
				showCancelButton: true,
				autoHide: true
			},
		})
		return this._locateBoxCanvas;
	},
	addSearchBox: function (titleLayout, id) {
		titleLayout.addMember(this._locateBoxCanvas);
	},
	locateSearchIconBindHandler: function () {
		if (!this.ConditionDataSource || this.ConditionDataSource == "") {
			return;
		}
		var _this = this;
		$(_this.$q3).find('.v-query-condition-panel-locate-search-icon').on('click', function () {
			if (_this._searchTime) {
				clearTimeout(_this._searchTime);
			}
			_this._searchTime = setTimeout(function () {
				_this._locateBoxCanvas.performImplicitSave(_this._locateBoxCanvas, false);
				_this.searchFunc.fireEvent();
			}, 100)
		})
	},
	/**
	 * 构造layout嵌套关系
	 */
	_getVAndHLayout: function () {
		var id = isc.WidgetUtils.genLayoutId(this.scopeId, this.getId());
		var ConditionDataSource = this.ConditionDataSource && JSON.parse(this.ConditionDataSource);
		if (ConditionDataSource.Layout && ConditionDataSource.Layout.CommonConditions[0].VLayout) {
			this.conditionLayout = ConditionDataSource.Layout.CommonConditions[0].VLayout;
		}
		if (ConditionDataSource && ConditionDataSource.CommonConditions && ConditionDataSource.CommonConditions.Items) {
			var layoutItems = ConditionDataSource.CommonConditions.Items;

			this.getShowAndHideFields(layoutItems);
			this.addFooterBtn();
			this.getFormLayout(id);
		}
		var layout = isc.VLayout.create({
			autoDraw: false,
			ID: "VLayout_" + id,
			width: "100%",
			canFocus: true,
			layoutLeftMargin: 10,
			layoutRightMargin: 10,
			members: this.formLayout ? this.formLayout : [],
			styleName: "v-query-condition-panel-v-layout",
		})
		return layout;
	},
	addFooterBtn: function () {
		var footerBtns = this.getFooterBtn();
		this.layoutFields.push({
			type: "inlineButtonGroup",
			buttons: footerBtns,
			wrapHintText: false,
			showTitle: false,
			colSpan: this.footerBtnCol,
			align: "right"
		})
	},
	getFooterBtn: function () {
		var _this = this;
		this.buttonsList = [{
			ID: 'moreBtn' + this._id,
			title: this._$showMoreTitle + '<i class = "system system-icon-unfold "></i>',
			showMore: true,
			click: function () {
				_this.moreBtnClickHandler(_this)
			},
			baseStyle: 'v-query-condition-panel-show-more-span',
			width: 64,
			height: 28,
		}, {
			//临时适配多语言
			title: this.QueryButtonText != "查询" ? this.QueryButtonText : this._$queryBtnTitle,
			click: function () {
				_this.searchFunc.fireEvent();
				//						return true;
				//						if(_this._Canvas.tiles.length > 0){
				//							_this.hideFields();
				//							if(_this.displayMode === 'collapseAll'){
				//								var showMoreContent = '展开查询<i class = "system system-icon-unfold "></i>';
				//								_this.panelCollapse(showMoreContent);
				//							}
				//						}
			},
			baseStyle: 'v-query-condition-panel-search-btn',
			//					width:52,
			overflow: 'inherit',
			height: 28,
		}, {
			title: '清空',
			click: function () {
				_this.removeAllFunc();
				if (_this.TriggerType != 'ConditionValueChanged') {
					_this.searchFunc.fireEvent();
				}
			},
			baseStyle: 'v-query-condition-panel-clear-btn',
			width: 52,
			height: 28,
			//					redraw:function(){}
		}];
		if (this.hideLayoutFields.length <= 0 || this.displayMode == 'collapseAll') {
			this.showMore = null;
			this.buttonsList.splice(0, 1);
			this.buttonsList[0].baseStyle = 'v-query-condition-panel-search-btn unmore'
			this.buttonsList[1].baseStyle = 'v-query-condition-panel-clear-btn unmore'
		}
		if (this.FilterVisible) {
			this.buttonsList.splice(this.buttonsList.length - 1, 1);
		}
		return this.buttonsList;
	},
	hideFields: function () {
		this.removeHideFieldsFromFormLayout();
		var moreBtn = $(this.$q3).find(".v-query-condition-panel-show-more-span");
		if (moreBtn && moreBtn.length > 0) {
			this.showMore = true;
			this.buttonsList[0].title = this._$showMoreTitle + '<i class = "system system-icon-unfold "></i>';
		}
		$('.v-query-condition-panel-mask').removeClass('show');
	},
	showFields: function () {

		this.addHideFieldsToFormLayout();
		var moreBtn = $(this.$q3).find(".v-query-condition-panel-show-more-span");
		if (moreBtn && moreBtn.length > 0) {
			this.showMore = false;
			this.buttonsList[0].title = this._$foldQueryTitle + '<i class = "system system-icon-fold "></i>';
		}
		var parent;
		if (this.parentWidget) {
			parent = this.parentWidget;
		} else if (this.parentElement) {
			parent = this.parentElement.parentElement;
		}
		if (!(this.Dock == 'Top' && parent.LayoutType == "BorderLayout") && this.hideLayoutFields.length >= 1) {
			$(this.$q3).find('.v-query-condition-panel-mask').addClass('show');
		}

	},
	moreBtnClickHandler: function (_this) {
		if (this.showMore == true) {
			_this.showFields();
			this.inlineButton = this.getInlineButtonItem();
			this.inlineButton.colSpan = this.expandCol;
			this.inlineButton.redraw();
		} else {
			_this.hideFields();
			this.inlineButton = this.getInlineButtonItem();
			this.inlineButton.colSpan = this.collapseCol;
			this.inlineButton.redraw();
		}
	},
	getInlineButtonItem: function () {
		return this.formLayout.items.filter(function (item) {
			return item.type == "inlineButtonGroup"
		})[0];
	},
	addHideFieldsToFormLayout: function () {
		this.hideFieldWidget = [];
		for (var i = this.hideLayoutFields.length - 1; i >= 0; i--) {
			this.formLayout.getItemByCode(this.hideLayoutFields[i].Code).show();
		}
	},
	removeHideFieldsFromFormLayout: function () {
		if (this.hideLayoutFields) {
			for (var i = 0; i < this.hideLayoutFields.length; i++) {
				this.formLayout.getItemByCode(this.hideLayoutFields[i].Code).hide();
			}
		}
	},
	getShowAndHideFields: function (layoutItems) {
		this.displayMode = "collapseAll";
		this.FilterVisible = true;
		this.layoutFields = [{
			type: 'hidden',
			name: 'id'
		}];
		this.expandLayoutFields = [];
		this.showLayoutFields = [];
		this.hideLayoutFields = [];
		this.unVisibleField = []
		var hideMode = [];
		this._displayMode = ""
		for (var i = 0; i < layoutItems.length; i++) {
			if (layoutItems[i].Hide === false) {
				var _mode = "expand";
				this.displayMode = _mode;
				this.FilterVisible = false;
			} else {
				var _mode = "collapse";
			}
			hideMode.push(_mode);
		}
		if (hideMode.contains("expand") && hideMode.contains("collapse")) {
			this._displayMode = "expand";
		} else if (hideMode.contains("expand") && !hideMode.contains("collapse")) {
			this._displayMode = "expandAll";
		} else if (!hideMode.contains("expand") && hideMode.contains("collapse")) {
			this._displayMode = "collapseAll";
		}

		for (var j = 0; j < this.fields.length; j++) {
			for (var i = 0; i < layoutItems.length; i++) {
				if (this.headerControls && this.headerControls.includes(this.fields[j].Code)) {
					continue;
				}
				if (layoutItems[i].InputStyle.InputRelevance == this.fields[j].Code) {

					this.fields[j].width = "*";
					this.fields[j].colSpan = "1";
					this.fields[j].hint = this.fields[j].Placeholder;
					this.fields[j].hintStyle = "v3FormItemPlaceholder";
					this.fields[j].showHintInField = true;
					if (this.fields[j].type == "JGDateRangePicker" || this.fields[j].type == "JGFloatRangeBox" || this.fields[j].type == "JGPeriodRange") {
						this.layoutFields.push({
							type: 'hidden',
							name: this.fields[j].EndColumnName,
							visible: false,
							getBindFields: function () {
								return [this.name]
							},
						})
					}
					if (layoutItems[i].InputStyle.InputFullWidth === true) {
						this.fields[j].colSpan = this.ColumnCount * 2 - 1 + "";
					}
					if (this.fields[j].Visible == false) {
						this.unVisibleField.push(this.fields[j]);
						//			            		break;
					}
					if (this.displayMode == 'collapseAll') {
						if (this.fields[j].Visible) {
							this.showLayoutFields.push(this.fields[j]);
							this.expandLayoutFields.push(this.fields[j]);
						}
					} else {
						this.fields[j].Hide == layoutItems[i].Hide;
						this.fields[j].Visible = this.fields[j].Visible && !layoutItems[i].Hide;
						if (layoutItems[i].Hide === true) {
							this.hideLayoutFields.push(this.fields[j])
							this.expandLayoutFields.push(this.fields[j]);
						} else if (this.fields[j].Visible) {
							this.showLayoutFields.push(this.fields[j]);
							this.expandLayoutFields.push(this.fields[j]);
						}
					}
					this.fields[j].sortIndex = j;
					this.layoutFields.push(this.fields[j]);
					break;
				}

			}
		}
		this.getFooterBtnCol(this.layoutFields, true);
	},
	setItemVisible: function (item, visible) {
		var _this = this;
		var index = this.unVisibleField.findIndex(function (field) {
			return field.Code == item.Code;
		})
		if (index >= 0) {
			if (visible) {
				this.unVisibleField.splice(index, 1);
			}
		} else {
			if (!visible) {
				this.unVisibleField.push(item);
				this.clearNotVisibleData();
			}
		}
	},
	getFooterBtnCol: function (layoutFields, notChange) {

		if (this.conditionLayout) {
			this.expandLayout = this.getLayout(layoutFields, notChange).expandLayout;
			if (this.expandLayout.length > 0) {
				this.currentCol = this.getColNum(this.expandLayout[this.expandLayout.length - 1]);
			} else {
				this.currentCol = this.ColumnCount * 2;
			}
		}
		if (this._displayMode == "collapseAll" || this._displayMode == "expandAll") {
			this.footerBtnCol = this.currentCol;
			if (this.DefaultExpand) {
				this.panelIsExpand = true
			}
		} else {
			this.expandCol = this.currentCol;
			this.collapseLayout = this.getLayout(layoutFields, notChange).collapseLayout;
			this.collapseCol = this.getColNum(this.collapseLayout[this.collapseLayout.length - 1]);
			this.footerBtnCol = this.collapseCol;
		}
	},
	setFooterBtnCol: function () {
		this.getFooterBtnCol(this.formLayout.items);
		var footerItem = this.formLayout.items.find(function (item) {
			return item.type == "inlineButtonGroup";
		})
		footerItem.colSpan = this.footerBtnCol;
	},
	getLocateBoxField: function () {
		for (var i = 0; i < this.fields.length; i++) {
			if (this.fields[i].type == 'JGLocateBox') {
				this.locateBox = this.fields[i];
				return;
			}
		}
	},
	getFileByColumnName: function (name) {
		for (var i = 0; i < this.formLayout.items.length; i++) {
			var item = this.formLayout.items[i];
			if (item.ColumnName == name || item.StartColumnName == name || item.EndColumnName == name) {
				return item;
			}
		}
		if (this.locateBox && name == this.locateBox.ColumnName) {
			return this.locateBox;
		}
	},
	getFileByIDColumnName: function (name) {
		for (var i = 0; i < this.formLayout.items.length; i++) {
			var item = this.formLayout.items[i];
			if (item.IDColumnName == name) {
				return item;
			}
		}
	},
	getColNum: function (lastHLayout) {
		var col = 0;
		if (!lastHLayout || lastHLayout.length == 0) {
			return this.ColumnCount * 2;
		}
		//				if(lastHLayout[lastHLayout.length - 1].InputStyle.InputRelevance == "flpMoreAndQuery_item_static"){
		//					lastHLayout.splice(lastHLayout.length - 1,1);
		//				}
		if (lastHLayout[lastHLayout.length - 1].colSpan == 5) {
			col = this.ColumnCount * 2;
		} else {
			if (lastHLayout.length == this.ColumnCount) {
				col = this.ColumnCount * 2;
			} else {
				col = (this.ColumnCount - lastHLayout.length) * 2;
			}
		}
		return col;
	},
	getFormLayout: function (id) {
		var _this = this;
		this.formLayout = isc.JGFormLayout.create({
			NumCols: this.ColumnCount,
			Width: "100%",
			fields: this.layoutFields,
			Dock: this.Dock,
			TitleAlign: 'left',
			SourceTableName: this.SourceTableName,
			TableName: this.TableName,
			TitleWidth: this.ItemLabelWidth,
			//					cellPadding:4,
			//					padding:4,
			//					bottomPadding:4,
			margin: 4,
			autoDraw: false,
			isQueryConditionPanel: true,
			layoutBottomMargin: 5,
			parentObject: this,
			hasFocus: false,
			implicitSaveInProgress: true,
			fixedColWidths: this.fixedColWidths,
			//解决窗体设计器中，查询面板内部子控件上下无间距   --- 看起来没啥用，先屏蔽
			//					styleName:'v-query-condition-panel-form',   
			_initFieldLayout: function () {},
			_itemEventHandler: function (itemCode, eventCode, args) {
				_this._eventHandler(itemCode, eventCode)();
			}
		})
	},
	/**
	 * 创建标题
	 */
	_initTitleCanvas: function () {
		if (this.displayMode === 'collapseAll') {
			this._Canvas = isc.FlowLayout.create({
				overflow: 'inherit',
				tiles: [],
				minHeight: 40,
				layoutAlign: "center",
				animateTileChange: false,
				tileMargin: 5,
				layoutMargin: 5,
				styleName: 'flow-layout'
			})
		} else {
			this._Canvas = isc.LayoutSpacer.create({});
		}
	},
	getItemSortIndex: function (code) {
		var field = this.layoutFields.find(function (item) {
			return item.StartColumnName ? item.StartColumnName == code : item.ColumnName == code;
		})
		if (this.locateBox && code == this.locateBox.ColumnName) {
			return this.layoutFields.length + 1;
		}
		return field.sortIndex;
	},
	getSelectLabelPositionIndex: function (sortIndex) {
		for (var i = 0; i < this._Canvas.tiles.length; i++) {
			var tile = this._Canvas.tiles[i];
			if (tile.sortIndex > sortIndex) {
				return i;
			}
		}
		return this._Canvas.tiles.length;
	},
	createSelectLabel: function (content, code, removeHandler, removeAllHandler) {
		var _this = this;
		var sortIndex = this.getItemSortIndex(code);
		var labelPositionIndex = this.getSelectLabelPositionIndex(sortIndex);
		var label = isc.Label.create({
			contents: content,
			height: 30,
			sortIndex: sortIndex,
			align: "center",
			wrap: false,
			autoFit: true,
			width: 5,
			styleName: 'select-label-wrapper',
			vAlign: 'center',
			icon: "[SKINIMG]actions/close.png",
			iconOrientation: 'right',
			imgHTML: function (_1) {
				return '<span class = "iconfont icon-close iconfont-select-close" eventpart="icon" data-from = "' + code + '"></span>';
			},
			iconClick: function () {
				var removeTile = removeHandler(code);
				if (!removeTile) {
					return;
				}
				_this._Canvas.removeTile(this);
				if (_this._Canvas.tiles.length == 1 && _this._Canvas.tiles[0].type === 'removeLabel') {
					_this._Canvas.removeTile(_this._Canvas.tiles[0]);
					_this.selectTitle.setContents(this._$conditionQueryTitle);
					if (!_this.panelIsExpand && _this.ShowToolbar) {
						_this._contentLayout.hide();
						_this.panel.removeMember(_this._contentLayout);
					}

				} else if (_this._Canvas.tiles.length == 0 && _this.titleLayout.members.contains(_this.removeLabel)) {
					_this.titleLayout.removeMember(_this.removeLabel);
					_this.selectTitle.setContents(this._$conditionQueryTitle);
					if (!_this.panelIsExpand && _this.ShowToolbar) {
						_this._contentLayout.hide();
						_this.panel.removeMember(_this._contentLayout);
					}
				}
				if (!_this.panelIsExpand) {
					_this.searchFunc.fireEvent();
				}
			},
			valueFrom: code,
		});
		if (!this.removeLabel) {
			var clearButtonText = this.ClearButtonText == "清空查询" ? this._$clearQueryTitle : this.ClearButtonText
			this.removeLabel = isc.Label.create({
				type: 'removeLabel',
				contents: '<span class = "select-remove-all">[ ' + clearButtonText + ' ]</span>',
				height: 30,
				align: "center",
				wrap: false,
				autoFit: true,
				width: 5,
				vAlign: 'center',
				sortIndex: 1000000,
				styleName: 'select-remove-all',
				click: function () {
					//							_this.removeAllCondition(this,removeAllHandler);
					if (removeAllHandler) {
						removeAllHandler();
					}
				}
			})
		}
		if (this.panelIsExpand === undefined && !this.DefaultExpand) {
			if (!this.titleLayout.members.contains(this.removeLabel)) {
				this.removeLabel.setHeight(40)
				this.titleLayout.addMember(this.removeLabel, this.titleLayout.members.length - 1);

			}
			this._Canvas.addTile(label, labelPositionIndex);
		} else {
			this.removeLabel.setHeight(30)
			this._Canvas.addTile(label, labelPositionIndex);
			if (!this._Canvas.tiles.contains(this.removeLabel)) {
				this._Canvas.addTile(this.removeLabel);
			}
		}

		this.selectTitle.setContents(this._$selectedTitle);
	},
	removeAllCondition: function (_this, removeAllHandler) {
		if (this._Canvas.tiles) {
			while (this._Canvas.tiles.length > 0) {
				this._Canvas.removeTile(this._Canvas.tiles[0]);
			}
		}
		if (this.titleLayout.members.contains(_this)) {
			this.titleLayout.removeMember(_this);
		}
		if (removeAllHandler) {
			removeAllHandler();
		}
		if (!this._Canvas.tiles || this._Canvas.tiles.length == 0) {
			this.selectTitle.setContents(this._$conditionQueryTitle);
		}

		if (!this.panelIsExpand && this.ShowToolbar) {
			this._contentLayout.hide();
			this.panel.removeMember(this._contentLayout);
		}
		if (!this.panelIsExpand) {
			this.searchFunc.fireEvent();
		}
	},
	/**
	 * 添加遮罩div
	 */
	_appendMask: function () {
		this.$q3.parentNode.style.zIndex = 200 + this.$q3.parentNode.style.zIndex;
		if ($(this.$q3).find('.v-query-condition-panel-mask').length != 0) {
			$(this.$q3).find('.v-query-condition-panel-mask').remove();
		}
		var mask = '<div class = "v-query-condition-panel-mask"></div>'
		this.$q3.appendChild($(mask)[0]);
		if (this.hideLayoutFields.length < 1) return;
		this._layoutFadeByMask();
	},
	/**
	 * 点击遮罩，面板收回
	 */
	_layoutFadeByMask: function () {
		var _this = this;
		$(this.$q3).find('.v-query-condition-panel-mask').click(function () {
			_this.hideFields()
		})
	},
	/**
	 * 条件面板最上方的【条件查询】
	 */
	_getSelectValue: function (showMore) {
		var panelTitleHtml = "";
		var conditionTitle = this._$conditionQueryTitle;
		if (!this.FilterVisible) {
			panelTitleHtml = '\
						<div class = "v-query-condition-panel-select-value-wrapper">\
							<span class = "v-query-condition-panel-select-value-title">' + conditionTitle + '</span>\
						</div>\
					';
		} else {
			panelTitleHtml = '\
						<div class = "v-query-condition-panel-select-value-wrapper">\
							<span class = "v-query-condition-panel-select-value-title">' + this._$conditionQueryTitle + '</span>\
							<div class = "v-query-condition-panel-select-wrapper">\
								<div class = "v-query-condition-panel-select-values"></div>\
								<div class = "v-query-condition-panel-remove-wrapper"></div>\
							</div>\
						</div>\
					';
		}
		return panelTitleHtml;
	},

	//重写canvas方法，按下enter回车键后，触发【查询】规则
	handleKeyUp: function () {
		if (event.keyCode == 13) {
			this.blur();
			var _this = this;
			setTimeout(function () {
				_this.focus();
				if (_this._time != null) {
					clearTimeout(this._time);
				}
				setTimeout(function () {
					_this.searchFunc.fireEvent();
				}, 100)
			}, 0)
		}
	},
	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		this._Canvas && this._Canvas.setWidth(percentWidth);
		this._layout && this._layout.setWidth(percentWidth);
		this._contentLayout && this._contentLayout.setWidth(percentWidth);
		this.formLayout && this.formLayout.setWidth(percentWidth);
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		this._Canvas && this._Canvas.setHeight(percentHeight);
		this._layout && this._layout.setHeight(percentHeight);
		this._contentLayout && this._contentLayout.setHeight(percentHeight);
		this.formLayout && this.formLayout.setWidth(percentHeight);
	},
	destroy: function () {
		this._Canvas = null;
		this._Layout = null;
		this.Super("destroy", arguments);
	},
	setLabelText: function (title, itemCode) {
		if (this.formLayout && this.formLayout.setLabelText) {
			this.formLayout.setLabelText(title, itemCode);
		}
	},
	firePlatformEventBefore: function (eventName, proxyWidgetCode, itemCode) {
		if (eventName == "OnConditionChanged") {
			var item = this.getInlineButtonItem();
			if (item && item.buttons && item.buttons[0]) {
				var classNames = item.buttons[0].baseStyle ? item.buttons[0].baseStyle.split(" ") : [];
				if (classNames.indexOf("V3ButtonActive") == -1) {
					classNames.splice(0, 0, "V3ButtonActive");
					item.buttons[0].baseStyle = classNames.join(" ");
					item.redraw();
				}
			}
		}
	},
	firePlatformEventAfter: function (eventName, proxyWidgetCode, itemCode) {
		if (eventName == "OnConditionChanged") {
			var item = this.getInlineButtonItem();
			if (item && item.buttons && item.buttons[0]) {
				var classNames = item.buttons[0].baseStyle ? item.buttons[0].baseStyle.split(" ") : [];
				if (classNames.indexOf("V3ButtonActive") != -1) {
					classNames.splice(classNames.indexOf("V3ButtonActive"), 1);
					item.buttons[0].baseStyle = classNames.join(" ");
					item.redraw();
				}
			}
		}
	},
	/**
	 * 生成选中值的html
	 * */
	_genSelectValueHtml: function (title, code, value) {
		var _value = value;
		if (_value && typeof (_value) == "string") {
			var tempDiv = document.createElement("div");
			tempDiv.innerText = _value;
			_value = tempDiv.innerHTML;
		}
		var html = '<div class = "select-wrapper">' +
			'<span class = "select-title">' + title + '：</span>' +
			'<span class = "select-value" data-from = "' + code + '" title = "' + value + '">' + _value + '</span>' +
			'</div>';
		return html;
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
					if ((property == "MultiWidth" || property == "MultiHeight") && typeof (val) == "number") {
						widget[key] = val + "";
					} else if (property == "NumCols" && typeof (val) == "string") {
						widget[key] = Number(val);
					} else {
						widget[property] = propertys[property];
					}
				}
			}
		}
		var childProps = propertyMap.Widgets;
		if (childProps) {
			var fieldsMap = {};
			var fields = widget.fields;
			for (var i = 0, len = fields.length; i < len; i++) {
				var field = fields[i];
				fieldsMap[field.Code] = field;
			}
			var newFields = [];
			var existId = [];
			for (var i = 0, len = childProps.length; i < len; i++) {
				var childProp = childProps[i];
				var widgetId = childProp.WidgetCode;
				existId.push(widgetId);
				var sourceField = fieldsMap[widgetId];
				newFields.push(sourceField);
				var cp = childProp.Properties;
				if (cp) {
					for (var key in cp) {
						if (cp.hasOwnProperty(key)) {
							var val = cp[key];
							if (key == "LabelText") {
								sourceField.SimpleChineseTitle = val;
							} else if ((key == "MultiWidth" || key == "MultiHeight") && typeof (val) == "number") {
								sourceField[key] = val + "";
							} else if (key == "NumCols" && typeof (val) == "string") {
								sourceField[key] = Number(val);
							} else {
								sourceField[key] = val;
							}
						}
					}
				}
			}
			for (var i = 0, len = fields.length; i < len; i++) {
				var field = fields[i];
				var widgetId = field.Code;
				if (existId.indexOf(widgetId) == -1) {
					newFields.push(field)
				}
			}
			widget.fields = newFields;
		}
	},

	getMaxTitleLength: function (params) {
		var maxLength = 0;
		var fieldWidgets = params.property.fields
		if (fieldWidgets && fieldWidgets.length > 0) {
			for (var i = 0, len = fieldWidgets.length; i < len; i++) {
				var fieldWidget = fieldWidgets[i];
				if (fieldWidget.type != "JGLocateBox") {
					var titleLen = params.calculateLength(fieldWidget.SimpleChineseTitle);
					if (titleLen > maxLength) {
						maxLength = titleLen;
					}
				}
			}
		}
		return maxLength;
	},

	setFormat: function (field) {
		var currencyFields = this._getCurrencyField()
		for (var key in currencyFields) {
			if (field.SourceTableName == key) {
				if (field.ColumnName && currencyFields[key][field.ColumnName]) {
					var ColumnDisplay = currencyFields[key][field.ColumnName];
					field.DisplayFormat = {
						displayFormat: ColumnDisplay.displayFormat ? ColumnDisplay.displayFormat : field.DisplayFormat.displayFormat,
						numType: ColumnDisplay.displayFormat ? ColumnDisplay.numType : field.DisplayFormat.displayFormat,
						Index: field.DisplayFormat.Index
					}
				}
				if (field.StartColumnName && currencyFields[key][field.StartColumnName]) {
					var startColumnDisplay = currencyFields[key][field.StartColumnName];
					field.StartDisplayFormat = {
						displayFormat: startColumnDisplay.displayFormat ? startColumnDisplay.displayFormat : field.DisplayFormat.displayFormat,
						numType: startColumnDisplay.displayFormat ? startColumnDisplay.numType : field.DisplayFormat.displayFormat,
						Index: field.DisplayFormat.Index
					}
				}
				if (field.EndColumnName && currencyFields[key][field.EndColumnName]) {
					var endColumnDisplay = currencyFields[key][field.EndColumnName];
					field.EndDisplayFormat = {
						displayFormat: endColumnDisplay.displayFormat ? endColumnDisplay.displayFormat : field.DisplayFormat.displayFormat,
						numType: endColumnDisplay.displayFormat ? endColumnDisplay.numType : field.DisplayFormat.displayFormat,
						Index: field.DisplayFormat.Index
					}
				}
			}
		}
	},

	processFormLayout: function (widget, infos) {
		var fields = widget.fields;
		if (!fields)
			return;
		for (var i = 0, len = fields.length; i < len; i++) {
			var field = fields[i];
			var info = infos[field.SourceTableName];
			if (!info)
				continue;
			this.setFormat(field);
		}
	},

	initDataBinding: function () {
		if (this.ConditionDataSource && this.ConditionDataSource != "") {
			this.initFormLayoutDs();
		}
	},

	initFormLayoutDs: function () {
		if (this.formLayout) {
			var dsList = this.formLayout.getMultiDataSourceInfo();
			if (dsList) {
				this.formLayoutMultiDs(dsList, this.formLayout)
			} else {
				this.formLayoutSimple()
			}
		}
	},

	formLayoutMultiDs: function (dsList, widget) {
		for (var dsName in dsList) {
			var fields = dsList[dsName].fields;
			var observer = isc.CurrentRecordObserver.create({
				fields: fields,
				setValueHandler: (function (_fields) {
					return function (record) {
						var prefix = dsName + widget.multiDsSpecialChar;
						var data = widget.values;
						if (!data) {
							data = {};
						}
						data["id"] = record.id;
						data[prefix + "id"] = record.id;
						for (var i = 0, l = _fields.length; i < l; i++) {
							var fieldCode = _fields[i];
							if (fieldCode.indexOf(widget.multiDsSpecialChar) != -1) {
								fieldCode = fieldCode.split(widget.multiDsSpecialChar)[0];
							}
							data[prefix + fieldCode] = record[fieldCode];
						}
						widget.setValues(data);
					}
				})(fields),
				clearValueHandler: (function (_dsName, _fields) {
					return function () {
						var data = wd.values;
						if (data) {
							try {
								for (var i = 0, l = _fields.length; i < l; i++) {
									var fieldCode = _fields[i];
									if (fieldCode.indexOf(widget.multiDsSpecialChar) != -1) {
										delete data[fieldCode];
									} else {
										delete data[_dsName + widget.multiDsSpecialChar + fieldCode];
									}
								}
							} catch (e) {}
							widget.setValues(data);
						}
					}
				})(dsName, fields)
			});
			var datasource = isc.JGDataSourceManager.get(this, dsName);
			datasource.addObserver(observer);
		}
	},

	formLayoutSimple: function () {
		var formLayoutFields = [];
		var formLayoutItems = this.formLayout.getItems();
		if (formLayoutItems && formLayoutItems.length > 0) {
			for (var i = 0, l = formLayoutItems.length; i < l; i++) {
				var item = formLayoutItems[i];
				if (item && item.getBindFields) {
					var fieldCodes = item.getBindFields();
					if (fieldCodes && fieldCodes.length > 0) {
						for (var j = 0, len = fieldCodes.length; j < len; j++) {
							var fieldCode = fieldCodes[j];
							if (formLayoutFields.indexOf(fieldCode) == -1) {
								formLayoutFields.push(fieldCode);
							}
						}
					}
				}
			}
		}
		this.initSearchDs(formLayoutFields)
		this.addFormLayoutObserver(formLayoutFields)
	},

	initSearchDs: function (formLayoutFields) {
		if (this._locateBoxCanvas) {
			formLayoutFields.push(this._locateBoxCanvas.getItems()[1].name);
		}
	},

	addFormLayoutObserver: function (formLayoutFields) {
		var _this = this;
		var observerFormLayout = isc.CurrentRecordObserver.create({
			fields: formLayoutFields,
			setValueHandler: function (record) {
				var formWidget = _this.formLayout;
				//把方法放在外面调用就会报错。。。
				//    		editRecord(record,fields,formName,widget,formWidget);
				var data = {
					id: record.id
				};
				for (var i = 0, l = fields.length; i < l; i++) {
					var fieldCode = fields[i]
					data[fieldCode] = record[fieldCode];
				}
				if (formWidget.valuesManager) {
					formWidget.valuesManager.editRecord(data);
				} else if (_this.valuesManager) {
					_this.valuesManager.editRecord(data);
				}
				formWidget.setValues(data);
			},
			clearValueHandler: function (_dsName, _fields) {
				var formWidget = _this.formLayout;
				var datasource = isc.JGDataSourceManager.get(_this, _this._tableName);
				var emptyRecord = datasource.getAllRecords().length == 0;
				if (formWidget.parentObject && emptyRecord) {
					formWidget.parentObject.removeAllCondition();
				}
				var data = formWidget.values;
				if (data) {
					try {
						for (var i = 0, l = _fields.length; i < l; i++) {
							var fieldCode = _fields[i];
							delete data[fieldCode];
						}
					} catch (e) {}
					if (formName == "formLayout") {
						if (formWidget.valuesManager) {
							formWidget.valuesManager.clearValues();
						} else if (_this.valuesManager) {
							_this.valuesManager.clearValues();
						}
					}
					if (emptyRecord) { //原型工具支持配置查询面板的初始数据，如果实体存在记录，则不需要创建新记录。查询面板的记录数只能有一条，由开发系统控制
						var newRecord = datasource.createRecord();
						datasource.insertRecords([newRecord]);
						_this.editV3Record(newRecord, fields);
					}
				}

			}
		});
		var datasource = isc.JGDataSourceManager.get(this, this._tableName);
		datasource.addObserver(observerFormLayout);
	},

	editV3Record = function (record, fields) {
		var formWidget = this.formLayout;
		var data = {
			id: record.id
		};
		for (var i = 0, l = fields.length; i < l; i++) {
			var fieldCode = fields[i]
			data[fieldCode] = record[fieldCode];
		}
		if (formWidget.valuesManager) {
			formWidget.valuesManager.editRecord(data);
		} else if (this.valuesManager) {
			this.valuesManager.editRecord(data);
		}
	},

	/**
	 * 初始化控件事件。
	 * 
	 * 渲染完成后触发，一般在这里进行ui的事件监听和事件绑定。
	 */
	initEvent: function () {
		if (this.ConditionDataSource && this.ConditionDataSource != "") {
			this.initEventUI();
		}
	},

	initEventUI: function (widgetCode, widget) {
		this.formLayoutGetDropDownSource();
		var _columnNames = this._columnNames = [];
		var _idColumnName = this._idColumnNames = {};
		var childrenFields = this.fields;
		for (var i = 0; i < childrenFields.length; i++) {
			var childrenField = childrenFields[i];
			var columnName = childrenField.ColumnName;
			if (columnName) {
				_columnNames.push(columnName);
				if (childrenField.IDColumnName) {
					_idColumnName[childrenField.IDColumnName] = columnName;
				}
			}
			if (childrenField.StartColumnName) {
				_columnNames.push(childrenField.StartColumnName)
			}
			if (childrenField.EndColumnName) {
				_columnNames.push(childrenField.EndColumnName)
			}
		}
		var widget = this;
		var callback = function (datasourceName) {
			var record = datasourceName.resultSet[0];
			var recordMap = record;
			var changedData = record.changedData;
			if (widget.FilterVisible) {
				for (var prop in changedData) {
					var item = null;
					if (widget._columnNames.indexOf(prop) != -1) {
						item = widget.getFileByColumnName(prop);
					} else if (widget._idColumnNames[prop]) {
						item = widget.getFileByIDColumnName(prop);
						if (item) {
							var cn = item.ColumnName;
							if (changedData.hasOwnProperty(cn)) { //标识值和显示同步修改，可以不用替换
								continue;
							} else {
								var displayValue = item.mapValueToDisplay(changedData[prop]);
								prop = cn;
								recordMap[prop] = displayValue;
							}
						}
					}
					if (!item)
						continue;
					var title = item.title;
					if (!title && widget.locateBox && prop == widget.locateBox.ColumnName) {
						title = widget.locateBoxTitle;
					}
					widget._getvalue(prop, datasourceName, widget, widgetCode, item, recordMap, title);
				}
			}
			if (widget.TriggerType == 'ConditionValueChanged') {
				if (widget._time != null) {
					clearTimeout(widget._time);
				}
				widget._time = setTimeout(function () {
					widget.searchFunc.fireEvent();
				}, 100)
			}
		}
		var indexId = this.componentId ? this.componentId : this.scopeId;
		var datasourceName = this.TableName.indexOf(indexId) != -1 ? this.TableName.split(indexId + "_")[this.TableName.split(indexId + "_").length - 1] : this.TableName;
		this._tableName = datasourceName;
		var datasource = isc.JGDataSourceManager.get(this,datasourceName);
		for (var i = 0; i < childrenFields.length; i++) {
			if (this.headerControls && this.headerControls.includes(childrenFields[i].code)) {
				continue;
			}
			(function (index) {
				var datasourceField = childrenFields[i].ColumnName;
				if (datasourceField) {
					isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(datasource, datasourceField, callback);
					isc.DatasourceUtil.addDatasourceInsertEventHandler(datasource, callback)
				}
				if (childrenFields[i].StartColumnName && childrenFields[i].EndColumnName) {
					var startField = childrenFields[i].StartColumnName;
					var endFiled = childrenFields[i].EndColumnName;
					isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(datasource, startField, callback);
					isc.DatasourceUtil.addDatasourceFieldUpdateEventHandler(datasource, endFiled, callback);
				}
			})(i)
		}
		this.initFormLayoutHandler();
	},
	//原型工具可以配置实体数据，避免界面数据闪烁 要放在窗体加载前，因为窗体加载可以使用赋值规则。
	dataLoad: function(){
		this.resetDsRecord(widgetCode, widget, false, true);
		this._removeAllFunc(widget, widgetCode);
		this.searchFunc(widget, widgetCode);
	},
	/**
	 * isLoad 初始化数据
	 * */
	var resetDsRecord = function (widgetCode, widget, remove, isLoad) {
		var datasource = datasourceManager.lookup({
			"datasourceName": widget._tableName
		});
		var records = datasource && datasource.getAllRecords();
		var oldRecord;
		if (records && records.datas.length > 0) {
			if (isLoad) {
				oldRecord = datasource.getRecordByIndex(records.datas.length - 1);
			}
			datasource.clear();
		}
		if (!remove) {
			var newRecord = datasource.createRecord();
			if (oldRecord) {
				var loadRecordMap = oldRecord.toMap();
				for (var key in loadRecordMap) {
					if (loadRecordMap.hasOwnProperty(key)) {
						newRecord.set(key, loadRecordMap[key]);
					}
				}
			}
			datasource.insertRecords({
				records: [newRecord]
			});
		}

	}

	var initFormLayoutHandler = function (widgetCode, widget) {
			var widget = widget.formLayout;
			var dsNames = widget.SourceTableName;
			var ds = dsManager.lookup({
				datasourceName: dsNames
			});
			if (ds) {
				//处理表单项值改变事件
				ds.on({
					eventName: ds.Events.UPDATE,
					handler: function (params) {
						widget.parentObject.clearNotVisibleData()
						//					var codes = []
						var items = widget.getItems();
						if (items && items.length > 0) {
							var resultSet = params.resultSet;
							for (var i = 0, l = items.length; i < l; i++) {
								var item = items[i];
								if (!item.getValueChangeFields) continue;
								var fields = item.getValueChangeFields();
								if (fields && fields.length > 0) {
									var founded = false;
									for (var j = 0, len = fields.length; j < len; j++) {
										resultSet.iterate(function (record) {
											var changedData = record.getChangedData();
											if (changedData && changedData.hasOwnProperty(fields[j])) {
												//											codes.push(item.Code);
												founded = true;
												return false;
											}
										});
										if (founded) {
											break;
										}
									}
									if (founded) {
										var handler = eventManager.fireEvent(item.Code, "OnValueChanged");
										handler();
									}
								}
							}
						}
						//					setTimeout(function(){
						//						for(var i = 0 ; i < codes.length; i ++){
						//							var handler = eventManager.fireEvent(codes[i], "OnValueChanged");
						//							handler();
						//						}
						//					},0)

					}
				});
				ds.on({
					eventName: ds.Events.LOAD,
					handler: function (params) {
						var metdata = params.datasource.getMetadata();
						var fields = metdata.getFieldCodes();
						var items = widget.getItemsByFields(fields);
						var items = widget.getItems();
						if (items && items.length > 0) {
							for (var i = 0, l = items.length; i < l; i++) {
								eventManager.fireEvent(items[i].Code, "OnValueLoaded")();
							}
						}
					}
				});
			}

			var handler = scopeManager.createScopeHandler({
				handler: function (itemCode, eventCode, args) {
					var hd = eventCode == "OnKeyDown" ? keydownHandler.handleKeyDown(itemCode, eventCode) : eventManager.fireEvent(itemCode, eventCode);
					hd();
				}
			});
			widget.registerItemEventHandler(handler);
			handler = scopeManager.createScopeHandler({
				handler: function (exp) {
					var ctx = new ExpContext();
					return exp == null || exp == "" ? "" : expEngine.execute({
						expression: exp,
						context: ctx
					});
				}
			});
			widget.registerV3ExpressionHandler(handler);
		},

		formLayoutGetDropDownSource: function () {
			var _this = this;
			this.formLayout.fields.forEach(function (item) {
				if (item.type == "JGRadioGroup" || item.type === 'JGComboBox' || item.type === 'JGCheckBoxGroup' || (item.type === "JGBaseDictBox" && item.DropDownSource)) {
					if (item.DropDownSource && typeof item.DropDownSource == "string") {
						item.DropDownSource = JSON.parse(item.DropDownSource);
					}
					_this.formItemSetValueMap(_this.formLayout, _this.formLayout.widgetCode, item.Code, item.DropDownSource, item.IDColumnName, item.ColumnName);
				}
			})
		},

		var formItemSetValueMap = function (widget, widgetId, widgetCode, dropDownSource, valueField, textField) {
			var observer = new DropdownSourceObserver({
				"widgetId": widgetCode,
				"dataSource": dropDownSource,
				"valueField": valueField,
				"textField": textField,
				"handler": function (valueMap, defaultValue, descInfo) {
					var formItem = widget.getItemByCode(widgetCode);
					if (formItem.type == "JGBaseDictBox" && (!valueMap || jsonUtil.obj2json(valueMap) == "{}")) {
						//如果候选项数据源没有数据，则不处理，问题：导致赋值的数据丢失Task20200917098
						formItem.ignoreValueMap = true;
						return;
					}
					var scopeId = scopeManager.getWindowScope().getInstanceId();
					if (formItem.type == 'JGCheckBoxGroup') {
						formItem.setItems();
					}
					formItem.setDefaultVal ? formItem.setDefaultVal(defaultValue) : formItem.getDefaultVal(defaultValue);
					formItem.setValueMap(valueMap);
					if (formItem.type == "JGBaseDictBox") {
						formItem._valueMap = valueMap;
						formItem.setDefaultVal(defaultValue);
						formItem.setDescInfo(descInfo);
					}
					scopeManager.createScopeHandler({
						scopeId: scopeId,
						handler: function () {
							var ds = dsManager.lookup({
								datasourceName: formItem.SourceTableName
							});
							var IDColumnName = formItem.IDColumnName;
							//        				if(ds.getCurrentRecord()){
							//场景：新增实体记录后，实体记录还未同步到控件，就设置了控件的数据源，导致后续数据同步无法匹配到实体，会新增一条记录
							if (formItem.form.valuesManager && formItem.form.valuesManager.getDataSource().getCacheData().length > 0 && ds.getCurrentRecord()) {
								var value = ds.getCurrentRecord().get(IDColumnName);
								if (formItem.valueMap[value]) {
									formItem.setValue(value);
								} else if (formItem.defaultValue && formItem.valueMap[formItem.defaultValue]) {
									formItem.setValue(formItem.defaultValue);
								} else {
									formItem.setValue();
								}
								if (formItem.changed) {
									formItem.changed();
								}
							}
						}
					})();
				}
			});
		}

	_getvalue = function (prop, datasourceName, widget, widgetCode, item, recordValue, title) {
		if (item.StartColumnName && item.EndColumnName) {
			var titleValue = "";
			//				var title = item.title;
			var code = item.StartColumnName;
			//				var recordData = datasourceName.datasource.getCurrentRecord().__recordData__;
			var _startValue = recordValue[item.StartColumnName],
				_endValue = recordValue[item.EndColumnName];

			var hasStartValue = (_startValue && _startValue != "") || _startValue === 0;
			var hasEndValue = (_endValue && _endValue != "") || _endValue === 0;
			if (item.type == "JGPeriodRange" || item.type == "JGDateRangePicker") {
				//					if(item.type == "JGPeriodRange"){
				var startDate, endDate;
				if (item.startDate) {
					startDate = item.startDate;
				} else if (_startValue) {
					startDate = isc.SDateUtil.split(_startValue, item._patterns[item.sdatetype])
				}
				var startValue = isc.SDateUtil.format(startDate, item.displayFormat);

				if (item.endDate) {
					endDate = item.endDate;
				} else if (_endValue) {
					endDate = isc.SDateUtil.split(_endValue, item._patterns[item.sdatetype])
				}
				var endValue = isc.SDateUtil.format(endDate, item.displayFormat);

				//					}else if(item.type == "JGDateRangePicker"){
				//						startValue = _startValue;
				//						endValue = _endValue;
				//					}
				if (hasStartValue && hasEndValue) {
					titleValue = startValue + " " + widget._$toTitle + " " + endValue;
				} else if (!hasStartValue && hasEndValue) {
					titleValue = endValue + widget._$beforeTitle;
				} else if (hasStartValue && !hasEndValue) {
					titleValue = startValue + widget._$afterTitle;
				}
			} else if (item.type == "JGFloatRangeBox") {
				if (hasStartValue && hasEndValue) {
					titleValue = _startValue + " ~ " + _endValue;
				} else if (!hasStartValue && hasEndValue) {
					titleValue = "" + widget._$lessThanTitle + _endValue;
				} else if (hasStartValue && !hasEndValue) {
					titleValue = " " + widget._$moreThanTitle + _startValue;
				}
			}
		} else {
			var code = prop;
			//				var value = datasourceName.resultSet.datas[0].changedData[prop];
			var value = recordValue[prop];
			var titleValue = getTitleValue(value, widget, code);
		}

		var selectTile = getTileByCode(widget, code)
		if (selectTile) {
			if (!titleValue && titleValue !== 0) {
				widget._Canvas.removeTile(selectTile);
				if (widget._Canvas.tiles.length == 1 && widget._Canvas.tiles[0].type == 'removeLabel') {
					widget._Canvas.removeTile(widget._Canvas.tiles[0]);
					widget.selectTitle.setContents(widget._$conditionSelectTitle);
				} else if (widget._Canvas.tiles.length == 0 && widget.titleLayout.members.contains(widget.removeLabel)) {
					widget.titleLayout.removeMember(widget.removeLabel);
					widget.selectTitle.setContents(widget._$conditionSelectTitle);
				}
				return;
			}
			//			var selectValueHtml = '<div class = "select-wrapper"><span class = "select-title">'+title+'：</span><span class = "select-value" data-from = "'+code+'" title = "'+titleValue+'">'+titleValue+'</span></div>';
			var selectValueHtml = widget._genSelectValueHtml(title, code, titleValue);
			selectTile.setContents(selectValueHtml);
		} else {
			_getSelectValue(title, titleValue, widget, widgetCode, code);
		}

	}
	var getTitleValue = function (value, widget, code, recordValue) {
		var titleValue = "";
		if (typeof (value) == "string") {
			titleValue = value.split(',').join('、');
		} else if (typeof (value) == 'boolean') {
			titleValue = value === true ? widget._$booleanTitle : null;
		} else {
			titleValue = value;
		}
		for (var i = 0; i < widget.formLayout.items.length; i++) {
			if (widget.formLayout.items[i].ColumnName == code && widget.formLayout.items[i].type == 'JGPeriod') {
				titleValue = widget.formLayout.items[i].mapValueToDisplay(value);
				break;
			}
		}
		return titleValue;
	}
	var getTileByCode = function (widget, code) {
		for (var i = 0; i < widget._Canvas.tiles.length; i++) {
			if (widget._Canvas.tiles[i].valueFrom === code) {
				return widget._Canvas.tiles[i];
			}
		}
		return null;
	}
	//删除某项
	var _deleteFunc = function (widget, widgetId) {
		var callback = scopeManager.createScopeHandler({
			handler: function (code) {
				var removeTile = true;
				var datasource = datasourceManager.lookup({
					"datasourceName": widget._tableName
				});
				var currentRecord = datasource.getCurrentRecord();
				if (currentRecord) {
					var fields = widget.fields;
					for (var j = 0; j < fields.length; j++) {
						if (code === fields[j].ColumnName || code === fields[j].StartColumnName || code === fields[j].EndColumnName) {
							var defaultValue = getDefaultValue(widget, widgetId, fields[j]);

							if (code === fields[j].ColumnName) {
								var value;
								if (defaultValue) {
									if (typeof defaultValue == "string") {
										value = defaultValue != "" ? defaultValue : null;
									} else if (typeof defaultValue == "object") {
										value = defaultValue[fields[j].ColumnName] ? defaultValue[fields[j].ColumnName] : null;
									}
								} else {
									value = null;
								}
								if (value != null) {
									removeTile = false;
								}
								currentRecord.set(fields[j].ColumnName, value);
							}
							if (code === fields[j].StartColumnName) {
								currentRecord.set(fields[j].StartColumnName, null);
								currentRecord.set(fields[j].EndColumnName, null);
							}
							if (fields[j].IDColumnName) {
								var idValue;
								if (defaultValue && typeof defaultValue == "object") {
									idValue = defaultValue[fields[j].IDColumnName] ? defaultValue[fields[j].IDColumnName] : null;
								} else {
									idValue = null;
								}
								if (idValue != null) {
									removeTile = false;
								}
								currentRecord.set(fields[j].IDColumnName, idValue);
							}
							datasource.updateRecords({
								records: [currentRecord]
							});
							datasource.clearRemoveDatas();
						}
					}
				}
				if (widget.TriggerType != 'ConditionValueChanged') {
					eventManager.fireEvent(widgetId, "OnConditionChanged");
				}
				return removeTile;
			}
		});
		widget._deleteFunc = callback;
	}

	var getDefaultValue = function (widget, widgetId, field) {
		var widgetCode = field.Code;
		var datasourceFieldCode = field.IDColumnName || field.ColumnName;
		var defaultValue = widgetAction.executeWidgetAction(widgetCode, "getDefaultValue", datasourceFieldCode);
		return defaultValue;
	}

	var getItemByCode = function (widget, code) {
		for (var i = 0; i < widget.fields.length; i++) {
			var field = widget.fields[i];
			if (field.ColumnName == code || field.IDColumnName == code || field.StartColumnName == code || field.EndColumnName == code) {
				return field;
			}
		}
		return null;
	}

	//清除所有
	var _removeAllFunc = function (widget, widgetId) {
		var callback = scopeManager.createScopeHandler({
			handler: function () {
				var hasDefaultValue = false;
				var datasource = datasourceManager.lookup({
					"datasourceName": widget._tableName
				});
				var currentRecord = datasource.getCurrentRecord();
				if (currentRecord) {
					var fields = currentRecord.metadata.fields;
					for (var j = 0; j < fields.length; j++) {
						if (fields[j].code != 'id') {
							var item = getItemByCode(widget, fields[j].code);
							if (item) {
								var defaultValue = null;
								if (item.type != "JGLocateBox") { //查询面板内嵌的搜素框不能配置默认值，暂不取默认值
									defaultValue = getDefaultValue(widget, widgetId, item);
								}
								if (defaultValue && defaultValue[fields[j].code]) {
									hasDefaultValue = true;
									currentRecord.set(fields[j].code, defaultValue[fields[j].code]);
								} else {
									currentRecord.set(fields[j].code, null);
								}
							}
						}
					}
					datasource.updateRecords({
						records: [currentRecord]
					});
					datasource.clearRemoveDatas();
				}
				//屏蔽删除逻辑，原因：查询面板子控件配置值改变事件-给自己赋值，当点击清空查询时，值改变事件比查询面板监听的clear事件触发早，如果删除记录，会导致值改变事件赋值不成功Task20210708138
				//				if(!hasDefaultValue){
				//					resetDsRecord(widgetId,widget,true);
				//				}

			}
		});

		widget.removeAllFunc = callback;
	}
	//查询
	var searchFunc = function (widget, widgetId) {
		var callback = scopeManager.createScopeHandler({
			handler: function () {
				var datasource = datasourceManager.lookup({
					"datasourceName": widget._tableName
				});
				var currentRecord = datasource.getCurrentRecord();
				if (currentRecord) {
					var fields = currentRecord.metadata.fields;
					var selectValue = [];
					if ($(widget.$q3).find('.select-wrapper')) {
						$(widget.$q3).find('.select-wrapper').remove();
					}
					for (var i = 0; i < fields.length; i++) {
						if (widget._columnNames.indexOf(fields.code) != -1) {
							var title = fields[i].name;
							var value = currentRecord.get(fields[i].code);
							if (value && value != '' && fields[i].code != 'id') {
								_getSelectValue(title, value, widget, widgetId, fields[i].code);
							}
						}
					}
				}
			}
		});
		var eventFire = eventManager.fireEvent(widgetId, "OnConditionChanged");
		widget.searchFunc = {
			getValue: callback,
			fireEvent: eventFire
		};
	}

	//已选条件?
	var _getSelectValue = function (SimpleChineseTitle, value, widget, widgetId, code) {
		//var selectValueHtml = '<div class = "select-wrapper"><span class = "select-title">'+SimpleChineseTitle+'：</span><span class = "select-value" data-from = "'+code+'" title = "'+value+'">'+value+'</span></div>';
		var selectValueHtml = widget._genSelectValueHtml(SimpleChineseTitle, code, value);
		if ((value && value != "") || value === 0) {
			_removeAllFunc(widget, widgetId);
			_deleteFunc(widget, widgetId);
			widget.createSelectLabel(selectValueHtml, code, widget._deleteFunc, widget.removeAllFunc);
		}
	}

	exports.getValue = function () {

	}


	exports.searchFunc = searchFunc;
	exports.initEvent = initEvent;

	exports.showHighlight = function (widgetCode) {
		var widget = widgetContext.get(widgetCode, "widgetObj");
		widget.showHighlight();
	}

	exports.hideHighlight = function (widgetCode) {
		var widget = widgetContext.get(widgetCode, "widgetObj");
		widget.hideHighlight();
	}

	exports.showItemHighlight = function (widgetCode, itemCode) {
		var widget = widgetContext.get(widgetCode, "widgetObj");
		if (itemCode.indexOf("JGLocateBox_quickSearch") != -1) {
			widget._locateBoxCanvas && widget._locateBoxCanvas.showHighlight();
		} else {
			widget.formLayout.showItemHighlight(itemCode);
		}
	}

	exports.hideItemHighlight = function (widgetCode, itemCode) {
		var widget = widgetContext.get(widgetCode, "widgetObj");
		if (itemCode.indexOf("JGLocateBox_quickSearch") != -1) {
			widget._locateBoxCanvas && widget._locateBoxCanvas.hideHighlight();
		} else {
			widget.formLayout.hideItemHighlight(itemCode);
		}

	}
});
isc.addGlobal("JGQueryConditionPanel", isc.JGQueryConditionPanel);
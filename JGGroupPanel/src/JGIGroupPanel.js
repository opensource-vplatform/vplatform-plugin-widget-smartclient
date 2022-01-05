isc.ClassFactory.defineInterface("JGIGroupPanel");

isc.JGIGroupPanel.addInterfaceProperties({
	/**
	 * 分组标题
	 */
	GroupTitle: null,

	/**
	 * 开发系统原始宽高值
	 */
	_orginalRect: null,

	paddingAsLayoutMargin: true

});

isc.JGIGroupPanel.addInterfaceMethods({

	adaptedProperty: function () {
		//高度空间自适应，上边距应该为0
		/*if(this.MultiHeight=='space'){
			this.Top = 0;
		}
		//宽度空间自适应，左边距应该为0
		if(this.MultiWidth == "space"){
			this.Left = 0;
		}*/
	},

	/**
	 * 添加v3平台子控件
	 */
	addV3Child: function (child) {
		this.addMember(child);
	},
	//初始化控件
	initGroupPanel: function () {
		var _membersMargin = 8;
		var _layoutMargin = 8;
		if (window.v3PlatformSCSkin) {
			if (window.v3PlatformSCSkin.layoutMemberMagin) {
				_membersMargin = window.v3PlatformSCSkin.layoutMemberMagin;
			}
			if (window.v3PlatformSCSkin.layoutPadding) {
				_layoutMargin = window.v3PlatformSCSkin.layoutPadding
			}
		}
		this.membersMargin = _membersMargin;
		this.layoutMargin = _layoutMargin;
		this.defaultWidth = 5;
		this.defaultHeight = 5;
		this.autoDraw = false;
		this.canFocus = true;
		if (this.GroupTitle != null && this.GroupTitle != "") {
			this.isGroup = true;
			this.groupTitle = this.GroupTitle;
		} else {
			this.layoutMargin = 0;
		}
		this.height = this.getProcessedHeight();
		this.width = this.getProcessedWidth();
		if (this.Dock == "Fill") { //如果铺满
			this.overflow = 'auto';
		} else if (this.Dock == "None") {
			this.left = this.Left;
			this.top = this.Top;
		}
	},

	getActiveChildWidgets: function () {
		if (this.getVisible && !this.getVisible() || this.isVisible && !this.isVisible()) { //当前控件不显示，直接返回null
			return null;
		}
		var result = [this.code];
		var relationWidgets = this.getChildrenHandler(this.code, false);
		if (relationWidgets) {
			for (var i = 0, len = relationWidgets.length; i < len; i++) {
				var childWidgetCode = relationWidgets[i];
				var childWidget = widgetContext.get(childWidgetCode, "widgetObj");
				if (!childWidget.getActiveChildWidgets) {
					if (childWidget.getVisible && childWidget.getVisible() || childWidget.isVisible && childWidget.isVisible()) { //子控件显示
						result.push(childWidget.code);
					}
					continue;
				}
				var childWidgets = childWidget.getActiveChildWidgets();
				if (null != childWidgets) {
					result = result.concat(childWidgets);
				}
			}
		}
		return result;
	},
	getGroupTitle: function () {
		var groupTitle = this.GroupTitle;
		return !groupTitle ? "" : groupTitle;
	},
	buildSectionStackItem: function () {
		var groupTitle = this.getGroupTitle();
		this.groupTitle = this.GroupTitle = "";
		return {
			title: groupTitle,
			expanded: this.DefaultExpand == "False" ? false : true,
			items: [this]
		};
	},
	isAssignLayout: function () { //是否指定布局
		var groupTitle = this.getGroupTitle();
		if ("" != groupTitle) {
			if (this.Dock == "Top") { //自己垂直
				return true;
			} else {
				var parent = this.getParentHandler(this.widgetId);
				if (parent) {
					var type = widgetContext.get(parent, "type");
					var contentAlignment = widgetContext.get(parent, "ContentAlignment");
					if (type == "JGGroupPanel" && contentAlignment == "Vertical") { //处在垂直排列
						return true;
					}
				}
			}
		}
		return false;
	},
	inVLayout: function () { //是否指定布局
		var parent = this.getParentHandler(this.widgetId);
		if (parent) {
			var type = widgetContext.get(parent, "type");
			var contentAlignment = widgetContext.get(parent, "ContentAlignment");
			if (type == "JGGroupPanel" && contentAlignment == "Vertical") { //处在垂直排列
				return true;
			}
		}
		return false;
	},
	setEnabled: function (enabled) {
		var childrenWidgets = this.members.concat(this.layoutChildWidgets());
		for (var i = 0; i < childrenWidgets.length; i++) {
			if (childrenWidgets[i].type) {
				childrenWidgets[i].parentDisabled(!enabled);
			}
		}
	},
	parentReadOnly: function (readOnly, canEditReadOnly) {
		var childIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
		if (childIds && childIds.length > 0) {
			for (var i = 0; i < childIds.length; i++) {
				var childId = childIds[i];
				var child = isc.JGWidgetManager.getWidget(isc.WidgetUtils.genWidgetRefId(this.scopeId, childId))
				if (child && child.type && child.parentReadOnly) {
					child.parentReadOnly(readOnly, canEditReadOnly);
				}
			}
		}
	},
	_addHighlightStyle: function (obj, attrName, highlightName, cb) {
		var styleName = obj[attrName];
		if (!styleName || styleName.indexOf(' ' + highlightName) == -1) {
			styleName = styleName ? styleName + ' ' + highlightName : highlightName;
			cb.call(obj, styleName)
		}
	},
	_removeHighlightStyle: function (obj, attrName, highlightName, cb) {
		var styleName = obj[attrName];
		if (styleName && styleName.indexOf(highlightName) != -1) {
			styleName = styleName.replace(' ' + highlightName, '');
			cb.call(obj, styleName);
		}
	},
	showHighlight: function () {
		this._addHighlightStyle(this, 'styleName', 'v3FormComponentHighlight', function (name) {
			this.setStyleName(name);
		});
	},

	hideHighlight: function () {
		this._removeHighlightStyle(this, 'styleName', 'v3FormComponentHighlight', function (name) {
			this.setStyleName(name);
		});
	},

	showItemHighlight: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		if (item) {
			var redraw = false;
			this._addHighlightStyle(item, 'titleStyle', 'v3FormTitleComponentHighlight', function (name) {
				this.titleStyle = name;
				redraw = true;
			});
			this._addHighlightStyle(item, 'cellStyle', 'v3FormCellComponentHighlight', function (name) {
				this.cellStyle = name;
				redraw = true;
			});
			if (redraw) {
				this.redraw();
			}
		}
	},

	hideItemHighlight: function (itemCode) {
		var item = this.getItemByCode(itemCode);
		if (item) {
			var redraw = false;
			this._removeHighlightStyle(item, 'titleStyle', 'v3FormTitleComponentHighlight', function (name) {
				this.titleStyle = name;
				redraw = true;
			});
			this._removeHighlightStyle(item, 'cellStyle', 'v3FormCellComponentHighlight', function (name) {
				this.cellStyle = name;
				redraw = true;
			});
			if (redraw) {
				this.redraw();
			}
		}
	},
	getItemByCode: function (code) {
		var childrens = this.members.concat(this.layoutChildWidgets());
		var childrenWidgets = this.getChildWidgets(childrens);
		for (var i = 0; i < childrenWidgets.length; i++) {
			if (childrenWidgets[i].Code == code) {
				return childrenWidgets[i];
			}
		}
	},
	getChildWidgets: function (widgets) {
		var obj = {};
		widgets = widgets.reduce(function (item, next) {
			obj[next.Code] ? '' : obj[next.Code] = true && item.push(next);
			return item;
		}, []);
		return widgets;
	},
	validateWidget: function () {
		if (this.Visible === false) {
			return true;
		}
		var valid = true;
		var scopeId = this.scopeId;
		var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
		var catalog = {};
		this._forEach(childrenIds, function (childId, index) {
			var childRefId = isc.WidgetUtils.genWidgetRefId(scopeId, childId);
			var child = isc.JGWidgetManager.getWidget(childRefId);
			if (child.validateWidget && !child.validateWidget())
				valid = false;
		});
		return valid;
	},
	setVisible: function (visible) {
		this.Visible = visible;
		var funName = visible ? "show" : "hide";
		var info = this.getSectionStackInfo();
		if (info) {
			if (typeof (info[funName]) == "function") {
				info[funName]();
			}
		} else if (typeof (this[funName]) == "function") {
			this[funName]();
		}
	},
	getVisible: function () {
		return false != this.Visible;
	},
	/**
	 * @params Object info
	 * {
	 * 	show : Function//显示
	 * 	hide : Function//隐藏
	 * }
	 * */
	setSectionStackInfo: function (info) { //设置分组信息,仅是分组标题时才有，用于设置控件隐藏
		this._sectionStackInfo = info;
	},
	getSectionStackInfo: function () { //可能为null，调用者需判断
		return this._sectionStackInfo;
	},
	/**
	 * 处理子控件是否显示大小工具条
	 */
	handleChildrenResize: function () {
		if (this.ChildrenResizable) {
			if (this.childrenWidgets && this.childrenWidgets.length > 1) {
				for (var i = 0, l = this.childrenWidgets.length - 1; i < l; i++) {
					var child = this.childrenWidgets[i];
					if (this.childShouldShowResizeBar(child)) {
						child.showResizeBar = true;
					} else {
						var preChild = this.childrenWidgets[i - 1];
						if (preChild) {
							try {
								delete preChild.showResizeBar;
							} catch (err) {}
						}
					}
				}
			}
		}
	}
});
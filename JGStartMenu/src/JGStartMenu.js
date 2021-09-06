//为了区分下拉菜单跟开始菜单的样式，这里增加一个开始菜单（快捷菜单）的菜单类
isc.ClassFactory.defineClass("ShortcutMenu", "Menu");
isc.ClassFactory.mixInInterface("ShortcutMenu", "IWindowAop");

isc.ShortcutMenu.addProperties({
	//在源码的基础上加一个“cellHeight”属性，设置行高的，子菜单也要继承设置此行高
	submenuInheritanceMask: [
		// Allow the developer to specify some custom class for submenus (advanced!)
		"submenuConstructor",
		"menuConstructor",
		"_treeData", // Tree data model for tree menus
		"className",
		"submenuDelay",
		"submenuOffset",
		"defaultWidth",
		"backgroundColor",
		"tableStyle",
		"showRollOver",
		"baseStyle",
		"emptyMessage",
		"canDrag",
		"canAcceptDrop",
		"canReorderRecords",
		"useKeys",
		"showKeys",
		"showIcons",
		"showSubmenus",
		"submenuDirection",
		"cellPadding",
		"iconWidth", "iconHeight",
		"autoSetDynamicItems",
		"skinImgDir",
		"submenuImage", "submenuDisabledImage", "checkmarkImage", "checkmarkDisabledImage",
		"bodyDefaults",
		// actual behaviors
		"itemClick",
		"canSelectParentItems",
		// updated on the fly
		"childrenProperty",
		// A freeform object - can be used for custom overrides that need to percolate down
		// the submenu chain.
		"inheritedProperties",
		"cellHeight"
	]
});

isc.ShortcutMenu.addMethods({
	initWidget: function () {
		this.Super("initWidget", arguments);
		for (var i = 0; i < this.fields.length; i++) {
			if (this.fields[i].name == "title") {
				this.fields[i].baseStyle = this.baseStyle + "Title";
			} else if (this.fields[i].name == "icon") {
				this.fields[i].baseStyle = this.baseStyle + "Icon";
			} else if (this.fields[i].name == "submenu") {
				this.fields[i].baseStyle = this.baseStyle + "Submenu";
			}
		}
	}
});


isc.ClassFactory.defineClass("JGStartMenu", "JGMenuWidget");
isc.ClassFactory.mixInInterface("JGStartMenu", "JGStyleHelper");


isc.JGStartMenu.addProperties({
	_menuButton: null, //开始菜单按钮
	_menu: null, //菜单项
	Name: '',
	Top: 10,
	Left: 10,
	Width: 20,
	Height: 48,
	Visible: true,
	Enabled: true,
	TabIndex: 1,
	ImageObj: null, //背景图片
	BackColor: null, //背景色
	SimpleChineseTitle: '',
	ForeColor: null,
	IsShowMenuArrow: true,
	//菜单项事件
	listener: ["menuClick"],
	WidgetStyle: "JGStartMenu",
	className: "JGStartMenuNormal"
});


isc.JGStartMenu.addMethods({
	//自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数
	_initWidget: function () {
		this.initBindDataAndUIEvent();

		// JGStartMenu init
		this.ImageObj = this.ImageValue;
		// END

		var _this = this;
		this._menu = isc.ShortcutMenu.create({
			id: "menu_" + this.id,
			//showShadow: true,
			//shadowDepth: 5,
			cellHeight: 38, //行高
			tableStyle: this.WidgetStyle + "Table",
			baseStyle: this.WidgetStyle,
			canSelectParentItems: true,
			menuConstructor: "ShortcutMenu",
			itemClick: this._referFunc(this, "_fireItemClickEvent"),
			data: [],
			showKeys: false,
			initWidget: function () {
				//修改自己样式，保留menu原来样式
				this.Super("initWidget", arguments);
				for (var i = 0; i < this.fields.length; i++) {
					if (this.fields[i].name == "title") {
						this.fields[i].baseStyle = this.baseStyle + "Title";
					} else if (this.fields[i].name == "icon") {
						this.fields[i].baseStyle = this.baseStyle + "Icon";
					} else if (this.fields[i].name == "submenu") {
						this.fields[i].baseStyle = this.baseStyle + "Submenu";
					}
				}
			},
			getSubmenuImage: function () {
				// 不显示子节点图标
				return "";
			},
			moveBy: function () {
				if (arguments.length > 0 && arguments[0]) {
					arguments[0] = arguments[0] - _this._menuButton.left
					arguments[1] = arguments[1] - 1
				}
				return this.Super("moveBy", arguments);
			},
			//增加子菜单项对系统图标的处理
			getIcon: function (iconInfoObj) {
				if (iconInfoObj.source == 'icon') {
					iconWidth = iconInfoObj.iconWidth || this.iconWidth;
					iconHeight = iconInfoObj.iconHeight || this.iconHeight;
					// 处理 bs下图标显示不完整, 添加 line-height 限制
					var iconDiv = '<div style="width:' + iconWidth + 'px;height:' + iconHeight + 'px;line-height:' + iconHeight + 'px;" class="' + iconInfoObj.icon + '"></div>';
					return iconDiv;
				} else {
					return this.Super("getIcon", arguments);
				}
			}
		});
		//显示普通的图标img ,设置src属性
		var src = this.ImageObj ? this.ImageObj : this._blankSrc;
		var visibleType = "visible";
		//按照比例获取图标图片的宽度和高度
		var imgWidth = this.FontStyleSize;
		if (src == undefined || src == "" || src == null) {
			visibleType = "hidden";
			src = "";
		}
		if (imgWidth == "") {
			imgWidth = "16";
		}
		imgWidth = parseInt(imgWidth);
		var innerWidth = imgWidth;
		var innerHeight = this.Height;
		var sizeWidth = imgWidth;
		var sizeHeight = imgWidth;
		this._img = this.createAutoChild("img", {
			//width: this._imgSize,
			width: innerWidth,
			height: innerHeight,
			//imageHeight: this._imgSize,
			//imageWidth: this._imgSize,
			imageWidth: imgWidth,
			cursor: this.cursor,
			statelessImage: true,
			imageType: isc.Img.CENTER,
			overflow: isc.Canvas.HIDDEN,
			src: src,
			visibility: visibleType
		}, isc.Img);
		if (src != "") {
			var filePath = window.location.origin + "/" + src;
			var imgInstance = this._img;
			var image = new Image();
			image.src = filePath;
			image.onload = function () {
				var realWidth = image.width;
				var realHeight = image.height;
				if (realWidth > realHeight) {
					sizeHeight = realHeight * imgWidth / realWidth;
				} else {
					sizeWidth = realWidth * imgWidth / realHeight;
				}
				imgInstance.imageHeight = sizeHeight;
				imgInstance.imageWidth = sizeWidth;
				imgInstance.markForRedraw();
			}
		}
		//增加开始菜单控件对系统图标的处理
		this._icon = isc.Canvas.create({
			width: imgWidth,
			height: innerHeight,
			visibility: "hidden"
		});
		//控件名
		this._menuButton = isc.MenuButton.create({
			id: this.id,
			name: this.Name,
			align: "left",
			valign: "center",
			title: this.genTitleContent(this.SimpleChineseTitle),
			simpleChineseTitle: this.SimpleChineseTitle,
			width: this.Width,// - 30,
			height: this.Height,
			enabled: this.Enabled,
			tabIndex: this.TabIndex,
			iconWidth: 4,
			iconHeight: 4,
			showMenuButtonImage: this.IsShowMenuArrow,
			baseStyle: this.WidgetStyle + "MenuButton",
			getIconSpacing: function () {
				var paddingSize = this.Super("getIconSpacing", arguments);
				return "vertical-align:bottom;width:1";
			},
			setSimpleChineseTitle: function (_title) {
				this.simpleChineseTitle = _title;
				this.setTitle("<div style ='" + this.cssText + "'>" + _title + "</div>")
				this.redraw();
			},
			getSimpleChineseTitle: function () {
				return this.simpleChineseTitle;
			},
			menu: this._menu //菜单项
		});
		this._HLayout = isc.HLayout.create({
			height: this.Height,
			width: this.Width,
			align: "center",
			hoverVAlign: "center",
			membersMargin: 6,
			layoutLeftMargin: 5,
			contents: "",
			className: this.WidgetStyle + "Button",
			backgroundColor: this.BackColor + ";" + this.genFontCssText(this.FontStyle, this.ForeColor),
			members: [this._img, this._icon, this._menuButton],
			setHandleDisabled: function (disable) {
				this.Super("setHandleDisabled", disable);
				if (disable)
					this.setStyleName(_this.WidgetStyle + "ButtonDisabled")
				else {
					this.setStyleName(_this.WidgetStyle + "Button")
				}
			}
		});
		//必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		this.addChild(this._HLayout);
	},

	initBindDataAndUIEvent: function () {
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceLoadEventHandler(this, null, function (params) {
			if(_this.MenuDataSourceType != "Control")
				_this.setMenus(_this);
		});

		// 一个变成dataload
		// 一个变成afterInit
	},

	_afterInitWidget: function () {
		var _this = this;
		this.on("menuClick", function () {
			//var handler = eventManager.fireDynamicWidgetEvent("OnClick");
			var handler = _this._eventCaller("OnClick");
			return function (item) {
				// 处理节点点击后无法消除根节点over样式
				if (this._menu && this._menu.children && this._menu.children[0] && this._menu.children[0].focusOnHide) {
					this._menu.children[0].focusOnHide.state = "";
					this._menu.children[0].focusOnHide.stateChanged()
				}
				isc.MenuUtil.menuEvent(_this, item, handler, null, null, _this._menuAction);
			}
		}());

		this._referPartFunc();
		this.setData(this.menuDate);
	},

	/**
	 * 引用控件函数,将被包含控件的方法暴露给JGStartMenu
	 */
	_referPartFunc: function () {
		this.Super("_referPartFunc", arguments);

		/**
		 * 将MenuButton的方法暴露给JGStartMenu
		 */
		this._referFuncs(this._menuButton, ['disable', 'enable', 'setSimpleChineseTitle', 'getSimpleChineseTitle', 'setBackgroundImage', 'setBackgroundColor']);
		/**
		 * 将Item的方法暴露给JGStartMenu
		 */
		this._referFuncs(this._menu, ['setData', 'addItem', 'getItems', 'getMenuItem']);
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
		if (enable) {
			this.enable();
			this._HLayout.enable();
			this._menuButton.enable();
		} else {
			this.disable();
			this._HLayout.disable();
			this._menuButton.disable();
		}
	},

	/**
	 * 获取按钮背景色
	 * @return 按钮背景色
	 */
	getBackColor: function () {
		this._menuButton.getBackgroundColor();
	},

	/**
	 * 设置按钮背景色
	 * @param color 背景色
	 */
	setBackColor: function (color) {
		this._menuButton.setBackgroundColor(color);
	},

	/**
	 * 获取按钮前景色
	 * @return 按钮前景色
	 */
	getForeColor: function () {
		throw new Error("未实现！");
	},

	/**
	 * 设置按钮前景色
	 * @param color 按钮前景色
	 */
	setForeColor: function (color) {
		throw new Error("未实现！");
	},

	/** 查找某个元素所在的menu
	 * @param menu 整个菜单
	 * @param {String} findId 要查找的元素id
	 * @return menu 对象(subMenu也是一个menu)
	 */
	findItemBelongWhichMenu: function (menu, findId) {
		var whichMenu = null;
		var menuDatas = menu.getData();
		if (menuDatas && menuDatas.length > 0) {
			for (var i = 0, l = menuDatas.length; i < l; i++) {
				var item = menuDatas[i];
				if (item.id == findId) {
					whichMenu = menu;
					break;
				} else if (item.submenu) { //存在下级,递归
					whichMenu = this.findItemBelongWhichMenu(this._menu.getSubmenu(item), findId);
					if (whichMenu != null)
						break;
				}
			}
		}
		return whichMenu;
	},

	removeItem: function (name) {
		var belongWhichMenu = this.findItemBelongWhichMenu(this._menu, name);
		if (belongWhichMenu) {
			var menuItem = belongWhichMenu.getMenuItem(name);
			belongWhichMenu.removeItem(menuItem);
		}
	},

	removeAllItem: function () {
		/*
		var items = this._menu.getItems();
		if(items && items.length>0){
			for(var i =0 ,l = items.length;i < l;i++){
				this._menu.removeItem(items[i]);
			}
		}*/
		this._menu.setItems([]);
	},

	showItem: function (name) {
		//TODO，这样不行，再想想其它
		//var menuItem = this._menu.getMenuItem(name);
		//this._menu.showMember(menuItem);
		//menuItem.show();
		//this._menu.show();
		//暂用可用效果实现
		this.enabledItem(name);
	},

	hideItem: function (name) {
		//this._menu.getMenuItem(name).hide();
		//var menuItem = this._menu.getMenuItem(name);
		//this._menu.hideMember(menuItem);
		//暂用不可用效果实现
		this.disabledItem(name);
	},

	enabledItem: function (name) {
		//this._menu.setItemEnabled(name,true);
		//Menu原生的setItemEnabled方法只是找第一层的，不合适用,重写
		var belongWhichMenu = this.findItemBelongWhichMenu(this._menu, name);
		if (belongWhichMenu) {
			this._enabledItem(belongWhichMenu, name);
			return true;
		}
		return false;
	},

	disabledItem: function (name) {
		//this._menu.setItemEnabled(name,false);
		//Menu原生的setItemEnabled方法只是找第一层的，不合适用,重写
		var belongWhichMenu = this.findItemBelongWhichMenu(this._menu, name);
		if (belongWhichMenu) {
			this._disabledItem(belongWhichMenu, name);
			return true;
		}
		return false;
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		this._HLayout.setWidth("100%");
		this._menuButton.setWidth("100%");
	},

	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		this._HLayout.setHeight("100%");
		this._menuButton.setHeight("100%");
	},

	//设置控件的index要以组件的index为前缀
	setIndexPreJoinComponentIndex: function (componentIndex) {
		var orginalIndex = this._menuButton.getTabIndex();
		this._menuButton.setTabIndex(parseInt(componentIndex + orginalIndex));
	},

	destroy: function () {
		this._menu = null;
		this._menuButton = null;
		this.Super("destroy", arguments);
	},

	setDataToMenu: function (widget, items, itemsList) {
		widget.setData(items);
		widget.menuTable = itemsList;
	},

	updatePropertys: function (params) {
		var propertyMap = params.propertys;
		var widget = params.widget;
		var propertys = propertyMap.Properties;
		if (propertys) {
			for (var property in propertys) {
				if (propertys.hasOwnProperty(property)) {
					var val = propertys[property];
					if ((property == "MultiWidth" || property == "MultiHeight") && typeof (val) == "number") {
						widget[key] = val + "";
					} else if (property == "RowWidthMode" && val == "PercentWidth") {
						for (var i = 0, len = widget.fields.length; i < len; i++) {
							var field = widget.fields[i];
							var width = Math.floor((parseInt(field.width) / parseInt(widget.Width) * 10000) / 100) + "%";
							field.width = width;
						}
					} else {
						widget[property] = propertys[property];
					}
				}
			}
		}
	},

	setMenus: function (widget) {
		var datasource = isc.WidgetDatasource.getBindDatasource(widget);
		if (datasource) {
			var items = datasource.getAllRecords();
			//重新设置一级菜单的图标和标题
			var item;
			for (var i = 0; i < items.length; i++) {
				if (items[i].pid == "" || items[i].pid == null) {
					item = items[i];
					break;
				}
			}
			//var item = items[0];
			var itemTitle = item["menuItemName"];
			//重设标题
			if (itemTitle != '') {
				widget._menuButton.setSimpleChineseTitle(itemTitle);
			}
			//重设图标
			var itemImg = new Object();
			itemImg.iconSrc = "";
			itemImg.iconType = "";
			if (item["icourl"]) {
				var imgJson = isc.JSON.decode(item["icourl"]);
				if (imgJson) {
					for (var i = 0, num = imgJson.length; i < num; i++) {
						var imgobj = imgJson[i];
						if (imgobj && imgobj["source"] == "db") {
							itemImgSrc = "module-operation!executeOperation?operation=FileDown&token=%7B%22data%22%3A%7B%22dataId%22%3A%22" + imgobj.img + "%22%2C%22ImageObj%22%3A%22" + imgobj.img + "%22%7D%7D";
							itemImg.iconSrc = itemImgSrc;
							itemImg.iconType = "img";
						} else if (imgobj && imgobj["source"] == "url") {
							itemImgSrc = imgobj.img;
							itemImg.iconSrc = itemImgSrc;
							itemImg.iconType = "img";
						} else if (imgobj && imgobj["source"] == "res") {
							itemImgSrc = "/itop/resources/" + imgobj.img;
							itemImg.iconSrc = itemImgSrc;
							itemImg.iconType = "img";
						} else if (imgobj && imgobj["source"] == "icon") {
							itemImgSrc = imgobj.img;
							itemImg.iconSrc = itemImgSrc;
							itemImg.iconType = "icon";
						}
					}

				}
			}

			if (itemImg.iconSrc != '') {
				if (itemImg.iconType == 'img') {
					widget._img.src = itemImg.iconSrc;
					widget._img.redraw();
					widget._img.show();
					widget._icon.hide();
				} else if (itemImg.iconType == 'icon') {
					widget._img.hide();
					widget._icon.show();
					var iconHeight = widget._icon.height;
					var iconFont = widget._icon.width;
					var contents = '<div style="line-height:' + iconHeight + 'px;color:#ffffff;font-size:' + iconFont + 'px" class="' + itemImg.iconSrc + '"></div>';
					widget._icon.setContents(contents);
					widget._icon.redraw();
				} else {
					widget._img.hide();
					widget._icon.hide();
				}
			} else {
				widget._img.hide();
				widget._icon.hide();
			}
			// ss 开始菜单
			var list = isc.MenuUtil.toMenuData(items, "ss");
			if (list && list[0] && list[1]) {
				widget.setDataToMenu(widget, list[0], list[1]);
			}
		}
	},

	dataLoaded: function () {
		if (this.MenuDataSourceType == "Rule") {
			isc.MenuUtil.getMenuDataByRuleSet(this, this._expHandler);
		}
	},

	initMenu: function (widget, items, itemsJson) {
		this._renderMenuItems(widget, items, itemsJson);
	},

	// 渲染菜单项，菜单项都放到第一层，作为快捷菜单来用
	initMenuAllForOneLevel: function (widget, items) {
		this._renderMenuItemsAllForOneLevel(widget, items);
		this._bindingEvent(widget, items);
	},

	// 重新刷新快捷菜单
	reLoadShortcutMenu: function (widget, shortcutTableName) {
		if (!shortcutTableName) {
			return;
		}

		var expression = 'ShortCutMenuGetData("' + shortcutTableName + '")';
		var result = this._serverExpression(expression)

		if (result && result.success == true) {
			var menuDataJson = result.data.result;
			if (menuDataJson) {
				if (menuDataJson.ShortcutMenuGetDataResult && menuDataJson.ShortcutMenuGetDataResult != null) {
					var items = menuDataJson.ShortcutMenuGetDataResult;
					this.initMenuAllForOneLevel(widget, items);
				}
			}
		}
	},

	addMenuByIds: function (widget, menuIds) {
		if (menuIds && menuIds.length > 0) {
			var param = "\"" + menuIds.join('","') + "\"";
			var expression = 'GetMenus(' + param + ')';

			var result = this._serverExpression(expression);
			if (result && result.success == true) {
				var menuDataJson = result.data.result;
				if (menuDataJson) {
					if (menuDataJson.menuDatas && menuDataJson.menuDatas != null) {
						var items = menuDataJson.menuDatas;
						var itemsJson = menuDataJson.menuDatasJson;
						this.initMenu(widget, items, itemsJson);
					}
				}
			} else {
				throw new Error("[JGStartMenuAction.addMenuByIds]获取菜单数据失败，result=" + result);
			}
		}
	},

	/**
	 * 绑定规则
	 */
	_bindingEvent: function (widget, items) {
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			var menuType = item["menuItemType"];
			if (menuType == 1) { // 业务规则方式
				var routeId = item.routeId;
				var routeStr = item.RuleRoute;
				var ruleInstanceStr = item.RuleInstance;
				this._addRouteInfo(routeId, routeStr);
				this._addRuleInstanceInfo(ruleInstanceStr);
				this._addRouteRelationInfo(item.id, routeId, "ButtonAction");
			}
		}
	},

	/**
	 * 添加路由信息
	 */
	_addRouteInfo: function (routeId, routeStr) {
		if (routeStr) {
			var route = typeof (routeStr) == "string" ? isc.JSON.decode(routeStr) : routeStr;
			var handler = typeof (route.handler) == "string" ? eval(route.handler) : route.handler;
			// TODO
			// routeManager并未定义
			routeManager.setRouteHandler(routeId, route.handler);
			// TODO
			routeManager.setTransactionInfo(routeId, route.transactionInfo);
			var outputCfg = route.outputConfig;
			if (outputCfg) {
				for (var type in outputCfg) {
					// TODO
					routeManager.setRouteOutputConfig(routeId, type, outputCfg[type]);
				}
			}
		}
	},

	_addRuleInstanceInfo: function (ruleInstanceStr) {
		if (ruleInstanceStr) {
			var ruleInstances = typeof (ruleInstanceStr) == "string" ? isc.JSON.decode(ruleInstanceStr) : ruleInstanceStr;
			if (ruleInstances && ruleInstances.length > 0) {
				for (var i = 0, len = ruleInstances.length; i < len; i++) {
					var ruleInstance = ruleInstances[i];
					// ruleConfigManager并未定义
					ruleConfigManager.addRuleConfig(ruleInstance.ruleInstId, ruleInstance);
				}
			}
		}
	},

	_addRouteRelationInfo: function (menuId, routeId, eventType) {
		// viewEvent并未定义
		// viewModel并未定义
		// TODO
		viewEvent.putRouteRelationInfo(menuId, routeId, eventType);
		// TODO
		viewModel.getSysModule().on(menuId, eventType, "widget", function () {
			// TODO
			eventUtil.fireEvent(menuId, routeId, eventType, arguments);
		});
	},

	_renderMenuItems: function (widget, items, itemsJson) {
		this._getItems(widget, items);
		if (widget) {
			itemsJson = typeof (itemsJson) == "string" ? isc.JSON.decode(itemsJson) : itemsJson;
			widget.setData(itemsJson);
		}
	},

	// 渲染菜单项，菜单项都放到第一层，作为快捷菜单来用
	_renderMenuItemsAllForOneLevel: function (widget, items) {
		var menuItems = [];
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			this._putWidgetContextProperty(item["id"], "extWidgetIdRela", this);
			this._putWidgetContextProperty(item["id"], "widgetType", "StartMenuItem");
			var node = this._genMenuItem(widget, item);
			menuItems.push(node);
		}
		if (widget) {
			widget.setData(menuItems);
		}
	},

	/**
	 * 构造菜单项
	 */
	_getItems: function (widget, items) {
		var menuItems = [];
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			this._putWidgetContextProperty(item["id"], "extWidgetIdRela", this);
			this._putWidgetContextProperty(item["id"], "widgetType", "StartMenuItem");
			var params = item["parameters"];
			var paramsJson = {};
			if (params) {
				paramsJson = typeof (params) == "string" ? jsonUtil.json2obj(params) : params;
			}
			item.parameters = paramsJson;
			var menuType = item["menuItemType"];
			if (menuType == 1) { // 业务规则方式
				var routeId = item.routeId;
				var routeStr = item.RuleRoute;
				var ruleInstanceStr = item.RuleInstance;
				this._addRouteInfo(routeId, routeStr);
				this._addRuleInstanceInfo(ruleInstanceStr);
				this._addRouteRelationInfo(item.id, routeId, "ButtonAction");
			}
			var menuType = item["menuItemType"];
			if (menuType == 0) { // 菜单类型为打开组件
				this._addNodeEvent(widget, "ButtonAction", item);
			}

		}
		return menuItems;
	},

	/**
	 * 生成菜单项对象
	 */
	_genMenuItem: function (widget, item) {
		item.name = item.id; // smartclient中菜单项用name作为key
		item.title = item["menuItemName"];
		item.icon = _getImage(item["icon"]);
		item.parentId = item["pId"];
		var params = item["parameters"];
		var paramsJson = {};
		if (params) {
			paramsJson = typeof (params) == "string" ? isc.JSON.decode(params) : params;
		}
		item.parameters = paramsJson;
		var menuType = item["menuItemType"];
		if (menuType == 0) { // 菜单类型为打开组件
			this._addNodeEvent(widget, "ButtonAction", item);
		}
		return item;
	},



	/**
	 * 生成图片路径
	 */
	_getImage: function (imageObjId) {
		return isc.FileUtil.getImageByName(imageObjId)
	},

	/**
	 * 菜单项绑定事件
	 */
	_addNodeEvent: function (widget, eventType, item) {
		var params = item.parameters;
		var nodeName = item["menuItemName"];
		var componentId = item["componentId"];
		var componentOpenWay = this.ComponentOpenWay;
		if (componentId && componentId != "") {
			var fn;
			switch (componentOpenWay) {
				case 0:
				case "NewWindow":
					fn = this.getOpenNewWindowFunc(widget, componentId, params, nodeName);
					break;
				case "SpecifiedWindow":
					fn = this.getSpecifiedWindowFunc(widget, componentId, params, nodeName);
					break;
				case "SpecifiedContainer":
					fn = this.getSpecifiedContainerFunc(widget, componentId, params, nodeName);
					break;
				default:
					fn = function () {
					};
			}
			// TODO
			// viewModel并未定义
			viewModel.getSysModule().on(item.id, eventType, "widget", fn);
		}
	},

	// 以新窗体方式打开组件
	getOpenNewWindowFunc: function (widget, componentId, params, nodeName) {
		return (function (componentId, params, nodeName) {
			function innerFunc() {
				var title = nodeName;
				var componentVariable = {};
				componentVariable["variable"] = params;
				// 标注打开方式为dialog
				componentVariable["variable"]["formulaOpenMode"] = "dialog";
				// TODO
				// viewModel并未定义
				viewModel.getCmpModule().callModuleEx(componentId, title, componentVariable, null, null, false, "_blank");
			}
			return innerFunc;
		})(componentId, params, nodeName)
	},

	/**
	 * 打开到指定窗体
	 */
	getSpecifiedWindowFunc: function (widget, componentId, params, nodeName) {
		var specifiedWindowName = widget.SpecifiedWindowName;
		return (function (componentId, specifiedWindowName, params, nodeName) {
			function innerFunc() {
				var title = nodeName;
				specifiedWindowName = specifiedWindowName == "" ? title : specifiedWindowName;
				var componentVariable = {};
				componentVariable["variable"] = params;
				// 标注打开方式为dialog
				componentVariable["variable"]["formulaOpenMode"] = "dialog";
				// TODO
				// viewModel并未定义
				viewModel.getCmpModule().callModuleEx(componentId, specifiedWindowName, componentVariable, null, null, false, specifiedWindowName);
			}
			return innerFunc;
		})(componentId, specifiedWindowName, params, nodeName);
	},

	/**
	 * 打开到指定容器
	 */
	getSpecifiedContainerFunc: function (widget, componentId, params, nodeName) {
		var destComponentContainerID = widget.ComponentContainer;
		var tabPageDisplayMode = destComponentContainerID.TabPageDisplayMode;
		return (function (componentId, destComponentContainerID, params, nodeName, tabPageDisplayMode) {
			function innerFunc() {
				var title = nodeName;
				var componentVariable = {};
				componentVariable["variable"] = params;
				// 标注打开方式为container
				componentVariable["variable"]["formulaOpenMode"] = "container";
				// 将标签页的ID传入，以提供给退出事件进行关闭
				componentVariable.variable.closeTabId = componentId;

				if (destComponentContainerID.exists(title) && tabPageDisplayMode != "Hide") {
					// 因为可能有数据更新了，要先刷新,刷新后再激活
					// TODO
					destComponentContainerID.reloadSingleTab(componentId, viewModel.getCmpModule().getModuleUrl(componentId, componentVariable), false, true);
					destComponentContainerID.active(title);
				} else {
					destComponentContainerID.add({
						"id": componentId,
						"isComponent": true,
						"title": title,
						"componentVariable": componentVariable,
						// TODO
						"url": viewModel.getCmpModule().getModuleUrl(componentId, componentVariable),
						"selected": true
					}, 0);
				}
			}
			return innerFunc;
		})(componentId, destComponentContainerID, params, nodeName, tabPageDisplayMode);
	},

	getMenuDataSourceTypeEnum: function () {
		if (this) {
			var val = this.getProperty("MenuDataSourceTypeEnum");
			if (typeof val != "undefined")
				return val
		}
		return null;
	},

	getBindMenu: function () {
		var openWay = this.BindMenu;
		if (openWay != "") {
			return openWay;
		} else {
			return null;
		}
	},

	getComponentOpenWay: function () {
		var openWay = this.ComponentOpenWay;
		if (openWay != "") {
			return openWay;
		} else {
			return null;
		}
	},

	getCurrentControlID: function () {
		return this.widgetId;
	},

	setLabelText: function (title) {
		this.setSimpleChineseTitle(title);
	},

	getLabelText: function () {
		return this.getSimpleChineseTitle();
	}
});


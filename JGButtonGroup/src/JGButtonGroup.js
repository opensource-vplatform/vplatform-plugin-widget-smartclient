/**
 * 按钮组
 * @class JGButtonGroup
 * @extends JGMenuWidget
* @extends Menu
* @extends HLayout
 * 
 */
isc.ClassFactory.defineClass("JGButtonGroup", "JGMenuWidget");
isc.ClassFactory.defineClass("JGButtonMenu", "Menu");
isc.ClassFactory.defineClass("InlinedMenu", "HLayout");
isc.ClassFactory.mixInInterface("JGButtonGroup", "IWindowAop");
isc.JGButtonMenu.addProperties({
	iconBodyStyleName: "btn-menu-main",
	//在源码的基础上加一个“cellHeight”属性，设置行高的，子菜单也要继承设置此行高
	submenuInheritanceMask: [
		// Allow the developer to specify some custom class for submenus (advanced!)
		"submenuConstructor",

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
		//    	        "skinImgDir",
		//    	        "submenuImage", "submenuDisabledImage", "checkmarkImage", "checkmarkDisabledImage",
		//    	        "showHiliteInCells", "bodyProperties", "getSubmenuImage",
		"bodyDefaults",
		"menuConstructor",

		// actual behaviors
		"itemClick",
		"canSelectParentItems",

		// updated on the fly
		"childrenProperty",

		// A freeform object - can be used for custom overrides that need to percolate down
		// the submenu chain.
		"inheritedProperties",
		"cellHeight",
		"placeSubmenu",
		"getIcon"
	]
});
isc.JGButtonMenu.addMethods({
	hide: function () {
		this.Super("hide", arguments);
		if (this._menuButton) {
			this._menuButton.setSelected(false);
			this._menuButton.setState(isc.StatefulCanvas.STATE_UP);
		}

	},
	show: function () {
		this.Super("show", arguments);
		if (this._menuButton) {
			this._menuButton.setSelected(true);
		}
	}
});

isc.InlinedMenu.addProperties({
	overflow: "hidden",
	canAdaptWidth: true,
	defaultLayoutAlign: "center",
	initWidget: function () {
		this.Super("initWidget", arguments);
		var menu = this.menu;
		menu._inlinedData = [];
		this.inlinedCount = menu.getTotalRows();
		this.height = this.parentElement.buttonGroupHeight;
		var menuClass = this.getButtonClassName();

		// add buttons to represent inlined menu items
		for (var i = 0; i < menu.getTotalRows(); i++) {

			var _menu = null;
			var item = menu.getRecord(i);
			menu._inlinedData.push(item);
			if (item.visible == undefined) {
				item.visible = true;
			}
			if (item.enabled == undefined) {
				item.enabled = true;
			}

			var baseStyle = this.getToolStripBaseStyle(item);
			var themeBaseStyle = baseStyle;
			if (item.Theme)
				themeBaseStyle = item.Theme + " " + themeBaseStyle;
			var hideIcon = item.submenu && this.hideSubmenuIcon(item.submenu);
			var _this = this;
			isc.JGButtonMenu.TITLE_FIELD.baseStyle = "JGButtonGroup" + "DropMenuTitleField";
			isc.JGButtonMenu.ICON_FIELD.baseStyle = "JGButtonGroup" + "DropMenuIconField";
			isc.JGButtonMenu.KEY_FIELD.baseStyle = "JGButtonGroup" + "DropMenuKeyField";
			isc.JGButtonMenu.SUBMENU_FIELD.baseStyle = "JGButtonGroup" + "DropMenuSubmenuField";
			if (item.submenu && this.getMenuItem(item.submenu).length > 0) {
				_menu = isc.JGButtonMenu.create({

					width: 1,
					showIcons: hideIcon ? false : true,
					iconBodyStyleName: "JGButtonGroup" + "MenuMain",
					showShadow: false,
					shadowDepth: 10,
					cellHeight: this.parentElement.buttonGroupHeight, //行高
					tableStyle: "JGButtonGroup" + "DropMenu",
					enabled: item.enabled == undefined ? true : item.enabled,
					getIcon: function (_1) {
						if (_1.icon) {
							return '<span style = "font-size:14px;" class="JGButtonGroupArrow v-button-group-icon ' + _1.icon + '"></span>';
						}
					},
					placeSubmenu: function (_1, _2) {
						this.Super('placeSubmenu', arguments);
						var hideIcon = _this.hideSubmenuIcon(_1.submenu);
						_2.setShowIcons(!hideIcon);
					},
					getSubmenuImage: function (_1) {
						if (!this.hasSubmenu(_1))
							return "&nbsp;"
						else
							return '<span style = "font-size:14px;" class="JGButtonGroupArrow iconfont icon-right v-button-group-icon-right"></span>';
					},
					bodyProperties: {
						showHiliteInCells: true,
						getCellStyle: function (_1, _2, _3) {
							var _updateBfClassName = this.className
							var _cellStyle = this.Super("getCellStyle", arguments);
							var _updateAfClassName = this.className;
							var _4 = this.getCellStyleIndex(_1, _2, _3);
							if (_updateAfClassName.length - 4 == _updateAfClassName.toLowerCase().lastIndexOf("over") && _updateBfClassName !== _updateAfClassName)
								_1._$over = true;
							else if (_4 == 1) {
								_1._$over = true;
							} else {
								_1._$over = false;
							}
							return _cellStyle;
						}
					},
					baseStyle: "JGButtonGroup" + "DropMenu",
					canSelectParentItems: true,
					itemClick: this._referFunc(this.parentElement, "_fireItemClickEvent"),
					menuConstructor: "JGButtonMenu",
					data: this.getMenuItem(item.submenu),
					//		                     visible:data.length > 0,
					//		                     visibility:data.length > 0 ? "inheirt" : "hidden"
					//		                     defaultHeight: 30,
					//		                     defaultWidth: 138
				});
			}

			var title;
			if (item.displayStyle == 'Image') {
				item.prompt = item.title;
				title = '<span style = "display:inline-block;margin-right:5px;font-size:12px;" class="' + item.icon + '"> </span>';
			} else if (item.displayStyle == 'Text' || ((item.displayStyle == 'ImageAndText' || !item.displayStyle) && (!item.icon || item.icon == ''))) {
				title = item.title;
			} else {
				title = '<span style = "display:inline-block;margin-right:5px;font-size:12px;" class="' + item.icon + '"> </span>' + item.title;
			}
			if (_menu) {
				title = title + '<span style="vertical-align:middle;display:inline-block;font-size: 14px;margin-left:5px;; width: 14px;" class="iconfont icon-unfold v-button-group-unfold"></span>';
				var toolStripMenuButton = isc.ToolStripMenuButton.create({
					height: this.parentElement.buttonGroupHeight,
					title: title,
					wrap: false,
					//							visibility: this.parentElement.MultiWidth == 'content' ? 'visible' : "hidden",
					menu: _menu,
					showMenuButtonImage: false,
					baseStyle: themeBaseStyle,
					prompt: item.prompt,
					width: '',
					enabled: item.enabled,
					visible: item.visible,
					visibility: item.visible ? "inherit" : "hidden",
					message: item,
					hasIcon: item.icon && item.icon != '' ? true : false,
					click: function () {
						_this._fireMenuButtonClickEvent(this.message)
					},
					//						    animateTime:1000,
					showMenuOnRollOver: this.parentElement.ExpandWhenHover == 'True' || this.parentElement.ExpandWhenHover == 'true' || this.parentElement.ExpandWhenHover == true ? true : false,
				})
				toolStripMenuButton.setStyleName(menuClass);
				this.addMember(toolStripMenuButton);
			} else if (!item.submenu) {
				var toolStripButton = isc.ToolStripButton.create({
					height: this.parentElement.buttonGroupHeight,
					title: title,
					wrap: false,
					enabled: item.enabled,
					visible: item.visible,
					//						    visibility: this.parentElement.MultiWidth == 'content' ? 'visible' : "hidden",
					visibility: item.visible ? "inherit" : "hidden",
					showMenuButtonImage: false,
					baseStyle: themeBaseStyle,
					prompt: item.prompt,
					hasIcon: item.icon && item.icon != '' ? true : false,
					width: '',
					message: item,
					//						    animateTime:1000,
					click: function () {
						_this._fireMenuButtonClickEvent(this.message)
					}
				})
				toolStripButton.setStyleName(menuClass);
				this.addMember(toolStripButton);
			}

		}
		this.inlinedMax = this.members.length;

		// add a menu button to show non-inlined items
		//    	        this.hideMenus.data = this.hideMenus.data.concat(menu.data);
		//more button
		this.menuButton = isc.ToolStripMenuButton.create({
			//    	        	ID :'moreButton',
			menu: this.hideMenus,
			title: "<span class='JGButtonGroupArrow iconfont icon-more v-button-group-more'></span>",
			//    	            width:23,
			overflow: "visible",
			autoDraw: false,
			showMenuButtonImage: false,
			baseStyle: baseStyle,
			//    	            animateTime:1000,
			height: this.parentElement.buttonGroupHeight,
			showMenuOnRollOver: this.parentElement.ExpandWhenHover == 'True' || this.parentElement.ExpandWhenHover == 'true' || this.parentElement.ExpandWhenHover == true ? true : false,
		});
		this.menuButton.setStyleName("JGButtonGroup" + 'OnlyButtons');
		if (!this.hideMenus.data.length > 0) {
			this.menuButton.setVisibility(false);
		}
		this.addMember(this.menuButton);
	},
	getMenuItem: function (item) {
		var _this = this;
		return item.filter(function (data) {
			var submenu = null;
			if (data.submenu) {
				submenu = _this.getMenuItem(data.submenu);
				data.submenu = submenu;
			}

			return data.visible != false && (!submenu || submenu.length > 0);
		})
	},
	/* 触发下拉菜单按钮的单击事件 */
	_fireMenuButtonClickEvent: function (item) {
		// 处理点击背景色
		//    	         var _target = item.target;
		//    	         var members = _target.parentElement.members;

		if (!item.submenu) {
			this.parentElement.parentElement._callEvent(this.parentElement.parentElement, "menuClick", item)
		}

	},
	getButtonClassName: function () {
		var buttonClassName = '';
		var showSepartor = false;
		if (this.parentElement.ShowBorder == 'False' || this.parentElement.ShowBorder == false || this.parentElement.ShowBorder == 'false') {
			for (var i = 0; i < this.menu.data.length; i++) {
				if (this.menu.data[i].icon == '' || !this.menu.data[i].icon) {
					showSepartor = true;
				}
			}
		}
		if (showSepartor && this.hideMenus.data.length > 0) {
			buttonClassName = "JGButtonGroup" + "SepartorMenuButton";
		} else if (showSepartor && (!this.hideMenus || this.hideMenus.data.length == 0)) {
			buttonClassName = "JGButtonGroup" + "SepartorMenuButtonNoMore";
		} else {
			buttonClassName = "JGButtonGroup" + "MenuButtons";
		}
		return buttonClassName;
	},
	hideSubmenuIcon: function (submenu) {
		var hideIcon = true;
		for (var j = 0; j < submenu.length; j++) {
			if (submenu[j].icon) {
				hideIcon = false;
				break;
			}
		}
		return hideIcon;
	},
	getToolStripBaseStyle: function (item) {
		var baseStyle = '';
		if (this.parentElement.ShowBorder == "True" || this.parentElement.ShowBorder == true || this.parentElement.ShowBorder == 'true' || this.parentElement.ShowBorder == undefined) {
			if (item.submenu) {
				if (item.appearance == 'Default') {
					baseStyle = "JGButtonGroup" + "DropDownMenuToolStripDefaultButtons";
				} else {
					baseStyle = "JGButtonGroup" + "DropDownMenuToolStripButtons"
				}
			} else {
				if (item.appearance == 'Default') {
					baseStyle = "JGButtonGroup" + "DropDownMenuToolStripDefaultNoChildButtons";
				} else {
					baseStyle = "JGButtonGroup" + "DropDownMenuToolStripNoChildButtons"
				}
			}
		} else {
			baseStyle = "JGButtonGroup" + 'DropDownMenuToolStripNoBorderButtons';
		}
		return baseStyle;
	},
	// get width of the next item to be inlined, by drawing it if needed
	getNextInlinedItemWidth: function () {
		var item = this.members[this.inlinedCount];
		if (!item.isDrawn()) item.draw();

		var isLast = this.inlinedCount == this.inlinedMax - 1;
		return item.getVisibleWidth() + (isLast ? -this.minimalWidth : 0);
	},

	// add an  inlined item - hide menu button if appropriate
	addInlinedItem: function () {
		var menu = this.menu;
		var addDatas = menu.data.removeAt(0);
		menu._inlinedData.add(addDatas);
		if (this.hideMenus.data.contains(addDatas)) {
			this.hideMenus.data.removeAt(0);
		}
		if (menu.getTotalRows() == 0 && this.hideMenus.data.length == 0) this.menuButton.hide();

		this.members[this.inlinedCount++].show();
	},

	// remove an inlined item - show menu button if appropriate
	removeInlinedItem: function () {
		var menu = this.menu;
		var addDatas = menu._inlinedData.pop();
		menu.data.addAt(addDatas, 0);
		this.hideMenus.data.addAt(addDatas, 0);
		this.members[--this.inlinedCount].hide();
		if (menu.getTotalRows() != 0 && this.hideMenus.data.length != 0) this.menuButton.show();
	},

	adaptWidthBy: function (pixelDifference, unadaptedWidth) {
		var items = this.inlinedItems;

		// set the minimal width
		if (this.minimalWidth == null) {
			this.minimalWidth = this.menuButton.getVisibleWidth();
		}

		// all non-hidden children are drawn; expected width is sum of their widths
		var expectedWidth = 0;
		for (var i = 0; i < this.members.length; i++) {
			var member = this.members[i];
			if (member.visibility == "hidden") continue;
			expectedWidth += member.getVisibleWidth();
		}

		// calculate desired width based on overflow/surplus and unadapted width;
		// if desired width differs from the expected, add/remove inlined items
		var desiredWidth = unadaptedWidth + pixelDifference;
		if (desiredWidth < expectedWidth) {
			// remove inlined items if we have an overflow
			while (this.inlinedCount > 0 && expectedWidth > desiredWidth) {
				this.removeInlinedItem();
				expectedWidth -= this.getNextInlinedItemWidth();
			}
		} else if (desiredWidth > expectedWidth) {
			var deltaX;
			// add inlined items if we have surplus space
			while (this.inlinedCount < this.inlinedMax &&
				expectedWidth + (deltaX = this.getNextInlinedItemWidth()) <= desiredWidth) {
				this.addInlinedItem();
				expectedWidth += deltaX;
			}
			var multiWidth = this.parentElement.parentElement.MultiWidth;
			if (multiWidth != 'content') {
				if (multiWidth.indexOf("px") != -1) {
					var _width = parseInt(multiWidth);
					if (_width > expectedWidth) {
						return expectedWidth - unadaptedWidth;
					}
				}
				for (var i = this.inlinedCount; i < this.members.length; i++) {
					if (!this.hideMenus.data.contains(this.members[i].message) && this.members[i] != this.menuButton) {
						this.hideMenus.data.addAt(this.members[i].message);
					}
				}
				if (this.hideMenus.data.length > 0) {
					this.menuButton.show();
				}
			}
		}
		return expectedWidth - unadaptedWidth;
	}
});

isc.JGButtonGroup.addProperties({
	Members: null,
	Name: '',
	Width: 200,
	Height: 20,
	Enabled: true,
	title: '',
	TabIndex: 1,
	BackColor: null, //背景色
	ImageObj: null, //背景图片
	WidgetStyle: "JGButtonGroup",
	listener: ["menuClick"]
});
isc.JGButtonGroup.addMethods({
	_initWidget: function () {
		this.buttonGroupHeight = this.ButtonSize == 'Small' ? 28 : 32;
		this.Enabled = this.Enabled === "true" || this.Enabled === 'True' || this.Enabled === true ? true : false;
		this.ImageObj = this.ImageValue;
		if (this.BtnGrpDataSourceType == 'Static') {
			//处理窗体设计器的数据--只对静态按钮项处理
			this.handleDesignData(this);
			this.setMembers(this.menuDate);
		}
	},
	_afterInitWidget: function () {
		var _widget = this;

		if (this.BtnGrpDataSourceType != 'Static') {
			isc.WidgetDatasource.addBindDatasourceLoadEventHandler(this, null, function (params) {
				_widget.setMenus(_widget);
			});
			isc.WidgetDatasource.addBindDatasourceInsertEventHandler(this, null, function (params) {
				_widget.setMenus(_widget);
			});
			isc.WidgetDatasource.addBindDatasourceDeleteEventHandler(this, null, function (params) {
				_widget.setMenus(_widget);
			});
			isc.WidgetDatasource.addBindDatasourceUpdateEventHandler(this, null, function (params) {
				if (params.resultSet && 0 < params.resultSet.length) {
					for (var changedData = [], i = 0; i < params.resultSet.length; i++) {
						var data = params.resultSet[i];
						changedData.push({
							changedColumn: data,
							data: params.datasource.getRecordById(data.id)
						});
					}
					0 < changedData.length && _widget.updateButtonState(changedData)
				} else
					_widget.setMenus(_widget.code)
			});
		}




		_widget.on("menuClick", function () {

			var currentScopeId = _widget.scopeId;


			var handler = _widget.getEventHandler("OnClick");
			return function (item) {

				isc.MenuUtil.menuEvent(_widget, item, handler, null, null, _widget._menuAction);
			}
		}());
	},
	onDataLoad: function () {
		if (this.MenuDataSourceType == "Rule") {
			var _scopeId = scopeManager.getCurrentScopeId();
			return function () {
				menuDataTrans.getMenuDataByRuleSet(this);
			}
		}
	},

	hideSubmenuIcon: function (submenu) {
		var hideIcon = true;
		for (var j = 0; j < submenu.length; j++) {
			if (submenu[j].icon) {
				hideIcon = false;
				break;
			}
		}
		return hideIcon;
	},

	getMenus: function (menuData) {
		var hideIcon = this.hideSubmenuIcon(menuData);
		var _this = this;
		var menu = isc.JGButtonMenu.create({
			/*width: 138,*/
			showIcons: hideIcon ? false : true,
			// showKeys: false,
			iconBodyStyleName: "JGButtonGroup" + "MenuMain",
			showShadow: false,
			shadowDepth: 10,
			//                   cellHeight: 32, //行高
			tableStyle: "JGButtonGroup" + "DropMenu",
			getIcon: function (_1) {
				if (_1.icon) {
					return '<span class="JGButtonGroupArrow v-button-group-icon ' + _1.icon + '"></span>';
				}
			},
			placeSubmenu: function (_1, _2) {
				this.Super('placeSubmenu', arguments);
				var hideIcon = _this.hideSubmenuIcon(_1.submenu);
				_2.setShowIcons(!hideIcon);
			},
			getSubmenuImage: function (_1) {
				if (!this.hasSubmenu(_1))
					return "&nbsp;"
				else
					return '<span class="JGButtonGroupArrow iconfont icon-right v-button-group-icon-right"></span>';
			},
			bodyProperties: {
				showHiliteInCells: true,
				getCellStyle: function (_1, _2, _3) {
					var _updateBfClassName = this.className
					var _cellStyle = this.Super("getCellStyle", arguments);
					var _updateAfClassName = this.className;
					var _4 = this.getCellStyleIndex(_1, _2, _3);
					if (_updateAfClassName.length - 4 == _updateAfClassName.toLowerCase().lastIndexOf("over") && _updateBfClassName !== _updateAfClassName)
						_1._$over = true;
					else if (_4 == 1) {
						_1._$over = true;
					} else {
						_1._$over = false;
					}
					return _cellStyle;
				}
			},
			baseStyle: "JGButtonGroup" + "DropMenu",
			canSelectParentItems: true,
			itemClick: this._referFunc(this, "_fireItemClickEvent"),
			menuConstructor: "JGButtonMenu",
			data: menuData,
			//                   defaultHeight: 32,
			defaultWidth: 138
		});
		return menu;
	},
	getMenuData: function (menuData) {
		var showMenuData = [],
			hideMenuData = [];
		var isDynamic = this.BtnGrpDataSourceType == "Dynamic";

		function setTheme(submenus) {
			for (var j = 0; j < submenus.length; j++) {
				var sm = submenus[j];
				var theme = (sm.Theme || sm.theme);
				if (theme && sm.title && sm.title.indexOf("<span") < 0)
					sm.title = "<span class='" + theme + "' >" + sm.title + "</span>";
				if (sm.submenu)
					setTheme(sm.submenu);
			}
		}

		for (var i = 0; i < menuData.length; i++) {
			var menu = menuData[i];

			if (menu.theme)//动态数据的数据源是小写的theme, 静态的用大小的Theme,实现上都用Theme,所以需要转换
			{
				menu.Theme = menu.theme;
			}

			if (menu.IsMore || menu.isMore) {
				hideMenuData.push(menu);
				//if(!isDynamic) {
				setTheme([menu]);
				continue;
				//}

			} else {
				showMenuData.push(menu);
			}

			//如果有主题，则需要定义一个html，liyk 20201024
			if (menu.submenu)
				setTheme(menu.submenu);
		}
		return {
			showMenuData: showMenuData,
			hideMenuData: hideMenuData
		}
	},
	setMembers: function (menuData) {
		if (!menuData || menuData.length == 0) {
			this.setHeight(0);
			this.animateHide(null, null, 200, 'smoothEnd');
			if (this.parentElement && this.parentElement.type == 'JGGroupPanel' && this.parentElement.members.length == 2) {
				this.parentElement.animateHide(null, null, 200, 'smoothEnd');
			}
			return;
		} else {
			if (this.isVisible() && this.isDrawn()) {
				this.setHeight(this.buttonGroupHeight);
				this.animateShow(null, null, 200, 'smoothEnd');
				if (this.parentElement && !this.parentElement.isVisible()) {
					this.parentElement.animateShow(null, null, 200, 'smoothEnd');
				}
			}
		}
		//				if(menuData && menuData.length > 0){
		//					this.buttonGroupHeight = this.ButtonSize == 'Small' ? 28 : 32;
		//					this.setHeight(this.buttonGroupHeight);
		//					var _this = this;
		//					this.animateShow(null,null,200,'smoothEnd');
		//					if(this.parentElement && !this.parentElement.isVisible()){
		//		    			this.parentElement.animateShow(null,null,200,'smoothEnd');
		//		    		}
		//				}

		isc.JGButtonMenu.TITLE_FIELD.baseStyle = "JGButtonGroup" + "DropMenuTitleField";
		isc.JGButtonMenu.ICON_FIELD.baseStyle = "JGButtonGroup" + "DropMenuIconField";
		isc.JGButtonMenu.KEY_FIELD.baseStyle = "JGButtonGroup" + "DropMenuKeyField";
		isc.JGButtonMenu.SUBMENU_FIELD.baseStyle = "JGButtonGroup" + "DropMenuSubmenuField";
		var menus = this.getMenuData(menuData);
		var showMenuDatas = menus.showMenuData;
		var hideMenuData = menus.hideMenuData;
		this.showMenus = this.getMenus(showMenuDatas);
		this.hideMenus = this.getMenus(hideMenuData);
		if (this.inlinedMenu) {
			this.inlinedMenu.destroy();
		}
		this.inlinedMenu = isc.InlinedMenu.create({
			//					ID: "inlinedMenu", 
			menu: this.showMenus,
			WidgetStyle: "JGButtonGroup",
			_referFunc: this._referFunc,
			parentElement: this,
			//					animateTime:1000,
			hideMenus: this.hideMenus,
			autoDraw: false,
			//					width:5,
			width: "100%",
			membersMargin: 8,
			disabled: !this.Enabled
		});

		if (this.isDrawn()) {
			this.setInlinedWidth();
		}

		var width;
		if (this.Dock == 'Top' || this.Dock == 'Bottom') {
			width = '100%';
		} else {
			if (this.MultiWidth == 'content') {
				//						width = ''
				width = this.isDrawn() ? this.setMultiWidth() : "100%";
			} else if (this.MultiWidth == "space") {
				width = "100%";
			} else if (this.MultiWidth.indexOf('px') != -1) {
				width = this.MultiWidth.split('px')[0];
			} else {
				width = this.MultiWidth;
			}
		}
		if (this._toolStrip) {
			this._toolStrip.destroy();
		}
		this._toolStrip = isc.HLayout.create({
			width: width,
			height: this.buttonGroupHeight,
			autoDraw: false,
			members: [this.inlinedMenu],
			align: this.HorizontalAlign == "Right" ? 'right' : this.HorizontalAlign == 'Left' ? 'left' : 'center',
			animateMemberTime: 1000,
		});
		this.addChild(this._toolStrip);
		this._setButtonState();
		this.setWidth(width);
	},
	_setButtonState: function () {
		for (var i = 0; i < this.inlinedMenu.children.length; i++) {
			var button = this.inlinedMenu.children[i];
			var state = (button.disabled || !this.Enabled) ? "Disabled" : "";
			button.setState(state)
		}
	},
	/**
	 * 指定按钮添加样式
	 * */
	addButtonClass: function (itemCode, className) {//指定按钮添加样式
		if (!className || !itemCode || !this.inlinedMenu || !this.inlinedMenu.children) {
			return;
		}
		var button = null;
		for (var i = 0; i < this.inlinedMenu.children.length; i++) {
			var item = this.inlinedMenu.children[i];
			if (item.message && item.message.id == itemCode) {
				button = item;
				break;
			}
		}
		if (button) {
			if (button.baseStyle) {
				var baseStyle = button.baseStyle;
				var styleArr = baseStyle.split(" ");
				if (styleArr.indexOf(className) == -1) {
					styleArr.splice(0, 0, className);
					button.baseStyle = styleArr.join(" ");
					this.inlinedMenu.setOverflow(isc.Canvas.VISIBLE);
				}
			} else {
				button.baseStyle = className;
			}
			button.redraw();
		}
	},
	/**
	 * 移除样式
	 * */
	removeButtonClass: function (className) {//移除样式
		if (!className || !this.inlinedMenu || !this.inlinedMenu.children) {
			return;
		}
		this.inlinedMenu.setOverflow(isc.Canvas.HIDDEN);
		for (var i = 0; i < this.inlinedMenu.children.length; i++) {
			var button = this.inlinedMenu.children[i];
			if (button && button.baseStyle) {
				var baseStyle = button.baseStyle;
				var styleArr = baseStyle.split(" ");
				if (styleArr.indexOf(className) != -1) {
					styleArr.splice(styleArr.indexOf(className), 1);
					button.baseStyle = styleArr.join(" ");
					button.redraw();
				}
			}
		}
	},
	//解决有图标情况下抖动
	setInlinedWidth: function () {
		var width = 0;
		var _this = this;
		setTimeout(function () {
			var visibleNum = 0;
			if (_this.inlinedMenu && _this.inlinedMenu.members) {
				for (var i = 0; i < _this.inlinedMenu.members.length; i++) {
					if (_this.inlinedMenu.members[i].isVisible() && _this.inlinedMenu.members[i].hasIcon && _this.inlinedMenu.members[i]._clipDiv) {
						_this.inlinedMenu.members[i].setWidth(_this.inlinedMenu.members[i]._clipDiv.clientWidth + 13);
					}
					if (_this.inlinedMenu.members[i].isVisible()) {
						width += _this.inlinedMenu.members[i].getVisibleWidth();
						visibleNum++;
					}
				}
				if (visibleNum > 0) {
					width += (visibleNum - 1) * 8;
					if (_this.inlinedMenu.menuButton.isVisible()) {
						width += 4;
					}
					_this.inlinedMenu.setWidth(width);
					_this._toolStrip.setWidth(width);
					if (_this.MultiWidth == "content") {
						_this.setWidth(width);
					}

				}
			}
		}, 0)
	},
	draw: function () {
		this.Super("draw", arguments);
		this.setInlinedWidth();
	},
	_resize: function () {
		var _this = this;
		$(window).resize(function () {
			if (_this.parentElement.width - _this.width <= 10) {
				_this.setWidth("100%");
				_this._toolStrip.setWidth("100%");
				_this.inlinedMenu.setWidth("100%");
			} else {
				if (_this.MultiWidth == 'content') {
					_this.setWrapperWidth();
				}
			}
		})
	},
	setMultiWidth: function () {
		var width = 0;
		var visibleNum = 0;
		for (var i = 0; i < this.inlinedMenu.members.length; i++) {
			if (this.inlinedMenu.members[i].isVisible()) {
				width += this.inlinedMenu.members[i].getVisibleWidth();
				visibleNum++;
			}
		}
		width += (visibleNum - 1) * 8;
		if (this.inlinedMenu.menuButton.isVisible()) {
			width += 4;
		}
		if (width > window.innerWidth) {
			width = '100%';
		}
		if (this.inlinedMenu.members[0].getVisibleWidth() == 1 && width == this.inlinedMenu.members.length) {
			width = this.setWrapperWidth();
		}
		return width;
	},
	setWrapperWidth: function () {
		var _this = this;
		var width = 0;
		setTimeout(function () {
			var visibleNum = 0;
			for (var i = 0; i < _this.inlinedMenu.members.length; i++) {
				if (_this.inlinedMenu.members[i].isVisible()) {
					width += _this.inlinedMenu.members[i].getVisibleWidth();
					visibleNum++;
				}

			}
			width += (visibleNum - 1) * 8;
			if (_this.inlinedMenu.menuButton.isVisible()) {
				width += 4;
			}
			_this.inlinedMenu.setWidth(width);
			_this._toolStrip.setWidth(width);
			if (_this.MultiWidth == "content") {
				_this.setWidth(width);
			}

			return width;
		}, 0)
	},
	setVisible: function (visible) {
		this.Super('setVisible', arguments);
		this.inlinedMenu && this.inlinedMenu.setVisibility(visible);
		visible && this.setInlinedWidth();
		this.setVisibility(visible);
		this.Visible = visible;
		if (!visible) {
			this.setHeight(0);
			this.animateHide(null, null, 200, 'smoothEnd');
			if (this.parentElement && this.parentElement.type == 'JGGroupPanel' && this.parentElement.members.length == 2) {
				this.parentElement.animateHide(null, null, 200, 'smoothEnd');
			}
		} else {
			this.setHeight(this.Height);
			this.animateShow(null, null, 200, 'smoothEnd');
			if (this.parentElement && this.parentElement.type == 'JGGroupPanel' && this.parentElement.members.length == 2) {
				this.parentElement.animateShow(null, null, 200, 'smoothEnd');
			}
		}
	},
	parentDisabled: function (disable) {
		if (this.disabled)
			return;
		if (this.setHandleDisabled)
			this.setHandleDisabled(disable);
		this.inlinedMenu && this.inlinedMenu.setDisabled(disable, true);
		this.Enabled = !disable;
	},
	parentReadOnly: function (readOnly) {
		this.setVisible(!readOnly);
	},
	setEnabled: function (enabled) {
		this.Super('setEnabled', arguments);
		this.inlinedMenu && this.inlinedMenu.setDisabled(!enabled, true);
		this.Enabled = enabled;
	},
	updateButtonState: function (changedData) {
		for (var i = 0; i < changedData.length; i++) {
			var button = this.getButtonById(changedData[i].data.id);
			if (button) {
				for (var key in changedData[i].changedColumn) {
					var value = changedData[i].changedColumn[key];
					switch (key) {
						case "enabled":
							button.setEnabled(value);
							break;
						case "visible":
							button.setVisibility(value);
							break;
						case "menuItemName":
							button.setTitle(value);
							break;
					}
				}
			}
		}
		this.setWrapperWidth();
		this._setButtonState();
	},
	getButtonById: function (id) {
		for (var i = 0; i < this.inlinedMenu.members.length; i++) {
			if (this.inlinedMenu.members[i].message && this.inlinedMenu.members[i].message.id == id) {
				return this.inlinedMenu.members[i];
			}
		}
	},
	firePlatformEventBefore: function (eventName, widgetId, itemId) {
		if (eventName == "OnClick" && itemId) {
			this.disable();
			this.addButtonClass(itemId, "V3ButtonActive");
		}
	},
	firePlatformEventAfter: function (eventName, widgetId, itemId) {
		if (eventName == "OnClick") {
			this.enable();
			this.removeButtonClass("V3ButtonActive");
		}
	},
	handleDesignData: function (properties) {
		var menuDate = properties.menuDate;
		var designerStaticMenuDatas = properties.DesignerStaticMenuDatas;
		var mappings = {};
		var indexs = {};
		if (designerStaticMenuDatas) {
			for (var i = 0, len = designerStaticMenuDatas.length; i < len; i++) {
				var data = designerStaticMenuDatas[i];
				mappings[data.menuItemCode] = data;
				indexs[data.menuItemCode] = data.orderNo;
			}
			var _this = this;
			var replaceData = function (datas, mps, indexs) {
				if (datas && datas.length > 0) {
					_this.arrSort(datas, indexs, "id");
					for (var i = 0, len = datas.length; i < len; i++) {
						var data = datas[i];
						var id = data.id;
						if (mps.hasOwnProperty(id)) {
							var mapping = mps[id];
							if (mapping.hasOwnProperty("visible")) {
								data.visible = mapping.visible;
							}
							if (mapping.hasOwnProperty("enabled")) {
								data.enabled = mapping.enabled;
							}
							if (mapping.hasOwnProperty("SimpleChineseTitle")) {
								data.title = mapping.SimpleChineseTitle;
							}
							if (mapping.hasOwnProperty("Theme")) {
								data.Theme = mapping.Theme;
							}
						}
						replaceData(data.submenu, mappings, indexs)
					}
				}
			}
			replaceData(menuDate, mappings, indexs);
		}
	},
	/**
 * 数组排序
 * */
	arrSort: function (target, indexs, key) {
		target.sort(function (a, b) {
			var ac = a[key];
			var bc = b[key]
			if (!ac || !bc) {
				return 0;
			}
			var i = indexs.hasOwnProperty(ac) ? indexs[ac] : -1;
			var i1 = indexs.hasOwnProperty(bc) ? indexs[bc] : -1;
			if (i == -1 || i1 == -1) {
				return 0;
			} else {
				return i - i1;
			}
		});
	},

	setDataToMenu: function (items, itemsList) {
		if (this._toolStrip && this._toolStrip.menuBar) {
			var members = this._toolStrip.menuBar.getMembers();
			for (var i = 0, num = members.length; i < num; i++) {
				this._toolStrip.menuBar.removeMember(members[0]);
			}
		}
		this.setMembers(items);
		this.menuTable = itemsList;
	},

	updatePropertys: function (params) {
		var propertys = params.propertys;
		var widget = params.widget;
		var records = params.records;
		if (records) {//替换菜单数据
			if (widget.BtnGrpDataSourceType == "Dynamic") {
				windowInit.registerHandler({
					"eventName": windowInit.Events.AfterDataLoad,
					"handler": (function (newRecords, tableName) {
						return function () {
							var ds = datasourceManager.lookup({
								datasourceName: tableName
							});
							if (ds) {
								ds.clear();
								ds.insertRecords({
									records: newRecords
								});
							}
						}
					})(records, widget.SourceTableName)
				});
				widget.menuDate = [];
				widget.FieldMappingJson = '{"pid":"pid","menuItemCode":"menuItemCode","menuItemName":"menuItemName","isSelected":"isSelected","icourl":"icourl","appearance":"appearance","enabled":"enabled","showBorder":"showBorder","displayStyle":"displayStyle","isMore":"isMore","visible":"visible","isItem":"isItem","menuItemType":"menuItemType","openCompCode":"openCompCode","openWinCode":"openWinCode","requestParams":"requestParams","ruleSetComponentCode":"ruleSetComponentCode","ruleSetWindowCode":"ruleSetWindowCode","ruleSetCode":"ruleSetCode","ruleSetInputParam":"ruleSetInputParam","orderNo":"orderNo","theme":"theme"}';
			}

		} else {//更新属性
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
		}
	},

	setMenus: function (widgetId) {
		this.fireEvent("ConfigChanged");
		var datasource = isc.WidgetDatasource.getBindDatasource(widgetId);
		if (datasource) {
			var items = datasource.getAllRecords();
			var designerMenuDatas = this.DesignerMenuDatas;
			if (designerMenuDatas) {//窗体设计器修改的数据
				this._cloneProps({
					DesignerMenuDatas: designerMenuDatas
				}, {
					DesignerMenuDatas: items
				}, {
					DesignerMenuDatas: "menuItemCode"
				});
			}
			// 需转换数据
			var dynItems = this._transformDyMenuData(widgetId, items);
			var rootPid = widgetId + 'root';
			var addRoot = false;
			if (!dynItems || dynItems.length === 0) {
				this.emptyMenus(widgetId);
				//widgetRenderer.executeWidgetRenderAction(widgetId, "setDataToMenu");
				this.setDataToMenu(widgetId);
				return;
			}

			for (var i = 0; i < dynItems.length; i++) {
				if (dynItems[i].pid == '') {
					dynItems[i].pid = rootPid;
					addRoot = true;
				}
				if (dynItems[i].icourl) {
					dynItems[i].icourl = '[{"type":"ns","source":"icon","img":"iconfont icon-' + dynItems[i].icourl + '"}]';
				}
				//            	if(dynItems[i].icourl.indexOf('http:') != -1 || dynItems[i].icourl.indexOf('https:') != -1){
				//            		//网络图片
				//                    dynItems[i].icourl = '{"type":"","source":"url","img":"'+ dynItems[i].icourl +'"}';
				//                }else if(){
				//                    //平台图片资源id
				//                    const _src = "module-operation!executeOperation?operation=FileDown&token={%22data%22:{%22isMulti%22:false,%22dataId%22:%22" + dynItems[i].icourl + "%22,%22isShow%22:1"+"}}";
				//                    dynItems[i].icourl = '{"type":"","source":"db","img":"'+ _src +'"}'
				//                }else if(){
				//                	//平台静态资源
				//                	dynItems[i].icourl = '{"type":"","source":"res","img":"'+ dynItems[i].icourl +'"}'
				//                }else{
				//                	//图标
				//                	dynItems[i].icourl = '{"type":"","source":"icon","img":"iconfont icon-'+ dynItems[i].icourl +'"}';
				//                }
			}
			if (addRoot) {
				dynItems.push({
					id: rootPid,
					pid: '',
					visible: true
				})
			}
			var list = isc.MenuUtil.toMenuData(dynItems);
			if (list && list[0] && list[1])
				//widgetRenderer.executeWidgetRenderAction(widgetId, "setDataToMenu", list[0], list[1]);
				this.setDataToMenu(list[0], list[1]);

		}
	},

	/*处理动态数据，转换成符合要求的数据*/
	_transformDyMenuData: function (widgetId, datas) {
		if (!datas || datas.length === 0)
			return;
		fieldMappdingStr = this.FieldMappingJson;

		if (!fieldMappdingStr || fieldMappdingStr !== "") {
			var fieldMappding = JSON.parse(fieldMappdingStr);

			if (!fieldMappding)
				return;

			var newDatas = [];
			for (var i = 0, len = datas.length; i < len; i++) {
				var tmpObj = datas[i];
				//add by xiedh 2019-10-26 剔除隐藏的菜单项
				//                var visibleField = fieldMappding.visible;
				//                if(visibleField){//如果绑定了是否显示字段
				//                	if(tmpObj[visibleField] === false){
				//                		continue;
				//                	}
				//                }
				//end

				var tmpData = {};
				for (var tmpFieldCode in fieldMappding) {
					var tmpFieldVal = fieldMappding[tmpFieldCode];

					if (!tmpFieldVal)
						continue;

					tmpData[tmpFieldCode] = tmpObj[tmpFieldVal];
				}
				tmpData["openType"] = tmpObj["openType"];
				tmpData["openWinTitle"] = tmpObj["openWinTitle"];
				tmpData["theme"] = tmpObj["theme"];
				if (JSON.stringify(tmpData) !== "{}") {
					// 处理 Id， 必须
					tmpData["id"] = tmpObj["id"];

					newDatas.push(tmpData);
				}
			}
		}

		return newDatas;
	},

	emptyMenus: function (widgetID) {
		// 移除所有子项
		if (this._toolStrip && this._toolStrip.menuBar) {
			var members = this._toolStrip.menuBar.getMembers();
			for (var i = 0, num = members.length; i < num; i++) {
				this._toolStrip.menuBar.removeMember(members[0]);
			}
		}
		this.setMembers([]);
		this.menuTable = {};

		// 清除左右箭头
		if (this._toolStrip && this._toolStrip.children && this._toolStrip.children.length === 3) {
			var _toolStripChildren = this._toolStrip.children;

			var _leftArrow = _toolStripChildren[1];
			var _rightArrow = _toolStripChildren[2];
			if (_leftArrow)
				this._toolStrip.removeChild(_leftArrow);
			if (_rightArrow)
				this._toolStrip.removeChild(_rightArrow);
		}
	},

	getV3Show: function (widgetId, widgetIds) {

	},

	getV3Hide: function (widgetId) {
		this.hideItem(widgetIds);
		this.disabled(widgetIds);
	},

	readonly: function (widgetId) {
		disabled(widgetId);
	},

	writable: function (widgetId) {
		enabled(widgetId);
	},

	disabled: function (widgetId) {
		return this.disabledItem(widgetId);
	},

	enabled: function (widgetId) {
		return this.enabledItem(widgetId);
	},

	initMenu: function (widgetId, items, itemsJson) {
		_getItems(widgetId, items, itemsJson);
		_renderMenuItems(widgetId, items, itemsJson);
	},

	addMenuByIds: function (widgetId, menuIds) {
		if (menuIds && menuIds.length > 0) {
			var param = "\"" + menuIds.join('","') + "\"";
			var expression = 'GetMenus(' + param + ')';
			var result = remoteOperation.executeFormulaExpression({
				"windowCode": scopeManager.getWindowScope().getWindowCode(),
				"expression": expression
			});
			if (result && result.success == true) {
				var menuDataJson = result.data.result;
				if (menuDataJson) {
					if (menuDataJson.menuDatas && menuDataJson.menuDatas != null) {
						var items = menuDataJson.menuDatas;
						var itemsJson = menuDataJson.menuDatasJson;
						initMenu(widgetId, items, itemsJson);
					}
				}
			} else {
				throw new Error("[JGButtonGroupAction.addMenuByIds]获取菜单数据失败，result=" + result);
			}
		}
	},

	/**
	 * 添加路由信息
	 */
	_addRouteInfo: function (routeId, routeStr) {
		if (routeStr) {
			var route = typeof (routeStr) == "string" ? jsonUtil.json2obj(routeStr) : routeStr;
			var handler = typeof (route.handler) == "string" ? eval(route.handler) : route.handler;
			// TODO
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
			var ruleInstances = typeof (ruleInstanceStr) == "string" ? jsonUtil.json2obj(ruleInstanceStr) : ruleInstanceStr;
			if (ruleInstances && ruleInstances.length > 0) {
				for (var i = 0, len = ruleInstances.length; i < len; i++) {
					var ruleInstance = ruleInstances[i];
					// TODO
					ruleConfigManager.addRuleConfig(ruleInstance.ruleInstId, ruleInstance);
				}
			}
		}
	},

	_addRouteRelationInfo: function (menuId, routeId, eventType) {
		// TODO
		viewEvent.putRouteRelationInfo(menuId, routeId, eventType);
		// TODO
		viewModel.getSysModule().on(menuId, eventType, "widget", function () {
			// TODO
			eventUtil.fireEvent(menuId, routeId, eventType, arguments);
		});
	},

	/**
	 * 渲染菜单项
	 */
	_renderMenuItems: function (widgetId, items, itemsJson) {
		var widget = widgetContext.get(widgetId, "widgetObj");
		if (widget) {
			itemsJson = typeof (itemsJson) == "string" ? jsonUtil.json2obj(itemsJson) : itemsJson;
			widget.setMembers(itemsJson);
		}
	},

	/**
	 * 构造菜单项
	 */
	_getItems: function (widgetId, items) {
		var menuItems = [];
		if (items && items.length) {
			for (var i = 0, len = items.length; i < len; i++) {
				var item = items[i];
				var params = item["parameters"];
				var paramsJson = {};
				if (params) {
					paramsJson = typeof (params) == "string" ? jsonUtil.json2obj(params) : params;
				}
				item.parameters = paramsJson;
				widgetContext.put(item["id"], widgetContext.WIDGET_CONTEXT_EXTWIDGETIDRELA, widgetId);
				widgetContext.put(item["id"], widgetContext.WIDGET_CONTEXT_TYPE, "DropdownMenuItem");
				// 绑定规则
				var menuType = item["menuItemType"];
				if (menuType == 1) { // 业务规则方式
					var routeId = item.routeId;
					var routeStr = item.RuleRoute;
					var ruleInstanceStr = item.RuleInstance;
					_addRouteInfo(routeId, routeStr);
					_addRuleInstanceInfo(ruleInstanceStr);
					_addRouteRelationInfo(item.id, routeId, "ButtonAction");
				}
				if (menuType == 0) { // 打开组件方式
					_addNodeEvent(widgetId, "ButtonAction", item);
				}
			}
		}
	},

	/**
	 * 生成图片路径
	 */
	getImage: function (imageObjId) {
		return fileUtil.getImageByName(imageObjId);
	},

	/**
	 * 菜单项绑定事件
	 */
	_addNodeEvent: function (widgetId, eventType, item) {
		var nodeId = item["id"];
		var params = item["parameters"];
		var nodeName = item["menuItemName"];
		var componentId = item["componentId"];
		var componentOpenWay = widgetProperty.get(widgetId, "ComponentOpenWay");
		if (componentId && componentId != "") {
			var fn;
			switch (componentOpenWay) {
				case 0:
				case "NewWindow":
					fn = getOpenNewWindowFunc(widgetId, componentId, params, nodeName);
					break;
				case "SpecifiedWindow":
					fn = getSpecifiedWindowFunc(widgetId, componentId, params, nodeName);
					break;
				case "SpecifiedContainer":
					fn = getSpecifiedContainerFunc(widgetId, componentId, params, nodeName);
					break;
				default:
					fn = function () { };
			}
			// TODO
			viewModel.getSysModule().on(item["id"], eventType, "widget", fn);
		}
	},

	// 以新窗体方式打开组件
	getOpenNewWindowFunc: function (widgetId, componentId, params, nodeName) {
		return (function (componentId, params, nodeName) {
			function innerFunc() {
				var title = nodeName;
				var componentVariable = {};
				componentVariable["variable"] = params;
				// 标注打开方式为dialog
				componentVariable["variable"]["formulaOpenMode"] = "dialog";
				// TODO
				viewModel.getCmpModule().callModuleEx(componentId, title, componentVariable, null, null, false, "_blank");
			}
			return innerFunc;
		})(componentId, params, nodeName)
	},

	getSpecifiedWindowFunc: function (widgetId, componentId, params, nodeName) {
		var specifiedWindowName = widgetProperty.get(widgetId, "SpecifiedWindowName");
		return (function (componentId, specifiedWindowName, params, nodeName) {
			function innerFunc() {
				var title = nodeName;
				specifiedWindowName = specifiedWindowName == "" ? title : specifiedWindowName;
				var componentVariable = {};
				componentVariable["variable"] = params;
				// 标注打开方式为dialog
				componentVariable["variable"]["formulaOpenMode"] = "dialog";
				// TODO
				viewModel.getCmpModule().callModuleEx(componentId, specifiedWindowName, componentVariable, null, null, false, specifiedWindowName);
			}
			return innerFunc;
		})(componentId, specifiedWindowName, params, nodeName);
	},

	getSpecifiedContainerFunc: function (widgetId, componentId, params, nodeName) {
		var destComponentContainerID = widgetProperty.get(widgetId, "ComponentContainer");
		var tabPageDisplayMode = widgetProperty.get(destComponentContainerID, "TabPageDisplayMode");
		return (function (componentId, destComponentContainerID, params, nodeName, tabPageDisplayMode) {
			function innerFunc() {
				var title = nodeName;
				var componentVariable = {};
				componentVariable["variable"] = params;
				// 标注打开方式为container
				componentVariable["variable"]["formulaOpenMode"] = "container";
				// 将标签页的ID传入，以提供给退出事件进行关闭
				componentVariable.variable.closeTabId = componentId;
				if (widgetAction.executeWidgetAction(destComponentContainerID, "exists", title) && tabPageDisplayMode != "Hide") {
					// 因为可能有数据更新了，要先刷新,刷新后再激活
					widgetAction.executeWidgetAction(destComponentContainerID, "reloadSingleTab", componentId, viewModel.getCmpModule().getModuleUrl(componentId, componentVariable), false, true);
					widgetAction.executeWidgetAction(destComponentContainerID, "active", title);
				} else {
					widgetAction.executeWidgetAction(destComponentContainerID, "add", {
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
	getMenuDataSourceTypeEnum: function (widgetId) {
		var widget = widgetContext.get(widgetId, "widgetObj");
		if (widget) {
			var val = widget.getProperty("MenuDataSourceTypeEnum");
			if (typeof val != "undefined")
				return val
		}
		return null
	},
	getBindMenu: function (widgetId) {
		var properties = widgetContext.getAll(widgetId);
		if (properties && properties != "" && properties.hasOwnProperty("BindMenu"))
			return properties["BindMenu"];
		else
			return null
	},

	getComponentOpenWay: function (widgetId) {
		var properties = widgetContext.getAll(widgetId);
		if (properties && properties != "" && properties.hasOwnProperty("ComponentOpenWay"))
			return properties["ComponentOpenWay"];
		else
			return null
	},

	getCurrentControlID: function (widgetId) {
		return this.widgetId;
	},
	getV3MethodMap: function () {
		return {
			show: "getV3Show",
			hide: "getV3Hide",

		}
	},
	afterDataLoad: function () {
		if (this.BtnGrpDataSourceType == "Dynamic" && this._initMenuData) {
			var ds = isc.WidgetDatasource.getBindDatasource(this);
			if (ds) {
				ds.clear();
				ds.insertRecords(this._initMenuData);
			}
		}
	}

})

isc.JGButtonGroup.addClassMethods({
	updatePropertys: function (params) {
		var propertys = params.propertys;
		var widget = params.widget;
		var records = params.records;
		if (records) {//替换菜单数据
			if (widget.BtnGrpDataSourceType == "Dynamic") {
				/* 原型配置的静态菜单 */
				widget._initMenuData = records;
				widget.menuDate = [];
				widget.FieldMappingJson = '{"pid":"pid","menuItemCode":"menuItemCode","menuItemName":"menuItemName","isSelected":"isSelected","icourl":"icourl","appearance":"appearance","enabled":"enabled","showBorder":"showBorder","displayStyle":"displayStyle","isMore":"isMore","visible":"visible","isItem":"isItem","menuItemType":"menuItemType","openCompCode":"openCompCode","openWinCode":"openWinCode","requestParams":"requestParams","ruleSetComponentCode":"ruleSetComponentCode","ruleSetWindowCode":"ruleSetWindowCode","ruleSetCode":"ruleSetCode","ruleSetInputParam":"ruleSetInputParam","orderNo":"orderNo","theme":"theme"}';
			}
		} else {//更新属性
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
		}
	}
});








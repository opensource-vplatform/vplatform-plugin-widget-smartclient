

import "./ComponentCanvas";
import "./ComponentPanel";
import "./JGComponentContainerMenu";

isc.TabSet.addMethods({
	addTabsEditModeExtras: function () {
		
	}
});
/**
 * 组件容器控件
 * @class JGComponentContainer
 */
isc.ClassFactory.defineClass("JGComponentContainer", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGComponentContainer", "JGStyleHelper");
isc.ClassFactory.mixInInterface("JGComponentContainer", "IWindowAop");

isc.JGComponentContainer.addClassProperties({
	//当前组件容器所有待执行的任务id列表
    taskIds: [],
    //当前执行的任务id
    currentTaskId: null,
    //任务动作
    ACTIVE: {
    	"OPEN":"open",
    	"CLOSE":"close"
    },
	_taskMap: {}
});

isc.JGComponentContainer.addProperties({
	tabs: null,

	TabIndex: 1,

	/**
	 * 是否只读
	 *
	 * @param {Boolean}
	 */
	readOnly: false,
	/**
	 * 是否禁用
	 *
	 * @param {Boolean}
	 */
	disabled: false,

	_selectedTabId: '',

	//高度控制，StaticHeight(固定高度)，AutoHeight(自适应高度)
	HeightSet: null,

	// 页签切换事件
	tabChange: null,
	Top: 10,
	Left: 10,
	Width: 600,
	Height: 50,
	BorderWidth: 0,
	SelectedIndex: 0,
	/**
	 * 隐藏页签的ID和索引
	 *
	 * @param {array}
	 */
	hidenID: {},
	// 提供的事件列表
	listener: ['tabChange', 'closeClick', 'OnContainerInited'], //右键刷新,'reload'

	tabSetObj: null,
	/**
	 * 页签头部显示方式
	 *
	 * @type {String}
	 */
	displayType: '',
	_tabbarHeigh: 23,
	width: 600,
	height: 50,
	_funcOnClick: null,
	isLoading: false, //页签数据是否加载中，用于判断是否触发页签切换事件
	fireCurrentRecord: true, //加载数据第一次当前行改变不用触发
	WidgetStyle: "JGComponentContainer",
	initedListener: null,
	BorderColor: "#dadde0",
	_changeTabPosition: true //是否需要改变页签位置：当页签头切换或者移除时才不需要计算
});
isc.JGComponentContainer.addMethods({

	_initWidget: function () {
		this.initedListener = [];
		if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) {
			this.isOldWindow = true;
		}
		this.displayType = this.TabPageDisplayMode;
		this.className = this.WidgetStyle;
		if (this.BorderColor == "") {
			this.BorderColor = "#dadde0";
		}
		this.border = this.BorderWidth + " " + this.BorderStyles + " " + this.BorderColor;
		// 处理背景图
		this._dealBackgroundImage();
		var targetWidth = this.Width;
		var targetHeight = this.Height;

		if (this.MultiHeight == "content") {
			this.defaultHeight = 0;
		} else {
			this.defaultHeight = this.Height;
		}
		if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig() && this.Dock == "Fill") {
			targetWidth = "100%";
			targetHeight = "100%";
		}
		if (this.displayType == "Hide") {
			//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
			this._componentPanel = isc.ComponentPanel.create({
				jgComponentContainer: this,
				//类标识，在打开的组件中，跳到找开另一个组件时，要用到此标识来处理
				componentContainerClass: "ComponentPanel",
				className: this.WidgetStyle + "Tab",
				//		                border: "1px solid #dedede",//会有滚动条

				overflow: "auto",
				width: targetWidth,
				//height: this.HeightSet == "AutoHeight" ? "*" : this.Height,
				height: targetHeight,
				contents: ""
			});
			Object.defineProperty(this._componentPanel, "_percent_height", {
				configurable: false,
				set: function (newH) {
					if (null == newH) {
						this._percent_height = "100%";
					}
				},
				get: function () {
					return "100%";
				}
			});
			// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
			this.addChild(this._componentPanel);
		} else {
			var array = [];
			var hidenArray = {};
			if (this.tabs != null) {
				for (var i = 0; i < this.tabs.length; i++) {
					var arrayTemp = {};
					arrayTemp.title = this.tabs[i].title;
					arrayTemp.pane = {
						//ID:this.tabs[i].id
						id: this.tabs[i].id
					};
					arrayTemp.width = 100;
					array.push(arrayTemp)
					if (this.tabs[i].show != undefined && this.tabs[i].show == false) {
						hidenArray[i] = this.tabs[i].id;
					}
				}
			}
			//记录原始的高度,当恢复时用到


			var tabs = this;

			if ((this.HeightSet == "AutoHeight" && this.isOldWindow) || this.MultiHeight == "content") {
				var overflowSetting = "visible";
			} else {
				var overflowSetting = "hidden";
			}
			var _this = this;
			var tabSetParams = {
				overflow: overflowSetting,
				width: targetWidth, //this.Width - parseInt(this.BorderWidth) * 2,
				tabIndex: this.TabIndex,
				height: targetHeight, //this.Height - parseInt(this.BorderWidth) * 2,
				selectedTab: this.SelectedIndex,
				showMoreTab: false,
				paneMargin: 0,
				layoutTopMargin: 2,
				tabs: array,
				closeTabIconSize: 7,
				className: this.WidgetStyle + "Tab",
				paneContainerProperties: {
					overflow: "auto"
				},
				paneContainerClassName: this.WidgetStyle + "Container1",
				scrollerButtonSize: 30, //14,//右侧左右箭头单个按钮宽度   var _2 = (this._tabBar.orientation == isc.Layout.VERTICAL); width: _2 ? (this.tabBarThickness - this._tabBar.baseLineThickness) : (2 * _3),
				scrollerSrc: "[SKIN]jgscroll.png",
				closeTabIcon: "[SKIN]/TabSet/close20210521.png", //为了去除缓存
				pickerButtonSize: 42, //18,//最右侧下拉箭头 配合靠左样式达到靠右10px
				pickerButtonSrc: "[SKIN]jgpicker.png",
				tabBarThickness: 40, //34
				menuConstructor: "JGComponentContainerMenu", //改造右侧下拉箭头菜单
				$8f: function () {
					var _1 = this._tabBar;
					if (!_1)
						return 0;
					var _2 = _1.getMemberSizes();
					if (_2 == null || _2.length == 0)
						return 0;
					_2 = _2.sum() + (_1.membersMargin + _2.length * 8) * (_2.length - 1);
					var _3 = _1.vertical,
						_4 = _3 ? (_1.$td || 0) + (_1.$te || 0) : (_1.$tb || 0) + (_1.$tc || 0);
					return _2 + _4;
				},
				tabBarProperties: {
					layoutEndMargin: 0,
					layoutStartMargin: 0, //12,
					layoutBottomMargin: 0,
					layoutRightMargin: 0,
					membersMargin: 0, //不能用成员间距，否则选中（有背景色）的页签跟临近不选中的页签之间的间距不能加背景色
					//调整滚动条，使用浏览器自带滚动条
					topStyleName: this.WidgetStyle + "Top",
					baseLineProperties: {
						className: this.WidgetStyle + "Line",
						height: 1,
						overflow: "hidden"
					},
					baseLineThickness: 0,
					//		                    buttonConstructor:"JGComponentContainerTabButton",
					resizeMembers: function () { //重写此方法是因为新打开的页签头会被遮挡。原生的resizeMembers逻辑应该没执行完成，额外的处理逻辑需要异步内执行才有效
						var result = this.Super("resizeMembers", arguments);
						_this._resizeTabbarScroll(true, true);
						return result;
					},
					buttonProperties: {
						layoutAlign: "bottom",
						iconSpacing: 8, //11,
						capSize: 0,
						layoutLeftMargin: 12,
						layoutRightMargin: 6,
						titleStyle: isc.Browser.isIE ? this.WidgetStyle + "ButtonTop" : "", //IE设置样式
						src: "" //IE设置图片
					}
				},
				scrollerProperties: {
					baseStyle: this.WidgetStyle + "StretchImgButton",
					//重写此方法是因为sc点击右侧左右箭头最前面区域时会触发右箭头事件，是因为点击时非箭头区域的name是undefined不是emptyButton,导致此处一直都是右箭头有效
					inWhichPart: function () {
						if (this.vertical) {
							var _1 = this.inWhichPosition(this.$5x, this.getOffsetY())
						} else {
							var _2 = (this.ignoreRTL || !this.isRTL()) ? isc.Canvas.LTR : isc.Canvas.RTL;
							var _1 = this.inWhichPosition(this.$5x, this.getOffsetX(), _2)
						}
						var _3 = this.items[_1];
						if (_3 && (_3.name == undefined || _3.name == "emptyButton"))
							_3 = this.items[_1 + 1];
						return (_3 ? _3.name : null)
					}
				},
				tabPickerProperties: {
					baseStyle: this.WidgetStyle + "ImgButton"
				},
				tabBarControlLayoutDefaults: {
					styleName: this.WidgetStyle + "TabBar"
				},
				//sc升级后，先用sc自带的默认样式
				//			                simpleTabBaseStyle: this.WidgetStyle + "Button", //谷歌设置样式
				//		                simpleTabBaseStyle: null,//this.TabHeaderStyle != "TabPage" ? this.WidgetStyle + "Button" : undefined, //谷歌设置样式
				tabSelected: function () {
					_this._changeTabPosition = false;
					var tabID = this.getSelectedTab().pane.getID();
					var selectTab = this.getSelectedTab();
					if (typeof (tabs._setCurrentRecordByTab) == "function") {
						tabs._setCurrentRecordByTab(selectTab);
					}
					if (!this.getSelectedTab().pane.isDrawn()) {
						this.getSelectedTab().pane.draw();
					}
					if (!tabs._selectedTabId || tabs._selectedTabId != tabID) {
						if (selectTab.pane._innerComponent && !selectTab.pane._innerComponent.destroyed && selectTab.pane._innerComponent.setVisible)
							selectTab.pane._innerComponent.setVisible(true)
						tabs._callEvent(tabs, 'tabChange');
					}
					tabs._selectedTabId = tabID;
					//当为自适应高度时，组件容器的高度 = 所选中组件的高度 + tabBar的高度
					if (this.getSelectedTab().pane.calculateContainerHeight) {
						this.getSelectedTab().pane.calculateContainerHeight();
						if (this.parentElement.MultiHeight == "content") {
							var innerComponent = this.getSelectedTab().pane._innerComponent;
							if (innerComponent && innerComponent.MultiWidth == "space") {
								this.getSelectedTab().pane.setWidth("100%");
								innerComponent.setWidth("100%");
							}
						}
					}
					var tabArray = this.tabs;
					for (var i = 0; i < tabArray.length; i++) {
						var tab = tabArray[i];
						if (tab && tab.pane)
							if (tab.pane._innerComponent && !tab.pane._innerComponent.destroyed && tab.pane._innerComponent.setVisible && tab.pane.getID() != tabID)
								tab.pane._innerComponent.setVisible(false)
					}
				},
				showTabPicker: true, //组件容器右侧功能按钮启动
				placeControlLayout: function (controlSize) {
					//重新计算TabBar宽度
					if (this.tabBarPosition == isc.Canvas.TOP) {
						var controlSize = controlSize + tabs.getControlWidth(isc.Element.getStyleEdges(this.tabBarControlLayout.styleName));
						this.Super("placeControlLayout", controlSize);
					}
				}
			}
			if (this.TabHeaderStyle != "TabPage") {
				tabSetParams.simpleTabBaseStyle = this.WidgetStyle + "Button";
			}
			var tabSet = isc.VTabSet.create(tabSetParams);
			if (this.TabPageDisplayMode == "Auto" && tabSet.children) { //自动页签时，去掉页签底下的线条，不然只打开一个窗体时，这个线条会跟窗体内容重叠
				var tabSetChildren = tabSet.children;
				for (var i = 0, len = tabSetChildren.length; i < len; i++) {
					var tsChildId = tabSetChildren[i].ID;
					if (tsChildId && tsChildId.indexOf("tabBar_baseLine") != -1) { //暂无具体的标识
						tabSet.children.splice(i, 1);
						break;
					}
				}
			}
			this.tabSetObj = tabSet;
			var tabThis = this;
			tabThis._funcOnClick = tabSet.closeClick;
			tabSet.closeClick = function (tabPage) {
				var success = (function (tmp_this, tmp_arguments) {
					return function () {
						if (tabPage.pane) {
							var pane = tabPage.pane;
							pane.showModal = null;
							pane.hideModal = null;
							pane.component = null;
							pane.close = null;
							pane.jgComponentContainer = null;
						}
						tabThis._funcOnClick.apply(tmp_this, tmp_arguments);
						if (tabThis.displayType === 'Auto' && tabThis.tabSetObj.tabs.length == 1) {
							tabThis.setTabBarVisiable(false);
						}
						//当为自适应高度时，当全部页签都关闭后，把高度设置为原始值
						if (((tabThis.HeightSet == "AutoHeight" && tabThis.isOldWindow) || tabThis.MultiHeight == "content") && tabThis.tabSetObj.tabs.length == 0) {
							tabThis.setHeight(tabThis.defaultHeight);
							tabThis.tabSetObj.setHeight(tabThis.defaultHeight);
							tabThis.setVisible(false);
						}
					}
				})(this, arguments);
				tabPage.closeBack(success);
				//              tabThis._callEvent(tabThis,"formCloseBefore");
			}

			//注册关闭事件
			tabSet.onCloseClick = function (tabButton) {
				tabThis._callEvent(tabThis, 'closeClick', tabButton);
			}

			for (var el in hidenArray) {
				for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
					if (hidenArray[el] == this.tabSetObj.tabs[i].pane.id) {
						this.hidenID[this.tabSetObj.tabs[i].pane.id] = this.tabSetObj.getTabNumber(this.tabSetObj.tabs[i]);
					}
				}
			}

			for (var el in this.hidenID) {
				var tempTab = null;
				for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
					if (el == this.tabSetObj.tabs[i].pane.id) {
						tempTab = this.tabSetObj.tabs[i];
					}
				}
				tempTab.pane.hide();
				this.tabSetObj.tabBar.getButton(tempTab).hide();
			}

			var showItemIndex = 0;
			var temp = 0;
			var temHidenID = this.hidenID;
			for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
				var state = 0;
				for (var el in temHidenID) {
					if (el == this.tabSetObj.tabs[i].pane.id) {
						state = 0;
						break
					} else {
						state += 1;
						temp = this.tabSetObj.getTabNumber(this.tabSetObj.tabs[i]);
					}
				}
				if (state != 0) {
					showItemIndex = temp
					break;
				}
			}
			this.tabSetObj._tabBar.selectTab(showItemIndex);

			// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
			this.addChild(this.tabSetObj);

			this.setTabBarVisiable(false);

		}
		if (this.MultiHeight == "content") {
			var _this = this;
			setTimeout(function () {
				_this.setVisible(false);
			}, 0)          	
		}
		this._initEventAndDataBinding();
		this.initUIEvent();
	},
	/**
	 *兼容处理ie9以下因div使用滤镜造成容器内控件无法获取焦点问题 
	 */
	_dealBackgroundImage: function () {
		var backgroundRepeat = "no-repeat;-moz-background-size: 100% 100%;-webkit-background-size: 100% 100%;-o-background-size: 100% 100%;background-size: 100% 100%;";
		var src = this.getStaticImagePath(this.ImageValue); //兼容原型工具
		if (isc.Browser.isIE && isc.Browser.version <= 8) { //只有ie9以下版本才需要特殊处理
			backgroundRepeat += "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + src + ",sizingMethod=scale)";
			var backgroundImg = isc.Canvas.create({
				autoDraw: false,
				width: this.Dock === "Top" || this.Dock === "Bottom" || this.Dock === "Fill" ? "100%" : this.Width, //处理IE8下泊靠后控件宽度不正确
				height: this.Dock === "Left" || this.Dock === "Right" || this.Dock === "Fill" ? "100%" : this.Height, //处理IE8下泊靠后控件高度不正确
				backgroundImage: this.ImageValue,
				backgroundRepeat: backgroundRepeat,
				contents: "",
				canFocus: false, //是否可获取焦点
				showFocusOutline: false
			});
			this.addChild(backgroundImg);
		} else {
			this.backgroundImage = src;
			this.backgroundRepeat = backgroundRepeat;
		}
	},
	//2019-11-03 liangzc:此方法是监听容器大小改变时主动触发子窗体的大小改变，场景：div调用窗体域上的resizeTo方法，如果窗体内有组件容器，则组件容器内部的窗体不会自适应
	resized: function () {
		this.Super("resized", arguments);
		if (this.displayType == "Hide" && this._componentPanel) {
			var componentPanel = this._componentPanel;
			var components = componentPanel.children;
			if (components && components.length > 0) {
				for (var i = 0, len = components.length; i < len; i++) {
					components[i].resizeTo(componentPanel.width, componentPanel.height);
				}
			}
		}
	},
	/**
	 * 查找tab的ID
	 *
	 * @param {str}
	 */
	getTabID: function (num) {
		return this.tabSetObj.getTabPane(num).id;
	},

	/**
	 * 查找tab的title
	 *
	 * @param {str}
	 */
	getTabTitle: function (num) {
		return this.tabSetObj.getTabPane(num).title;
	},

	/**
	 * 获取选中tab的ID
	 *
	 * @param {str}
	 */
	getSelectTabID: function () {
		return this.tabSetObj.getTabPane(this.getSelectedTab()).id;
	},

	/**
	 * 获取选中tab的title
	 *
	 * @param {str}
	 */
	getSelectTabTitle: function () {
		return this.tabSetObj.getTabPane(this.tabSetObj.getSelectedTab()).title;
	},

	setSelectTabTitle: function (title) {
		this.tabSetObj.setTabTitle(this.tabSetObj.getSelectedTab(), title);
	},

	onTabEvent: function (tab, eventName, handler) {
		tab[eventName] = handler;
	},

	/**
	 * 隐藏一个tab
	 *
	 * @param {str}
	 */
	hideItem: function (id) {
		var tabs = this.findTabByID(id);
		if (tabs) {
			this.hidenID[tabs[0].pane.id] = this.tabSetObj.getTabNumber(tabs[0]);
			var showItemIndex = 0;
			var temp = 0;
			var temHidenID = this.hidenID;
			for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
				var state = 0;
				for (var el in temHidenID) {
					if (el == this.tabSetObj.tabs[i].pane.id) {
						state = 0;
						break
					} else {
						state += 1;
						temp = this.tabSetObj.getTabNumber(this.tabSetObj.tabs[i]);
					}
				}
				if (state != 0) {
					showItemIndex = temp
					break;
				}
			}
			tabs[0].pane.hide();
			this.tabSetObj.tabBar.getButton(tabs[0]).hide();
			this.tabSetObj._tabBar.selectTab(showItemIndex);
		}
	},

	/**
	 * 显示一个tab
	 *
	 * @param {str}
	 */
	showItem: function (id) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return;
		}
		var tabs = this.findTabByID(id)
		if (tabs) {
			delete(this.hidenID[tabs[0].pane.id])
			this.tabSetObj.tabBar.getButton(tabs[0]).show();
			tabs[0].pane.show();
			this.tabSetObj._tabBar.selectTab(this.tabSetObj
				.getTabNumber(tabs[0]));
		}
	},

	/**
	 * 通过uuCode的名称，查找tab
	 *
	 * @param {str}
	 */
	findTabByUuCode: function (uuCode) {
		var tab = null;
		if (this.displayType == "Hide") {
			tab = this._componentPanel;
		} else {
			for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
				var tabPaneUuCode = this.tabSetObj.tabs[i].uucode;
				if (uuCode == tabPaneUuCode) {
					tab = this.tabSetObj.tabs[i];
				}
			}
		}
		return tab;
	},

	/**
	 * 通过ID的名称，查找tab
	 *
	 * @param {str}
	 */
	findTabByID: function (id) {
		var tab = null;
		for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
			var tabPaneId = this.tabSetObj.tabs[i].pane.id;
			//if (tabPaneId.indexOf("|") != -1) {
			//    tabPaneId = tabPaneId.split("|")[0];
			//}
			if (id == tabPaneId) {
				tab = [this.tabSetObj.tabs[i]];
			}
		}
		return tab;
	},
	
	addComponent: function (params) {
		var title = params.title;
		var uuCode = params.identityId;
		var newComponentCode = params.newComponentCode;
		var newWindowCode = params.newWindowCode;
		var newScopeId = params.newScopeId;
		var _containerCode = params.containerCode;
		var _oldScopeId = params.oldScopeId;
		var callback = params.callback;
		var readyFunc = params.readyFunc;
		var closeFunc = params.closeFunc;
		var destroyCallback = params.destroyCallback;
		var beforeOpen = params.beforeOpen;
		var beforeClose = params.beforeClose;

		var showModalFunc = function (msg) {
			if (this.modal) {
				this.modal.setMsg(msg);
			} else {
				this.modal = isc.JGProgressbar.create({
					msg: msg
				});
				this.addChild(this.modal);
			}
			this.modal.show();
		};
		var hideModalFunc = function () {
			if (this.modal) {
				//this.removeChild(this.modal);
				this.modal.hide();
			}
		};

		if (this.HeightSet == "AutoHeight" && this.isOldWindow) {
			var autoheight = true;
		} else {
			var autoheight = false;
		}
		if (this.displayType == "Hide") {
			var _this = this;
			var successback = function () {
				var tmpThis = _this;
				tmpThis.clearComponent();
				tmpThis._componentPanel.uucode = uuCode;
				tmpThis._componentPanel.componentTitle = title;
				tmpThis._componentPanel.destroyCallback = destroyCallback;
				var _canvas = tmpThis._componentPanel;
				if (autoheight) {
					//自动高度需要每次都重新设置原始高度
					var height = tmpThis.isDrawn() ? tmpThis.getHeight() : tmpThis.Height;
					_canvas.setHeight(height);
				}

				_canvas.showModal = showModalFunc;
				_canvas.hideModal = hideModalFunc;
				//_canvas.showModal("组件加载中，请稍候...");
				var canvasID = _canvas.ID;
				var containerID = tmpThis.ID;
				if (typeof callback == "function") {
					var callbackId = containerID + "_addComponentCallback";
					window[callbackId] = callback;
					setTimeout(function () { //放入异步，防止后续逻辑组织渲染
						var cb = window[callbackId];
						if (typeof (cb) == "function") {
							var canvas = window[canvasID];
							if (canvas) { //存在才执行回调，不存在说明该页签已经被关闭了
								var cn = window[containerID];
								//                              cb(canvas, null, cn);
								cb({
									"canvas": canvas,
									"tab": null,
									"container": cn,
									"newWindowCode": newWindowCode,
									"readyFunc": readyFunc,
									"containerCode": _containerCode,
									"oldScopeId": _oldScopeId,
									"closeFunc": closeFunc,
									"newScopeId": newScopeId
								});

								//调整滚动条。然后重新计算高度
								try {
									cn._componentPanel.calculateContainerHeight();
								} catch (e) {}
								//delete window[callbackId];
							}
							window[callbackId] = null;
						}
					}, 1);
				}
			}
			if (typeof (beforeOpen) == 'function' && _this._componentPanel.children && _this._componentPanel.children.length > 0) {
				var oldScopeId;
				for (var __i = 0, l = _this._componentPanel.children.length; __i < l; __i++) {
					oldScopeId = _this._componentPanel.children[__i].scopeId;
					if (oldScopeId) { //没有scopeId，认为是链接地址打开，不处理
						break; //因为是隐藏的容器，所以只有一个是正确的。
					}
				}
				if (oldScopeId) {
					beforeOpen(oldScopeId, successback);
				} else {
					successback();
				}
			} else {
				successback();
			}
		} else {
			var _canvas = isc.ComponentCanvas.create({
				//调整滚动条，使用浏览器自带滚动条
				showCustomScrollbars: false,
				hideUsingDisplayNone: true,
				overflow: autoheight ? "visible" : "auto",
				jgComponentContainer: this,
				height: "100%",
				width: "100%",
				contents: ''
			});
			_canvas.showModal = showModalFunc;
			_canvas.hideModal = hideModalFunc;
			var _uuCode = uuCode;
			var _this = this;
			var tabs = [{
				title: title,
				//scopeId:component.getScopeId(),
				canClose: true,
				pane: _canvas,
				width: 70,
				uucode: uuCode,
				componentCode: newComponentCode,
				windowCode: newWindowCode,
				scopeId: newScopeId, //右键刷新
				closeBack: function (successBack, errorBack) {
					if (typeof (beforeClose) == 'function') {
						beforeClose(successBack, errorBack);
					}
				},
				show: function () {
					this.Super("show", arguments);
					if (_this.isHideCloseTab()) {
						return;
					}
					var globalCode = this.getCanvasName();
					$("#" + globalCode).unbind("contextmenu").bind("contextmenu", function (e) {
						$(".RightMenuTitle>ul").html("<li>关闭当前页</li><li>关闭全部</li><li>关闭其它页</li>");
						$('#mask').show();
						$("#rightMenu_div").css({
							top: e.pageY,
							left: e.pageX
						})

						$(".RightMenuTitle li").unbind("click").bind("click", function () {
							$('#mask').hide();;
							$('#rightMenu_div').css({
								top: -1000,
								left: -1000
							});
							var _title = $(this).html();
							var theUucode = _uuCode;
							var theTabBar = _this;
							var theTabSet = _this.tabSetObj;
							var theJGComponentContainer = _this;
							if ("刷新当前容器" == _title) {
								if (theJGComponentContainer) {
									//theJGComponentContainer._callEvent(theJGComponentContainer, 'reload',_newScopeId);
								}
							} else if ("关闭当前页" == _title) {
								if (theJGComponentContainer) {
									var allApply = true; //是否所有窗体都没有取消关闭
									var children_dtds = [];
									var tabs = theTabSet.tabs;
									var currentTabSet;
									for (var i = 0; i < tabs.length; i++) {
										if (tabs[i].uucode == theUucode) {
											currentTabSet = tabs[i];
											break;
										}
									}
									if (currentTabSet) {
										//先执行对应页签的窗体关闭前事件
										var c_dtd = $.Deferred();
										children_dtds.push(c_dtd);
										var success = function () {
											c_dtd.resolve();
										}
										var error = function () {
											allApply = false;
											c_dtd.resolve();
										}
										currentTabSet.closeBack(success, error);
										$.when.apply($.when, children_dtds).done((function () {
											return function () {
												if (allApply) { //当前页签没有取消窗体关闭时才进行关闭页签动作
													theTabSet.onCloseClick(currentTabSet);
													theJGComponentContainer.removeTabsByUucode(theUucode);
												}
											}
										})());
									}
								}
							} else if ("关闭全部" == _title) {
								if (theJGComponentContainer) {
									var allApply = true; //是否所有窗体都没有取消关闭
									var tabs = theTabSet.tabs;
									var children_dtds = [];
									//先执行每个页签的窗体关闭前事件
									for (var i = 0; allApply && i < tabs.length; i++) {
										var c_dtd = $.Deferred();
										children_dtds.push(c_dtd);
										var success = function () {
											c_dtd.resolve();
										}
										var error = function () {
											allApply = false;
											c_dtd.resolve();
										}
										tabs[i].closeBack(success, error);
									}
									$.when.apply($.when, children_dtds).done((function () {
										return function () {
											if (allApply) { //所有页签都没有取消窗体关闭时才进行关闭页签动作
												for (var i = 0; i < tabs.length; i++) {
													theTabSet.onCloseClick(tabs[i]);
												}
												theJGComponentContainer.removeAllTabs();
											}
										}
									})());
								}
							} else if ("关闭其它页" == _title) {
								if (theJGComponentContainer) {
									var allApply = true; //是否所有窗体都没有取消关闭
									var tabs = theTabSet.tabs;
									var children_dtds = [];
									//先执行每个页签的窗体关闭前事件
									for (var i = 0; allApply && i < tabs.length; i++) {
										if (tabs[i].uucode != theUucode) {
											var c_dtd = $.Deferred();
											children_dtds.push(c_dtd);
											var success = function () {
												c_dtd.resolve();
											}
											var error = function () {
												allApply = false;
												c_dtd.resolve();
											}
											tabs[i].closeBack(success, error);
										}
									}
									$.when.apply($.when, children_dtds).done((function () {
										return function () {
											if (allApply) { //所有页签都没有取消窗体关闭时才进行关闭页签动作
												for (var i = 0; i < tabs.length; i++) {
													if (tabs[i].uucode != theUucode) {
														theTabSet.onCloseClick(tabs[i]);
													}
												}
												theJGComponentContainer.removeOtherTabsByUucode(theUucode);
											}
										}
									})());
								}
							}
						});
						e.stopPropagation()
						return false;
					});
				}
			}];
			if (this.isHideCloseTab()) {
				tabs[0].canClose = false;
			}
			this._addTabCfg(tabs);
			var tabNum = this.tabSetObj.getTabNumber(tabs[0]);
			this.tabSetObj._tabBar.selectTab(tabNum);

			//_canvas.showModal("组件加载中，请稍候...");
			var canvasID = _canvas.ID;
			var containerID = this.ID;
			var tabID = containerID + "_tabID";
			//		            window[tabID] = tabs[0];
			if (typeof callback == "function") {
				var callbackId = containerID + "_addComponentCallback";
				//		                window[callbackId] = callback;
				var cbFunc = (function (_callbackId, _callback, canvasID, containerID, tab, newWindowCode, readyFunc, _containerCode, _oldScopeId, closeFunc, newScopeId) {
					return function () {
						var cb = _callback;
						if ((typeof (cb) == "function") && window[canvasID]) { //tab存在在触发回调，不存在则说明该页签已经被关闭了
							var canvas = window[canvasID];
							var cn = window[containerID];
							//delete window[tabID];
							//                      cb(canvas, tab, cn);
							cb({
								"canvas": canvas,
								"tab": tab,
								"container": cn,
								"newWindowCode": newWindowCode,
								"readyFunc": readyFunc,
								"containerCode": _containerCode,
								"oldScopeId": _oldScopeId,
								"closeFunc": closeFunc,
								"newScopeId": newScopeId
							});
							//选中某页
							try {
								//cn.tabSetObj._tabBar.tabs[tabNum].pane.adjustOverflow("loadComponent");
								cn.tabSetObj._tabBar.tabs[tabNum].pane.calculateContainerHeight();
							} catch (e) {}; //重新计算布局

							//delete window[callbackId];
						}
						window[_callbackId] = null;
					}
				})(callbackId, callback, canvasID, containerID, tabs[0], newWindowCode, readyFunc, _containerCode, _oldScopeId, closeFunc, newScopeId);
				setTimeout(cbFunc, 1)
			}
		}
	},

	_addTabCfg: function (tabs, isUrl) {
		var container = tabs[0];
		if (this.displayType === 'Auto' && this.tabSetObj.tabs.length == 0) {
			this.tabSetObj.addTabs(tabs);
			this.tabSetObj.tabBar.getButton(container).hide();
			this.setTabBarVisiable(false, isUrl);
		} else if (this.displayType === 'Hide') {
			this.tabSetObj.addTabs(tabs);
			this.tabSetObj.tabBar.getButton(container).hide();
			this.setTabBarVisiable(false, isUrl);
		} else {
			this.tabSetObj.addTabs(tabs);
			this.tabSetObj.tabBar.getButton(this.tabSetObj.tabs[0]).show();
			this.setTabBarVisiable(true, isUrl);
		}
	},
	_resizeTabbarScroll: function () { //重新滚动使得选中的页签头能完全显示出来
		if (this._changeTabPosition && this.tabSetObj && this.tabSetObj.tabBarControlLayout && this.tabSetObj.tabBarControlLayout.isVisible()) {
			var _this = this;
			setTimeout(function () { //使用异步原因是因为原生的resizeMembers还没完全执行完成，异步后才能让页签头完全显示
				var memberSizes = _this.tabSetObj.tabBar.getMemberSizes();
				if (!memberSizes || memberSizes.length == 0) {
					return;
				}
				var sum = 0;
				for (var i = 0, len = memberSizes.length; i < len; i++) {
					sum += memberSizes[i];
				}
				var width = Number(_this.tabSetObj._tabBar.getWidth());
				if (isNaN(width) || width <= 0) {
					return;
				}
				_this.tabSetObj._tabBar.scrollTo(sum - width, 0);
			}, 1);
		}
	},
	_destroyHideDisplayChildren: function () {
		if (!this._componentPanel) return;
		var children = this._componentPanel.children;
		if (children) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child) {
					if (child.isUrlCanvas) {
						child.hide();
					} else {
						this._componentPanel.removeChild(child);
						this._componentPanel.component = null;
						this._componentPanel.componentTitle = null;
						child.destroy();
						if (child.closeCallback) {
							child.closeCallback();
						}
						i--;
					}
				}
			}
		}
	},
	/**
	 * 添加一个tab
	 *
	 * @param {str}
	 */
	addTabs: function (tabss) {
		var beforeClose = tabss.beforeClose;
		if (this.displayType == "Hide") {
			//如果是始终都是隐藏页签的方式时，每次增加页时都先进行清空操作
			//this.removeAllTabs();
			//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
			//先清空child
			this._destroyHideDisplayChildren();
			var cv = null;
			if (tabss.contents) {
				cv = isc.Canvas.create({
					contents: tabss.contents,
					contentsType: "page",
					height: '100%',
					width: '100%'
				})
				this._componentPanel.componentTitle = tabss.title;
				this._componentPanel.addComponent(cv);
				this._componentPanel.id = tabss.id;
				this._componentPanel.calculateContainerHeight()
			} else {
				this.tabSetObj && this.tabSetObj.setHeight(this._height);
				this.setHeight(this._height);
				this.setVisible(true);
				var url = tabss.url;
				var cvs = this._componentPanel._canvasArray;
				if (!cvs) {
					cvs = [];
					this._componentPanel._canvasArray = cvs;
				}
				var hasFound = false;
				for (var i = 0, l = cvs.length; i < l; i++) {
					var canvas = cvs[i];
					if (canvas.contentsURL == url) {
						hasFound = true;
						if (!canvas.isVisible()) {
							canvas.show();
						}
						canvas.bringToFront();
					} else {
						canvas.hide();
					}
				}
				if (!hasFound) {
					cv = isc.Canvas.create({
						contentsURL: url,
						isUrlCanvas: true,
						contentsType: "page",
						height: "100%",
						width: "100%"
					});
					cvs.push(cv);
					this._componentPanel.componentTitle = tabss.title;
					this._componentPanel.addComponent(cv);
					this._componentPanel.id = tabss.id;
				}
				//		                this._componentPanel.calculateContainerHeight();
			}
		} else {
			var isComponent = tabss.isComponent;
			//var component = tabss.component;
			var id = tabss.id;
			var title = tabss.title;
			var uucode = tabss.uucode;
			var tabs = '';
			if (isComponent) {
			} else {

				this.tabSetObj && this.tabSetObj.setHeight(this._height);
				this.setHeight(this._height);
				this.setVisible(true);
				var cv = null;
				if (tabss.contents) {
					cv = isc.Canvas.create({
						contents: tabss.contents,
						contentsType: "page",
						height: '100%'
					})
				} else {
					cv = isc.Canvas.create({
						contentsURL: tabss.url,
						contentsType: "page",
						height: '100%'
					})
				}
				tabs = [{
					title: title,
					uucode: uucode,
					canClose: true,
					pane: cv,
					closeBack: function (successBack, errorBack) {
						if (typeof (beforeClose) == 'function') {
							beforeClose(uucode);
						}
						if (typeof (successBack) == 'function') {
							successBack.apply(this, arguments);
						}
					},
					width: 70
				}];
			}
			this._addTabCfg(tabs, true);
			var container = tabs[0];
			this.tabSetObj._tabBar.selectTab(this.tabSetObj.getTabNumber(container));
		}
	},
	/**
	 * 设置激活的tab分页的title，获取指定tab分页的标题
	 *
	 * @param {String}
	 *            param 指定分页的id或索引
	 * @param {String}
	 *            url 指定要设置新的内容链接
	 */
	reloadSingleTab: function (param, url, isTitle, isComponent) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return;
		}
		// 如果是数字就说明是索引,如果不是数字就是ID
		if (!isComponent) {
			if (!isNaN(param)) {
				this.tabSetObj.getTab(param).pane.setContentsURL(url);
				this.tabSetObj._tabBar.selectTab(this.tabSetObj.getTab(param));
			} else if (isTitle) {
				this.tabSetObj.tabs.find('uucode', param).pane.setContentsURL(url);
				this.tabSetObj._tabBar.selectTab(this.tabSetObj.tabs.find('uucode', param));
			} else {
				var theTabs = this.findTabByID(param);
				var theTab = theTabs ? theTabs[0] : null;
				if (theTab) {
					theTab.pane.setContentsURL(url);
					this.tabSetObj._tabBar.selectTab(theTab);
				}
			}
		} else {
			// var test=this.tabSetObj.tabs
			// .find('title', param);
		}

	},

	/**
	 * 通过title的名称，选中tabs
	 *
	 * @param {str}
	 */
	selectedByName: function (uucode) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return;
		}
		// 处理跨构建打开无scopeId
		var comp = this.tabSetObj.tabs.find("uucode", uucode);
		this.tabSetObj._tabBar.selectTab(comp);
		return comp && comp.pane && comp.pane.getCanvasName && comp.pane.getCanvasName();
	},

	/**
	 * 通过title的名称判断页签是否存在
	 *
	 * @param {str}
	 */
	exists: function (title) {
		var isTrue = false;
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			var children = this._componentPanel.component;
			if (children && this._componentPanel.componentTitle == title) {
				return true;
			} else {
				return false;
			}
		}
		var isObj = this.tabSetObj.tabs.find('title', title);
		if (isObj == null) {
			isTrue = false
		} else {
			isTrue = true;
		}
		return isTrue;
	},

	removeTab: function (tabID) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return;
		}
		var tabs = this.findTabByID(tabID);
		if (tabs) {
			this.tabSetObj.removeTab(tabs);
		}
	},

	removeAllTabs: function () {
		var tabs = this.tabSetObj.tabs;
		if (tabs && tabs.length > 0) {
			this.tabSetObj.removeTabs(tabs);
		}
	},

	//根据title，删除指定的页签
	removeTabByTitle: function (title) {
		var theTab = this.getTabObjectByTitle(title);
		if (theTab) {
			this.tabSetObj.removeTab(theTab);
		}
	},

	//删除指定页签外的其它页
	removeOtherTabs: function (theTab) {
		var selectedTabId = "";
		if (theTab) {
			selectedTabId = theTab.uucode;
		}
		var tabs = this.tabSetObj.tabs;
		var otherTabs = [];
		for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
			var tab = this.tabSetObj.tabs[i];
			var tabPaneId = tab.uucode;
			if (tabPaneId != selectedTabId) {
				otherTabs.push(tab)
			}
		}
		if (otherTabs.length > 0) {
			this.tabSetObj.removeTabs(otherTabs);
		}
	},

	//删除选中项的其它另外的页
	removeOtherTabsBySelected: function () {
		var theSelectedTab = this.tabSetObj.getSelectedTab();
		this.removeOtherTabs(theSelectedTab);
	},

	//根据指定的项，删除其它另外的页
	removeOtherTabsByTitle: function (title) {
		var theTab = this.getTabObjectByTitle(title);
		this.selectedByName(title);
		this.removeOtherTabs(theTab);
	},

	//根据Uucode的页
	removeTabsByUucode: function (uucode) {
		var theTab = this.getTabObjectByUucode(uucode);
		this.selectedByName(uucode);
		this.removeTab(theTab);
	},

	//根据Uucode的页
	removeOtherTabsByUucode: function (uucode) {
		var theTab = this.getTabObjectByUucode(uucode);
		this.selectedByName(uucode);
		this.removeOtherTabs(theTab);
	},

	//根据uucode查找Tab
	getTabObjectByUucode: function (uucode) {
		if (this.displayType == "Hide") {
			return this._componentPanel;
		}
		return this.tabSetObj.tabs.find('uucode', uucode);
	},

	getTabPageDisplayMode: function () {
		return this.displayType;
	},

	setTabPageDisplayMode: function (displayType) {
		this.displayType = displayType;
	},

	getTabObjectByTitle: function (title) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return this._componentPanel;
		}
		return this.tabSetObj.tabs.find('title', title);
	},

	selectedByIndex: function (index) {
		this.SelectedIndex = index;
		this.tabSetObj._tabBar.selectTab(index);
	},
	enableTab: function (index) {
		this.tabSetObj.enableTab(index);
	},
	closeSingleTab: function (index) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return;
		}
		this.tabSetObj.removeTab(this.findTabByID(index));
	},
	disableTab: function (index) {
		this.tabSetObj.disableTab(index);
	},
	selectTab: function (index) {
		this.tabSetObj.selectTab(index);
	},
	selectTabByCondition: function (conditions) { //根据条件选中页签
		if (this.tabSetObj && this.tabSetObj.tabs) {
			var tabs = this.tabSetObj.tabs;
			var targetTab;
			for (var i = 0, len = tabs.length; i < len; i++) {
				var tab = tabs[i];
				targetTab = tab;
				for (var key in conditions) {
					if (tab.hasOwnProperty(key) && conditions[key] != tab[key]) {
						targetTab = null;
						break;
					}
				}
				if (targetTab) {
					this.selectTab(i);
					break;
				}
			}
		}
	},
	getTabObject: function (index) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			return this._componentPanel;
		}
		return this.tabSetObj.getTabObject(index);
	},
	getTabNumber: function (index) {
		this.tabSetObj.getTabNumber(index);
	},
	showTab: function (index) {
		this.tabSetObj._showTab(index);
	},
	tabSelected: function (index) {
		this.tabSetObj._tabSelected(index);
	},
	getSelectedTab: function () {
		return this.tabSetObj.getSelectedTab();
	},
	getSelectedTabNumber: function () {
		this.tabSetObj.getSelectedTabNumber();
	},
	getTabBar: function () {
		this.tabSetObj.getTabBar();
	},
	setTabTitle: function (index, title) {
		this.tabSetObj.setTabTitle(index, title);
	},
	setTabTitleByCondition: function (newTitle, conditions) { //根据条件设置目标页签的标题
		if (this.tabSetObj && this.tabSetObj.tabs) {
			var tabs = this.tabSetObj.tabs;
			var targetTab;
			for (var i = 0, len = tabs.length; i < len; i++) {
				var tab = tabs[i];
				targetTab = tab;
				for (var key in conditions) {
					if (conditions[key] != tab[key]) {
						targetTab = null;
						break;
					}
				}
				if (targetTab) {
					this.setTabTitle(i, newTitle);
					break;
				}
			}
		}
		return -1;
	},
	setTabDisabled: function (index, isboolea) {
		this.tabSetObj.setTabDisabled(index, isboolea);
	},

	// 放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		// this.tabSetObj.setWidth(percentWidth);
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			this._componentPanel.setWidth("100%");
		} else {
			this.tabSetObj.setWidth("100%");
		}

	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		// this.tabSetObj.setHeight(percentHeight);
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			this._componentPanel.setHeight("100%");
		} else {
			this.tabSetObj.setHeight("100%");
		}
	},

	/**
	 * 修改标签头的显示状态
	 * @param show
	 */
	setTabBarVisiable: function (show, isUrl) {

		var hiddenTabBarHeight = 1; //处于隐藏状态的导航条的高度

		var tabBarHeight = this.tabSetObj.tabBar.getHeight();
		if (show) {
			if (tabBarHeight == hiddenTabBarHeight) { //增加判断,如果目前标签栏处于显示隐藏状态才进行显示
				this.tabSetObj.tabBar.setHeight(this._tabbarHeigh);
				//this.tabSetObj.tabBar.draw();
				this.tabSetObj.tabBar.show();
				var container = this.tabSetObj.paneContainer.getHeight();


				if (this.MultiHeight == "content" && !isUrl) {
					this.tabSetObj.paneContainer.setHeight(container + this._tabbarHeigh);
					this.tabSetObj.setHeight(container + this._tabbarHeigh);
					this.setHeight(container + this._tabbarHeigh)
				}
			}

		} else {
			//var tabBarHeight = this.tabSetObj.tabBar.getHeight();
			if (tabBarHeight != hiddenTabBarHeight) { //增加判断,如果目前标签栏出于显示状态才进行隐藏.
				this._tabbarHeigh = this.tabSetObj.tabBar.getHeight();
				//一开始可能会隐藏很多次标签头,所以如果标签头已经隐藏,再次隐藏的话,原有的高度就会记错.
				this.tabSetObj.tabBar.setHeight(hiddenTabBarHeight);
				this.tabSetObj.tabBar.hide();
				var container = this.tabSetObj.paneContainer.getHeight();

				if (this.MultiHeight == "content" && !isUrl) {
					this.tabSetObj.paneContainer.setHeight(container - this._tabbarHeigh);
					this.tabSetObj.setHeight(container - this._tabbarHeigh);
					this.setHeight(container - this._tabbarHeigh)
				}

			}

		}

	},

	_getId: function (id) {
		return "wd_" + id
	},

	getComponent: function (title) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			var children = this._componentPanel.component;
			if (children && this._componentPanel.componentTitle == title) {
				return children;
			} else {
				return null;
			}
		}
		var isObj = this.tabSetObj.tabs.find('title', title);
		if (isObj) {
			return isObj.pane.children[0]
		}
		return null;
	},

	getComponentById: function (id) {
		//性能优化，放到流布局中性能有问题，如果是始终都是隐藏页签的方式时，用简单的Canvas包装就可以了，不用tabSet
		if (this.displayType == "Hide") {
			var children = this._componentPanel.component;
			if (children && children.widgetId == id) {
				return children;
			} else {
				return null;
			}
		}
		var tabs = this.findTabByID(id);
		if (tabs && tabs.length > 0) {
			return tabs[0].pane.component;
		}
		return null;
	},

	_setHeight: function (val) {
		// 暂时该功能只能用于打开网页窗体的组建容器
		this.Super("setHeight", arguments);

		// 设置页签内高度
		if (this.displayType == "Hide") {
			this._componentPanel.setHeight(val);

			// TODO: 返回被打开窗体高度
			// var $childWindow = $(this._componentPanel.getClipHandle()).children();
			// if($childWindow.length > 0)
			//     return $childWindow.height();
		} else
			this.tabSetObj && this.tabSetObj.setHeight(val);

		// 返回被打开窗体高度
		$(this._componentPanel.getClipHandle()).children().height()
	},

	_clearHideMode: function () {
		this._destroyHideDisplayChildren();
		if (this._componentPanel && this._componentPanel.destroyCallback) {
			var destroyFunc = this._componentPanel.destroyCallback;
			destroyFunc();
		}
	},

	_clear: function () {
		if (this.tabSetObj) {
			var tabs = this.tabSetObj.tabs;
			if (tabs && tabs.length > 0) {
				for (var i = 0; i < tabs.length; i++) {
					var tab = tabs[i];
					this._callEvent(this, 'closeClick', tab);
					this.tabSetObj.removeTab(tab)
					i--;
				}
			}
		}
	},

	clearComponent: function () {
		if (this.displayType == "Hide") {
			this._clearHideMode();
		} else {
			this._clear();
		}
	},

	getActiveChildWindows: function () {
		if (this.displayType == "Hide") {
			if (this._componentPanel && this._componentPanel._innerComponent && this._componentPanel._innerComponent.scopeId) {
				return [this._componentPanel._innerComponent.scopeId];
			} else if (typeof (this._componentEvent_getWindowInfos) == "function") { //打开网页窗体时用需要从窗体容器里面获取域信息
				var containers = this._componentEvent_getWindowInfos();
				if (containers && containers[0] && containers[0].getScopeId) {
					var scopeId = containers[0].getScopeId();
					return (scopeId ? [scopeId] : undefined);
				}
			}
		} else {
			var selectTab = this.getSelectedTab();
			if (selectTab) {
				return [selectTab.scopeId];
			}
		}
	},
	//设置页签数据加载是否加载中
	setTabDataLoading: function (isLoading) {
		this.isLoading = isLoading;
		this.fireCurrentRecord = !isLoading;
	},
	//判断页签数据加载是否加载中
	isLoadingTabData: function () {
		return this.isLoading;
	},
	isHideCloseTab: function () { //暂时以是否动态页签作为是否隐藏关闭页签功能的判断标准
		return this.DataSourceType == "Entity";
	},
	setFireCurrentRecord: function (isFire) {
		this.fireCurrentRecord = isFire;
	},
	isFireCurrentRecord: function () { //是否触发当前记录
		return this.fireCurrentRecord === false ? false : true;
	},
	destroy: function () {
		this._componentPanel = null;
		this.tabs = null;
		//if(this.tabSetObj){
		//this.tabSetObj.destroy();
		//}
		this.tabSetObj = null;
		this.Super("destroy", arguments);
	},
	onInited: function (func) {
		this.initedListener.push(func);
		if (this.isDrawn()) {
			func();
		}
	},
	setTabBarHide: function () {
		if (this.tabSetObj && this.tabSetObj.tabBar && (this.tabSetObj.tabs.length == 0 || (this.tabSetObj.tabs.length == 1 && this.displayType == "Auto"))) {
			this.tabSetObj.tabBar.hide();
		}
	},
	redraw: function () {
		this.Super("redraw", arguments);
		this.setTabBarHide();
	},
	draw: function () {
		var rs = this.Super("draw", arguments);
		if (this.initedListener.length > 0) {
			for (var i = 0, l = this.initedListener.length; i < l; i++) {
				this.initedListener[i]();
			}
		}
		this.setTabBarHide();
		return rs;
	},

	/**
     * 添加任务
     * @scopeId	{String}	scopeId		窗体域
     * @handler	{Function}	handler		需要执行的方法
     * @handler	{String}	tId			指定任务id
     * @handler	{String}	active		任务动作，用于合并打开和关闭
     * 因存在合并动作，所以无返回值
     * */
	 addTask: function(scopeId, handler, tId, active){
    	if(tId && active && active == isc.JGComponentContainer.ACTIVE.CLOSE){
    		var openId = tId + isc.JGComponentContainer.ACTIVE.OPEN;
    		var index = isc.JGComponentContainer.taskIds.indexOf(openId);
    		if(index != -1){
				delete isc.JGComponentContainer._taskMap[openId];
    			isc.JGComponentContainer.taskIds.splice(index, 1);
    			return;
    		}
    	}
    	var taskId = scopeId+"_"+(new Date()).getTime();
    	if(tId){
    		if(active){
    			tId += active;
    		}
    		taskId = tId;
    	}
		isc.JGComponentContainer._taskMap[taskId] = handler;
    	isc.JGComponentContainer.taskIds.push(taskId);
    },

	 /**
     * 执行下一个动作，如果其他动作正在执行，则忽略
     * */
	  nextTask: function(){
    	if(isc.JGComponentContainer.currentTaskId){//当前有任务进行中
    		return false;
    	}
    	if(isc.JGComponentContainer.taskIds.length > 0){
    		var taskId = isc.JGComponentContainer.taskIds.splice(0, 1)[0];
    		isc.JGComponentContainer.currentTaskId = taskId;
    		var handler = isc.JGComponentContainer._taskMap[taskId];
			if(handler){
				handler();
			}
    	}
    },
    /**
     * 完成动作，自动执行下一个动作
     * */
    finishTask: function(){
    	var index = isc.JGComponentContainer.taskIds.indexOf(isc.JGComponentContainer.currentTaskId);
    	isc.JGComponentContainer.currentTaskId = null;
    	if(index != -1){
    		isc.JGComponentContainer.taskIds.splice(index, 1);
    	}
    	this.nextTask();
    },
    
    genKey: function(entityCode, scopeId, recordId){
    	return this.Code + entityCode + scopeId + recordId;
    },

	_initEventAndDataBinding: function(){
		var _this = this;
		isc.WidgetDatasource.addBindDatasourceCurrentRecordUpdateEventHandler(this, null, null, function(record) {
            isc.DataBindingUtil.setWidgetValue(_this, record);
        });
        isc.WidgetDatasource.addBindDatasourceCurrentRecordClearEventHandler(this, null, null, function() {
            isc.DataBindingUtil.clearWidgetValue(_this);
        });
        //处理动态数据源
        var dataSourceType = this.DataSourceType;
        if(dataSourceType == "Entity"){
        	this._setCurrentRecordByTab = (function(){
        		return function(tab){
        			if(tab && tab.recordId){
            			var datasource = _this.TableName;
            			if(datasource){
            				var recordId = tab.recordId;
            				var records = datasource.getAllRecords();
            				for(var i = 0,len = records.length; i<len; i++){
            					if(records[i].id == recordId){
            						datasource.setCurrentRecord(records[i]);
            					}
            				}
            			}
            		}
        		}
        	})();
        	var paramsMapping = this.ParamsMapping;
        	if(paramsMapping){
        		paramsMapping = isc.JSON.decode(paramsMapping);
        	}
        	var observer = isc.DatasourceObserver.create({
				loadHandler:function (args) {
					var records = args.datasource.getAllRecords();
					var entityCode = _this.SourceTableName;
					if(records){
						var widgetCode = _this.code;
						var func = [];
						var scopeId = _this.scopeId;
						for(var i = records.length-1; i >= 0; i--){
							var record = records[i];
							var call = func.length > 0 ? func[func.length - 1] : addAfterDefaultFunc;
							var fun = (function(_widgetCode, _record, _paramsMapping, _entityCode, _call){
								return function(){
									_this.openWindowByRecord(_widgetCode, _record, _paramsMapping, _entityCode, _call);
								}
							})(widgetCode, record, paramsMapping, entityCode, call);
							_this.addTask(scopeId,fun, _this.genKey(entityCode,scopeId,record.id), isc.JGComponentContainer.ACTIVE.OPEN);
						}
						_this.nextTask();
					}
				},
				insertHandler:(function(){
					return function (args) {
						var entityCode = _this.SourceTableName;
						if(args && args.resultSet){
							var records = args.resultSet;
							var widgetCode = _this.code;
							var func = [];
							var scopeId = _this.scopeId;
							for(var i = records.length-1; i >= 0; i--){
								var record = records[i];
								var call = func.length > 0 ? func[func.length - 1] : addAfterDefaultFunc;
								var fun = (function(_widgetCode, _record, _paramsMapping, _entityCode, _call){
									return function(){
										_this.openWindowByRecord(_widgetCode, _record, _paramsMapping, _entityCode, _call);
									}
								})(widgetCode, record, paramsMapping, entityCode, call);
								_this.addTask(scopeId,fun, _this.genKey(entityCode,scopeId,record.id), ACTIVE.OPEN);
							}
							_this.nextTask();
						}
					}
				})(),
				updateHandler:(function(){
					return function (args) {
						var oldRecords = args.oldResultSet;
						var oldRecordMap = {};
						if(oldRecords){
							for(var i = 0,len = oldRecords.length; i<len; i++){
								var oldRecord = oldRecords[i];
								oldRecordMap[oldRecord.id] = oldRecord;
							}
						}
						var records = args.resultSet;
						if(records){
							for(var i = 0, len = records.length; i<len; i++){
								var recordMap = records[i];
								var id = recordMap.id;
								var oldData = oldRecordMap[id];
								var changeData = recordMap;
								var componentCodeKey = paramsMapping["componentCode"];
								var windowCodeKey = paramsMapping["formCode"];
								var titleKey = paramsMapping["title"];
								//修改了窗体
								if(changeData.hasOwnProperty(componentCodeKey) || changeData.hasOwnProperty(windowCodeKey)){
									var container = _this.getWindowRelationByCondition({
										componentCode : oldData[componentCodeKey],
										windowCode : oldData[windowCodeKey],
										title : oldData[titleKey],
										recordId : id
									});
									if(container){
										var windowInputParams = {
											variable:{
												"formulaOpenMode" : "locationHref",
												"windowtitle" : recordMap[titleKey]
											}
										};
										_this.redirectBrowser({
											"componentCode": recordMap[componentCodeKey],
											"windowCode": recordMap[windowCodeKey],
											"params": {
												inputParam: windowInputParams
											}
										});
									}
								}else if(changeData.hasOwnProperty(titleKey)){
									var conditions = {
										componentCode : recordMap[componentCodeKey],
										windowCode : recordMap[windowCodeKey],
										title : oldData[titleKey],
										recordId : id
									};
									var container = _this.getWindowRelationByCondition(conditions);
									if(container){
										_this.updateWindowRelation(container,{
											title : recordMap[titleKey],
											funParams : conditions
										});
									}
								}
							}
						}
					}
				})(),
				deleteHandler: (function(){
					return function (args) {
						var records = args.resultSet;
						if(records){
							var paramsMapping = _this.ParamsMapping;
							if(paramsMapping){
								paramsMapping = isc.JSON.decode(paramsMapping);
							}
							var componentCodeKey = paramsMapping["componentCode"];
							var windowCodeKey = paramsMapping["formCode"];
							var titleKey = paramsMapping["title"];
							var scopeId = _this.scopeId;
							var entityCode = _this.SourceTableName;
							for(var i = 0,len = records.length; i<len; i++){
								var record = records[i];
								var func = (function(widget, record){
									return function(){
										var container = _this.getWindowRelationByCondition({
											recordId : record.id
										});
										if(!container){//快速切换回导致容器数据错误
											var containerId = _this.getContainerIdByInfoNew(widget.widgetId,{
												componentCode:record[componentCodeKey],
												windowCode:record[windowCodeKey],
												title:record[titleKey]
											});
											if(containerId){
												container = _this.getWindowRelation(containerId);
											}
										}
										if(container){
											var windowContainerId = container.getId();
											_this._componentEvent_deleteWindowInfo(windowContainerId);
											var tabCloseFunc = container.get("tabCloseFunc");
											//应该先销毁容器内窗体，再关闭页签
											_this.destroyWindowRelation(container.getId());
											if(typeof(tabCloseFunc) == "function"){
												//console.log("关闭：" + record[componentCodeKey] + "." + record[windowCodeKey] + "." + record[titleKey])
												tabCloseFunc();
											}
										}
										_this.finishTask();
									}
								})(_this, record);
								_this.addTask(scopeId, func, _this.genKey(entityCode,scopeId,record.id), isc.JGComponentContainer.ACTIVE.CLOSE);
							}
							_this.nextTask();
						}
					}
				})(),
				currentHandler:(function(){
					return function (args) {
						var widget = _this;
						if(widget.isLoadingTabData() && !widget.isFireCurrentRecord()){
							widget.setFireCurrentRecord(true);
							return;
						}
						var currentRecord = args.currentRecord;
						if(currentRecord){
							var recordId = currentRecord.id;
							var container = _this.getWindowRelationByCondition({
								recordId : recordId
							});
							var func;
							if(container){
								widget.selectTabByCondition({
									recordId : recordId
								});
							}
							func = widget.getEventHandler(widget.code, "OnSelectedChanged")
							func && func.apply(widget,currentRecord);
						}
					}
				})()
			});
        	var addAfterDefaultFunc = (function(){
        		return function(){
        			var datasource = _this.TableName;
					if(datasource){
						var currentRecord = datasource.getCurrentRecord();
						if(currentRecord){
							var recordId = currentRecord.id;
							_this.selectTabByCondition({
								recordId : recordId
							});
						}
					}
					_this.setTabDataLoading(false);
					_this.finishTask();
        		}
        	})();
        	var datasource = _this.TableName;
			datasource.addObserver(observer);
        }
	},

	openWindowByRecord: function(widgetCode, record, paramsMapping, entityCode, nextFunc){
    	this._openWindowByRecord(widgetCode, record, paramsMapping, entityCode, nextFunc);
    },

	/**
	 * TODO
	 */
	initUIEvent: function() {
		var _this = this;
		var widgetId = this.Code;
        this._onWidgetEvent(widgetId, "OnChildResized", function() {
            var prewindowCode = _this.windowCode;
            var parentRelation = _this._getContainerParent(prewindowCode);
            var info = _this._componentRenderHandler("getParentContainerInfo", prewindowCode);
            var containerScopeId = info.scopeId;
            var containerCode = info.containerCode;
			_this._getInstanceHandler(function(){
				_this.getEventHandler(containerCode, "OnChildResized").apply(this, parentRelation);
			},containerScopeId)();
        });

        //组件页签切换事件处理
        if (this.tabSetObj) {
            var fixLayout = this.tabSetObj.fixLayout;
			var _this = this;
            this.tabSetObj.fixLayout = function() {
                fixLayout.apply(this, arguments);
                _this.setTabBarHide();
                for (var i = 0; i < _this.tabSetObj.tabs.length; i++) {
                    var selectComponent = _this.tabSetObj.tabs[i];
                    if (selectComponent) {
                        selectComponent.pane.adjustOverflow("");
                        var _Canid = selectComponent.pane.getCanvasName();
                        var _scopeNewId = _this._componentActionHandler("getContainerScopeId", _Canid);
                        var _windowCode = _this._componentActionHandler("getContainerWindowCode", _Canid);
						_this._getInstanceHandler(function(){
							_this.getEventHandler(_windowCode, "OnResize")();
						},_scopeNewId)();
                    }
                }
            }
        }

        //往组件容器中增加 注册打开窗体信息的相关接口。
        this.initComponent(this);
        this.onInited(this.getEventHandler(widgetId, "OnContainerInited"));
    },
	beforeDataLoad: function(){
		//建立窗体与组件容器关系
        var info = this._componentRenderHandler("getParentContainerInfo");
        var windowCode = this.windowCode;
        var property = {
            windowCode: windowCode,
            scopeId: info.scopeId,
            type: "ComponentContainer"
        }
		var windowWidget = this._getWidgetContextProperty(windowCode,"widgetObj");
		this._registerContainer(windowWidget.getCanvasName(), this.getCanvasName(), property);
	},
	/**
     * 初始化组件容器中用来保存打开窗体信息的接口。
     * @param {Object} component 组件容器对象
     * */
	 initComponent: function(component) {
        if (component) {
            if (!component._openWindowInfo) {
                //用来存储组件容器打开的窗体信息
                component._componentInfo_openWindowInfos = [];
            }
            /**
             * 接口：添加组件容器打开的窗体信息
             * */
            component._componentEvent_addWindowInfo = function(container) {
                this._componentInfo_openWindowInfos.push(container);
            }
            /**
             * 接口：获取全部组件容器打开的窗体信息
             * */
            component._componentEvent_getWindowInfos = function() {
                if (this._componentInfo_openWindowInfos) {
                    return this._componentInfo_openWindowInfos;
                } else {
                    return [];
                }
            }
            /**
             * 接口：删除组件容器打开的窗体信息
             * */
            component._componentEvent_deleteWindowInfo = function(containerId) {
                if (containerId && this._componentInfo_openWindowInfos) {
                    var infos = this._componentInfo_openWindowInfos;
                    for (var i = 0; i < infos.length; i++) {
                        var info = infos[i];
                        if (info && (containerId == info.getId())) {
                            infos.splice(i, 1);
                            i--;
                        }
                    }
                } else {
                    this._componentInfo_openWindowInfos = [];
                }
            }
        }
    },

	isSingleContainer: function () {
		return this.TabPageDisplayMode== "Hide" ? true:false;
	},

	OnResize: function (info) {
		var panelWidget = $("#" + info.containerCode).parent()[0].clientWidth;
		var parents = this.getParentElements();
		var component;
		for(var i=0,l=parents.length;i<l;i++){
			var parentEle = parents[i];
			if(parentEle.getClassName()=="JGComponent"){
				component = parentEle;
				break;
			}
		}
		if (component) {
			component.resizeTo(panelWidget, null)
		}
	},

	clear: function () {
		this.clearComponent();
	},

	/**
	 * 获取控件的可见性
	 */
	getVisible: function () {
		return this.isVisible();
	},

	/**
	 * 根据componentCode，windowCode，title获取窗体容器id，如果不存在，就返回null
	 * */
	getContainerIdByInfo: function (info) {
		//更换成组件容器中获取窗体信息进行比对
		return this.getContainerIdByInfoNew(info);
	},

	/**
	 * 来源信息从组件容器对象上面获取。根据componentCode，windowCode，title获取窗体容器id，如果不存在，就返回null
	 * */
	getContainerIdByInfoNew: function (info) {
		var componentCode = info.componentCode;
		var windowCode = info.windowCode;
		//替换构件包映射信息
		var newInfo = this._handleComponentPackInfo(componentCode, windowCode);
		if (newInfo) {
			componentCode = newInfo.componentCode;
			windowCode = newInfo.windowCode;
		}
		/* 获取窗体映射信息 */
		var windowMappingInfo = this._handleWindowMapping(componentCode, windowCode);
		/* 若窗体映射信息不为空的话，则表示是配置相应的映射信息，需替换 */
		if (windowMappingInfo != null) {
			componentCode = windowMappingInfo.componentCode;
			windowCode = windowMappingInfo.windowCode;
		}
		var widget = this;
		var allInfos = widget._componentEvent_getWindowInfos();
		if (allInfos) {
			for (var i = 0, l = allInfos.length; i < l; i++) {
				var container = allInfos[i];
				if (info["recordId"]) { //记录id可以单独做判断条件
					if (container.getRecordId() == info.recordId) {
						return container.getId();
					}
				} else if ((container.getComponentCode() == componentCode) && (container.getWindowCode() == windowCode) && (container.getTitle() == info.title) && widget.displayType != "Hide") {
					return container.getId();
				}
			}
		}
		return null;
	},

	existByComponentId: function (info) {
		return this.existByComponentIdNew(info);
	},

	existByComponentIdNew: function (info) {
		var widget = this;
		var otherInfo = info.otherInfo;
		//保存控件跟窗体容器的关系
		var controlContainerRelation = this._getWidgetContextProperty(widgetCode, "ControlContainerRelation");
		if (controlContainerRelation) {
			for (var i = 0, l = controlContainerRelation.length; i < l; i++) {
				var containerId = controlContainerRelation[i];
				var containerObj = this.getWindowRelation(containerId);
				if (containerObj.getOtherInfo() == otherInfo && containerObj.getTitle() == info.title && widget.displayType != "Hide") {
					return containerId;
				}
			}
		}
		return null;
	},

	v3Exists: function (info) {
		return this.existByComponentId(info);
	},

	// 设置组建容器高度
	setV3Height: function (value) {
   		this._setHeight(value);
	},

	reloadV3SingleTab : function (componentCode, containerId, title, otherInfo, url, isTitle, isComponent) {
		return this.reloadSingleTab(containerId, url, isTitle, isComponent);
	},

	activeByComponentId: function (componentCode, windowCode, title, otherInfo, componentVariable, params) {
		var newComponentCode = componentCode;
		var newWindowCode = windowCode;
		//替换构件包映射信息
		var newInfo = this._handleComponentPackInfo(newComponentCode, newWindowCode);
		if (newInfo) {
			newComponentCode = newInfo.componentCode;
			newWindowCode = newInfo.windowCode;
		}
		/* 获取窗体映射信息 */
		var windowMappingInfo = this._handleWindowMapping(newComponentCode, newWindowCode);
		/* 若窗体映射信息不为空的话，则表示是配置相应的映射信息，需替换 */
		if (windowMappingInfo != null) {
			componentCode = windowMappingInfo.componentCode;
			windowCode = windowMappingInfo.windowCode;
		}
		// 处理跨构建scopeId无法获取问题
		var comId = this.active(newComponentCode, newWindowCode, title, otherInfo, params);
		if (comId){
			return this._getWidgetContextProperty(comId, "ContainerScopeId");
		}
	},

	active: function ( _$componentCode, _$windowCode, title, otherInfo, params, cbFunc) {
		var componentCode = _$componentCode;
		var windowCode = _$windowCode;
		//替换构件包映射信息
		var newInfo = this._handleComponentPackInfo(componentCode, windowCode);
		if (newInfo) {
			componentCode = newInfo.componentCode;
			windowCode = newInfo.windowCode;
		}
		/* 获取窗体映射信息 */
		var windowMappingInfo = this._handleWindowMapping(componentCode, windowCode);
		/* 若窗体映射信息不为空的话，则表示是配置相应的映射信息，需替换 */
		if (windowMappingInfo != null) {
			componentCode = windowMappingInfo.componentCode;
			windowCode = windowMappingInfo.windowCode;
		}
		cbFunc && typeof cbFunc === "function" && cbFunc();
		var widget = this;
		var identityId;
		if (params && params.containerId) {
			identityId = params.containerId;
		} else {
			var uuCode = (componentCode ? (componentCode + "_") : "") + (windowCode ? (windowCode + "_") : "") + widgetId + "_" + (title ? (title + "_") : "") + (otherInfo ? otherInfo : "");
			var identiObj = this.identiObj;
			identityId = identiObj && identiObj[uuCode];
		}
		return this.selectedByName(identityId);
	},

	/**
	 * 解绑控件与窗体容器的关系
	 * @param String widgetId 控件编码
	 * @param String containerId 窗体容器id，如果此值为空，则解绑该控件关联的所有窗体容器
	 * */
	unbindControlContainerRelation: function (containerId) {
		var widgetId = this.code;
		var controlContainerRelation = this._getWidgetContextProperty(widgetId, "ControlContainerRelation");
		if (controlContainerRelation) {
			if (containerId) {
				var index = controlContainerRelation.indexOf(containerId);
				if (index != -1) {
					controlContainerRelation.splice(index, 1);
				}
			} else {
				controlContainerRelation = null;
			}
			this._putWidgetContextProperty(widgetId, "ControlContainerRelation", controlContainerRelation);
		}
	},

	/**
	 * 绑定控件与窗体容器的关系
	 * @param String widgetId 控件id
	 * @param String widowContainerId 窗体容器id 
	 * */
	bindControlContainerRelation: function (widgetId, windowContainerId) {
		//保存控件跟窗体容器的关系
		var controlContainerRelation = this._getWidgetContextProperty(widgetId, "ControlContainerRelation");
		if (!controlContainerRelation) {
			controlContainerRelation = [];
		}
		controlContainerRelation.push(windowContainerId);
		this._putWidgetContextProperty(widgetId, "ControlContainerRelation", controlContainerRelation);
	},

	/**
	 * 添加新页签
	 */
	add: function (cfg) {
		this._addToComponentContainer(this.code,cfg);
	},

	getV3MethodMap: function(){
		return {
			"setHeight":"setV3Height",
			"reloadSingleTab":"reloadV3SingleTab",
			"exists": "v3Exists"
		}
	},

	getBindFields: function(){
		return [];
	}

});
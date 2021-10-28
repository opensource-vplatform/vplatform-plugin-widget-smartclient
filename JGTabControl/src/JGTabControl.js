/**
 * 页签
 * @class JGTabControl
 * @extends JGBaseWidget
 * @mixes JGLayoutManager
 * @mixes JGStyleHelper
 * 
 */
isc.ClassFactory.defineClass("JGTabControl", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGTabControl", "JGLayoutManager");
isc.ClassFactory.mixInInterface("JGTabControl", "JGStyleHelper");

if (isc.PaneContainer) {
    isc.PaneContainer.addProperties({
        showCustomScrollbars: false
    });
}

isc.JGTabControl.addProperties({
    tabs: null,
    Alignment: 'top',
    TabIndex: 1,
    ReadOnly: false,
    disabled: false,
    _selectedTabId: '',
    tabChange: null,
    Top: 10,
    Left: 10,
    Width: 600,
    Height: 50,
    SelectedIndex: 0,
    Icon: '',
    hidenID: {},
    listener: ['tabChange'],
    tabSetObj: null,
    hidenArray: {},
    //IE8下，有可能会出现还没有画完，窗体加载事件设置了显示（隐藏）页签的规则，这种情况下是会报错与不能生效的
    //要进行特殊处理，没有画完的情况，显示（隐藏）页签时，只做临时记录，在画时才真正处理
    beforeDrawShowArray: {},
    beforeDrawHideArray: {},
    TabAppearance: 'line', //显示风格：1、line(简约)2、card（卡式）
    compensateSelect: undefined, //补偿选中，场景：动态页签（非激活页）嵌套的动态页签打开窗体报错
    WidgetStyle: "JGTabControl",
    //列事件
    _columnListener: [],
    _savedWinParams: null,//动态页签下加载数据时生成的数据,对象引用
    lastValidateResult: true
});
isc.JGTabControl.addMethods({
    
    setBackColorJGTabPage: function(pageId, color) {
        var tabs = this.findTabByID(pageId)
        if (tabs && tabs.length > 0) {
            color = this.parseColor(color);
            tabs[0].pane.setBackgroundColor(color);
        }
    },
    setSimpleChineseTitleJGTabPage: function(pageId, title) {
        var tabs = this.findTabByID(pageId)
        if (tabs) {
            this.tabSetObj.setTabTitle(tabs[0], title);
        }
    },
    setVisibleJGTabPage: function(pageId, isboolea) {
        if (isboolea) {
            this.showItem(pageId);
        } else {
            this.hideItem(pageId);
        }

        // 显示隐藏时需要重新计算页签工具栏布局
        this.childrenWidgets[0].fixLayout();
    },
    setLabelTextJGTabPage: function(pageId, title) {
        var tabs = this.findTabByID(pageId)
        if (tabs) {
            this.tabSetObj.setTabTitle(tabs[0], title);
        }
    },
    getLabelTextJGTabPage: function(pageId) {
        var tabs = this.findTabByID(pageId)
        var labelText;
        if (tabs) {
            labelText = this.tabSetObj.getTabObject(tabs[0]).title;
        }
        return labelText;
    },

    _initWidget: function () {

        if (this.isOldWindowLayoutConfig && !this.isOldWindowLayoutConfig()) {
            this.ScrollbarDir = "vertical"; //临时处理，新布局窗体不出现横向滚动条，解决页签下页面滚动条抖动问题
        }

        var _self = this;

        //  处理IE下标签头高度有误
        isc.StatefulCanvas.pushTableBorderStyleToDiv = false;


        if (this.Enabled == false)
            this.disabled = !this.Enabled;
        var array = [];
        this.hidenArray = {};

        var _tabBarThickness = 38,
            _tabMarginVal = 4;
        var _alignment = (this.Alignment + "").toLowerCase();
        this._isHorizontalTabBar = _alignment === "left" || _alignment === "right" ? false : true;

        for (var i = 0; i < this.tabs.length; i++) {
            var tmpTab = this.tabs[i];
            var arrayTemp = {};
            // arrayTemp.canClose = true;
            //移除页签页布局设置
            //this.tabs[i].layoutType = "None";
            arrayTemp.icon = tmpTab.icon;
            arrayTemp.title = tmpTab.title;
            // 添加页签 code
            arrayTemp.code = tmpTab.id;
            arrayTemp.canHover = true;
            arrayTemp.hover = function () {
                var code = this.ControlCode || this.code;
                _self.fireEvent('showProtoInfo', null, this.getClipHandle(), [code, _self.widgetId]);
            };
            var tmpChilds = [];

            if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) { //旧窗体布局
                arrayTemp.Code = tmpTab.id;
                arrayTemp.scopeId = this.scopeId;
                arrayTemp.widgetId = tmpTab.id;
                var layout = this.createLayoutById(this.scopeId + "_" + arrayTemp.code);
                var catalog = this.buildBorderLayoutById.apply(arrayTemp, [layout]);
                tmpChilds.push(layout);
                var absChildren = this._layoutAbsoluteChildren(catalog);
                if (absChildren)
                    tmpChilds = tmpChilds.concat(absChildren)
            } else {
                tmpChilds = this.layoutChildWidgets(arrayTemp.code);
            }
            arrayTemp.pane = isc.Canvas.create({
                //ID : this.tabs[i].id,
                id: tmpTab.id,
                backgroundColor: tmpTab.colors,
                showCustomScrollbars: false,
                hideUsingDisplayNone: true,
                height: '100%',
                width: '100%',
                styleName: this.isLineAppearance() ? this.WidgetStyle + 'ContainerStyle' : 'normal',
                children: tmpChilds
            });
            // 增加布局处理
            var layoutType = tmpTab.layoutType;
            this.LayoutLeftMargin = tmpTab.LayoutLeftMargin;
            this.LayoutTopMargin = tmpTab.LayoutTopMargin;
            this.LayoutRightMargin = tmpTab.LayoutRightMargin;
            this.LayoutBottomMargin = tmpTab.LayoutBottomMargin;

            this.LayoutLeftMargin = null;
            this.LayoutTopMargin = null;
            this.LayoutRightMargin = null;
            this.LayoutBottomMargin = null;

            arrayTemp.layoutType = layoutType;
            arrayTemp.layoutLeftMargin = 6;
            arrayTemp.layoutRightMargin = 6;

            // 实现竖直方向上的tab标题过长显示省略号
            if (!this._isHorizontalTabBar) {
                var tabHeadWidth = this.TabHeadWidth ? this.TabHeadWidth : 110;
                var _headerWidth = tabHeadWidth * 1 - 32 - 3; // padding-left padding-right为 20px
                arrayTemp.cssText = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: " + _headerWidth + "px;"
            }
            arrayTemp.width = 10;
            array.push(arrayTemp)
            if (this.tabs[i].show != undefined && tmpTab.show == false) {
                this.hidenArray[tmpTab.id] = tmpTab.id;
            }
        }

        // 处理水平导航栏40 垂直>=70 默认110
        var _layoutTopMargin = 0;
        if (!this._isHorizontalTabBar) {
            _tabBarThickness = Number(this.TabHeadWidth) > 0 ? Number(this.TabHeadWidth) : 110;
            _tabMarginVal = this.isLineAppearance() ? 0 : 4; //数值方向是 9px 高度间距
            _layoutTopMargin = 0;
        }

        var tabs = this;
        var _paneContainerOverflow = "visible",
            _isShowScrollbar = (this.IsShowScrollbar + "").toLowerCase();
        if (_isShowScrollbar === "false")
            _paneContainerOverflow = "hidden";
        else if (this.Dock == "Fill")
            _paneContainerOverflow = "auto";

        // 处理滚动条闪现 深圳住建局
        if (layoutType && layoutType === "BorderLayout")
            _paneContainerOverflow = isc.Canvas.IGNORE;
        var _styleName = this.Alignment.substr(0, 1).toUpperCase() + this.Alignment.substr(1);
        var tabSet = isc.TabSet.create({
            shrinkElementOnHide: true,
            width: this.Width,
            tabIndex: this.TabIndex,
            height: this.Height,
            selectedTab: this.SelectedIndex,
            showMoreTab: false,
            tabBarPosition: this.Alignment,
            tabBarThickness: _tabBarThickness,
            useSimpleTabs: true,
            tabs: (this.IsDynamic + "").toLowerCase()==="true" ?[]:array,
            showTabPicker: false,
            overflow: _paneContainerOverflow,
            paneContainerClassName: this.isLineAppearance() ? null : "tabSetContainer",
            paneContainerOverflow: _paneContainerOverflow, //_paneContainerOverflow,
            tabBarProperties: {
                layoutEndMargin: 0,
                layoutStartMargin: 0,
                layoutTopMargin: _layoutTopMargin,
                layoutBottomMargin: 1,
                membersMargin: _tabMarginVal,
                topStyleName: this.isLineAppearance() ? this.WidgetStyle + _styleName : null,
                baseLineProperties: {
                    className: this.isLineAppearance() ? this.WidgetStyle + "Line" : null,
                    height: 1,
                    overflow: "hidden"
                }
                /*,
                buttonProperties: {
                    // 处理IE下使用不同对象生成tab dom结构
                    vertical: false, 
                    capSize: 0,
                    titleStyle: this.WidgetStyle + "Button" + _styleName, //IE设置样式
                    src: "" //IE设置图片
                }*/
            },
            simpleTabBaseStyle: this.isLineAppearance() ? this.WidgetStyle + "Button" : 'tabButton',
            $8f: function () {
                // 返回顶部工具栏所占宽度
                // 重写原有逻辑，原有逻辑缺失计算 membersMargin 和 移除隐藏页签的宽度
                if (!this._tabBar)
                    return 0;
                var _1 = this._tabBar.getMemberSizes(),
                    _2 = this._tabBar.vertical;

                if (_1 == null || _1.length == 0)
                    return 0;

                var members = this._tabBar.getMembers();
                _1 = 0;
                for (var i = 0, len = members.length; i < len; i++) {
                    var tmpMember = members[i];
                    if (tmpMember.isVisible())
                        _1 += (_2 ? tmpMember.getVisibleHeight() : tmpMember.getVisibleWidth());
                }

                var _3 = (_2 ? (this._tabBar.$td || 0) + (this._tabBar.$te || 0) : (this._tabBar.$tb || 0) + (this._tabBar.$tc || 0));

                return _1 + _3 + (len - 1) * _tabMarginVal;
            },  
            tabSelected: function () {
                var selectTab = this.getSelectedTab();
                if (selectTab) {
                    if (selectTab.pane && !selectTab.pane.isDrawn()) {
                        selectTab.pane.draw();
                        tabs.SelectedIndex = this.getTabNumber(selectTab);
                        tabs.refreshCurrentTabID();
                        var tabID = selectTab.pane.id;
                        if (tabs._selectedTabId != tabID) {
                            selectTab.pane && selectTab.pane.bringToFront();
                            //tabs._callEvent(tabs, "tabChange")
                            tabs.TabIndexChangedAction();
                        }
                    } else {
                        tabs.SelectedIndex = this.getTabNumber(selectTab);
                        tabs.refreshCurrentTabID();
                        selectTab.pane && selectTab.pane.bringToFront();
                        //tabs._callEvent(tabs, "tabChange")
                        tabs.TabIndexChangedAction();
                    }

                    // 处理选中页签布局类型
                    var _isShowScrollbar = (this.IsShowScrollbar + "").toLowerCase();

                    if (selectTab.layoutType === "BorderLayout" || _isShowScrollbar === "false")
                        //处理新布局下，页签内无法显示滚动条的问题
                        this.paneContainer.setOverflow("auto");
                    //		                        this.paneContainer.setOverflow("hidden")
                    else {
                        var _scrollbarDir = this.ScrollbarDir + "";

                        if (this.paneContainer.isDrawn()) {
                            var $paneContaner = this.paneContainer && $(this.paneContainer.getClipHandle());

                            if (_scrollbarDir === "vertical") {
                                $paneContaner.css({
                                    "overflow-x": "hidden",
                                    "overflow-y": "auto"
                                });
                            } else if (_scrollbarDir === "horizontal") {
                                $paneContaner.css({
                                    "overflow-y": "hidden",
                                    "overflow-x": "auto"
                                });
                            } else if (tabs.Dock == "Fill") {
                                this.paneContainer.setOverflow("auto")
                            } else
                                this.paneContainer.setOverflow("visible")
                        } else if (_scrollbarDir === "both") {
                            //		                            this.paneContainer.setOverflow("auto")
                        }
                    }
                }
            },
            showTabPickerMenu: function () {
                if (!this.pickerMenu) {
                    var tabs = this.tabs,
                        items = [],
                        j = 0;
                    for (var i = 0; i < tabs.length; i++) {
                        /*改造页签标头与下拉显示值一样*/
                        if (this.children[0].members[i].isVisible())
                            items[j++] = {
                                index: i,
                                enabled: !this.tabs[i].disabled,
                                checkIf: "this.tabSet.getSelectedTabNumber() == " + i,
                                title: tabs[i].pickerTitle || tabs[i].title,
                                icon: (this.canCloseTab(tabs[i]) ? null : tabs[i].icon),
                                click: "menu.tabSet.selectTab(item.index)"
                            }
                    }
                    this.pickerMenu = this.getMenuConstructor().create({
                        tabSet: this,
                        data: items
                    })
                }
                this.pickerMenu.positionContextMenu();
                this.pickerMenu.placeNear(this.tabPicker.getPageLeft(), this.tabPicker.getPageBottom())
                this.pickerMenu.show();
            },
            resetTabPickerMenu: function () {
                if (this.pickerMenu) {
                    this.pickerMenu.destroy();
                    delete this.pickerMenu;
                }
            },
            initWidget: function () {
                this.Super("initWidget", arguments);
                this.tabBarDefaults.buttonConstructor = isc.v3ImgTab;
            }
        });
        this.tabSetObj = tabSet;
        this._preDrawFunc = this.tabSetObj.draw;
        this.tabSetObj.draw = this._referFunc(this, '_onDraw');
        this.addChild(this.tabSetObj);
        //构建父子关系，设置状态
        this.addWidgets(this, this.tabSetObj);
        if (!this.Enabled) {
            this.tabSetObj.tabBar.setDisabled(true);
        }

        // 设置竖直方向标签头宽度
        this.setTabHeaderStyle();

        this._initEventAndDataBind();
    },

    _initEventAndDataBind: function () {
        var _this = this;
        var isDynamic = (_this.IsDynamic + "").toLowerCase(),
            curTabsetObj = _this.tabSetObj;

        if (isDynamic === "true") {
            var dynamicPageStrData = _this.DynamicPage,
                dynamicPageData = isc.JSON.decode(dynamicPageStrData),
                dynamicTabSetting = dynamicPageData.WindowTabSetting.dynamicTabSetting,
                dynTableName = dynamicTabSetting.TableName,
                staticTabSettings = dynamicPageData.WindowTabSetting.staticTabSetting;
            var dyIndex = dynamicTabSetting.seq;
            //前置静态页签页
            _this._preStaticTab = [];
            //后置静态页签页
            _this._lastStaticTab = [];
            if (staticTabSettings) {
                for (var i = 0, len = staticTabSettings.length; i < len; i++) {
                    var staticTab = staticTabSettings[i];
                    widget[staticTab.seq < dyIndex ? "_preStaticTab" : "_lastStaticTab"].push(staticTab);
                }
            }

            var entityDs = _this._lookup(dynTableName);

            if (_this.tabSetObj) {
                var _tabSelected = _this.tabSetObj.tabSelected;
                _this.tabSetObj.parentVisibilityChanged = function () {
                    if (_this.isVisible() && _this.compensateSelect) {
                        var tObj = _this.compensateSelect["tabSetObj"];
                        var args = _this.compensateSelect["args"];
                        _this.compensateSelect = null;
                        tObj["tabSelected"].apply(tObj, args);
                    }
                }

                this.renderTabWindow = function () {
                    var dynamicPageStrData = _this.DynamicPage,
                        dynamicPageData = isc.JSON.decode(dynamicPageStrData),
                        dynamicTabSetting = dynamicPageData.WindowTabSetting.dynamicTabSetting,
                        dynTabSettingInputParams = dynamicTabSetting.inputParams;
                    var curTabsetObj = _this.tabSetObj;
                    var curCanvasName = curTabsetObj.paneContainer ? curTabsetObj.paneContainer.getCanvasName() : "";
                    var curSelectedTabNum = curTabsetObj.getSelectedTabNumber();
                    var _openWinParam = _this._getDynamicTabInfoByIndex(curSelectedTabNum);
                    if (_openWinParam) {
                        //处理窗体替换
                         // _this.handleReplaceWindowInfo(_openWinParam);
                        if (!_this._isOpenedDynamicTabWindow(_openWinParam)) {
                            var tmpInputParams = _openWinParam.isStaticTabPage ? _openWinParam.inputParams : dynTabSettingInputParams;
                            if (_openWinParam._scopeId) {//销毁前一次打开的窗体
                                _this._windowDestroy(_openWinParam._scopeId);
                            }
                            _openWinParam._scopeId = function () {
                                var targetContainerId = _this.getSelectedTab().pane.getMembers()[0].getCanvasName();
                                _this.getSelectedTab().id = targetContainerId;
                                return _this.renderWindowToElement(_openWinParam.comCode, _openWinParam.winCode, _this.getOpenWindowInputParams(tmpInputParams, _openWinParam.entityFieldValue), targetContainerId);
                            }();
                            _this._markDynamicTabWindowOpened(curSelectedTabNum);
                        }
                    }
                    if (_this.tabSetObj.getSelectedTab() && _this.tabSetObj.getSelectedTab().pane) {
                        _this.tabSetObj.getSelectedTab().pane.moveTo(0, 0)
                    }
                }
            };
            _this.tabSetObj.tabSelected = function () {
                if (!this.isVisible() && undefined === _this.compensateSelect) {
                    var args = [];
                    for (var i = 0, len = arguments.length; i < len; i++) {
                        args[i] = arguments[i];
                    }
                    _this.compensateSelect = {
                        "tabSetObj": this,
                        "args": args
                    }
                    return;
                }

                var fun = function () {
                    _tabSelected.apply(this, arguments);
                    var $id = this.$80n.dataid;
                    if ($id) {
                        var record = entityDs.getRecordById($id);
                        //全部数据清空后，record为空，设置会报错
                        record && entityDs.setCurrentRecord({ "record": record });
                    }
                    if (_this.renderTabWindow) {
                        _this.renderTabWindow();
                    }
                }
                fun.apply(this, arguments);

            };

            this.tabSetObj.paneContainer.hasMember = function (curPane) {
                // 设置默认为 True
                if (!curPane)
                    return false;
                return true;
            }

            // 监听页签头实体数据变化
            var dsEvents = [{
                "eventName": entityDs.Events.LOAD,
                "handler": _this.loadRecord(_this, dynamicPageData, curTabsetObj)
            }, {
                "eventName": entityDs.Events.INSERT,
                "handler": _this.insertRecord(_this, dynamicPageData, curTabsetObj)
            }, {
                "eventName": entityDs.Events.UPDATE,
                "handler": _this.updateRecord(_this, dynamicPageData, curTabsetObj)
            }, {
                "eventName": entityDs.Events.DELETE,
                "handler": _this.deleteRecord(_this)
            }, {
                "eventName": entityDs.Events.CURRENT,
                "handler": _this.currentRecord(_this, dynamicPageData, curTabsetObj)
            }];
            for (var i = 0, len = dsEvents.length; i < len; i++) {
                entityDs.on(dsEvents[i]);
            }

            // 加载静态页签头
            if (staticTabSettings && staticTabSettings.length > 0) {
                var newAddTabs = [];
                for (var h = 0, len = staticTabSettings.length; h < len; h++) {
                    var tmpStaticTabSetting = staticTabSettings[h];
                    var tmpTap = {};

                    var _title = _this._expressionHandler(tmpStaticTabSetting.TitleColumn);

                    tmpTap.title = "<span class='" + tmpStaticTabSetting.IconColumn + "'></span>" + _title;
                    //静态页签页需要补上pane，如果直接兼容pane为undefined会导致页签切换时总先显示第一次的页签  Task20210219031
                    tmpTap.pane = _this.genTabPanel(this);
                    newAddTabs.add(tmpTap);

                    var tmpTabPageData = _this.addtabPageData(tmpStaticTabSetting.windowCode, tmpStaticTabSetting.windowNumSource, tmpStaticTabSetting.openType,
                        null, tmpStaticTabSetting.TitleColumn, tmpStaticTabSetting.IconColumn, tmpStaticTabSetting.inputParams, true, tmpStaticTabSetting.windowCode);
                    _this._addDynamicTabInfo(tmpTabPageData);
                }

                curTabsetObj.addTabs(newAddTabs);
            }
        }
    },

    _afterInitWidget: function(){
        //页签切换事件
        this.on("tabChange", this.TabIndexChangedAction);
    },

    getV3MethodMap: function() {
        return {
            setSelectedIndex: "setSelectedTabIndex",
            setSelectedName: "setSelectedTabName",
            selectedByName: "selectedByTabName",
	        getSelectedCode: "getSelectedTabCode",
	        setSelectedCode: "setSelectedTabCode",
            show: "showTabItem",
            hide: "hideTabItem",
            setReadOnly: "setTabReadOnly",
            setVisible: "setTabVisible",
            selectedByIndex: "selectedTabByIndex",
            setEnabled: "setTabEnabled",
            getSelectedIndex: "getSelectedTabIndex",
            showItem: "_showItem",
            hideItem: "_hideItem"

        }
    },
    /**
    * 加载实体记录
    * */
    loadRecord: function (widget, dynamicPageData, curTabsetObj) {
        var _this = this;
        var dynamicTabSetting = dynamicPageData.WindowTabSetting.dynamicTabSetting;
        var dynTabSettingInputParams = dynamicTabSetting.inputParams;
        return function (params) {
            // 加载实体数据
            if (widget.tabSetObj) {
                var preTabs = widget.tabSetObj.tabs || [];
                if (preTabs && preTabs.length > 0) { //已加载数据要清空
                    var removeIds = [];
                    var removeTabs = [];
                    for (var i = preTabs.length - 1; i >= 0; i--) {
                        var tab = preTabs[i];
                        var dataid = tab.dataid;
                        if (dataid) {
                            removeIds.push(dataid);
                            removeTabs.push(tab);
                        }
                    }
                    widget.tabSetObj.removeTabs(removeTabs);
                    _this._removeDynamicTabInfoByDataIds(removeIds);
                }
            }
            var newAddTabs = _this.genTabs(params, widget, dynamicTabSetting, dynTabSettingInputParams);
            if (newAddTabs.length !== 0) {
                curTabsetObj.addTabs(newAddTabs, dynamicTabSetting.seq || dynamicTabSetting.seq === 0 ? dynamicTabSetting.seq : null);
                if (dynamicTabSetting.seq === 0) {
                    curTabsetObj.selectTab(0);
                }
            }
        }
    },

    getOpenWindowInputParams: function(mappingItems, entityFieldValue) {
		var variable = {};
		if (mappingItems) {
			
			for (var i = 0; i < mappingItems.length; i++) {
				var mappingItem = mappingItems[i],
					target = mappingItem["paramName"],
					source = mappingItem["paramValue"],
					type = mappingItem["paramType"] + "";

				if (type === "expression") { //表达式
                    var expressionValue = this._expressionHandler(source);
					variable[target] = expressionValue;
				}else if(type === "entityField"){
					variable[target] = entityFieldValue[source];
				}
			}
		}
		var retValue = {
			"variable": variable
		};
		return retValue;
	},

    /**
     * 新增记录
    * */
    insertRecord: function (widget, dynamicPageData, curTabsetObj) {
        return function (params) {
            var dynamicTabSetting = dynamicPageData.WindowTabSetting.dynamicTabSetting;
            var dynTabSettingInputParams = dynamicTabSetting.inputParams;
            var newAddTabs = _this.genTabs(params, widget, dynamicTabSetting, dynTabSettingInputParams);
            if (newAddTabs.length !== 0) {
                var index = params.datasource.getIndexById(newAddTabs[0].dataid);
                if (widget._preStaticTab.length > 0) {//有前置页签，位置就是第一条新增记录加上前置页签长度
                    index += widget._preStaticTab.length;
                }
                curTabsetObj.addTabs(newAddTabs, index);
            }
        }
    },
    currentRecord: function(widget, dynamicPageData, curTabsetObj){
        var _this = this;
        return function(params){
            var current = params.currentRecord;
            var id = current.getSysId();
            var tabIndex = 0;
            var tabs = widget.tabSetObj && widget.tabSetObj.tabs || [];
            for (var i = 0, len = tabs.length; i < len; i++) {
                var tab = tabs[i];
                if(tab.dataid == id){
                    tabIndex = i;
                }
            }
            _this.tabSetObj._tabBar.selectTab(tabIndex);
        }
    },
    /**
     * 更新记录
     * */
    updateRecord: function (widget, dynamicPageData, curTabsetObj) {
        var _this = this;
        return function (params) {
            var dynamicTabSetting = dynamicPageData.WindowTabSetting.dynamicTabSetting;
            var updateDatas = params.resultSet.datas;
            if (!updateDatas || updateDatas.length < 1) {
                return;
            }
            var iconFiledName = dynamicTabSetting.IconColumn,
                winCodeFieldName = dynamicTabSetting.WindowColumn,
                comCodeFieldName = dynamicTabSetting.ComponentColumn,
                tabTitleFieldName = dynamicTabSetting.TitleColumn;
            var tabs = curTabsetObj.tabs;
            var tabMap = {};
            for (var i = 0, len = tabs.length; i < len; i++) {
                var tab = tabs[i];
                tabMap[tab.dataid] = tab;
            }
            var selectTabDataid = curTabsetObj.getSelectedTab() && curTabsetObj.getSelectedTab().dataid;
            for (var i = 0, len = updateDatas.length; i < len; i++) {
                var record = updateDatas[i];
                var changeData = record.getChangedData();
                var data = record.toMap();
                var dataid = data.id;
                var tab = tabMap[dataid];
                if (!tab) {
                    continue;
                }
                var tabInfo = _this._getDynamicTabInfoByDataid(dataid);
                if (!tabInfo) {
                    continue;
                }
                var changeTitle = false;
                if (changeData.hasOwnProperty(iconFiledName) || changeData.hasOwnProperty(tabTitleFieldName)) {
                    var newTitle = "<span class='" + data[iconFiledName] + "'></span>" + data[tabTitleFieldName];
                    curTabsetObj.setTabTitle(tab, newTitle);
                }
                var isChange = _this._hasChangeParam(tabInfo.entityFieldValue, data);
                if (changeData.hasOwnProperty(comCodeFieldName) ||
                    changeData.hasOwnProperty(winCodeFieldName) || isChange) {//改变打开的窗体
                    tabInfo["comCode"] = data[comCodeFieldName];
                    tabInfo["winCode"] = data[winCodeFieldName];
                    _this._markDynamicTabWindowNotOpen(tabInfo);
                    if (selectTabDataid == dataid && widget.renderTabWindow) {
                        _this.renderTabWindow();
                    }
                }
            }
        }
    },
    /**
     * 删除记录
     * */
    deleteRecord: function (widget) {
        var _this = this;
        return function (params) {
            var resultDatas = _this._getChangeRecord(params);
            if (resultDatas.length > 0) {
                var dataids = [];
                var tabMap = {};
                var removeTabs = [];
                var preTabs = widget.tabSetObj && widget.tabSetObj.tabs || [];
                for (var i = 0, len = preTabs.length; i < len; i++) {
                    var tab = preTabs[i];
                    tabMap[tab.dataid] = tab;
                }
                for (var i = 0, len = resultDatas.length; i < len; i++) {
                    var data = resultDatas[i];
                    var dataid = data.id;
                    var tab = tabMap[dataid];
                    if (tab) {
                        removeTabs.push(tab);
                    }
                    dataids.push(dataid);
                }
                //目前删除顺序原因：先删除打开信息，再删除页签时不会因为触发因页签选中而渲染已删除页签里面内容报错的问题
                _this._removeDynamicTabInfoByDataIds(dataids);
                widget.tabSetObj.removeTabs(removeTabs);
            }
        }
    },

    /**
     * 根据数据生成页签列表
     * */
    genTabs: function (params, widget, dynamicTabSetting, dynTabSettingInputParams) {
        var _this = this;
        var newAddTabs = [];
        var resultDatas = this._getChangeRecord(params);
        if (resultDatas.length > 0) {
            var resultDatasLen = resultDatas.length;
            var iconFiledName = dynamicTabSetting.IconColumn,
                winCodeFieldName = dynamicTabSetting.WindowColumn,
                comCodeFieldName = dynamicTabSetting.ComponentColumn,
                tabTitleFieldName = dynamicTabSetting.TitleColumn;
            //当前可插入位置的总长
            var currentTabLength;
            var entityFields = [];
            if (dynTabSettingInputParams) {
                for (var i = 0, len = dynTabSettingInputParams.length; i < len; i++) {
                    var mappingItem = dynTabSettingInputParams[i],
                        target = mappingItem["paramName"],
                        source = mappingItem["paramValue"],
                        type = mappingItem["paramType"];

                    if (type + "" === "entityField") { //实体字段
                        entityFields.push(source);
                    }
                }
            }
            for (var j = 0; j < resultDatasLen; j++) {
                var tmpObj = resultDatas[j];
                var icon = tmpObj[iconFiledName] || "";
                var title = tmpObj[tabTitleFieldName] || "";
                var id = tmpObj.id;
                if (j == 0) {
                    currentTabLength = params.datasource.getIndexById(id);
                    if (widget._preStaticTab.length > 0) {//有前置页签，位置就是第一条新增记录加上前置页签长度
                        currentTabLength += widget._preStaticTab.length;
                    }
                }
                var tab = {
                    title: "<span class='" + icon + "'></span>" + title,
                    dataid: tmpObj.id,
                    pane: _this.genTabPanel(widget)
                };
                newAddTabs.add(tab);
                resultDatas[j].isDynamicEntity = true;
                var tmpTabPageData = _this.addtabPageData(tmpObj[winCodeFieldName], null, null, tmpObj[comCodeFieldName], title,
                    icon, dynTabSettingInputParams, false);
                var entityFieldValue = {};
                for (i = 0, len = entityFields.length; i < len; i++) {
                    var code = entityFields[i];
                    entityFieldValue[code] = tmpObj[code];
                }
                //保存当前实体字段值
                tmpTabPageData.entityFieldValue = entityFieldValue;
                tmpTabPageData.dataid = id;
                _this._addDynamicTabInfo(tmpTabPageData, currentTabLength);
                currentTabLength++;
            }
        }
        return newAddTabs;
    },

	genTabPanel: function(widget){
		var isContentHeight = widget.MultiHeight == "content";
		var tabAppearance = widget.TabAppearance;
		var alignment = widget.Alignment;
		var _paneCanvas = isc.Canvas.create({
			autoDraw: false,
			width: "100%",
			height: "100%",
			overflow: isContentHeight ? "visible" : "auto",
			contents: null
		});
		var layout;
		var pros = {
			autoDraw: false,
			width: "100%",
			height: "100%",
			overflow: isContentHeight ? "visible" : "hidden",
			members: [_paneCanvas]
		};
		if (tabAppearance == "line")
			if (alignment == "top")
				pros.layoutTopMargin = 8,
				layout = isc.VLayout.create(pros);
			else if (alignment == "bottom")
				pros.layoutBottomMargin = 8,
				layout = isc.VLayout.create(pros);
			else if (alignment == "left")
				pros.layoutLeftMargin = 8,
				layout = isc.HLayout.create(pros);
			else
				pros.layoutRightMargin = 8,
				layout = isc.HLayout.create(pros);
		else if (tabAppearance == "card") {
			pros.layoutMargin = 8;
			layout = isc.HLayout.create(pros)
		}
		return layout;
	},

    addtabPageData: function (windowCode, windowNumSource, openType, componentCode, title, icon, inputParams, isStaticTabPage) {
        var tmpTabPage = {};

        if (openType && openType === "dynamic") {
            tmpTabPage.winCode = this._expressionHandler(windowNumSource);
        } else if (openType && openType === "appoint")
            tmpTabPage.winCode = windowCode
        else if (openType + "" === "null")
            tmpTabPage.winCode = windowCode
        tmpTabPage.comCode = isStaticTabPage ? this.componentCode : componentCode;
        tmpTabPage.openType = openType;
        tmpTabPage.inputParams = inputParams;
        tmpTabPage.isStaticTabPage = isStaticTabPage;
        return tmpTabPage;
    },

    _getChangeRecord: function(params){
        var records = [];
        if (params.resultSet && params.resultSet.datas && params.resultSet.datas.length > 0) {
            var resultDatas = params.resultSet.datas;
            var resultDatasLen = resultDatas.length;
            if (resultDatasLen !== 0) {
                for(var i = 0;i<resultDatasLen;i++){
                    var data = resultDatas[i];
                    if(data.toMap){//插入的数据是Record
                        records.push(data.toMap());
                    }else{//加载的数据是map
                        return resultDatas;
                    }
                }
            }
        }
        return records;
    },

    setTabHeaderStyle: function () {
        // 调整竖直方向tab头高宽

        if ((this.Alignment + "").toLowerCase() === "left" || (this.Alignment + "").toLowerCase() === "right") {
            var tabs = this.tabSetObj && this.tabSetObj.tabs;
            var tabWidth = Number(this.TabHeadWidth) > 0 ? Number(this.TabHeadWidth) : 110;
            for (var i = 0, len = tabs.length; i < len; i++) {
                var tmpBar = tabs[i];
                if (tmpBar) {
                    tmpBar.width = tabWidth;
                    tmpBar.height = 38;
                    tmpBar.overflow = "ignore"; //处理IE9显示问题
                }
            }
        }
    },

    /**
     *触发控件事件 
    */
    fireEvent: function (eventName) {
        var eventHandler = this.listener[eventName];
        if (eventHandler && eventHandler.length > 0) {
            var param = [];
            for (var i = 2, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            for (var j = 0, l = eventHandler.length; j < l; j++) {
                var handler = eventHandler[j];
                handler.apply(this, param);
            }
        }
    },

    refreshCurrentTabID: function () {
        if (this.tabSetObj && this.tabSetObj.getSelectedTab() && this.tabSetObj.getSelectedTab().pane) {
            var tabID = this.tabSetObj.getSelectedTab().pane.id;
            this._selectedTabId = tabID;
        }
        this._selectedTabId = "";
    },

    setHandleDisabled: function (newState) {
        this.tabSetObj.tabBar.setDisabled(newState);
    },

    //设置选择项
    setTabSelect: function () {
        if (!this.tabSetObj.tabBar.members[this.SelectedIndex].isVisible()) {

            if (this.tabSetObj.tabs[this.SelectedIndex]) {
                if (this.tabSetObj.tabs[this.SelectedIndex].pane && this.tabSetObj.tabs[this.SelectedIndex].pane.isVisible()) {
                    this.tabSetObj.tabs[this.SelectedIndex].pane.hide();
                }
            }
            var tabsAgo = parseInt(this.tabSetObj.tabs.length) - parseInt(this.SelectedIndex);
            var markInt = 0; //作为一个标识
            if (tabsAgo > 0) { //先搜索前面的数字
                for (var i = tabsAgo; i >= 0; i--) {
                    if (this.tabSetObj.tabBar.members[i] && this.tabSetObj.tabBar.members[i].isVisible()) {
                        this.SelectedIndex = i;
                        markInt = 1;
                        break;
                    }
                }
                if (markInt == 0) {
                    for (var j = parseInt(this.SelectedIndex); j < parseInt(this.tabSetObj.tabs.length); j++) {
                        if (this.tabSetObj.tabBar.members[j] && this.tabSetObj.tabBar.members[j].isVisible()) {
                            this.SelectedIndex = j;
                            break;
                        }
                    }
                }
            }
        }
        this.tabSetObj._tabBar.selectTab(this.SelectedIndex);
        this.refreshCurrentTabID();
    },
    _onDraw: function () {
        this.buildRelation()
        var result = this._preDrawFunc.apply(this.tabSetObj, arguments);
        for (var hideTabId in this.beforeDrawHideArray) {
            if (!this.hidenArray[hideTabId]) {
                this.hidenArray[hideTabId];
            }
        }
        for (var showTabId in this.beforeDrawShowArray) {
            if (this.hidenArray[showTabId]) {
                delete this.hidenArray[showTabId];
            }
        }
        for (var el in this.hidenArray) {
            for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
                if (this.tabSetObj.tabs[i].pane.id == this.hidenArray[el]) {
                    if (this.tabSetObj.tabBar.members[i])
                        this.tabSetObj.tabBar.members[i].hide();
                    break;
                }
            }
        }
        //兼容没有配置子页签报错的场景
        if(this.tabSetObj && this.tabSetObj.tabs && this.tabSetObj.tabs.length > 0){
            this.setTabSelect();
        }
        // if ((this.IsDynamic + "").toLowerCase() === "true" && this.tabSetObj.tabs.length !== 0)
        //     this.setTabSelect();
        // else if ((this.IsDynamic + "").toLowerCase() !== "true")
        //     this.setTabSelect();
        //draw完后，清空beforeDrawShowArray，beforeDrawHideArray
        this.beforeDrawShowArray = {};
        this.beforeDrawHideArray = {};

        this.paneConTop = this.tabSetObj.paneContainer.getTop();
        // draw完后执行是否显示页签头
        if (this.TabBarVisible + "" === "false") {
            this.handleTabBarVisible(false);
            this.shrinkElementOnHide = true
        }

        // 处理设置滚动条方向
        var $paneContaner = this.tabSetObj && this.tabSetObj.paneContainer && this.tabSetObj.paneContainer.getClipHandle && $(this.tabSetObj.paneContainer.getClipHandle());
        if ($paneContaner && $paneContaner.length == 1) {
            var _isShowScrollbar = (this.IsShowScrollbar + "").toLowerCase(),
                _scrollbarDir = this.ScrollbarDir + "";
            if (_isShowScrollbar === "true") {
                if (_scrollbarDir === "vertical") {
                    $paneContaner.css({
                        "overflow-x": "hidden",
                        "overflow-y": "auto"
                    });
                } else if (_scrollbarDir === "horizontal") {
                    $paneContaner.css({
                        "overflow-y": "hidden",
                        "overflow-x": "auto"
                    });
                }
            }
        }

        return result;
    },
    //处理页签头是否隐藏时，页签页的位置
    handleTabBarVisible: function (show) {
        // 处理页签头隐藏后，页签容器需重新布局，占满页签头位置
        var paneContainer = this.tabSetObj.paneContainer;
        var paneConHeight = paneContainer.getHeight();
        if (show) {
            this.tabSetObj.showTabBar = true;
            this.tabSetObj.tabBar.show();
            this.tabSetObj.paneContainer.setTop(this.paneConTop);
            this.tabSetObj.paneContainer.setHeight(paneConHeight - this.paneConTop);
            this.tabSetObj.paneContainer.setOverflow("visible");
            this.tabSetObj.paneContainer.setOverflow("visible");
            this.tabSetObj.tabBarControlLayout.show();
            this.tabSetObj.$8g && this.tabSetObj.$8g.show(); //页签栏底部白线
        } else {
            this.tabSetObj.showTabBar = false;
            this.tabSetObj.tabBar.hide();
            this.tabSetObj.paneContainer.setTop(0);
            this.tabSetObj.paneContainer.setHeight(this.paneConTop + paneConHeight);
            // 处理神坑的滚动条，暂时方案 待优化 -- 子控件列表 fill 
            var curOverflow = this.tabSetObj.paneContainer.getOverflow();
            var newOverflow = "hidden";
            if (curOverflow !== newOverflow) {
                this.tabSetObj.paneContainer.setOverflow(newOverflow);
                this.tabSetObj.paneContainer.setOverflow(curOverflow);
            }
            this.tabSetObj.tabBarControlLayout.hide();
            this.tabSetObj.$8g && this.tabSetObj.$8g.hide(); //页签栏底部白线
        }
    },

    /**
     * 是否是简约显示风格
     */
    isLineAppearance: function () {
        return this.TabAppearance == 'line';
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

    /**
     * 隐藏一个tab
     * 
     * @param {str}
     */
    hideItem: function (id) {
        var tabs = this.findTabByID(id);
        if (tabs) {
            if (this.tabs && tabs[0]) {
                for (var i = 0, num = this.tabs.length; i < num; i++) {
                    if (this.tabs[i].title == tabs[0].title) {
                        this.tabs[i]["show"] = false;
                    }
                }
            }
            if (this.tabSetObj.isDrawn()) {
                tabs[0].pane.hide();
                this.tabSetObj.tabBar.getButton(tabs[0]).hide();
                this.tabSetObj.delayCall("fixLayout");
                this.setTabSelect();
            } else {
                this.beforeDrawHideArray[id] = id;
            }
        }
    },

    showTabItem: function(tabPageId) {
		this.showItem(tabPageId);
	},

    hideTabItem: function(tabPageId) {
		this.hideItem(tabPageId);
	},
    
    /**
     * 显示一个tab
     * 
     * @param {str}
     */
    showItem: function (id) {
        var tabs = this.findTabByID(id)
        if (tabs) {
            if (this.tabs && tabs[0]) {
                for (var i = 0, num = this.tabs.length; i < num; i++) {
                    if (this.tabs[i].title == tabs[0].title) {
                        this.tabs[i]["show"] = true;
                    }
                }
            }
            delete (this.hidenID[tabs[0].pane.id]);
            if (this.tabSetObj.isDrawn()) {
                this.tabSetObj.tabBar.getButton(tabs[0]).show();
                this.tabSetObj.delayCall("fixLayout");
            } else {
                this.beforeDrawShowArray[id] = id;
            }

            var _selectTab = this.tabSetObj.getSelectedTab();

            if (!_selectTab || !_selectTab.pane.isVisible() || this.tabSetObj.tabBar.tabs.length === 1) {
                // 处理当所有页签为隐藏状态， 显示某个tab时无法显示对应tab内容
                var tmpTab = !_selectTab || this.tabSetObj.tabBar.tabs.length === 1 ? tabs[0] : _selectTab;

                tmpTab.pane.show();
                this.tabSetObj._tabBar.selectTab(this.tabSetObj.getTabNumber(tmpTab));
                this.refreshCurrentTabID()
            }
        }
    },

    selectedById:function(tabIndex) {
		var tabs = this.findTabByID(tabIndex);
		if (tabs && tabs.length > 0) {
			this.tabSetObj.selectTab(tabs[0]);
		}
	},

    enabledItem: function (id) {
        var tabs = this.findTabByID(id);
        if (tabs) {
            this.tabSetObj.enableTab(tabs[0]);
        }
    },

    disabledItem: function (id) {
        var tabs = this.findTabByID(id);
        if (tabs) {
            this.tabSetObj.disableTab(tabs[0]);
        }
    },

    readonlyItem: function (id) {
        var tabs = this.findTabByID(id);
        if (tabs) {
            var tempTab = tabs[0];
            if (tempTab && tempTab.pane.children) {
                for (var j = 0, len = tempTab.pane.children.length; j < len; j++) {
                    var child = tempTab.pane.children[j];
                    if (child.setReadOnly) {
                        child.setReadOnly(true);
                    }
                }
            }
        }
    },

    writableItem: function (id) {
        var tabs = this.findTabByID(id);
        if (tabs) {
            var tempTab = tabs[0];
            if (tempTab && tempTab.pane.children) {
                for (var j = 0, len = tempTab.pane.children.length; j < len; j++) {
                    var child = tempTab.pane.children[j];
                    if (child.setReadOnly) {
                        child.setReadOnly(false);
                    }
                }
            }
        }
    },

    getIsDynamic: function(widgetId){
		return this.IsDynamic;
	},

    /**
     * 通过ID的名称，查找tab
     * 
     * @param {str}
     */
    findTabByID: function (id) {
        var tab = null;
        for (var i = 0; i < this.tabSetObj.tabs.length; i++) {
            if (id == this.tabSetObj.tabs[i].pane.id) {
                tab = [this.tabSetObj.tabs[i]]
            }
        }
        return tab;
    },

    /**
     * 通过ID的名称，查找tab,并添加入控件到该tab
     * 
     * @param {str}
     */
    addTabPaneCons: function (id, cons) {
        var tabs = this.findTabByID(id);
        if (tabs) {
            tabs[0].pane.addChild(cons);
        }
    },

    /**
     * 通过title的名称，选中tabs
     * 
     * @param {str}
     */
    selectedByName: function (title) {
        var tabObj = this.tabSetObj.tabs.find('title', title);
        if (tabObj) {
            this.tabSetObj._tabBar.selectTab(tabObj);
            this.refreshCurrentTabID();
        }
    },

    selectedByTabName: function(tabName) {
		this.selectedByName(tabName);
	},

    /**
     * 通过页签名来设置选中状态
     * @param title
     */
    setSelectedName: function (title) {
        this.selectedByName(title);
    },

    setSelectedTabName: function(title) {
		var num = this.getSelectedIndex();
		this.tabSetObj.setTabTitle(this.tabSetObj.tabs[num], title);
	},

    setSelectedIndex: function (index) {
        //兼容传入数字串
        index = parseInt(index);
        if (isNaN(index)) {
            index = 0;
        }
        var tabObj = this.tabSetObj.getTabObject(index);

        if (tabObj && this.tabs[index] && this.tabs[index].show) {
            this.SelectedIndex = index;
            this.tabSetObj._tabBar.selectTab(index);
            this.refreshCurrentTabID();
        }
    },

    setSelectedTabIndex: function(state) {
		this.setSelectedIndex(state);
		var tabIndex = this.SelectedIndex;
		tabIndex == state && this.tabSelected(state);
	},

    getCurrentlyTabsIndex: function () {
        return this.tabSetObj.selectedTab;
    },

    enableTab: function (index) {
        this.tabSetObj.enableTab(index);
    },
    closeSingleTab: function (index) {
        this.tabSetObj.removeTab(this.findTabByID(index));
    },
    disableTab: function (index) {
        this.tabSetObj.disableTab(index);
    },
    selectTab: function (index) {
        this.tabSetObj.selectTab(index);
        this.refreshCurrentTabID();
    },
    getTabObject: function (index) {
        this.tabSetObj.getTabObject(index);
    },
    showTab: function (index) {
        this.tabSetObj._showTab(index);
    },
    tabSelected: function (index) {
        this.tabSetObj.tabSelected(index);
        this.refreshCurrentTabID();
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
    setTitle: function (id, title) {
        var tabs = this.findTabByID(id)
        if (tabs) {
            this.tabSetObj.setTabTitle(tabs[0], title);
        }
    },
    //设置某页签的背景色
    setPageBackColor: function (id, color) {
        var tabs = this.findTabByID(id)
        if (tabs && tabs.length > 0) {
            color = this.parseColor(color);
            tabs[0].pane.setBackgroundColor(color);
        }
    },
    addTabs: function (tabs) {
        this.tabSetObj.addTabs(tabs);
        this.refreshCurrentTabID();
    },
    setTabDisabled: function (index, isboolea) {
        this.tabSetObj.setTabDisabled(index, isboolea);
    },

    getSelectedIndex: function () {
        return this.SelectedIndex;
    },

    // 取某个tab的布局属性
    getTabLayoutType: function (tabId) {
        var tabs = this.findTabByID(tabId);
        if (tabs) {
            return tabs[0].layoutType;
        }
        return null;
    },
    // 取某个tab的布局器
    getTabLayout: function (tabId) {
        var tabs = this.findTabByID(tabId);
        if (tabs) {
            return tabs[0].layout;
        }
        return null;
    },

    // 放在容器中按布局排版时设置比例
    setPercentWidth: function (percentWidth) {
        this.Super("setPercentWidth", arguments);
        //this.tabSetObj.setWidth(percentWidth);
        this.tabSetObj.setWidth("100%");
    },
    setPercentHeight: function (percentHeight) {
        this.Super("setPercentHeight", arguments);
        //this.tabSetObj.setHeight(percentHeight);
        this.tabSetObj.setHeight("100%");
    },
    /**
     *建立父子关系 
     */
    buildRelation: function () {
        var componentId = this.getComponentId();
        var componentIndex = isc.JGComponent.getComponentIndex(componentId);
        var tabPageIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
        if (tabPageIds && tabPageIds.length > 0) {
            for (var i = 0, tabPageId; tabPageId = tabPageIds[i]; i++) {

                var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, tabPageId);
                if (childrenIds && childrenIds.length > 0) {
                    for (var j = 0, childId; childId = childrenIds[j]; j++) {
                        var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                        var child = isc.JGWidgetManager.getWidget(childRefId);
                        if (!child) continue;

                        this.addWidgets(this, child);

                    }
                }
            }
        }

    },

    // 根据页签 code 设置选中的页签
    setSelectedCode: function (code) {
        var tabObj = this.tabSetObj.tabs.find('code', code);
        if (tabObj) {
            this.tabSetObj._tabBar.selectTab(tabObj);
            this.refreshCurrentTabID();
        }
    },
    
    setSelectedTabCode: function(code) {
		this.setSelectedCode(code);
	},

    // 获取选中的页签 Code
    getSelectedCode: function () {
        return this.tabSetObj.getSelectedTab().code;
    },

    getSelectedTabCode: function() {
		return this.getSelectedCode();
	},

    getActiveChildWidgets: function () {
        if (this.getVisible && !this.getVisible() || this.isVisible && !this.isVisible()) { //当前控件不显示，直接返回null
            return null;
        }
        var result = [this.code];
        var tabPageCode = this.getSelectedTabCode();
        if (tabPageCode) {

            var relationWidgets = this.widgetChildren(tabPageCode, false);
            if (relationWidgets) {
                for (var i = 0, len = relationWidgets.length; i < len; i++) {
                    var childWidget = this.getWidgetContextProperty(relationWidgets[i]);
                    if (!childWidget.getActiveChildWidgets) {
                        if (childWidget.getVisible && childWidget.getVisible() || childWidget.isVisible && childWidget.isVisible()) { //子控件显示
                            result.push(childWidget.code);
                        }
                        continue;
                    }
                    var activeChildWidgets = childWidget.getActiveChildWidgets();
                    if (null != activeChildWidgets) {
                        result = result.concat(activeChildWidgets);
                    }
                }
            }
        }
        return result;
    },
    //获取范围配置，暂时在新布局中使用，解决左右页签头时无法显示Top的控件
    _getChildRect: function () {
        var source = this.getOrginalRect();
        var rect = [source[0], source[1]];
        if (this.TabBarVisible) { //页签头需要减去页签头的宽度
            var _Alignment = (this.Alignment + "").toLowerCase();
            var index = _Alignment == "left" || _Alignment == "right" ? 0 : 1;
            try {
                var index = 1;
                //横向页签头的高度定义在load_skin
                var tabHeadWidth = typeof (isc.TabSet.getPrototype) == "function" && isc.TabSet.getPrototype() ? isc.TabSet.getPrototype().tabBarThickness : null;
                if (_Alignment == "left" || _Alignment == "right") {
                    index = 0;
                    tabHeadWidth = this.TabHeadWidth;
                }
                var headWidth = Number(tabHeadWidth);
                if (!isNaN(headWidth)) {
                    rect[index] = rect[index] - headWidth;
                }
            } catch (e) { }
        }
        return rect;
    },
    resetLayoutMargin: function (params) { //重置布局宽度
        if (this.TabAppearance != "line") {
            return;
        }
        var _layoutXMargin = 8;
        if (window.v3PlatformSCSkin && window.v3PlatformSCSkin.TabLineSpace) {
            _layoutXMargin = window.v3PlatformSCSkin.TabLineSpace;
        }
        var _Alignment = (this.Alignment + "").toLowerCase();
        switch (_Alignment) {
            case "top":
                try {
                    delete params.layoutMargin;
                } catch (e) { }
                params.layoutTopMargin = _layoutXMargin;
                break;
            case "bottom":
                try {
                    delete params.layoutMargin;
                } catch (e) { }
                params.layoutBottomMargin = _layoutXMargin;
                break;
            case "left":
                try {
                    delete params.layoutMargin;
                } catch (e) { }
                params.layoutLeftMargin = _layoutXMargin;
                break;
            case "right":
                try {
                    delete params.layoutMargin;
                } catch (e) { }
                params.layoutRightMargin = _layoutXMargin;
                break;
        }
    },
    destroy: function () {
        this.tabSetObj = null;
        this.Super("destroy", arguments);
    },
    setEnabled: function (enabled) {
        for (var i = 0; i < this.childrenWidgets.length; i++) {
            if (this.childrenWidgets[i].type) {
                this.childrenWidgets[i].setEnabled(enabled);
            }
        }
    },
    parentDisabled: function (disabled) {
        this.setEnabled(!disabled);
    },
    validateWidget: function () {
        if (this.Visible === false) {
            return true;
        }
        var valid = true;
        var scopeId = this.scopeId;
        var tabPageIds = this.tabs
        var catalog = {};
        this._forEach(tabPageIds, function (tab, index) {
            if (tab.show === false) {
                return;
            }
            var tabValid = true;
            var childrenIds = isc.WidgetContext.getChildrenIds(scopeId, tab.id);
            this._forEach(childrenIds, function (childId, index) {
                var childRefId = isc.WidgetUtils.genWidgetRefId(scopeId, childId);
                var child = isc.JGWidgetManager.getWidget(childRefId);
                if (child.validateWidget && !child.validateWidget()) {
                    tabValid = false;
                    valid = false;
                }
            });

            // 校验不通过高亮，通过不高亮。
            this.highlightTabWithErrorClass(tab.id, !tabValid);

        }, 0, this);
        this.lastValidateResult = valid;
        return valid;
    },
    highlightTabWithErrorClass: function (code, isHighlight) {
        var errorClass = "JGTabBtnError ";
        var tabButtons = this.tabSetObj.tabBar.getButtons();

        //寻找选中的页签按钮
        var selectedTabButton = null;
        for (var index in tabButtons) {
            var tabButton = tabButtons[index];
            if (tabButton.code == code) {
                selectedTabButton = tabButton;
                break;
            }
        }
        if (selectedTabButton == null)
            return;

        //获取当前状态
        var currentHighlight;
        if (selectedTabButton.baseStyle.indexOf(errorClass) == -1) {
            currentHighlight = false;
        } else
            currentHighlight = true;

        //执行
        if (isHighlight != currentHighlight) {
            if (isHighlight) {
                tabButton.baseStyle = errorClass + selectedTabButton.baseStyle;
            } else {
                tabButton.baseStyle = selectedTabButton.baseStyle.replaceAll(errorClass, "");
            }
        }
        this.tabSetObj.tabBar.redraw()
    },
    onChildValidateResultChanged: function () {
        if (!this.lastValidateResult) {
            this.validateWidget();
        }
    },
    /**
     * 添加动态页签信息
     * @param	{Object}	info	页签信息
     * @param	{Number}	index	插入下标
     * */
    _addDynamicTabInfo: function (info, index) {
        if (!this._savedWinParams) {
            this._savedWinParams = [];
        }
        this._savedWinParams.addAt(info, index);//只是沿用原理处理逻辑
    },
    /**
     * 获取动态页签信息
     * @param	{Number}	index	插入的下标
     * */
    _getDynamicTabInfoByIndex: function (index) {
        if (this._savedWinParams) {
            return this._savedWinParams[index];
        }
    },
    /**
     * 获取动态页签信息
     * @param	{String}	index	插入的下标
     * */
    _getDynamicTabInfoByDataid: function (dataid) {
        var infos = this._savedWinParams;
        if (infos) {
            for (var i = 0, len = infos.length; i < len; i++) {
                var tab = infos[i];
                if (tab.dataid === dataid) {
                    return tab;
                }
            }
        }
    },
    /**
     * 根据dataid删除动态页签信息, 自动清理相应的打开标识
     * @param	{Array}	dataids	动态数据id
     * */
    _removeDynamicTabInfoByDataIds: function (dataids) {
        if (this._savedWinParams) {
            for (var i = this._savedWinParams.length - 1; i >= 0; i--) {
                var tab = this._savedWinParams[i];
                if (tab.dataid && dataids.indexOf(tab.dataid) != -1) {
                    var scopeId = tab._scopeId;
                    if (scopeId) {
                        _this._windowDestroy(scopeId);
                    }
                    this._savedWinParams.splice(i, 1);
                }
            }
        }
    },
    /**
     * 标记动态页签对应的窗体已经打开
     * @param	{Number}	index	页签对应的下标
     * */
    _markDynamicTabWindowOpened: function (index) {
        if (this._savedWinParams && this._savedWinParams[index]) {
            var tab = this._savedWinParams[index];
            tab["_$isOpened"] = true;
        }
    },
    /**
     * 标记动态页签对应的窗体未打开
     * @param	{Object}	tab	标记此页签未打开
     * */
    _markDynamicTabWindowNotOpen: function (tab) {
        tab["_$isOpened"] = false;
    },
    /**
     * 判断该页签页是否已经打开过
     * @param	{Object}	tab	页签页信息
     * */
    _isOpenedDynamicTabWindow: function (tab) {
        if (tab && tab["_$isOpened"]) {
            return true;
        }
        return false;
    },

    /**
     * 处理窗体替换
     * */
    handleReplaceWindowInfo: function (_openWinParam) {
        if (!_openWinParam) {
            return;
        }
        var comCode = _openWinParam.comCode;
        var winCode = _openWinParam.winCode;
        if (comCode && winCode && AppData && typeof (AppData.getWindowMapping) == 'function') {
            /* 获取窗体映射信息 */
            var windowMappingInfo = AppData.getWindowMapping({
                componentCode: comCode,
                windowCode: winCode,
            });
            /* 若窗体映射信息不为空的话，则表示是配置相应的映射信息，需替换 */
            if (windowMappingInfo != null) {
                _openWinParam.comCode = windowMappingInfo.componentCode;
                _openWinParam.winCode = windowMappingInfo.windowCode;
            }
        }
    },

    /**
     * 获取目标参数与来源参数差异的字段
     * @param	{Object}	sourceParam	来源参数，存在tab上
     * @param	{Object}	record		当前记录
     * */
    _hasChangeParam: function (sourceParam, record) {
        var hasChange = false;
        if (sourceParam && record) {
            for (var key in sourceParam) {
                if (sourceParam[key] !== record[key]) {
                    sourceParam[key] = record[key];
                    hasChange = true;
                }
            }
        }
        return hasChange;
    },
    setTabBarVisible: function(widgetId, visible){
		this.TabBarVisible = visible;
		this.tabSetObj.tabBar.setVisibility(visible);	
		this.handleTabBarVisible(visible);
	},
    
    getTabBarVisible: function(widgetId){
		return this.TabBarVisible;
	},
    getReadOnly: function(widgetId) {
		return this.isReadOnly();
	},
    setTabReadOnly: function(state) {
		this.setReadOnly(state);
	},
    getVisible: function(widgetId) {
		return this.isVisible();
	},
    setTabVisible: function(state) {
		this.setVisible(state);
	},
    getEnabled: function(state) {
		return !this.isDisabled();
	},
    selectedTabByIndex: function( tabIndex) {
		this.selectedByIndex(tabIndex);
	},
    setBackColor: function(tabPageId, color) {
		this.setPageBackColor(tabPageId, color)
	},
    setLabelText: function(tabPageId, title) {
		this.setTitle(tabPageId, title);
	},
    enabled: function(tabPageId) {
		this.enabledItem(tabPageId);
	},
    disabled: function(tabPageId) {
		this.disabledItem(tabPageId);
	},
    readonly: function(tabPageId) {
		this.readonlyItem(tabPageId);
	},
    writable: function(tabPageId) {
		this.writableItem(tabPageId);
	},
    setTabEnabled: function(state) {
		this.setEnabled(state);
	},
    getSelectedTabIndex: function(widgetId) {
		return this.getSelectedIndex();
	},
    _showItem: function(tabPageId) {
		this.showItem(tabPageId);
	},
    _hideItem: function(tabPageId) {
		this.hideItem(tabPageId);
	}


});

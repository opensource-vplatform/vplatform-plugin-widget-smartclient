/**
 * 布局管理器
 * @class JGLayoutManager
 */
isc.ClassFactory.defineInterface("JGLayoutManager");
isc.JGLayoutManager.addInterfaceProperties({

    _Layout: null

});

isc.JGLayoutManager.addInterfaceMethods({

    _processRect: function (val, proName) {
        if (this.Dock == "Fill") {
            return "100%";
        }
        if (typeof (val) == 'string') {
            if (val == 'content') {
                return null;
            } else if (val == 'space') {
                return '100%';
            } else if (val.endsWith('%')) {
                return val;
            } else if (val.endsWith('px')) {
                return parseInt(val)
            }
        }
        return val;
    },

    _forEach: function (list, func, start, context) {
        if (list && list.length > 0) {
            start = start || 0;
            for (var i = start, l = list.length; i < l; i++) {
                if (func.call(context, list[i], i, list) === false) {
                    break;
                }
            }
        }
    },

    /**
     * 对子控件进行布局
     * @method
     * @memberof JGLayoutManager
     * @instance
     * @param {String} parentId 父控件编号
     */
    layoutChildWidgets: function (parentId) {
        var members = [];
        var catalog;
        if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) { //旧窗体布局
            if (this.LayoutType == "BorderLayout") {
                var layout = this.createLayoutById(this.scopeId + "_" + this.Code);
                catalog = this.buildBorderLayoutById(layout);
                members.push(layout);
                //场景：旧窗体（BorderLayout），一个文本靠上，一个定时器
                this._resetAbsWidgetPlace(catalog.absLayout);
                var absChildren = this._layoutAbsoluteChildren(catalog);
                if (absChildren) {
                    members = members.concat(absChildren);
                }
            } else {
                members = this._getChildrenWidget(parentId);
            }
        } else { //新窗体布局
            //是否处理绝对布局的子控件
            var needHandleAbsChild = true;
            if (this.LayoutType == "BorderLayout") { //应该通过开发系统的数据升级重置为None
                if (window.console) {
                    window.console.warn("当前窗体是新布局窗体，还存在BorderLayout");
                }
                var layout = this.createLayoutById(this.scopeId + "_" + this.Code);
                catalog = this.buildBorderLayoutById(layout);
                members.push(layout);
            } else {
                if (isc.JGLayoutManager._useNewLayout) {
                    var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, parentId || this.widgetId);
                    var children = [];
                    this._forEach(childrenIds, function (childId) {
                        var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                        var child = isc.JGWidgetManager.getWidget(childRefId);
                        if (child) {
                            children.push(child);
                        }
                    }, null, this);
                    return this._newLayoutChildren(children);
                }
                catalog = this._catalogChildren(parentId);
                var direction = this._getChildrenLayoutDirection(catalog);
                this._setDockChildRect(catalog);
                if (direction == "horizontal") {
                    var layout = this._createHorizontalLayoutByCatalog(catalog);
                    members.push(layout);
                } else if (direction == "vertical") {
                    var layout = this._createVerticalLayoutByCatalog(catalog);
                    members.push(layout);
                }
                if (this.type == "JGGroupPanel" && this.ContentAlignment == "Vertical") { //场景：一个垂直排列（铺满），里面放其他排列（不配泊靠）
                    var absChildren = this._layoutAbsoluteChildren(catalog);
                    var newAbsChild = [];
                    if (absChildren && absChildren.length > 0) {
                        needHandleAbsChild = false;
                        newAbsChild = this.analyzeVLayoutChild(absChildren, true);
                        members = members.concat(newAbsChild);
                    }
                }
            }
            if (needHandleAbsChild) {
                var absChildren = this._layoutAbsoluteChildren(catalog);
                if (absChildren) {
                    members = members.concat(absChildren);
                }
            }
        }
        return members;
    },
    /**
     * 重置绝对布局控件位置（目前先处理旧窗体）
     * */
    _resetAbsWidgetPlace: function (absChilds) {
        if (!absChilds || absChilds.length < 1) {
            return;
        }
        for (var i = 0, len = absChilds.length; i < len; i++) {
            var child = absChilds[i];
            var rect = child.getOrginalRect();
            child.setWidth(rect[0]);
            child.setHeight(rect[1]);
        }
    },
    /**
     * 获取子控件
     * @param	{String}	parentId	父级id
     * @return	{Array}		子控件列表
     * */
    _getChildrenWidget: function (parentId) {
        var childWidgets = [];
        parentId = parentId ? parentId : this.widgetId;
        var scopeId = this.scopeId;
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, parentId);
        this._forEach(childrenIds, function (childId, index) {
            var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
            var child = isc.JGWidgetManager.getWidget(childRefId);
            if (child) {
                //父级不是BorderLayout时，重设子级控件宽高，场景：旧布局窗体（没BorderLayout），一个面板靠上（Top），一个面板铺满（Fill）
                var rect = child.getOrginalRect();
                child.setWidth(rect[0]);
                child.setHeight(rect[1]);
                childWidgets.push(child);
                this.addWidgets && this.addWidgets(this, child);
                if (this.ReadOnly || this.isReadOnly && this.isReadOnly()) {
                    if (child.parentReadOnly) {
                        child.parentReadOnly(true);
                    }
                }
                if (this.Enabled == false || this.isDisabled && this.isDisabled()) {
                    if (child.parentDisabled) {
                        child.parentDisabled(true);
                    }
                }
            }
        }, 0, this);
        return childWidgets;
    },
    /**
     * 将子控件分类，
     * 按泊靠区分，其中向左、向右为水平布局分为一组
     * 向上、向下为垂直布局分为一组
     * 铺满为一组
     * 锚定控件为一组
     * @returns {Object} {
     * 	hLayout : Array,
     *  vLayout : Array,
     *  fill : Widget,
     *  absLayout : Array
     * }
     */
    _catalogChildren: function (parentId, oldLayout) {
        parentId = parentId ? parentId : this.widgetId;
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, parentId);
        var catalog = {};
        this._forEach(childrenIds, function (childId, index) {
            var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
            var child = isc.JGWidgetManager.getWidget(childRefId);
            if (child) {
                var Dock = this.getChildDock(child);
                switch (Dock) {
                    case "Top":
                        if (oldLayout) {
                            oldLayout.members[0].addMember(child);
                        } else {
                            var list = catalog.vLayout || [];
                            catalog.vLayout = list;
                            list.push(child);
                        }
                        break;
                    case "Bottom":
                        if (oldLayout) {
                            oldLayout.members[2].addMember(child);
                        } else {
                            var list = catalog.vLayout || [];
                            catalog.vLayout = list;
                            list.push(child);
                        }
                        break;
                    case "Left":
                        if (oldLayout) {
                            oldLayout.members[1].members[0].addMember(child);
                        } else {
                            var list = catalog.hLayout || [];
                            catalog.hLayout = list;
                            list.push(child);
                        }
                        break;
                    case "Right":
                        if (oldLayout) {
                            oldLayout.members[1].members[2].addMember(child);
                        } else {
                            var list = catalog.hLayout || [];
                            catalog.hLayout = list;
                            list.push(child);
                        }
                        break;
                    case "Fill":
                        if (oldLayout) {
                            oldLayout.members[1].members[1].addMember(child);
                        } else {
                            catalog.fill = child;
                        }
                        break;
                    default:
                        var list = catalog.absLayout || [];
                        catalog.absLayout = list;
                        list.push(child);
                }
            }
        }, 0, this);
        return catalog;
    },
    /**
     * 获取子控件泊靠信息
     * 
     */
    getChildDock: function (child) {
        return child && child.getProperty ? child.getProperty("Dock") : "None";
    },

    /**
     * 获取子控件布局方向（1、水平布局 2、垂直布局 3、锚定布局）
     * @return 
     * vertical：垂直布局
     * horizontal：水平布局
     * absolute：锚定布局
     */
    _getChildrenLayoutDirection: function (catalog) {
        var vLayout = catalog.vLayout;
        var hLayout = catalog.hLayout;
        var fill = catalog.fill;
        var hasVLayout = vLayout && vLayout.length > 0;
        var hasHLayout = hLayout && hLayout.length > 0;
        var hasFill = fill && fill.length > 0;

        //只有垂直布局
        if (hasVLayout && !hasHLayout) {
            return "vertical";
        }
        //没有垂直布局，只有水平布局或者锚定
        if ((hasHLayout || hasFill) && !hasVLayout) {
            return "horizontal";
        }

        var rect = this.getOrginalRect();
        if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) {
            rect[0] = rect[0] - this.LayoutLeftMargin - this.LayoutRightMargin;
            rect[1] = rect[1] - this.LayoutTopMargin - this.LayoutBottomMargin;
        } else if (typeof (this._getChildRect) == "function") {
            rect = this._getChildRect();
        }
        var direction = null;
        this._forEach(catalog.vLayout, function (child) {
            var dock = child.Dock;
            if ((dock == "Top" && this._isFullDockTop(child, rect)) || (dock == "Bottom" && this._isFullDockBottom(child, rect))) {
                direction = "vertical";
                return false;
            }
        }, 0, this);
        if (direction == null) {
            this._forEach(catalog.hLayout, function (child) {
                var dock = child.Dock;
                if ((dock == "Left" && this._isFullDockLeft(child, rect)) || (dock == "Right" && this._isFullDockRight(child, rect))) {
                    direction = "horizontal";
                    return false;
                }
            }, 0, this);
        }
        if (direction == null) {
            if (catalog.fill) {
                if (catalog.vLayout) {
                    direction = "vertical";
                } else {
                    direction = "horizontal";
                }
            } else {
                direction = "absolute";
            }
            //					direction = catalog.fill ? "horizontal":"absolute";
        }
        return direction;
    },
    /**
     * 设置泊靠控件宽高
     */
    _setDockChildRect: function (catalog) {
        this._forEach(catalog.hLayout, function (child) {
            this._setHorizontalDockChildRect(child);
        }, 0, this);
        this._forEach(catalog.vLayout, function (child) {
            this._setVerticalDockChildRect(child);
        }, 0, this);
        var fillChild = catalog.fill;
        if (fillChild) {
            //var parentRect = this.getOrginalRect();
            //var childRect = fillChild.getOrginalRect();
            //fillChild.setPercentWidth(childRect[0]==parentRect[0] ? "100%":"*");
            //fillChild.setPercentHeight(childRect[1]==parentRect[1] ? "100%":"*");
            fillChild.setPercentWidth('100%');
            fillChild.setPercentHeight('100%');
        }
    },

    _layoutAbsChildren: function (absChildren) {
        var contentAlign = this.getContentAlignment();
        if (contentAlign == "Vertical") {
            var topList = [],
                middleList = [],
                bottomList = [];
            this._sortByVertical(absChildren);
            this._forEach(absChildren, function (child) {
                var vAlign = child && child.getVerticalAlign ? child.getVerticalAlign() : "Top";
                switch (vAlign) {
                    case "Top":
                        topList.push(child);
                        break;
                    case "Middle":
                        middleList.push(child);
                        break;
                    case "Bottom":
                        bottomList.push(child);
                        break;
                }
                child.layoutAlign = this._getHorizontalAlign(child);
            }, 0, this);
            absChildren = this._fillAbsoulteLayoutSpacer(topList, middleList, bottomList);
        } else if (contentAlign == "Horizontal") {
            var leftList = [],
                centerList = [],
                rightList = [];
            this._sortByHorizontal(absChildren);
            this._forEach(absChildren, function (child) {
                var hAlign = child && child.getHorizontalAlign ? child.getHorizontalAlign() : "Left";
                switch (hAlign) {
                    case "Left":
                        leftList.push(child);
                        break;
                    case "Center":
                        centerList.push(child);
                        break;
                    case "Right":
                        rightList.push(child);
                        break;
                }
                child.layoutAlign = this._getVerticalAlign(child);
            }, 0, this);
            absChildren = this._fillAbsoulteLayoutSpacer(leftList, centerList, rightList);
        } else if (contentAlign == "Table") {
            absChildren.sort(function (item, item1) {
                var rs = item.Top - item1.Top;
                if (rs != 0) {
                    return rs;
                } else {
                    return item.Left - item1.Left;
                }
            });
            this._forEach(absChildren, function (child) {
                child.setPercentWidth('100%');
            }, 0, this);
        }
        return absChildren;
    },

    /**
     * 布局锚定控件
     */
    _layoutAbsoluteChildren: function (catalog) {
        var absChildren = catalog.absLayout;
        return this._layoutAbsChildren(absChildren);
    },

    /**
     * 获取垂直位置
     */
    _getVerticalAlign: function (child) {
        var vAlign = child && child.getVerticalAlign ? child.getVerticalAlign().toLowerCase() : "top";
        return vAlign == 'middle' ? 'center' : vAlign;
    },

    /**
     * 获取水平位置
     */
    _getHorizontalAlign: function (child) {
        return child && child.getHorizontalAlign ? child.getHorizontalAlign().toLowerCase() : "left";
    },

    /**
     * 根据分类信息创建水平布局
     */
    _createHorizontalLayoutByCatalog: function (catalog) {
        var vLayout = catalog.vLayout,
            hLayout = catalog.hLayout,
            fillChild = catalog.fill;
        //根据左边距排序子控件顺序
        this._sortByHorizontal(hLayout);
        if (vLayout && vLayout.length > 0) { //存在垂直布局控件
            //垂直控件左边距
            var left = vLayout[0].Left;
            //根据上边距排序子控件顺序
            this._sortByVertical(vLayout);
            //填充垂直泊靠占位控件
            this._fillVerticalDockSpacer(vLayout, fillChild);
            //创建垂直布局控件
            var vLayoutChild = isc.VLayout.create({
                membersMargin: 8,
                members: vLayout
            });
            //确定垂直布局控件在水平布局控件中的位置
            var index = -1;
            this._forEach(hLayout, function (child, i) {
                var childLeft = child.Left;
                if (left < childLeft) {
                    index = i;
                    return false;
                }
            }, 0, this);
            index = index == -1 ? hLayout.length : index;
            hLayout.splice(index, 0, vLayoutChild);
        } else { //垂直布局控件为空时，需要确认是否需要占位控件
            //填充水平泊靠占位控件
            hLayout = this._fillHorizontalDockSpacer(hLayout, fillChild)
        }
        var hWidth;
        var hHeight;
        switch (this.Dock) {
            case "Left":
            case "Right":
                if (this.MultiWidth.endsWith("%")) {
                    hWidth = "100%";
                } else {
                    hWidth = this._processRect(this.MultiWidth, "width");
                }
                hHeight = "100%";
                break;
            case "Top":
            case "Bottom":
                hWidth = "100%";
                //						if(this.MultiHeight.endsWith("%")){
                //							hHeight = "100%";
                //						}else{
                //							hHeight = this._processRect(this.MultiHeight,"height");
                //						}
                hHeight = "100%";
                break;
            default:
                if (typeof (this._getChildRect) == "function") { //靠右
                    var _$orginRect = this._getChildRect(this.getOrginalRect());
                    hWidth = this._processRect(_$orginRect[0], "width");
                    hHeight = this._processRect(_$orginRect[1], "height");
                } else {
                    hWidth = this._processRect(this.MultiWidth, "width");
                    hHeight = this._processRect(this.MultiHeight, "height");
                }
                break;
        }
        var _membersMargin = typeof (this.getMembersMargin) == "function" ? this.getMembersMargin() : 8;
        var _layoutMargin = typeof (this.getLayoutMargin) == "function" ? this.getLayoutMargin() : 8;
        var _$params = {
            //设置默认宽度，防止布局控件宽度总和小于100导致布局使用默认宽度
            defaultWidth: 5,
            //设置默认高度，防止布局控件高度总和小于100导致布局使用默认高度
            defaultHeight: 5,
            membersMargin: _membersMargin,
            layoutMargin: _layoutMargin,
            canFocus: true,
            width: hWidth, //"100%",//this._processRect(this.MultiWidth,"width"),
            height: this.Dock == "Left" || this.Dock == "Right" ? "100%" : hHeight, //"100%",//this._processRect(this.MultiHeight,"height"),
            overflow: isc.Canvas.VISIBLE,
            members: hLayout
        }
        //页签在不同模式下的内间距不一样Task20191211102
        if (typeof (this.resetLayoutMargin) == "function") {
            this.resetLayoutMargin(_$params);
        }
        return isc.HLayout.create(_$params);
    },

    /**
     * 根据分类信息创建垂直布局
     */
    _createVerticalLayoutByCatalog: function (catalog) {
        var _membersMargin = typeof (this.getMembersMargin) == "function" ? this.getMembersMargin() : 8;
        var _layoutMargin = typeof (this.getLayoutMargin) == "function" ? this.getLayoutMargin() : 8;
        var vLayout = catalog.vLayout,
            hLayout = catalog.hLayout,
            fillChild = catalog.fill,
            layoutFactory;
        //根据上边距排列子控件顺序
        this._sortByVertical(vLayout);
        if (hLayout && hLayout.length > 0) { //存在水平布局控件
            //水平控件上边距
            var top = hLayout[0].Top;
            //根据左边距排序子控件顺序
            this._sortByHorizontal(hLayout);
            //填充水平泊靠占位控件
            this._fillHorizontalDockSpacer(hLayout, fillChild);
            //创建水平布局控件
            var hLayoutChild = isc.HLayout.create({
                membersMargin: _membersMargin,
                members: hLayout
            });
            //确定水平布局控件在垂直布局控件中的位置
            var index = -1;
            this._forEach(vLayout, function (child, i) {
                var childTop = child.Top;
                if (top < childTop) {
                    index = i;
                    return false;
                }
            }, 0, this);
            index = index == -1 ? vLayout.length : index;
            vLayout.splice(index, 0, hLayoutChild);
        } else { //只存在垂直方向控件
            this._fillVerticalDockSpacer(vLayout, fillChild);
        }
        var windowScope = scopeManager.getWindowScope();
        if (null != windowScope && windowScope.getComponentCode() == "vbase_prd_workflow" && windowScope.getWindowCode() == "PrdWorkFlowBizTableProcessOperate") {
            var _$canvas = isc.Canvas.create({
                width: "100%",
                height: 1,
                top: "8px",
                className: "VSpecialLayout",
                contents: ""
            });
            vLayout.splice(1, 0, _$canvas);
        }
        //处理页签头占宽度的问题，场景：页签头靠右、页签内放一个表单布局靠上
        var _$multiWidth = this.MultiWidth;
        if (typeof (this._getChildRect) == "function" && _$multiWidth && "space" != _$multiWidth && "content" != _$multiWidth && _$multiWidth.indexOf("%") == -1) {
            try {
                var tmpMultiWidth = parseInt(_$multiWidth);
                if (!isNaN(tmpMultiWidth)) {
                    _$multiWidth = this._getChildRect()[0];
                } else {
                    _$multiWidth = this._processRect(_$multiWidth, "width")
                }
            } catch (e) {
                _$multiWidth = this._processRect(_$multiWidth, "width")
            }
        } else {
            _$multiWidth = this._processRect(_$multiWidth, "width");
        }
        var _$params = {
            //设置默认宽度，防止布局控件宽度总和小于100导致布局使用默认宽度
            defaultWidth: 5,
            //设置默认高度，防止布局控件高度总和小于100导致布局使用默认高度
            defaultHeight: 5,
            membersMargin: _membersMargin,
            layoutMargin: _layoutMargin,
            canFocus: true,
            width: this.Dock == "Top" || this.Dock == "Bottom" ? '100%' : _$multiWidth,
            height: this.getClassName() == "JGTabControl" ? '100%' : this._processRect(this.MultiHeight, "height"),
            overflow: isc.Canvas.VISIBLE,
            members: vLayout
        }
        //页签在不同模式下的内间距不一样Task20191211102
        if (typeof (this.resetLayoutMargin) == "function") {
            this.resetLayoutMargin(_$params);
        }
        _$params.members = this.analyzeVLayoutChild(vLayout);
        return isc.VLayout.create(_$params);
    },
    analyzeVLayoutChild: function (vLayout, handleDock) {
        if (!vLayout || vLayout.length == 0) {
            return vLayout;
        }
        var newVLayout = [];
        var nowSectionStackItems = null;
        /**
         * 折叠后，sc读取了scrollHeight重新排列控件，但是超出折叠头高度的控件还是占用scrollHeight，导致后面的控件没有紧跟着折叠块，场景：
         * 1、VLayout（A）里放一个页签和一个按钮，页签里放一个VLayout（B），VLayout(B)放一个SectionStack，SectionStack放一个按钮（高度比折叠头高）
         * */
        var sectionIsExpanded = function (section) {
            var isExpand = this.Super("sectionIsExpanded", arguments);
            var items = section.items;
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                if (item.getContentElement && item.getContentElement() && item.getContentElement().parentElement && item.getContentElement().parentElement.style) {
                    var _$style = item.getContentElement().parentElement.style;
                    var isSectionStack = "SectionStack" === window[$(item.getContentElement().parentElement).attr("eventproxy")].getClassName();
                    if (isExpand && !isSectionStack) {
                        item._$sourceDisplay = _$style.display;
                        _$style.display = "none"
                    } else
                        _$style.display = item._$sourceDisplay || ""
                }
            }
            return isExpand;
        }
        var expandSection = function (section, layout) {
            this.Super('expandSection', arguments);
            var items = section.items;
            for (var i = 0, len = items.length; i < len; i++) {
                if (items[i].Visible === false) {
                    items[i].hide();
                }
            }
        }
        var parentReadOnly = function (readOnly) {
            var items = this.children;
            if (items) {
                items.callMethod("parentReadOnly", readOnly)
            }
        }
        var getSectionName = function (sectionStack) {
            var names = sectionStack.getSections();
            if (!names) {
                names = [];
            }
            return names;
        }
        /**
         * 处理分组的隐藏、显示
         * */
        var handleSectionStack = function (sectionStack, mappings) {
            var sectionNames = getSectionName(sectionStack);
            for (j = 0, _sLen = sectionNames.length; j < _sLen; j++) {
                var sectionName = sectionNames[j];
                var section = sectionStack.getSection(sectionName);
                if (section) {
                    var iden = section["_$widgetCode"];
                    if (iden && mappings[iden] && mappings[iden].setSectionStackInfo) {
                        mappings[iden].setSectionStackInfo({
                            show: (function (obj, name) {
                                return function () {
                                    if (!obj.isVisible()) { //全部子隐藏后，本身会隐藏 
                                        obj.show();
                                    }
                                    obj.showSection(name);
                                }
                            })(sectionStack, sectionName),
                            hide: (function (obj, name) {
                                return function () {
                                    obj.hideSection(name);
                                    //全部子隐藏后，需要隐藏本身 ，不然会有很大的空白
                                    var names = getSectionName(obj);
                                    var allHide = true;
                                    for (var k = 0, nLen = names.length; k < nLen; k++) {
                                        var sn = obj.getSection(names[k]);
                                        if (sn && sn.isVisible()) { //如果有一个不隐藏，都不需要隐藏本身
                                            allHide = false;
                                        }
                                    }
                                    if (allHide) {
                                        obj.hide();
                                    }
                                }
                            })(sectionStack, sectionName)
                        });
                    }
                }
            }
        }
        var widgetMapping = {};
        for (var i = 0, len = vLayout.length; i < len; i++) {
            var widget = vLayout[i];
            var widgetId = widget.widgetId;
            widgetMapping[widgetId] = widget;
            if (typeof (widget.isAssignLayout) == "function" && widget.isAssignLayout()) { //布局类控件
                if (null == nowSectionStackItems) {
                    nowSectionStackItems = [];
                }
                var info = widget.buildSectionStackItem() || {};
                info["_$widgetCode"] = widgetId;
                nowSectionStackItems.push(info);
            } else {
                newVLayout.push(widget);
            }
        }
        if (null != nowSectionStackItems) {
            var _params = {
                visibilityMode: "multiple",
                width: "100%",
                membersMargin: 8,
                defaultHeight: 5,
                vPolicy: "none",
                height: 16,
                overflow: "visible",
                sectionIsExpanded: sectionIsExpanded,
                sections: nowSectionStackItems,
                expandSection: expandSection,
                type: "JGSectionStack",
                parentReadOnly: parentReadOnly
            }
            if (handleDock && this.Dock == "fill") {
                _params.vPolicy = "fill";
                _params.overflow = "auto";
                try {
                    delete _params.height;
                    delete _params.defaultHeight;
                } catch (e) {}
            }
            var sectionStack = isc.SectionStack.create(_params);
            handleSectionStack(sectionStack, widgetMapping);
            newVLayout.push(sectionStack);
            nowSectionStackItems = null;
        }
        return newVLayout;
    },
    /**
     * 获取不同泊靠下标信息
     * @returns {Object} {
     * 		index : number 如果值为-1，则子控件泊靠为一个方向，否则为不同泊靠下标
     * 		dock  : String 泊靠
     * }
     */
    _getDiffDockIndexInfo: function (children) {
        var index = -1,
            dock = null,
            _this = this;
        this._forEach(children, function (child, i) {
            var childDock = _this.getChildDock(child);
            if (dock != null && dock != childDock) {
                index = i;
                return false;
            } else {
                dock = childDock;
            }
        }, 0, this);
        return {
            index: index,
            dock: dock
        }
    },
    /**
     * 是否包含有宽高是百分比的子控件
     */
    _hasPercentChild: function (children, proName) {
        var flag = false;
        this._forEach(children, function (child) {
            var val = child[proName];
            if (typeof (val) == 'string' && val.endsWith('%')) {
                flag = true;
                return false;
            }
        });
        return flag;
    },
    /**
     * 填充水平泊靠占位控件
     */
    _fillHorizontalDockSpacer: function (children, fillChild) {
        if (children && children.length > 0) { //存在水平波靠控件
            var indexInfo = this._getDiffDockIndexInfo(children);
            var index = indexInfo.index,
                dock = indexInfo.dock;
            if (index == -1) { //说明当前水平子控件只存在一个方向的泊靠，即全部向左或者全部向右
                if (dock == "Left") { //全部向左
                    if (fillChild) { //存在铺满控件，则添加铺满控件到最后，否则不需要占位控件
                        children.push(fillChild);
                    } else if (this._hasPercentChild(children, "MultiWidth")) { //如果子控件存在宽度按百分比，则需要占位控件
                        children.push(isc.LayoutSpacer.create({}));
                    }
                } else { //全部向右
                    //如果存在铺满控件，则铺满控件充当占位控件，否则创建占位控件
                    var placer = fillChild ? fillChild : isc.LayoutSpacer.create({});
                    //向水平布局控件列表中第一个位置插入占位控件
                    children.splice(0, 0, placer);
                }
            } else { //说明当前水平子控件存在两个方向的泊靠，即有控件泊靠向左和有控件泊靠向右
                //如果存在铺满控件，则铺满控件充当占位控件，否则创建占位控件
                var placer = fillChild ? fillChild : isc.LayoutSpacer.create({});
                //向两个泊靠方向中间插入占位控件
                children.splice(index, 0, placer);
            }
            return children;
        } else if (fillChild) { //不存在水平泊靠控件且存在铺满控件
            return [fillChild];
        }
    },

    /**
     * 填充垂直泊靠占位控件
     */
    _fillVerticalDockSpacer: function (children, fillChild) {
        var indexInfo = this._getDiffDockIndexInfo(children);
        var index = indexInfo.index,
            dock = indexInfo.dock;
        if (index == -1) { //说明当前垂直子控件只存在一个方向的泊靠，即全部向上或者全部向下
            if (dock == "Top") { //全部向上
                if (fillChild) { //存在铺满控件，则添加铺满控件到最后，否则不需要占位控件
                    children.push(fillChild);
                } else if (this._hasPercentChild(children, "MultiHeight")) { //如果子控件存在高度按百分比，则需要占位控件
                    children.push(isc.LayoutSpacer.create({}));
                }
            } else { //全部向下
                //如果存在铺满控件，则铺满控件充当占位控件，否则创建占位控件
                var placer = fillChild ? fillChild : isc.LayoutSpacer.create({});
                //向垂直布局控件列表中第一个位置插入占位控件
                children.splice(0, 0, placer);
            }
        } else { //说明当前垂直子控件存在两个方向的泊靠，即有控件泊靠向上和有控件泊靠向下
            //如果存在铺满控件，则铺满控件充当占位控件，否则创建占位控件
            var placer = fillChild ? fillChild : isc.LayoutSpacer.create({});
            //向两个泊靠方向中间插入占位控件
            children.splice(index, 0, placer);
        }
    },

    _fillAbsoulteLayoutSpacer: function (arr1, arr2, arr3) {
        var members = [];
        if (arr2.length > 0 && arr1.length == 0 && arr3.length == 0) {
            members.push(isc.LayoutSpacer.create({}));
            members = members.concat(arr2);
            members.push(isc.LayoutSpacer.create({}));
            return members;
        }
        var temp = [];
        for (var i = 0, l = arguments.length; i < l; i++) {
            var item = arguments[i];
            if (item && item.length > 0) {
                temp = temp.concat(item);
            }
            if (i + 1 < l && arguments[i + 1] && arguments[i + 1].length > 0 || (this.componentCode == "vbase_prdbizframe" && this.windowCode == "frameWindow")) {
                //if(i +1 <l){
                temp.push(isc.LayoutSpacer.create({}));
            }
        }
        for (var i = 0, l = temp.length; i < l; i++) {
            var item = temp[i];
            var cls = item.getClassName ? item.getClassName() : null;
            members.push(item);
            while (temp[i + 1]) {
                var next = temp[i + 1];
                var nextCls = next && next.getClassName ? next.getClassName() : null;
                if (cls == 'LayoutSpacer' && nextCls == 'LayoutSpacer') {
                    i++;
                } else {
                    break;
                }
            }
        }
        return members;
    },
    /**
     * 设置垂直泊靠子控件宽高
     * 宽度为100%
     * 高度为配置设定
     */
    _setVerticalDockChildRect: function (child) {
        child.setWidth('100%');
        if (child.setPercentWidth) {
            child.setPercentWidth('100%');
        }
        var multiHeight = child.MultiHeight;
        if (multiHeight == 'content') {
            //child.setHeight(5);
        } else {
            child.setHeight(multiHeight);
        }
    },
    /**
     * 设置水平泊靠控件宽高
     * 高度为100%
     * 宽度为配置设定
     */
    _setHorizontalDockChildRect: function (child) {
        child.setHeight('100%');
        if (child.setPercentHeight) {
            child.setPercentHeight('100%');
        }
        var multiWidth = child.MultiWidth;
        if (multiWidth == 'content') {
            //child.setWidth(5);
        } else {
            child.setWidth(multiWidth);
        }
    },
    /**
     * 排序水平布局中的子控件（根据左边距从小到大排序）
     */
    _sortByHorizontal: function (children) {
        if (children && children.length > 0) {
            children.sort(function (item, item1) {
                return item.Left - item1.Left;
            });
        }
    },
    /**
     * 排序垂直布局中的子控件（根据上边距从小到大排序）
     */
    _sortByVertical: function (children) {
        if (children && children.length > 0) {
            children.sort(function (item, item1) {
                return item.Top - item1.Top;
            });
        }
    },
    /**
     * 子控件是否水平方向占满整个控件
     */
    _isChildrenFullHorizontal: function (children, rect) {
        var res = true;
        this._forEach(children, function (child) {
            if (!this._isFullDockRight(child, rect)) {
                res = false;
                return false;
            }
        }, 0, this);
        return res;
    },
    /**
     * 子控件是否垂直方向占满整个控件
     */
    _isChildrenFullVertical: function (children, rect) {
        var res = true;
        this._forEach(children, function (child) {
            if (!this._isFullDockBottom(child, rect)) {
                res = false;
                return false;
            }
        }, 0, this);
        return res;
    },
    /**
     * 向左泊靠是否占满整个空间
     */
    _isFullDockLeft: function (child, rect) {
        return this._isFullDockRight(child, rect);
    },
    /**
     * 向右泊靠是否占满整个空间
     */
    _isFullDockRight: function (child, rect) {
        var selfRect = child.getOrginalRect();
        return selfRect[1] == rect[1];
    },
    /**
     * 向上泊靠是否占满整个空间
     */
    _isFullDockTop: function (child, rect) {
        return this._isFullDockBottom(child, rect);
    },
    /**
     * 向下泊靠是否占满整个空间
     */
    _isFullDockBottom: function (child, rect) {
        var selfRect = child.getOrginalRect();
        return selfRect[0] == rect[0];
    },

    //初始化一个布局器
    initLayout: function () {
        if (this.LayoutType && this.LayoutType == "BorderLayout") {
            this._Layout = this.createLayoutById(isc.WidgetUtils.genLayoutId(this.scopeId, this.getId()));
        }
    },

    buildBorderLayoutById: function (borderLayout) {
        var catalog = {};
        //取用布局排版
        var topTotalPercent = 0,
            bottomTotalPercent = 0,
            leftTotalPercent = 0,
            rightTotalPercent = 0,
            centerTotalPercent = 0;
        var topTotal = 0,
            bottomTotal = 0,
            leftTotal = 0,
            rightTotal = 0;
        var layoutId = isc.WidgetUtils.genLayoutId(this.scopeId, this.Code);
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
        if (childrenIds && childrenIds.length > 0) {
            for (var i = 0, childId; childId = childrenIds[i]; i++) {
                var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                var child = isc.JGWidgetManager.getWidget(childRefId);
                if (!child) continue;
                this.addWidgets && this.addWidgets(this, child);
                if (this.ReadOnly || this.isReadOnly && this.isReadOnly()) {
                    if (child.parentReadOnly) {
                        child.parentReadOnly(true);
                    }
                }
                if (this.Enabled == false || this.isDisabled && this.isDisabled()) {
                    if (child.parentDisabled) {
                        child.parentDisabled(true);
                    }
                }
                //布局属性
                var Dock = child.getProperty("Dock");
                var PercentWidth = child.getProperty("PercentWidth");
                var PercentHeight = child.getProperty("PercentHeight");
                var Width;
                var Height;
                if (child.getOrginalRect) {
                    //旧布局用旧数据
                    var orginalRect = child.getOrginalRect();
                    Width = orginalRect[0];
                    Height = orginalRect[1];
                } else {
                    Width = child.getProperty("Width");
                    Height = child.getProperty("Height");
                }
                //是否固定高或固定宽，Top/Bottom时是否固定高，Left/Right时是否固定宽
                var StaticLayoutSize = child.getProperty("StaticLayoutSize");
                switch (Dock) {
                    case "Top":
                        var top = borderLayout.getMember("Top_" + layoutId);
                        child.setPercentWidth("100%");
                        if (!StaticLayoutSize) {
                            child.setPercentHeight("100%");
                        }
                        top.addMember(child);
                        topTotalPercent = topTotalPercent + parseFloat(PercentHeight);
                        topTotal = topTotal + Height;

                        if (StaticLayoutSize) {
                            top.setHeight(topTotal);
                        } else {
                            top.setHeight(topTotalPercent + "%");
                        }
                        break;
                    case "Bottom":
                        var bottom = borderLayout.getMember("Bottom_" + layoutId);
                        child.setPercentWidth("100%");
                        if (!StaticLayoutSize) {
                            child.setPercentHeight("100%");
                        }
                        bottom.addMember(child);
                        bottomTotalPercent = bottomTotalPercent + parseFloat(PercentHeight);
                        bottomTotal = bottomTotal + Height;
                        bottom.setHeight(bottomTotal);

                        if (StaticLayoutSize) {
                            bottom.setHeight(bottomTotal);
                        } else {
                            bottom.setHeight(bottomTotalPercent + "%");
                        }
                        break;
                    case "Left":
                        var middle = borderLayout.getMember("Middle_" + layoutId);
                        var left = middle.getMember("Left_" + layoutId);
                        if (!StaticLayoutSize) {
                            child.setPercentWidth("100%");
                        }
                        child.setPercentHeight("100%");
                        left.addMember(child);
                        leftTotalPercent = leftTotalPercent + parseFloat(PercentWidth);
                        leftTotal = leftTotal + Width;
                        if (StaticLayoutSize) {
                            left.setWidth(leftTotal);
                        } else {
                            left.setWidth(leftTotalPercent + "%");
                        }
                        middle.setHeight(PercentHeight);
                        break;

                    case "Right":
                        var middle = borderLayout.getMember("Middle_" + layoutId);
                        var right = middle.getMember("Right_" + layoutId);
                        if (!StaticLayoutSize) {
                            child.setPercentWidth("100%");
                        }
                        child.setPercentHeight("100%");
                        right.addMember(child);
                        rightTotalPercent = rightTotalPercent + parseFloat(PercentWidth);
                        rightTotal = rightTotal + Width;
                        if (StaticLayoutSize) {
                            right.setWidth(rightTotal);
                        } else {
                            right.setWidth(rightTotalPercent + "%");
                        }
                        middle.setHeight(PercentHeight);
                        break;

                    case "Fill":
                        var middle = borderLayout.getMember("Middle_" + layoutId);
                        var center = middle.getMember("Center_" + layoutId);
                        child.setPercentWidth("100%");
                        child.setPercentHeight("100%");
                        center.addMember(child);
                        center.setWidth(PercentWidth);
                        middle.setHeight(PercentHeight);
                        break;
                    default:
                        var list = catalog.absLayout || [];
                        catalog.absLayout = list;
                        list.push(child);
                        break;
                }
                //                    //子控件的index要以组件的index为前缀
                //                    if (child.setIndexPreJoinComponentIndex) {
                //                        child.setIndexPreJoinComponentIndex(componentIndex);
                //                    }
                //                    child.buildRelation();
                //                    //添加关系（只读使能）
                //                    this.addWidgets(this, child);
                //                    if (this.ReadOnly || this.isReadOnly()) {
                //                        child.parentReadOnly(true);
                //                    }
                //                    if (this.Enabled == false || this.isDisabled()) {
                //                        child.parentDisabled(true);
                //                    }
            }
        }
        //当没有Fill控件时，保证Middle，Center占有空白值
        var middle = borderLayout.getMember("Middle_" + layoutId);
        if (middle.getHeight() == 0) {
            middle.setHeight((100 - topTotalPercent - bottomTotalPercent) + "%");
        }
        var center = middle.getMember("Center_" + layoutId);
        if (center.getWidth() == 0) {
            center.setWidth((100 - leftTotalPercent - rightTotalPercent) + "%");
        }
        return catalog;
    },

    //创建布局器
    createLayoutById: function (id) {
        var layout = isc.VLayout.create({
            autoDraw: false,
            ID: "Layout_" + id,
            width: "100%",
            height: "100%",
            //backgroundColor : this.BackColor,
            layoutLeftMargin: this.LayoutLeftMargin,
            layoutTopMargin: this.LayoutTopMargin,
            layoutRightMargin: this.LayoutRightMargin,
            layoutBottomMargin: this.LayoutBottomMargin,
            contents: '',
            canFocus: true,
            members: [
                isc.VLayout.create({
                    autoDraw: false,
                    ID: "Top_" + id,
                    height: 0,
                    contents: '',
                    canFocus: true,
                    members: []
                }),
                isc.HLayout.create({
                    autoDraw: false,
                    ID: "Middle_" + id,
                    height: 0,
                    contents: '',
                    canFocus: true,
                    members: [
                        isc.HLayout.create({
                            autoDraw: false,
                            ID: "Left_" + id,
                            width: 0,
                            contents: '',
                            canFocus: true,
                            members: []
                        }),
                        isc.HLayout.create({
                            autoDraw: false,
                            ID: "Center_" + id,
                            width: 0,
                            contents: '',
                            canFocus: true,
                            members: []
                        }),
                        isc.HLayout.create({
                            autoDraw: false,
                            ID: "Right_" + id,
                            width: 0,
                            contents: '',
                            canFocus: true,
                            members: []
                        })
                    ]
                }),
                isc.VLayout.create({
                    autoDraw: false,
                    ID: "Bottom_" + id,
                    zIndex: 100002, //指定一个相对小的zIndex，当上面有其它控件(或滚动条)时不会遮挡
                    overflow: isc.Canvas.HIDDEN, //高度设置很小时，防止溢出
                    height: 0,
                    canFocus: true,
                    contents: '',
                    members: []
                })
            ]
        });
        return layout;
    }

});
/**
 * 菜单工具类
 * @class MenuUtil
 */
isc.ClassFactory.defineClass("MenuUtil");
isc.MenuUtil.addClassMethods({

    /**
     * 根据orderNo排序菜单数据
     * @param {Array} array 菜单数据
     * @returns {Array}
     */
    systemSort: function (array) {
        return array.sort(function (a, b) {
            return a.orderNo - b.orderNo;
        });
    },

    _genMenuTable: function(item) {
        var node = {};
        if (item["id"]) {
            node.id = item["id"];
        }
        if (item["isItem"]) {
            node.isItem = item["isItem"];
        }
        if (item["menuItemType"]) {
            if (item["menuItemType"] === "win") {
                node.type = 0;
            } else if (item["menuItemType"] === "rule") {
                node.type = 1;
            } else {
                node.type = item["menuItemType"];
            }
        }
        if(item["openType"]){
        	node.openType = item["openType"];
        }
        if (item["openCompCode"]) {
            node.compCode = item["openCompCode"];
        }
        if (item["openWinCode"]) {
            node.winCode = item["openWinCode"];
        }
        if (item["requestParams"]) {
            node.params = item["requestParams"];
        }

        if (item["ruleSetComponentCode"]) {
            node.ruleCompCode = item["ruleSetComponentCode"];
        }
        if (item["ruleSetWindowCode"]) {
            node.ruleWinCode = item["ruleSetWindowCode"];
        }
        if (item["ruleSetCode"]) {
            node.ruleCode = item["ruleSetCode"];
        }
        if (item["ruleSetInputParam"]) {
            node.ruleParams = item["ruleSetInputParam"];
        }
        if (item["title"] || item["menuItemName"]) {
            node.title = item["title"] ? item["title"] : item["menuItemName"];
        }
        if (item["visible"]) {
            node.visible = item["visible"];
        }
        if (item["enabled"]) {
            node.enabled = item["enabled"];
        }
        if (item["isMore"]) {
            node.isMore = item["isMore"];
        }
        if (item["showBorder"]) {
            node.showBorder = item["showBorder"];
        }
        if (item["displayStyle"]) {
            node.displayStyle = item["displayStyle"];
        }
        if (item["appearance"]) {
            node.appearance = item["appearance"];
        }
        if (item["theme"]) {
            node.theme = item["theme"];
        }
        return node;
    },

    /**
     * 获取菜单项父节点
     * @param {Array}} menuItems 菜单数据
     * @param {Object} item 菜单项
     * @returns {Object}
     */
    _findParent: function(menuItems, item) {
        var parent = null;
        var parentId = item.parentId;
        if (menuItems) {
            for (var i = 0, len = menuItems.length; i < len; i++) {
                var node = menuItems[i];
                if (node.id == parentId) {
                    parent = node;
                    break;
                } else {
                    if (node.submenu)
                    isc.MenuUtil._findParent(node.submenu, item)
                }
            }
        }
        return parent;
    },

    /**
     * 生成菜单项数据
     * @param {Object} item 菜单数据
     * @param {String} ctype 菜单类型
     * @returns {Object}
     */
    _genMenuItem: function (item, ctype) {
        var node = {};
        node.id = item["id"];
        var langMenuItemName;
        //var lang = item["language"];
        /*if (lang) {
            langMenuItemName = resourcePackage.getLanguageItem(lang);
        }*/
        node.title = langMenuItemName ? langMenuItemName : item["menuItemName"];
        node.name = node.title;
        node.isselected = item['isSelected'];
        node.visible = item['visible'];
        if (node.visible == undefined) {
            node.visible = true;
        }
        node.enabled = item["enabled"];
        if (node.enabled == undefined) {
            node.enabled = true;
        }
        node.isMore = item["isMore"];
        node.showBorder = item["showBorder"];
        node.displayStyle = item["displayStyle"];
        node.appearance = item["appearance"];
        node.openType = item["openType"];
        node.openWinTitle = item["openWinTitle"];
        node.isItem = item["isItem"];
        node.theme = item["theme"];
        if (item["icourl"]) {
            var imgJson = isc.JSON.decode(item["icourl"]);
            if (imgJson) {
                for (var i = 0, num = imgJson.length; i < num; i++) {
                    var imgobj = imgJson[i];
                    if (imgobj && imgobj["type"] == ctype) {
                        node.source = imgobj["source"];
                    }
                    if (imgobj && imgobj["source"] == "db" && (imgobj["type"] == ctype || ctype == undefined)) {
                        node.icon = "module-operation!executeOperation?operation=FileDown&token=%7B%22data%22%3A%7B%22dataId%22%3A%22" + imgobj.img + "%22%2C%22ImageObj%22%3A%22" + imgobj.img + "%22%7D%7D";
                        node.iconSource = imgobj.source;
                    } else if (imgobj && imgobj["source"] == "url" && (imgobj["type"] == ctype || ctype == undefined)) {
                        node.icon = imgobj.img;
                        node.iconSource = imgobj.source;
                    } else if (imgobj && imgobj["source"] == "res" && (imgobj["type"] == ctype || ctype == undefined)) {
                        node.icon = "/itop/resources/" + imgobj.img;
                        node.iconSource = imgobj.source;
                    } else if (imgobj && imgobj["source"] == "icon" && (imgobj["type"] == ctype || ctype == undefined)) {
                        node.icon = imgobj.img;
                        node.iconSource = imgobj.source;
                    }
                }
            }
        }
        node.code = item["menuItemCode"];
        node.parentId = item["pid"];
        if (item.submenu) {
            node.submenu = [];
            for (var i = 0, len = item.submenu.length; i < len; i++) {
                if (item.submenu[i].visible) {
                    node.submenu.push(isc.MenuUtil._genMenuItem(item.submenu[i]));
                }
            }
        }
        return node;
    },

    /**
     * 转换成菜单数据
     * @memberof MenuUtil
     * @method
     * @static
     * @param {Array} items 菜单项
     * @returns {Array}
     */
    toMenuData: function (items) {
        if (items.length == 0) {
            return;
        } else {
            var item = items[0];
            if (!(item.hasOwnProperty("id") && item.hasOwnProperty("pid") && item.hasOwnProperty("menuItemName"))) {
                throw new Error("菜单数据格式不正确");
            }
        }
        items = isc.MenuUtil.systemSort(items);
        var nodes = [];
        var menuTable = {};
        for (var i = 0, len = items.length; i < len; i++) {
            nodes.push(isc.MenuUtil._genMenuItem(items[i], ctype));
            menuTable[items[i].id] = isc.MenuUtil._genMenuTable(items[i]);
        }
        var menuItems = [];
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            var parent = isc.MenuUtil._findParent(nodes, node);
            if (parent == null) {
                menuItems.push(node);
            } else {
                if (!parent.submenu) {
                    parent.submenu = [];
                }
                parent.submenu.push(node);
            }
        }

        if (menuItems.length > 0 && menuItems[0].submenu) {
            return [menuItems[0].submenu, menuTable];
        } else if (menuItems.length > 0) {
            // 处理按钮组控件特殊情况
            return [menuItems, menuTable];
        } else
            return;
    },

    /**
     * 从活动集获取菜单数据
     * @memberof MenuUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Function} expressionHandler 表达式处理器
     */
    getMenuDataByRuleSet: function(widget,expressionHandler) {
		var params = widget.Param && widget.Param.invokeParams;
		var backVal = {};
		for (var i = 0, num = params.length; i < num; i++) {
			var param = params[i];
			if (param["paramType"] == "expression") {
				var value = "";
				if (param["paramValue"] != "" && param["paramValue"] != null) {
                    if(!expressionHandler){
                        throw Error("未传入表达式处理器！");
                    }
					value = expressionHandler(param["paramValue"]);
				}
				backVal[param["paramCode"]] = value;
			} else if (param["paramType"] == "returnEntity") {
			}
		}
        /*if(!rulesetHandler){
            throw Error("未传入方法处理器！");
        }
        if(!widget.setDataToMenu){
            throw Error("控件没有提供setDataToMenu方法，无法设置菜单数据！控件类型："+widget.getClassName());
        }
        rulesetHandler(widget.ActivityAttribute,backVal,function(ruleSetResult) {
			if (ruleSetResult.data.result.menuJson != null) {
				var data = eval(ruleSetResult.data.result.menuJson.value)
				if (data && data.length > 0 && data[0].submenu) {
					widget.setDataToMenu(data[0].submenu, data[1]);
				}
			}
		});*/
	},

    returnEventId: function(items) {
        var eventID = items;
        if (items) {
            if (items.id) {
                eventID = items.id;
            } else if (items.target && items.target.id) {
                eventID = items.target.id;
            }
        }
        return eventID;
    },

    /**
     * 处理菜单事件
     * @memberof MenuUtil
     * @method
     * @static
     * @param {Object} widget 控件实例
     * @param {Array} items 菜单数据
     * @param {Function} handler 回调
     * @param {Function} cbFunc 执行后回调
     * @param {Function} errCallback 异常回调
     */
    menuEvent: function(widget, items, handler, cbFunc, errCallback,menuActionHandler) {
        // 处理回调函数未初始化
        if (!cbFunc || typeof cbFunc !== "function")
            cbFunc = function() {};
        var _id = isc.MenuUtil.returnEventId(items);
        if (widget.menuTable && items) {
            var item = widget.menuTable[_id];
            if(items.openWinTitle){
            	item.openWinTitle = items.openWinTitle;
            }
            if (item && item.isItem) {
                if(!menuActionHandler){
                    throw Error("未传入菜单动作处理器！");
                }
                var menuAction = menuActionHandler(item["type"]);
            	/*var menuAction = sandbox.getService("vjs.framework.extension.platform.services.view.widget.common.logic.menu.action",{
            		type : item["type"]
            	});*/
            	if(null != menuAction){
            		menuAction.doAction({
            			properties : widget,
            			data : item,
            			error: errCallback,
            			callback : cbFunc
            		});
            	}else{
            		cbFunc()
                    throw new Error("没有合适的菜单类型处理器. 菜单类型：" + item["type"]);
            	}
            } else
                cbFunc();
        } else {
            // 执行控件数据源事件
            handler.call(this, _id);
        }
    }

});
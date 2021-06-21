/**
 * 控件管理器
 * @class JGWidgetManager
 */
isc.ClassFactory.defineClass("JGWidgetManager");

isc.JGWidgetManager.addClassProperties({
    _widgetContainer: {},
    _widgetContainerForTest: {}
});

isc.JGWidgetManager.addClassMethods({

    /**
     * 获取控件实例
     * @memberof JGWidgetManager
     * @method
     * @static
     * @param {String} widgetId 控件id
     * @returns 控件实例
     */
    getWidget: function (widgetId) {
        return isc.JGWidgetManager._widgetContainer[widgetId];
    },

    /**
     * 设置控件实例
     * @memberof JGWidgetManager
     * @param {String} widgetId 控件id
     * @param {Object} obj 控件实例
     */
    putWidget: function (widgetId, obj) {
        isc.JGWidgetManager._widgetContainer[widgetId] = obj;
        isc.JGWidgetManager._widgetContainerForTest[obj.Code] = obj;
    },
    /**
     * 通过控件编码获取控件信息，适用于单页面控件
     * @param {String} widgetCode 控件编号
     * @returns {Object} 控件实例
     */ 
    getWidgetByWidgetCode: function (widgetCode) {
        return isc.JGWidgetManager._widgetContainerForTest[widgetCode];
    },
    /**
     * 销毁控件
     * @param {String} widgetId 控件id
     */
    destroy: function (widgetId) {
        delete isc.JGWidgetManager._widgetContainer[widgetId];
    }
});

isc.Page.addClassMethods({
    loadStyleSheet: function (styleSheetURL, wd, callback) {
        var url = isc.Page.getURL(styleSheetURL);
        var doc = this.getDocument();
        var elem = doc.createElement("link");
        elem.rel = "stylesheet";
        elem.type = "text/css";
        elem.href = url;
        var element = doc.body || doc.head;
        element.appendChild(elem);
    }

});

isc.Page.setAppImgDir("");
/**
 * 事件管理器
 * @interface JGEventManager
 * 
 */
isc.ClassFactory.defineInterface("JGEventManager");
isc.JGEventManager.addInterfaceMethods({
    /**
     * 注册事件回调
     * @method
     * @memberof JGEventManager
     * @instance
     * @param {String} eventName 事件名称
     * @param {Function} handler 事件回调
     */
    on: function (eventName, handler) {
        if (eventName == "ConfigChanged") {
            handler();
            if (!this.listener.hasOwnProperty(eventName)) {
                this.listener[eventName] = [];
            }
        }
        if (this.listener.hasOwnProperty(eventName)) {
            var handlers = this.listener[eventName];
            handlers.push(handler);
        } else if (eventName != "ConfigChanged") {
            throw Error("控件[" + this.getClassName() + "]不支持[" + eventName + "]事件！");
        }
    },
    /**
     * 注销事件
     * @memberof JGEventManager
     * @method
     * @instance
     * @param {String} eventName 事件名称
     */
    un: function (eventName) {
        if (this.listener.hasOwnProperty(eventName)) {
            this.listener[eventName] = [];
        } else {
            throw Error("控件[" + this.getClassName() + "]不支持[" + eventName + "]事件！");
        }
    }

});
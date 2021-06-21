/**
 * 异步事件回调处理器
 * 主要功能：在异步回调中按照注册顺序执行回调
 * 应用场景举例：按钮在点击时，禁用按钮；在异步回调中再启用
 * @class TimerEventHandler
 */
isc.ClassFactory.defineClass("TimerEventHandler");
isc.TimerEventHandler.addClassProperties({
    actions: []
});
isc.TimerEventHandler.addClassMethods({
    /**
     * 注册异步回调
     * @method
     * @memberof TimerEventHandler
     * @static
     * @param {Function} func 回调
     */
    push: function (func) {
        isc.TimerEventHandler.actions.push(func);
    },
    run_next: function () {
        while (isc.TimerEventHandler.actions.length > 0) {
            var action = isc.TimerEventHandler.actions.shift();
            action();
            setTimeout(function () {
                isc.TimerEventHandler.run_next()
            }, 10);
        }
    },
    /**
     * 开始执行异步回调
     * @method
     * @memberof TimerEventHandler
     * @static
     */
    run: function () {
        isc.TimerEventHandler.run_next();
    }
});
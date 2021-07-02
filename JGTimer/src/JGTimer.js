/**
 * V平台定时器控件
 * @class JGTimer
 * @extends JGBaseWidget
 * @mixes IWindowAop
 * @example
 * var timer = isc.JGTimer.create({
 *  TimerEvent : function(){
 *      alert("fire!");
 *  }
 * });
 * timer.startTimer();
 */
isc.ClassFactory.defineClass("JGTimer", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGTimer", "IWindowAop");

// 定义v3ui控件属性
isc.JGTimer.addProperties({
    // 是否启动
    Startup: true,

    //定时器状态
    _isStart: undefined,

    // 运行次数
    RunTimes: 0,
    // 时间间隔
    Interval: 10,
    // 定时事件
    listener: ['TimerEvent'],
    // 存储定时器返回值
    _myInterval: null
});


isc.JGTimer.addMethods({

    /**
     * 启动定时器
     * @memberof JGTimer
     * @method
     * @instance
     * @description 采用闭包封装js原生的间隔方法构造启动方法
     */

    startTimer: function () {

        if (this._isStart) {
            return; //已经启动就无需启动了
        }

        this._isStart = true;

        // 定义一个变量，存储实例化对象
        var cons = this;
        if (cons.Interval > 0) { // 间隔为0,不和逻辑..屏蔽这个情况
            var i = 1;
            this._myInterval = setInterval(
                (function () {
                    return (
                        // 循环执行体
                        function () {
                            // 执行定时器事件
                            cons._callEvent(cons, 'TimerEvent');
                            //0表式无限执行
                            if (cons.RunTimes != 0 && i == cons.RunTimes) {
                                //clearInterval(cons._myInterval);
                                cons.stopTimer();
                            }
                            i++;
                        }
                    )
                })(), this.Interval * 1000);
            // 存贮setInterval返回值，外部停止定时器用
            //isc.JGTimer._ret = this._myInterval;
        }
    },

    /**
     * 停止定时器
     * @memberof JGTimer
     * @method
     * @instance
     */
    stopTimer: function () {

        this._isStart = false;
        // 停止
        clearInterval(this._myInterval);
    },

    /**
     * 获取是否启动
     * @memberof JGTimer
     * @method
     * @instance
     * @description 初始化时，该状态为undefined，此时，定时器的状态以开发系统中设置的为准。
     * 默认规则，会对该属性进行判断，如果需要启动，则会进行启动。
     * 运行期，如果定时器启动过，则以真实的状态为准。
     * @returns {Boolean}
     */
    getStartup: function () {
        if (this._isStart) {
            return this._isStart;
        } else {
            return this.Startup;
        }

    },

    /**
     * 设置启动状态
     * @memberof JGTimer
     * @method
     * @instance
     * @param {Boolean} Startup  启动状态
     */
    setStartup: function (Startup) {
        //this.Startup = Startup;
        if (Startup) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    },

    destroy: function () {
        this.stopTimer();
        this.Super("destroy", arguments);
    },

    draw: function () { //此控件无需ui，重写该方法  xiedh 2020-11-14 Task20201113035

    },

    disabled : function(){
        this.stopTimer();
    },

    enabled : function(){
        this.start();
    },

    start : function(){
        this.startTimer();
    },
    
    dataLoaded : function(){
        if(this.Startup){
            this.startTimer();
        }
    }

});
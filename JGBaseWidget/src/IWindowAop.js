/**
 * 窗体AOP
 * @interface IWindowAop
 */
isc.ClassFactory.defineInterface("IWindowAop");

isc.IWindowAop.addInterfaceMethods({

  /**
   * 数据加载后切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   */
  dataLoaded: function () {

  },

  /**
   * 窗体初始化后切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   * 
   */
  windowInited: function () {

  },

  /**
   * 数据加载前切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   */
  beforeDataLoad: function () {

  }

});
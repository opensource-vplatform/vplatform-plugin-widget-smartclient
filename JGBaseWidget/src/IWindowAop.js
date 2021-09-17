/**
 * 窗体AOP
 * @interface IWindowAop
 */
isc.ClassFactory.defineInterface("IWindowAop");

isc.IWindowAop.addInterfaceMethods({


  /**
   * 数据加载前切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   */
  dataInitLoad: function(){

  },

  /**
   * 数据加载切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   */
  dataLoad: function(){

  },

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
   * 窗体加载事件后切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   * 
   */
  windowLoaded: function(){

  },

  /**
   * 数据加载前切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   */
  beforeDataLoad: function () {

  },

   /**
   * 数据加载后切面
   * @abstract
   * @memberof IWindowAop
   * @method
   * @instance
   */
  afterDataLoad: function(){

  },

  /**
   * 初始化控件事件
   */
  v3InitEvent: function(){

  }

});
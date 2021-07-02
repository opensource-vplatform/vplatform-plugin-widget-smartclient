/**
 * 窗体aop
 * @interface IWindowAop
 */
 isc.ClassFactory.defineInterface("IWindowAop");
 
 isc.IWindowAop.addInterfaceMethods({

   /**
    * 数据加载后切面
    * @abstract
    * @method
    * @instance
    */
    dataLoaded : function(){
        
    }

 });
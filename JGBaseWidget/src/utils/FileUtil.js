/**
 * 环境信息工具方法
 * @class FileUtil
 */
 isc.ClassFactory.defineClass("FileUtil");
 isc.FileUtil.addClassMethods({

    /**
     * 根据数据图片id获取图片路径
     * @memberof FileUtil
     * @method
     * @static
     * @param {String} id 图片数据id
     * @returns {String} 图片路径
     */
    getImageById : function(id){
        return (id==null||id=="") ? "" : "module-operation!executeOperation?operation=FileDown&token={\"data\":{\"dataId\":\""+id+"\"}}";
    }

 });
/**
 * 菜单工具类
 * @class MenuUtil
 */
 isc.ClassFactory.defineClass("I18N");
 isc.I18N.addClassMethods({

    get : function(title,desc){
        if(typeof(title)=='object'&&title.code){
            if(vdk&&vdk.i18n){
                return vdk.i18n.get(title);
            }else{
                return title.defaultVal;
            }
        }
        return title;
    },

    isUseLanguage: function(tag){
        if(vdk&&vdk.i18n){
            return vdk.i18n.isUseLanguage(tag);
        }
        return false;
    }

 });
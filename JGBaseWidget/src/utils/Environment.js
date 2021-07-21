/**
 * 环境信息工具方法
 * @class Environment
 */
 isc.ClassFactory.defineClass("Environment");
 isc.Environment.addClassMethods({

    /**
     * 将css脚本应用到页面中
     * @memberof Environment
     * @method
     * @static
     * @param {String} css css脚本
     */
    parseCssStr: function(css){
		if(css){
			var wrapDiv = document.getElementById("_$styleWrapDiv");
	        if (!wrapDiv) {
	            wrapDiv = document.createElement("div");
	            wrapDiv.setAttribute("id", "_$styleWrapDiv");
	            wrapDiv.setAttribute("style", "display:none;");
	            document.body.appendChild(wrapDiv)
	        }
	        var styleDom = wrapDiv.children[0];
	        if(styleDom){
	        	css = styleDom.innerHTML + css;
	        }
	        var html = "_<style id='cslk'>" + css + "</style>";
	        wrapDiv.innerHTML = html;
		}
	}

 });
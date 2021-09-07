 
var seaConfig =  {  
        // 只定base目录，类似java中的src目录  
        base: null,  
        // 目录长的可以声明别名, 这点十分人性化  
        alias: {
            /*//v平台的svn路径
            controls:'11chart/resources/page/itop/v3/controls',//chart所在的目录,不要chart
            wooui:'06runtime/resources/page/itop/v3/controls/wooui/v3ui'
            */
             //调试路径:
            controls:'less',//chart所在的目录,不要chart
            wooui:'v3ui'
            
        }
        // 下面配置自己理解  
        /*charset: 'utf-8',  
        timeout: 20000,  
        debug: 0  */
    };
var seajs = null;

(function(){
	var scripts = document.getElementsByTagName('script');
    var baseScript = scripts[scripts.length - 1];
    var uri = baseScript.baseURI;
    if(baseScript.hasAttribute){
        uri = baseScript.src ;// non-IE6/7
    }
    else{
        uri = baseScript.getAttribute('src', 4);
    }
    

	var KEY="01source";
    var urls = ["06runtime/resources/page/itop/common/wooui/jquery-1.4.2.js",
        "06runtime/resources/page/itop/common/wooui/thirdpart/seajs/sea-debug.js",
        "06runtime/resources/page/itop/common/wooui/wooui.js"];
    //v平台的svn路径
    seaConfig.alias.controls = '11chart/resources/page/itop/v3/controls';//chart所在的目录,不要chart
    seaConfig.alias.wooui = '06runtime/resources/page/itop/v3/controls/wooui/v3ui';

    //tomcat调试路径
    if('tomcat'=='tomcat'){
        KEY="Trunk";
        urls = ["jquery-1.4.4.js","thirdpart/seajs/sea-debug.js","src/woo.js","src/component.js"];
        seaConfig.alias.controls = 'less';//chart所在的目录,不要chart
        seaConfig.alias.wooui = 'v3ui';
    };
    var idx = uri.indexOf(KEY);
	if(idx<=0){
		alert("找不到'" + KEY + "'不能定位,请替换根目录的关键字!!");
		return ;
	}
    seaConfig.base =  uri.substring(0,idx+KEY.length+1),index =0;
    
    
    var head = document.getElementsByTagName('HEAD')[0];
    loadScript(seaConfig.base + urls[index],loadCallBack); 

    ///////////////////////////////
    function loadCallBack(){
        index ++;
        if(index < urls.length)
            loadScript(seaConfig.base + urls[index],loadCallBack); 
        else{
            startWait();//递归
        }
    }

    function loadScript(url, callback) {
        var node = document.createElement("script"); 
        node.type = "text/javascript";  
        node.src = url;
        head.insertBefore(node, head.firstChild);

        if (node.addEventListener) {
            node.addEventListener('load', callback, false);
            node.addEventListener('error', function(){
                alert("加载出错:" + url);
            }, false);
        }
        else { // for IE6-8
            node.attachEvent('onreadystatechange', function() {
                var rs = node.readyState;
                if (rs === 'loaded' || rs === 'complete') {
                    callback();
                }
            });
        }
    }

    function startWait(){
        seajs.config(seaConfig); 
        if(window.startDraw){
            startDraw();
        }
        else{
            alert("请定义 startDraw()方法作为开始方法");
        }
    }
    
})(); 
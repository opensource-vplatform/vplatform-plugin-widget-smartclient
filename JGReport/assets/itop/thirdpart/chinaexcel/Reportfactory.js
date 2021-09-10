/**分组报表数据源*/
define(function(require, exports, module) {
	var contextPath=module.id.substr(0,module.id.lastIndexOf("/"));

    /**是否已安装控件标志,为空表示安装成功，否则为错误信息*/
    var activeErrMessage = null;

	//var ReportMap = {};
    function V3Report(){
        this._reportId = null;
        /** 配置 */
        this._config = null;
        this._configXml = null;
        /**是否已加载数据*/
        this._isload = false;
        /** 超级报表的数据源xml格式 */
        this._dataSet = null;
        /** 容器{String} */
        this._containerId = null;
        

        V3Report.prototype.getReportId = function(){
            return this._reportId;
        }
        /**
        * 创建报表对象，并且创建成功后执行回调方法
        * 只要ID不变，重复执行不影响
        */
        V3Report.prototype.createReportObject = function(id){
            if(this._reportId!=null){
                return this._reportId;
            }
            this._setContainer(id);
            var reportId = "chinaExcel_" + id;
            if($("#"+reportId).length>0){
                this._reportId=reportId; //已创建对象，不要重复创建
                return reportId;
            }
            var container = $('#' + id)  ,toolbar=container.children('#tools_'+id);
            var height = "100%";
            if(toolbar.height() >0){
                height = container.height() - toolbar.height();
                if(height<20) height='92%';
            }

            var _ocx = document.createElement("object");
            _ocx.setAttribute("style","background: #FFFFFF; LEFT: 0px; TOP: 0px;");
            _ocx.setAttribute("width","100%");
            _ocx.setAttribute("height",height);
            _ocx.setAttribute("id",reportId);
            _ocx.setAttribute("codeBase",contextPath +"/chinaexcelweb3.9.4.cab#version=3,9,4,0");
            //CODEBASE='../cab/chinaexcelweb.cab#version=3,8,5,0'
            _ocx.setAttribute("classid","CLSID:15261F9B-22CC-4692-9089-0C40ACBDFDD8");
            

            //直接用jquery的append();方法好像不行,也可以用$('#id')[0],它与 document.getElementById(id)相等的
            document.getElementById(id).appendChild(_ocx);

            try{
                _ocx.innerHTML=""; //这里正式创建对象
            }catch(e){
               //activeErrMessage = "code2:报表需IE8以上的浏览器支持"; //这个错误可以忽略
            }
            this._reportId = reportId;
            return this._reportId;
        }
        V3Report.prototype._registerReport = function(){
            try{
                var rptId = this.getReportId();
                if(rptId == null){
                    return ;
                }
                
                var fullPath = module.id;
                var idx = fullPath.lastIndexOf(':');
                idx = fullPath.indexOf('/',idx) ;
                var edx = fullPath.lastIndexOf("/");
                var path = fullPath.substr(idx +1,edx - idx);
                
                var _ocx =document.getElementById(rptId);
                _ocx.SetPath(path);
                _ocx.Login("项目管理","5675abcde6cbafae59e4335a8355ac23","广东同望科技股份有限公司");
                
                var _version = _ocx.GetCurrentVersion();
                var ver2 = _version.replace(".","").replace(".","").replace(".","").substring(0,3);
                if(ver2 <'394'){
                    activeErrMessage = "code3:" + _version;
                }
            }
            catch(e){
                activeErrMessage = "code1:没有安装报表控件！";
            }
        }

        /** 报表设计格式:tab,xab */
        V3Report.prototype.setConfig = function(cfg) {
            var rptId = this.getReportId();
            if(rptId == null){
                return ;
            }
            var active =$('#' +rptId)[0];
            var fullPath = window.document.location.href;
            if(fullPath.substring(0,8)==="file:///"){
                var idx = fullPath.lastIndexOf('/')+1;
                var rpt = fullPath.substring(8,idx).replace(/\//g,"\\");
                active.openFile(rpt +cfg);//这是以本地方式加载文件,测试时用
            }
            else{
                active.ReadHttpFile(cfg);
            }
            this._config = cfg;
            this._isload = false;
        }

        /** 报表设计格式字符 */
        V3Report.prototype.setConfigXml = function(cfg) {
            var rptId = this.getReportId();
            if(rptId == null){
                return ;
            }
            var active =$('#' +rptId)[0];
            active.ReadDataFromString(cfg); //如果模板没有刷新，则数据变化也不显示的
            this._configXml = cfg;
            this._isload = false;
        }

        V3Report.prototype.getConfig = function() {
            return (this._configXml == null ? this._config : this._configXml);
        }

        /**创建工具栏*/
        V3Report.prototype._setContainer = function(id) {
            var self=this;
            self._containerId = id; 
            var container = $('#' + id);
            if(container.children('#tools_'+id).length>0){
                return ;
            }
            var downloadMsg = container.children("#downloadMsg");
            downloadMsg.remove();

            var _tools = $("<table id='tools_" + id + "'></table>");
            container.append(_tools);
            _tools.height(25);
            var _tr = $("<tr></tr>");
            _tools.append(_tr);

            var printSet = $("<td style='cursor:pointer'><img src='"+contextPath+"/img/printpapaerset.gif'/>打印设置&nbsp;&nbsp;</td>");
            var preview = $("<td style='cursor:pointer'><img src='"+contextPath+"/img/printpreview.gif'/>预览&nbsp;&nbsp;</td>");
            var print = $("<td style='cursor:pointer'><img src='"+contextPath+"/img/print.gif'/>打印&nbsp;&nbsp;</td>");
            var excel = $("<td style='cursor:pointer'><img src='"+contextPath+"/img/excel.gif'/>导出</td>");
            _tr.append(printSet).append(preview).append(print).append(excel);
            
            printSet.bind('click',function(){
                var rptId = self.getReportId();
                if(rptId){
                    var chinaExcel = $('#' + rptId);
                    chinaExcel[0].OnPrintSetup();
                }
            });
            preview.bind('click',function(){
                var rptId = self.getReportId();
                if(rptId){
                    var chinaExcel = $('#' + rptId);
                    chinaExcel[0].OnFilePrintPreview();
                }
            });
            print.bind('click',function(){
                var rptId = self.getReportId();
                if(rptId){
                    var chinaExcel = $('#' + rptId);
                    chinaExcel[0].OnFilePrint();
                }
            });
            excel.bind('click',function(){
                var rptId = self.getReportId();
                if(rptId){
                    var chinaExcel = $('#' + rptId);
                    chinaExcel[0].OnFileExport();
                }
            });

        }
        
        
        /** 超级报表的数据源xml格式 */
        V3Report.prototype.getDataSet = function() {
            return this._dataSet;
        }

        /**
        * 显示报表
        * @param {json} reportCfg 报表配置
        * @param {json} reportData 报表数据
        * 结构说明:
        * reportCfg:{dataSource:数据源,reportType:报表类型,size:[height,width],template:"xml"}
        * reportCfg 与Ba_REPORT结束类似
        * dataSource{String}:报表可能有多个数据源，以分号";"分隔
        * reportType{String}:报表类型，单表或主从表的说明
        * size:[height,width] 报表的大小
        * template:超级报表XML模板，是报表定义说明
        *
        * reportData:{values:{报表名称:[{"表名.字段名":"值"...}...]}}
        */
        V3Report.prototype.draw = function(reportCfg,reportData) {
            var rptId = this.getReportId();
            if(rptId == null){ //未能正常启动报表控件
                this.showDownload(activeErrMessage);
                return false;
            }
            this._registerReport();

            if(reportData != undefined)
                this.setDataSet(reportCfg,reportData);
            if (this._containerId == null) {
                alert("容器未初始化!");
                return;
            }

            //如果报表曾经加载了数据后,必须重新格式化一下才会刷新数据
            if(this._isload){
                if(this._configXml != null){
                	 this.setConfigXml(this._configXml);
				}
                else{
                    this.setConfig(this._config);
				}
            }
            
            var xml = this.getDataSet();
            var active = $('#' + rptId);
            if(typeof xml == "object"){//if dataset is object,so i g is mutil ds
            	 for(var p in xml){
                     var fp = p.replace(/\_/g,"");
            	     active[0].SetStatDataFromString(fp,xml[p])
            	 }
            }
            else{
                active[0].ReadStatDataFromString(xml);
            }
            //如果模板没有刷新，则数据变化也不显示的
            this._isload = active[0].Calculate();
            active.show();
            return true;
        }

        /** 超级报表的数据源xml格式 */
        V3Report.prototype.setDataSet = function(reportCfg,reportData) {
            if(typeof reportData == "object"){
                //如果是主从报表，需要走专门的主从表格式转换方法
                if(reportCfg.reportType.toUpperCase()=='MASTERSLAVE'){
                    this._dataSet = this.convertJsonXml4MasterSub(reportCfg,reportData);
                }
                else{
                    this._dataSet = this.convertJsonXml(reportCfg,reportData);
                }
            }
            else{
                this._dataSet = reportData;//字符类型
            }
        }
        
	/**
		JSON 数据转换成报表识别的XML格式
		只支持主从报表格式
	*/
	 V3Report.prototype.convertJsonXml4MasterSub =function(reportCfg,reportData){
            var rptId = this.getReportId();
            if(rptId == null){
                return ;
            }
            //1.表示是文本数据格式,2是XML数据格式
			//暂时全部转换成获取XML数据格式
            var active = $('#' + rptId)[0];
            var dataType = active.GetStatScriptItem("stat:data:dataflag",1);//后面的"1"表示是"统计脚本x"
            if(dataType!=2) {
                active.SetStatScriptItem("stat:data:dataflag",2,1); //改为XML型
            }
            var reportDS=reportCfg.dataSource.split(";") ;

            //默认第一个数据源等于主表，这个需要约定考虑
			//可以开放设置主表数据源的标记，需要开发系统支持
            var xml ="<data> <master> ";
            var masterTable = reportDS[0], masterRows =  reportData.values[masterTable];
            var item=masterRows[0]; //只取第一行
            for(var p in item){
                var fd = p.replace(masterTable+'.','');
                var val =item[p];
                    if(val==null || val==undefined){
                        val="";
                    }
                    else if(typeof(item[p])=="string"){
                        val = item[p].replace('<',"＜").replace('>','＞').replace('&','＆');
                    }                        
                    xml += "<" + fd  + ">" + val + "</" + fd + ">";
            }

            var childTable =reportDS[1], items =  reportData.values[childTable];
            var detailLen = items.length;            
            xml +="</master><detail> <count>" + detailLen + "</count>";
            for(var i = 1 ;i <= detailLen;i++){
                var item =items[i-1];
                xml += "<row" + i + ">" ;
                for(var p in item){
                    var fd =  p.replace(childTable + '.','');//去掉数据源标识
                    var val =item[p];
                    if(val==null || val==undefined){
                        val="";
                    }
                    else if(typeof(item[p])=="string"){
                        val = item[p].replace('<',"＜").replace('>','＞').replace('&','＆');
                    }                        
                    xml += "<" + fd  + ">" + val + "</" + fd + ">";
                }
                xml += "</row" + i + ">";
            }
			xml +="</detail></data>";
			return xml;
        }


		/**
		JSON 数据转换成报表识别的XML格式
		*/
        V3Report.prototype.convertJsonXml =function(reportCfg,reportData){
            var rptId = this.getReportId();
            if(rptId == null){
                return ;
            }
            var active =document.getElementById(rptId);
            //1.表示是文本数据格式,2是XML数据格式
			//暂时全部转换成获取XML数据格式
            var dataType = active.GetStatScriptItem("stat:data:dataflag",1);//后面的"1"表示是"统计脚本x"
            if(dataType!=2) {
                active.SetStatScriptItem("stat:data:dataflag",2,1); //改为XML型
            }

          //报表数据源，支持多数据源
            var reportDS=reportCfg.dataSource.split(";");
            var rst={};
            for(var ds = 0;ds<reportDS.length;ds++){
                var dataSource = reportDS[ds];
                var items =  reportData.values[dataSource];
                var itemLen = items.length;

                //xml的下标由1开始
                var xml ="<data><count>"+ itemLen + "</count>";
                for(var i = 1 ;i <= itemLen;i++){
                    var item =items[i-1];
                    xml += "<row" + i + ">" ;
                    for(var p in item){
                        var fd =  p.replace(dataSource+'.','');//去掉数据源标识
                        var val =item[p];
                        if(val==null || val==undefined){
                            val="";
                        }
                        else if(typeof(item[p])=="string"){
                            val = item[p].replace('<',"＜").replace('>','＞').replace('&','＆');
                        }                        
                        xml += "<" + fd  + ">" + val + "</" + fd + ">";
                    }
                    xml += "</row" + i + ">";
                }
                xml +="</data>";                 
            	rst[dataSource]=xml;
            }
            //delete rst.iect_ContractBalance;
            return rst;
        }
        V3Report.prototype.version = function() {
            var rptId = this.getReportId();
            if(rptId != null){
                var active = document.getElementById(rptId);
                return active.GetCurrentVersion();
            }
            else{
                return undefined;
            }
        }
        /**报表控件未能正常使用，显示下载页面，让客户安装*/
        V3Report.prototype.showDownload = function(msg) {
            var code = msg.substring(0,6),message = msg.substring(6);

            var container =$('#' + this._containerId);
            var width = container.width(),height = container.height();
            if(width==0){
                width = container.attr("width");
                height = container.attr("height");
            }
            var position = {position: 'absolute', width:480, height:320};
            position.left = (width - position.width) /2;
            position.top = (height - position.height) /2;
            if(position.left < 0) position.left =0;
            if(position.top <  0 ) position.top = 0;

            var html ="<div id ='downloadMsg' class='report-message-wrap'>" +
                    "<div class='report-error-header' style='width:"+ (position.width-10) + "px;'><span style='height:13px;' class='report-error-title'>" + message + "</span></div>" +
                    "<div class='report-error-body' style='width:"+ position.width + "px;'></div>" + 
                    "</div>";
            
            container.children("#downloadMsg").remove();
            var el = $(html).appendTo(container);
            el.css(position);

            var body =el.children("div.report-error-body"), otherHeight = 0;
            el.children().each(function(){
                var _self = $(this);
                if(body != _self[0])
                    otherHeight += _self.height();
            });
            body.height(position.height -otherHeight);
            var report = this.getReportId();
            report.setAttribute("width","100%");
            report.setAttribute("height","70%");

            if(code=='code1:'){ //没有安装
                body.append("<div style='align:center'><a href='" 
                    + contextPath +"/chinaexcelwebocx.exe' target='_blank'><!--install3.9.2.exe-->手动超报表插件(安装前请关闭浏览器)</a><br>或者设置本服务受信站点后，浏览器会自动安装</div>");
                body.append(report);
                body.append("<div style='color:#ff0000;'>报表只支持IE8或以上的浏览器</div>")
            }
            else if(code =='code2:'){ // 要IE8以上
                body.append("<div>请更新IE8或以上的浏览器</a>");
            }
            else if(code =='code3:'){ // 版本号过低
                var title = el.find('span.report-error-title');
                title.text("报表版本号过低");
                body.append("<div>&nbsp;&nbsp;您使用的报表版本号(" + message + ")过低，系统要求3.9.4以上的版本</div>");
                body.append("<div>本页面有提供3.9.4下载。请卸载后，再安装！<a href='" 
                    + contextPath +"/chinaexcelwebocx.exe' target='_blank'><!--install3.9.2.exe-->手动超报表插件(安装前请关闭浏览器)</a><br>或者设置本服务受信站点后，浏览器会自动安装</div>");
            }
        }
    }
    
    //不需要缓存处理
    exports.getInstance = function(id,config,isUseCache){
        /*var rs =ReportMap[id];
        if(rs){
            return rs;
        }
        */
        var rs =new V3Report();
        //只要ID不变，重复执行不影响
        rs.createReportObject(id);
        if(config.template != undefined){
            var xab = config.template.replace(/\＆/g,'&');
            rs.setConfigXml(xab);
        }
        else{
            rs.setConfig(config.templateFile);
        }

        //if(isUseCache){ ReportMap[id]=rs;}
        return rs;
    }
    exports.Report = V3Report;
});


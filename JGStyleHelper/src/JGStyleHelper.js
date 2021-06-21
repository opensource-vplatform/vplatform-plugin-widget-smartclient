/**
 * 字体样式处理类
 * @interface JGStyleHelper
 */
 isc.ClassFactory.defineInterface("JGStyleHelper");
 isc.JGStyleHelper.addInterfaceProperties({
     _styleEdgesCache:null,
     _defaultStyleEdges:{
         borderTopWidth:0,
         borderBottomWidth:0,
         borderLeftWidth:0,
         borderRightWidth:0,
         paddingTop:0,
         paddingBottom:0,
         paddingLeft:0,
         paddingRight:0

     }

 });
 isc.JGStyleHelper.addInterfaceMethods({

     /**
      * 寻找行高样式字符串
      * @method
      * @memberof JGStyleHelper
      * @instance
      * @param {String} cssText 样式脚本
      * @reutrns {String} 行高样例脚本
      */
     genLineHeightString:function(cssText){
         var _match = cssText.match(/HEIGHT:([^;]*);/i);
         if(_match && _match.length > 1){
             return 'line-height:' + _match[1] + ';'
         }else{
             return '';
         }
     },

     /**
      * 根据参数生成字体样式的字符串
      * @method
      * @memberof JGStyleHelper
      * @instance
      * @param {String} _fontStyle 字体样式脚本
      * @param {String} _foreColor 前景色样式脚本
      * @param {Boolean} _enable 是否启用
      * @returns {String} 样式脚本
      */
     genFontCssText:function (_fontStyle, _foreColor, _enable) {

         var _cssText = '';
         try {
             if("object" != typeof _fontStyle){
                 _fontStyle =eval( "(" +  _fontStyle + ")"  );
             }
             
             if(isc.isA.Object(_fontStyle)){
                 if (isc.isA.nonemptyString(_fontStyle['font-size'])) {
                     _cssText += 'font-size:' + _fontStyle['font-size'] + '; ';
                 }
     
                 if (isc.isA.nonemptyString(_fontStyle['font-family'])) {
                     _cssText += 'font-family:' + _fontStyle['font-family'] + '; ';
                 }
     
                 if (isc.isA.nonemptyString(_fontStyle['text-decoration'])) {
                     _cssText += 'text-decoration:' + _fontStyle['text-decoration'] + '; ';
                 }
     
                 if (isc.isA.nonemptyString(_fontStyle['font-weight'])) {
                     _cssText += 'font-weight:' + _fontStyle['font-weight'] + '; ';
                 }
     
                 if (isc.isA.nonemptyString(_fontStyle['font-style'])) {
                     _cssText += 'font-style:' + _fontStyle['font-style'] + '; ';
                 }
             }
         } catch(e){
             //
         }
         try{
             //除非传入的是一个布尔，而且为false，否则，都增加颜色的控制
             if(!(isc.isA.Boolean(_enable) && !_enable)){
                 if (isc.isA.nonemptyString(_foreColor)) {
                     _cssText += 'color:' + _foreColor + '; ';
                 }
             }
         } catch(e){
             //
         }

         return _cssText;
     },

     /**
      * 生成背景图片的样式
      * @method
      * @memberof JGStyleHelper
      * @instance
      * @param {String} url 图片url
      * @returns {String} 样式脚本
      */
     genBackgroundImageCssText:function (url) {
         if (isc.isA.nonemptyString(url)) {
             return "background-image:url(" + url + ");";
         } else {
             //return "background-image:none;";//此处必须设置，sc很无耻，设置背景色使用background-image进行设置
             return ""; //检索控件，不要设置背景色，就按原生色来处理
         }
     },
     
     /**
      * 特殊处理根据是否有背景色来返回背景图片 生成背景图片的样式
      */
     genBackgroundImageCssTextByBackColor:function (url, backColor) {
         if (isc.isA.nonemptyString(url)) {
             return "background-image:url(" + url + ");";
         } else if(isc.isA.nonemptyString(backColor)) {
             return "background-image:none;";//此处必须设置，sc很无耻，设置背景色使用background-image进行设置
         } else {
             return "";
         }
     },

     /**
      * 生成背景图片的样式
      * withNoImageCode==true 意思就是会附带屏蔽background-image的代码
      * 这样保证背景色生效
      */
     genBackgroundColorCssText:function (color,withNoImageCode) {
         if (isc.isA.nonemptyString(color)) {
             if(withNoImageCode != undefined && withNoImageCode == true){
                 return 'background:' + color + ';background-image:none;filter:none; ';
             }
             return 'background:' + color + '; ';
         } else {
             return "";
         }
     },


     /**
      * 统一生成标题title的值
      *
      */
     genTitleContent : function(titleStr){
         //titleStr = titleStr.replace(/ /g,'&nbsp;');
         return isc.isA.nonemptyString(titleStr) ? (/*isc.nbsp + */titleStr/* + isc.nbsp*/) : isc.nbsp;
     },


     /*
      * 计算边框的样式
      */
     calculateStyle : function (className) {

         if (this._styleEdgesCache == null) this._styleEdgesCache = {};
         else if (this._styleEdgesCache[className] != null) {
             return this._styleEdgesCache[className];
         }

         var style = this._defaultStyleEdges,
         styleObject = isc.Element.getStyleEdges(className);

         if (styleObject == null) {
             style.nullpaddingLeft = true; style.nullpaddingRight = true;
             style.nullpaddingTop = true; style.nullpaddingBottom = true;
             return style;
         }

         var pxString = isc.px;
         //计算border部分
         var topBorderString = styleObject.borderTopWidth, bottomBorderString = styleObject.borderBottomWidth,
             leftBorderString = styleObject.borderLeftWidth, rightBorderString = styleObject.borderRightWidth;
         if (isc.isA.String(topBorderString) && isc.endsWith(topBorderString, pxString)) style.borderTopWidth = parseInt(topBorderString);
         if (isc.isA.String(bottomBorderString) && isc.endsWith(bottomBorderString, pxString)) style.borderBottomWidth = parseInt(bottomBorderString);
         if (isc.isA.String(leftBorderString) && isc.endsWith(leftBorderString, pxString)) style.borderLeftWidth = parseInt(leftBorderString);
         if (isc.isA.String(rightBorderString) && isc.endsWith(rightBorderString, pxString)) style.borderRightWidth = parseInt(rightBorderString);

         //计算padding部分
         var topPadding = styleObject.paddingTop, bottomPadding = styleObject.paddingBottom,
             leftPadding = styleObject.paddingLeft, rightPadding = styleObject.paddingRight;
         style.nullpaddingTop = (topPadding == null || topPadding == isc.emptyString);
         style.nullpaddingBottom = (bottomPadding == null || bottomPadding == isc.emptyString)
         style.nullpaddingLeft = (leftPadding == null || leftPadding == isc.emptyString);
         style.nullpaddingRight = (rightPadding == null || rightPadding == isc.emptyString);
         if (isc.isA.String(topPadding) && isc.endsWith(topPadding, pxString)) style.paddingTop = parseInt(topPadding);
         if (isc.isA.String(bottomPadding) && isc.endsWith(bottomPadding, pxString)) style.paddingBottom = parseInt(bottomPadding);
         if (isc.isA.String(leftPadding) && isc.endsWith(leftPadding, pxString)) style.paddingLeft = parseInt(leftPadding);
         if (isc.isA.String(rightPadding) && isc.endsWith(rightPadding, pxString)) style.paddingRight = parseInt(rightPadding);

         //计算margin部分
         var topMargin = styleObject.marginTop, bottomMargin = styleObject.marginBottom,
             leftMargin = styleObject.marginLeft, rightMargin = styleObject.marginRight;
         style.nullMarginTop = (topMargin == null || topMargin == isc.emptyString);
         style.nullMarginBottom = (bottomMargin == null || bottomMargin == isc.emptyString)
         style.nullMarginLeft = (leftMargin == null || leftMargin == isc.emptyString);
         style.nullMarginRight = (rightMargin == null || rightMargin == isc.emptyString);
         if (isc.isA.String(topMargin) && isc.endsWith(topMargin, pxString)) style.marginTop = parseInt(topMargin);
         if (isc.isA.String(bottomMargin) && isc.endsWith(bottomMargin, pxString)) style.marginBottom = parseInt(bottomMargin);
         if (isc.isA.String(leftMargin) && isc.endsWith(leftMargin, pxString)) style.marginLeft = parseInt(leftMargin);
         if (isc.isA.String(rightMargin) && isc.endsWith(rightMargin, pxString)) style.marginRight = parseInt(rightMargin);
         
         this._styleEdgesCache[className] = style;

         return style;

     },


     /**
      * 获取水平方向上边框的宽度
      * @param className
      * @return {*}
      * @private
      */
     getVBorderPaddingSize : function (className) {
         return this.calculateStyle(className).borderTopWidth + this.calculateStyle(className).borderBottomWidth
             + this.calculateStyle(className).paddingTop + this.calculateStyle(className).paddingBottom;
     },
     /**
      * 获取垂直方向上边框的高度
      * @param className
      * @return {*}
      */
     getHBorderPaddingSize : function (className) {
         return this.calculateStyle(className).borderLeftWidth + this.calculateStyle(className).borderRightWidth
             + this.calculateStyle(className).paddingLeft + this.calculateStyle(className).paddingRight;
     },
     getControlWidth:function(className){
         var styleWidth =  this.calculateStyle(className)
         if(!styleWidth.marginLeft){
             styleWidth.marginLeft = 0
         }
         if(!styleWidth.marginRight){
             styleWidth.marginRight = 0
         }
         return styleWidth.borderLeftWidth + styleWidth.paddingLeft + styleWidth.marginLeft 
                 + styleWidth.borderRightWidth + styleWidth.paddingRight +styleWidth.marginRight;
     },
     getControlHeight:function(className){
         var styleWidth =  this.calculateStyle(className)
         return styleWidth.borderTopWidth + styleWidth.paddingTop + styleWidth.marginTop 
                 + styleWidth.borderButtomWidth + styleWidth.paddingButtom +styleWidth.marginButtom;
     },
     /**
      * 转换颜色配置值为HTML的颜色属性值
      */
     parseColor : function(colorValue) {
         if(colorValue.indexOf(",") == -1){
             return colorValue.toString().toLowerCase();
         }else{
             //return 'rgb(' + colorValue + ')';
             //return RGBToHexs(colorValue);
             //RGB颜色转换为16进制
             var aColor = colorValue.split(",");
             //0, 255, 255, 255  四位前面为0的代表为透明色
             if(aColor.length == 4 && aColor[0].toString() == "0"){
                 return "transparent";
             }
             var strHex = "#";
             for(var i=0; i<aColor.length; i++){
                 var hex = Number(aColor[i]).toString(16);
                 if(hex == "0"){
                     hex = "00";	
                 }
                 strHex += hex;
             }
             if(strHex.length != 7){
                 strHex = 'rgb(' + colorValue + ')';	
             }
             return strHex;
         }
     },

     /**
      * 转换字体大小配置值为UI字体大小属性值
      */
     parseFontSize : function(fontSize) {
         var n=parseInt(fontSize);
         if(isNaN(n))
             return fontSize;
         if(fontSize.indexOf("cm")>0 || fontSize.indexOf("mm")>0 ||
            fontSize.indexOf("in")>0 || fontSize.indexOf("pt")>0 ||
            fontSize.indexOf("pc")>0 || fontSize.indexOf("px")>0)
            return fontSize;
         if(fontSize.indexOf("%")>0)
            return fontSize;
         return fontSize + 'px';
     },

     /**
      * 转换字体标签样式信息 如果style如传,则新建一个json对象,否则,在原有json对象上增加
      * 
      * @param fontStyle
      *            属性名前缀
      */
     parseFontStyle : function(fontStyle) {
         var style = {};
         if (fontStyle.toString() == "") {
             return style;
         }
         try{
             fontStyle=eval( "(" +  fontStyle + ")"  );
             // 标签样式
             if (fontStyle["Size"].toString()!= "") {
                 
                 style["font-size"] = this.parseFontSize(fontStyle["Size"]);
             }
             if (fontStyle["Family"].toString()!= "") {
             
                 style["font-family"] = fontStyle["Family"].toString();
             }
             var textDecoration = "";
             if(fontStyle["Underline"].toString().toLocaleLowerCase()=="true"){
                 textDecoration += "underline";
             }
             if(fontStyle["Strikeout"].toString().toLocaleLowerCase()=="true"){
                 textDecoration += " line-through";
             }
             if(textDecoration!=''){
                 style["text-decoration"] = textDecoration;
             }
             if(fontStyle["Bold"].toString().toLocaleLowerCase()=="true"){
                 style["font-weight"] = "bold";
             }
             if(fontStyle["Italic"].toString().toLocaleLowerCase()=="true"){
                 style["font-style"] = "italic";
            }

         }catch(e){
             //log("异常错误：字体设置不符合json数据规范，系统采用默认设置，请联系相关人员。字体属性值未fontStyle="+fontStyle+ "  详细错误信息如下："+e);
         }
         
         return style;
     },
     
     /**
      * 把cssText串转为json对象
      */
     cssTextStringToObj : function(cssText) {
         var styleObj = {};
         if(cssText){
             var styles = cssText.split(';');
             for(var i=0,len=styles.length;i<len;i++){
                 var styleStr = styles[i];
                 if(styleStr){
                     var style = styleStr.split(":");
                     if(style[0] && style[1]){
                         var key = style[0].replace(/(^\s*)|(\s*$)/g, "");//去掉左右空格
                         var value = style[1].replace(/(^\s*)|(\s*$)/g, "");//去掉左右空格
                         styleObj[key] = value;
                     }
                 }
             }
         }
         return styleObj;
     },
     
     /**
      * 在原cssText串上增加或替换扩展的样式
      * @param cssText 原cssText串
      * @param addStyleObj 需要增加或替换的样式对象 
      * return newCssText
      * 
      * @param isFontStyle 当为字体样式设置时，要先把原先设置的字体样式先清掉再进行增加,因为FontStyle有多项，新设置的有可能跟原来的项数都不一样
      * @param withNoImageCode==true 意思就是会附带屏蔽background-image的代码，这样保证背景色生效
      */
     cssTextExtend : function(cssText,addStyleObj,isFontStyle,withNoImageCode){
         var newCssText = "";
         var styleObj = this.cssTextStringToObj(cssText);
         if(isFontStyle){
             //要先把原先设置的字体样式先清掉
             for(var ikey in styleObj){
                 if(ikey=="font-size" || ikey=="font-family" || ikey=="text-decoration" ||ikey=="font-weight" ||ikey=="font-style"){
                     delete styleObj[ikey];
                 }
             }
         }
         if(addStyleObj){
             for(var jkey in addStyleObj){
                 if(jkey == "background" && withNoImageCode){
                     //如果是设置背景色，要把"background-image:none;"，此处要设为none，sc很无耻，设置背景色使用background-image进行设置
                     if(!styleObj["background-image"]){
                         styleObj["background-image"] = "none";
                     }
                     if(!styleObj["filter"]){
                         styleObj["filter"] = "none";
                     }
                 }
                 styleObj[jkey] = addStyleObj[jkey];
             }
             for(var key in styleObj){
                 newCssText += key+":"+styleObj[key]+";";
             }
             return newCssText;
         }
         return cssText;
     }

 });
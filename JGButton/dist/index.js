!function(t){"function"==typeof define&&define.amd?define(t):t()}((function(){"use strict";isc.ClassFactory.defineClass("JGButton","JGBaseWidget"),isc.ClassFactory.mixInInterface("JGButton","JGStyleHelper"),isc.JGButton.addProperties({_button:null,widgetId:"JGButton1",RemindText:"",ToolTip:"",Placeholder:"",Left:10,HorizontalAlign:"Left",FontStyleFamily:"",type:"JGButton",FontStyleBold:"",ColSpan:"1",TabIndex:28,FontStyleSize:"",WidgetStyle:"JGButton",PercentHeight:"1.6%",Visible:!0,Theme:"defaultType",Height:28,AutoTest:!0,Width:48,StaticLayoutSize:!0,VerticalAlign:"Top",FontStyleItalic:"",EndRow:"False",ImageObj:null,BackColor:null,Enabled:!0,SimpleChineseTitle:"",Code:"JGButton1",MultiHeight:"26px",PlaceholderPosition:"Right",StartRow:"False",Dock:"None",Top:10,FontStyleDecoration:"",MultiWidth:"59px",PercentWidth:"3.2%",ForeColor:null,Name:"",ImageValue:null,listener:["OnClick"],className:"JGButtonNormal",_buttonDisableCustom:!1}),isc.JGButton.addMethods({_initWidget:function(){this.ImageObj=this.ImageValue,this.Theme&&"customType"!=this.Theme&&!this.isOldWindowLayoutConfig()&&(this.ForeColor="",this.BackColor=""),this.Theme&&"customType"!=this.Theme&&"defaultType"!=this.Theme&&(this.WidgetStyle=this.Theme+" "+this.WidgetStyle);var t=this;this.disabled=!this.Enabled,this._button=isc.Button.create({autoDraw:!1,id:this.id,name:this.Name,overflow:"visible",title:this.genTitleContent(this.SimpleChineseTitle),width:this.Width,height:this.Height,disabled:!this.Enabled,tabIndex:this.TabIndex,backgroundColor:this.BackColor,cssText:this.genFontCssText(this.FontStyle,this.ForeColor)+"background-color:"+this.BackColor+";border-color:"+this.BackColor+"!important;",border:"0px solid",icon:this.getStaticImagePath(this.ImageObj),iconWidth:this.Height/2,iconHeight:this.Height/2,remindText:this.RemindText,showIconState:!1,canHover:!0,wrap:!0,click:this._referTimerEventHandler(this,"OnClick"),baseStyle:this.WidgetStyle,getInnerHTML:function(t){var e=this.Super("getInnerHTML",arguments);return e=(e=(e=(e=e.replace("max-width:100%","width:100%")).replace("overflow:hidden;text-overflow:ellipsis","display:inline;")).replace("display:inline-block;","display:block;overflow:hidden;text-overflow:ellipsis;")).replace("vertical-align:middle;","")},getTitleHTML:function(){return t.getModTitleHTML()},stateChanged:function(){this.Super("stateChanged");var t=this.getTitleCell();if(t&&t.style&&this.isDisabled()){var e=t.style.cssText;e=isc.JGStyleTools.removeBackgroundColor(e),e=isc.JGStyleTools.removeColor(e),t.style.cssText=e}},redraw:function(){if(this.disabled){var e=this.cssText;this.cssText=isc.JGStyleTools.removeBackgroundColor(this.cssText),this.cssText=isc.JGStyleTools.removeColor(this.cssText),this.Super("redraw",arguments),this.cssText=e}else this.Super("redraw",arguments);t.hasRemindText()&&(t.remindTextDomObj=isc.Element.get(t.remindTextDomID))},isDisabled:function(){return this.disabled},getHoverTarget:function(t,e){return this.parentElement.fireEvent("mouseOver"),this.Super("getHoverTarget",arguments)}}),this.addChild(this._button)},addButtonClass:function(t){if(t&&this._button){var e=this._button;if(e.baseStyle){var i=e.baseStyle.split(" ");-1==i.indexOf(t)&&(i.splice(0,0,t),e.baseStyle=i.join(" "),e.redraw())}else e.baseStyle=t,e.redraw()}},removeButtonClass:function(t){if(t){var e=this._button;if(e&&e.baseStyle){var i=e.baseStyle.split(" ");-1!=i.indexOf(t)&&(i.splice(i.indexOf(t),1),e.baseStyle=i.join(" "),e.redraw())}}},setTips:function(t){this._button.prompt=t},pause:function(){this._button.setState(isc.StatefulCanvas.STATE_UP),this.setRemindTextDisabled(!0)},resume:function(){this._disabled||(this.setRemindTextDisabled(!1),this._button.redraw())},_referPartFunc:function(){this.Super("_referPartFunc",arguments),this._referFuncs(this._button,["setTitle","getTitle","setBackgroundImage","setBackgroundColor"])},setLabelText:function(t){this.setSimpleChineseTitle(t)},getLabelText:function(){return this.getSimpleChineseTitle()},isEnabled:function(){return this.Enabled},setEnabled:function(t){this.markDisableByRule(!t),this.Super("setEnabled",arguments)},getEnabled:function(){return!this.isDisabled()},getVisible:function(){return this.isVisible()},setHandleDisabled:function(t){this._button&&(t?this._button.disable():this._button.enable(),this._button.redraw())},getBackColor:function(){return this.BackColor},setBackColor:function(t){t=this.parseColor(t),this.BackColor=t;var e=this.cssTextExtend(this._button.cssText,{"background-color":t});this._button.cssText=e,this._button._cssText=e,this._button.redraw()},getForeColor:function(){return this.ForeColor},setForeColor:function(t){t=this.parseColor(t),this.ForeColor=t;var e=this.cssTextExtend(this._button.cssText,{color:t});this._button.cssText=e,this._button._cssText=e,this._button.redraw()},setFontStyle:function(t){t=this.parseFontStyle(t),this.FontStyle=t;var e=this.cssTextExtend(this._button.cssText,t,!0);this._button.cssText=e,this._button._cssText=e,this._button.redraw()},getSimpleChineseTitle:function(){return this.SimpleChineseTitle},setSimpleChineseTitle:function(t){this.SimpleChineseTitle=t,this._button.setTitle(this.SimpleChineseTitle)},setPercentWidth:function(t){this.Super("setPercentWidth",arguments),this._button.setWidth("100%")},setPercentHeight:function(t){this.Super("setPercentHeight",arguments),this._button.setHeight("100%")},setState:function(t){this._button.setState(t)},setIndexPreJoinComponentIndex:function(t){var e=this._button.getTabIndex();this._button.setTabIndex(parseInt(t+e))},destroy:function(){this._button=null,this.Super("destroy",arguments)},setRemindText:function(t){this.RemindText=t,this._button.remindText=t,this._button.setTitle(this.SimpleChineseTitle)},getRemindText:function(t){return this.RemindText},hasRemindText:function(){return!isc.isAn.emptyString(""+this.RemindText)},enabledRemindText:function(){},RemindText_PartName:"RemindText_PartName",remindTextDomID:null,remindTextDomObj:null,getModTitleHTML:function(){var t,e="";return this.hasRemindText()?(e="["+this.RemindText+"]",t=this._button.disabled?this.WidgetStyle+"RemindDisabled":this.WidgetStyle+"Remind",this.remindTextDomID||(this.remindTextDomID=isc.ClassFactory.getDOMID(this.getID(),this.RemindText_PartName)),"<nobr>"+this.SimpleChineseTitle+"<span id='"+this.remindTextDomID+"' class='"+t+"'>"+e+"</span></nobr>"):"<nobr>"+this.SimpleChineseTitle+"</nobr>"},setRemindTextDisabled:function(t){this.hasRemindText()&&(this.remindTextDomObj||(this.remindTextDomObj=isc.Element.get(this.remindTextDomID)),this.remindTextDomObj&&(this.remindTextDomObj.className=t?this.WidgetStyle+"RemindDisabled":this.WidgetStyle+"Remind"))},parentReadOnly:function(t){this.setReadOnly(t)},setReadOnly:function(t){this.ReadOnly=t,this.isOldWindowLayoutConfig&&this.isOldWindowLayoutConfig()?this.setHandleDisabled(t):this.setVisible(!t)},markDisableByRule:function(t){this._buttonDisableCustom=t},firePlatformEventBefore:function(t){"OnClick"==t&&(this._button&&this._button.setDisabled(!0),this.addButtonClass("V3ButtonActive"))},firePlatformEventAfter:function(t){"OnClick"==t&&(this._button&&!this._buttonDisableCustom&&this._button.setDisabled(!1),this.removeButtonClass("V3ButtonActive"))}})}));

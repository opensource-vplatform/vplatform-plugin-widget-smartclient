!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";isc.ClassFactory.defineClass("JGCheckBox","JGBaseFormWidget"),isc.addGlobal("JGCheckBox",isc.JGCheckBox),isc.JGCheckBox.addProperties({TableName:null,listener:["change","focus","blur","keydown","click","titleClick","labelclick"],WidgetStyle:"JGBoxGroup"}),isc.JGCheckBox.addMethods({_initProperties:function(e){this.TitleWidth=e.LabelWidth,this.TitleVisible=e.LabelVisible,this.className+=" JGCheckBox",this.items=[isc.addProperties(e,{type:"V3CheckBoxItems",isAbsoluteForm:!0})]},setChecked:function(e){this.setValue(e)},clearErrors:function(){},isChecked:function(){return this._form.getItem()._value},getDefaultValue:function(){return this.DefaultValue||!1},getV3Value:function(){var e=this.getWidgetData();return null!=e&&null!=e&&("string"==typeof e&&(e="true"==e.toLocaleLowerCase()),e)},setEnabled:function(e){this.setItemEnabled(e)},getVisible:function(){return this.isVisible()},setReadOnly:function(e){this.setItemReadOnly(e)},getReadOnly:function(){return this.isReadOnly()},getLabelText:function(){return this.getSimpleChineseTitle()},cleanSelectedControlValue:function(e){this.clearWidgetBindDatas(e)},getV3MethodMap:function(){return{setValue:"setV3Value",getValue:"getV3Value"}}})}));
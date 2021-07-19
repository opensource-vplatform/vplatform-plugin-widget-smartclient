/**
 * v平台布尔控件
 * @class JGCheckBox
 * @extends JGBaseFormWidget
 * @example
 * isc.JGCheckBox.create({
 *  autoDraw : true
 * });
 */
isc.ClassFactory.defineClass("JGCheckBox", "JGBaseFormWidget");
isc.addGlobal("JGCheckBox", isc.JGCheckBox);

isc.JGCheckBox.addProperties({

    TableName: null,

    listener: [
        'change',

        'focus',

        'blur',

        'keydown',

        'click',

        'titleClick',

        'labelclick'
    ],
    WidgetStyle: "JGBoxGroup"
});


isc.JGCheckBox.addMethods({

    _initProperties: function (properties) {
        this.TitleWidth = properties.LabelWidth;
		this.TitleVisible = properties.LabelVisible;
        this.className += " JGCheckBox";
        this.items = [isc.addProperties(properties, {
            type: "V3CheckBoxItems",
            isAbsoluteForm: true,
        })]
    },

    /**
     * 根据isCheck的值,使变checkbox是否选中
     * 
     * @param {boolean}
     *            isCheck 是否选中 true/false
     */
    setChecked: function (isCheck) {
        this.setValue(isCheck);
    },
    //清除校验导致值改变触发两次
    clearErrors: function () {},
    /**
     * 根据传入的值,返回该ITEM是否被选中
     * @return {boolean}
     * 			  是否选中
     */
    isChecked: function () {
        var item = this._form.getItem();
        return item._value;
    },

    getDefaultValue: function () {
        return this.DefaultValue||false;
    },

    getV3Value: function () {
        var value = this.getWidgetData();
        if (undefined == value || null == value) {
            return false;
        }
        if(typeof value == "string"){
			if(value.toLocaleLowerCase() == "true")
				value = true;
			else
				value = false;
		}
		return value;
    },

    setEnabled : function(state){
        this.setItemEnabled(state);
    },

    getVisible: function(){
        return this.isVisible();
    },

    setReadOnly: function(state){
        this.setItemReadOnly(state);
    },

    getReadOnly: function(){
        return this.isReadOnly();
    },

    getLabelText: function(){
        return this.getSimpleChineseTitle();
    },

    cleanSelectedControlValue: function(cleanSelected){
        this.clearWidgetBindDatas(cleanSelected);
    },

    getV3MethodMap : function(){
        return {
            setValue : "setV3Value",
            getValue : "getV3Value"
        };
    }

});
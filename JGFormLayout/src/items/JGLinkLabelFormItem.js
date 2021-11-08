isc.ClassFactory.defineClass("JGLinkLabelFormItem", "V3LinkLabelItem");
isc.ClassFactory.mixInInterface("JGLinkLabelFormItem", "JGStyleHelper");
isc.ClassFactory.mixInInterface("JGLinkLabelFormItem", "IV3FormItem");

isc.JGLinkLabelFormItem.addProperties({
    WidgetStyle: "JGLinkLabel",
    //            Placeholder:"placehoder"
});



var parseParam = function (param, expressionFunc) {
    var paramType = param.ParaType;
    var paraVariane = param.ParaVariane;
    var paraName = param.ParaName;
    var paramVal = "",
        retValue = "";

    switch (paramType) {
        case "SystemVar":
            paramVal = "@@" + paraVariane;
            break;
        case "ComponentVar":
            paramVal = "@" + paraVariane;
            break;
        case "Field":
            var paramVals = paraVariane.split(".");
            for (var i = 0, len = paramVals.length; i < len; i++) {
                paramVal += "[" + paramVals[i] + "]";

                if (i === 0)
                    paramVal += ".";
            }
            break;
        default:
            paramVal = '"' + paraVariane + '"';
    };

    paramVal = expressionFunc(paramVal);

    retValue += paraName;
    retValue += "=";
    retValue += encodeURIComponent(paramVal);
    return retValue;
};

isc.JGLinkLabelFormItem.addMethods({
    init: function () {
        this.Super("init",arguments);
        if (this.form && this.form._putWidgetContextProperty) {
            this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
        }
    },

    getWebPara: function () {
        var param = this.WebParam;
        var paramValue = param ? JSON.parse(param) : {};
        var retValue = '';
        var _expressionHandler = this.form._expressionHandler;
        if (paramValue && paramValue.NewDataSet &&
            paramValue.NewDataSet.dtParameter) {
            var params = paramValue.NewDataSet.dtParameter;
            if (params) {
                if (params.length) {
                    for (var i = 0, len = params.length; i < len; i++) {
                        var param = params[i];
                        retValue += parseParam(param, _expressionHandler);
                        if (i + 1 < len)
                            retValue += "&";
                    }
                } else {
                    retValue += parseParam(params, _expressionHandler);
                }
            }
        }
        return retValue;
    },
    setForeColor:function(color){
        this.ForeColor = this.parseColor(color);
        this.form && this.form.markForRedraw();
    }
});
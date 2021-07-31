isc.ClassFactory.defineInterface("IV3FormItem");

isc.IV3FormItem.addInterfaceMethods({

    /**
     * 获取浮动提示处理回调
     */
    getToolTipHandler: function (itemCode, exp) {
        var _this = this;
        return function () {
            if (_this.isReadOnly() && _this.form && _this.form.useStaticReadonly) {
                return _this.valueMap ? _this.valueMap[_this._value] : _this._value ? _this._value : "";
            } else {
                return _this.form && _this.form._v3ExpHandler ? _this.form._v3ExpHandler(exp) : "";
            }
        }
    },
    /**
     * 获取v3平台事件处理器
     */
    getV3EventHandler: function (itemCode, eventCode) {
        var _this = this;
        return function () {
            return _this.form ? _this.form._fireEventHandler(itemCode, eventCode, arguments) : '';
        }
    },
    /**
     * 获取v3平台事件处理器，触发平台事件前先同步数据
     */
    getV3EventHandlerWithDataSyn: function (itemCode, eventCode) {
        var _this = this;
        return function () {
            _this.form && _this.form._dataSyn(itemCode);
            _this.form && _this.form._fireEventHandler(itemCode, eventCode, arguments);
        }
    },
    /**
     * 获取v3平台键盘按下事件处理器
     */
    getV3KeyDownEventHandler: function (itemCode) {
        var _this = this,
            eventCode = "OnKeyDown";
        return function () {
            if (event && event.keyCode == 13) {
                //先同步数据
                _this.form && _this.form._dataSyn(itemCode);
            }
            _this.form && _this.form._fireEventHandler(itemCode, eventCode, arguments);
        }
    },
    /**
     * 表单数据同步
     */
    getFormSyncDataHandler: function (itemCode) {
        var _this = this;
        return function () {
            _this.form && _this.form._dataSyn(itemCode);
        }
    },

    getV3KeyDownEventHandlerWithoutDataSyn: function (itemCode) {
        var _this = this,
            eventCode = "OnKeyDown";
        return function () {
            _this.form && _this.form._fireEventHandler(itemCode, eventCode, arguments);
        }
    },
});
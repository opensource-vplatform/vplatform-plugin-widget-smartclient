isc.ClassFactory.defineClass("ComponentCanvas", "Canvas");
isc.ComponentCanvas.addMethods({

    addComponent: function (component) {
        this.addChild(component);
        this.component = component;
    },
    blur: function () {
        return false;
    },
    compAutoHeight: function () {
        var component = this.component || this._innerComponent;
        return component && component.LayoutType == "BorderLayout";
    },

    //重新计算设置外面容器的高度
    calculateContainerHeight: function (resize) {
        var jgComponentContainer = this.jgComponentContainer;
        var tabSet = jgComponentContainer.tabSetObj;
        var component = this.component;
        if ((jgComponentContainer.HeightSet == "AutoHeight" && jgComponentContainer.isOldWindow) || jgComponentContainer.MultiHeight == "content") {
            if (this.children && this.children.length > 0) {
                var component = this.children[0];
                var componentWidth = component.getWidth();
                var clientWidth = this.getClipHandle().clientWidth;
                var canvasScrollWidth = window.v3PlatformSCSkin.canvasScrollWidth ? window.v3PlatformSCSkin.canvasScrollWidth : 6;
                if ((componentWidth - canvasScrollWidth) == clientWidth) {
                    var delta = this.getWidth() - clientWidth;
                    if (delta > 0) { //说明有竖向滚动条
                        component.resizeBy(0 - delta, 0);
                    }
                }
            }


            if (this.parentElement.getClassName() == "PaneContainer") {
                if (this.getScrollHeight(true) == 0) {
                    var scrollHeight = this.getHeight();
                } else {
                    var scrollHeight = this.getScrollHeight(true);
                }
                if (scrollHeight == this.getHeight() && resize) {
                    return;
                }
                if (this.isOldWindowLayoutConfig && !this.isOldWindowLayoutConfig()) { //旧布局设置之后，会导致组件容器变成高度1（打开div窗体的宽高为100%）Task20201013018/Task20201228080
                    tabSet.setHeight(1);
                    jgComponentContainer.setHeight(1);
                }
                jgComponentContainer.setVisible(true)
                if (this.getScrollHeight(true) == 0) {
                    var scrollHeight = this.getHeight();
                } else {
                    var scrollHeight = this.getScrollHeight(true);
                }
                if (scrollHeight == 0) {
                    return; //不更新无效的值
                }
                var height = scrollHeight + parseInt(jgComponentContainer.BorderWidth);
                var h = scrollHeight + tabSet.tabBar.getHeight();
                if (this.compAutoHeight()) { //窗体为BorderLayout时，死循环
                    this.parentElement.height = height;
                    tabSet.height = h;
                    jgComponentContainer.height = h;
                    jgComponentContainer.markForRedraw();
                } else {
                    tabSet.setHeight(h);
                    jgComponentContainer.setHeight(h);
                }

                //支持IE下
                var jgComponent = jgComponentContainer.parentElement
                if (jgComponent && ((jgComponent.HeightSet == "AutoHeight" && jgComponent.isOldWindow) || jgComponent.MultiHeight == "content")) {
                    var _height = scrollHeight + scrollbarSize + tabSet.tabBar.getHeight() + this.getTop();
                    for (var i = 0; i < jgComponent.children.length; i++) {
                        var _children = jgComponent.children[i];
                        if (_height < _children.getHeight() + _children.getTop()) {
                            _height = _children.getHeight() + _children.getTop();
                        }
                    }
                    jgComponent.setHeight(_height);
                }

            }
        }
    },

    destroy: function () {
        if (this.component && this.component.setParentContainer) {
            this.component.setParentContainer(null);
        }
        var modal = this.modal;
        this.showModal = null;
        this.hideModal = null;
        if (modal) {
            this.modal = null;
            modal.destroy();
        }
        this.component = null;
        this.jgComponentContainer = null;
        this.close = null;
        this.Super("destroy", arguments);
    }

});
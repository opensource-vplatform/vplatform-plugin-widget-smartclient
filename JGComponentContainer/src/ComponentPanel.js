isc.ClassFactory.defineClass("ComponentPanel", "Canvas");

isc.ComponentPanel.addProperties({
	//调整滚动条，使用浏览器自带滚动条
	showCustomScrollbars: false,
	//add by xiedh 2018-07-31 组件容器中打开网页窗体，点击窗体内其他地方，文本框无法失去焦点问题处理
	canFocus: true,
	component: null
});

isc.ComponentPanel.addMethods({

	compAutoHeight: function () {
		var component = this.component || this._innerComponent;
		return component && component.LayoutType == "BorderLayout";
	},

	childResized: function (child, deltaX, deltaY, reason) {
		this.Super("childResized", arguments);
		//重新计算高度
		if (!this.component || !this.component.isUrlCanvas) {
			this.calculateContainerHeight(true);
		}

	},

	addComponent: function (component) {
		this.component = component;
		this.addChild(component);
		if (!this.component || !this.component.isUrlCanvas) {
			this.calculateContainerHeight();
		}
	},

	//重新计算设置外面容器的高度
	calculateContainerHeight: function (resize, isSimpleWindow) {
		var jgComponentContainer = this.jgComponentContainer;
		jgComponentContainer.setVisible(true)
		/**
		 * start
		 * 处理场景：当前ComponentPanel出现滚动条时，窗体（component）的宽度等于
		 * ComponentPanel的宽度（包含滚动条），造成ComponentPanel滚动条遮罩在窗体上，引发样式问题
		 */
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


		var component = this.component;
		//		        this.adjustOverflow("loadComponent");
		//"AutoHeight" 会造成setHeight死循环，暂时屏蔽掉setHeight
		if ((jgComponentContainer.HeightSet == "AutoHeight" && jgComponentContainer.isOldWindow) || jgComponentContainer.MultiHeight == "content") {

			if (this.getScrollHeight(true) == 0) {
				var scrollHeight = this.getHeight();
			} else {
				var scrollHeight = this.getScrollHeight(true);
			}
			if (scrollHeight == this.getHeight() && resize) {
				return;
			}
			if (this.isOldWindowLayoutConfig && !this.isOldWindowLayoutConfig()) { //旧布局设置之后，会导致组件容器变成高度1（打开div窗体的宽高为100%）Task20201013018/Task20201228080
				this.setHeight(1);
			}
			//		            jgComponentContainer.setHeight(1);

			if (this.getScrollHeight(true) == 0) {
				var scrollHeight = this.getHeight();
			} else {
				var scrollHeight = this.getScrollHeight(true);
			}
			var height = scrollHeight + parseInt(jgComponentContainer.BorderWidth);
			this.setHeight(height);
			jgComponentContainer.setHeight(scrollHeight);

		}
	},

	destroy: function () {
		if (this.component && this.component.setParentContainer) {
			this.component.setParentContainer(null);
		}
		this.showModal = null;
		this.hideModal = null;
		var modal = this.modal;
		if (modal) {
			this.modal = null;
			modal.destroy();
		}
		this.component = null;
		this.close = null;
		this.jgComponentContainer = null;
		this.Super("destroy", arguments);
	}

});
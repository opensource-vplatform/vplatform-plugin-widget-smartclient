
isc.ClassFactory.defineClass("JGHGroupPanel", "HLayout");
//需要放置在IV3BaseWidget前：JGIGroupPanel方法覆盖IV3BaseWidget方法
isc.ClassFactory.mixInInterface("JGHGroupPanel", "JGIGroupPanel");
isc.ClassFactory.mixInInterface("JGHGroupPanel", "JGLayoutManager");
isc.ClassFactory.mixInInterface("JGHGroupPanel", "IV3BaseWidget");
isc.ClassFactory.mixInInterface("JGHGroupPanel", "IV3RectAdapter");

isc.JGHGroupPanel.addMethods({

	init: function () {
		if (this.isAssignLayout()) {
			this.tmpGroupTitle = this.GroupTitle;
			this.GroupTitle = "";
		}
		this.adaptedProperty();
		this.initV3Widget();
		this.initGroupPanel();
		if (this.Dock != "None") {
			//水平排列中，宽度为100%
			this.width = '100%';
		}
		this.childrenWidgets = this.layoutChildWidgets();
		this.adaptRectByV3();
		this.members = this.layoutChildWidgets();
		this.Super('init', arguments);
	},

	getGroupTitle: function () {
		return this.tmpGroupTitle || this.GroupTitle;//第一次判断时还没有tmpGroupTitle
	},
	addV3Child: function (child) {
		if (child.setPercentHeight) {
			child.setPercentHeight('100%');
		}
		this.addMember(child);
	},
});
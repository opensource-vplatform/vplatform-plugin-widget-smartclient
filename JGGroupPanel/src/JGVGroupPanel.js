isc.ClassFactory.defineClass("JGVGroupPanel", "VLayout");
//需要放置在IV3BaseWidget前：JGIGroupPanel方法覆盖IV3BaseWidget方法
isc.ClassFactory.mixInInterface("JGVGroupPanel", "JGIGroupPanel");
isc.ClassFactory.mixInInterface("JGVGroupPanel", "JGLayoutManager");
isc.ClassFactory.mixInInterface("JGVGroupPanel", "IV3BaseWidget");
isc.ClassFactory.mixInInterface("JGVGroupPanel", "IV3RectAdapter");

isc.JGVGroupPanel.addMethods({

	init: function () {
		this.adaptedProperty();
		this.initV3Widget();
		this.initGroupPanel();
		if (this.Dock != "None" && this.MultiHeight != 'content' && this.Dock != "Top" && this.Dock != "Bottom") {
			//垂直排列中，高度为100%
			this.height = '100%';
		}
		this.childrenWidgets = this.layoutChildWidgets();
		this.adaptRectByV3();
		this.handleChildrenResize();
		this.members = this.childrenWidgets; //this.layoutChildWidgets();
		this.Super('init', arguments);
	},
	/**
	 * 子控件是否显示大小工具条
	 * @param {Object}} child 子控件
	 */
	childShouldShowResizeBar: function (child) {
		var height = child.MultiHeight || child.height;
		return isNaN(height) && height.substring && height.substring(height.length - 2) != "px";
	},

	addV3Child: function (child) {
		if (child.setPercentWidth) {
			child.setPercentWidth('100%');
		}
		this.addMember(child);
	},

	buildSectionStackItem: function () {
		var newMembers = [];
		var members = this.members;
		var heightLeft = parseInt(this.MultiHeight);
		for (var i = 0, len = members.length; i < len; i++) {
			if (members[i].getClassName() != "LayoutSpacer") {
				var member = members[i];
				//处理场景：处理垂直布局靠上，而布局中子控件高度控件自适应导致控件不显示问题
				if (member && member.setHeight) {
					var memberHeight = member.MultiHeight;
					if (memberHeight == "Space") {
						member.setHeight(heightLeft);
						heightLeft = 0;
					} else {
						memberHeight = parseInt(memberHeight);
						if (!isNaN(memberHeight)) {
							heightLeft -= memberHeight;
						}
					}
				}
				newMembers.push(member);
			}
		}
		return {
			title: this.getGroupTitle(),
			expanded: this.DefaultExpand == "False" ? false : true,
			items: newMembers
		};
	},

});
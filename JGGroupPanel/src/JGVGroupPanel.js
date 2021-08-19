
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
		this.members = this.childrenWidgets;//this.layoutChildWidgets();
		this.Super('init', arguments);
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
		for (var i = 0, len = members.length; i < len; i++) {
			if (members[i].getClassName() != "LayoutSpacer") {
				newMembers.push(members[i]);
			}
		}
		return {
			title: this.getGroupTitle(),
			expanded: this.DefaultExpand == "False" ? false : true,
			items: newMembers
		};
	},

});
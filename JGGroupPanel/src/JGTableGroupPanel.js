
isc.ClassFactory.defineClass("JGTableGroupPanel", "HLayout");
//需要放置在IV3BaseWidget前：JGIGroupPanel方法覆盖IV3BaseWidget方法
isc.ClassFactory.mixInInterface("JGTableGroupPanel", "JGIGroupPanel");
isc.ClassFactory.mixInInterface("JGTableGroupPanel", "JGLayoutManager");
isc.ClassFactory.mixInInterface("JGTableGroupPanel", "IV3BaseWidget");
isc.ClassFactory.mixInInterface("JGTableGroupPanel", "IV3RectAdapter");

isc.JGTableGroupPanel.addMethods({

	init: function () {
		if (this.isAssignLayout()) {
			this.tmpGroupTitle = this.GroupTitle;
			this.GroupTitle = "";
		}
		this.adaptedProperty();
		this.childrenWidgets = this.layoutChildWidgets();
		var numCols = this.NumCols;
		var children = this.layoutChildWidgets();
		var members = new Array(numCols);
		var perWidth = 100 % numCols == 0 ? 100 / numCols + '%' : parseFloat((100 / numCols).toFixed(2)) + '%';
		for (var i = 0; i < numCols; i++) {
			var width = i == numCols - 1 ? '*' : perWidth;
			var childMembers = [];
			var multiple = 0;
			do {
				var index = multiple * numCols + i;
				if (index < children.length) {
					childMembers = children[index];
				} else {
					break;
				}
				multiple++;
			} while (true);
			members[i] = isc.VLayout.create({
				width: width,
				defaultHeight: 5,
				canAdaptHeight: true,
				canFocus: true,
				adaptHeightBy: function () {
					return 0;
				},
				//height : '100%',
				members: childMembers
			});
		}
		this.members = members;
		this.initV3Widget();
		this.initGroupPanel();
		this.adaptRectByV3();
		this.Super("init", arguments);
	},

	getGroupTitle: function () {
		return this.tmpGroupTitle || this.GroupTitle;//第一次判断时还没有tmpGroupTitle
	},

	addV3Child: function (child) {
		var members = [].concat(this.members);
		members.sort(function (v1, v2) {
			var s1 = v1.members ? v1.members.length : 0;
			var s2 = v2.members ? v2.members.length : 0;
			return s1 - s2;
		});
		members[0].addMember(child);
	},

});
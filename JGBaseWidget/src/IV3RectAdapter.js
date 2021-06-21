isc.ClassFactory.defineInterface("IV3RectAdapter");

isc.IV3RectAdapter.addInterfaceMethods({

	adaptRectByV3: function () {
		if (this.MultiHeight == 'content') {
			this.adaptHeightByV3();
		}
		if (this.MultiWidth == 'content') {
			this.adaptWidthByV3();
		}
	},

	adaptHeightByV3: function () {
		this.canAdaptHeight = true;
		this.adaptHeightBy = function () {
			return 0
		};
	},

	adaptWidthByV3: function () {
		this.canAdaptWidth = true;
		this.adaptWidthBy = function () {
			return 0
		};
	}

});
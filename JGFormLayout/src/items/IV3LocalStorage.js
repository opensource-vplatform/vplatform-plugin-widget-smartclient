isc.ClassFactory.defineInterface("IV3LocalStorage");

isc.IV3LocalStorage.addInterfaceMethods({
	putStorage: function (key, object) {
		var storage = localStorage.getItem(key);
		if (!storage) {
			storage = {};
		} else {
			storage = JSON.parse(storage);
		}
		Object.assign(storage, object);
		localStorage.setItem(key, JSON.stringify(storage));
	},
	getStorage: function (key) {
		var storage = JSON.parse(localStorage.getItem(key));
		return this.sortObj(storage);
	},
	sortObj: function (obj) {
		var arr = [];
		for (var i in obj) {
			arr.push([obj[i], i]);
		};
		arr.reverse();
		var len = arr.length;
		var obj = {};
		for (var i = 0; i < len; i++) {
			obj[arr[i][1]] = arr[i][0];
		}
		return obj;
	}
})
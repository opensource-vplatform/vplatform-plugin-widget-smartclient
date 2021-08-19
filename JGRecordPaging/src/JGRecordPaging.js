/**
 * 记录导航控件
 * @class JGRecordPaging
 * @extends JGBaseWidget
 * @mixes JGStyleHelper
 */
isc.ClassFactory.defineClass("JGRecordPaging", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGRecordPaging", "JGStyleHelper");

isc.addGlobal("JGRecordPaging", isc.JGRecordPaging);

isc.JGRecordPaging.addProperties({

	Top: 0,

	/**
	 * 控件绝对定位左边距
	 *
	 * @type {Number}
	 */
	Left: 0,

	/**
	 * 控件宽度
	 *
	 * @type {Number}
	 */
	Width: 300,

	/**
	 * 控件高度
	 *
	 * @type {Number}
	 */
	Height: 100,

	/**
	 * 是否显示
	 *
	 * @type {Boolean}
	 */
	Visible: true,

	/**
	 * 是否只读
	 *
	 * @type {Boolean}
	 */
	ReadOnly: false,

	/**
	 * 是否使能
	 *
	 * @type {Boolean}
	 */
	Enabled: true,

	/**
	 * 简化模式为"simple"，只显示上一条，下一条
	 */
	pageType: '',

	/**
	 * 保存记录导航控件
	 */
	recordPaging: null,

	/**
	 *  当前页码, 默认值:1
	 */
	pageNumber: 1,

	/**
	 * 每页数据量
	 */
	pageSize: 1,

	/**
	 * 总页数,默认值:1
	 * 
	 * @type {Number}
	 */
	total: 0,

	/**
	 * 将记录导航的控件保存起来
	 */
	members: {},

	/**
	 * 事件类型
	 *
	 * @type {Array}
	 */
	listener: [
		'clickpagefirst',

		'clickpageprev',

		'clickpagenext',

		'clickpagelast',

		'selectpage',

		'indexchanged'
	],

	/**
	 * 保存渲染那边的参数
	 */
	rpOptions: null,

	id: null,
	// skinType变量定义在模版文件
	imgPath: "[APP]/itop/common/smartclient/isomorphic/skins/default/images/",

	className: "JGRecordPagingNormal"
});

isc.JGRecordPaging.addMethods({

	/**
	* 初始化控件
	*/
	_initWidget: function () {

		this.recordPaging = isc.HLayout.create({
			ID: "_" + this.id,
			height: this.Height,
			width: this.Width,
			disabled: !this.Enabled,
			members: this._getMembers(this)
		});

		// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		this.addChild(this.recordPaging);

		this.changeTotal(this.total);
	},

	_afterInitWidget: function (){
		var _widget = this;
		isc.WidgetDatasource.addBindDatasourceLoadEventHandler(this, null, function(params) {
            var resultset = params.resultSet;
            _widget.changeV3Total(params.datasource.getDataAmount());
        });
        isc.WidgetDatasource.addBindDatasourceDeleteEventHandler(this, null, function(params) {
            _widget.changeV3Total(_widget.getTotal() - 1);
        });
		_widget.on("selectpage",_widget.OnJGRecordPagingPageChangeAction);
        _widget.on("indexchanged",_widget.OnSelectIndexChanged);
	},

	/**
	 * 获取记录导航元素
	 */
	_getMembers: function (rp) {
		var members = [];

		var first = isc.IButton.create({
			ID: "first_" + rp.ID,
			height: this.height,
			icon: this.imgPath + "first.png",
			iconOrientation: "center",
			title: "",
			width: pageType === "simple" ? '33.333%' : "20%",
			click: function () {
				var pageNumber = rp.pageNumber,
					pageCount = Math.ceil(rp.total / rp.pageSize);
				rp._callEvent(rp, 'clickpagefirst', pageNumber, pageCount);
				if (pageNumber > 1)
					rp.selectPage(1);
				rp.pageNumber = 1;
				rp._labelHtml(rp.pageNumber, pageCount);
			}
		});

		var prev = isc.IButton.create({
			ID: "prev_" + rp.ID,
			height: this.height,
			icon: this.imgPath + "prev.png",
			iconOrientation: "center",
			title: "",
			width: pageType === "simple" ? '33.333%' : "20%",
			click: function () {
				var pageNumber = parseInt(rp.pageNumber),
					pageCount = Math.ceil(rp.total / rp.pageSize);
				rp._callEvent(rp, 'clickpageprev', pageNumber, pageCount);
				pageNumber = pageNumber - 1;
				rp.selectPage(pageNumber);
				rp.pageNumber = pageNumber;
				rp._labelHtml(pageNumber, pageCount);
			}
		});

		var next = isc.IButton.create({
			ID: "next_" + rp.ID,
			height: this.height,
			icon: this.imgPath + "next.png",
			iconOrientation: "center",
			title: "",
			width: pageType === "simple" ? '33.333%' : "20%",
			click: function () {
				var pageNumber = parseInt(rp.pageNumber),
					pageCount = Math.ceil(rp.total / rp.pageSize);
				rp._callEvent(rp, 'clickpagenext', pageNumber, pageCount);
				pageNumber = pageNumber + 1;
				rp.selectPage(pageNumber);
				rp.pageNumber = pageNumber;
				rp._labelHtml(pageNumber, pageCount);
			}
		});

		var last = isc.IButton.create({
			ID: "last_" + rp.ID,
			height: this.height,
			icon: this.imgPath + "last.png",
			iconOrientation: "center",
			title: "",
			width: pageType === "simple" ? '33.333%' : "20%",
			click: function () {
				var pageNumber = parseInt(rp.pageNumber),
					pageCount = Math.ceil(rp.total / rp.pageSize);
				rp._callEvent(rp, 'clickpagelast', pageNumber, pageCount);
				if (pageNumber < pageCount)
					rp.selectPage(pageCount);
				rp.pageNumber = pageCount;
				rp._labelHtml(rp.pageNumber, pageCount);
			}
		});

		var label = isc.Button.create({
			ID: "label_" + rp.ID,
			align: "center",
			valign: "center",
			height: this.height,
			width: pageType === "simple" ? '33.333%' : "20%",
			title: rp.pageNumber + '/' + rp.total,
			cssText: this.genFontCssText(this.FontStyle, '')
		});

		var pageType = this.pageType;
		if (pageType === "simple") {
			members = [prev, label, next]
		} else {
			members = [first, prev, label, next, last]
		}

		/**
		 * 将初始化的控件保存起来,后面可以直接获取使用
		 */
		for (var i = 0; i < members.length; i++) {
			var item = members[i];
			this.members[item.ID] = item;
		}

		return members;
	},

	/**
	 * 获取文件控件,并将页码等打出来
	 */
	_labelHtml: function (pageNumber, pageCount) {
		var members = this.members;
		var labelItem = members['label_' + this.ID];
		if (pageNumber == 0 && pageCount == 0) {
			labelItem.setTitle("1/0");
		} else {
			labelItem.setTitle(pageNumber + "/" + pageCount);
		}
	},

	/**
	 * 选择页
	 * 
	 * @param {Object}
	 *            target
	 * @param {Object}
	 *            page
	 * @private
	 */
	selectPage: function (page) {
		var pageSize = this.pageSize, total = this.total, pageCount = Math.ceil(total / pageSize), pageNumber = page;
		if (page < 1)
			pageNumber = 1;
		if (page > pageCount)
			pageNumber = pageCount;
		this._callEvent(this, 'selectpage', pageNumber, pageCount);
		this.pageNumber = pageNumber;
		this.showInfo();
	},

	/**
	 * 显示信息
	 * 
	 */
	showInfo: function () {
		var pageCount = Math.ceil(this.total / this.pageSize),
			pageNumber = parseInt(this.pageNumber);
		var members = this.members;
		var first = members['first_' + this.ID];
		var prev = members['prev_' + this.ID];
		var next = members['next_' + this.ID];
		var last = members['last_' + this.ID];
		this._labelHtml(pageNumber, pageCount);
		if (pageNumber == 0 || pageNumber == 1) {
			if (first) {
				first.setDisabled(true);
			}
			prev.setDisabled(true);
		} else {
			if (first) {
				first.setDisabled(false);
			}
			prev.setDisabled(false);
		}
		if (pageNumber == pageCount || pageCount == 0) {
			next.setDisabled(true);
			if (last) {
				last.setDisabled(true);
			}
		} else {
			next.setDisabled(false);
			if (last) {
				last.setDisabled(false);
			}
		}
	},

	/**
	 * 设为不可用
	 */
	setEnabled: function (enable) {
		this.Enabled = enable;
		this.recordPaging.setDisabled(!this.Enabled);
	},

	/**
	 * 设置组件的尺寸大小
	 *
	 * @param {Object}
	 *            attr 传递的组合框的高度，宽度
	 */
	resize: function () {
		var rp = this.recordPaging;
		rp.setHeight(500);
		rp.setWidth(400);
		//var item = this.getItem("prev");
		item.setLeft(180);
	},

	/**
	 * 获取当前页数
	 */
	getPageNumber: function () {
		return this.pageNumber;
	},

	/**
	 * 获取总页数
	 */
	getPageSize: function () {
		return this.pageSize;
	},

	getRpOptions: function () {
		return this.rpOptions;
	},

	getOptions: function () {
		var options = {};
		options["pageNumber"] = this.getPageNumber();
		options["pageSize"] = this.getPageSize();
		return options;
	},

	getTotal: function () {
		return this.total;
	},

	changeTotal: function (total) {
		this.total = total;
		/*if(total > 0){
			this.pageNumber = 1;
		}else{
			this.pageNumber = 0;
		}*/
		this.showInfo();
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this.recordPaging.setWidth(percentWidth);
		this.recordPaging.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this.recordPaging.setHeight(percentHeight);
		this.recordPaging.setHeight("100%");
		if (this.members) {
			var members = this.members;
			var first = members['first_' + this.ID];
			var prev = members['prev_' + this.ID];
			var next = members['next_' + this.ID];
			var last = members['last_' + this.ID];
			var labelItem = members['label_' + this.ID];
			if (first) {
				first.setHeight("100%");
			}
			if (prev) {
				prev.setHeight("100%");
			}
			if (next) {
				next.setHeight("100%");
			}
			if (last) {
				last.setHeight("100%");
			}
			if (labelItem) {
				labelItem.setHeight("100%");
			}
		}
	},

	/**
	   * @param {Object} dataSource
	 */
	bindDataSource: function (dataSource) {

	},

	destroy: function () {
		this.recordPaging = null;
		this.Super("destroy", arguments);
	},

	changeV3Total: function(totalCount) {
        totalCount < 0 && (totalCount = 0);

        // 处理当数据总量发生变化时，重置当前选中，设置为第一条数据
        if (this.total !== totalCount)
            this.pageNumber = 1
        this.changeTotal(totalCount);
    },

	getV3MethodMap: function(){
		return {
			changeTotal: "changeV3Total",
		

		}
	}

});





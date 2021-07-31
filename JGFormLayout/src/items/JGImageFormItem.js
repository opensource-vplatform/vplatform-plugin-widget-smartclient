isc.ClassFactory.defineClass("JGImageFormItem", "ImgItem");
isc.ClassFactory.mixInInterface("JGImageFormItem", "JGImageHelper");
isc.ClassFactory.mixInInterface("JGImageFormItem", "IV3FormItem");

isc.JGImageFormItem.addProperties({

	_blankSrc: "itop/common/images/defaultImg.png",
	WidgetStyle: 'JGImage',
	//        	Placeholder: "placeholder"
});

isc.JGImageFormItem.addMethods({
	init: function () {
		//this.Dock = "Fill"
		this.cellStyle = "formCell JGImageFormItem";
		var src = this.ImageValue ? this.ImageValue : this._blankSrc;
		src = this.getStaticImagePath(src);
		this.disabled = false;
		this.canEdit = this.ReadOnly == true ? false : true;
		this.className = this.WidgetStyle + "Stack";
		this.name = this.ColumnName;
		this.globalTabIndex = this.TabIndex;
		this.title = this.ImageValue;
		this.showTitle = false;
		if (!this.showTitle) {
			this.cellStyle += " formItemNoLabel";
		}
		//	            this.width = this.Dock == "None" ? this.Width : "100%";
		this.height = this.Dock == "None" ? this.Height : "100%";
		this.cursor = this._handleImageMouse();
		this.src = src;
		this.hoverWidth = 250; // 浮动框大小设置。
		this.statelessImage = true;
		this.imagePosition = this.ImagePosition; //图片位置属性
		this.click = this.getV3EventHandler(this.Code, "OnClick");; //支持点击事件
		this.visible = this.Visible;
		if (this.ToolTip) {
			this.prompt = this.getToolTipHandler(this.Code, this.ToolTip)
		}
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
		this.Super("init", arguments);
	},
	getStaticImagePath: function (path) {
		return window && window._$basePath ? window._$basePath + path : path; //原型工具中，静态图片路径处理
	},
	_handleImageMouse: function () {
		// 处理鼠标手势
		// 1. 配置了鼠标手势，按照鼠标手势显示，
		// 2. 未配置鼠标手势，如果配置了点击事件，则默认显示鼠标为“小手“
		if (this.ImageMouse + "" !== "default")
			if (this.ImageMouse == 'Hand') {
				return 'hand';
			} else if (this.ImageMouse == 'IBeam') {
			return 'text';
		} else if (this.OnClick + "" !== "")
			return "pointer";
		else
			return "default";
	},
	fitSizeByResize: function () {
		// 处理面板下图片控件自适应问题
		var imgRealHeight = this.img._realImageHeight;
		var imgRealWidth = this.img._realImageWidth;
		if (imgRealHeight && imgRealWidth) {
			this.fitImageSize(imgRealWidth, imgRealHeight)
		}
	},
	resized: function () {
		this.fitSizeByResize();
		this.Super(arguments, "resized");
	},
	setValues: function (imageObjId) {
		if (imageObjId + "" !== "undefined" && imageObjId + "" !== "null" && imageObjId !== "") {
			var _img = this;

			if (!_img)
				return;

			if (imageObjId.indexOf("itop/vjs/icons") > -1)
				_img.setSrc(imageObjId, this.WidgetStyle)
			else if (imageObjId.startsWith("/")) // 图片字段为文件目录
				_img.setSrc(imageObjId.substring(1), this.WidgetStyle)
			else if (imageObjId.indexOf("http") === 0) // 图片字段为URL
				_img.setSrc(imageObjId, this.WidgetStyle)
			else {
				// 图片字段为数据库DB
				// 构造url
				var url = "module-operation!executeOperation?operation=FileDown&token=%7B%22data%22%3A%7B%22dataId%22%3A%22" + imageObjId + "%22%2C%22ImageObj%22%3A%22" + imageObjId + "%22%7D%7D";
				this.ImageObj = url;
				_img.setSrc(url, this.WidgetStyle);
			}
		} else
			this.reset()
	},
	clearValues: function () {
		this.reset();
	},
	reset: function () {
		this.ImageObj = this._blankSrc;
		this.setSrc(this._blankSrc, this.WidgetStyle);
	},
	getValueChangeFields: function () {
		return [this.name];
	},

	getBindFields: function () {
		return this.getValueChangeFields();
	},
	isReadOnly: function () {
		var _1 = this;
		while (_1.parentItem != null) {
			if (_1.canEdit != null) {
				return !_1.canEdit
			}
			_1 = _1.parentItem
		}
		return _1.ReadOnly || _1._ReadOnly || !_1.canEdit;
	}
});
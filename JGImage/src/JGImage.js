/**
 * 平台图片控件
 * @class JGImage
 * @mixes IRecordObserver
 * @extends JGBaseWidget
 * @example
 * var ds = isc.V3Datasource.create({
	fields:[{
		name: "id",
		primaryKey:true,
		type: "text",
		title: "主键id"
	},{
		name: "a",
		type: "text",
		title: "字段a"
	}]
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton1122",
    SimpleChineseTitle: "鼠标状态",
    Width: 86,
    Top: 20,
    Left: 727,
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage1112",
    Height: 150,
    Width: 150,
    Top: 52,
    Left: 727,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    OnClick: function () {}
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage1111111",
    Height: 150,
    Width: 299,
    Top: 280,
    Left: 400,
    OnClick: function () {},
    TableName: ds,
    ColumnName: "a",
    Placeholder: "test",
    ImagePosition: "fill"
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton112111",
    SimpleChineseTitle: "提醒文字:test",
    Width: 127,
    Top: 233,
    Left: 227
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage111111",
    Height: 150,
    Width: 150,
    Top: 280,
    Left: 227,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    OnClick: function () {},
    Placeholder: "test",
    ImagePosition: "fill"
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton11211",
    SimpleChineseTitle: "浮动提示:111111",
    Width: 127,
    Top: 233,
    Left: 21
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage11111",
    Height: 150,
    Width: 150,
    Top: 280,
    Left: 21,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    OnClick: function () {},
    ToolTip: "\"111111\"",
    ImagePosition: "fill"
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton1121",
    SimpleChineseTitle: "图片拉伸",
    Width: 86,
    Top: 233,
    Left: 761
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage1111",
    Height: 150,
    Width: 150,
    Top: 280,
    Left: 761,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    OnClick: function () {},
    ImagePosition: "fill"
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton112",
    SimpleChineseTitle: "鼠标状态",
    Width: 86,
    Top: 20,
    Left: 549
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage111",
    Height: 150,
    Width: 150,
    Top: 52,
    Left: 549,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    ImageMouse: "Hand",
	OnClick: function () {}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton111",
    SimpleChineseTitle: "默认隐藏，点击切换",
    Width: 139,
    Top: 20,
    Left: 363,
    OnClick: function () {
		img.setVisible(!img.isVisible());
	}
});
var img = isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage12",
    Height: 150,
    Width: 150,
    Top: 52,
    Left: 363,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    Visible:false
});
var info = isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton11",
    SimpleChineseTitle: "点击事件",
    Width: 86,
    Top: 20,
    Left: 188
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage11",
    Height: 150,
    Width: 150,
    Top: 52,
    Left: 188,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png",
    OnClick: function () {
		info.setSimpleChineseTitle("点击事件触发！");
	}
});
isc.JGButton.create({
    autoDraw: true,
    Code: "JGButton1",
    SimpleChineseTitle: "宽高：150",
    Width: 86,
    Top: 20,
    Left: 21
});
isc.JGImage.create({
    autoDraw: true,
    Code: "JGImage1",
    Height: 150,
    Width: 150,
    Top: 52,
    Left: 21,
	ImageValue: "http://vstore-developer.yindangu.com/v3/itop/common/images/defaultImg.png"
});
ds.load([{
	id : "1",
	a : "222"
}]);
 */
isc.ClassFactory.defineClass("JGImage", "JGBaseWidget");
isc.ClassFactory.mixInInterface("JGBaseWidget", "IRecordObserver");

// 定义v3ui控件属性
isc.JGImage.addProperties({
    widgetId: "JGImage1",
    /**
     * 浮动提示
     * @memberof JGImage
     * @property {String}
     * @instance
     */
    ToolTip: "",
    Placeholder: "",
    code: "JGImage1",
    /**
     * 左边距
     * @memberof JGImage
     * @property {Number}
     * @instance
     */
    Left : 0,
    HorizontalAlign: "Left",
    type: "JGImage",
    ColSpan: "1",
    TabIndex: 30,
    WidgetStyle: "JGImage",
    PercentHeight: "6%",
    /**
     * 显示
     * @memberof JGImage
     * @property {Boolean}
     * @instance
     */
    Visible: true,
    //JGImage提供的事件列表
    listener: ['OnClick'],
    /**
     * 高度
     * @memberof JGImage
     * @property {Number}
     * @instance
     */
    Height: 100,
    AutoTest: true,
    /**
     * 宽度
     * @memberof JGImage
     * @property {Number}
     * @instance
     */
    Width: 100,
    _$windowVersion: "1",
    SourceTableName: "virtualDB_JGImage_JGImage1",
    StaticLayoutSize: true,
    VerticalAlign: "Top",
    EndRow: "False",
    ImageObject: "",
    ImagePosition: "contain",
    Code: "JGImage1",
    MultiHeight: "100px",
    OnClick: "",
    PlaceholderPosition: "Right",
    StartRow: "False",
    TableName: "",
    /**
     * 泊靠
     * @memberof JGImage
     * @property {String}
     * @instance
     */
    Dock: "None",
    _$WidgetType: "JGImage",
    /**
     * 上边距
     * @memberof JGImage
     * @property {Number}
     * @instance
     */
    Top: 0,
    Alias: "图片",
    ImageMouse: "Default",
    MultiWidth: "100px",
    PercentWidth: "5.4%",
    ImageValue: "",
    //绑定字段名称
    ColumnName: 'ImageObj',
    _blankSrc: "itop/common/images/defaultImg.png"
});

isc.JGImage.addMethods({
    getStaticImagePath: function (path) {
        return window && window._$basePath ? window._$basePath + path : path; //原型工具中，静态图片路径处理
    },
    _initWidget: function () {
        if(this.TableName && typeof(this.TableName) != "string"){
            //将控件绑定到数据源
            this.TableName.addObserver(this);
        }
        this.ImageObj = this.ImageValue;
		if (this.ImageValue != null && this.ImageValue.indexOf("/") != -1) {
			this.ImageValue = this.ImageValue.substring(this.ImageValue.lastIndexOf("/") + 1);
		}
		if (this.ImageMouse != null) {
			if (this.ImageMouse == 'Default') {
				this.ImageMouse = 'default';
			} else if (this.ImageMouse == 'Hand') {
				this.ImageMouse = 'pointer';
			} else if (this.ImageMouse == 'IBeam') {
				this.ImageMouse = 'text';
			}
		}
        var src = this.ImageObj ? this.ImageObj : this._blankSrc;
        this.src = this.getStaticImagePath(src);
        this.disabled = false;
        this.className = this.WidgetStyle + "Stack";
        var items = [];
        var height = this.Dock == "None" ? this.Height : "100%";
        var width = this.Dock == "None" ? this.Width : "100%";
        var dynamicImgProperties = {
            height: height,
            cursor: this._handleImageMouse(),
            width: width,
            statelessImage: true,
            imageType: isc.Img.CENTER,
            overflow: isc.Canvas.HIDDEN,
            src: null,
            imagePosition: this.ImagePosition, //图片位置属性
            hoverWidth: 250, // 浮动框大小设置。
            title: this.ImageValue,
        };
        // Button-specific properties
        if (this.appImgDir) dynamicImgProperties.appImgDir = this.appImgDir;
        //if (this.src) dynamicImgProperties.src = this.src;
        //if (this.visibility) dynamicImgProperties.visibility = this.visibility;

        // Use 'addAutoChild' - this will handle applying the various levels of defaults
        // Note: also assign this.button to enable AutoTest getAutoChildLocator() to find this child
        this.img = this.createAutoChild("img", dynamicImgProperties, isc.Img);
        this.setSrc(src, this.type);
        this.addChild(this.img);
        this.click = this._handleClick;
    },
    // 设置url接口
    setSrc: function (url, widgetType) {
        var _self = this;
        if (this.img) {
            if (url) { //如果是有效的路径
                url = isc.Page.getAppImgDir(url);

                // 图片控件无需缓存图片队列，仅需显示最后一次设置的图片
                if (widgetType === "JGImage") {
                    url = url.replace(/\\/g, "/"); //处理数据中包含 \ 字符，该字符应表示为目录关系
                    this._imgUrl = url;
                    this._imgObj = new Image();
                    this._imgObj.onload = function () {
                        if (_self._imgUrl === this.src && _self.img) {//兼容：页面未完全打开就被关掉Task20210603031
                            _self.fitImageSize(this.width, this.height);
                            _self.img.setSrc(url);

                            _self.img.markForRedraw()
                        }
                    }
                    this._imgObj.src = url;
                } else {
                    isc.JGImageHelper.imageReady(url, function () {
                        _self.fitImageSize(this.width, this.height);
                        _self.img.setSrc(url);
                        _self.img.markForRedraw();
                    });
                }
            } else { //无效路径
                this.img.src = null;
                this.img.markForRedraw();
            }
        }
    },
    /**
     * 调整图片显示的高宽
     * @param realWidth
     * @param realHeight
     */
    fitImageSize: function (realWidth, realHeight) {
        // 存储图片真实宽高
        this.img._realImageWidth = realWidth;
        this.img._realImageHeight = realHeight;

        var innerWidth = this.img.getInnerWidth();
        var innerHeight = this.img.getInnerHeight();
        if (this.ImagePosition + "" === "fill") {
            // 填充
            this.img.imageHeight = innerHeight;
            this.img.imageWidth = innerWidth
        } else {
            // 默认自适应
            if (realWidth <= innerWidth && realHeight <= innerHeight) {
                this.img.imageHeight = realHeight;
                this.img.imageWidth = realWidth;
            } else {
                if (realWidth / realHeight >= innerWidth / innerHeight) {
                    this.img.imageWidth = innerWidth;
                    this.img.imageHeight = realHeight * innerWidth / realWidth;
                } else {
                    this.img.imageHeight = innerHeight;
                    this.img.imageWidth = realWidth * innerHeight / realHeight;
                }
            }
        }
    },


    destroy: function () {
        var img = this.img;
        if (img) {
            this.img = null;
            img.destroy();
        }
        this.Super("destroy", arguments);
    },
    _handleImageMouse: function () {
        // 处理鼠标手势
        // 1. 配置了鼠标手势，按照鼠标手势显示，
        // 2. 未配置鼠标手势，如果配置了点击事件，则默认显示鼠标为“小手“
        if (this.ImageMouse + "" !== "default")
            return this.ImageMouse;
        else if (this.OnClick + "" !== "")
            return "pointer";
        else
            return "default";
    },
    resized: function () {
        // 处理面板下图片控件自适应问题
        var imgRealHeight = this.img && this.img._realImageHeight;
        var imgRealWidth = this.img && this.img._realImageWidth;
        if (imgRealHeight && imgRealWidth)
            this.fitImageSize(imgRealWidth, imgRealHeight)
        this.Super(arguments, "resized");
    },
    _handleClick: function () {
        this._referTimerEventHandler(this, [this._setFocus, 'OnClick']);
    },
    bindDataSource: function (ds) {
        this.dataSource = ds;
        var vm = isc.JGV3ValuesManager.getByDataSource(ds);
        var dy = vm.getMember(this.ID);
        if (!dy)
            vm.addMember(this)
    },
    getBoundFieldNames: function () {
        return [this.ColumnName]
    },
    /**
     * 引用控件事件，此方法应用给内部子控件
     * 内部子控件作为事件触发源，需要将事件中转到本控件
     * 防止事件执行过久而导致用户继续触发
     */
    _referTimerEventHandler: function (obj, eventNames) {
        if (!isc.isAn.Array(eventNames)) eventNames = [eventNames];
        var ID = obj.ID;
        //return function(){
        var _this = this.getWindow()[ID];
        if (!_this) {
            throw Error('不存在[' + ID + ']对象，请检查！');
        }
        if (eventNames && eventNames.length > 0) {
            for (var i = 0, len = eventNames.length; i < len; i++) {
                var eventName = eventNames[i];
                if (typeof (eventName) == "function") {
                    eventName.apply(_this, arguments);
                } else {
                    var eventHandler = _this.listener[eventName];
                    if (eventHandler && eventHandler.length > 0) {
                        for (var j = 0, l = eventHandler.length; j < l; j++) {
                            var handler = eventHandler[j];
                            isc.TimerEventHandler.push(function () {
                                var widget = window[ID];
                                if (widget && widget.pause) {
                                    widget.pause();
                                }
                            });
                            isc.TimerEventHandler.push(function () {
                                var widget = window[ID];
                                if (widget) {
                                    handler.apply(widget, arguments);
                                    if (widget.resume && !widget.destroyed) {
                                        widget.resume();
                                    }
                                }
                            });
                            isc.TimerEventHandler.run();
                        }

                    }
                }
            }
        }
        //return true;
        //};
    },
    _referPartFunc: function () {
        this._referFuncs(this, ["clearValues", "editRecord", "editNewRecord"]);
    },
    //暂停使用_referTimerEventHandler
    pause: function () {
        this.setDisabled(true);
    },
    //继续使用_referTimerEventHandler
    resume: function () {
        //if(!this.isEnabled || this.isEnabled()){
        this.setDisabled(false);
        //}
    },
    /**
     *获取焦点，防止控件在chrome中点击图片无法使其他控件失去焦点 
     */
    _setFocus: function () {
        this.focus();
    },
    /**
     * 获取中文标题
     * @return 中文标题
     */
    getImageValue: function () {
        return this.ImageValue;
    },
    /**
     * 设置中文标题
     * @param title 中文标题
     */
    setImageValue: function (imageValue) {
        this.ImageValue = imageValue;
        this.redraw();
    },
    /**
     * 设置控件值
     * @param val 控件值
     */
    setItemValues: function (record) {
        if (record != undefined && record != null && !isc.isA.emptyObject(record)) {
            var val = record[this.ColumnName] ? record[this.ColumnName] : "";
            this.setValue(val);
        }
    },
    /**
     * 设置值
     * @param imageObjId 图片字段
     */
    setValue: function (imageObjId) {
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
    /**
     * 设置图片路径
     * @memberof JGImage
     * @method
     * @instance
     */
    setImageUrl: function (url) {
        this.ImageObj = url;
        this.setSrc(url, this.WidgetStyle);
    },
    /**
     * 获取图片路径
     * @memberof JGImage
     * @method
     * @instance
     * @returns {String} 图片路径
     */
    getImageUrl : function(){
        return this.ImageObj;
    },
    /**
     * 重置值reset
     */
    reset: function () {
        this.ImageObj = this._blankSrc;
        this.setSrc(this._blankSrc, this.WidgetStyle);
    },
    //放在容器中按布局排版时设置比例
    setPercentWidth: function (percentWidth) {
        this.setWidth(percentWidth);
    },
    setPercentHeight: function (percentHeight) {
        this.setHeight(percentHeight);
    },
    editRecord: function (record) {
        var val = record[this.ColumnName];
        this.setValue(val);
    },
    clearValue: function () {
        this.reset();
    },

    getBindFields : function(){
        return [this.ColumnName];
    },

    setWidgetData : function(val){
        this.setValue(val);
    },

    clearWidgetData : function(){
        this.clearValue();
    }

});
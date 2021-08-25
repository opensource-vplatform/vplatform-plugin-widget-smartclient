/**
 * 图片播放
 * @class JGImagePlay
 * @extends JGBaseWidget
 * 
 */
isc.ClassFactory.defineClass("JGImagePlay", "JGBaseWidget");

// 定义v3ui控件属性
isc.JGImagePlay.addProperties({

	_imagePlay: null,

	// 存储定时器返回值
	_ret: null,

	// 存储定时器返回值， 支持一个页面多个图片播放控件
	_rets: null,

	// 存储定时器返回值
	_images: null,

	// 存储当前播放图片的号码
	_playNO: 0,

	// 存储当前播放图片的号码
	_playTempNO: null,

	//JGImage提供的事件列表
	listener: ['click', 'change', 'selectionChanged', 'descClick'],
	//绑定字段名称
	//ColumnName:'ImageObj'
	WidgetStyle: "JGImagePlay",

	// 默认图片设置
	DefaultImg: "itop/common/images/defaultImg.png",

	$DefaultBorderWidth: 1,
	$DefaultBorderStyle: 'solid',
	$DefaultBorderColor: '#000'

});


isc.JGImagePlay.addMethods({

	getStaticImagePath: function (path) {
		return window && window._$basePath ? window._$basePath + path : path; //原型工具中，静态图片路径处理
	},



	//自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数

	_initWidget: function () {
		// 初始化图片目录
		isc.Page.setAppImgDir("");

		var _JGImagePlay = this;

		// 初始化DynamicForm中的item控件,图片播放包括：Img，Label
		this._imagePlay = isc.Canvas.create({
			//top: this.Top,
			//left: this.Left,
			_borderWidth: this.BorderWidth + "" !== "undefined" && this.BorderWidth + "" !== "null" ? this.BorderWidth : this.$DefaultBorderWidth,
			border: this._genBorderStyle(this.BorderWidth, this.BorderStyle, this.BorderColor),
			styleName: this.WidgetStyle,
			width: this.Width,
			height: this.Height,
			overflow: "hidden",
			_swiInterval: this.SwiInterval ? this.SwiInterval : 5,
			resized: function () {
				// 处理面板控件（borderLayOut）内的图片播放控件宽高不正常
				if (this.children[1] && this.children[1]._realImageWidth)
					this.parentElement.fitImageSize(this.children[1]._realImageWidth, this.children[1]._realImageHeight);
				return this.invokeSuper(null, "resized");
			},
			children: [
				isc.VStack.create({
					width: "100%",
					height: "100%",
					peers: [
						//图片
						this._imageCanvas = isc.Img.create({
							_parent: this,
							top: this.Top,
							left: this.Left,
							width: "100%",
							height: "100%",
							imageType: isc.Img.CENTER,
							overflow: isc.Canvas.HIDDEN,
							align: "center",
							src: this.ImageObj ? this.ImageObj : this.getStaticImagePath(this.DefaultImg),
							snapTo: "C",
							getInnerHTML: function () {
								var rs = this.Super("getInnerHTML", arguments);
								try {
									var parentWidget = this.parentElement.parentElement;
									if (parentWidget.ImageLayout == "Zoom") {
										var divEl = document.createElement("div");
										divEl.innerHTML = rs;
										var imgEle = divEl.getElementsByTagName("img");
										imgEle[0].style = "width:auto;height:auto;max-width:" + parentWidget.getWidth() + "px;max-height:" + parentWidget.getHeight() + "px;";
										rs = divEl.innerHTML;
									}
								} catch (e) { }
								return rs;
							},
							click: this._referEvent(this, 'click')
						}),



					]
				}),
				//底部文字显示栏
				// 功能改造，不显示文件名标题，改为显示个数，要在left,right区域前创建，这样它的zIndex就在较下面
				this._bottomCanvas = isc.HLayout.create({
					_parent: this,
					height: 40, //21,
					width: "100%",
					snapTo: "B",
					align: "right",
					members: [
						this._bottomContentCanvas = isc.Label.create({
							width: "100%",
							//                                    overflow: "hidden",
							height: 40,
							cssText: "padding-left: 12px; " + this._handleContIEHack(),
							styleName: this.WidgetStyle + "Label",
							valign: "center",
							contents: "",
							wrap: true,
							click: this._referEvent(this, 'descClick'),
							prompt: ""
						}),
						this._bottomLabelCanvas = isc.Label.create({
							width: 51,
							height: 40,
							cssText: this._handleContIEHack(),
							visibility: this.PaginationVisible + "" === "false" ? "hidden" : "visible",
							styleName: this.WidgetStyle + "Label",
							align: "center",
							contents: ""
						})
					]
				}),
				//左边后退图标
				this._leftCanvas = isc.VLayout.create({
					_parent: this,
					height: "100%",
					width: 60,
					snapTo: "L",
					click: this._playPre,
					//                            visibility: "hidden",
					align: "center",
					cursor: "hand",
					members: [
						this._leftIconCanvas = isc.Canvas.create({
							width: 38,
							height: 60,
							opacity: 50,
							cursor: "hand",
							visibility: "hidden",
							styleName: this.WidgetStyle + "LeftIcon",
							backgroundImage: this.getStaticImagePath("itop/common/widget/smartclient/JGImagePlay/ico-left.png"),
							backgroundRepeat: "no-repeat",
							backgroundPosition: 'center'
						})
					]
				}),
				//右边前进图标
				this._rightCanvas = isc.VLayout.create({
					_parent: this,
					height: "100%",
					width: 60,
					snapTo: "R",
					click: this._playNext,
					//                            visibility: "hidden",
					align: "center",
					cursor: "hand",
					layoutLeftMargin: 22,
					members: [
						this._rightIconCanvas = isc.Canvas.create({
							width: 38,
							height: 60,
							opacity: 50,
							cursor: "hand",
							visibility: "hidden",
							styleName: this.WidgetStyle + "RightIcon",
							backgroundImage: this.getStaticImagePath("itop/common/widget/smartclient/JGImagePlay/ico-right.png"),
							backgroundRepeat: "no-repeat",
							backgroundPosition: 'center'
						})
					]
				})
			],

			//绑定滑动图标显示隐藏事件			
			mouseOver: (function (obj) {
				function innerFunc() {
					var fun = obj['_showSlideImg'];
					return fun.apply(obj, arguments);
				}
				return innerFunc;
			})(this),
			mouseOut: (function (obj) {
				function innerFunc() {
					var fun = obj['_hideSlideImg'];
					return fun.apply(obj, arguments);
				}
				return innerFunc;
			})(this)
		});
		this.addChild(this._imagePlay);
	},
	_afterInitWidget: function () {
		var _this = this;
		this.on("selectionChanged", function (id) {
			if (id) {
				var datasource = isc.WidgetDatasource.getBindDatasource(this);
				var selectedRecord = datasource.getRecordById(id);
				datasource.setCurrentRecord(selectedRecord);
				
			}
		});
		this.on("click", this.OnClick);
		this.on("change", this.OnImageChanged);
		this.on("descClick", this.OnDescClick);

		isc.WidgetDatasource.addBindDatasourceLoadEventHandler(this, null, function (params) {
			var resultset = params.resultSet;
			var images = _this.getImages(resultset);
			_this.loadImg(images);
		});
		isc.WidgetDatasource.addBindDatasourceInsertEventHandler(this, null, function (params) {
			var resultset = params.resultSet;
			var images = _this.getImages(resultset);
			_this.insertImg(images);
		});
		isc.WidgetDatasource.addBindDatasourceUpdateEventHandler(this, null, function (params) {
			var resultset = params.resultSet;
			var images = _this.getImages(resultset);
			_this.updateImg(images);
		});
		isc.WidgetDatasource.addBindDatasourceCurrentEventHandler(this, null, function (params) {
			var currentRecord = params.currentRecord;
			var id = currentRecord.id;
			_this.selectImg(id);
		});
		isc.WidgetDatasource.addBindDatasourceDeleteEventHandler(this, null, function (params) {
			var delDatas = params.resultSet;
			if (!delDatas || delDatas.length <= 0)
				return;
			for (var index = delDatas.length - 1; index >= 0; index--) {
				var delData = delDatas[index];
				var delId = delData.id;
				_this.deleteImg(delId);
			}
		});
	},

	_genBorderStyle: function (borderWidth, borderStyle, borderColor) {
		borderWidth = isc.isA.nonemptyString(borderWidth) ? borderWidth : this.$DefaultBorderWidth;
		borderStyle = isc.isA.nonemptyString(borderStyle) ? borderStyle : this.$DefaultBorderStyle;
		borderColor = isc.isA.nonemptyString(borderColor) ? borderColor : this.$DefaultBorderColor;
		return borderWidth + 'px ' + borderStyle + ' ' + borderColor;
	},

	_handleContIEHack: function () {
		var _result = "";

		if (isc.Browser.isIE8)
			_result += "filter: progid:DXImageTransform.Microsoft.Alpha(opacity=30); position: static;";
		else
			_result += "background-color: rgb(0,0,0);opacity:0.3;";

		return _result;
	},

	_handleDescFont: function () {
		var _result = this.DescFont;

		if (_result)
			_result = _result.replaceAll('{', '').replaceAll('}', '').replaceAll('\,', ';').replaceAll('\"', '') + ";";
		else
			_result = "";

		return _result;
	},

	onDraw: function () {
		if (this._leftIconCanvas && this._rightIconCanvas) {
			//peers方式下的控件设置属性visibility : "hidden"不生效（sc是这样，原因不详）,要在画后调一下hide方法
			this._leftIconCanvas.hide();
			this._rightIconCanvas.hide();
		}
	},

	/**
	 * 显示滑动图片
	 */
	_showSlideImg: function () {
		this._leftIconCanvas.show();
		this._rightIconCanvas.show();

		this._stopAnimationStart();
		// 初始化临时播放序列号
		if (this._playTempNO == null) {
			var prePlayNO = this._playNO;
			if (prePlayNO == 0) {
				if (this._images == null) {
					prePlayNO = 1;
				} else {
					prePlayNO = this._images.length;
				}

			}
			this._playTempNO = prePlayNO - 1;
		}
	},
	/**
	 * 隐藏滑动图片
	 */
	_hideSlideImg: function () {
		this._leftIconCanvas.hide();
		this._rightIconCanvas.hide();

		if (isc.JGImagePlay._rets) {
			var curID = this._getInterSeqId();
			isc.JGImagePlay._rets[curID] = null;
			this._startAnimationStart()
		}
	},

	/**
	 *上一张图片
	 *@param  img图片对象
	 */
	_playPre: function () {
		var myParent = this._parent;
		if (!myParent || !myParent._images) {
			return;
		}
		var playTempNO = myParent._playTempNO;
		if (playTempNO == 0) {
			//alert("已经是第一张了！");
			playTempNO = playTempNO + 1;
		} else {
			var name = myParent._images[playTempNO - 1].name;
			var src = myParent._images[playTempNO - 1].src;
			var id = myParent._images[playTempNO - 1].id;
			var desc = myParent._images[playTempNO - 1].desc;
			myParent._setValue(src, name, playTempNO - 1, desc);
			// 触发db选中
			myParent._callEvent(myParent, 'selectionChanged', id);
			// 触发图片切换事件
			myParent._callEvent(myParent, 'change');
		}
		myParent._playTempNO = playTempNO - 1;
	},

	/**
	 *下一张图片
	 *@param  img图片对象 
	 */
	_playNext: function () {
		var myParent = this._parent;
		if (!myParent || !myParent._images) {
			return;
		}
		var playTempNO = myParent._playTempNO;
		if (playTempNO > myParent._images.length - 1) {
			playTempNO = myParent._images.length - 1;
		}
		if (playTempNO == myParent._images.length - 1) {
			//alert("已经是最后一张了！");
			playTempNO = playTempNO - 1;
		} else {
			var name = myParent._images[playTempNO + 1].name;
			var src = myParent._images[playTempNO + 1].src;
			var id = myParent._images[playTempNO + 1].id;
			var desc = myParent._images[playTempNO + 1].desc;
			myParent._setValue(src, name, playTempNO + 1, desc);
			// 触发db选中
			myParent._callEvent(myParent, 'selectionChanged', id);
			// 触发图片切换事件
			myParent._callEvent(myParent, 'change');
		}
		myParent._playTempNO = playTempNO + 1;
	},

	/**
	 * 获取显示状态
	 * @return 显示状态
	 */
	_isVisible: function () {
		return this.Visible;
	},
	/**
	 * 设置显示状态
	 * @param visible 显示状态
	 */
	_setVisible: function (visible) {
		this.Visible = visible;
		var images = this._imagePlay.children;
		for (var i = 0; i < images.length; i++) {
			if (visible) {
				images[i].show();
			} else {
				images[i].hide();
			}
		}
	},

	/**
	 * 调整图片显示的高宽
	 * @param realWidth
	 * @param realHeight
	 */
	fitImageSize: function (realWidth, realHeight) {
		// 处理某些情况下对象不存在
		if (this._imagePlay && this._imageCanvas) {
			// 存储图片真实宽高
			this._imageCanvas._realImageWidth = realWidth;
			this._imageCanvas._realImageHeight = realHeight;

			var innerWidth = this.getVisibleWidth() - this._imagePlay._borderWidth * 2;
			var innerHeight = this.getVisibleHeight() - this._imagePlay._borderWidth * 2;

			if (this.ImageLayout + "" === "Stretch") {
				// 支持拉伸属性
				this._imageCanvas.imageHeight = innerHeight;
				this._imageCanvas.imageWidth = innerWidth;
			} else if (realWidth <= innerWidth && realHeight <= innerHeight) {
				this._imageCanvas.imageHeight = realHeight;
				this._imageCanvas.imageWidth = realWidth;
			} else {
				if (realWidth / realHeight >= innerWidth / innerHeight) {
					this._imageCanvas.imageWidth = innerWidth;
					this._imageCanvas.imageHeight = realHeight * innerWidth / realWidth;
				} else {
					this._imageCanvas.imageHeight = innerHeight;
					this._imageCanvas.imageWidth = realWidth * innerHeight / realHeight;
				}
			}
		}
	},
	_fitImageSize: function (realWidth, realHeight) {
		if (this._imagePlay && this._imageCanvas) {
			// 存储图片真实宽高
			this._imageCanvas._realImageWidth = realWidth;
			this._imageCanvas._realImageHeight = realHeight;

			var innerWidth = this.getVisibleWidth() - this._imagePlay._borderWidth * 2;
			var innerHeight = this.getVisibleHeight() - this._imagePlay._borderWidth * 2;

			if (this.ImageLayout + "" === "Stretch") {
				// 支持拉伸属性
				this._imageCanvas.imageHeight = innerHeight;
				this._imageCanvas.imageWidth = innerWidth;
			}/*else if(realWidth/realHeight > innerWidth/innerHeight){
		                //this._imageCanvas.imageHeight = innerHeight;
		                this._imageCanvas.setClassName("imgHcenter");
		            }else{
		                //this._imageCanvas.imageWidth = innerWidth;
		                this._imageCanvas.setClassName("imgWcenter");
		            }*/
		}
	},
	/**
	 * 设置值
	 * @param url 图片地址
	 * @param title 图片名称
	 */
	_setValue: function (url, title, playNo, desc) {
		var _self = this;
		this.ImageObj = url;
		var totalCount = this._images ? this._images.length : 0;
		var curPlayNo = playNo + 1;
		var titleContent = this._genPagDom(curPlayNo + "/" + totalCount);
		// 图片赋值
		// 如果组件关闭，就停止播放
		if (this._imagePlay && this._imagePlay.children) {
			if (this._imageCanvas && this._imagePlay && this._bottomLabelCanvas) {
				if (url) {
					//有效的图片地址
					isc.JGImageHelper.imageReady(url, function () {
						// _self.fitImageSize(this.width, this.height);
						_self._fitImageSize(this.width, this.height);
						_self._imageCanvas.setSrc(url);
						_self._imageCanvas.markForRedraw();
						//_self._bottomLabelCanvas.setContents("<font color='white'>"+titleContent+"</font>");
						_self._bottomContentCanvas.setContents(_self._genContentDom(desc));
						_self._bottomContentCanvas.prompt = desc;
						_self._bottomLabelCanvas.setContents(titleContent);
					});
				} else {
					//无效的图片
					if (!this._isExistsImg())
						this._imageCanvas.setSrc(this.DefaultImg);
					this._imageCanvas.markForRedraw();
					this._bottomContentCanvas.setContents(this._genContentDom(desc));
					this._bottomContentCanvas.prompt = desc;
					this._bottomLabelCanvas.setContents(titleContent);
				}


			}
		} else {
			this._stopAnimationStart();
		}
	},
	_genPagDom: function (value) {
		if (isc.Browser.isIE8)
			return "<div style='position: relative;'>" + value + "</div>"
		else
			return value;
	},
	_genContentDom: function (desc) {
		// 处理描述文字样式
		if (desc === null || desc === undefined || Object.prototype.toString.call(desc) !== "[object String]")
			desc = "";

		if (!this.DescForeColor)
			this.DescForeColor = "#FFF"

		return "<div style='white-space:nowrap; overflow:hidden; text-overflow:ellipsis; position: relative; color: " + this.DescForeColor + "; " + this._handleDescFont() + "'>" + desc + "</div>";
	},
	_isExistsImg: function () {
		// 判断图片队列中是否存在图片
		var result = false;
		var _imgs = this._images;
		if (_imgs && _imgs.length > 0) {
			for (var i = 0, len = _imgs.length; i < len; i++) {
				var _tmpObj = _imgs[i];
				if (_tmpObj.src && _tmpObj.src + "" !== "") {
					result = true;
					break
				}
			}
		}

		return result;
	},
	/**
	 * 重置值
	 */
	_resetValue: function () {
		this.ImageObj = this.DefaultImg;
		if (this._imagePlay && this._imagePlay.children) {
			if (this._imageCanvas && this._bottomLabelCanvas) {
				this._imageCanvas.setSrc(this.DefaultImg);
				this._imageCanvas.imageHeight = 0;
				this._imageCanvas.imageWidth = 0;
				this._imageCanvas.redraw();
				this._bottomLabelCanvas.setContents("");
			}
		} else {
			this._stopAnimationStart();
		}

	},
	/**
	 * 开始动画
	 */
	_startAnimationStart: function () {
		// 定义一个变量，存储实例化对象
		var cons = this,
			myInterval;
		clearInterval(this._getInterSeqId());
		// 判断当前图片队列是否有效，不存在则不开启定时器
		if (this._isExistsImg()) {
			myInterval = setInterval(
				(function () {
					return (
						// 循环执行体getBaseValue
						function () {
							// 执行定时器事件
							if (cons._images != null && cons._images.length != 0) {
								// 加强逻辑
								if (cons._images[cons._playNO]) {
									var id = cons._images[cons._playNO].id;
									var name = cons._images[cons._playNO].name;
									var src = cons._images[cons._playNO].src;
									var desc = cons._images[cons._playNO].desc;
									cons._setValue(src, name, cons._playNO, desc);
									// 触发db选中
									cons._callEvent(cons, 'selectionChanged', id);
									// 触发图片切换事件
									cons._callEvent(cons, 'change');
									//清除临时播放序列号
									cons._playTempNO = null;
								}
							} else {
								clearInterval(myInterval);
							}
							cons._playNO++;
							if (cons._playNO == cons._images.length) {
								cons._playNO = 0;
							}
						}
					)
				})(), cons._imagePlay._swiInterval * 1000);
			// 存贮setInterval返回值，外部停止定时器用
			cons._setInterSeqId(myInterval);
		}
	},

	_getInterSeqId: function () {
		var _id = this.id;
		if (isc.JGImagePlay._rets)
			return isc.JGImagePlay._rets[_id]
		else
			return null;
	},

	_setInterSeqId: function (seqId) {
		if (!isc.JGImagePlay._rets)
			isc.JGImagePlay._rets = {};

		var _id = this.id;
		isc.JGImagePlay._rets[_id] = seqId;
	},

	/**
	 * 停止动画
	 */
	_stopAnimationStart: function () {
		// 停止
		if (isc.JGImagePlay._rets)
			clearInterval(this._getInterSeqId())
	},

	/**
	 * 加载图片数据
	 */
	loadImg: function (images) {
		this._images = images;
		this._playTempNO = 0;
		// 初始化
		if (images != null && images.length > 0) {
			var id = images[0].id;
			var name = images[0].name;
			var src = images[0].src;
			var desc = images[0].desc;
			this._setValue(src, name, 0, desc);
			this._playNO++;

			this._startAnimationStart();
		} else
			this._resetValue(); //数据不存在执行清空
	},

	/**
	 *新增图片
	 *@param  img图片对象
	 */
	insertImg: function (newImages) {
		if (newImages.length > 0) {
			if (!this._images)
				this._images = [];
			for (var i = 0; i < newImages.length; i++) {
				this._images.push(newImages[i]);
			}
			this._startAnimationStart()
		}
	},

	/**
	 *更新图片
	 *@param  img图片对象
	 */
	updateImg: function (newImages) {
		if (newImages.length > 0) {
			if (!this._images)
				this._images = [];

			for (var i = 0, len = newImages.length; i < len; i++) {
				var curNewImage = newImages[i];

				for (var j = 0, jLen = this._images.length; j < jLen; j++) {
					var curImage = this._images[j];
					var isExistsImg = false;
					if (curNewImage.id === curImage.id) {
						isExistsImg = true;

						for (var pro in curNewImage)
							curImage[pro] = curNewImage[pro]

						continue;
					}

					if (!isExistsImg && i === jLen - 1)
						this._images.push(curNewImage)
				}
			}
			this._startAnimationStart()
		}
	},

	/**
	 *选择图片
	 *@param  id
	 */
	selectImg: function (id) {
		for (var i = 0; i < this._images.length; i++) {
			var oldid = this._images[i].id;
			if (id == oldid) {
				var name = this._images[i].name;
				var src = this._images[i].src;
				var desc = this._images[i].desc;
				if (src)
					this._setValue(src, name, i, desc);
				break;
			}
		}
	},

	/**
	 *删除图片
	 *@param  id
	 */
	deleteImg: function (id) {
		for (var i = 0; i < this._images.length; i++) {
			var curLen = this._images.length;
			var oldid = this._images[i].id;

			if (id == oldid) {
				this._images.splice(i, 1)

				if (i === 0 && curLen === 1)
					this._resetValue(); //处理删除最后一张图片时清空控件值
			}
		}
	},

	/**
	 * 复写方法 
	 * @param {Object} dataSource
	 */
	bindDataSource: function (dataSource) {

	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this._imagePlay.setWidth(percentWidth);
		this._imagePlay.setWidth("100%");
		//this._imagePlay.children[0].setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this._imagePlay.setHeight(percentHeight);
		this._imagePlay.setHeight("100%");
		//this._imagePlay.children[0].setHeight("100%");
	},

	destroy: function () {
		this._stopAnimationStart();
		this._imagePlay = null;
		this._images = null;
		this.Super("destroy", arguments);
	},
	updatePropertys: function (params) {
		var propertyMap = params.propertys;
		var widget = params.widget;
		var propertys = propertyMap.Properties;
		if (propertys) {
			for (var property in propertys) {
				if (propertys.hasOwnProperty(property)) {
					var val = propertys[property];
					if ((property == "MultiWidth" || property == "MultiHeight") && typeof (val) == "number") {
						widget[key] = val + "";
					} else if (property == "RowWidthMode" && val == "PercentWidth") {
						for (var i = 0, len = widget.fields.length; i < len; i++) {
							var field = widget.fields[i];
							var width = Math.floor((parseInt(field.width) / parseInt(widget.Width) * 10000) / 100) + "%";
							field.width = width;
						}
					} else if (property == "Title" || property == "SubTitle") {
						widget.GraphSettings[property.toLowerCase()].title = val;
					} else {
						widget[property] = propertys[property];
					}
				}
			}
		}
	},

	getImages: function (resultset) {
		var images = [];
		var datasourceName = widgetDatasource.getBindDatasourceName(this);
		var refImageField =this.ImageField;
		var refImageNameField = this.ImageNameField;
		var refImageDescField = this.ImageDescField;
		for (var i = 0, l = resultset.length; i < l; i++) {
			var id = resultset[i].id;
			var imageFieldValue = "",
				imageNameFieldValue = "",
				imageDescFieldValue = "";
			if (refImageField)
				imageFieldValue = resultset[i][refImageField];
			if (refImageNameField)
				imageNameFieldValue = resultset[i][refImageNameField];
			if (refImageDescField)
				imageDescFieldValue = resultset[i][refImageDescField];
			var image = {
				"id": id,
				"name": imageNameFieldValue,
				"src": this._handleImageUrl(imageFieldValue),
				"desc": imageDescFieldValue
			};
			images.push(image);
		}
		return images;
	},

	_handleImageUrl: function (value) {
		if (value + "" === "null" || value + "" === "undefined" || value + "" === "")
			return "";

		if (value.indexOf("itop/vjs/icons") > -1)
			return value;
		else if (value.startsWith("/")) // 图片字段为文件目录
			return value;
		else if (value.indexOf("http") === 0) // 图片字段为URL
			return value;
		else
			return isc.FileUtil.getImageById(value);
	},
	
	setVisible: function (state) {
		this.setVisible(state);
	},

	getVisible: function () {
		return this.isVisible();
	}

});




isc.ClassFactory.defineClass("JGButtonFormItem", "FormItem");
isc.ClassFactory.mixInInterface("JGButtonFormItem", "IV3FormItem");

isc.JGButtonFormItem.addProperties({
	WidgetStyle: "JGButton",
	disabledStyle: "JGButtonFormItemDisabled"
	//            Placeholder : "placeholder"
});

isc.JGButtonFormItem.addMethods({
	init: function () {
		this.cellStyle = "formCell JGButtonCellFormItem";
		var _this = this;
		this.remindText = this.RemindText;
		this.title = this.genTitleContent(this.SimpleChineseTitle);
		this.tabIndex = this.TabIndex;
		this.visible = this.Visible;
		this.name = this.Code;
		this.showTitle = this.LabelVisible;
		if (!this.showTitle) {
			this.cellStyle += " formItemNoLabel";
		}
		this.startRow = false;
		//                this.endRow = this.EndRow;
		this.length = this.TextLength;
		this.icon = this.getStaticImagePath(this.ImageObject);
		this.showIconState = false; //防止图片修改状态
		this.canHover = true;
		this.wrap = true;
		this.iconWidth = this.Height / 2;
		this.iconHeight = this.Height / 2;
		this.disabled = !this.Enabled;
		this.required = this.IsMust;
		this.baseStyle = (this.Theme && this.Theme != "customType" && this.Theme != "defaultType" ? (this.Theme + " ") : "") + "JGButtonFormItem";
		this.iconStyle = "JGButtonFormItemIcon";
		this.contentStyle = "JGButtonFormItemContent";
		if (!this.ToolTip || this.ToolTip == "") {
			this.prompt = null;
		} else {
			this.prompt = this.getToolTipHandler(this.Code, this.ToolTip);
		}
		this.canEdit = !this.ReadOnly;
		this.value = this.Value;
		//使用cellClick代替click，问题场景：一个按钮、一个文本框，放在同一个表单布局内，文本框聚焦输入内容后直接点击按钮，不会触发按钮的点击事件
		//                this.click = this.getV3EventHandler(this.Code,"OnClick");
		//                this.cellClick = (function(_this,cell,target){
		//                	return function(){
		//                		if(!_this.Enabled){
		//                			return;
		//                		}
		//                		_this.getV3EventHandler(_this.Code,"OnClick")();
		//                	}
		//                })(this);
		this.cellClick = function (form, cell, target) {
			if (target.nativeTarget.getAttribute("isBtn") && cell.Enabled) {
				cell.getV3EventHandler(cell.Code, "OnClick")();
			}
		}
		this.getTitleHTML = function () {
			return _this.getModTitleHTML();
		};
		this.getElementHTML = function (_1) {
			var btnHtml = [];
			if (this.disabled || this.ReadOnly || !this.Enabled || !this.canEdit) {
				btnHtml.push('<div class = "' + this.disabledStyle + '" style = "float:left;margin-left:8px;">');
			} else {
				//btnHtml.push('<div isBtn = "true" onclick="'+this.ID + '.handleBtnClick()" class = "'+this.baseStyle+'" style = "float:left;margin-left:8px;">');
				btnHtml.push('<div isBtn = "true" onclick="' + this.ID + '.handleBtnClick()" class = "' + this.baseStyle + '" style="float:left;margin-left:8px;');
				if (!this.Theme || this.Theme == "customType" || this.Theme == "defaultType") //如果没有主题，那么就可能是自定义
					btnHtml.push('background-color:' + this.BackColor + ';border-color:' + this.BackColor) + ";";
				btnHtml.push('">');
			}

			if (this.icon && this.icon != "") {
				var iconStyle = "";
				if(this.iconWidth){
					iconStyle += "width:";
					iconStyle += this.iconWidth;
					iconStyle += "px;";
				}
				if(this.iconHeight){
					iconStyle += "height:";
					iconStyle += this.iconHeight;
					iconStyle += "px;";
				}
				btnHtml.push('<img isBtn = "true" style="'+iconStyle+'" class = "' + this.iconStyle + '" src = "' + this.icon + '"></img>')
			}
			btnHtml.push('<span isBtn = "true" class = "' + this.contentStyle + '" style="color:' + this.ForeColor + '">' + this.title + '</span>');
			btnHtml.push('</div>');
			var _3 = "";
			if (isc.Browser.isIE && isc.Browser.isTransitional) {
				_3 = "border:0px solid transparent;"
			}
			return "<div style='padding:0px;margin:0px;" + _3 + "' ID='" + this.getID() + "$18z'>" + btnHtml.join('') + "</div>"
		};
		//使用cellclick代替handleBtnClick事件后需屏蔽，问题场景：表单布局内放按钮，点击按钮会触发两次点击事件
		this.handleBtnClick = function () {
			//    				this.click()
		};
		//                this.getInnerHTML = function(_1) {
		//	                var backHtml = this.Super("getInnerHTML", arguments);
		//	                backHtml = backHtml.replace("max-width:100%", "width:100%");
		//	                //处理按钮下划线不显示
		//	                backHtml = backHtml.replace("overflow:hidden;text-overflow:ellipsis","display:inline;");
		//	                // 处理按钮居中
		//	                backHtml = backHtml.replace("display:inline-block;", "display:block;overflow:hidden;text-overflow:ellipsis;");
		//	                
		//	                return backHtml;
		//	            };
		//按钮提示数值样式
		this.Super("init", arguments);
		if (this.form && this.form._putWidgetContextProperty) {
			this.form._putWidgetContextProperty(this.Code, 'widgetObj', this);
		}
	},
	firePlatformEventBefore: function (eventName) {
		if (eventName != "OnClick") {
			return;
		}
		var className = "V3ButtonActive";
		if (this.baseStyle) {
			var styleArr = this.baseStyle.split(" ");
			if (styleArr.indexOf(className) == -1) {
				styleArr.splice(0, 0, className);
				this.baseStyle = styleArr.join(" ");
				this.redraw();
			}
		} else {
			this.baseStyle = className;
			this.redraw();
		}
	},
	firePlatformEventAfter: function (eventName) {
		if (eventName != "OnClick") {
			return;
		}
		var className = "V3ButtonActive";
		if (this.baseStyle) {
			var styleArr = this.baseStyle.split(" ");
			if (styleArr.indexOf(className) != -1) {
				styleArr.splice(styleArr.indexOf(className), 1);
				this.baseStyle = styleArr.join(" ");
				this.redraw();
			}
		}
	},
	//            getElementHTML : function(_1){
	//				var btnHtml = [];
	//				btnHtml.push('<button onclick="'+this.handleBtnClick+ 'class = "'+this.baseStyle+'" style = "margin-right:8px;">');
	//				btnHtml.push(this.buttons[i].title);
	//				btnHtml.push('</button>');
	//				 var _3 = "";
	//		        if (isc.Browser.isIE && isc.Browser.isTransitional) {
	//		            _3 = "border:0px solid transparent;"
	//		        }
	//		        return "<div style='padding:0px;margin:0px;" + _3 + "' ID='" + this.getID() + "$18z'>"+btnHtml.join('')+"</div>"
	//			},
	//			handleBtnClick : function(index){
	//				var btn = this.buttons[index];
	//				btn.click();
	//			},
	getStaticImagePath: function (path) {
		//		        return path ? (window && window._$basePath ? window._$basePath + path : path) : null; //原型工具中，静态图片路径处理
		//解决图标配置失效问题
		//return path ? "module-operation!executeOperation?operation=FileDown&token={%22data%22:{%22isMulti%22:false,%22dataId%22:%22" + path + "%22,%22isShow%22:1" + "}}" : null;
		return this.ImageValue;
	},
	genTitleContent: function (titleStr) {
		return isc.isA.nonemptyString(titleStr) ? (titleStr) : isc.nbsp;
	},
	getValueChangeFields: function () {
		return [this.name];
	},

	getBindFields: function () {
		return this.getValueChangeFields();
	},
	parentReadOnly: function (readOnly) {
		var readOnly = !this.Enabled || readOnly;
		//            	this.ReadOnly = readOnly;
		this.setCanEdit(!readOnly);
		this.setVisible(!readOnly);
	},
	canEditChanged: function (visible) {
		this.setVisible(visible);
	},
	setVisible: function (visible) {
		visible ? this.show() : this.hide()
	},
	setCanEdit: function (canEdit) {
		//            	this.Super('setCanEdit',arguments);
		//            	this.redraw();
		this.setDisabled(!canEdit);
		if (this.form.useStaticReadonly) {
			if (!this._value || this._value == "") {
				this.getReadOnlyHTML = function () {
					return "<div class = 'v3FormItemReadonly'>-</div>";
				}
				this.redraw();
			} else {
				this.getReadOnlyHTML = function (_1, _2) {
					return this.getElementHTML(_1, _2);
				}
			}
		}
	},
	setDisabled: function () {
		this.Super('setDisabled', arguments);
		this.redraw();
	},
	isReadOnly: function () {
		var _1 = this;
		while (_1.parentItem != null) {
			if (_1.canEdit != null) {
				return !_1.canEdit
			}
			_1 = _1.parentItem
		}
		return !_1.Enabled || _1._ReadOnly;
	}
});
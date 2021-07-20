/**
 * 控件渲染器
 */
define("./JGImageCutter", function(require, exports, module) {

	var sandbox;
	var scopeManager;
	var widgetAction;
	var widgetContext;

	exports.initModule = function(sb) {
		sandbox = sb;
		scopeManager = sandbox.getService("vjs.framework.extension.platform.interface.scope.ScopeManager");
		widgetAction = sandbox.getService("vjs.framework.extension.platform.services.view.widget.common.action.WidgetAction");
		widgetContext = sandbox.getService("vjs.framework.extension.platform.services.view.widget.common.context.WidgetContext");
		initUI();
	}

	var initUI = function() {
		isc.ClassFactory.defineClass("JGImageCutterBox", "JGBaseWidget");
		isc.JGImageCutterBox.addProperties({
			listener : [ 'onSelected' ],
			bgFade : true,
			bgOpacity : 0.8
		});
		var jcrop_api;

		isc.JGImageCutterBox.addMethods({
			_initWidget : function() {
				this.cutterBoxDivId = 'cutter_' + this.getId();
				var imgsrc = 'itop/common/blank.png';
				var contents = '<img id="' + this.cutterBoxDivId + '" src="' + imgsrc + '"></img>';
				if (this.IsZoom == false)
					contents = '<div style="width:' + this.Width + 'px;height:' + this.Height + 'px;overflow:auto">' + contents + '</div>';
				this._boxPanel = isc.Canvas.create({
					width : this.Width,
					height : this.Height,
					contents : contents,
					overflow : isc.Canvas.HIDDEN
				});
				this.addChild(this._boxPanel);
			},
			initCutter : function() {
				var widget = this;

				var opt = {
					bgOpacity : $.Jcrop.defaults.bgOpacity,
					bgColor : $.Jcrop.defaults.bgColor,
					allowSelect : widget.IsAllowSelect,
					allowResize : widget.IsAllowResize,
					onDblClick : function() {
						return function() {
							scopeManager.openScope(widget.preScopeId);
							var bounds = jcrop_api.tellSelect();
							var imageObjId = widget.imageObjId;
							widgetAction.executeWidgetAction(widget.widgetId, "onSelected", imageObjId, bounds);
							widget._callEvent(widget, 'onSelected');
							scopeManager.closeScope();
						}()
					}
				};
				if (widget.IsZoom == true) {
					opt.boxWidth = widget.Width
					opt.boxHeight = widget.Height
				}

				if (widget.IsAllowSelect == false && widget.IsAllowResize == true) {
					opt.aspectRatio = widget.SelectDivWidth / widget.SelectDivHeight
				}
				$('#' + this.cutterBoxDivId).Jcrop(opt, function() {
					jcrop_api = this;
				});
				this._hasInitCutter = true;
			},
			onDraw : function() {
				if (!this._hasInitCutter)
					this.initCutter();
			},
			setImageObjId : function(imageObjId) {
				if (undefined != imageObjId && null != imageObjId && "" != imageObjId) {
					var url = "module-operation!executeOperation?operation=FileDown&token=%7B%22data%22%3A%7B%22dataId%22%3A%22" + imageObjId + "%22%2C%22ImageObj%22%3A%22" + imageObjId + "%22%7D%7D";
					var bounds = jcrop_api.tellSelect();
					var widget = this;
					jcrop_api.setImage(url, function() {
						jcrop_api.animateTo([ widget.SelectDivLeft, widget.SelectDivTop, widget.SelectDivLeft + widget.SelectDivWidth, widget.SelectDivTop + widget.SelectDivHeight ]);
					});
				}
			},
			bindDataSource : function() {
			},
			getSelected : function() {
				return jcrop_api.tellScaled();
			},
			setSelected : function(bounds) {
				jcrop_api.animateTo(bounds);
			}
		});
	}

	/**
	 * 控件UI初始化，产生UI实例
	 */
	var init = function(properties) {
		var widgetId = properties.widgetId;
		var preScopeId = scopeManager.getCurrentScopeId();
		properties.preScopeId = preScopeId;
		var widget = isc.JGImageCutterBox.create(properties);
		widgetContext.put(widgetId, "widgetObj", widget);
	};

	exports.init = init;
});

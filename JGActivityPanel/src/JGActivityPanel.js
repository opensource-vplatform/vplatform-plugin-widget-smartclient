/**
 * 活动面板
 * @class JGActivityPanel
 * @extends JGBaseWidget
 * 
 */
isc.ClassFactory.defineClass("JGActivityPanel", "JGBaseWidget");
isc.JGActivityPanel.addProperties({
	// 控件
	_ActivityPanel: null,
	// 活动
	Activitys: null,
	// 背景图片
	ImageObj: null,
	listener: ['elementdrop'],
	_currentDragTile: null,//拖拽的时候使用,记录当前正在拖拽的tileID,防止不断刷新
	_lastSelectedTileRecord: null //最后选择的活动记录
});

isc.JGActivityPanel.addMethods({
	//自定义控件可覆盖父类的这个方法，扩展本控件的初始实例化逻辑，相当于控件的构造函数

	dragStart: function (event, eventInfo) {
		this._currentDragTile = null;
	},

	dragMove: function () {

		var EH = isc.EH;
		//var record = this._ActivityPanel.getSelectedRecord();
		var record = this._lastSelectedTileRecord;//获取最后一个选择的活动记录
		if (record) {
			var tId = this._ActivityPanel.getTileID(record);
			if (tId != this._currentDragTile) {
				EH.setDragTracker(isc.Canvas.imgHTML(record.picture, 32, 32), 32, 32, 0, 0);
				//EH.setDragTracker("<DIV>WIDTH:"+isc.EH.lastEvent.screenX+";HEIGHT:"+isc.EH.lastEvent.screenY+"<DIV>" , 32, 32, 100, 100);
				this._currentDragTile = tId;
			}
		}

	},

	/**
	 * 获取当前
	 */
	getDraggingTemplateID: function () {
		var record = this._lastSelectedTileRecord;//获取最后一个选择的活动记录
		if (record) return record.id;
	},

	_initWidget: function () {
		// 反转this.Activitys
		// 处理开发系统和执行系统部署后活动顺序效果不一致
		var reverseActivitys = [];
		for (var len = this.Activitys.length, i = len - 1; i >= 0; i--)
			reverseActivitys.push(this.Activitys[i])

		this._ActivityPanel = isc.TileGrid.create({
			showCustomScrollbars: false,
			width: this.Width,
			height: this.Height,
			tileWidth: 58,
			tileHeight: 58,
			layoutMargin: 0,
			backgroundColor: this.BackColor,
			backgroundImage: this.ImageValue,
			data: reverseActivitys,
			canAcceptDroppedRecords: false,
			canDrop: true,
			tileMargin: 0,
			canDragTilesOut: true,
			canReorderTiles: false,
			tileDragAppearance: "youdonotneedtoknow",//随便写一个,少执行些代码.
			fields: [
				{ name: "picture", type: "image", imageURLPrefix: "", imageWidth: 32, imageHeight: 32 },
				{ name: "commonName" }
			],
			showFocusOutline: false,
			showEdges: false,
			selectionType: isc.Selection.SINGLE,
			tileProperties: {
				mouseDown: function (_this) {
					return function () {
						var _tileGrid = _this._ActivityPanel;
						_this._lastSelectedTileRecord = _tileGrid.getTileRecord(this);
						//if (tileRecord) _tileGrid.selection.selectSingle(tileRecord);
						//if (tileRecord) _tileGrid.selection.selectOnMouseDown(_tileGrid, this.tileNum);
					}
				}(this)
			}

		});

		// 必须添加到本控件的内部SC画布中，否则无法支持SC的父子控件层次关系
		this.addChild(this._ActivityPanel);
	},

	_afterInitWidget: function(){
		this.on("elementdrop", this.elementdrop);
	},

	getV3MethodMap: function () {
		return {
			getDraggingTemplateID: "getPanelDraggingTemplateID"
		}
	},

	//放在容器中按布局排版时设置比例
	setPercentWidth: function (percentWidth) {
		this.Super("setPercentWidth", arguments);
		//this._ActivityPanel.setWidth(percentWidth);
		this._ActivityPanel.setWidth("100%");
	},
	setPercentHeight: function (percentHeight) {
		this.Super("setPercentHeight", arguments);
		//this._ActivityPanel.setHeight(percentHeight);
		this._ActivityPanel.setHeight("100%");
	},

	destroy: function () {
		//var panel = this._ActivityPanel;
		//if(panel){
		this._ActivityPanel = null;
		//panel.destroy();
		//}
		this.Super("destroy", arguments);
	},

	/**
	 * 获取控件关于环节定义信息(属性部分)
	 * templateType：活动模板类型（唯一）
	 */
	getActivityPropertyData: function(templateType) {
		var activitySettingObj = this.getWidgetContextProperty(this.code,"ActivitySetting");
		var activitySettingArray = activitySettingObj.templates;
		if (activitySettingArray && activitySettingArray.length > 0) {
			for (var i = 0, len = activitySettingArray.length; i < len; i++) {
				var activityObj = activitySettingArray[i]; // 活动属性
				var templateTypeValue = this.getTemplateTypeValue(activityObj.property); // 活动模板标识（唯一）  
				if(templateTypeValue == templateType){
					return activityObj.property; // 活动属性
				}
			}
		}
		return null;
	},

	getActivityPropertyTypeInfo: function(templateType) {
		var activityPropertyTypeData = this.getActivityPropertyTypeData(templateType);
		if (activityPropertyTypeData && activityPropertyTypeData.length > 0) {
			return activityPropertyTypeData;
		} else {
			if (window.console&&window.console.warn){
				window.console.warn("无法根据活动模板类型（" + templateType + "）获取属性编辑器信息!");
			}
			return null;
		}
	},
	/**
	 * 获取控件关于环节定义信息(分类部分)
	 * @templateType 活动模板类型 (唯一) 
	 */
	getActivityPropertyTypeData: function(templateType) {
		var activitySettingObj = this.getWidgetContextProperty(this.code,"ActivitySetting");
		var activitySettingArray = activitySettingObj.templates;
		if (activitySettingArray && activitySettingArray.length > 0) {
			for (var i = 0, len = activitySettingArray.length; i < len; i++) {
				var activityObj = activitySettingArray[i]; // 属性分类
				var templateTypeValue = this.getTemplateTypeValue(activityObj.property); // 活动模板标识（唯一）  
				if (templateTypeValue == templateType){
					return activityObj.propertyType; // 属性分类
				}
			}
		}
		return null;
	},

	/**
	 * 获取活动模板类型默认值
	 */
	getTemplateTypeValue: function(activityProperty) {
		for (var j = 0, lenj = activityProperty.length; j < lenj; j++) {
			var activityPropertyObj = activityProperty[j];
			var activityPropertyName = activityPropertyObj.PropertyName;
			// 获取活动名称的默认值
			if(activityPropertyName == 'templateType'){
				return activityPropertyObj.DefaultValue;		
			}
		}
		return null;
	},
	getActivitySetting: function(){
        return this.ActivitySetting;
    },
	/**
	 * 获取活动所有信息 
	 * templateType：活动模板类型（唯一）
	 */
	getActivityPropertyInfo: function(templateType) {
		var activityPropertyData = this.getActivityPropertyData(templateType);
		if (activityPropertyData && activityPropertyData.length > 0) {
			return activityPropertyData;
		} else {
			if (window.console&&window.console.warn){
				window.console.warn("无法根据活动模板类型（" + templateType + "）获取属性编辑器信息!");
			}
			return null;
		}
	},
	/**
	 * 获取活动Style信息 
	 * templateType：活动模板类型（唯一）
	 */
	getActivityStyleInfo: function(templateType) {
		var activitySettingObj = this.getWidgetContextProperty(this.code,"ActivitySetting");
		var activitySettingArray = activitySettingObj.templates;
		if (activitySettingArray.length > 0) {
			for (var i = 0, len = activitySettingArray.length; i < len; i++) {
				var activityObj = activitySettingArray[i];
				var templateTypeValue = this.getTemplateTypeValue(activityObj.property); // 活动模板标识（唯一）  
				if(templateTypeValue == templateType){
					return activityObj.style; // 活动样式
				}
				
			}
		}
		return null;
	},
	
	getPanelDraggingTemplateID: function(){
        return this.getDraggingTemplateID();
    }

});

/**
 * 所有V3控件的基类。
 *
 * 此类自动处理的内容包括：
 * 1、设置控件可以获取焦点，且不显示焦点边框
 * @class JGBaseWidget
 * @mixes IV3BaseWidget
 * @mixes JGEventManager
 * @mixes JGLayoutManager
 * @extends {Canvas}
 */
isc.ClassFactory.defineClass("JGBaseWidget", "Canvas");
isc.ClassFactory.mixInInterface("JGBaseWidget", "JGEventManager");
isc.ClassFactory.mixInInterface("JGBaseWidget", "JGLayoutManager");
isc.ClassFactory.mixInInterface("JGBaseWidget", "IV3BaseWidget");

isc.JGBaseWidget.addClassProperties({
    _initedHandlers: []
});
isc.JGBaseWidget.addClassMethods({
    /**
     * 添加控件初始化回调
     * @method
     * @static
     * @memberof JGBaseWidget
     * @param {Function=} fun 初始化回调
     */
    addInitedHandler: function (fun) {
        isc.JGBaseWidget._initedHandlers.push(fun);
    }
});
isc.JGBaseWidget.addProperties({

    defaultWidth: 5,

    defaultHeight: 5,

    autoDraw: false,

    //控件Id
    id: '',
    //此Id在sc控件体系中不能使用，仅供框架调用
    widgetId: '',
    //域id
    scopeId: null,
    //组件id
    componentId: null,

    name: '',
    //字段绑定事件
    _fieldEvent: null,

    contents: '',

    //绑定数据源
    TableName: null,
    //记录未处理过的数据源编码
    SourceTableName: null,
    //高度：1、固定高度2、content：内容高度3、50%：百分比高度
    MultiHeight: null,
    MultiWidth: null,
    //按布局排版时用
    Dock: null,
    LayoutType: null,
    PercentWidth: null,
    PercentHeight: null,
    StaticLayoutSize: false,
    // 浮动框大小设置。
    hoverWidth: 250,
    //设置控件可以获取焦点，且不显示焦点边框
    canFocus: true, //是否可获取焦点
    showFocusOutline: false,
    //原始宽高值
    _orginalRect: null,

    //控件默认事件列表
    _defaultListener: ['mouseOver', 'mouseLeave', 'showProtoInfo', 'moveProtoInfo'],
    //控件公布事件列表
    listener: []

});

isc.JGBaseWidget.addMethods({
    init: function () {
        this.id = isc.WidgetUtils.genWidgetRefId(this.scopeId, this.widgetId);
        var rect = [this.Width, this.Height];
        /*if(!this.isOldWindowLayoutConfig || !this.isOldWindowLayoutConfig()){//新布局
        	var mulitWidth = this.MultiWidth;
        	var multiHeight = this.MultiHeight;
        	if(null != mulitWidth && "" != mulitWidth && mulitWidth != "space"){
        		mulitWidth = Number(mulitWidth.replace("px",""));
        		if(!isNaN(mulitWidth)){
        			rect[0] = mulitWidth;
        		}
        	}
        	
        	if(null != multiHeight && "" != multiHeight && multiHeight != "space"){
        		multiHeight = Number(multiHeight.replace("px",""));
        		if(!isNaN(multiHeight)){
        			rect[1] = multiHeight;
        		}
        	}
        }*/
        this._orginalRect = rect;

        this._fieldEvent = {};

        // 初始化本控件的内置画布，如布局位置相关信息
        this._initCanvas();

        this.Super("init", arguments);

        //初始化控件
        this._initWidget(arguments);

        //初始化控件事件
        this._initListener();

        this._enhanceEvents();

        this._afterInitWidget();

        //引用包含控件的方法
        this._referPartFunc();

        //触发控件mouseOver事件（目前用在浮动提示动态提示内容）
        this.mouseOver = this._handleMouseOver; //this._referEvent(this, 'mouseOver');
        this.mouseLeave = this._referEvent(this, 'mouseLeave');
        isc.JGWidgetManager.putWidget(this.id, this);

        var handlers = isc.JGBaseWidget._initedHandlers;

        for (var i = 0, len = handlers.length; i < len; i++) {
            var handler = handlers[i];
            handler.apply(this);
        }
    },

    _enhanceEvents :function(){
        var listener = this.listener;
        if(listener){
            for(var eventName in listener){
                if(listener.hasOwnProperty(eventName)){
                    var handler = this[eventName];
                    if(typeof(handler) == "function"){
                        this.listener[eventName].push(handler);
                    }
                }
            }
        }
    },

    _handleMouseOver: function () {
        this.fireEvent('mouseOver');
        var filteriWidgetStyle = [
            "JGTreeGrid",
            "JGDataGrid",
            "JGTabControl",
            "JGQueryConditionPanel"
        ];
        if (filteriWidgetStyle.filter(function (item) {
                return item === this.WidgetStyle
            }).length) {

        } else {
            this.fireEvent('showProtoInfo', null, this.getClipHandle(), [this.Code]);
        }
    },
    resizeTo: function () {
        this.Super("resizeTo", arguments);
        this.fireEvent('moveProtoInfo');
    },
    addV3Child: function (child) {
        this.addChild(child);
    },

    getOrginalRect: function () {
        return this._orginalRect;
    },

    /**
     * 初始化本控件的内置画布的属性配置
     * @private
     */
    _initCanvas: function () {
        this.left = this.Left;
        this.top = this.Top;
        if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) {
            //窗体只有BorderLayout，控件
            if ((!this.LayoutType || this.LayoutType == "BorderLayout") && (!this.Dock || this.Dock == "Fill")) {
                this.width = "100%";
                this.height = "100%";
            } else {
                this.width = this.Width;
                this.height = this.Height;
            }
            //		        	this.width = this.LayoutType=="BorderLayout" ? "100%":this.Width;
            //		        	this.height = this.LayoutType=="BorderLayout" ? "100%":this.Height;
        } else {
            var dock = (this.Dock + "").toLowerCase();
            if (this.MultiWidth == 'space' || "top" == dock || "bottom" == dock || dock == "fill") { //按内容自适应
                this.width = '100%';
                this.Width = '100%';
            } else if (this.MultiWidth == 'content') { //按空间自适应
                //设置比较小的值，通过内容撑宽
                this.width = null;
                this.Width = null;
            } else if (typeof (this.MultiWidth) == 'string') {
                if (this.MultiHeight == "0px") {
                    this.height = this.Height;
                } else {
                    this.width = this.MultiWidth;
                    if (this.MultiWidth.endsWith('px')) { //兼容原有逻辑
                        this.Width = parseInt(this.MultiWidth);
                    } else {
                        this.Width = '100%';
                    }
                }
            } else {
                this.width = this.LayoutType == "BorderLayout" ? "100%" : this.Width;
            }
            if (this.MultiHeight == 'space' || "left" == dock || "right" == dock || dock == "fill") { //按内容自适应
                this.height = '100%';
                this.Height = '100%';
            } else if (this.MultiHeight == 'content') { //按空间自适应
                if (this.type == "JGComponentContainer") {
                    this._height = this.Height;
                }
                //设置比较小的值，通过内容撑高
                this.height = null;
                this.Height = null;

            } else if (typeof (this.MultiHeight) == 'string') {
                if (this.MultiHeight == "0px") {
                    this.height = this.Height;
                } else {
                    this.height = this.MultiHeight;
                    if (this.MultiHeight.endsWith('px')) { //兼容原有逻辑
                        this.Height = parseInt(this.MultiHeight);
                    } else {
                        this.Height = '100%';
                    }
                }
            } else {
                this.height = this.LayoutType == "BorderLayout" ? "100%" : this.Height;
            }
        }
        this.printChildrenAbsolutelyPositioned = true;
        //统一处理显示隐藏的问题
        if (isc.isA.Boolean(this.Visible)) {
            this.visibility = this.Visible ? isc.Canvas.INHERIT : isc.Canvas.HIDDEN;
        }

    },

    /**
     * 初始化事件配置
     * 此方法会做如下转换以支持多次事件绑定
     * 例：['click','blur'] -> {'click':[这里将存放事件触发的handler],'blur':[]}
     */
    _initListener: function () {
        var l = {};
        this.listener = this.listener.concat(this._defaultListener);
        for (var i = 0, len = this.listener.length; i < len; i++) {
            l[this.listener[i]] = [];
        }
        this.listener = l;
    },

    /**
     * 初始化控件
     */
    _initWidget: function () {},

    /**
     * 控件初始化后执行函数
     */
    _afterInitWidget: function () {},

    /**
     * 引用内部子控件的方法
     */
    _referPartFunc: function () {},

    /**
     * 覆盖目标类的的方法
     */
    _addMethods: function (des, source) {
        for (var func in source) {
            des[func] = source[func];
        }
    },

    /**
     * 将内部子控件funNames暴露给当前控件
     * 例：如A控件对B进行封装，现需要将B.a方法暴露给A，
     * 在A控件_referPartFunc方法中调用this._callPartFunc(B,'a');
     * 这样调用A.a()即调用B.a()
     * 注意：目前该方法不支持方法参数变化，
     * 即：B.a(arg0,arg1)暴露给A.a(arg2,arg3)
     */
    _referFuncs: function (obj, funcNames) {
        if (!isc.isAn.Array(funcNames)) funcNames = [funcNames];
        for (var i = 0, len = funcNames.length; i < len; i++) {
            var funcName = funcNames[i];
            this[funcName] = this._referFunc(obj, funcName);
        }
    },

    /**
     * 
     */
    _referFunc: function (_this, funcName) {
        var ID = _this.ID;
        return function () {
            var obj = this.getWindow()[ID];
            if (!obj) {
                throw Error('不存在[' + ID + ']对象，请检查！');
            }
            var fun = obj[funcName];
            if (typeof (fun) == 'function') {
                var param = [];
                for (var i = 0, len = arguments.length; i < len; i++) {
                    param.push(arguments[i]);
                }
                return fun.apply(obj, param);
            } else {
                throw Error(obj.getClass() + '不存在方法' + funcName);
            }
        };
    },

    /**
     * 引用控件事件，此方法应用给内部子控件
     * 内部子控件作为事件触发源，需要将事件中转到本控件
     */
    _referEvent: function (obj, eventNames) {
        if (!isc.isAn.Array(eventNames)) eventNames = [eventNames];
        var ID = obj.ID;
        return (function (_obj) {
            return function () {
                var ID = _obj.ID;
                var _this = this.getWindow()[ID];
                if (!_this) {
                    throw Error('不存在[' + ID + ']对象，请检查！');
                }
                if (eventNames && eventNames.length > 0) {
                    for (var i = 0, len = eventNames.length; i < len; i++) {
                        var eventName = eventNames[i];
                        if (typeof (eventName) == "function") {
                            eventName.apply(_this, arguments);
                        } else if (_this.listener) {
                            var eventHandler = _this.listener[eventName];
                            if (eventHandler && eventHandler.length > 0) {
                                for (var j = 0, l = eventHandler.length; j < l; j++) {
                                    var handler = eventHandler[j];
                                    handler.apply(_this, arguments);
                                }
                            }
                        }
                    }
                }
                return true;
            }
        })(obj);
    },

    /**
     * 引用控件事件，此方法应用给内部子控件
     * 内部子控件作为事件触发源，需要将事件中转到本控件
     * 延时异步触发事件
     */
    _referEventTimeout: function (obj, eventNames) {
        if (!isc.isAn.Array(eventNames)) eventNames = [eventNames];
        var ID = obj.ID;
        return function () {
            if (eventNames && eventNames.length > 0) {
                setTimeout(function () {
                    var instance = window[ID];
                    if (!instance) {
                        throw Error('不存在[' + ID + ']对象，请检查！');
                    }
                    for (var i = 0, len = eventNames.length; i < len; i++) {
                        var eventName = eventNames[i];
                        if (typeof (eventName) == "function") {
                            eventName.apply(instance, arguments);
                        } else if (instance.listener) {
                            var eventHandler = instance.listener[eventName];
                            if (eventHandler && eventHandler.length > 0) {
                                for (var j = 0, l = eventHandler.length; j < l; j++) {
                                    var handler = eventHandler[j];
                                    handler.apply(instance, arguments);
                                }
                            }
                        }
                    }
                    
                }, 10);
            }
            return true;
        };
    },

    /**
     * 引用控件事件，此方法应用给内部子控件
     * 内部子控件作为事件触发源，需要将事件中转到本控件
     * 防止事件执行过久而导致用户继续触发
     */
    _referTimerEventHandler: function (obj, eventNames) {
        if (!isc.isAn.Array(eventNames)) eventNames = [eventNames];
        var ID = obj.ID;
        return function () {
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
            return true;
        };
    },
    /**
     * 触发控件事件，此方法应用给内部子控件
     */
    _callEvent: function (_this, eventNames) {
        if (!isc.isAn.Array(eventNames)) eventNames = [eventNames];
        if (eventNames && eventNames.length > 0) {
            var param = [];
            for (var i = 2, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            for (var i = 0, len = eventNames.length; i < len; i++) {
                var eventName = eventNames[i];
                var eventHandler = _this.listener[eventName];
                if (eventHandler && eventHandler.length > 0) {
                    for (var j = 0, l = eventHandler.length; j < l; j++) {
                        var handler = eventHandler[j];
                        handler.apply(_this, param);
                    }
                }
            }
        }
        return true;
    },
    /**
     *触发控件事件 
     */
    fireEvent: function (eventName) {
        if (!this.listener) return;
        var eventHandler = this.listener[eventName];
        if (eventHandler && eventHandler.length > 0) {
            var param = [];
            for (var i = 2, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            for (var j = 0, l = eventHandler.length; j < l; j++) {
                var handler = eventHandler[j];
                handler.apply(this, param);
            }
        }
    },

    /**
     * 获取控件定义Id，提供给框架调用
     */
    getId: function () {
        return this.widgetId;
    },

    destroy: function () {
        this.mouseOver = null;
        this.mouseLeave = null;
        this.showProtoInfo = null;
        this.moveProtoInfo = null;
        this.listener = null;
        this._Layout = null;
        isc.JGWidgetManager.destroy(this.id);
        var childrenWidgets = this.childrenWidgets;
        if (childrenWidgets) {
            this.childrenWidgets = null;
            /*for(var i=0,len=childrenWidgets.length;i<len;i++){
            	var widget = childrenWidgets[i];
            	if(widget){
            		widget.parentWidget = null;
            		widget.destroy();
            	}
            }*/
        }
        this.Super("destroy", arguments);
    },

    /**
     * 获取控件属性
     * @param propertyName 属性名称
     */
    getProperty: function (propertyName) {
        var fun = this['get' + propertyName];
        if (typeof (fun) == 'function' || typeof (fun = this['is' + propertyName]) == 'function') {
            var param = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            return fun.apply(this, param);
        }
    },

    /**
     * 设置控件属性
     * @param propertyName 属性名称
     * @param propertyValue 属性值
     */
    setProperty: function (propertyName, propertyValue) {
        var fun = this['set' + propertyName];
        if (typeof (fun) == 'function') {
            var param = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                param.push(arguments[i]);
            }
            return fun.apply(this, param);
        } else {
            throw Error(this.getClassName() + "不存在[" + propertyName + "]属性!");
        }
    },

    /**
     * 设置浮动提示
     * @param tips 提示内容
     */
    setTips: function (tips) {
        // 表单类
        if (this._form) {
            if (this._form.getItems().length > 0) {
                this._form.getItems()[0].setPrompt(tips);
                if (this._form.getItems()[0].isA('MultiFieldFormItem')) {
                    var items = this._form.children[0].getItem();
                    items.setPrompt(tips);
                    if (items.hasOwnProperty("getItems")) {
                        for (var i = 0; i < items.length; i++) {
                            items[i].setPrompt(tips);
                        }
                    }
                }
            } else {
                this._form.setPrompt(tips);
            }
        } else { //非表单类
            this.setPrompt(tips);
            if (this.children && this.children.length > 0) {
                this.children[0].setPrompt(tips);
            }
        }
    },

    /**
     * 设置显示状态
     * @param visible 显示状态
     */
    setVisible: function (visible) {
        this.Visible = visible;
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    },

    /**
     * 获取显示状态
     * @return 显示状态
     */
    getVisible: function () {
        return this.Visible;
    },

    /**
     * 设置绑定数据源名称
     */
    setTableName: function (tableName) {
        this.TableName = tableName;
    },

    /**
     * 获取绑定数据源名称
     */
    getTableName: function () {
        return this.TableName
    },

    getSourceTableName: function () {
        return this.SourceTableName;
    },

    //布局属性get/set
    getDock: function () {
        return this.Dock;
    },
    setDock: function (dock) {
        this.Dock = dock;
    },
    getLayoutType: function () {
        return this.LayoutType;
    },
    setLayoutType: function (layoutType) {
        this.LayoutType = layoutType;
    },
    getPercentWidth: function () {
        return this.PercentWidth;
    },
    setPercentWidth: function (percentWidth) {
        this.setWidth(percentWidth);
    },
    getPercentHeight: function () {
        return this.PercentHeight;
    },
    setPercentHeight: function (percentHeight) {
        this.setHeight(percentHeight);
    },
    getStaticLayoutSize: function () {
        return this.StaticLayoutSize;
    },
    setStaticLayoutSize: function (staticLayoutSize) {
        this.StaticLayoutSize = staticLayoutSize;
    },

    addWidgets: function (parent, children) {
        if (!parent.childrenWidgets)
            parent.childrenWidgets = [];
        parent.childrenWidgets.add(children);

        children.parentWidget = parent;
    },

    //当父亲设置为只读时,儿子也设置为只读
    parentReadOnly: function (newState, canEditReadOnly) {
        //		        if (this.ReadOnly == newState)
        //		            return;
        if (!canEditReadOnly) {
            this._ReadOnly = newState;
            //		        	this.ReadOnly = newState;
            this.canEditReadOnly = false;
        }
        if (this.setHandleReadOnly) {
            if (canEditReadOnly) {
                this._ReadOnly = newState;
                //			        	this.ReadOnly = newState;
            }
            this.setHandleReadOnly(newState, canEditReadOnly);
        }
        if (this.childrenWidgets) {
            //                    this.childrenWidgets.map("parentReadOnly", newState, canEditReadOnly);
            this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
        }
    },
    //返回控件真实状态
    isReadOnly: function () {
        return this._ReadOnly || this.ReadOnly;
    },
    /**
     * 处理旧的只读动作：子构件如果有只读动作，则执行只读动作，否则禁用
     */
    _performOldReadonlyAction: function (newState, canEditReadOnly) {
        if (newState == true) { //如果参数为true时，即设置该控件为只读
            if (this.isReadOnly()) { //如果控件现在为只读时
                this.ReadOnly = newState; //设置ReadOnly属性并直接返回
                return;
            } else {
                if (this.setHandleReadOnly) { //设置该控件为只读状态
                    this.setHandleReadOnly(newState);
                }
                this._ReadOnly = newState; //设置该控件的真实状态

                if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                    this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
                    //                            this.childrenWidgets.map("parentReadOnly", newState);
                }
                this.ReadOnly = newState; //设置该控件的状态
            }
        } else {
            if (this.isReadOnly()) { //如果控件现在为只读时
                if (this.parentWidget && this.parentWidget.isReadOnly()) { //如果父亲状态为只读时
                    this.ReadOnly = newState; //设置该控件ReadOnly属性并直接返回
                    return;
                } else {
                    if (this.setHandleReadOnly) { //设置该控件为只读状态
                        this.setHandleReadOnly(newState);
                    }
                    this._ReadOnly = newState; //设置该控件的真实状态

                    if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                        this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
                        //                                this.childrenWidgets.map("parentReadOnly", newState);
                    }
                    this.ReadOnly = newState; //设置该控件的状态
                }
            } else {
                return;
            }
        }
    },
    /**
     * 处理新的只读动作：子构件如果有只读动作，则执行只读动作，否则隐藏
     */
    _performNewReadonlyAction: function (newState, canEditReadOnly) {
        //下面是修改状态，不存在真实状态与设置状态是相同
        if (canEditReadOnly) {
            if (this.setHandleReadOnly) { //设置该控件为只读状态
                this.setHandleReadOnly(newState, canEditReadOnly);
            } else {
                if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                    //                            this.childrenWidgets.map("parentReadOnly", newState, canEditReadOnly);
                    this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
                }
            }
            return;
        } else {
            this.canEditReadOnly = false;
        }
        if (newState == true) { //如果参数为true时，即设置该控件为只读
            if (this.isReadOnly() && !canEditReadOnly) { //如果控件现在为只读时
                this.ReadOnly = newState; //设置ReadOnly属性并直接返回
                return;
            } else {
                if (this.setHandleReadOnly && this.canEditReadOnly !== false) { //设置该控件为只读状态
                    this.setHandleReadOnly(newState);
                }
                this._ReadOnly = newState; //设置该控件的真实状态

                if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                    //                            this.childrenWidgets.map("parentReadOnly", newState, canEditReadOnly);
                    this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
                }
                this.ReadOnly = newState; //设置该控件的状态
            }
        } else {
            if (this.isReadOnly()) { //如果控件现在为只读时
                if (this.parentWidget && this.parentWidget.isReadOnly() && !canEditReadOnly) { //如果父亲状态为只读时
                    this.ReadOnly = newState; //设置该控件ReadOnly属性并直接返回
                    return;
                } else {
                    if (this.setHandleReadOnly && this.canEditReadOnly !== false) { //设置该控件为只读状态
                        this.setHandleReadOnly(newState);
                    }
                    this._ReadOnly = newState; //设置该控件的真实状态

                    if (this.childrenWidgets) { //设置该控件的孩子为只读状态
                        //                                this.childrenWidgets.map("parentReadOnly", newState, canEditReadOnly);
                        this.mapping(this.childrenWidgets, "parentReadOnly", newState, canEditReadOnly);
                    }
                    this.ReadOnly = newState; //设置该控件的状态
                }
            } else {
                return;
            }
        }
    },

    //通用的处理方法,真正的实现放在setHandleReadOnly
    //canEditReadOnly：整体控制后，内部是否可以通过规则重新编辑只读状态
    setReadOnly: function (newState, canEditReadOnly) {
        //验证参数是否为布尔类型，
        if (!isc.isA.Boolean(newState)) {
            return; //如果不是布尔类型的话
        }
        //如果当前状态与需要设置的状态一样，直接返回	
        if (this.ReadOnly == newState) {
            return;
        }
        if (this.isOldWindowLayoutConfig()) {
            this._performOldReadonlyAction(newState, canEditReadOnly);
        } else {
            this._performNewReadonlyAction(newState, canEditReadOnly);
        }
    },

    parentDisabled: function (newState) {
        if (this.disabled)
            return;
        this._disabled = newState;
        if (this.setHandleDisabled)
            this.setHandleDisabled(newState);
        if (this.childrenWidgets)
            //                    this.childrenWidgets.map("parentDisabled", newState)
            this.mapping(this.childrenWidgets, "parentDisabled", newState);
    },
    isDisabled: function () {
        var target = this;
        while (target) {
            if (target._disabled || target.disabled) {
                return true;
            };
            target = target.parentElement;
            if (target && target.eventProxy) {
                target = target.eventProxy;
            }
        }
        return false;
    },
    setDisabled: function (newState) {
        if (!isc.isA.Boolean(newState))
            return;
        if (this.disabled == newState)
            return;
        if (newState == true)
            if (this.isDisabled()) {
                this.disabled = newState;
                return
            } else {
                if (this.setHandleDisabled)
                    this.setHandleDisabled(newState);
                this._disabled = newState;
                this.disabled = newState
                if (this.childrenWidgets)
                    //                            this.childrenWidgets.map("parentDisabled", newState);
                    this.mapping(this.childrenWidgets, "parentDisabled", newState);
            }
        else if (this.isDisabled())
            if (this.parentWidget && this.parentWidget.isDisabled()) {
                this.disabled = newState;
                return
            } else {
                if (this.setHandleDisabled)
                    this.setHandleDisabled(newState);
                this._disabled = newState;
                this.disabled = newState
                if (this.childrenWidgets)
                    //                            this.childrenWidgets.map("parentDisabled", newState);
                    this.mapping(this.childrenWidgets, "parentDisabled", newState);
            }
        else
            return
    },
    //重写方法，打印预览时不要蓝色的背景色，（sc中不是绝对定位时，是默认有背景色的）
    getPrintTagStartAttributes: function (absPos) {
        if (absPos) {
            return " style='position:absolute;left:" + this.getLeft() + "px;top:" +
                this.getTop() + "px;width:" + this.getWidth() + "px;height:" +
                this.getHeight() + "px;' ";
            // If we have absolutely positioned children:
            // - we're going to have to be relatively positioned so the abs-pos children are
            //   rendered within us
            // - we're going to have to have explicit sizing so we take up the right amount of space
            //   in document flow.
            // Handle this by writing out width/height set as calculated scrollWidth/height.

        } else if (this.printChildrenAbsolutelyPositioned) {
            return " style='position:relative;width:" + this.getScrollWidth() +
                "px;height:" + this.getScrollHeight() + "px;' ";
        }

        return null;
    },

    /**
     * 控件打印预览
     */
    controlPrintPreview: function (controls) {
        //当页面有滚动条时，把它滚到0,0，因为弹出的打印窗体默认是在0,0上的
        if (isc.Page && (isc.Page.getScrollTop() > 0 || isc.Page.getScrollLeft() > 0)) {
            isc.Page.scrollTo(0, 0);
        }
        //isc.Canvas.showPrintPreview(controls,{"absPos":true});
        isc.Canvas.showPrintPreview(controls);
    },

    /**
     * 控件打印
     */
    controlPrint: function (controls) {
        //isc.Canvas.printComponents(controls,{"absPos":true});
        isc.Canvas.printComponents(controls);
    },

    /**
     * 获取焦点(支持光标跳转控制规则)
     */
    setControlFocus: function () {
        this.focus();
    },


    getFieldEvent: function () {
        return this._fieldEvent;
    },

    setScopeId: function (scopeId) {
        this.scopeId = scopeId
    },

    getScopeId: function () {
        return this.scopeId;
    },

    setComponentId: function (componentId) {
        this.componentId = componentId;
    },

    getComponentId: function () {
        if (this.componentId) {
            return this.componentId;
        } else if (this.scopeId) {
            var lastIndex = this.scopeId.lastIndexOf("_");
            var compId = this.scopeId.substring(lastIndex + 1, this.scopeId.length);
            this.componentId = compId;
            return compId;
        } else {
            return null;
        }
    },

    show: function () {
        if (this._needToBuildRelation === true) {
            this.buildRelation();
        }
        this.Super("show", arguments);
    },
    /**
     *构建父子关系 
     */
    buildRelation: function () {
        if (!this.getVisible()) { //如果面板为隐藏，则其子控件暂不构建父子关系
            this._needToBuildRelation = true;
            return;
        }
        var children = this.layoutChildWidgets();
        if (children && children.length > 0) {
            for (var i = 0, child; child = children[i]; i++) {
                this.addV3Child(child);
            }
        }
        var componentId = this.getComponentId();
        var componentIndex = isc.JGComponent.getComponentIndex(componentId);
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
        if (childrenIds && childrenIds.length > 0) {
            for (var i = 0, childId; childId = childrenIds[i]; i++) {
                var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                var child = isc.JGWidgetManager.getWidget(childRefId);
                if (!child) continue;
                //添加关系（只读使能）
                if (this.ReadOnly || this.isReadOnly()) {
                    child.parentReadOnly(true);
                }
                if (this.Enabled == false || this.isDisabled()) {
                    child.parentDisabled(true);
                }
                //子控件的index要以组件的index为前缀
                if (child.setIndexPreJoinComponentIndex) {
                    child.setIndexPreJoinComponentIndex(componentIndex);
                }
                this.addWidgets(this, child);
                child.buildRelation();
            }
        }
    },

    /**
     * 获取内容排列
     */
    getContentAlignment: function () {
        return this.ContentAlignment;
    },

    /**
     * 获取水平位置
     */
    getHorizontalAlign: function () {
        return this.HorizontalAlign;
    },

    /**
     * 获取垂直位置
     */
    getVerticalAlign: function () {
        return this.VerticalAlign;
    },

    revert: function (isRe) {
        if (this.listener) {
            for (var eventName in this.listener) {
                this.listener[eventName] = [];
            }
        }
        if (isRe !== false) {
            var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
            if (childrenIds && childrenIds.length > 0) {
                for (var i = 0, childId; childId = childrenIds[i]; i++) {
                    var childRefId = isc.WidgetUtils.genWidgetRefId(this.scopeId, childId);
                    var child = isc.JGWidgetManager.getWidget(childRefId);
                    if (!child) continue;
                    if (child.revert) {
                        child.revert();
                    }
                }
            }
        }
    },

    un: function (target, eventNames) {
        if (target && eventNames && eventNames.length > 0) {
            for (var i = 0, len = eventNames.length; i < len; i++) {
                var eventName = eventNames[i];
                target[eventName] = null;
            }
        }
    },
    /*getHandle : function () {
    	var returnVal = this.Super("getHandle",arguments);
    	var index = 0;
    	var me = this;
    	if(this.AutoTest && this.type != "JGComponent"){ //排除JGComponent
    		if(returnVal){
    			setDOMProperty(returnVal.parentNode,me);
    		}
    		function setDOMProperty(handle,me){
    			if(handle.setAttribute){
    				handle.setAttribute("autoTest",me.Code+"_"+index);
    				index++;
    			}
    			var childNodes = handle.childNodes;
    			if(childNodes && childNodes.length > 0){
    				for ( var i = 0; i < childNodes.length; i++) {
    					setDOMProperty(childNodes[i],me);
    				}
    			}
    		}
    	}
    	return returnVal;
    },*/

    getStaticImagePath: function (path) {
        return path ? (window && window._$basePath ? window._$basePath + path : path) : null; //原型工具中，静态图片路径处理
    },
    /**
     * 获取激活控件列表,默认实现不用查子控件
     * @return {Array} 返回激活控件编码列表
     * */
    getActiveChildWidgets: function () {
        if (this.getVisible && this.getVisible() && this.code) {
            return [this.code];
        }
        return null;
    },
    /**
     * 获取激活窗体列表，默认实现无返回
     * */
    getActiveChildWindows: function () {
        return null;
    },
    /**
     * 判断是否在布局内
     * */
    isInLayoutWidget: function () {
        var parentType = this.getParentType(this);
        if (parentType == "JGGroupPanel") {
            return true;
        }
        return false;
    },
    /**
     * 获取开发系统父级控件类型
     * */
    getParentType: function (widget) {
        var parentElement = widget.parentElement;
        if (parentElement) {
            var type = parentElement.type;
            if (!type) {
                type = widget.getParentType(widget.parentElement);
            }
        }
        return type;
    },
    //控件高亮显示
    showHighlight: function () {
        var styleName = this.styleName;
        if (styleName || styleName.indexOf(' v3ComponentHighlight') == -1) {
            styleName = styleName ? styleName + ' v3ComponentHighlight' : 'v3ComponentHighlight';
            this.setStyleName(styleName);
        }
    },
    //隐藏控件高亮
    hideHighlight: function () {
        var styleName = this.styleName;
        if (styleName && styleName.indexOf(' v3ComponentHighlight') != -1) {
            styleName = styleName.replace(' v3ComponentHighlight', '');
            this.setStyleName(styleName);
        }
    },
    mapping: function (_array, funcName, arg1, arg2) {
        if (_array.length == 0) {
            return;
        }
        _array.forEach(function (item) {
            if (item[funcName]) {
                item[funcName](arg1, arg2);
            }
        })
    },
    validateWidget: function () {
        if (this.Visible === false) {
            return true;
        }
        var valid = true;
        var scopeId = this.scopeId;
        var childrenIds = isc.WidgetContext.getChildrenIds(this.scopeId, this.widgetId);
        var catalog = {};
        if (this.validate && typeof this.validate == "function") {
            valid = this.validate();
        } else if (childrenIds) {
            $.each(childrenIds, function (index, childId) {
                var childRefId = isc.WidgetUtils.genWidgetRefId(scopeId, childId);
                var child = isc.JGWidgetManager.getWidget(childRefId);
                if (child.validateWidget && !child.validateWidget())
                    valid = false;
            });
        }

        return valid;
    }
});
vds.import("vds.expression.*", "vds.string.*");
var scopeManager, datasourceUtil, widgetContext;
var dataValidateUtil;
scopeManager = sBox.getService("vjs.framework.extension.platform.interface.scope.ScopeManager");
datasourceUtil = sBox.getService("vjs.framework.extension.platform.services.view.logic.datasource.DatasourceUtil");
widgetContext = sBox.getService("vjs.framework.extension.platform.services.view.widget.common.context.WidgetContext");
dataValidateUtil = sBox.getService("vjs.framework.extension.util.DataValidateUtil");

//锚定布局控件

isc.ClassFactory.defineClass("JGFormWidget", "DynamicForm");
isc.ClassFactory.mixInInterface("JGFormWidget", "IV3BaseWidget");
isc.JGFormWidget.addClassProperties({
    _initedHandlers: []
});
isc.JGFormWidget.addClassMethods({
    addInitedHandler: function (fun) {
        isc.JGFormWidget._initedHandlers.push(fun);
    }
});
isc.JGFormWidget.addClassProperties({
    _attrMap: {
        left: 'Left',
        top: 'Top',
        numCols: 'NumCols',
        titleWidth: 'TitleWidth'
    }
});
isc.JGFormWidget.addProperties({
    //宽度
    //			Width: 0,
    //高度
    //			Height: 0,
    //左边距
    //			Left: 0,
    //上边距
    //			Top: 0,
    //泊靠
    //			Dock: '',
    //锚定
    //			Anchor: '',
    //列数
    NumCols: 1,
    //编号
    Code: '',
    //标题对齐方式
    TitleAlign: '',
    //标题宽度
    //			TitleWidth: 76,
    //是否显示分组
    IsGroup: false,
    //分组标题
    GroupTitle: '',
    //列宽设置
    ColWidths: null,
    //表单项布局设置
    RowCols: '',
    //表单项
    fields: [],
    //是否可以编辑
    canEdit: true,
    //是否可以聚焦
    canFocus: true,

    //clipItemTitles: true,此属性导致标题右对齐失效
    //表单项事件监听回调
    _itemEventHandler: null,
    //v3平台表达式处理器
    _v3ExpHandler: null,
    //处理必填样式
    titlePrefix: '<div class="formLabel">',
    titleLinkPrefix: '<div class = "formLabel s-linked">',
    //处理必填样式
    titleSuffix: '</div>',
    //处理必填样式
    requiredTitlePrefix: '<div class="formLabel labelRequired">',
    requiredTitleLinkPrefix: '<div class="formLabel s-linked labelRequired">',
    //处理必填样式
    requiredTitleSuffix: '</div>',
    //多数据源的分隔符
    multiDsSpecialChar: "_$_",
    //多数据源信息
    multiDataSourceInfo: null,
    //平台样式封装，解决在首页下表单布局cellpadding失效问题：iview对td的padding设置了0
    styleName: 'v3FormItemComponent',
    fixedColWidths: false, //固定列宽
    canFocus: true,
    //			useStaticReadonly:true
    useStaticReadonly: v3PlatformSCSkin ? (v3PlatformSCSkin.formReadonlyDisplay == "static" ? true : false) : false,
    //可以选择文本		
    canSelectText: true,
    //鼠标形状为自动
    cursor: 'auto',
    //控件默认事件列表
    _defaultListener: ['mouseLeave', 'showProtoInfo', 'moveProtoInfo'],
    listener: []
});

isc.JGFormWidget.addMethods({
    init: function (properties) {
        //值改变时触发校验，导致Task20200707053的问题，先去掉，暂时为失焦时触发控件校验
        //this.validateOnChange = true;
        //				this.overflow="clip-h"
        if (this.TitleWidth === 0) {
            this.hideItemTitle();
            this.TitleWidth = 1; //如果是0，还是撑出
        }
        this.initV3Widget();

        this.initCriteriaActions();
        //初始化多数据源信息
        if (!this.isQueryConditionPanel) {
            this.initMultiDataSourceInfo();
        }
        for (var attr in isc.JGFormWidget._attrMap) {
            if (isc.JGFormWidget._attrMap.hasOwnProperty(attr)) {
                this[attr] = this[isc.JGFormWidget._attrMap[attr]];
            }
        }
        var dock = (this.Dock + "").toLowerCase();
        if (this.isOldWindowLayoutConfig && this.isOldWindowLayoutConfig()) {
            if (dock == "left" || dock == "right" || dock == "fill") {
                this.Height = "100%";
            }
            if (dock == "top" || dock == "bottom" || dock == "fill") {
                this.Width = "100%";
            }
            this.width = this.Width;
            this.height = this.Height;
        } else {
            if (this.MultiWidth == 'space' || "top" == dock || "bottom" == dock || dock == "fill") { //按空间自适应
                this.width = '100%';
                this.Width = '100%';
            } else if (this.MultiWidth == 'content') { //按内容自适应
                //设置比较小的值，通过内容撑宽
                this.width = 20;
                this.Width = 20;
            } else if (typeof (this.MultiWidth) == 'string') {
                this.width = this.MultiWidth;
                if (this.MultiWidth.endsWith('px')) { //兼容原有逻辑
                    this.Width = parseInt(this.MultiWidth);
                } else {
                    this.Width = '100%';
                }
            } else {
                this.width = this.Width;
            }
            if (this.MultiHeight == 'space' || "left" == dock || "right" == dock || dock == "fill") { //按空间自适应
                this.height = '100%';
                this.Height = '100%';
            } else if (this.MultiHeight == 'content') { //按内容自适应
                //设置比较小的值，通过内容撑高
                this.height = 20;
                this.Height = 20;
            } else if (typeof (this.MultiHeight) == 'string') {
                this.height = this.MultiHeight;
                if (this.MultiHeight.endsWith('px')) { //兼容原有逻辑
                    this.Height = parseInt(this.MultiHeight);
                } else {
                    this.Height = '100%';
                }
            } else {
                this.height = this.Height;
            }
            if (this.Dock != "None" && !this.isPositionForm) { //非锚定时，高度自适应
                //设置比较小的值，通过内容撑开
                this.height = 20;
            }
        }

        //表单项只读状态，使用static标签，超出截断
        if (this.useStaticReadonly) {
            this.readOnlyDisplay = 'static';
            this.clipStaticValue = true;
            this.readOnlyTextBoxStyle = "v3FormItemReadonly";
        }
        this.numCols = this.NumCols * 2;
        this._hasRightPlaceholder = this.hasRightPlaceholder();
        //表单布局里只有一个控件，并且控件是合并全部列，就当成一个列处理，若划分多个列，则会出现标题显示不了以及控件宽度不正确的问题
        if (this.isSingleColumn()) {
            this.numCols = 2;
        }

        if (this._hasRightPlaceholder && !this.onlyBoolHasRightPlaceholder()) {
            this.numCols = 4;
        }
        this.colWidths = this.ColWidths && this.ColWidths.length == 0 ? null : this.ColWidths;
        this.titleAlign = this.TitleAlign == '' ? 'right' : this.TitleAlign;
        //标题默认不带：
        this.titleSuffix = '&nbsp;:';
        //必填表单项添加红星结尾
        this.requiredTitleSuffix = '&nbsp;:<span class="required">*</span>';
        this._initGroupCfg();
        this._initFieldLayout && this._initFieldLayout();
        if (isc.isA.Boolean(this.Visible)) {
            this.visibility = this.Visible ? isc.Canvas.INHERIT : isc.Canvas.HIDDEN;
        }

        if (this.hasGroupTitle() && !this.groupSelection) {
            var _padding = 8;
            if (window.v3PlatformSCSkin && window.v3PlatformSCSkin.layoutPadding) {
                _padding = window.v3PlatformSCSkin.layoutPadding;
            }
            this.padding = _padding + "px";
        }
        //锚定控件属性初始化后修改自己特殊的属性值
        if (this.afterInitProperties) {
            this.afterInitProperties();
        }
        this.Super("init", arguments);
        this.addHiddenItem();
        this.fieldEvent = {};
        this.titleWidth = this.TitleWidth;
        //富文本浏览
        this.AutoHeight = "false";
        this.getTitleHTML = function (_1, _2, _3) {
            _1.titleHasLink = _1.OnLabelClick && _1.OnLabelClick != "" ? true : false;

            this.titleSuffix = '&nbsp;:';
            this.requiredTitleSuffix = '&nbsp;:<span class="required">*</span>';
            var _4 = isc.StringBuffer.create();
            var _5 = _1.visible ? _1.getTitleHTML() : null;
            if (_5) {
                var _6 = this.isRequired(_1, true),
                    _7 = this.getTitleOrientation(_1),
                    _8 = (_7 == isc.Canvas.LEFT || _7 == isc.Canvas.TOP);
                if (_3) {
                    var _9 = this.$114z;
                    var _10, _11;
                    if (_6 && this.hiliteRequiredFields) {
                        if (_1.title == "") {
                            this.requiredTitleSuffix = '<span class="required">*</span>';
                        }
                        _10 = _8 ? _1.titleHasLink ? this.requiredTitleLinkPrefix : this.requiredTitlePrefix : this.requiredRightTitlePrefix;
                        _11 = _8 ? this.requiredTitleSuffix : this.requiredRightTitleSuffix;

                    } else {
                        if (_1.title == "") {
                            this.titlePrefix = "";
                            this.rightTitlePrefix = "";
                            this.titleSuffix = "";
                            this.rightTitleSuffix = "";
                            this.titleLinkPrefix = "";
                        }
                        _10 = _8 ? _1.titleHasLink ? this.titleLinkPrefix : this.titlePrefix : this.rightTitlePrefix;
                        _11 = _8 ? this.titleSuffix : this.rightTitleSuffix;

                    }

                    var _12 = this.$207z(_10, _11);
                    _9[1] = _12[0];
                    _9[2] = _11;
                    _9[4] = this.$1140(_1);
                    _9[10] = _10;
                    _9[11] = _5;
                    _9[12] = _12[1];
                    _4.append.apply(_4, _9)
                } else {
                    if (_1.title == "") {
                        this.titlePrefix = "";
                        this.rightTitlePrefix = "";
                        this.titleSuffix = "";
                        this.rightTitleSuffix = "";
                        this.titleLinkPrefix = "";
                        this.requiredTitleSuffix = '<span class="required">*</span>';
                    }
                    _4.append((_6 && this.hiliteRequiredFields ? (_8 ? _1.titleHasLink ? this.requiredTitleLinkPrefix : this.requiredTitlePrefix : this.requiredRightTitlePrefix) : (_8 ? _1.titleHasLink ? this.titleLinkPrefix : this.titlePrefix : this.rightTitlePrefix)), _5, (_6 && this.hiliteRequiredFields ? (_8 ? this.requiredTitleSuffix : this.requiredRightTitleSuffix) : (_8 ? this.titleSuffix : this.rightTitleSuffix)))
                }
            } else {
                _4.append("&nbsp;")
            }
            return _4.release(false)
        };
        this._initListener();
        if (this.items) {
            var showProtoInfo = this._referEvent(this, "showProtoInfo");
            var moveProtoInfo = this._referEvent(this, "moveProtoInfo");
            var _this = this;
            //                    this.mouseLeave = this._referEvent(this, 'mouseLeave');
            //                    this.mouseOut = this._referEvent(this, 'mouseOut');
            for (var i = 0, l = this.items.length; i < l; i++) {
                var item = this.items[i];
                item.widgetPrototypeInfo = null;
                item.redrawn = function () {
                    this.Super("redrawn", arguments);
                    var className = this.form.getClassName();
                    var dom = this.getHandle && this.getHandle() ||
                        this.getClipHandle && $(this.getClipHandle()).parent()[0] ||
                        this.getElement && $(this.getElement()).parent()[0] ||
                        null;
                    moveProtoInfo.apply(_this, [dom, [this.Code], this.form.scopeId]);
                }
                item.itemHover = function (event) {
                    var className = this.form.getClassName();
                    var dom = this.getHandle && this.getHandle() ||
                        this.getClipHandle && $(this.getClipHandle()).parent()[0] ||
                        this.getElement && $(this.getElement()).parent()[0] ||
                        null;
                    if (dom) {
                        $(dom).addClass('formCell');
                        var JGQueryConditionPanel = this.form.getParentElements().filter(function (p) {
                            return p.getClassName() === 'JGQueryConditionPanel'
                        });
                        if (JGQueryConditionPanel.length) {
                            showProtoInfo.apply(_this, [dom, [this.Code, JGQueryConditionPanel[0].widgetId], this.form.scopeId]);
                        } else if (className == "JGFormLayout") {
                            showProtoInfo.apply(_this, [dom, [this.Code, this.form.Code], this.form.scopeId]);
                        } else {
                            showProtoInfo.apply(_this, [dom, [this.form.Code], this.form.scopeId]);
                        }
                    }
                    //此处不能返回false，因为false会导致浮动提示不生效的问题。Task20210209009
                    return true;
                }
            }
        }
        var handlers = isc.JGFormWidget._initedHandlers;
        for (var i = 0, len = handlers.length; i < len; i++) {
            var handler = handlers[i];
            handler.apply(this);
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
    hideItemTitle: function () { //如果配置子控件标题宽度为0，则需要隐藏子标题
        var fields = this.fields;
        if (fields && fields.length > 0) {
            for (var i = 0, len = fields.length; i < len; i++) {
                fields[i].LabelVisible = false;
            }
        }
    },
    isSingleColumn: function () {
        var numCols = this.NumCols;
        if (this.fields.length == 1 && this.fields[0].ColSpan == numCols + "") {
            return true;
        }
        return false;
    },
    setValues: function (value) {
        this.Super('setValues', arguments);
        var _this = this;
        this._iterateItems(function (item) {
            if ((item.type == 'JGImage' || item.type == "JGRichTextViewer") && value && Object.keys(value).contains(item.ColumnName) && value[item.ColumnName]) {
                item.setValues(value[item.ColumnName]);
            }
            if ((item.type == 'JGRichTextEditor' || item.type == 'V3RichTextEditorItem') && value && Object.keys(value).contains(item.ColumnName) && value[item.ColumnName]) {
                item.setValue(value[item.ColumnName]);
            }
            if ((item.type == "JGDateRangePicker" || item.type == "JGPeriodRange" || item.type == "JGFloatRangeBox") && value && (Object.keys(value).contains(item.StartColumnName) || Object.keys(value).contains(item.EndColumnName))) {
                item.setValues(value[item.StartColumnName], value[item.EndColumnName]);
            }
            if (_this.useStaticReadonly) {
                if (item.isReadOnly() && (!value[item.ColumnName] || value[item.ColumnName] == "") && (!item.IDColumnName || (item.IDColumnName && !value[item.IDColumnName] || value[item.IDColumnName == ""])) && !item.defaultValue && !item.DefaultValue) {
                    if (item.type != "JGBaseDictBox" || (item.type == "JGBaseDictBox" && item.ReadOnly == true)) {
                        item.getReadOnlyHTML = function () {
                            return "<div class = 'v3FormItemReadonly'>-</div>";
                        }
                        item.redraw();
                    }
                } else {
                    item.getReadOnlyHTML = function (_1, _2) {
                        return item.getElementHTML(_1, _2);
                    }
                }
            }
        });
        this.notifyParentValidateChanged && this.notifyParentValidateChanged();
    },
    titleHoverHTML: function (item, form) {
        return item.title;
    },
    clearValues: function () {
        this.Super('clearValues', arguments);
        var _this = this;
        this._iterateItems(function (item) {
            if (item.type == 'JGImage' || item.type == "JGRichTextEditor" || item.type == "JGFloatRangeBox" || item.type == "JGDateRangePicker" || item.type == "JGPeriodRange") {
                item.clearValues();
            }
            if (item.ReadOnly || !item.Enabled || item.disabled) {
                item.getReadOnlyHTML = function () {
                    return '-';
                }
                item.redraw();
            } else {
                item.getReadOnlyHTML = function (_1, _2) {
                    return item.getElementHTML(_1, _2);
                }
            }
        });
        this.notifyParentValidateChanged && this.notifyParentValidateChanged();
    },
    //有显示字段和标识字段的控件，添加显示字段到form中
    addHiddenItem: function () {
        var _this = this;
        this._iterateItems(function (item) {
            if (item.getTextField) {
                var textField = item.getTextField();
                var hasHiddenItem = false;
                for (var i = 0; i < _this.items.length; i++) {
                    if (_this.items[i].name == textField) {
                        hasHiddenItem = true;
                        break;
                    }
                }
                if (!hasHiddenItem) {
                    var hiddenItem = _this.createItem({
                        name: textField,
                        type: 'hidden',
                        visible: false //解决某些场景下死循环引发页面卡死
                    });
                    _this.items.push(hiddenItem);
                }
            }
        });
    },
    setTableName: function (dsId) {
        this.tableName = dsId;
    },
    getTableName: function () {
        return this.tableName;
    },

    bindDataSource: function (ds) {
        this.dataSource = ds;
        var id = isc.JGV3ValuesManager.genId(ds.ID, this.scopeId, this.code);
        var vm = isc.JGV3ValuesManager.getById(id, ds); // isc.JGV3ValuesManager.getByDataSource(ds);
        var dy = vm.getMember(this.ID);
        if (!dy) {
            vm.addMember(this);
        }
    },
    getFieldEvent: function () {
        var fieldEvent = {};
        var items = this.getItems();
        for (var item = 0; item < items.length; item++) {
            if (items[item].getFieldEvent !== undefined) {
                fieldEvent = items[item].getFieldEvent();
            }
        }
        return fieldEvent;
    },
    buildRelation: function () {

    },
    //同步表单数据到数据源
    _dataSyn: function (itemCode) {
        //var vm = this.valuesManager;
        //if (vm){
        if (this.canEdit) {
            try {
                this.validateItem(itemCode);
                this.performImplicitSave(this, false)
            } catch (e) {
                if (typeof isc != "undefined")
                    isc.Log.logError(e)
            }
        }
        //}
    },
    validateItem: function (itemCode) {
        var item = this.getItemByCode(itemCode);
        item.validate();
    },
    _initGroupCfg: function () {
        if (this.GroupTitle != null && this.GroupTitle != "") {
            this.isGroup = true;
            this.groupTitle = this.GroupTitle;
        }
    },
    hasGroupSelection: function () {
        return false;
    },

    //初始化表单项布局
    _initFieldLayout: function () {
        var fields = [];
        this.groupSelection = this.hasGroupSelection();
        if (this.groupSelection) {
            fields.push({
                value: this.GroupTitle,
                type: "section",
                sectionExpanded: true,
                itemIds: [],
                expandSection: function () {
                    this.form.$100(this);
                    this.$20f();
                    if (this.itemIds == null) {
                        this.logWarn("sectionItem defined with no items or itemIds");
                        return
                    }
                    for (var i = 0; i < this.itemIds.length; i++) {
                        var _2 = this.itemIds[i],
                            _3 = this.form.getItem(_2);
                        if (_3 == null) {
                            this.logWarn("expandSection: no such item: " + _2);
                            continue
                        }
                        if (_3.showIf == null && _3.$20g != null)
                            _3.showIf = _3.$20g;
                        if (_3._visible) {
                            _3.show(true)
                        }
                    }
                    this.canvas.setExpanded(true);
                    this.sectionExpanded = true;
                    this.form.$10m = true
                },
                collapseSection: function () {
                    if (this.itemIds == null) {
                        return
                    }
                    for (var i = 0; i < this.itemIds.length; i++) {
                        var _2 = this.itemIds[i],
                            _3 = this.form.getItem(_2);
                        if (_3 == null) {
                            continue
                        }
                        if (_3.visible) {
                            _3._visible = true;
                        }
                    }
                    this.Super('collapseSection', arguments);
                }
            })
        }

        var multiDsInfos = this.getMultiDataSourceInfo();

        for (var i = 0, l = this.fields.length; i < l; i++) {
            var field = this.fields[i];
            if (this.groupSelection) {
                if (field.type == "JGLabel" || field.type == "JGButton" || field.type == "JGAttachment") {
                    fields[0].itemIds.push(field.Code);
                } else {
                    fields[0].itemIds.push(field.IDColumnName || field.ColumnName);
                }
            }
            var colSpan = field.ColSpan * 2;
            field.colSpan = field.LabelVisible == false ? colSpan : colSpan - 1; //适配标题占据位置
            if (field.type == "JGButton" || field.type == "JGLabel" || field.type == "JGImage") {
                field.colSpan = field.ColSpan * 2;
            }
            //                    if (field.Enabled && !field.ReadOnly) {//ValidateWindow需要校验到只读控件Task20201103156
            //                    }
            field.required = field.IsMust;

            field.endRow = field.EndRow == "True" || field.EndRow === true;
            field.startRow = field.StartRow == "True" || field.StartRow === true;
            field.hint = field.Placeholder;
            if (field.Placeholder && !field.PlaceholderPosition) {
                field.PlaceholderPosition = "Auto";
            }
            if (field.PlaceholderPosition == "Auto") {
                if (this._hasRightPlaceholder || this.NumCols == "1") {
                    field.PlaceholderPosition = "Right";
                } else {
                    field.PlaceholderPosition = "Inner";
                }
            }
            field.showHintInField = field.PlaceholderPosition == "Inner" ? true : false;
            field.hintStyle = this.getHintClassName(field.PlaceholderPosition);
            if (this._hasRightPlaceholder) {
                field.endRow = true;
                field.startRow = true;
                field.wrapHintText = false;
            }
            field.width = '*';
            fields.push(field);
            if (field.type == "JGDateRangePicker" || field.type == "JGFloatRangeBox" || field.type == "JGPeriodRange") {
                fields.push({
                    type: 'hidden',
                    name: field.EndColumnName,
                    visible: false,
                    getBindFields: function () {
                        return [field.name]
                    },
                    getValueChangeFields: function () {
                        return [field.name];
                    }
                })
            }
        }

        /*var colNums = this.NumCols * 2;
        //表单布局里只有一个控件，并且控件是合并全部列，就当成一个列处理，若划分多个列，则会出现标题显示不了以及控件宽度不正确的问题
        var singleColumn = this.isSingleColumn();
        if(singleColumn){
        	colNums = 2;
        }
        var rowCfgs = isc.JSON.parseStrictJSON(this.RowCols);
        var fieldIndexs = {};
        for (var i = 0, l = this.fields.length; i < l; i++) {
        	var field = this.fields[i];
        	fieldIndexs[field.Code] = field;
        }
        for (var i = 0, l = rowCfgs.Rows.length; i < l; i++) {
        	var rowCfg = rowCfgs.Rows[i];
        	var colCfgs = rowCfg.Cols;
        	var colIndex = 0;
        	for (var j = 0, len = colCfgs.length; j < len; j++) {
        		var colCfg = colCfgs[j];
        		var field = fieldIndexs[colCfg.ControlCode];
        		if (!field) {
        			continue;
        		}
        		if(singleColumn){
        			colCfg.ColSpan = 1;
        		}
        		field.colSpan = colCfg.ColSpan * 2 - 1;
        		if(field.type == "JGButton"){
        			field.colSpan = field.colSpan * 2;
        		}
        		field.width = '*';
        		colIndex += field.colSpan * 2;
        		fields.push(field);
        		if(this.groupSelection){
        			if(field.type == "JGLabel" || field.type == "JGButton" || field.type == "JGAttachment"){
        				fields[0].itemIds.push(field.Code);
        			}else{
        				fields[0].itemIds.push(field.IDColumnName || field.ColumnName);
        			}
        		}
        		if (colCfg.EndRow) {
        			var spacerCols = colNums - colIndex;
        			if (spacerCols > 0) {
        				fields.push({
        					type: 'spacer',
        					colSpan: spacerCols
        				});
        			}
        		}
        	}
        }*/
        fields.push({
            type: 'hidden',
            name: 'id',
            visible: false //解决某些场景下死循环引发页面卡死
        });
        if (multiDsInfos) {
            for (var dsName in multiDsInfos) {
                fields.push({
                    type: 'hidden',
                    visible: false, //解决某些场景下死循环引发页面卡死
                    name: dsName + this.multiDsSpecialChar + 'id'
                });
            }
        }
        this.fields = fields;
    },
    getHintClassName: function (placeholderPosition) {
        var _class = "";
        switch (placeholderPosition) {
            case "Inner":
                _class = "v3FormItemPlaceholder";
                break;
            case "Right":
                _class = "v3FormItemPlaceholderRight";
                break;
        }
        return _class;
    },
    //只有布尔配了右边的提醒文字
    onlyBoolHasRightPlaceholder: function () {
        if (!this.hasRightPlaceholder() || this.NumCols != 1) {
            return false;
        }
        for (var i = 0; i < this.fields.length; i++) {
            var item = this.fields[i];
            if (item.type != "JGCheckBox" && item.Placeholder) {
                return false;
            }
        }
        return true;
    },
    hasRightPlaceholder: function () {
        if (this.NumCols == 1) {
            for (var i = 0; i < this.fields.length; i++) {
                var item = this.fields[i];
                if (item.Placeholder && (item.PlaceholderPosition == "Right" || item.PlaceholderPosition == 'Auto') && item.Appearance != "Stack") {
                    return true;
                }
            }
        }
        return false;
    },
    setVisible: function (visible) {
        this.Visible = visible;
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    },

    getVisible: function () {
        return this.Visible;
    },

    getPercentWidth: function () {
        return this.PercentWidth
    },

    setPercentWidth: function (percentWidth) {
        this.setWidth(percentWidth)
    },

    getPercentHeight: function () {
        return this.PercentHeight
    },

    setPercentHeight: function (percentHeight) {
        this.setHeight(percentHeight)
    },

    registerItemEventHandler: function (handler) {
        this._itemEventHandler = handler;
    },

    _fireEventHandler: function (itemCode, eventCode, args) {
        if (this._itemEventHandler) {
            this._itemEventHandler.apply(this, arguments);
        }
    },

    /**
     * 注册v3平台表达式处理器
     */
    registerV3ExpressionHandler: function (handler) {
        this._v3ExpHandler = handler;
    },
    /**
     * 遍历表单项
     */
    _iterateItems: function (func) {
        var items = this.getItems();
        if (items && items.length > 0) {
            for (var i = 0, l = items.length; i < l; i++) {
                if (func(items[i], i, this) === false) {
                    break;
                }
            }
        }
    },
    redraw: function () {
        var _this = this;
        this._iterateItems(function (item) {
            switch (item.type) {
                case "JGAttachment":
                    item.progressInfo = item.getProgressValue();
                    break;
                case "V3RichTextEditorItem":
                case "JGRichTextEditor":
                    item._$content = item.getContent();
                    break;
            }
        });
        this.Super('redraw', arguments);
        this._iterateItems(function (item) {
            switch (item.type) {
                case "JGAttachment":
                case "V3AttachmentFormItems":
                    item._redrawPosition();
                    break;
                case "JGDateRangePicker":
                case "JGPeriodRange":
                case "JGFloatRangeBox":
                    item.setRangeValue(item.startValue, item.endValue);
                    break;
                case "JGImage":
                    item.fitSizeByResize();
                    break;
                case "JGRichTextEditor":
                case "V3RichTextEditorItem":
                    if (!_this.isAbsoluteForm && typeof (item.recoveryInit) == "function") {
                        item.setContent(item._$content);
                        item.recoveryInit();
                    }
                    break;
            }
        });
    },
    /**
     * 根据表单项编号获取表单项
     */
    getItemByCode: function (itemCode) {
        var result = null;
        this._iterateItems(function (item) {
            if (item.Code == itemCode) {
                result = item;
                return false;
            }
        });
        return result;
    },
    /**
     * 根据绑定字段获取表单项
     */
    getItemsByFields: function (fields) {
        fields = typeof (fields) == "string" ? [fields] : fields;
        var result = null;
        this._iterateItems(function (item) {
            if (item.getBindFields) {
                var fieldList = item.getBindFields();
                if (fieldList && fieldList.containsAll(fields)) {
                    if (!result) {
                        result = [];
                    }
                    result.push(item);
                }
            }
        });
        return result;
    },
    /**
     * 获取垂直位置
     */
    getVerticalAlign: function () {
        return this.VerticalAlign;
    },

    /**
     * 获取水平位置
     */
    getHorizontalAlign: function () {
        return this.HorizontalAlign;
    },

    initCriteriaActions: function () {
        var fields = this.fields;
        if (fields) {
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];
                if (typeof field.CriteriaActionSetting == "string") {
                    var settings = JSON.parse(field.CriteriaActionSetting);
                    if (settings) {
                        field.CriteriaActionSettingObject = settings;
                    }
                } else {
                    field.CriteriaActionSettingObject = field.CriteriaActionSetting;
                }
            }
        }
    },

    //多数据源需要合并成同一个数据源
    initMultiDataSourceInfo: function () {
        var fields = this.fields;
        if (fields) {
            var dsInfos = {};
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];

                if (field.CriteriaActionSettingObject) {
                    try {
                        var criteriaActions = this.analyseCriteriaActions(field);
                        this.analyseCriteriaSettingsEntityFields(field.CriteriaActionSettingObject, dsInfos);
                        this.executeCriteriaAction(criteriaActions, field);
                    } catch (e) {

                    }
                }

                var sourceTableName = field.SourceTableName || field.TableName;
                if (!sourceTableName) {
                    continue;
                }
                var columnName = field.ColumnName;
                //暂不判断是否跟显示字段冲突，因为控件绑定标识字段和显示字段绑定同一个字段不会触发值改变
                var idColumnName = field.IDColumnName ? field.IDColumnName : field.IDColumnName == "" ? 'IDColumnName' : null;
                if (field.StartColumnName) {
                    var startColumnName = field.StartColumnName;
                }
                if (field.EndColumnName) {
                    var endColumnName = field.EndColumnName;
                }
                if (!dsInfos.hasOwnProperty(sourceTableName)) {
                    dsInfos[sourceTableName] = {
                        datasource: null, //此时没初始化数据源，找不到，等bingDatasource去赋值
                        fields: []
                    };
                }

                if (idColumnName) {
                    field.IDColumnName = sourceTableName + this.multiDsSpecialChar + idColumnName;
                }
                if (startColumnName) {
                    field.StartColumnName = sourceTableName + this.multiDsSpecialChar + startColumnName;
                }
                if (endColumnName) {
                    field.EndColumnName = sourceTableName + this.multiDsSpecialChar + endColumnName;
                }
                if (columnName) {
                    field.ColumnName = sourceTableName + this.multiDsSpecialChar + columnName;
                }


                if (columnName && dsInfos[sourceTableName].fields.indexOf(columnName) == -1) {
                    dsInfos[sourceTableName].fields.push(columnName);
                }
                if (idColumnName && dsInfos[sourceTableName].fields.indexOf(idColumnName) == -1) {
                    dsInfos[sourceTableName].fields.push(idColumnName);
                }
                if (startColumnName && dsInfos[sourceTableName].fields.indexOf(startColumnName) == -1) {
                    dsInfos[sourceTableName].fields.push(startColumnName);
                }
                if (endColumnName && dsInfos[sourceTableName].fields.indexOf(endColumnName) == -1) {
                    dsInfos[sourceTableName].fields.push(endColumnName);
                }
            }

            this.multiDataSourceInfo = dsInfos;
        }
    },
    getMultiDataSourceInfo: function () {
        return this.multiDataSourceInfo;
    },
    setMultiDsValue: function (widgetCode, itemCode, value) {
        var widget = widgetContext.get(widgetCode, "widgetObj");
        var item = widget.getItemByCode(itemCode);
        var itemName = item.name;
        if (itemName && itemName.indexOf(widget.multiDsSpecialChar) != -1) {
            itemName = itemName.split(widget.multiDsSpecialChar);
            var multiDsInfos = widget.getMultiDataSourceInfo();
            var datasource = multiDsInfos[itemName[0]].datasource;
            if (datasource) {
                var record = datasource.getCurrentRecord();
                var item = widget.getItemByCode(itemCode);
                if (null == record) {
                    record = datasource.createRecord();
                    record.set(itemName[1], value);
                    datasource.insertRecords({
                        records: [record]
                    });
                } else {
                    record.set(itemName[1], value);
                    datasource.updateRecords({
                        records: [record]
                    });
                }
            }
        }
    },
    /**
     * 获取值
     * @param	widgetCode	{String}	控件编码
     * @param	itemCode	{String}	子控件编码
     * @param	fielName	{String}	字段编码
     * */
    getMultiDsValue: function (widgetCode, itemCode, fielName) {
        var widget = widgetContext.get(widgetCode, "widgetObj");
        var item = widget.getItemByCode(itemCode);
        var itemName = item[fielName ? fielName : "name"];
        if (itemName && itemName.indexOf(widget.multiDsSpecialChar) != -1) {
            itemName = itemName.split(widget.multiDsSpecialChar);
            var multiDsInfos = widget.getMultiDataSourceInfo();
            var datasource = multiDsInfos[itemName[0]].datasource;
            if (datasource && datasource.getAllRecords().datas.length > 0) {
                return datasourceUtil.getSingleValue(datasource.getMetadata().getDatasourceName(), itemName[1]);
            } else {
                return null;
            }
        }
    },
    getMultiDefaultValue: function (widgetCode, itemCode) { //默认值有待处理
        //				var widget = widgetContext.get(widgetCode, "widgetObj");
        //				var item = widget.getItemByCode(itemCode);
        //				return item.DefaultValue;
    },
    /**
     * 获取text，下拉、单选、多选
     * @param	widgetCode		{String}	控件编码
     * @param	itemCode		{String}	子控件编码
     * @param	displayField	{String}	显示字段编码
     * */
    getMulitDsText: function (widgetCode, itemCode, displayField) {
        var item = this.getItemByCode(itemCode);
        var itemName = item[displayField ? displayField : "name"];
        if (itemName && itemName.indexOf(this.multiDsSpecialChar) != -1) {
            itemName = itemName.split(this.multiDsSpecialChar);
            return datasourceUtil.getSingleValue(itemName[0], itemName[1]);
        }
    },
    //密码影响单选、日期、长日期、期次
    updateFocusItemValue: function () {},

    getItem: function (field) {
        var item = this.Super('getItem', arguments);
        if (!item) {
            for (var i = 0, l = this.items.length; i < l; i++) {
                var it = this.items[i];
                if (it.getBindFields) {
                    var fields = it.getBindFields();
                    if (fields.contains(field)) {
                        item = it;
                        break;
                    }
                }
            }
        }
        return item;
    },

    /**
     * 判断是否有分组标题
     * */
    hasGroupTitle: function () {
        var groupTitle = this.GroupTitle;
        if (null != groupTitle && "" != groupTitle) {
            return true;
        }
        return false;
    },

    getMembersMargin: function () {
        var _memberMargin = 8;
        if (window.v3PlatformSCSkin && window.v3PlatformSCSkin.layoutMemberMagin) {
            _memberMargin = window.v3PlatformSCSkin.layoutMemberMagin;
        }
        return _memberMargin;
    },

    getLayoutMargin: function () {
        if (this.hasGroupTitle()) {
            var _layoutPadding = 8;
            if (window.v3PlatformSCSkin && window.v3PlatformSCSkin.layoutPadding) {
                _layoutPadding = window.v3PlatformSCSkin.layoutPadding;
            }
            return _layoutPadding;
        }
        return 0;
    },
    getGroupTitleHeight: function () {
        if (this.hasGroupTitle()) {
            if (this.groupSelection) {
                //						return this.items[0].getVisibleHeight();
                //						return this.items[0].height;
                return 32;
            }
            //					return this.groupLabel.getVisibleHeight();
            return 8;
        }
        return 0;
    },
    parentDisabled: function (disabled) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].type != "section" && this.items[i].parentDisabled) {
                //						this.items.callMethod("parentDisabled", disabled)
                this.items[i].parentDisabled(disabled);
            }
        }
    },
    /**
     * readOnly:是否只读
     * canEditReadOnly:整体控制后，内部只读是否可以单独设置
     * */
    parentReadOnly: function (readOnly, canEditReadOnly) {
        this.canEditReadOnly = canEditReadOnly;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].type != "section" && this.items[i].parentReadOnly) {
                if (!canEditReadOnly) {
                    this.items[i]._ReadOnly = readOnly;
                }
                //如果不设置，则表单控件不能设置只读
                this.items[i].parentReadOnly(readOnly);
            }
        }
        if (!canEditReadOnly) {
            this.setCanEdit(!readOnly);
        }

    },
    setEnabled: function (enabled) {
        this.parentDisabled(!enabled);
    },

    _addHighlightStyle: function (obj, attrName, highlightName, cb) {
        var styleName = obj[attrName];
        if (!styleName || styleName.indexOf(' ' + highlightName) == -1) {
            styleName = styleName ? styleName + ' ' + highlightName : highlightName;
            cb.call(obj, styleName)
        }
    },
    _removeHighlightStyle: function (obj, attrName, highlightName, cb) {
        var styleName = obj[attrName];
        if (styleName && styleName.indexOf(highlightName) != -1) {
            styleName = styleName.replace(' ' + highlightName, '');
            cb.call(obj, styleName);
        }
    },
    showHighlight: function () {
        this._addHighlightStyle(this, 'styleName', 'v3FormComponentHighlight', function (name) {
            this.setStyleName(name);
        });
    },

    hideHighlight: function () {
        this._removeHighlightStyle(this, 'styleName', 'v3FormComponentHighlight', function (name) {
            this.setStyleName(name);
        });
    },

    showItemHighlight: function (itemCode) {
        var item = this.getItemByCode(itemCode);
        if (item) {
            var redraw = false;
            this._addHighlightStyle(item, 'titleStyle', 'v3FormTitleComponentHighlight', function (name) {
                this.titleStyle = name;
                redraw = true;
            });
            this._addHighlightStyle(item, 'cellStyle', 'v3FormCellComponentHighlight', function (name) {
                this.cellStyle = name;
                redraw = true;
            });
            if (redraw) {
                this.redraw();
            }
        }
    },
    hasEvent: function (eventName) {
        if (this.listener) {
            if (this.listener instanceof Array) {
                return this.listener.indexOf(eventName) != -1;
            } else {
                return this.listener.hasOwnProperty(eventName);
            }
        }
        return false;
    },
    hideItemHighlight: function (itemCode) {
        var item = this.getItemByCode(itemCode);
        if (item) {
            var redraw = false;
            this._removeHighlightStyle(item, 'titleStyle', 'v3FormTitleComponentHighlight', function (name) {
                this.titleStyle = name;
                redraw = true;
            });
            this._removeHighlightStyle(item, 'cellStyle', 'v3FormCellComponentHighlight', function (name) {
                this.cellStyle = name;
                redraw = true;
            });
            if (redraw) {
                this.redraw();
            }
        }
    },
    setLabelText: function (title, itemCode) {
        if (!itemCode) {
            return;
        }
        var titleWidth = this.titleWidth;
        var item = this.getItemByCode(itemCode);
        var oldTitle = item.title;
        item.SimpleChineseTitle = title;
        item.title = title;
        //如果是自动标题宽度
        if (this._$isAutoTitleWidth && typeof (MaxTitleLengthFunc) == "function") {
            var nowTitleWidth = MaxTitleLengthFunc(oldTitle);
            var tmpWidth = MaxTitleLengthFunc(title);
            if (tmpWidth == titleWidth) {
                item.redraw();
            } else {
                var autoWidgets = [];
                var windowScope = scopeManager.getWindowScope();
                var widgets = windowScope.getWidgets();
                for (var widgetCode in widgets) {
                    var widget = widgets[widgetCode];
                    if (widget.type == "JGFormLayout" && widget._$isAutoTitleWidth) {
                        autoWidgets.push(widget);
                    }
                }
                var isUpdate = true;
                if (tmpWidth < titleWidth) { //小于的情况：1、当前修改是最大的，当前修改不是最大的，得遍历检查
                    var nowMax = 0;
                    for (var i = 0, len = autoWidgets.length; i < len; i++) {
                        var widget = widgetContext.get(autoWidgets[i].widgetId, "widgetObj");
                        var tl = getMaxTitleLength({
                            "calculateLength": MaxTitleLengthFunc,
                            "property": widget,
                            "fieldName": "items" //最新标题在此处
                        });
                        if (tl > nowMax) {
                            nowMax = tl;
                        }
                    }
                    if (nowMax >= titleWidth) { //不可能大于，等于也不用处理（原来最大的在其他表单布局）
                        isUpdate = false;
                    } else {
                        tmpWidth = nowMax;
                    }
                }
                if (isUpdate) {
                    for (var i = 0, len = autoWidgets.length; i < len; i++) {
                        var widget = widgetContext.get(autoWidgets[i].widgetId, "widgetObj");
                        widget.TitleWidth = widget.titleWidth = tmpWidth;
                        widget.redraw();
                    }
                } else {
                    item.redraw();
                }
            }
        } else {
            item.redraw();
        }
    },
    analyseCriteriaSettingsEntityFields: function (settings, dsInfos) {
        for (var i = 0; i < settings.length; i++) {
            var setting = settings[i];
            if (setting && setting.criteria && setting.actions) {
                this.analyseCriteriaEntityFields(setting.criteria.criteria, dsInfos);
            }
        }
    },

    analyseCriteriaEntityFields: function (criteria, dsInfos) {
        if (!criteria || criteria.length == 0) {
            return;
        }
        for (var i = 0; i < criteria.length; i++) {

            if (criteria[i].criteria) {
                this.analyseCriteriaEntityFields(criteria[i].criteria, dsInfos);
            }

            var fieldName = criteria[i].fieldName;
            var splitedFieldName = fieldName.split("_$_");
            if (splitedFieldName.length > 1) {
                var entityName = splitedFieldName[0];
                var columnName = splitedFieldName[1];
                if (entityName != "" && columnName != "") {
                    if (!dsInfos.hasOwnProperty(entityName)) {
                        dsInfos[entityName] = {
                            datasource: null, //此时没初始化数据源，找不到，等bingDatasource去赋值
                            fields: []
                        };
                    }
                    if (dsInfos[entityName].fields.indexOf(columnName) == -1)
                        dsInfos[entityName].fields.push(columnName);
                }
            }
            var valuePath = criteria[i].valuePath;
            if (valuePath) {
                var splitedFieldName = valuePath.split("_$_");
                if (splitedFieldName.length > 1) {
                    var entityName = splitedFieldName[0];
                    var columnName = splitedFieldName[1];
                    if (entityName != "" && columnName != "") {
                        if (!dsInfos.hasOwnProperty(entityName)) {
                            dsInfos[entityName] = {
                                datasource: null, //此时没初始化数据源，找不到，等bingDatasource去赋值
                                fields: []
                            };
                        }
                        if (dsInfos[entityName].fields.indexOf(columnName) == -1)
                            dsInfos[entityName].fields.push(columnName);
                    }
                }
            }

        }
    },
    analyseCriteriaActions: function (field) {
        var settings = field.CriteriaActionSettingObject
        var criteriaActions = [];

        for (var i = 0; i < settings.length; i++) {
            var setting = settings[i];
            if (setting.criteria == undefined && setting.Criteria) {
                setting.criteria = setting.Criteria;
            }
            if (setting && setting.criteria && setting.actions) {
                this.analyseCriteriaValue(field, setting.criteria.criteria);
                for (var j = 0; j < setting.actions.length; j++) {
                    var action = setting.actions[j];
                    var criteriaAction = {
                        type: action.type,
                        criteria: setting.criteria,
                        valueType: action.valueType,
                        value: action.value
                    };
                    if (action.value) {
                        criteriaAction.value = action.value;
                    }
                    if (action.valuePath) {
                        criteriaAction.valuePath = action.valuePath;
                    }
                    criteriaActions.push(criteriaAction)
                }
            }
        }

        return criteriaActions;

    },
    //执行条件动作
    executeCriteriaAction: function (criteriaActions, field) {
        if (criteriaActions.length > 0) {
            for (var i = 0, len = criteriaActions.length; i < len; i++) {
                var action = criteriaActions[i];
                action.criteria._constructor = "AdvancedCriteria";
                if (action.criteria.operator == "") action.criteria.operator = "and";
                switch (action.type) {
                    case "ReadOnly":
                        var criteria = [];
                        for (var criteriaIndex = 0, criteriaLength = action.criteria.criteria.length; criteriaIndex < criteriaLength; criteriaIndex++) {
                            var criteriaItem = action.criteria.criteria[criteriaIndex];
                            var requireCriteria = {
                                operator: criteriaItem.operator,
                                fieldName: criteriaItem.fieldName
                            }
                            if (criteriaItem.value) {
                                requireCriteria.value = criteriaItem.value;
                            }
                            if (criteriaItem.valuePath) {
                                requireCriteria.valuePath = criteriaItem.valuePath;
                            }
                            criteria.push(requireCriteria);
                        }
                        if (action.value == true) {
                            field.readOnlyWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: action.criteria.operator,
                                criteria: criteria
                            };
                        } else {
                            field.readOnlyWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: "not",
                                criteria: [{
                                    operator: action.criteria.operator,
                                    criteria: criteria
                                }]
                            };
                        }
                        break;
                    case "Visible":
                        var criteria = [];
                        for (var criteriaIndex = 0, criteriaLength = action.criteria.criteria.length; criteriaIndex < criteriaLength; criteriaIndex++) {
                            var criteriaItem = action.criteria.criteria[criteriaIndex];
                            var requireCriteria = {
                                operator: criteriaItem.operator,
                                fieldName: criteriaItem.fieldName
                            }
                            if (criteriaItem.value) {
                                requireCriteria.value = criteriaItem.value;
                            }
                            if (criteriaItem.valuePath) {
                                requireCriteria.valuePath = criteriaItem.valuePath;
                            }
                            criteria.push(requireCriteria);
                        }
                        if (action.value == true) {
                            field.visibleWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: action.criteria.operator,
                                criteria: criteria
                            };
                        } else {
                            field.visibleWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: "not",
                                criteria: [{
                                    operator: action.criteria.operator,
                                    criteria: criteria
                                }]
                            };
                        }
                        break;
                    case "IsMust":
                        var criteria = [];
                        for (var criteriaIndex = 0, criteriaLength = action.criteria.criteria.length; criteriaIndex < criteriaLength; criteriaIndex++) {
                            var criteriaItem = action.criteria.criteria[criteriaIndex];
                            var requireCriteria = {
                                operator: criteriaItem.operator,
                                fieldName: criteriaItem.fieldName
                            }
                            if (criteriaItem.value) {
                                requireCriteria.value = criteriaItem.value;
                            }
                            if (criteriaItem.valuePath) {
                                requireCriteria.valuePath = criteriaItem.valuePath;
                            }
                            criteria.push(requireCriteria);
                        }
                        if (action.value == true) {
                            field.requiredWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: action.criteria.operator,
                                criteria: criteria
                            };
                        } else {
                            field.requiredWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: "not",
                                criteria: [{
                                    operator: action.criteria.operator,
                                    criteria: criteria
                                }]
                            };
                        }
                        break;

                    case "Enabled":
                        var criteria = [];
                        for (var criteriaIndex = 0, criteriaLength = action.criteria.criteria.length; criteriaIndex < criteriaLength; criteriaIndex++) {
                            var criteriaItem = action.criteria.criteria[criteriaIndex];
                            var requireCriteria = {
                                operator: criteriaItem.operator,
                                fieldName: criteriaItem.fieldName
                            }
                            if (criteriaItem.value) {
                                requireCriteria.value = criteriaItem.value;
                            }
                            if (criteriaItem.valuePath) {
                                requireCriteria.valuePath = criteriaItem.valuePath;
                            }
                            criteria.push(requireCriteria);
                        }
                        if (action.value == true) {
                            field.enabledWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: action.criteria.operator,
                                criteria: criteria
                            };
                        } else {
                            field.enabledWhen = {
                                _constructor: "AdvancedCriteria",
                                operator: "not",
                                criteria: [{
                                    operator: action.criteria.operator,
                                    criteria: criteria
                                }]
                            };
                        }
                        break;
                }
            }

        }
    },

    //获取颜色值
    getCriteriaColor: function (action) {
        if (action.valueType == "colorEnum") {
            return this.getColorByEnum(action.value);
        } else if (action.valueType == "custom") {
            return "rgb(" + action.value + ")";
        } else {
            if (action.value && action.value[0] == "$") {
                return this.getColorByEnum(action.value);
            }
            return action.value;
        }
    },
    analyseCriteriaValue: function (field, criteria) {
        if (!criteria || criteria.length == 0) {
            return;
        }
        for (var i = 0; i < criteria.length; i++) {
            if (criteria[i].fieldName.contains(".")) {
                criteria[i].fieldName = criteria[i].fieldName.replace(".", "_$_");
            } else {
                criteria[i].fieldName = field.SourceTableName + "_$_" + criteria[i].fieldName;
            }



            if (criteria[i].value) {
                if (criteria[i].operatorValueType == "expression") {
                    criteria[i].value = vds.expression.execute(criteria[i].value);
                } else if ("entityField" == criteria[i].operatorValueType) {
                    if (criteria[i].value.contains(".")) {
                        criteria[i].valuePath = criteria[i].value.replace(".", "_$_");
                    } else {
                        criteria[i].valuePath = field.SourceTableName + "_$_" + criteria[i].value;
                    }
                    criteria[i].value = undefined;
                } else {
                    criteria[i].value = eval(criteria[i].value);
                }
            }
            if (criteria[i].criteria) {
                this.analyseCriteriaValue(criteria[i].criteria);
            }
        }

    },
    easyTemplate: function (template, params) {
        var val = vds.string.template(template, params).toString();
        return val;
    },
    /**
     * 生成Ascii码，生成规则：累加key和value的ascii码值
     * @param	{Object}	data
     * @returns	{Object}	校验码
     * */
    genAsciiCode: function (data) {
        return dataValidateUtil.genAsciiCode(data);
    }
});
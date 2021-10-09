/**
 * 子控件布局方案
 * 主要功能：将开发系统中的泊靠设置转换成sc的HLayout和VLayout
 * 实现方案：
 *  1、根据子控件的原始宽高是否撑满父容器宽高来决定使用sc的HLayout还是VLayout（此方案废弃，因开发系统给过来的控件原始宽高信息不正确）
 *  2、根据子控件的泊靠来决定使用sc的HLayout还是VLayout，如：子控件泊靠为：A(Top)、B(Bottom)、C(Left)、D(Top),布局效果为
 * ----------------------------
 * |            A             |
 * ----------------------------
 * |     |        D           |
 * |     |---------------------    
 * |  C  |                    |
 * |     |                    |
 * ----------------------------
 * |            B             |
 * ----------------------------
 */
isc.JGLayoutManager._useNewLayout = true;
isc.JGLayoutManager.addInterfaceMethods({

    /**
     * 布局新方案
     */
    _newLayoutChildren: function (children, layoutMargin) {
        layoutMargin = typeof(layoutMargin)=="boolean" ? layoutMargin:true;
        var result = [];
        var splitChildren = this._splitChildren(children);
        var dockChildren = splitChildren.dockChildren;
        var absChildren = splitChildren.absChildren;
        var headMembers = [],centerMembers=[],tailMembers=[];
        var constructor;
        this._forEach(dockChildren, function (child,index) {
            var flag = true;
            if(this._isFillDock(child)){//铺满不参与决定布局类型
                child.setPercentWidth&&child.setPercentWidth('100%');
                child.setPercentHeight&&child.setPercentHeight('100%');
                centerMembers.push(child);
            }else if (this._isHLayoutChild(child)) {
                this._setHorizontalDockChildRect(child);
                if(constructor&&constructor!==isc.HLayout){
                    flag = false;
                    centerMembers = centerMembers.concat(this._newLayoutChildren(dockChildren.splice(index),false));
                }else{
                    constructor = isc.HLayout;
                    this._appendMember(child,headMembers,centerMembers,tailMembers);
                }
            } else if (this._isVLayoutChild(child)) {
                this._setVerticalDockChildRect(child);
                if(constructor&&constructor!==isc.VLayout){
                    flag = false;
                    centerMembers = centerMembers.concat(this._newLayoutChildren(dockChildren.splice(index),false));
                }else{
                    constructor = isc.VLayout;
                    this._appendMember(child,headMembers,centerMembers,tailMembers);
                }
            }
            return flag;
        }, null, this);
        var members = headMembers.concat(centerMembers).concat(tailMembers);
        if(members.length>0&&!constructor){
            constructor = isc.HLayout;
        }
        if (constructor) {
            var _membersMargin = typeof (this.getMembersMargin) == "function" ? this.getMembersMargin() : 8;
            var _layoutMargin = typeof (this.getLayoutMargin) == "function" ? this.getLayoutMargin() : 8;
            members = this._enhanceMemebrs(members);
            var params = {
                //设置默认宽度，防止布局控件宽度总和小于100导致布局使用默认宽度
                defaultWidth: 5,
                //设置默认高度，防止布局控件高度总和小于100导致布局使用默认高度
                defaultHeight: 5,
                membersMargin: _membersMargin,
                layoutMargin: layoutMargin ?_layoutMargin:0,
                canFocus: true,
                overflow: isc.Canvas.VISIBLE,
                width: "100%",
                height: "100%",
                members: constructor.getClassName()=="VLayout" ? this.analyzeVLayoutChild(members):members
            };
            //页签在不同模式下的内间距不一样Task20191211102
            if (typeof (this.resetLayoutMargin) == "function") {
                this.resetLayoutMargin(params);
            }
            result.push(constructor.create(params));
        }
        if(absChildren.length>0){
            absChildren = this._layoutAbsChildren(absChildren);
        }
        return result.concat(absChildren);
    },
    _hasDock:function(widget){
        var dock = this.getChildDock(widget);
        return dock && dock.toLowerCase() != "none";
    },
    /**
     * 填充占位
     */
    _enhanceMemebrs:function(members){
        if(this._needFillSpacer(members)){
            if(members.length==1){
                members.splice(0,0,isc.LayoutSpacer.create({}));
            }else{
                var dock = null;
                this._forEach(members,function(child,index){
                    var childDock = child.Dock;
                    if(dock === null){
                        dock = childDock;
                    }else if(childDock!=dock){
                        members.splice(index,0,isc.LayoutSpacer.create({}));
                        return false;
                    }
                });
            }   
        }
        return members;
    },
    _needFillSpacer: function(members){
        var flag = true;
        var dock = "unset";
        var hDock = ["Left","Right"];
        var vDock = ["Top","Bottom"];
        if(members.length==1){
            var childDock = members[0].Dock;
            return childDock=="Right"||childDock=="Bottom";
        }
        this._forEach(members,function(child){
            var childDock = child.Dock;
            if(childDock == "Fill"||typeof(childDock)=="undefined"){
                flag = false;
                return false;
            }
            if(dock=="unset"){
                dock = childDock;
            }else if(hDock.indexOf(dock)!=-1&&vDock.indexOf(childDock)!=-1||hDock.indexOf(childDock)!=-1&&vDock.indexOf(dock)!=-1){
                flag = false;
                return false;
            }
        });
        return flag;
    },
    /**
     * 获取父控件布局类型
     */
    _getLayoutType:function(children){
        var type = "horizontal";
        this._forEach(children,function(child){
            if(this._isVLayoutChild(child)){
                type = "vertical";
                return false;
            }else if(this._isHLayoutChild(child)){
                type = "horizontal";
                return false;
            }
        },null,this);
        return type;
    },
    /**
     * 分离子控件，将子控件分类成设置了泊靠与非泊靠控件
     * @param {Array} children 子控件
     * @returns Object
     */
    _splitChildren: function (children) {
        var result = {
            dockChildren: [],
            absChildren: []
        };
        this._forEach(children, function (child) {
            if (this._hasDock(child)) {
                result.dockChildren.push(child);
            } else {
                result.absChildren.push(child);
            }
        },null,this);
        return result;
    },
    _appendMember: function(child,headMembers,centerMembers,tailMembers){
        if(this._isHeadMember(child)){
            headMembers.push(child);
        }else if(this._isTailMember(child)){
            tailMembers.push(child);
        }else if(this._isCenterMember(child)){
            centerMembers.push(child);
        }else{
            throw Error("未识别控件布局类型！");
        }
    },
    /**
     * 是否为头部控件（泊靠为Top、Left）
     */
    _isHeadMember: function(child){
        var dock = this.getChildDock(child);
        return dock=="Top"||dock == "Left";
    },
    /**
     * 是否为尾部控件（泊靠为Bottom、Right）
     */
    _isTailMember: function(child){
        var dock = this.getChildDock(child);
        return dock=="Bottom"||dock == "Right";
    },
    /**
     * 是否为居中控件
     */
    _isCenterMember: function(child){
        var dock = this.getChildDock(child);
        return dock=="Fill";
    },
    /**
     * 是否为水平排列控件
     * @param {Canvas} child 子控件
     * @param {Array} parentReact 父控件原始宽高
     * @returns Boolean
     */
    _isHLayoutChild: function (child) {
        var dock = this.getChildDock(child);
        return dock == "Left"||dock=="Right";
    },
    /**
     * 是否为垂直排列控件
     * @param {Canvas} child 子控件
     * @param {Array} parentReact 父控件原始宽高
     * @returns Boolean
     */
    _isVLayoutChild: function (child) {
        var dock = this.getChildDock(child);
        return dock == "Top"||dock=="Bottom";
    },

    /**
     * 是否为铺满
     */
    _isFillDock: function(child){
        var dock = this.getChildDock(child);
        return dock=="Fill";
    }

});
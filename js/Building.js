(function(){
    var Building = game.Building = function(props)
    {
        props = props || {};
        Building.superClass.constructor.call(this, props);
        this.id = props.id || Q.UIDUtil.createUID('Building');
        this.avatar = null;

        this.init();
    };
    Q.inherit(Building, Q.DisplayObjectContainer);

    Building.STATE =
    {
        EMPTY : 0,
        LEVEL1 : 1,
        NOTAVAILABLE : 2
    }

    Building.TYPE =
    {
        EMPTY : 0,
        HOUSE : 1,
        WARHOUSE : 2
    }

    Building.prototype.init = function()
    {


        //初始化参数
        this.state = Building.STATE.EMPTY;
        this.type = Building.TYPE.EMPTY;

        trace(this.id);

        this.avatar = new Q.Bitmap({id:'avatar' + this.id, image:this.getImage()});

        this.addChild(this.avatar);

        //初始化数据。
        //是否接受事件
        this.eventChildren = false;
    };

    Building.prototype.getImage = function()
    {
        switch(this.type)
        {
            case Building.TYPE.HOUSE :
                return game.getImage("house");
            case Building.TYPE.WARHOUSE :
                return game.getImage("warHouse");
            default :
                return game.getImage("empty");
        }
    }

    //新建建筑
    Building.prototype.startBuild = function()
    {
        trace('start');
        switch(this.type)
        {
            case Building.TYPE.HOUSE:
                this.state = (this.state + 1) % Building.STATE.NOTAVAILABLE;
                this.type = Building.TYPE.HOUSE;
                this.removeAllChildren();
                this.avatar = new Q.Bitmap({id:'avatar' + this.id, image:this.getImage()});
                this.wrench = new Q.MovieClip({id:"wrench", image:game.getImage('wrench'), useFrames:true, interval:6, x:0, y:50});
                this.wrench.addFrame([
                    {rect:[0,0,128,128]},
                    {rect:[128,0,128,128]},
                    {rect:[256,0,128,128]}
                ]);
                this.addChild(this.avatar, this.wrench);
                game.stage.removeChildById(this.id);
                game.stage.addChild(this);
                break;
        }
    };

    //建筑制造
    Building.prototype.finishBuild = function()
    {

    };

    //建筑的更新函数，此方法会不断的被quark系统调用而产生跳跃动画。
    Building.prototype.update = function()
    {

    };

})();
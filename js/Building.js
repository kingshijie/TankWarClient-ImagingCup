(function(){
    var Building = game.Building = function(props)
    {
        props = props || {};
        Building.superClass.constructor.call(this, props);
        this.id = props.id || Q.UIDUtil.createUID('Building');
        this.avatar = null;
        this.buildingTime = 0;

        this.init();
    };
    Q.inherit(Building, Q.DisplayObjectContainer);

    Building.COST =[
        0,      //Empty
        100,    //House
        200     //WarHouse
    ];

    Building.BUILDINGSTAT =
    {
        INIT : 0,
        BUILDING : 1,
        FINISHED : 2
    }

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
        this.buildingStat = Building.BUILDINGSTAT.INIT;

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
    Building.prototype.startBuild = function(type)
    {
        trace('start');
        this.type = type;
        switch(type)
        {
            case Building.TYPE.HOUSE:
                this.state = (this.state + 1) % Building.STATE.NOTAVAILABLE;
                this.removeAllChildren();
                this.avatar = new Q.Bitmap({id:'avatar' + this.id, image:this.getImage()});
                this.wrench = this.addWrench();
                this.addChild(this.avatar, this.wrench);
                //开始计算建造时间，时间清零
                this.buildingTime = 0;
                this.buildingStat = Building.BUILDINGSTAT.BUILDING;
                break;
            case Building.TYPE.WARHOUSE:
                this.state = (this.state + 1) % Building.STATE.NOTAVAILABLE;
                this.removeAllChildren();
                this.avatar = new Q.Bitmap({id:'avatar' + this.id, image:this.getImage()});
                this.wrench = this.addWrench();
                this.addChild(this.avatar, this.wrench);
                //开始计算建造时间，时间清零
                this.buildingTime = 0;
                this.buildingStat = Building.BUILDINGSTAT.BUILDING;
                break;
        }
    };


    //建造完成
    Building.prototype.finishBuild = function()
    {
        if(this.buildingStat == Building.BUILDINGSTAT.BUILDING){
            this.buildingStat = Building.BUILDINGSTAT.FINISHED;
            this.removeWrench();
            trace('FInish building:',this.id);
        }
    };

    //建筑的更新函数，此方法会不断的被quark系统调用而产生跳跃动画。
    Building.prototype.update = function(timeInfo)
    {
        if(this.buildingStat == Building.BUILDINGSTAT.BUILDING){
            this.buildingTime += timeInfo.deltaTime;
            if(this.buildingTime > 5000){
                this.finishBuild();
            }
        }
    };

    Building.prototype.addWrench = function(){
        var wrench = new Q.MovieClip({id:'wrench' + this.id, image:game.getImage('wrench'), useFrames:true, interval:6, x:0, y:50});
        wrench.addFrame([
            {rect:[0,0,128,128]},
            {rect:[128,0,128,128]},
            {rect:[256,0,128,128]}
        ]);
        return wrench;
    }

    Building.prototype.removeWrench = function(){
        this.removeChildById('wrench' + this.id);
    }

})();
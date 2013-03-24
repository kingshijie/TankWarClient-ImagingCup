/**
 * Created with JetBrains WebStorm.
 * User: aaron
 * Date: 13-3-15
 * Time: 下午3:20
 * To change this template use File | Settings | File Templates.
 */
(function(){


    window.onload = function()
    {
        game.init();
    };


    var game = {
        res: [
            {id:"bg", size:178, src:"images/bg.jpg"},
            {id:"worldMap", size:986, src:"images/worldMap.png"},
            {id:"buttons", size:43, src:"images/btns.png"},
            {id:"empty", size:11, src:"images/b0.png"},
            {id:"house", size:36, src:"images/b6.png"},
            {id:"warHouse", size:58, src:"images/b42.png"},
            {id:"wrench", size:30, src:"images/wrench.png"},
            {id:"num1", size:16, src:"images/num1.png"},
            {id:"num2", size:29, src:"images/num2.png"}

        ],
        cost : [
            {id:"house", level1:30, level2:60},
            {id:"warHouse", level1:60, level2:120}
        ],
        buildingPositions : [
            {x:100,y:100},
            {x:400,y:100},
            {x:600,y:100},
            {x:400,y:400}
        ],
        container : null,
        timer : null,
        stage : null,
        resources : 150,
        resourcesNum : null,
        width : 0,
        height : 0,
        fps : 40,
        buildings : [],
        initFlag : 0,
        events : null,
        buildingNum : 0,
        totalTime : 0,
        fieldMap : null, //生产场景背景
        worldMap : null, //世界地图背景
        filedMapBtn : null,//生产场景按钮
        worldMapBtn : null,
        menu1 : null, //选择建筑菜单
        soldierNum : 0, //士兵数量
        tankNum : 0     //坦克数量

    };

    var ns = window.game = game;

    game.init = function()
    {
        //初始化游戏场景容器，设定背景渐变样式
        var container = Q.getDOM("container");

        //加载进度信息
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.width = container.clientWidth + "px";
        div.style.left = "0px";
        div.style.top = (container.clientHeight >> 1) + "px";
        div.style.textAlign = "center";
        div.style.color = "#fff";
        div.style.font = Q.isMobile ?  'bold 16px 黑体' : 'bold 16px 宋体';
        div.style.textShadow = Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc";
        container.appendChild(div);
        this.loader = div;

        //隐藏浏览器顶部导航
        setTimeout(game.hideNavBar, 10);
        if(Q.supportOrient)
        {
            window.onorientationchange = function(e)
            {
                game.hideNavBar();
                game.calcStagePosition();
            };
        }

        //加载图片素材
        var loader = new Q.ImageLoader();
        loader.addEventListener("loaded", Q.delegate(this.onLoadLoaded, this));
        loader.addEventListener("complete", Q.delegate(this.onLoadComplete, this));
        loader.load(this.res);

        //建筑物个数初始化
        this.buildingNum = this.buildingPositions.length;
    }

    //加载进度条
    game.onLoadLoaded = function(e)
    {
        this.loader.innerHTML = "正在加载资源中，请稍候...<br>";
        this.loader.innerHTML += "(" + Math.round(e.target.getLoadedSize()/e.target.getTotalSize()*100) + "%)";
    }

    //加载完成
    game.onLoadComplete = function(e)
    {
        e.target.removeAllEventListeners();
        Q.getDOM("container").removeChild(this.loader);
        this.loader = null;

        this.images = e.images;
        //初始化一些类
        game.Num.init();
        //启动游戏
        this.startup();
    }


//获取图片资源
    game.getImage = function(id)
    {
        return this.images[id].image;
    }

    //启动游戏
    game.startup = function()
    {
        //手持设备的特殊webkit设置
        if(Q.isWebKit && Q.supportTouch)
        {
            document.body.style.webkitTouchCallout = "none";
            document.body.style.webkitUserSelect = "none";
            document.body.style.webkitTextSizeAdjust = "none";
            document.body.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        }

        //初始化容器设置
        var colors = ["#00c2eb", "#cbfeff"];
        this.container = Q.getDOM("container");
        this.container.style.overflow = "hidden";
        this.container.style.background = "-moz-linear-gradient(top, "+ colors[0] +", "+ colors[1] +")";
        this.container.style.background = "-webkit-gradient(linear, 0 0, 0 bottom, from("+ colors[0] +"), to("+ colors[1] +"))";
        this.container.style.background = "-o-linear-gradient(top, "+ colors[0] +", "+ colors[1] +")";
        this.container.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr="+ colors[0] +", endColorstr="+ colors[1] +")";
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        //获取URL参数设置
        this.params = Q.getUrlParams();
        this.fps = this.params.fps || 40;

        //初始化context
        var context = null;
        if(this.params.canvas)
        {
            var canvas = Q.createDOM("canvas", {id:"canvas", width:this.width, height:this.height, style:{position:"absolute"}});
            this.container.appendChild(canvas);
            this.context = new Q.CanvasContext({canvas:canvas});
        }else
        {
            this.context = new Q.DOMContext({canvas:this.container});
        }

        //创建舞台
        this.stage = new Q.Stage({width:this.width, height:this.height, context:this.context, update:Q.delegate(this.update, this)});


        //初始化定时器
        var timer = new Q.Timer(1000 / this.fps);
        timer.addListener(this.stage);
        //timer.addListener(Q.Tween);
        timer.start();
        this.timer = timer;

        //预加载背景音乐
        //var audio = new Quark.Audio("sounds/test.mp3", true, true, true);
        //this.audio = audio;

        var em = new Q.EventManager();
        var events = Q.supportTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
        em.registerStage(game.stage, events, true, true);
        this.events = events;

        this.showFieldMap();

    }

    game.showFieldMap = function()
    {
        //创建场景，请注意添加的顺序，下层的先加
        game.stage.removeAllChildren();
        //背景
        if(null == game.fieldMap){
            var background = new Q.Bitmap({id:"field", image:game.getImage("bg")});
            background.x = 0;
            background.y = 0;
            game.fieldMap = background;
        }
        game.stage.addChild(game.fieldMap);

        //建筑
        game.setBuildings();

        //世界地图按钮
        if(null == game.worldMapBtn){
            var worldMapBtn = new Q.Button({id:"worldMapBtn", image:game.getImage('buttons'), x:50, y:50, width:64, height:64,
                up:{rect:[0,0,64,64]},
                over:{rect:[64,0,64,64]},
                down:{rect:[128,0,64,64]},
                disabled:{rect:[192,0,64,64]}
            });
            worldMapBtn.addEventListener(game.events[0], game.showWorldMap);
            game.worldMapBtn = worldMapBtn;
        }
        game.stage.addChild(game.worldMapBtn);

    }

    game.showWorldMap = function(e)
    {
        trace('switch to world map');
        //清楚场景
        game.stage.removeAllChildren();
        //世界地图背景
        if(null == game.worldMap){
            var background = new Q.Bitmap({id:"worldMap", image:game.getImage("worldMap")});
            background.x = 0;
            background.y = 0;
            game.worldMap = background;
        }
        game.stage.addChild(game.worldMap);

        //切换回生产场景按钮
        if(null == game.filedMapBtn){
            var filedMapBtn = new Q.Button({id:"filedMapBtn", image:game.getImage('buttons'), x:50, y:50, width:64, height:64,
                up:{rect:[0,0,64,64]},
                over:{rect:[64,0,64,64]},
                down:{rect:[128,0,64,64]},
                disabled:{rect:[192,0,64,64]}
            });
            filedMapBtn.addEventListener(game.events[0], game.showFieldMap);
            game.filedMapBtn = filedMapBtn;
        }
        game.stage.addChild(game.filedMapBtn);
    }

    //创建建筑群
    game.setBuildings = function()
    {
        if(0 == this.initFlag){
            for(var i = 0; i < this.buildingNum; i++)
            {
                var id = "building" + i;
                var bd = new game.Building({id:id, x:this.buildingPositions[i].x, y:this.buildingPositions[i].y, autoSize:true});

                this.stage.addChild(bd);
                bd.addEventListener(this.events[0], this.showBuildingMenu);
                this.buildings[id] = bd;
            }
            this.initFlag = 1;
        }else{
            for(var id in this.buildings)
            {
                var bd = this.buildings[id];
                this.stage.addChild(bd);
            }
        }
    }

    game.showBuildingMenu = function(e){
        trace(e.toElement.id);
        if(game.Building.STATE.EMPTY == e.eventTarget.state){
            //打开建造菜单
            if(null == game.menu1){
                game.menu1 = document.getElementById('menu1');
            }
            game.menu1.style.display = 'block';
            //将id赋值到class属性
            game.menu1.className = e.eventTarget.id;
        }else{
            //打开升级与造兵菜单
        }

    }

    game.buildHouse = function(buildingId,type){
        trace(buildingId,type);
        this.closeMenu('menu1');
        if(this.resources >= game.Building.COST[type]){
            this.resources -= game.Building.COST[type];
            this.buildings[buildingId].startBuild(type);
        }else{
        this.showWarning("您的资源不够！");
        }
    }

    //更新总资源
    game.updateResources = function()
    {
        if(this.resourcesNum == null)
        {
            var container = new Q.DisplayObjectContainer({id:'resourcesNum', width:200, height:65});
            var num0 = new ns.Num({id:"num0", type:ns.Num.Type.num2});
            var num1 = new ns.Num({id:"num1", type:ns.Num.Type.num2});
            var num2 = new ns.Num({id:"num2", type:ns.Num.Type.num2});
            var num3 = new ns.Num({id:"num3", type:ns.Num.Type.num2});
            num1.x = 50;
            num2.x = 100;
            num3.x = 150;
            container.addChild(num0, num1, num2, num3);
            container.scaleX = container.scaleY = 0.8;
            container.x = this.width - container.getCurrentWidth() - 15 >> 0;
            container.y = 15;
            this.resourcesNum = container;
        }
        this.stage.addChild(this.resourcesNum);

        this.resources += 1;

        var str = this.resources.toString(), len = str.length;
        str = len > 4 ? str.slice(len - 4) : str;
        while(str.length < 4) str = "0" + str;
        for(var i = 0; i < str.length; i++)
        {
            this.resourcesNum.getChildAt(i).setValue(Number(str[i]));
        }
    }

    //主更新方法
    game.update = function(timeInfo)
    {
        this.frames++;
        this.totalTime += timeInfo.deltaTime;
        if(this.totalTime > 1000){
            this.updateResources();
            this.totalTime = 0;
        }
    }


//隐藏浏览器顶部导航
    game.hideNavBar = function()
    {
        window.scrollTo(0, 1);
    }

    game.closeMenu = function(str){
        var menu = Q.getDOM(str);
        menu.style.display = 'none';
    }

    game.showWarning = function(str){
        alert(str);
    }

//重新计算舞台stage在页面中的偏移
    game.calcStagePosition = function()
    {
        if(game.stage)
        {
            var offset = Q.getElementOffset(game.stage.context.canvas);
            game.stage.stageX = offset.left;
            game.stage.stageY = offset.top;
        }
    }
})();
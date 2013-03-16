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
            {id:"empty", size:11, src:"images/b0.png"},
            {id:"house", size:36, src:"images/b6.png"},
            {id:"warHouse", size:58, src:"images/b42.png"}
        ],
        container : null,
        timer : null,
        stage : null,
        width : 980,
        height : 545,
        fps : 40,
        building : null,
        em : null
    };

    var ns = window.game = game;

    game.init = function()
    {
        //初始化游戏场景容器，设定背景渐变样式
        var container = Q.getDOM("container");
        /*container = Q.getDOM("container");
        container.style.overflow = "hidden";
        container.style.background = "-moz-linear-gradient(top, #00889d, #94d7e1, #58B000)";
        container.style.background = "-webkit-gradient(linear, 0 0, 0 bottom, from(#00889d), to(#58B000), color-stop(0.5,#94d7e1))";
        container.style.background = "-o-linear-gradient(top, #00889d, #94d7e1, #58B000)";
        container.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00889d, endColorstr=#94d7e1)";*/

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

        /*//初始化渲染上下文，这里根据URL参数可选择是采用CanvasContext还是DOMContext
        var params = Q.getUrlParams();
        if(params.canvas)
        {
            var canvas = Quark.createDOM("canvas", {width:game.width, height:game.height, style:{position:"absolute",backgroundColor:"#eee"}});
            container.appendChild(canvas);
            context = new Quark.CanvasContext({canvas:canvas});
        }else
        {
            context = new Q.DOMContext({canvas:container});
        }

        //初始化舞台
        game.stage = new Q.Stage({context:context, width:game.width, height:game.height,
            update:function()
            {
                frames++;
            }});

        //初始化timer并启动
        game.timer = new Q.Timer(1000/game.fps);
        game.timer.addListener(game.stage);
        game.timer.start();

        //注册舞台事件，使舞台上的元素能接收交互事件
        game.em = new Q.EventManager();
        var events = Q.supportTouch ? ["touchend"] : ["mouseup"];
        game.em.registerStage(game.stage, events, true, true);

        //创建厂房，并添加到舞台
        //game.building = new Building({id:"building", x:200, y:160, autoSize:true});
        //game.stage.addChild(game.building);


        //game.building.addEventListener(events[0], game.building.setup);*/

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

    }


//隐藏浏览器顶部导航
    game.hideNavBar = function()
    {
        window.scrollTo(0, 1);
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
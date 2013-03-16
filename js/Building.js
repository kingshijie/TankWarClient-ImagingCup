(function(){
var Building = game.Building = function(props)
{
    Building.superClass.constructor.call(this, props);
    this.init();
};
Q.inherit(Building, Q.DisplayObjectContainer);

var STATE =
{
    BUILDING : -1,
    EMPTY : 0,
    LEVEL1 : 1
}
Building.prototype.init = function()
{
    //松鼠的头部，是一个MovieClip类型。
    this.avatar = new Q.MovieClip({id:"avatar", image:game.getImage("empty"), useFrames:true, interval:2, x:5, y:0});
    this.avatar.addFrame([
        {rect:[0,0,165,134]}
    ]);

    //由头部和身体组成了一只松鼠。
    this.addChild(this.avatar);

    //初始化数据。
    //是否接受事件
    this.eventChildren = false;
    this.state = STATE.EMPTY;
};

//控制松鼠的跳跃
Building.prototype.setup = function(e)
{
    if(this.state == STATE.EMPTY)
        trace("building..");
};

//松鼠的更新函数，此方法会不断的被quark系统调用而产生跳跃动画。
Building.prototype.update = function()
{

};

})();
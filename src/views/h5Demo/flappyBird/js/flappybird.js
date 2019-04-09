
window.onload = function(){
	//new的顺序决定了哪个图在上层
	//点击让小鸟跳跃
	canvas.addEventListener('touchstart',taptap);
	document.onkeydown = function(e){//问题：键盘事件好像只能绑定在document上？
		if(e.keyCode===32&&canTap){
			taptap();
		}
	}
	//restart按钮
	rsBtn.onclick =function(){
		restart();
	};
};
;(function(window){
	function Flapybird(option){
		this.opt = this.extend({
			dom:'J_dotLine',//画布id
			cw:1000,//画布宽
			ch:500,//画布高
			ds:100,//点的个数
			r:0.5,//圆点半径
			cl:'#000',//颜色
			dis:100//触发连线的距离
		},option);
	}
	//合并配置项，es6直接使用obj.assign();
	Flapybird.prototype.extend = function(o,e){
		for(var key in e){
			if(e[key]){
				o[key]=e[key]
			}
		}
		return o;
	};
	//首先建一块画布
	var screenWidth = document.body.clientWidth;//宽高要设置一个最大值，避免非常规窗口搞乱了布局
	var screenHeight = document.body.clientHeight;
	var canvas = document.getElementById('J_flappybird');//canvas对象

	//让画布全屏
	canvas.width = screenWidth;
	canvas.height = screenHeight;
	var ctx = canvas.getContext('2d');//上下文对象

	//requestAnimationFrame控制canvas动画
	var RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
	            window.setTimeout(callback, 1000 / 60);
	};
	//全局变量
	var scales = 512/screenHeight;//等比例or  288/screenWidth
	var gameover = false;//全局变量，判断游戏是否结束
	var animate = '';//存放requestAnimationFrame的id，用于关闭动画
	var negate = [1, -1, 0];//设置管道上下间隔位移,方向随机用到的数组
	var direction = negate[Math.floor(Math.random() * negate.length)];//设置方向随机
	var canScore = false;//是否开始计分
	var birdScore = 0;//得分
	var bestScore = 0;//最高得分
	var isStarted = false;//是否开始
	var canTap = true;//能不能点击
	var rsBtn = document.getElementById('u-restart'); //restart按钮
	var imgAtlas = new Image();//游戏所用雪碧图
		imgAtlas.src =  '/h5static/flappyBird/img/atlas.png';
		imgAtlas.onload = init;
	var sky = null,
		land = null,
		pipe1 = null,
		pipe2 = null,
		pipe3 = null,
		bird = null,
		blank = null,
		start = null;

	//画天空类
	var Sky = function(img,ctx,initX,speed,count){
		var _self = this;
		this.img = img;
		this.ctx = ctx;//总画布
		this.speed = speed;//地面移动速度
		this.x = initX;//起始位置
		this.count = count;
	};
	Sky.prototype.draw = function(){
		for(var i =0;i<this.count;i++){
			this.ctx.drawImage(this.img, 0, 0, 288, 512, this.x+screenWidth*i, 0, screenWidth, screenHeight);
		}
	};
	Sky.prototype.update = function(){
		this.x -=this.speed;
		if(this.x <-screenWidth){//宽度写活
			this.x = 0;
		}
		this.draw();
	};
	//画地面类
	var Land = function(img,ctx,initX,speed,count){
		var _self = this;
		this.img = img;
		this.ctx = ctx;//总画布
		this.speed = speed;//地面移动速度
		this.x = initX;//起始位置
		this.count = count;
	};
	Land.prototype.draw = function(){
		for(var i =0;i<this.count;i++){
			this.ctx.drawImage(this.img, 584, 0, 336, 112, this.x+(335/scales)*i, screenHeight-112/scales, 336/scales, 112/scales);
		}
	};
	Land.prototype.update = function(){
		this.x -=this.speed;
		if(this.x <-336/scales){
			this.x = 0;
		}
		this.draw();
	};
	//画水管类
	var Pipe = function(img,ctx,initX,speed, gap, initY){
		var _self = this;
		this.img = img;
		this.ctx = ctx;//总画布
		this.speed = speed;//地面移动速度
		this.x = initX;//起始位置X轴
		this.y = initY;//起始位置Y轴,前几个管道初始值要设置下
		this.gap = gap;
		this.pipeTop = ((screenHeight-112/scales)-this.gap)/2+this.y;
		this.pipeBottom = (screenHeight-112/scales)-(((screenHeight-112/scales)-this.gap)/2-this.y);
	};
	Pipe.prototype.draw = function(){
		var skyH = screenHeight-112/scales;//管道占用的高度不算land,

		this.ctx.drawImage(this.img, 112, 966, 52, -scales*((skyH-this.gap)/2+this.y),this.x,0,screenWidth*0.2,(skyH-this.gap)/2+this.y);
		this.ctx.drawImage(this.img, 168, 646, 52, scales*((skyH-this.gap)/2-this.y),this.x,skyH-((skyH-this.gap)/2-this.y),screenWidth*0.2,(skyH-this.gap)/2-this.y);
	};
	Pipe.prototype.update = function(){
		this.x -=this.speed;
		if(this.x <-(screenWidth*0.7)){//宽度写活
			this.x = screenWidth*1.7;
			this.y = parseInt(Math.random()*400-200)+56;//当管道回到初始值，同时修改上下开口的位置
			this.pipeTop = ((screenHeight-112/scales)-this.gap)/2+this.y;
			this.pipeBottom = (screenHeight-112/scales)-(((screenHeight-112/scales)-this.gap)/2-this.y);
		}
		this.draw();
	};
	//画小鸟类
	var Bird = function(img,ctx,rate,initY){
		var _self = this;
		this.img = img;
		this.ctx = ctx;
		this.wing = 0;//小鸟煽动翅膀计时
		this.rate = rate;//翅膀扑腾临界值，理解为速度,越小越快
		this.upSpeed = 0;//小鸟跳跃初始速度值，用于控制鸟跳跃
		this.grav = 0;//垂直下落的速度，重力加速度，初始为0 ;
		this.x = (screenWidth/2)-(34/scales/2);//小鸟初始水平位置
		this.y = initY;//小鸟初始垂直位置
	};
	Bird.prototype.draw = function(index){
		this.ctx.save();
		this.ctx.translate(this.x+17/scales, this.y+12/scales);//修改canvas的原点到鸟的中心
		this.ctx.rotate(-(Math.PI/6)*this.upSpeed/8);//圆周率*值=角度大小
		this.ctx.translate(-(this.x+17/scales), -(this.y+12/scales));//修改canvas的原点回到最初
		switch(index){
			case 0:this.ctx.drawImage(this.img, 6, 982, 34, 24, this.x, this.y, 34/scales, 24/scales);
				break;
			case 1:this.ctx.drawImage(this.img, 62, 982, 34, 24, this.x, this.y, 34/scales, 24/scales);
				break;
			case 2:this.ctx.drawImage(this.img, 118, 982, 34, 24, this.x, this.y, 34/scales, 24/scales);
				break;
		}
		this.ctx.restore();
	};
	Bird.prototype.fly = function(speed){
		this.wing -=0.1;
		if(this.wing>-this.rate){
			this.draw(0);
		}else if(this.wing>-this.rate*2){
			this.draw(1);
		}else{
			this.draw(2);
			this.wing = 0;
		}
		//小鸟垂直运动
		if(speed&&speed>0){
			this.upSpeed = speed;
		}
		
		if(this.upSpeed){
			this.y -= this.upSpeed*4;//控制弹一次的跨度，越大跳越高
			this.upSpeed -=0.2;//速度衰减速度     
		}else{
			this.y += this.grav*1.2;
		}
		this.draw();
	};
	//画记分牌
	var Blank = function(img, ctx){
		this.img = img;
		this.ctx = ctx;
		this.medal = [
			{x:224,y:906},//iron
			{x:224,y:954},//copper
			{x:242,y:516},//silver
			{x:242,y:564}//gold
		];
	};
	Blank.prototype.draw = function(score, bestscore, cb){
		//GAMEOVER
		this.ctx.drawImage(this.img, 790, 118, 192, 42, (screenWidth-192/scales)/2,screenHeight/2-120/scales,192/scales, 42/scales);
		//大背景
		this.ctx.drawImage(this.img, 6, 518, 226, 114, (screenWidth-226/scales)/2,(screenHeight-114/scales)/2,226/scales, 114/scales);
		//分数区域显示不同奖牌
		if(score<20){
			this.ctx.drawImage(this.img, this.medal[0].x, this.medal[0].y, 44, 44, (screenWidth-226/scales)/2+25/scales,(screenHeight-114/scales)/2+43/scales,44/scales, 44/scales);
		}
		for(var i=1;i<5;i++){
			if(score>=Math.pow(2,i)*10){
				this.ctx.drawImage(this.img, this.medal[i-1].x, this.medal[i-1].y, 44, 44, (screenWidth-226/scales)/2+25/scales,(screenHeight-114/scales)/2+43/scales,44/scales, 44/scales);
			}
		}
		//新纪录增加图标
		if(birdScore==bestScore){
			this.ctx.drawImage(this.img, 224, 1002, 32, 14, (screenWidth-226/scales)/2+130/scales,(screenHeight-114/scales)/2+58/scales,32/scales, 14/scales);
		}
		//显示restart按钮,修改样式
		rsBtn.style.display='block';
		rsBtn.style.width= 104/scales/2 +'px';
		rsBtn.style.height= 58/scales/2 +'px';
		rsBtn.style.backgroundPosition= (-708/scales/2)+'px '+(-236/scales/2)+'px';
		rsBtn.style.backgroundSize= 1024/scales/2+'px';
		rsBtn.style.top=(screenHeight+114/scales)/2+20+'px';
		rsBtn.style.left=(screenWidth-58/scales)/2+'px';
	    cb();
	};
	//游戏初始提示图片
	var Start = function(img, ctx){
		this.img = img;
		this.ctx = ctx;
	};
	Start.prototype.draw = function(){
		this.ctx.drawImage(this.img, 590, 118, 184, 50, (screenWidth-184/scales)/2, (screenHeight-220/scales)/2, 184/scales, 50/scales);
		this.ctx.drawImage(this.img, 584, 182, 114, 98, (screenWidth-114/scales)/2, (screenHeight-98/scales)/2, 114/scales, 98/scales);
	};
	//拼接数字图片
	/**
	 *思路：数字改为数组，数组长度决定数字位数，遍历drawImage();
	**/
	var ImgNum = function(img, ctx){
		this.num = "0";//字符串0
		this.arr = this.num.split();
		this.img = img;
		this.ctx = ctx;
		this.numXY = [
			{x:276,y:646},//0
			{x:276,y:664},//1
			{x:276,y:698},//2
			{x:276,y:716},//3
			{x:276,y:750},//4
			{x:276,y:768},//5
			{x:276,y:802},//6
			{x:276,y:820},//7
			{x:276,y:854},//8
			{x:276,y:872}//9
		];
	}
	ImgNum.prototype.draw=function(val, initX, initY){//分数值，画图位置
		var initX = initX?initX:screenWidth-14/scales,
			initY = initY?initY:8;
		this.num = val?String(val):"0";
		this.arr = this.num.split("").reverse();//从右往左排图；
		for(var i=0;i<this.arr.length;i++){
			for(var j=0;j<10;j++){
				if(this.arr[i]==j){//字符串和数字作比较
					this.ctx.drawImage(this.img, this.numXY[j].x, this.numXY[j].y, 12, 14, initX-(14/scales)*i, initY, 12/scales, 14/scales);
				}
			}
		}
	};
	ImgNum.prototype.update = function(val){
		this.draw(val);
	};
	//游戏初始化
	function init(){
		//画开始画面
		sky=new Sky(imgAtlas,ctx,0,2,2);
		land=new Land(imgAtlas,ctx,0,5,4);
		pipe1 = new Pipe(imgAtlas,ctx,screenWidth,2, 300, parseInt(Math.random()*400-200)+56);
		pipe2 = new Pipe(imgAtlas,ctx,screenWidth*1.8,2, 300, parseInt(Math.random()*400-200)+56);
		pipe3 = new Pipe(imgAtlas,ctx,screenWidth*2.6,2, 300, parseInt(Math.random()*400-200)+56);
		bird = new Bird(imgAtlas,ctx,0.8,(screenHeight-98/scales)/2);
		blank = new Blank(imgAtlas,ctx);//记分牌
		start = new Start(imgAtlas,ctx);//初始化
		imgNum = new ImgNum(imgAtlas,ctx);//计分数字
		J_hit = document.getElementById('J_hit');//撞击音效
		J_point = document.getElementById('J_point');//得分音效
		J_wing = document.getElementById('J_wing');//扇翅膀音效
		J_swooshing = document.getElementById('J_swooshing');//点击上跳音效
		//imgAtlas.onload = run;//图片加载完开始动画
		run();
	};
	//主动画函数
	function run(){
		var pipes = [pipe1, pipe2, pipe3];
		pipes.forEach(function(item, index){//遍历进入画面的水管开始规则校验
			if((item.x+(screenWidth*0.2))>bird.x&&item.x<screenWidth){
				isGameover(bird, item);
			}
			//计分
			if(item.x<(bird.x+34/scales)&&(item.x+(screenWidth*0.2))>bird.x){
				canScore = true;
			}
			if(bird.x>(item.x+(screenWidth*0.2))&&item.x>0&&canScore){
				canScore = false;
				birdScore++;
				//playAudio(J_point, '/h5static/flappyBird/sounds/point.mp3');
				console.log(birdScore);
			};
		});

		if(gameover){
			//移除点击事件(匿名函数不可移除)
			canvas.removeEventListener('touchstart',taptap);
			setTimeout(function(){
				if(birdScore>bestScore){
					bestScore=birdScore
				}
				blank.draw(birdScore, bestScore, function(){
					imgNum.draw(birdScore,(screenWidth-226/scales)/2+192/scales,(screenHeight-114/scales)/2+32/scales);
					imgNum.draw(bestScore,(screenWidth-226/scales)/2+192/scales,(screenHeight-114/scales)/2+74/scales);
				});
			},100);
			canTap = false;//放在gameover函数里不行，因为AnimationFrame还在继续
			cancelAnimationFrame(animate);//停止动画
			return;
		}
		//判断游戏是否开始
		if(!isStarted){
			//画天空
			sky.update();
			//画地面
			land.update();
			//开始的图片
			start.draw();
		}else{
			//画天空
			sky.update();
			//画地面
			land.update();
			//画水管
			pipe1.update();
			pipe2.update();
			pipe3.update();
			//画鸟
			bird.fly();
			//测试计分显示
			if(birdScore>bestScore){//刷新最高分
				bestScore = birdScore;
			}
			imgNum.update(bestScore);
		}
		//动画执行
		animate = RAF(run);//获取动画RAF的id
	};
	//规则判断
	/**
	 *思路：轮廓检测，碰到管子挂，飞出画面挂，碰到地面挂，像素检测请移步https://www.cnblogs.com/elcarim5efil/p/4684605.html
	**/
	function isGameover(obj1,obj2){//小鸟坐标和死亡区域坐标
		if(((obj1.x+34/scales)>obj2.x)&&(obj1.x<(obj2.x+screenWidth*0.2))&&(obj1.y<obj2.pipeTop||(obj1.y+24/scales)>obj2.pipeBottom)){
			gameover = true;
		}else if(obj1.y<0||(obj1.y+24/scales)>(screenHeight-112/scales)){
			gameover = true;
		}
	};
	//重新开始
	function restart(){
		if(birdScore>bestScore){//刷新最高分
			bestScore = birdScore;
		}
		rsBtn.style.display='none';//restart按钮隐藏
		cancelAnimationFrame(animate);//停止动画
		canScore = false;
		birdScore = 0;
		gameover = false;//游戏未结束
		isStarted = false;//游戏未开始
		canTap = true;
		canvas.addEventListener('touchstart',taptap);//重新绑定上触摸事件
		init();
	};
	//点击开跳函数
	function taptap(){
		isStarted = true;
		bird.fly(4);
	};
}(window));
//调用
window.onload = function(){
	var flapybird = new Flapybird({
		
	});
}
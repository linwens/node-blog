var express = require('express'); 
var router = express.Router(); 
var wechat = require('wechat');//引入微信模块
var config = require('./config');//配置参数

router.use(express.query());
//
router.use('/',wechat(config, function(req, res, next){
	// 微信输入信息都在req.weixin上 
	var wcMsg = req.weixin;
	//关注公众号时回复
	if(wcMsg.Event ==='subscribe'){
		res.reply('感谢你的关注~~');
	};
	//自动回复文字消息模板
	if(wcMsg.MsgType==='text'){
		switch(wcMsg.Content){
			case 'flappyBird': res.reply([
  						{
						    title: 'JS版flappyBird',
						    description: '这个游戏是用js写的',
						    picurl: 'https://www.shy-u.xyz/h5static/flappyBird/img/data/intro.jpg',
						    url: 'https://www.shy-u.xyz/h5Demo/flappyBird'
  						}
					]);
				break;
			default: res.reply('hi~,发送[flappyBird]可以玩flappyBird小游戏');
		}
	}
}));

module.exports = router;

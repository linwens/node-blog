import express from 'express'
import wechat from 'wechat'//引入微信模块
import config from './config'//配置参数

const router = express.Router();

router.use(express.query());
router.use('/',wechat(config, (req, res, next)=>{
	// 微信输入信息都在req.weixin上 
	let wcMsg = req.weixin;
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

export default router;

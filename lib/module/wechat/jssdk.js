/*
 *这个模块用于给用户发送模板消息，个人订阅号无此权限
**/
var WechatAPI = require('wechat-api');//WeChatapi封装模块
var config = require('./config');//配置参数
var jsApiList = require('./jsApiList');//js接口权限

var api = new WechatAPI(config.appid, config.appsecret);

exports.wcjsSDK = function(opt, cb){
	console.log(opt);
	var param = {
		debug: false,// 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		jsApiList:jsApiList.list,
		url: opt.url
	};
	//在获取wxConfig所需要的参数
	api.getJsConfig(param, function(err, rslt){
		console.log('config已发出');
		cb(err, rslt);
	})
}
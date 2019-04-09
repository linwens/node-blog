/*
 *这个模块用于获取用户openid
**/
var wechat = require('wechat');//引入微信模块 
var WechatAPI = require('wechat-api');//WeChatapi封装模块
var config = require('./config');//配置参数
var api = new WechatAPI(config.appid, config.appsecret);
var request = require('request');

module.exports = function(code,cb){
	console.log('code===='+code);
	request({
		url:'https://api.weixin.qq.com/sns/oauth2/access_token',
		qs:{
			appid:config.appid,
			secret:config.appsecret,
			code:code,
			grant_type:'authorization_code'
		}
	},function(err,res){
		cb(err,res);
	})
}
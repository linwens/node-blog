/*
 *这个模块用于给用户发送模板消息，个人订阅号无此权限
**/
var WechatAPI = require('wechat-api');//WeChatapi封装模块
var config = require('./config');//配置参数
var api = new WechatAPI(config.appid, config.appsecret);

exports.wcNotice = function(opt, cb){
    //发送模板消息
    var templateId = opt.templateId;
    var openID = opt.openid;//用户唯一openid
    // URL置空，则在发送后,点击模板消息会进入一个空白页面（ios）, 或无法点击（android）
    var url = opt.redUrl;
    var data = {
        "first": {
            "value": opt.data.first,
            "color":"#173177"
        },
        "keyword1":{
            "value": opt.data.keyword1,
            "color":"#173177"
        },
        "keyword2": {
            "value": opt.data.keyword2,
            "color":"#173177"
        },
        "keyword3": {
            "value": opt.data.keyword3,
            "color":"#173177"
        },
        "keyword4": {
            "value": opt.data.keyword4,
            "color":"#173177"
        },
        "remark":{
            "value": opt.data.remark,
            "color":"#173177"
        }
    };
        
    //发送消息
    api.sendTemplate(openID, templateId, url, data, function(err, rslt, next){
        console.log('消息已发出');
        cb(err, rslt);
    });
};

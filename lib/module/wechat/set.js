/*
 *这个模块用于公众号的常规设置
**/
var wechat = require('wechat');//引入微信模块 
var WechatAPI = require('wechat-api');//WeChatapi封装模块
var config = require('./config');//配置参数
// var menus = require('./menus.json');//菜单json
var wcNotice = require('./sendMsg').wcNotice;//发送模板通知模块
var api = new WechatAPI(config.appid, config.appsecret);
//要存储的必要信息
var wc_info={
	templateId:''  //模板消息ID
}
//生成自定义菜单
api.createMenu({
    "button":[
        { 
            "type":"click",
            "name":"今日推荐",
            "key":"today_recommend"
        },
        { 
            "name":"小工具",
            "sub_button":[{
                "type": "scancode_waitmsg", 
                "name": "扫一扫",
                "key": "scancode"
            },{
                "type": "pic_sysphoto", 
                "name": "系统拍照发图",
                "key": "take_photo"
            },{
                "type": "location_select", 
                "name": "发送位置",
                "key": "send_location"
            }]
        }
    ]
},function(err, rslt, next){
	if(err){
		console.log(err);
	}else{
		console.log(rslt);
	}
});
//设置所属行业(不可频繁调用，一月一次修改)
var industryIds = {
    "industry_id1":'6',
    "industry_id2":'39'
}
api.setIndustry(industryIds,function(err, rslt, next){
    console.log('设置所属行业回调');
    if(err){
        console.log(err);
    }else{
        console.log(rslt);
    }
});
module.exports = function(type, cb){//type：微信模板库中模板的编号(Number)
	//获取已添加至帐号下所有模板列表(测试账号走这个测试)
	api.getAllPrivateTemplate(function(err, rslt, next){
	    console.log('获取模板列表');
	    if(err){
	        console.log(err);
	    }else{
	        console.log(rslt);
	        var key = type-1;
	        wc_info.templateId = rslt.template_list[key].template_id;
	        cb(wc_info);
	    }
	});
	//正式环境根据模板编号获取模板ID
	/*
	var templateIdShort = '';//微信模板库中模板的编号
	api.addTemplate(templateIdShort, function(err, rslt, next){
	    console.log('获取模板id');
	    if(err){
	        console.log(err);
	    }else{
	        console.log(rslt);
	        wc_info.templateId = rslt.template_id;
	    }
	});
	*/
};



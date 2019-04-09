import {Html5} from './mongoose';
import uuid from 'node-uuid';
//作品发布
exports.subH5 = function(req, res, next){
	var html5 = new Html5({
	    time: Math.round(Date.parse(new Date())/1000),
	    name: req.body.name,
	    desc: req.body.desc,
	    hid:uuid.v1()
	});
	//判断是修改还是新加
	if(req.body.option&&req.body.option=='modify'){
		Html5.update({hid:req.body.hid}, {name: req.body.name,desc:req.body.desc})
		.then((data)=>{
			res.json({
			    res_code:1,
			    res_msg:'作品修改成功'
			})
		})
		.catch((err)=>{
			console.log(err);
		});
	}else{
		html5.save()
		.then((data)=>{
			res.json({
			    res_code:1,
			    res_msg:'作品保存成功'
			})
		})
		.catch((err)=>{
			console.log(err);
		});
	}
};
//作品删除
exports.RemoveH5 = function(req, res, next){
	Html5.remove({hid:req.body.hid})
	.then((data)=>{
		if(data&&data!=''){
			res.json({
			    res_code:1,
			    res_msg:'作品删除成功'
			})
		}else{
			res.json({
				res_code:2,
				res_msg:'作品不存在'
			})
		}
	})
	.catch((err)=>{
		console.log(err);
		res.json({
			res_code:4,
			res_msg:'作品删除出错'
		})
	});
};
//作品列表获取
exports.Geth5list = function(req, res, next){
	//查询条件
	var schWord = req.query.schWord?req.query.schWord:null,
		curPage = req.query.curPage?parseInt(req.query.curPage):1,
		pageSize = req.query.pageSize?parseInt(req.query.pageSize):5,
		findParams = {};//筛选
	if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
		var schRegExp = new RegExp(schWord,"i");
		findParams = {"$or":[{'name':schRegExp}, {'desc':schRegExp}]};
	}
	Html5.count(findParams)
	.then((total)=>{
		Html5.find(findParams)
		.skip((curPage-1)*pageSize)
		.limit(pageSize)
		.sort({time:-1})
		.then((data)=>{
			if(data&&data!=''){
				res.json({
				    res_code:1,
				    dataList:data,
				    page:curPage,
				    page_size:pageSize,
				    total:total
				});
			}else{
				res.json({
					res_code:2,
					dataList:data,
				    page:curPage,
				    page_size:pageSize,
				    total:total,
					res_msg:'暂无相关作品'
				});
			}
		})
		.catch((err)=>{
			console.log(err);
			res.json({
	            res_code:4,
	            res_msg:'h5列表数据出错'
	        })
		});
	})
	.catch((err)=>{
		console.log(err);
		res.json({
			res_code:4,
			res_msg:'获取总条数出错'
		})
	});
};
//作品详情获取
exports.GetH5 = function(req, res, next){
	Html5.find({hid:req.query.hid})
	.then((data)=>{
		if(data&&data!=''){
			res.json({
			    res_code:1,
			    H5Detail:{
			        name:data[0].name,
			        time:data[0].time,
			        desc:data[0].desc?data[0].desc:'获取的作品暂无描述'
			    }
			})
		}else{
			res.json({
				res_code:2,
				res_msg:'作品不存在'
			})
		}
	})
	.catch((err)=>{
		console.log(err);
        res.json({
        	res_code:4,
        	res_msg:'获取作品详情错误'
        })
	});
};
import {Articles} from './mongoose';
import marked from 'marked';
import uuid from 'node-uuid';

marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,//原始输出，true:忽略HTML标签,即保留HTML标签不解析；
	smartLists: true,
	smartypants: false,
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	}
});
//文章发布
export const Subarticle = (req, res, next)=>{
	var tags = [];
	for(var key in JSON.parse(req.body.tags)){
	    tags.push(JSON.parse(req.body.tags)[key])
	}
	var articles = new Articles({
	    time: Math.round(Date.parse(new Date())/1000),
	    title: req.body.title,
	    text:req.body.text,
	    tags:tags,//req.body.tags?Object.values(req.body.tags):[]//遍历对象生成数组
	    aid:uuid.v1(),
	    brief:req.body.brief,
	    operate:req.body.operate,
	    pv:0
	});
	//判断是修改还是新加
	if(req.body.option&&req.body.option=='modify'){//文章修改返回原markdown
		let params = {
			title: req.body.title,
			text: req.body.text,
			brief: req.body.brief,
			tags:tags,
			operate:req.body.operate
		};
		Articles.update({aid:req.body.aid}, params)
		.then((data)=>{
			console.log('Updated:', data);
			if(req.body.operate==='save'){
				res.json({
				    res_code:1,
				    res_msg:'文章修改成功未发布'
				})
			}else{
				res.json({
				    res_code:1,
				    res_msg:'文章修改成功并发布'
				})
			}
		})
		.catch((err)=>{
			console.log('Articles.update-----error');
			console.log(err);
		});
	}else{
		articles.save()
		.then((data)=>{
			console.log('Saved:', data);
			if(req.body.operate==='save'){
				res.json({
				    res_code:1,
				    res_msg:'文章保存成功未发布'
				})
			}else{
				res.json({
				    res_code:1,
				    res_msg:'文章保存成功并发布'
				})
			}
		})
		.catch((err)=>{
			console.log('articles.save-----error');
			console.log(err);
		})
	}
}
//文章详情获取
export const Getarticle = (req, res, next)=>{
	console.log('query==getArticle=='+JSON.stringify(req.query));
	Articles.find({"$or":[{'time':req.query.time}, {'aid':req.query.aid}]})
	.then((data)=>{
		if(data&&data!=''){
			//data[0].text代表第一条，所以是针对具体id查询一篇文章
			console.log('find:',data);
			var artText = data[0].text?data[0].text:'获取文章了，但是没有正文';
			if(!(req.query.option&&req.query.option=='modify')){//文章修改返回原markdown
				artText = marked(artText)
			}
			res.json({
			    res_code:1,
			    articleDetail:{
			        title:data[0].title,
			        time:data[0].time,
			        tags:data[0].tags.length>0?data[0].tags:null,
			        text:artText,
			        brief:data[0].brief,
			        pv:data[0].pv+1
			    }
			})
			//更新阅读量---请修改！！！！！！！！！！！！！！！！！！！！！！
			Articles.update({aid:req.query.aid}, {$inc:{pv:1}})
			.catch((err)=>{
				console.log(err);
			});
		}else{
			return Promise.reject(2);
		}
	})
	.catch((err)=>{
		console.log('Articles.find-------error');
		console.log(err);
		switch(err){
			case 2:
				res.json({
					res_code:2,
					res_msg:'文章不存在'
				})
			break;
			default:
				res.json({
					res_code:4,
					res_msg:'获取文章详情错误'
				});
		}
	});
}
//文章列表获取
export const Getlist = (req, res, next)=>{
	console.log('query==getArticle=='+JSON.stringify(req.query));
	//查询条件
	var schWord = req.query.schWord?req.query.schWord:null,
		curPage = req.query.curPage?parseInt(req.query.curPage):1,
		pageSize = req.query.pageSize?parseInt(req.query.pageSize):5,
		from = req.query.from?req.query.from:null,
		findParams = {};//筛选
	if(from!=='front'){//前台网站展示文章只展示发布的
		if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
			var schRegExp = new RegExp(schWord,"i");
			findParams = {"$or":[{'title':schRegExp}, {'text':schRegExp}, {'brief':schRegExp}, {'tags':schRegExp}]};
		}
	}else{
		findParams = {operate:'publish'};
		if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
			var schRegExp = new RegExp(schWord,"i");
			findParams = {"$or":[{'title':schRegExp}, {'text':schRegExp}, {'brief':schRegExp}, {'tags':schRegExp}], operate:'publish'};
		}
	}
	Articles.countDocuments(findParams)
	.then((total)=>{
		Articles.find(findParams)
		.skip((curPage-1)*pageSize)
		.limit(pageSize)
		.sort({time:-1})
		.then((data)=>{
			if(data&&data!=''){
				let dataList = [];
				for(let i = 0;i<data.length;i++){
					let obj = {}
					obj.time = data[i].time;
					obj.aid = data[i].aid;
					obj.brief = data[i].brief?data[i].brief:'';
					obj.title = data[i].title;
					obj.tags = data[i].tags;
					obj.operate = data[i].operate;
					dataList.push(obj);
				}
				res.json({
				    res_code:1,
				    dataList:dataList,
				    page:curPage,
				    page_size:pageSize,
				    total:total
				})
			}else{
				return Promise.reject(2)
			}
		})
		.catch((err)=>{
			console.log('Articles.find-----err');
			console.log(err);
			switch(err){
				case 2:
					res.json({
						res_code:2,
						dataList:[],
					    page:curPage,
					    page_size:pageSize,
					    total:total,
						res_msg:'暂无相关文章'
					})
				break;
				default:
					res.json({
					    res_code:4,
					    res_msg:'文章列表数据出错'
					})
			}
		})
	})
	.catch((err)=>{
		console.log('Articles.count-----err');
		console.log(err);
		res.json({
		    res_code:4,
		    res_msg:'获取文章列表总条数出错'
		});
	})
}
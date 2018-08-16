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
	highlight: (code)=>{
		return require('highlight.js').highlightAuto(code).value;
	}
});
//文章发布
export const Subarticle = (req, res, next)=>{
	let tags = [];
	for(let key in JSON.parse(req.body.tags)){
	    tags.push(JSON.parse(req.body.tags)[key])
	}
	let articles = new Articles({
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
			console.log(err);
		});
	}else{
		articles.save()
		.then((data)=>{
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
			console.log(err);
		})
	}
}
//文章列表获取
export const Getlist = (req, res, next)=>{
	console.log('query==getArticle=='+JSON.stringify(req.query));
	//查询条件
	let schWord = req.query.schWord?req.query.schWord:null,
		curPage = req.query.curPage?parseInt(req.query.curPage):1,
		pageSize = req.query.pageSize?parseInt(req.query.pageSize):5,
		from = req.query.from?req.query.from:null,
		findParams = {};//筛选
	if(from!=='front'){//前台网站展示文章只展示发布的
		if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
			let schRegExp = new RegExp(schWord,"i");
			findParams = {"$or":[{'title':schRegExp}, {'text':schRegExp}, {'brief':schRegExp}, {'tags':schRegExp}]};
		}
	}else{
		findParams = {operate:'publish'};
		if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
			let schRegExp = new RegExp(schWord,"i");
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
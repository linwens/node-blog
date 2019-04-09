//基础配置文件
'use strict'
let mongoUrl = '';
if(process.env.NODE_ENV==='production'){
	//生成环境数据库，加密
	mongoUrl = 'mongodb://blogLinwens:lwsBlog123@localhost:28017/lwsBlog';
}else{
	//本地开发数据库
	mongoUrl = 'mongodb://localhost:27017/mongodbTest';
}
const obj = {
	PORT: process.env.NODE_ENV === 'production' ? 8888 : 3100, //本地开发用3100端口
	//本地开发数据库mongodbTest
	mongoUrl:mongoUrl
}
module.exports = obj
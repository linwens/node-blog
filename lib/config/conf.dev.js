Object.defineProperty(exports, "__esModule", {
	value: true
});
//基础配置文件
var mongoUrl = '';
if (process.env.NODE_ENV === 'production') {
	//生成环境数据库，加密
	mongoUrl = 'mongodb://username:password@localhost:port/dbname';
} else {
	//本地开发数据库
	mongoUrl = 'mongodb://localhost:27017/mongodbTest';
}

var obj = {
	PORT: process.env.NODE_ENV === 'production' ? 8888 : 3100, //本地开发用3000端口
	mongoUrl: mongoUrl
};
exports.default = obj;
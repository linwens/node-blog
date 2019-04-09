import express from 'express';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import db from './linkMongo';//链接数据库
import index from './routes/index';
import ajaxHandler from './routes/ajaxHandler';
import wechat from './module/wechat';//引入微信模块
import compression from 'compression'; //gzip压缩

let app = express();
app.use(compression());
//拼接新路径，将public和view文件夹跟服务代码的文件夹(lib/dist)独立开
let dPath = __dirname.split('\\');
	dPath.splice(-1, 1, "src");//把静态资源及页面放入src里
let newPath = dPath.join('\\');

// 设置模板引擎
app.set('views', path.join(newPath, 'views'));
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(newPath, 'public', 'carqi.ico')));
//日志打印
var errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), {flags: 'a'});
logger.format('prod', ':date[iso] [ERROR] :method :url :status :response-time ms -');
if(process.env.NODE_ENV==='production'){
  app.use(logger('prod', {
    skip: function (req, res) { return res.statusCode < 400 },//只打印错误日志
    stream: errorLogStream
  }));
}else{
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(newPath, 'public')));
app.use('/h5static', express.static(path.join(newPath, 'views/h5Demo')));//H5宣传页获取静态资源路径

//页面路由处理
app.use('/', index);
//请求处理
app.use('/ajax', ajaxHandler);
//微信请求处理
app.use('/wechat',wechat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

# 说明
  这是一个个人博客系统。服务端使用node，数据库使用mongodb，前端采用多页面的展现形式基于jquery和bootstrap。  
  本项目以学习自用为主，欢迎有兴趣的小伙伴吐槽或提issue；如有幸能被大牛看到，希望能得到些许指点，先在这里谢过啦...
# 功能
 * 使用html直接渲染，ejs文件存放公共模块插入页面，类似于freeMark  
 ```
   app.set('views', path.join(newPath, 'views'));
   app.engine('.html', require('ejs').renderFile);
   app.set('view engine', 'html');
 ```
 * morgan日志打印
 ```
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
 ```
 * 单元测试
   基于supertest和mocha进行了服务器及接口的测试
 * 基于babel 让express支持es6语法
   开发环境使用npm run dev启动，生产环境使用npm run prod启动。项目发布通过npm run build打包。
 ```
   "dev": "gulp",
   "build": "babel lib -d dist",
   "prod": "export NODE_ENV=production&&node dist/bin/www.js", //linux环境下使用export设置环境变量
 ```
 * 本地开发基于nodemon 实现热启动
   本地开发时，项目代码修改后，通过nodemon重新启动服务
 * gulp + browser-sync 实现静态资源打包及前端代码热更新
   基于nodemon启动服务，为了保证前端代码更新不会重启服务器，增加ignore选项
 ```
   ignore:['src/']  //忽略前端资源所在的文件夹内的文件变动
 ```
   实时编译js，less文件，压缩图片，并刷新页面。gulp-imagemin包建议cnpm安装。
 * 对接七牛存储
   直接根据七牛api写一遍即可，中间使用了multer把表单上传的数据转buffer
 ```
   import multer from 'multer';
   var storage = multer.memoryStorage();//使用内存存储引擎，将完整的文件数据转为buffer对象存入一个buffer字段
   var multerConf = multer({
     storage: storage,//设置上传的文件的存储位置
     limits:{
       fileSize:2097152 //2M
     },
     fileFilter:function(req, file, cb){//过滤文件，通过文件的mimetype判断是否是 jpg|png|jpeg 
       var type = '|' + file.mimetype.slice(file.mimetype.lastIndexOf('/') + 1) + '|';
       var fileTypeValid = '|jpg|png|jpeg|'.indexOf(type) !== -1;
       cb(null, !!fileTypeValid);//!!fileTypeValid为true，表示接收这个文件
     }
   }).single('imgFiles');//一次接受一个文件上传，同时设置上传的文件字段名，前端提交时设置的的文件字段名要与此处字段名一致
 ```
 * 基于mongoose 操作数据库mongodb
 	需要先安装mongoose,安装完成后开启数据库，然后只需在node里链接mongodb即可
 ```
   mongoose.connect('数据库访问地址');
 ```
 * 对接微信api ok
   实现很简单，主要工作都在微信公众号配置完成，node服务根据配置信息，实现与微信的对接。功能添加可使用wechat-api、wechat等现成的包。
 * 前端代码开发部署
   src/views/static/plugins存放外部插件，有改动的话直接复制到src/public/plugins;其他资源走热更新实时编译。

# 开发

	# 克隆项目
	git clone git@github.com:linwens/node-blog.git

	# 安装依赖
	npm install

	# 本地启动服务
	npm run dev, 基于babel,所以在本地开发后台代码的时候可以直接用es6。
	
	# 本地单元测试
	npm run test, 单元测试基于mocha

# 本地前端开发
 所有静态资源放在src/views/static/下，打包后将src/public/内的静态资源放入服务器。

# 开发环境部署
 gulp:开发过程中，gulp负责热更新；实时打包静态资源

# 发布
	# 云服务器初始化
	 1、先在自己服务器内新建文件夹，如myBlog，一般在home文件夹下。 
	 2、然后将本地package.json文件夹拖入myBlog
	 3、输入命令：npm install --production，只安装dependencies下的依赖
	# 项目打包
	npm run build, 打包是通过babel将lib文件夹生成dist文件夹，然后直接将dist文件夹拖到自己的服务器。 
	
	# 拖入文件
	 将dist文件和src文件拖入myBlog跟package.json同级。这里有个缺陷是src/static文件夹是多余的。

	# 生成环境启动
	npm run prod 或者 pm2 start npm -n 程序名称 -- run prod

# 参考链接
 https://github.com/babel/example-node-server  babel依赖  
 https://www.npmjs.com/package/morgan  morgan日志相关API  
 https://www.npmjs.com/package/wechat  WeChat相关API  
 https://developer.qiniu.com/kodo/sdk/1289/nodejs  七牛相关API  
 http://mongoosejs.com/docs/guide.html  mongoose API  
 https://www.npmjs.com/package/supertest  supertest单元测试 API  

# 相关链接
 与个人博客相配套做了一个后台管理系统，用于维护个人博客相关内容 
 https://github.com/linwens/vue-admin

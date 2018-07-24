# 参考链接
 https://github.com/babel/example-node-server
 https://www.npmjs.com/package/morgan

# 日记
 - 20180720
  - 修改bin/www文件为www.js，为了能让babel也打包

  - gulp-nodemon启动通过exec: 'babel-node',实现nodemon lib/bin/www.js --exec babel-node

  - gulp-imagemin压缩有问题，初步怀疑是gifsicle包的问题，

# 功能
 * 支持html直接渲染，也支持ejs ok
 * session控制请求允许的域名
 * morgan日志打印功能 ok
 * mocha单元测试
 * 基于babel 让express支持es6语法 ok
 * 基于nodemon 实现热启动 ok
 * gulp + browser-sync 实现静态资源打包及前端代码热更新 (未走通图片压缩)
 * 对接七牛存储
 * 基于mongoose 操作数据库mongodb ok
 * 对接微信api

# 开发

	# 克隆项目
	//////////////////////////////////////

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

	# 项目打包
	npm run build, 打包是通过babel将lib文件夹生成dist文件夹，然后直接将dist文件夹拖到自己的服务器。

	# 生成环境启动
	npm run prod

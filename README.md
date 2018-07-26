# 参考链接
 https://github.com/babel/example-node-server  babel依赖
 https://www.npmjs.com/package/morgan  morgan日志相关API
 https://www.npmjs.com/package/wechat  WeChat相关API
 https://developer.qiniu.com/kodo/sdk/1289/nodejs  七牛相关API
 http://mongoosejs.com/docs/guide.html  mongoose API
 https://www.npmjs.com/package/supertest  supertest单元测试 API
# 日记
 - 20180720
  - 修改bin/www文件为www.js，为了能让babel也打包

  - gulp-nodemon启动通过exec: 'babel-node',实现nodemon lib/bin/www.js --exec babel-node

  - gulp-imagemin压缩有问题，npm装包有问题，决定转yarn

  - 前端自动化思路：每个页面特有的js和css直接写在页面上，公共的/外部插件的js和css通过require管理；然后发布时用gulp把js和css打包成总的js和css，这样就只有两个请求。(ps，想了想还不如直接用vue写单页拖拖到工程了)

# 功能
 * 支持html直接渲染，也支持ejs ok
 * morgan日志打印功能 ok
 * mocha单元测试
   基于supertest和mocha进行了服务器及接口的测试
 * 基于babel 让express支持es6语法 ok
 * 基于nodemon 实现热启动 ok
 * gulp + browser-sync 实现静态资源打包及前端代码热更新
   实时编译js，less文件，并刷新页面，图片压缩功能不稳定，由于gulp-imagemin包安装不完整(被墙...)
 * 对接七牛存储 ok
   直接根据七牛api写一遍即可，中间使用了multer把表单上传的数据转buffer
 * 基于mongoose 操作数据库mongodb ok
 * 对接微信api ok
   实现很简单，主要工作都在微信公众号配置完成，node服务根据配置信息，实现与微信的对接。功能添加可使用wechat-api、wechat等现成的包。
 * 前端代码开发部署
   src/views/static/plugins存放外部插件，有改动的话直接复制到src/public/plugins;其他资源走热更新实时编译。

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

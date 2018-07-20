# 参考链接
 https://github.com/babel/example-node-server

# 日记
 - 20180720
  -修改bin/www文件为www.js，为了能让babel也打包

# 开发

	# 克隆项目
	//////////////////////////////////////

	# 安装依赖
	npm install

	# 本地启动服务
	npm run dev, 基于babel,所以在本地开发后台代码的时候可以直接用es6。
	
	# 本地单元测试
	npm run test, 单元测试基于mocha

# 发布

	# 项目打包
	npm run build, 打包是通过babel将lib文件夹生成dist文件夹，然后直接将dist文件夹拖到自己的服务器。

	# 生成环境启动
	npm run prod

var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cache = require('gulp-cache');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');
var bs = require('browser-sync').create();
var nodemon = require('gulp-nodemon');
var path = require('path');
var del = require('del');

var config = require('./lib/config/conf.dev');
var files = ['src/views/**/*.{html,ejs}', 'src/public/js/**/*.js', 'src/public/css/**/*.css', 'src/public/img/**/*.{png,jpg,gif,ico}'];
// 删除文件
gulp.task('clean', function(cb) {
    return del(['src/public/css/*', 'src/public/js/*', 'src/public/img/*'], cb)
});

//图片压缩
gulp.task('imagemin', function(){
    return gulp.src('src/views/static/img/**/*.{png,jpg,gif,ico}')
          .pipe(changed('src/public/img'))
          .pipe(cache(imagemin([
              imagemin.gifsicle({interlaced: true}),
              imagemin.jpegtran({progressive: true}),
              imagemin.optipng({optimizationLevel: 5}),
              imagemin.svgo({plugins: [{removeViewBox: true}]})
          ],{verbose:true})))
          .pipe(gulp.dest('src/public/img/'))
});
//babel转换es5
gulp.task('babel', function (){
    return gulp.src('src/views/static/js/**/*.js')
        .pipe(changed('src/public/js'))//对比目标文件目录，只有当前修改了的文件才会进行编译，避免改一个文件编译所有文件
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('src/public/js/'))
});
//less转换css
gulp.task('less', function (){
  	return gulp.src('src/views/static/css/**/*.less')
      .pipe(changed('src/public/css'))
    	.pipe(less({
      		paths: [ path.join(__dirname, 'less', 'includes') ]
    	}))
    	.pipe(autoprefixer({//css兼容前缀生成
    	    browsers: ['last 2 versions', 'Android >= 4.0','>5%'],//所有主流浏览器的最新两个版本，安卓4.0以上，使用率5%以上的浏览器
    	    cascade: true, //是否美化属性值(对齐)，默认true
    	    remove:true //是否去掉不必要的前缀 默认：true
    	}))
      .pipe(cleanCSS())
    	.pipe(gulp.dest('src/public/css/'));
});
//发布线上,清除代码并美化压缩js，css文件
gulp.task('build', function(){//gulp正在监听，这时候打包会报错
	//runSequence('clean', ['babel', 'less'])
  runSequence('clean', ['babel', 'less', 'imagemin'])
});
//plugins里的内容只是复制份到文件夹
gulp.task('plugins', function(){//gulp正在监听，这时候打包会报错
  return gulp.src('src/views/static/plugins/**/*.*')
      .pipe(changed('src/public/plugins'))
      .pipe(gulp.dest('src/public/plugins/'));
});
//启动node服务
gulp.task('nodemon',function(cb){
    console.log(started);
    var started = false;
    return nodemon({
      script: 'lib/bin/www.js',
      exec: 'babel-node',
      ignore:['src/']//nodemon监听js变化，为了在改动前端代码的时候不重启，ignore掉前端文件夹和dist文件夹
    }).on('start', function () {
      // to avoid nodemon being started multiple times
      // thanks @matthisk
      if (!started) {
        cb();
        started = true;
      } 
    });
});

gulp.task('browser-sync', ['nodemon'], function() {
    bs.init(files,{
        proxy: config.default.PORT?"http://localhost:"+config.default.PORT:"http://localhost:3000",
        browser: "chrome",
        port: 8988
    });
});
//监听静态资源变化，热更新
gulp.task('default',['browser-sync'], function(){
	gulp.watch('src/views/static/css/**/*.less',['less']);
  gulp.watch('src/views/static/plugins/**/*.*',['plugins']);
	gulp.watch('src/views/static/js/**/*.js',['babel']);
  gulp.watch('src/views/static/img/**/*.{png,jpg,gif,ico}',['imagemin']);
	gulp.watch(files).on("change",bs.reload);
});
import express from 'express'
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//H5宣传
router.get('/h5Demo', function(req, res, next) {
    res.render('h5Demo/index', { title: 'h5Demo' });
});
router.get('/h5Demo/:name', function(req, res, next) {
  	res.render('h5Demo/'+req.params.name+'/index', { title: req.params.name });
});
//个人摄影作品
router.get('/gallery', function(req, res, next) {
  res.render('gallery', { title: 'gallery' });
});
//博客
router.get('/blog', function(req, res, next) {
  res.render('blog/index', { title: '我的博客', type:'blog' });//type用于区别渲染
});
router.get('/blog/detail', function(req, res, next) {
  res.render('blog/index', { title: '文章详情页面', type:'detail' });
});
//后台页面
router.get('/admin', function(req, res, next) {
  res.render('vue', { title: '后台系统' });
});
router.get('/vuedemo', function(req, res, next) {
  res.render('vue/vueAdmin', { title: 'vue后台demo' });
});
//以下是测试页面
router.get('/test', function(req, res, next) {
  	res.render('test', { title: '测试' });
});
router.get('/transA', function(req, res, next) {
    res.render('transA', { title: '跳转页A' });
});
router.get('/transB', function(req, res, next) {
    res.render('transB', { title: '跳转页B' });
});
router.get('/testLogin', function(req, res, next) {
    res.render('testLogin', { title: '测试登录' });
});
router.get('/b_index', function(req, res, next) {
    res.render('b_index', { title: '新首页' });
});
router.get('/b_gallery', function(req, res, next) {
    res.render('b_gallery', { title: '新照片页' });
});
router.get('/b_blog', function(req, res, next) {
    res.render('blog/b_blog', { title: '新blog页' });
});
module.exports = router;

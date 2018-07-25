import express from 'express'
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 //  if(req.session.users) {//测试session
 //    if(req.session.isVisit){
 //      req.session.isVisit++;
 //    }else{
 //      req.session.isVisit = 1;
 //    }
 //    console.log(req.sessionID);
 //    console.log('<p>第 ' + req.session.isVisit + '次来到此页面</p>');
 //  }

	// if(req&&req.signedCookies){
	// 	console.log('signedCookie:',req.signedCookies);//{ uid: '594cd242f4b9451d70f9924c' },而不是签名后的字符串
	// }
  res.render('index', { title: 'Express' });
});
router.get('/demo', function(req, res, next) {
  res.render('demo', { title: 'demo' });
});
export default router;

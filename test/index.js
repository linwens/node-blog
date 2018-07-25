import http from 'http';
import assert from 'assert';
import qs from 'querystring';
import '../lib/bin/www.js';//启动服务

describe('测试多个接口', () => {
  it('should return 200', done => {
    http.get('http://127.0.0.1:3100', res => {
      assert.strictEqual(200, res.statusCode);
      done();
    });
  });
  it('不传值应该返回 用户不存在', () => {
    http.request({
    	port: 3100,
    	method:'POST',
    	path:'/ajax/login'
    }, res => {
      assert.strictEqual('用户不存在', res.res_msg);
    });
  });
  it('password:1111111,应该返回密码错误', () => {
  	let data = qs.stringify({
  		username:'linwens',
  		password:1111111
  	});

    let req = http.request({
    	port: 3100,
    	method:'POST',
    	path:'/ajax/login'
    }, res => {
      assert.strictEqual('密码错误', res.res_msg);
      
    });
    req.write(data);
    req.end();
  });
  it.only('测试文章上传',()=>{
  	let data = qs.stringify({
  		title: 'mocha test',
  	    text: 'mocha test text',
  	    tags: '{"0":"tagssss"}',
  	    brief:'mocha test brief',
  	    operate:'save',
  	    option:'',
  	});

  	let req = http.request({
  	  	port: 3100,
  	  	method:'POST',
  	  	path:'/ajax/subArticle'
  	}, res => {
  	  	console.log('-=-=-=-=-=-==-===');
  	    assert.strictEqual('文章保存成功未发布', res.res_msg);
  	});
  	req.write(data);
  	req.end();
  })
});
import assert from 'assert';
import request from 'supertest';
import '../lib/bin/www.js';//启动服务

describe('测试多个接口', () => {
  it('should return 200', (done) => {
    request('http://127.0.0.1:3100')
      .get('/')
      .end((err, res)=>{
        if(err) done(err)
        assert.strictEqual(200, res.statusCode);
        done();
      })
  });
  it('password:1111111,应该返回密码错误', (done) => {
    request('http://127.0.0.1:3100')
      .post('/ajax/login')
      .send({
        username:'linwens',
        password:1111111
      })
      .end((err, res)=>{
        if(err) done(err)
        assert.strictEqual('密码错误', res.body.res_msg);
        done();
      })
  });
  it('测试文章上传',(done)=>{
    request('http://127.0.0.1:3100')
      .post('/ajax/subArticle')
      .send({
        title: 'mocha test',
        text: 'mocha test text',
        tags: '{"0":"tagssss"}',
        brief:'mocha test brief',
        operate:'save',
        option:'',
      })
      .end((err, res)=>{
        if(err) done(err)
        assert.strictEqual('文章保存成功未发布', res.body.res_msg);
        done();
      })
  })
});
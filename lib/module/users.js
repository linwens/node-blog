import {User} from './mongoose'
//登录
exports.Login = function(req, res, next){
	var users = new User({
        username: decodeURI(req.body.username),
        password: decodeURI(req.body.password)
    });
    //为游客设置权限
    if(users.username==='guests'){
        res.json({
            res_code:'1',
            res_msg:'登录成功',
            data:{
                type:'guests'
            }
        })
    }else{
        User.find({username:users.username})
        .then(function(data){
            if(data&&data!=''){
                if(data[0].password == users.password){//验证密码
                    //设置cookie
                    //res.cookie('uid', data[0]._id, {maxAge:60*1000, httpOnly: false, secure: false, signed: true});
                    //设置session,存入用户名及登录密码
                    // req.session.users = users;
                    // console.log(req.session);
                    res.json({
                        res_code:'1',
                        res_msg:'登录成功',
                        data:{
                            uid:data[0]._id
                        }
                    })
                }else{
                    res.json({
                        res_code:'2',
                        res_msg:'密码错误'
                    })
                }
            }else{
                res.json({
                    res_code:'-1',
                    res_msg:'用户不存在'
                });
            }
        })
        .catch(function(err){
            console.log(err);
        });
    }
    
};
//注册
exports.Regist = function(req, res, next){
    var users = new User({
        username: req.body.username,
        password: req.body.password
    });
    //mongoose里model的实例(这里就是小写的users)不存在find方法，用users.find()会报错，所以用User.find()
    User.find({username:users.username})
    .then(function(data){
        if(data&&data!=''&&data!='[]'){
            res.json({
                res_code:'0',
                res_msg:'用户已经存在'
            });
            return Promise.reject('用户已存在');
        }else{
            return users;
            //return Promise.resolve(users);//两句的效果是一样的，
            //return的值会由 Promise.resolve(return的返回值); 进行相应的包装处理，因此不管回调函数中会返回一个什么样的值，最终 then 的结果都是返回一个新创建的promise对象。
        }
    }).then(function(users){
        //实例具有save()方法进行存储，所以用users,而不是用构造函数User
        users.save()
        .then(function(data){
            //返回前端一个唯一id
            res.json({
                res_code:'1',
                res_msg:'注册成功',
                data:{
                    uid:data._id
                }
            })
        }).catch(function(err){
            console.log('save--err');
            console.log(err);
        })
    }).catch(function(err){
        console.log('find--err');
        console.log(err);
    })
}
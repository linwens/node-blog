import {User} from './mongoose'
//登录
export const Login = (req, res, next)=>{
	let users = new User({
        username: decodeURI(req.body.username),
        password: decodeURI(req.body.password)
    });
    User.find({username:users.username})
    .then((data)=>{
        if(data&&data!=''){
            if(data[0].password == users.password){//验证密码
                res.json({
                    res_code:1,
                    res_msg:'登录成功',
                    data:{
                        uid:data[0]._id
                    }
                })
            }else{
                res.json({
                    res_code:2,
                    res_msg:'密码错误'
                })
            }
        }else{
            res.json({
                res_code:-1,
                res_msg:'用户不存在'
            });
        }
    })
    .catch((err)=>{
        console.log(err);
    });
    
};
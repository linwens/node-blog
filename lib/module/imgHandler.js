import {Img} from './mongoose';
import multer from 'multer';
import qiniu from 'qiniu';


//multer配置 https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
//存为buffer
const storage = multer.memoryStorage();//使用内存存储引擎，将完整的文件数据转为buffer对象存入一个buffer字段
const multerConf = multer({
    storage: storage,//设置上传的文件的存储位置
    limits:{
        fileSize:2097152 //2M
    },
    fileFilter: (req, file, cb)=>{//过滤文件，通过文件的mimetype判断是否是 jpg|png|jpeg 
        let type = '|' + file.mimetype.slice(file.mimetype.lastIndexOf('/') + 1) + '|';
        let fileTypeValid = '|jpg|png|jpeg|'.indexOf(type) !== -1;
        cb(null, !!fileTypeValid);//!!fileTypeValid为true，表示接收这个文件
    }
}).single('imgFiles');//一次接受一个文件上传，同时设置上传的文件字段名，前端提交时设置的的文件字段名要与此处字段名一致
//图片上传
export const ImgUpload = (req, res, next)=>{
    //传七牛
    multerConf(req, res, (err)=>{
        //req.body.bucketType
        //七牛配置---生成token
        let accessKey = '';//从七牛开发者平台手动获取
        let secretKey = '';//从七牛开发者平台手动获取
        let bucket = '';//存储空间名称，从七牛开发者平台手动获取
        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);//定义鉴权对象mac
        //自定义凭证相关内容
        const options = {
            scope: bucket,
            returnBody: '{"key":"$(key)","hash":"$(etag)","width":"$(imageInfo.width)","height":"$(imageInfo.height)","model":"$(exif.Model.val)","iso":"$(exif.ISOSpeedRatings.val)","shutter":"$(exif.ExposureTime.val)","aperture":"$(exif.FNumber.val)","Flength":"$(exif.FocalLength.val)"}'//自定义返回信息
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken=putPolicy.uploadToken(mac);//生成凭证token
        //----找到七牛机房
        const config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z0;
        //----生成文件上传实例
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        let key = req.file.originalname;//上传的文件名称

        if(err){//发生错误了就抛给express处理
            console.log(err);
            next(err);
        }else{
            if(req.file&&req.file.buffer){//上传文件ok
                formUploader.put(uploadToken, key, req.file.buffer, putExtra, (respErr,
                  respBody, respInfo)=>{
                    if(respErr){
                        throw respErr;
                    }
                    if(respInfo.statusCode == 200){
                        let exifObj = {};
                            exifObj.model = respBody.model;
                            exifObj.iso = respBody.iso;
                            exifObj.shutter = respBody.shutter;
                            exifObj.aperture = respBody.aperture;
                            exifObj.Flength = respBody.Flength;
                        res.json({//返回前端外链地址，前端再提交放入数据库
                            res_code:'0',
                            res_msg:'上传成功',
                            size:respBody.width+'x'+respBody.height,
                            exif:exifObj,
                            backUrl:'http://xxx.bkt.clouddn.com/'+respBody.key, //从七牛开发者平台手动获取外链默认域名
                        })
                    }else{
                        console.log(respInfo.statusCode);
                        console.log(respBody);
                        res.json({
                            res_code:'4',
                            res_msg:'状态码：'+respInfo.statusCode+',msg：'+JSON.stringify(respBody)
                        })
                    }
                });
            }else{
                res.json({
                    res_code:'4',
                    res_msg:'上传文件有误'
                })
            }
        }
    }) 
};
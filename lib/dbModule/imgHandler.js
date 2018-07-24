import {Img} from './mongoose';
import multer from 'multer';
import qiniu from 'qiniu';
import uuid from 'node-uuid';


//multer配置
//存为buffer
var storage = multer.memoryStorage();
var multerConf = multer({
    storage: storage,
    limits:{
        fileSize:2097152 //2M
    },
    fileFilter:function(req, file, cb){
        var type = '|' + file.mimetype.slice(file.mimetype.lastIndexOf('/') + 1) + '|';
        var fileTypeValid = '|jpg|png|jpeg|'.indexOf(type) !== -1;
        cb(null, !!fileTypeValid);
    }
}).single('imgFiles');
//图片上传
exports.ImgUpload = function(req, res, next){
    //传七牛
    multerConf(req, res, function(err){
        //req.body.bucketType
        //七牛配置---生成token
        var accessKey = '';
        var secretKey = '';
        //var bucket = 'linwens-img';
        var bucket = req.body.bucketType === 'galleryImg'?'linwens-img':'blog-img';//配置上传不同传出空间
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var options = {
            scope: bucket,
            returnBody: '{"key":"$(key)","hash":"$(etag)","width":"$(imageInfo.width)","height":"$(imageInfo.height)","model":"$(exif.Model.val)","iso":"$(exif.ISOSpeedRatings.val)","shutter":"$(exif.ExposureTime.val)","aperture":"$(exif.FNumber.val)","Flength":"$(exif.FocalLength.val)"}'
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(mac);
        //----找到七牛机房
        var config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z0;

        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        var key = req.file.originalname;

        if(err){
            console.log(err);
        }else{
            if(req.file&&req.file.buffer){
                formUploader.put(uploadToken, key, req.file.buffer, putExtra, function(respErr,
                  respBody, respInfo) {
                    if (respErr) {
                        throw respErr;
                    }
                    if (respInfo.statusCode == 200) {
                        var exifObj = {};
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
                            backUrl:(bucket==='linwens-img'?'http://xxx.bkt.clouddn.com/':'http://yyy.bkt.clouddn.com/')+respBody.key
                        })
                    } else {
                        console.log(respInfo.statusCode);
                        console.log(respBody);
                    }
                });
            }
        }
    }) 
};
//图片信息存入数据库
exports.ImgInfosave = function(req, res, next){
    var img = new Img({
        time: Math.round(Date.parse(new Date())/1000),
        title:req.body.title,
        desc: req.body.desc,
        size: req.body.size,
        url: req.body.url,
        exif:JSON.parse(req.body.exif),
        type:req.body.type,
        gid:uuid.v1()
    });
    //判断是修改还是新加
    if(req.body.option&&req.body.option=='modify'){
        Img.update({gid:req.body.gid}, {title: req.body.title,desc:req.body.desc})
        .then((data)=>{
            console.log('Updated:', data);
            res.json({
                res_code:1,
                res_msg:'图片信息修改成功'
            })
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                res_code:4,
                res_msg:'图片信息修改失败'
            })
        })
    }else{
        Img.find({url:req.body.url})
        .then((data)=>{
            if(data&&data!=''){
                return Promise.reject('图片信息已存在');
            }else{
                return img
            }
        })
        .then((img)=>{
            img.save()
            .then((data)=>{
                console.log('Saved:', data);
                res.json({
                    res_code:1,
                    res_msg:'图片信息保存成功'
                })
            })
            .catch((err)=>{
                console.log(err);
                res.json({
                    res_code:4,
                    res_msg:'图片信息保存失败'
                })
            })
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                res_code:4,
                res_msg:err
            })
        })
    }
}
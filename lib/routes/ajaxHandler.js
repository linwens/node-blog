'use strict'
import express from 'express';
const router = express.Router();

import { Getlist, Subarticle } from '../module/articles'
import { ImgUpload } from '../module/imgHandler'
import { Login } from '../module/users'
//获取文章列表
router.get('/getList',function(req, res, next){
    Getlist(req, res, next);
});
//提交文章
router.post('/subArticle', function(req, res, next){
    Subarticle(req, res, next);
});
//图片上传
router.post('/uploadImg', function(req, res, next){
    ImgUpload(req, res, next);
});
//登录
router.post('/login',function(req, res, next){
    Login(req, res, next);
});
export default router;

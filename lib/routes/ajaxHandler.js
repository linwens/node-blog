'use strict'
import express from 'express';
const router = express.Router();

import { Getlist } from '../dbModule/articles'

//获取文章列表
router.get('/getList',function(req, res, next){
    Getlist(req, res, next);
});
export default router;

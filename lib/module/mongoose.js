import mongoose from '../linkMongo';
const Schema = mongoose.Schema;
//用户存储
const userSchema = new Schema({
    username: String,
    password: String
});
export const User = mongoose.model('users', userSchema);
//exports.User = mongoose.model('users', userSchema);
//文章存储
const articlesSchema = new Schema({
	time: String,
    title: String,
    text:String,
    tags:Array,
    aid:String,
    brief:String,
    operate:String,
    pv:Number
});
export const Articles = mongoose.model('articles', articlesSchema);

//图片操作
const ImgSchema = new Schema({
	time: String,
    title: String,
    desc: String,
    size: String,
    url:String,
    exif:Object,
    type:String,
    gid:String
});
export const Img = mongoose.model('Img', ImgSchema);
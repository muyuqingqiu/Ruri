const path = require('path');
const Base64 = require('js-base64').Base64;
const fs = require('fs');
const axios = require('axios');
const {
    promises: fsPromise
} = fs;
const {
    nick: BOTNICK,
    message: MSG_CONF,
    self_id: SELFID
} = require(path.join(__dirname, './../../config/running.config'));
let {
    getModuleName,
    messageLimit,
    randomGet,
    checkAdmin,
    atMessage,
    reqedGroups,
    reqedUsers
} = require(path.join(__dirname, './../../config/util.config'));
let groupModel = require(path.join(__dirname, '../../model/group.js'))
const pluginName = getModuleName(__dirname);
let {
    msg_prefix,
    msg_suffix,

} = MSG_CONF;

const {
    setuPath,
    pixivPath,
    nohPath
} = require('./config');





module.exports.apply = async (ctx) => {

    ctx.middleware(async (meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if ([`${msg_prefix}18x`,`${msg_prefix}色图`].find(item => message.includes(item))) {
            let [isNotLimit, time] = messageLimit.checkUserLimit(pluginName, userId);
            if (isNotLimit) {
                messageLimit.setUserLimit(pluginName, userId, 10);
            } else {
                return meta.$send(atMessage(userId, `${time}秒后才能召唤${msg_suffix}`));
            }
            let {
                data: result
            } = await axios.get('http://localhost:3333/api/get_image?random=1&setu=1');//这里就是获取一个图片名称（iid），可以自行修改一下。
            let {
                data: iid
            } = result;
            let imagePath = `${setuPath}/${iid}.jpg`;
            let file = await fsPromise.readFile(imagePath)
            let base64Str = Base64.encode(file);
            ctx.sender.sendGroupMsg(groupId, `[CQ:image,file=base64://${base64Str}]`).then((msgId) => {
                meta.$send(``);//可自行配置发送后补充的话
            });
        }
        return next();
    })



}
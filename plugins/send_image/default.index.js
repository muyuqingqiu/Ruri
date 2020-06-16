const path = require('path');
// const Base64 = require('js-base64').Base64;
// const fs = require('fs');
const axios = require('axios');
// const {
//     promises: fsPromise
// } = fs;
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
        } = meta;
        if ([`${msg_prefix}18x`, `${msg_prefix}色图`, `${msg_prefix}随机色图`].find(item => message.includes(item))) {
            getAndSend(meta, 'setu');
        }
        if ([`${msg_prefix}清爽一下`].find(item => message.includes(item))) {
            getAndSend(meta, 'noh');
        }
        return next();
    })

    async function getAndSend(meta, mode) {
        let {
            groupId,
            userId
        } = meta;
        let [isNotLimit, time] = messageLimit.checkUserLimit(pluginName, userId);
        if (isNotLimit) {
            messageLimit.setUserLimit(pluginName, userId, 10);
        } else {
            return meta.$send(atMessage(userId, `${time}秒后才能召唤${msg_suffix}`));
        }
        // 模块修改为http方式发送图片，需自行配置nginx
        try {
            let {
                data: {
                    iid
                }
            } = await axios.get(`http://172.17.0.1:3333/api/get_image?random=1&${mode}=1`);
            await ctx.sender.sendGroupMsg(groupId, `[CQ:image,file=http://172.17.0.1:1114/public/img/${mode}/${iid}.jpg]`);
            
        } catch (err) {
            console.error(`[plugin error](${PLUGINNAME})发送图片失败：${err}`);
            meta.$send(`图片太色了发不出来${msg_suffix}`);
        }
        // let {
        //     data: result
        // } = await axios.get('http://localhost:3333/api/get_image?random=1&setu=1');
        // let {
        //     data: iid
        // } = result;
        // let imagePath = `${setuPath}/${iid}.jpg`;
        // let file = await fsPromise.readFile(imagePath)
        // let base64Str = Base64.encode(file);
        // ctx.sender.sendGroupMsg(groupId, `[CQ:image,file=base64://${base64Str}]`).then((msgId) => {
        //     meta.$send(`高清大图在这里 http://pixiv.revuestarlightfans.com/#/viewimage/${iid}\n欢迎来参观黑猫的图片小站 http://pixiv.revuestarlightfans.com/`);
        // });
    }


}
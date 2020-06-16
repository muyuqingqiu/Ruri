const path = require('path');
const Base64 = require('js-base64').Base64;
const fs = require('fs');
const {
    promises: fsPromise
} = fs;
const {
    nick: BOTNICK,
    message: MSG_CONF,
    self_id: SELFID
} = require(path.join(__dirname, './../../config/running.config'));
let {
    randomGet,
    checkAdmin,
    atMessage,
    reqedGroups,
    reqedUsers,
    getModuleName,
    messageLimit
} = require(path.join(__dirname, './../../config/util.config'));
let groupModel = require(path.join(__dirname, '../../model/group.js'))
let {
    msg_prefix,
    msg_suffix,
} = MSG_CONF;
msg_prefix = 'alice';
const {
    allVoice,
    pekovoicePath
} = require('./config');

const pluginName = getModuleName(__dirname);



module.exports.apply = async (ctx) => {

    ctx.middleware(async (meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if ([`${msg_prefix}说点啥`].find(item => message.includes(item))) {
            let {
                voice,
                name
            } = randomGet(allVoice);
            let filePath = `${pekovoicePath}/${voice}.mp3`;

            let [isNotLimit, time] = messageLimit.checkUserLimit(pluginName, userId);
            if (isNotLimit) {
                messageLimit.setUserLimit(pluginName, userId, 10);
            } else {
                return meta.$send(atMessage(userId, `${time}秒后才能召唤${msg_suffix}`));
            }
            ctx.sender.sendGroupMsg(groupId, `[CQ:record,file=${filePath}]`).then((msgId) => {
                meta.$send(`${name}`);
            });
            return;
        }
        return next();
    })



}
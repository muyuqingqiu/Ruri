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
            let voiceInfo = randomGet(allVoice);
            let filePath = `${pekovoicePath}/${voiceInfo.path}`;

            let [isNotLimit, time] = messageLimit.checkUserLimit(pluginName, userId);
            if (isNotLimit) {
                messageLimit.setUserLimit(pluginName, userId, 10);
            } else {
                return meta.$send(atMessage(userId, `${time}秒后才能召唤${msg_suffix}`));
            }
            fsPromise.readFile(filePath).then(file => {
                let base64Str = Base64.encode(file);
                ctx.sender.sendGroupMsg(groupId, `[CQ:record,file=base64://${base64Str}]`).then((msgId) => {
                    meta.$send(`${voiceInfo.translation.Chinese}`);
                });
            });
            return;
        }
        if ([`${msg_prefix}哈`,`${msg_prefix}haha`].find(item => message.includes(item))) {
            let filePath = `${pekovoicePath}/hahahaha.mp3`;
            fsPromise.readFile(filePath).then(file => {
                let base64Str = Base64.encode(file);
                ctx.sender.sendGroupMsg(groupId, `[CQ:record,file=base64://${base64Str}]`);
            });
            return;
        }
        if ([`${msg_prefix}h`, `${msg_prefix}18x`].find(item => message.includes(item))) {
            let filePath = `${pekovoicePath}/H！色狼！不要碰！你的胖次几厘米.mp3`;
            fsPromise.readFile(filePath).then(file => {
                let base64Str = Base64.encode(file);
                ctx.sender.sendGroupMsg(groupId, `[CQ:record,file=base64://${base64Str}]`);
            });
            return;
        }
        return next();
    })



}
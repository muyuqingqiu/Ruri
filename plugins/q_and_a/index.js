const path = require('path');
const {
    nick: BOTNICK,
    message: MSG_CONF,
    self_id: SELFID
} = require(path.join(__dirname, './../../config/running.config'));
let {
    checkAdmin,
    atMessage,
    reqedGroups,
    reqedUsers
} = require(path.join(__dirname, './../../config/util.config'));
let groupModel = require(path.join(__dirname, '../../model/group.js'))

let {
    msg_prefix,
    msg_suffix,

} = MSG_CONF;






module.exports.apply = async (ctx) => {

    ctx.middleware((meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if (atMessage(SELFID, '你会什么', '你会什么？', '你会什么?').find(item => message.includes(item))) {
            let [atStr, question] = message.split(' ');
            try {
                let {
                    qanda
                } = reqedGroups[groupId];
                let resMsg = atMessage(userId, `跟${BOTNICK}说\n`);
                resMsg += Object.keys(qanda).map(key => `${key}\n`).join('');
                resMsg += `试试${msg_suffix}`;
                return meta.$send(resMsg);

            } catch (error) {
                console.error(error);
            }
        }
        return next();
    })

    ctx.middleware((meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if (message.includes(atMessage(SELFID, '跟我学'))) {
            let [atStr, tempStr, question, answer] = message.split(' ');
            try {
                if (!question || !answer || question.includes('qq=2915730465') || answer.includes('qq=2915730465') || question.includes('跟我学')) {
                    return meta.$send(atMessage(userId, `请告诉${BOTNICK}学什么${msg_suffix}`));
                }
                let {
                    qanda
                } = reqedGroups[groupId];

                if (!qanda) {
                    qanda = {};
                }
                if (qanda[question] && userId !== qanda[question].owner) {
                    // 没有权限的人无法修改已有的问答
                    if (!checkAdmin(reqedUsers[userId])) {
                        return meta.$send(atMessage(userId, `${BOTNICK}已经学过啦${msg_suffix}！`));
                    }
                }
                qanda[question] = {
                    msg: answer,
                    owner: userId
                };
                reqedGroups[groupId] = {
                    ...reqedGroups[groupId],
                    qanda
                }
                groupModel.updateOne({
                    'group_id': groupId
                }, {
                    '$set': {
                        qanda: qanda
                    }
                }, {
                    upsert: true
                }).catch((err) => console.log(err));
                return meta.$send(atMessage(userId, `${BOTNICK}学会了${msg_suffix}！`))

            } catch (err) {
                console.error(err);
            }
        }

        return next();
    })

    ctx.middleware((meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if (message.includes(atMessage(SELFID, '忘记'))) {
            let [atStr, tempStr, question] = message.split(' ');
            let {
                qanda
            } = reqedGroups[groupId];
            if (!question) {
                return meta.$send(atMessage(userId, `${BOTNICK}不知道要忘记什么${msg_suffix}！`))
            }
            if (!qanda[question].msg) {
                return meta.$send(atMessage(userId, `${BOTNICK}没学过这句呢${msg_suffix}！`))
            }
            if (userId !== qanda[question].owner && !checkAdmin(reqedUsers[userId])) {
                return meta.$send(atMessage(userId, `你不能让${BOTNICK}忘记这句${msg_suffix}！`))
            }
            delete qanda[question];
            groupModel.updateOne({
                'group_id': groupId
            }, {
                '$set': {
                    qanda: qanda
                }
            }, {
                upsert: true
            }).catch((err) => console.log(err));
            return meta.$send(atMessage(userId, `${BOTNICK}已经忘记了${msg_suffix}！`))
        }
        return next();
    })

    ctx.middleware((meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if (message.includes(atMessage(SELFID, ''))) {
            let [atStr, question] = message.split(' ');
            try {
                let {
                    qanda
                } = reqedGroups[groupId];
                if (!qanda[question]) {
                    return next();
                }
                let answer = qanda[question].msg;
                if (!answer) {
                    return next();
                }
                return meta.$send(`${answer} ${msg_suffix}`);

            } catch (error) {
                console.error(error);
            }
        }
        return next();
    })


}
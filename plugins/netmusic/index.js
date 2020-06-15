const path = require('path');
let userModel = require(path.join(__dirname, '../../model/user.js'))
const PLUGINNAME = 'netmusic';
const {
    message: MSG_CONF,
    nick: BOTNICK,
    super_id: SUPERID,
    res_groups: RESGROUPS
} = require('./../../config/running.config');
const netmusicConfig = require('./config');
const {
    login_cellphone,
    likelist,
    user_cloud
} = require(path.join(__dirname, '../../tools/NeteaseCloudMusicApi'));
const {
    checkAdmin,
    atMessage,
    timerManager,
    reqedGroups,
    reqedUsers
} = require(path.join(__dirname, './../../config/util.config'));


let {
    msg_prefix,
    msg_suffix
} = MSG_CONF;

let likeIds;
module.exports.apply = async (ctx) => {
    await getLikes(SUPERID, true);
    timerManager.addTimer('daily', 'like_music', function (ctx) {
        let timer = setInterval(() => {
            if (new Date().getHours() == 10 && new Date().getMinutes() < 5) {
                RESGROUPS.forEach((groupid) => {
                    let mid = getMid(SUPERID);
                    ctx.sender.sendGroupMsg(groupid, `上午10点，跟${BOTNICK}用一首歌开始新的一天吧${msg_suffix}`, true);
                    ctx.sender.sendGroupMsg(groupid, `[CQ:music,type=163,id=${mid}]`);
                })
                clearInterval(timer);
            }
        }, 30000);
        return timer;
    }, 0, ctx);

    ctx.middleware(async (meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if (message.includes(`${msg_prefix}来首歌`)) {
            if (!likeIds) {
                await getLikes(userId, meta);
            }
            let [tempStr, mid] = message.split(' ');
            mid = mid ? mid : getMid(userId);
            if (+mid) {
                return meta.$send(`[CQ:music,type=163,id=${mid}]`);
            } else {
                return meta.$send(atMessage(userId, `${BOTNICK}找不到这首歌${msg_suffix}`));
            }
        }
        return next();
    })

    ctx.middleware(async (meta, next) => {
        let {
            message,
            groupId,
            userId
        } = meta;
        if (message.includes(`${msg_prefix}更新音乐状态`)) {

            let loginRes = await getUserInfo(userId);
            let cookie = loginRes.cookie;
            let netmusicUserId = loginRes.netmusicUserId;

            let likeResult = await likelist({
                userid: netmusicUserId,
                cookie
            })
            let {
                code,
                ids
            } = likeResult.body;
            if (code !== 200) {
                console.error(`[plugin error](${PLUGINNAME})likelist失败：${likeResult}`);
                return meta.$send(`状态更新失败${msg_prefix}`);
            }

            likeIds = ids;
            getCloudMusic(cookie);
        }
        return next();
    })

}

function getCloudMusic(cookie, offset) {
    offset = offset ? offset : 0;
    user_cloud({
        cookie,
        offset,
        limit: 200
    }).then(function (result) {
        let {
            body
        } = result;
        let {
            code,
            data
        } = body;
        if (code === 200) {
            let cloudIds = data.map(item => item.songId);
            likeIds = [...new Set([...likeIds, ...cloudIds])];
            if (offset >= 1) {
                return;
            }
            setTimeout(() => getCloudMusic(cookie, 1), 2000);
        } else {
            console.error(`[plugin error](${PLUGINNAME})user_cloud失败：${body}`);
        }
    })
}
async function getUserInfo(userId) {
    try {
        let {
            phone,
            password
        } = netmusicConfig;
        let loginResult = await login_cellphone({
            phone,
            password
        })
        let cookie = loginResult.body.cookie;
        let {
            'userId': netmusicUserId
        } = loginResult.body.profile;
        let userInfo = reqedUsers[userId];
        if (userInfo) {
            userInfo['netmusic_info'] = userInfo['netmusic_info'] ? {
                ...userInfo['netmusic_info'],
                cookie,
                user_id: netmusicUserId
            } : {
                cookie,
                user_id: netmusicUserId
            };
            reqedUsers[userId] = userInfo;
        }

        userModel.updateOne({
            'user_id': userId
        }, {
            '$set': {
                netmusic_info: {
                    cookie,
                    user_id: netmusicUserId
                }
            }
        }, {
            upsert: true
        }).catch((err) => console.log(err));

        return Promise.resolve({
            cookie,
            netmusicUserId
        })
    } catch (error) {
        console.log(error)
    }
}

async function getLikes(userId, isInit) {
    let cookie;
    let meta;
    if (typeof (isInit) === 'object') {
        isInit = false;
        meta = isInit;
    }
    if (!isInit) {
        let {
            netmusic_info: netmusicInfo,
        } = reqedUsers[userId];
        netmusicInfo = netmusicInfo ? netmusicInfo : {};
        let {
            user_id: netmusicUserId
        } = netmusicInfo;
        cookie = netmusicInfo.cookie;
    }
    if (!cookie) {
        let loginRes = await getUserInfo(userId);
        cookie = loginRes.cookie;
        netmusicUserId = loginRes.netmusicUserId;
    }
    let likeResult = await likelist({
        userid: netmusicUserId,
        cookie
    })
    let {
        code,
        ids
    } = likeResult.body;
    if (code !== 200) {
        console.error(`[plugin error](${PLUGINNAME})likelist失败：${likeResult}`);
        if (meta) {
            return meta.$send(`状态该更新了${msg_prefix}`);
        }
    }
    if (isInit) {
        console.log(`[plugin info](${PLUGINNAME})初始化喜欢列表成功`);
    }
    likeIds = ids;
    // getCloudMusic(cookie);
}



function getMid(temp) {
    temp = parseInt(temp) ? parseInt(temp) : parseInt(Math.random() * 10000);
    let mid = likeIds[(temp + parseInt(Math.random() * 12345678)) % likeIds.length];
    return mid;
}
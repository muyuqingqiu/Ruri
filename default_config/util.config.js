const {
    super_id
} = require('./running.config.js')

module.exports = {
    checkAdmin({
        userId,
        info
    }) {
        let adminRoles = ['admin', 'owner'];
        if (userId === super_id) {
            return true;
        }
        if (info && info.role) {
            return adminRoles.includes(info.role);
        }
    },
    atMessage(userId, ...msgs) {
        let res = msgs.map(msg => `[CQ:at,qq=${userId}] ${msg}`);
        if (res.length == 1) {
            res = res[0];
        }
        return res;
    },
    randomGet(arr, temp, num = 1) {
        temp = parseInt(temp) ? parseInt(temp) : parseInt(Math.random() * 114514);
        let resArr = [];
        for (i = 0; i < num; i++) {
            let res = arr[(temp + parseInt(Math.random() * 12345678)) % arr.length];
            resArr.push(res);
        }
        if (num === 1) {
            resArr = resArr[0];
        }
        return resArr;
    },
    getModuleName(dir) {
        return dir.split('/').pop().trim();
    },
    reqedGroups: global.reqedGroups,
    reqedUsers: global.reqedUsers,
    timerManager: global.timerManager,
    messageLimit: global.messageLimit

}
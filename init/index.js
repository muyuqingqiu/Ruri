const path = require('path');
const {
    GroupFlag,
    extendUser,
    extendGroup
} = require('koishi');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/qqbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
var db = mongoose.connection;
// 连接成功
db.on('open', function () {
    console.log('MongoDB 连接成功');
});
// 连接失败
db.on('error', function () {
    console.log('MongoDB 连接失败');
});
let groupModel = require(path.join(__dirname, '../model/group.js'))
let userModel = require(path.join(__dirname, '../model/user.js'))
const {
    TimerManager,
    MessageLimit
} = require(path.join(__dirname, '../tools/utils.js'))
global.reqedGroups = {};
global.reqedUsers = {};
global.timerManager = new TimerManager();
global.messageLimit = new MessageLimit();
let {
    database: mysql
} = require(path.join(__dirname, './../config/start.config'));
let {
    plugins: PLUGINS,
    res_groups: RES_GROUPS,
    self_id: SELF_ID,
    super_id: superId,
    disabled_plugins: disabledPlugins
} = require(path.join(__dirname, './../config/running.config'));
module.exports = function (app) {
    extendUser(() => ({
        info: {},
        disabled_plugins: []
    }));
    extendGroup(() => ({
        disabled_plugins: []
    }));
    // todo:把数据库已有的用户和群信息在中间件外面提前加载。
    app.group(...RES_GROUPS).prependMiddleware(async (meta, next) => {
        let userInfoField = meta.sender;
        if (!reqedGroups[meta.groupId] && meta.groupId) {
            let groupInfo = {},
                groupPluginData
            if (mysql) {
                groupInfo = await app.database.getGroup(meta.groupId, SELF_ID);
            }
            groupPluginData = await groupModel.findOne({
                group_id: meta.groupId
            })
            groupPluginData = groupPluginData ? groupPluginData : {
                _doc: {}
            };
            groupInfo = {
                ...groupInfo,
                disabled_plugins: disabledPlugins
            }
            if (mysql) {
                await app.database.setGroup(meta.groupId, groupInfo);
            }
            groupInfo = {
                ...groupInfo,
                ...groupPluginData._doc
            }
            reqedGroups[meta.groupId] = groupInfo;
        }
        if (!reqedUsers[meta.userId]) {
            let userInfo = {},
                userPluginData;
            if (mysql) {
                userInfo = await app.database.getUser(meta.userId, 1);

            }
            userPluginData = await userModel.findOne({
                user_id: meta.userId
            })
            userPluginData = userPluginData ? userPluginData : {
                _doc: {}
            };
            if (meta.userId === superId) {
                userInfo = {
                    ...userInfo,
                    authority: 4
                }
            } else if (userInfoField && userInfoField.role.includes(['owner', 'admin'])) {
                userInfo = {
                    ...userInfo,
                    authority: 3
                }
            }
            userInfo = {
                ...userInfo,
                info: userInfoField,
                disabled_plugins: disabledPlugins
            }
            if(mysql){
                await app.database.setUser(meta.userId, userInfo);
            }
            userInfo = {
                ...userInfo,
                ...userPluginData._doc,
            }
            reqedUsers[meta.userId] = userInfo;
        }
        // 记录发言
        try {
            console.log(`[message]群 ${meta.groupId} 的${userInfoField.nickname}(${meta.userId})「${userInfoField.role}」：${meta.message}`);
        } catch (err) {
            console.error(`[error]${err}`);
        }
        return next();
    })

    PLUGINS.forEach(plugin => {
        if (disabledPlugins.includes(plugin)) {
            return;
        }
        try {
            app.group(...RES_GROUPS).plugin(require(path.join(__dirname, `./../plugins/${plugin}`)));
            console.log(`[server info]插件(${plugin})加载成功！`);
        } catch (err) {
            console.log(`[server error]插件(${plugin})加载失败！`);
            console.error(err);
        }
    })

}
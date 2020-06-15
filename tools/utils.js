let path = require('path');
const {
    plugins: PLUGINS,
} = require(path.join(__dirname, './../config/running.config'));
class TimerManager {
    constructor() {
        this.timers = {};
        setInterval(() => {
            Object.keys(this.timers).forEach((key) => {
                let timerInfo = this.timers[key];
                let {
                    timer,
                    timerType,
                    openFunc,
                    openTime,
                    args,
                    reloaded
                } = timerInfo;
                let timeNow;
                if (timerType == 'daily') {
                    timeNow = new Date().getHours();
                } else if (timerType == 'hourly') {
                    timeNow = new Date().getMinutes();
                } else {
                    return;
                }
                if (timeNow === openTime) {
                    if (!reloaded) {
                        return;
                    }
                    clearInterval(timer);
                    let newTimer
                    try {
                        newTimer = openFunc(...args);
                    } catch (err) {
                        return console.error(`[server error]定时任务(${timerName})设置失败\n错误：${err}`);
                    }
                    console.log(`[server info]定时任务(${key})重启成功`);
                    this.timers[key]['timer'] = newTimer;
                    this.timers[key]['reloaded'] = true;
                } else {
                    this.timers[key]['reloaded'] = false;
                }
            })
        }, 10000);
    }
    addTimer(timerType, timerName, openFunc, openTime, ...args) {
        if (!timerName) {
            return console.error('[error]请给timer起个名字');
        }
        let timer;
        try {
            timer = openFunc(...args);
        } catch (err) {
            return console.error(`[server error]定时任务(${timerName})设置失败\n错误：${err}`);
        }
        this.timers[timerName] = {
            timer,
            timerType,
            openFunc,
            openTime,
            args,
            reloaded: false
        }
        console.log(`[server info]定时任务(${timerName})设置成功`);
        return timerName;
    }
    getTimers() {
        return this.timers;
    }

}
class MessageLimit {
    constructor() {
        this.userLimit = {};
        this.groupLimit = {};
        PLUGINS.forEach((plugin) => {
            this.userLimit[plugin] = {};
            this.groupLimit[plugin] = {};
        })
    }
    setUserLimit(plugin, userId, time = 3) {
        this.userLimit[plugin][userId] = Date.now() + time * 1000;
    }
    setGroupLimit(plugin, groupId, time = 3) {
        this.groupLimit[plugin][groupId] = Date.now() + time * 1000;
    }
    checkUserLimit(plugin, userId) {
        let now = Date.now();
        if (!this.userLimit[plugin][userId]) {
            return [true];
        } else {
            return [now >= this.userLimit[plugin][userId], Math.ceil((this.userLimit[plugin][userId] - now) / 1000)];
        }
    }
    checkGroupLimit(plugin, groupId) {
        let now = Date.now();
        if (!this.groupLimit[plugin][groupId]) {
            return [true];
        } else {
            return [now >= this.groupLimit[plugin][groupId], Math.ceil((this.groupLimit[plugin][groupId] - now) / 1000)];
        }
    }
}


module.exports = {
    TimerManager,
    MessageLimit
}
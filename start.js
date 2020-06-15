const {
    App
} = require('koishi');
require('koishi-database-mysql');
const startConf = require('./config/start.config')
const app = new App(startConf);
const init = require('./init');
init(app);
app.start()

process.on("uncaughtException", function (err) {
    console.error("未处理错误: ", err);
});
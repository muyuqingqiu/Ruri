# Ruri
本项目 基于 [koishi](https://koishi.js.org/) 开发，运行于 [Node.js](https://nodejs.org/) 环境。


## 功能介绍

Ruri机器人目前以下几个功能：

- **你问我答**

- **音乐推送**：每日10点推送随机网易云音乐歌曲（歌曲来源是自定义的用户喜欢列表），也可以使用指令触发随机推送或根据id推送音乐

- **图片推送**

- **语音推送**

更多功能请期待后续更新

## 部署

运行项目前，需要自行安装和配置 [Node.js](https://nodejs.org/) ，[CoolQ](https://cqp.cc) 和 [CQHTTP](https://cqhttp.cc)， [Mongodb](https://www.mongodb.org.cn/)环境。
其中[CoolQ](https://cqp.cc) 和 [CQHTTP](https://cqhttp.cc)的安装可以参考[HoshinoBot部署指南](https://github.com/Ice-Cirno/HoshinoBot#%E9%83%A8%E7%BD%B2%E6%8C%87%E5%8D%97)

以上环境安装成功后，将 `default_config`文件夹改名为`config`文件夹。
然后修改`start.config.js`中的字段，字段含义请参考[koishi](https://koishi.js.org/guide/config-file.html)
到这里就可以尝试使用`node start.js`来启动机器人，如在log中看到输出成功，那么恭喜你，机器人已经初步启动了
由于本机器人目前依赖于[Mongodb](https://www.mongodb.org.cn/)做数据持久化，因此接下来需要安装启动`mongodb`，相关方法请自行baidu。`mongodb`启动成功后，到`init/index.js`文件夹下修改以下代码

    mongoose.connect('mongodb://localhost(:端口号,默认可以不用填)/你数据库名', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

此时重启机器人，如果log中出现MongoDB 连接成功，代表机器人已经可以正式运行了。

除此之外，机器人运行中有一些额外参数可以设置。这些设置都在`config/running.config.js`下。相关字段含义已在文件中说明，请自行查看。

## 其他注意
- 本机器人的功能全部基于qq群开发，请将机器人拉至同一群中再进行功能尝试。
- 本机器人使用了[koishi](https://koishi.js.org/guide/config-file.html)的插件式开发，各个插件均可自行开关。
- 如要使用各个插件，需先至`plugins`文件夹下，将对应模块下的`defaut.config.js`重命名为`config.js`。并且自行配置各个字段。
- 语音推送插件原本是为了推送VTB[兔田佩克拉](https://space.bilibili.com/443305053?from=search&seid=17177937245445599866)的语音而写的，通过简单的修改也可推送其他语音文件。插件文件夹中附带了一份`voice.json`数据，该数据来源于[peko-button](https://github.com/Coceki/peko-button)，相关语音资源也可到该项目下查找。
- 音乐推荐中使用了[NeteaseCloudMusicApi](https://binaryify.github.io/NeteaseCloudMusicApi/)获取网易云音乐相关数据。`tools`文件夹下已经附带，无需另外安装。
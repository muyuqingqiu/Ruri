module.exports = {
    self_id: '', //机器人的qq号
    plugins: ['q_and_a', 'netmusic', 'send_image', 'peko_voice'], //启用的插件
    nick: 'pekora',//机器人昵称
    message: {
        msg_prefix: '',//机器人指令触发前缀
        msg_suffix: '',//机器人回复口癖
    },
    res_groups: [],//响应哪些群
    super_id: '',//主人qq号
    vip_ids: [],
    admin_ids: [],
    disabled_plugins: []//全局停用插件列表
}
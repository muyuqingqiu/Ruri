const voiceJson = require('./voice.json');
module.exports = {
    allVoice: (function () {
        let voiceList = voiceJson.groups.map(group => {
            return group.voicelist;
        }).flat()
        return voiceList;
    })(),
    pekovoicePath:'/'
}
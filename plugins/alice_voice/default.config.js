const voiceJson = require('./voice.json');
module.exports = {
    allVoice: (function () {
        let voiceList = voiceJson.map(group => {
            return group.fileNames.map(voice => {
                return {
                    voice: `${encodeURIComponent(group.liveName)}/${encodeURIComponent(voice)}`,
                    name: `${group.liveName.split('_')[1]}：${voice.split('_')[1]}`
                }
            });
        }).flat()
        return voiceList;
    })(),
    pekovoicePath: 'https://mononobe-button.herokuapp.com/voice'
}
export default function (store) {
    const ipcRenderer = require('electron').ipcRenderer

    ipcRenderer.on('main-process-messages', (event, arg) => {
        console.log(store)
        console.log(arg);
    });

}

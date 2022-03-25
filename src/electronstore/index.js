import {app, ipcMain} from 'electron'
import Store from 'electron-store';

const store = new Store();
app.on("ready", async () => {
    ipcMain.on('getStore', (event, arg) => {
        event.reply(arg.name, {
            form: {
                system: store.get("system"),
                url: store.get("url"),
                userName: store.get("userName"),
                password: store.get("password"),
                ieiUrl: store.get("ieiUrl"),
                updateAddress: store.get("updateAddress"),
            }
        })
    })
    ipcMain.on('setStore', (event, arg) => {
        store.set("system", arg.system)
        store.set("url", arg.url)
        store.set("userName", arg.userName)
        store.set("password", arg.password)
        store.set("ieiUrl", arg.ieiUrl)
        store.set("updateAddress", arg.updateAddress)
    })

    ipcMain.on('getModuleStore', (event, arg) => {
        event.reply(arg.name, {
            module: store.get("module"),
        })

    })
    ipcMain.on('getSettingFinish', (event, arg) => {
        event.reply(arg.name, {
            settingFinish: store.get("settingFinish"),
        })
    })
    ipcMain.on('setModuleStore', (event, arg) => {
        console.log(arg)
        store.set("module", arg)
        store.set("settingFinish", 1)
    })


    ipcMain.on('getPathForm', (event, arg) => {
        event.reply(arg.name, store.get("pathForm"))
    })

});

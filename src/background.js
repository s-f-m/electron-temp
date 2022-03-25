'use strict'

import {app, BrowserWindow, ipcMain, Menu, protocol, Tray} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import './electronstore'
import fs from "fs";
import path from 'path';
import Store from "electron-store";
import {deleteLog} from "./utils/deleteLog";
import {customLogger, errorLogger} from "./utils/logger";
import {autoUpdater} from 'electron-updater'

const isDevelopment = process.env.NODE_ENV !== 'production'

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.exit(0);
}
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
])

let win;

async function createWindow() {
    Menu.setApplicationMenu(null)
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        minWidth: 1100,
        minHeight: 700,
        show: false,
        contextIsolation: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.on("close", (e) => {
        e.preventDefault();
        win.hide()
    });
    win.on('ready-to-show', function () {
        win.show();
        handleUpdate();
    })
    win.on('render-process-gone', function (event, webContents, details) {
        customLogger("crash", details);
        win.relaunch()
    })
    win.on('child-process-gone', function (event, webContents, details) {
        customLogger("crash", details);
        win.relaunch()
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        win.loadURL('app://./index.html')
    }

    function handleUpdate() {
        const store = new Store();
        let updateAddress = store.get("updateAddress")
        if (updateAddress != null) {
            const returnData = {
                error: {status: -1, msg: '检测更新查询异常'},
                checking: {status: 0, msg: '正在检查应用程序更新'},
                updateAva: {status: 1, msg: '检测到新版本，正在下载,请稍后'},
                updateNotAva: {status: -1, msg: '您现在使用的版本为最新版本,无需更新!'},
            };
            try {
                autoUpdater.setFeedURL(updateAddress);
            }catch (e) {
                console.log(e)
            }


            //更新错误
            autoUpdater.on('error', function (error) {
                errorLogger("----------------------------")
                errorLogger(error)
                sendUpdateMessage(returnData.error)
            });
            //检查中
            autoUpdater.on('checking-for-update', function () {
                sendUpdateMessage(returnData.checking)
            });
            //发现新版本
            autoUpdater.on('update-available', function (info) {
                sendUpdateMessage(returnData.updateAva)
            });
            //当前版本为最新版本
            autoUpdater.on('update-not-available', function (info) {
                setTimeout(function () {
                    sendUpdateMessage(returnData.updateNotAva)
                }, 1000);
            });
            // 更新下载进度事件
            autoUpdater.on('download-progress', function (progressObj) {
                win.webContents.send('downloadProgress', progressObj)
            });
            autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
                ipcMain.on('isUpdateNow', (e, arg) => {
                    //some code here to handle event
                    autoUpdater.quitAndInstall();
                });
                // win.webContents.send('isUpdateNow')
            });
            //执行自动更新检查
            autoUpdater.checkForUpdates();
        }
    }

    function sendUpdateMessage(text) {
        win.webContents.send('updateMessage', text)
    }

    ipcMain.on("checkForUpdate", (event, data) => {
        autoUpdater.checkForUpdates();
    });
    ipcMain.on("relaunch", () => {
        if (!isDevelopment) {
            app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
            app.exit(0)
        }
    })
}

let appTray = null;

function setTray() {
    const fileLocation = path.join(__static + '/../', 'static/logo.png')
    appTray = new Tray(fileLocation);
    let trayMenuTemplate =
        [{
            label: '退出',
            click: function () {
                app.exit(0);
                return;
            }
        },
            {
                label: '调试',
                click: function () {
                    try {
                        win.webContents.openDevTools({mode: 'right'});
                    } catch (E) {
                        errorLogger(E);
                    }
                }
            }];
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setToolTip('采集服务');
    appTray.setContextMenu(contextMenu);
    appTray.on('click', function () {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }
    });

}

app.on("will-quit", (event) => {
    return
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }

})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
    createWindow()
    const store = new Store();
    const modules = store.get("module")
    const system = store.get("system")
    const httpApi = require('./utils/httpApi')
    httpApi.default();
    fs.access(path.join(global.__static + "/../", "log"), fs.constants.F_OK, (err => {
        if (err) {
            fs.mkdirSync(path.join(global.__static + "/../", "log"))
        }
        deleteLog();
    }))

    ipcMain.on("requiredModules", (event, args) => {
        try {

            for (let i = 0; i < modules.length; i++) {
                let func = require('./background/' + modules[i].background)
                func.default();
                if (system === 'iei') {
                    func.iei();
                } else {
                    func.shinow();
                }
            }
        } catch (e) {
            errorLogger(e)
        }
    })
    try {
        setTray();
    } catch (E) {
        errorLogger(E)
    }

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

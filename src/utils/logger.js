import {BrowserWindow} from "electron";

const fs = require("fs");
const path = require("path");
export function customLogger(fileName, param,session) {
    if (BrowserWindow.getAllWindows().length) {
        BrowserWindow.getAllWindows()[0].send('main-process-messages', param);
    }
    let date = new Date();
    let realFileName = fileName + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + ".log";
    let flag = "";
    if (session){
        flag = session+"\t\t";

    }
    fs.access(path.join(global.__static + "/../", "log/" + realFileName), (err => {
        let data = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() + "\t\t"+flag+":" + JSON.stringify(param) + "\n"
        if (err) {
            fs.writeFile(path.join(global.__static + "/../", "log/" + realFileName), data, (err) => {
                if (err) {
                    console.log("失败")
                }
            });
        } else {
            fs.appendFile(path.join(global.__static + "/../", "log/" + realFileName), data, (err) => {
                if (err) {
                    console.log("失败")
                }
            });
        }
    }))
}

export function defaultLogger(param,session) {
    if (BrowserWindow.getAllWindows().length) {
        BrowserWindow.getAllWindows()[0].send('main-process-messages', param);
    }
    let date = new Date();
    let fileName = "collectService" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + ".log";
    let flag = "";
    if (session){
        flag = session+"\t\t";
    }
    fs.access(path.join(global.__static + "/../", "log/" + fileName), (err => {
        let data = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() + "\t\t"+flag+":" + JSON.stringify(param) + "\n"
        if (err) {
            fs.writeFile(path.join(global.__static + "/../", "log/" + fileName), data, (err) => {
                if (err) {
                    console.log(err)
                    console.log("失败")
                }
            });
        } else {
            fs.appendFile(path.join(global.__static + "/../", "log/" + fileName), data, (err) => {
                if (err) {
                    console.log(err)
                    console.log("失败")
                }
            });
        }
    }))
}

export function errorLogger(param,session) {
    if (BrowserWindow.getAllWindows().length) {
        BrowserWindow.getAllWindows()[0].send('main-process-messages', param);
    }
    let date = new Date();
    let fileName = "errorLog" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + ".log";
    let flag = "";
    if (session){
        flag = session+"\t\t";
    }
    fs.access(path.join(global.__static + "/../", "log/" + fileName), (err => {
        let data = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() + "\t\t"+flag+":" + JSON.stringify(param) + "\n"
        if (err) {
            fs.writeFile(path.join(global.__static + "/../", "log/" + fileName), data, (err) => {
                if (err) {
                    console.log(err)
                    console.log("失败")
                }
            });
        } else {
            fs.appendFile(path.join(global.__static + "/../", "log/" + fileName), data, (err) => {
                if (err) {
                    console.log(err)
                    console.log("失败")
                }
            });
        }
    }))
}

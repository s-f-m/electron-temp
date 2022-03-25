import fs from "fs";
import {errorLogger} from "@/utils/logger";
import path from "path";

const pathSep = path.sep

export default function (watchPath, format, filePrefix, func) {
    const chokidar = require('chokidar');
    try {
        fs.accessSync(watchPath, fs.constants.F_OK)
    }catch (E){
        errorLogger("文件路径不存在：" + watchPath)
        return null;
    }
    let watcher = chokidar.watch(watchPath, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
        depth: 0,
        awaitWriteFinish: {
            stabilityThreshold: 10,
            pollInterval: 100
        }
    });
    watcher.on('add', async function (path) {
        importFile(path,format,filePrefix,func)
    }).on('change', async function (path) {
        importFile(path,format,filePrefix,func)
    });
    return watcher;
}

export function moveFile(flag, path, fileName, format) {
    let changePath;
    if (flag) {
        changePath = path + pathSep + "backup"
    } else {
        changePath = path + pathSep + "error"
    }
    let date = new Date();
    let chageName = "" + date.getFullYear() + (date.getMonth() + 1) + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + "." + format;
    chageName = fileName.replace('.' + format, '-' + chageName)
    fs.access(changePath, (err => {
        if (err) {
            fs.mkdirSync(changePath)
        }
        fs.copyFile(path + pathSep + fileName, changePath + pathSep +  chageName, () => {
            fs.unlink(path + pathSep +  fileName, e => {
                errorLogger(e)
            })
        })
    }))
}

export function fileExists(path) {
    try {
        fs.accessSync(path);
        return true
    } catch (err) {
        return false
    }
}

function importFile(path,format,filePrefix, func) {
    let filename = path.split(pathSep)[path.split(pathSep).length - 1];
    let index = filename.lastIndexOf(".");
    let ss = filename.substr(index + 1);
    let s;
    if (filePrefix == null) {
        s = "^";
    } else {
        s = "^" + filePrefix
    }
    let re = new RegExp(s);
    if ((ss === format ||ss===format.toLocaleUpperCase()) && re.test(filename)) {
        console.log(filename)
        fs.readFile(path, {flag: 'rs+', signal: true}, (err1, buffer) => {
            if (!err1) {
                func(buffer, new TextDecoder('GBK').decode(buffer), filename);
            } else {
                errorLogger("2" + filename + err1)
            }
        });
    }
}

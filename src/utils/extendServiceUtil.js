import Store from 'electron-store';
import {BrowserWindow} from "electron";

var request = require('request');

const desUtil = require('./desUtil');

export function postShinow(method, requestBody, func) {
    const store = new Store();

    let user = {"UserName": store.get('userName'), "UserPassword": store.get('password')};
    let userJson = desUtil.encrypt(JSON.stringify(user));
    request.post(store.get("url") + "/RestService.asmx/MBS_CPPService/CPPHttpHandler/Token", {
        body: userJson
    }, function (error, response, body) {
        const result = JSON.parse(desUtil.decrypt(body));
        const token = result.Data;
        const requestJson = desUtil.encrypt(JSON.stringify(requestBody));
        BrowserWindow.getAllWindows()[0].send('main-process-messages', "shinowparam");
        BrowserWindow.getAllWindows()[0].send('main-process-messages', requestBody);
        request.post(store.get("url") + '/RestService.asmx/MBS_CPPService/CPPHttpHandler/' + method + '?token=' + encodeURIComponent(token), {
            body: requestJson
        }, function (error, response, body) {
            BrowserWindow.getAllWindows()[0].send('main-process-messages', "shinow");
            BrowserWindow.getAllWindows()[0].send('main-process-messages', desUtil.decrypt(body));
            const result = JSON.parse(desUtil.decrypt(body));
            let obj ;
            if (result.IsSuccess){
                if (result.Data.ResultCode==='0001'){
                    obj = {
                        success:false,
                        title:"错误",
                        category:"error",
                        message:result.Data.ErrMsg,
                        detail:result.Data.ErrMsg
                    }
                }else{
                    obj = {
                        success:true,
                        message:"保存成功"
                    }
                }
            }else{
                obj = {
                    success:false,
                    message:result.ErrorMessage,
                    title:"错误",
                    category:"error",
                    detail:result.ErrorMessage
                }
            }
            func(obj)
        })
    });
}

export function basoShinow(method, requestBody, func) {
    const store = new Store();

    let user = {"UserName": store.get('userName'), "UserPassword": store.get('password'),"Time":new Date()};
    let userJson = desUtil.encrypt(JSON.stringify(user));
    request.post(store.get("url") + "/RestService.asmx/MBS_ShareQueryApi/Api/token", {
        body: userJson
    }, function (error, response, body) {
        const result = JSON.parse(desUtil.decrypt(body));
        const token = result.Data;
        const requestJson = desUtil.encrypt(JSON.stringify(requestBody));
        BrowserWindow.getAllWindows()[0].send('main-process-messages', "shinowparam");
        BrowserWindow.getAllWindows()[0].send('main-process-messages', requestBody);
        request.post(store.get("url") + '/RestService.asmx/MBS_ShareQueryApi/Api/BeiSuo/' + method + '?token=' + encodeURI(token), {
            body: requestJson
        }, function (error, response, body) {
            BrowserWindow.getAllWindows()[0].send('main-process-messages', "shinow");
            BrowserWindow.getAllWindows()[0].send('main-process-messages', desUtil.decrypt(body));
            const result = JSON.parse(desUtil.decrypt(body));
            func(result)
        })
    });
}
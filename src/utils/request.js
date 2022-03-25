import Store from "electron-store";
import request from "request";
import {customLogger, defaultLogger, errorLogger} from "./logger";
import qs from 'qs'
import {BrowserWindow} from "electron";

const desUtil = require('./desUtil');
const store = new Store();
const system = store.get("system");

export function requestPost(apiName, params, func,session,cookie) {
    let obj
    getToken().then(res => {
        if (res.success) {
            if (system === 'shinow') {
                let url = store.get("url");
                if (res.success) {
                    request.post(url + '/RestService.asmx/MBS_CPPService/CPPHttpHandler/' + apiName + '?token=' + encodeURIComponent(res.token), {
                        rejectUnauthorized: false,
                        body: desUtil.encrypt(JSON.stringify(params))
                    }, function (error, response, body) {
                        if (error) {
                            errorLogger(error,session)
                        } else {
                            const result = JSON.parse(desUtil.decrypt(body));
                            defaultLogger({'system': system, 'apiName': apiName, 'request': params, 'response': result},session)
                            let obj;
                            if (apiName==='GetBloodInfo'){
                                obj=result;
                            }else if (result.IsSuccess) {
                                if (result.Data.ResultCode === '0001') {
                                    obj = {
                                        success: false,
                                        title: "错误",
                                        category: "error",
                                        message: result.Data.ErrMsg,
                                        detail: result.Data.ErrMsg
                                    }
                                } else {
                                    if (apiName==='GetBloodVolume'){
                                        obj = {
                                            success: true,
                                            message: "保存成功",
                                            volume: Number.parseInt(result.Data.VolumeData.Volume)
                                        }
                                    }else{
                                        obj = {
                                            success: true,
                                            message: "保存成功"
                                        }
                                    }
                                }
                            } else {
                                obj = {
                                    success: false,
                                    message: result.ErrorMessage,
                                    title: "错误",
                                    category: "error",
                                    detail: result.ErrorMessage
                                }
                            }
                            func(obj)
                        }
                    })
                } else {
                    obj = {
                        success: false,
                        message: res.message,
                        title: "错误",
                        category: "error",
                        detail: res.message
                    }

                    func(obj)
                }

            } else {
                let url = store.get("ieiUrl")
                const j = request.jar();
                const cookie = request.cookie("SESSIONID="+session);
                j.setCookie(cookie, url);
                var options = {
                    method: 'POST',
                    url: url + apiName + "?token=" + encodeURIComponent(res.token),
                    form: params,
                    rejectUnauthorized: false,
                    jar:j
                };
                request(options, function (error, response, body) {
                    if (BrowserWindow.getAllWindows().length) {
                        BrowserWindow.getAllWindows()[0].webContents.send("main-process-messages","发请求util")
                    }
                    if (error) {
                        errorLogger(error)
                    } else {
                        defaultLogger({'system': system, 'apiName': apiName, 'request': params, 'response': body},session)
                        func(body)
                    }
                })


                // request.post(url + apiName + "?token=" + encodeURIComponent(res.token), {
                //     headers: {
                //         "content-type": "application/json",
                //     },
                //     json: true,
                //     body: params
                // }, function (error, response, body) {
                //     if (error){
                //         errorLogger(error)
                //     }else {
                //         defaultLogger({'system': system, 'apiName': apiName, 'request': params, 'response': body})
                //         func(body)
                //     }
                // })
            }
        } else {
            let obj = {
                success: false,
                message: res.message,
                title: "错误",
                category: "error",
                detail: res.message
            }
            func(obj)
        }
    }, err => {
        obj = {
            success: false,
            message: err.message,
            title: "错误",
            category: "error",
            detail: err.message
        }
        func(obj)
    })
}

export function requestGet(apiName, params, func) {
    getToken().then(function (value) {
        if (system === 'shinow') {
            let url = store.get("url")
            request(url + apiName + "?token=" + value.token + "&" + qs.stringify(params), {
                rejectUnauthorized: false
            }, function (err, response, body) {
                if (err) {
                    errorLogger(err)
                } else {
                    defaultLogger({'system': system, 'apiName': apiName, 'request': params, 'response': body})
                    func(body)
                }
            })
        } else {
            const url = store.get("ieiUrl")
            request(url + apiName + "?token=" + value.token + "&" + qs.stringify(params), {
                rejectUnauthorized: false
            }, function (err, response, body) {
                if (err) {
                    errorLogger(err);
                } else {
                    defaultLogger({'system': system, 'apiName': apiName, 'request': params, 'response': body})
                    func(body)
                }
            })
        }
    }, function (error) {
        errorLogger(error)
    })
}

function getToken() {
    return new Promise((resolve, reject) => {
        if (system === 'shinow') {
            let url = store.get("url");
            let params = {"UserName": store.get('userName'), "UserPassword": store.get('password')};
            let paramsDes = desUtil.encrypt(JSON.stringify(params));
            request.post(url + "/RestService.asmx/MBS_CPPService/CPPHttpHandler/Token", {
                rejectUnauthorized: false,
                body: paramsDes
            }, function (error, response, body) {
                if (error) {
                    errorLogger(error)
                } else {
                    try {
                        const result = JSON.parse(desUtil.decrypt(body));
                        if (result.IsSuccess) {
                            resolve({
                                success: true,
                                message: null,
                                token: result.Data
                            })
                        } else {
                            resolve({
                                success: false,
                                message: result.ErrorMessage,
                                token: result.Data
                            })
                        }
                    } catch (e) {
                        errorLogger(e)
                        resolve({
                            success: false,
                            message: "网络连接错误，请联系管理员",
                            token: null
                        })
                    }

                }
            })
        } else {
            let url = store.get("ieiUrl");
            let params = {"id": '1', "password": 'shinow'};
            request.get(url + "/token?" + qs.stringify(params), {
                rejectUnauthorized: false
            }, function (error, response, body) {
                if (!error) {
                    try {
                        const result = JSON.parse(body);
                        resolve(result)
                    } catch (r) {
                        errorLogger(r)
                        reject(r)
                    }
                } else {
                    errorLogger("error")
                    errorLogger(error)

                }
            })
        }
    })
}

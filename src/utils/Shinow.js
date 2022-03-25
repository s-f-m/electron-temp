import Store from 'electron-store';
import {requestPost} from "@/utils/request";

export function conversation(conversations,func,session) {
    const store = new Store();
    let shinow = {
        UserName: store.get('userName'),
        PassWord: store.get('password'),
        FileName: "",
        bmpStr: "",
        preparationDeviceInterfaceID: "",
        ConversionInfos: conversations,
        DataDeptID: "0",
        ProcessStr: null
    }

   return requestPost('Conversion', shinow,func,session);
}

export function bloodVolumeChange(weighs,func) {
    return requestPost('Weigh', weighs,func);
}

export function basoGetBldInfo(data,func) {
    const extendServiceUtil = require('./extendServiceUtil');
    extendServiceUtil.basoShinow('GetBldInfo', data,func);
}
export function basoGetBldInfos(data,func) {
    const extendServiceUtil = require('./extendServiceUtil');
    extendServiceUtil.basoShinow('GetBldInfos', data,func);
}

export function getBloodVolume(donCode,func) {
    return requestPost('GetBloodVolume', donCode,func);
}
export function getBloodInfo(donCode,func){
    return requestPost('GetBloodInfo', donCode,func);
}
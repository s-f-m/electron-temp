import CryptoJS from 'crypto-js'
import {SM4} from 'gm-crypto'

export function encrypt(message) {
    const key = 'shinow90'
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

export function decrypt(ciphertext) {
    const key = 'shinow90'
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
    }, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

export function sm4decrypt(data,key,options) {
    return SM4.decrypt(data, Buffer.from(key,'utf8').toString('hex'), options);
}
export function sm4Encrypt(data,key,options) {
    return SM4.encrypt(data, Buffer.from(key,'utf8').toString('hex'), options)
}

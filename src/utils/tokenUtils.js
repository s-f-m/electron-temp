const jwt = require('jsonwebtoken');
//tokenUtil为引入公共文件
const signkey = 'cy';

const expiresIn = {
    expiresIn: 3600 * 24 * 3
}
// 密钥
exports.secret = signkey;
exports.expiresIn = expiresIn;

exports.setToken = function (username, userId, permission) {
    return new Promise((resolve) => {
        const token = jwt.sign({
            username: username,
            userId: userId,
            permission: permission
        }, signkey, {expiresIn: 3600 * 24 * 3});
        resolve(token);
    })
}

exports.verToken = function (token) {
    return new Promise((resolve) => {
        var info = jwt.verify(token, signkey, (error, res) => {
            var data = {}
            if (error) {
                data.code = '01';
                data.obj = error;
            } else {
                data.code = '00';
                data.obj = res;
            }
            return data
        });
        resolve(info);
    })
}
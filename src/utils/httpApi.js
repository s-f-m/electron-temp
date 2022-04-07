import {defaultLogger} from "./logger";

let api = null;
var cb0 = function (req, res, next) {
    next()
    if (res.statusCode !== 200) {
        return res.status(500).send(res.message)
    }
}
const jwt = require('jsonwebtoken');
const signKey = 'shinow';

function setToken(username, userid) {
    // return new Promise((resolve,reject)=>{
    return jwt.sign({
        name: username,
        _id: userid
    }, signKey, {expiresIn: 3600});
    // resolve(token);
    // })
}

// function verToken  (token){
//     return new Promise((resolve,reject)=>{
//       return  jwt.verify(token,signKey);
//         resolve(info);
//     })
// }

var log4js = require('log4js');
log4js.configure({
    replaceConsole: true,
    pm2: true,
    appenders: {
        stdout: {  //其他日志
            type: 'dateFile',
            filename: 'logs/out',
            maxLogSize: 102400,
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        req: {  //请求转发日志
            type: 'dateFile',    //指定日志文件按时间打印
            filename: 'logs/reqlog/req',  //指定输出文件路径
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        err: {  //错误日志
            type: 'dateFile',
            filename: 'logs/errlog/err',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        oth: {  //其他日志
            type: 'dateFile',
            filename: 'logs/othlog/oth',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        }

    },
    categories: {
        //appenders:采用的appender,取appenders项,level:设置级别
        default: {appenders: ['stdout', 'req'], level: 'debug'},
        err: {appenders: ['stdout', 'err'], level: 'error'},
    }
});
var logger = log4js.getLogger('default');

var expressJwt = require('express-jwt');

export default function () {
    const express = require("express");
    api = express();
    api.use(express.json())
    api.use(express.urlencoded({extended: true}))
    // 解析token获取用户信息
    api.use(expressJwt({
        secret: signKey,
        algorithms: ['HS256'],
        getToken: function fromHeaderOrQuerystring(req) {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                return req.headers.authorization.split(' ')[1]
            } else if (req.query && req.query.token) {
                return req.query.token
            }
            return null
        },
    }).unless({
        path: ['/token']//除了这个地址，其他的URL都需要验证
    }));
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    api.use(cookieParser('sessiontest'));
    api.use(session({
        secret: 'sessiontest',
        resave: true,
        saveUninitialized: true
    }));
    api.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            if (err.code === 'invalid_token') {
                res.status(401).send({"success": false, "message": "无效的token", "detail": "无效的token"});
            } else if (err.code === 'credentials_required') {
                res.status(401).send({"success": false, "message": "未找到token", "detail": "未找到token"});
            } else {
                res.status(401).send({"success": false, "message": "访问未被授权", "detail": err});
            }
        } else {
            res.status(500).send({"success": false, "message": err.body, "detail": err})
        }

    });
    // api.use(log4js.connectLogger(logger,  {level:'auto', format: (req, res, format) =>format(`:method :url  :status  :response-time ms ${JSON.stringify(req.body)}`)}));
    api.listen( <%=port%> )

    api.get('/token', function (req, res, next) {
        req.query.id
        if (req.query.id==='1'&&req.query.password==='shinow'){
            let token = setToken('shinow', '1')
            return res.send({success: true, token: token, expires_in: new Date()});
        }else{
            return res.send({success: false, "title": "错误",message: "您不是合法认证的用户，请与管理员联系！","category": "error"});
        }

    })
    api.all('/*', function (req, res, next) {
        req.session.name = new Date().getTime()
        console.log(req.path)
        defaultLogger(req.path+"    "+JSON.stringify(req.body),req.session.name)
        next()
    })
}

export function getLogger() {
    return logger
}

export function post(path, func) {
    api.post(path, [cb0, func]);
}

export function get(path, func) {
    api.get(path, [cb0, func]);
}

export function all(path, func) {
    api.all(path, [cb0, func]);
}

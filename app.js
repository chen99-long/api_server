//导入express模块
const express = require('express');
//创建服务器实例
const app = express();
//-----------------------配置cors跨域------------------
// 导入cors模块
const cors = require('cors');
//配置cors中间件
app.use(cors());
// ------------------------配置解析表单数据的中间件---------------
app.use(express.urlencoded({ extended: false }));
// 响应数据的中间件
app.use(function(req, res, next) {  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况  
    res.cc = function(err, status = 1) {  
        res.send({           
            status, // 状态
            message: err instanceof Error ? err.message : err,
              // 状态描述，判断 err 是 错误对象 还是 字符串
             
        })
    } 
    next()
})

// 解析token文件
// 导入配置文件
const config = require('./config')

// 解析 token 的中间件
const expressJWT = require('express-jwt')

// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))


//捕捉验证错误的中间件
const joi = require('@hapi/joi')
    // 错误中间件
app.use(function(err, req, res, next) {
    if (err instanceof joi.ValidationError) return res.cc(err) 
        // 捕获身份认证失败的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    res.cc(err)
})








// 导入并使用路由模块
const UseRouter = require('./router/user');
app.use('/api', UseRouter);

//启动服务器
app.listen('3007', function() {
    console.log('server running at 127.0.0.1:3007');
});
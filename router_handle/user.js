//把router的处理函数写在这里
//1.导入数据库连接对象
const db = require('../db/index');
//导入给密码加密的中间件
const bcrypt = require('bcryptjs');
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
    //暴露注册函数
exports.regUser = (req, res) => {

    //-------------判断用户名是否合法-----------
    //1.接收表单数据
    const userinfo = req.body;
    //2.判断是否为空
    if (!userinfo.username || !userinfo.password) {
        return res.cc('用户名或密码不能为空')
    }


    // ------------------判断用户名是否被占用------------

    // 2.定义sql语句，在数据库中查找一下用户输入的用户名
    const sqlStr = `select * from ev_users where username=?`
        // 执行sql语句
    db.query(sqlStr, [userinfo.username], (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.length > 0) return res.cc('用户名被占用，请更换其他用户名！');
        /*         res.send({ //判断一下在数据库中是否有那个用户名，如果有，则返回被占用
                        status: 1,
                        message: '用户名被占用，请更换其他用户名！'
                    }) */

        //用户名可用
        // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)

        //插入新用户
        const sql = 'insert into ev_users set ?'
            //调用db.query执行sql语句
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
            //判断sql是否执行成功
            if (err) {
                return res.send(err);
            }
            if (results.affectedRows !== 1) {
                // 如果影响行数不是1
                return res.cc(err);
            }
            // 注册成功
            res.cc('注册成功', 0);
        })


    })
}

// 暴露登录函数
exports.login = (req, res) => {
    const userinfo = req.body
    const sql = `select * from ev_users where username=?`
    db.query(sql, userinfo.username, function(err, results) {
            // 执行 SQL 语句失败
            if (err) return res.cc(err)
                // 执行 SQL 语句成功，但是查询到数据条数不等于 1
            if (results.length !== 1) return res.cc('登录失败！')
                // TODO：判断用户输入的登录密码是否和数据库中的密码一致
            const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)

            // 如果对比的结果等于 false, 则证明用户输入的密码错误
            if (!compareResult) {
                return res.cc('登录失败！')
            }

            // TODO：登录成功，生成 Token 字符串
            // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
            const user = {...results[0], password: '', user_pic: '' }
                // console.log(user);
                // 导入配置文件
            const config = require('../config')

            // 生成 Token 字符串
            const tokenStr = jwt.sign(user, config.jwtSecretKey, {
                expiresIn: '10h', // token 有效期为 10 个小时
            })
            res.send({
                status: 0,
                message: '登录成功！',
                // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
                token: 'Bearer ' + tokenStr,
            })
        })
        // 拿着用户输入的密码,和数据库中存储的密码进行对比

}
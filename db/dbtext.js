// /连接数据库
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'my_db_01'
});

connection.connect();

const fs = require('fs');
const jsonFile = './data.json'; //此处为你的json文件
const data = fs.readFileSync(jsonFile);
const jsonObj = JSON.parse(data);


(async() => {
    for (let w of jsonObj.data) {
        try {
            let addSql = `INSERT INTO b_sim
      (id,action,name,cause,info,img)
       VALUES(?,?,?,?,?,?)`;
            let addSqlParams = [uuidv1(), w.id, w.action, w.cause, w.info, w.img];
            await insert(addSql, addSqlParams);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    console.log('All completed!');
})();

function insert(addSql, addSqlParams) {
    return new Promise((resolve, reject) => {
        try {
            connection.query(addSql, addSqlParams, function(err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    reject(err);
                } else {
                    // console.log('INSERT ID:', result);
                    console.log('INSERT ID:', addSqlParams[0]);
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    })
}
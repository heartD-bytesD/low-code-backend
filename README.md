# low-code-backend

配套lowCode512，用于在后端保存项目的json数据

运行端口默认为5197

[API文档](https://www.apifox.cn/apidoc/shared-c464ad43-299b-49b2-94bc-0da92517c9d0/api-34974873)

## 使用说明
1. 安装依赖
```
npm install mysql
npm install moment
```
2. 安装mysql和创建数据库
```js
// 需要安装mysql以运行数据库服务
// 可以使用navicat, 导入lowcode512.sql文件建立数据库
```
3. 修改数据库连接配置
```js
// 在index.js中把user和password修改成你的数据库用户名和密码
const port = 5197
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: "lowcode", // 用户名
    password: "thisisademo", // 密码
    database: 'lowcode512'
})
```
4. 运行后端服务
```
node index.js
```

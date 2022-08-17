const http = require('http')
const mysql = require('mysql')
const { exit, hrtime } = require('process')
const {createHash} = require('node:crypto')
const moment = require('moment')
// 运行端口
const port = 5197
// 创建数据库连接
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: "lowcode",
    password: "thisisademo",
    database: 'lowcode512'
})
// 连接到本地数据库
try{
    mysqlConnection.connect()
}catch(e){
    console.error(`database failed to connect: ${e.toString()}`)
    exit(1)
}

// hash函数
const hashData = function(aData){
    const aTime = hrtime.bigint().toString()
    const aHash = createHash('sha256')
    aHash.update(aTime + aData)
    return aHash.digest('hex').slice(0, 16)
}

// 获取mysql类型的datetime
const getMysqlDatetimeNow = function(){
    return moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
}

// 请求sql
const queryMysql = function(sql, sql_args, tag, responseJson, exec_result, exec_err){
	// 转义防注入
	const sql_gen = mysql.format(sql, sql_args)
	mysqlConnection.query(sql_gen, [], function (err, result){
	    if(err){
	        responseJson.status = 400
	        responseJson.note = `failed to ${tag}: ${err.toString()}`
            exec_err(err, responseJson)
            return
	    }
        responseJson.status = 200
	    exec_result(result, responseJson)
	})
}


const server = http.createServer(async (request, response) => {
    const responseJson = {
        status: 400,
        type: "ack", // or "rep"
        project_id: "",
        project_data: "",
        project_create_time: "",
        project_last_edit_time: "",
        note: ""
    }
    // const requestJson = {
    //     type: "save", // or "read"
    //     project_id: "",
    //     project_data: "",
    //     note: ""
    // }
    const msg = await new Promise((resolve, reject) => {
        const bufs = []
        request.on('data', data => {
            bufs.push(data)
        })
        request.on('error', err => {
            responseJson.status = 400
            responseJson.note = "unexpected err during receiving data."
            resolve(responseJson)
        })
        request.on('end', () => {
            try{
                let reqDataRaw = Buffer.concat(bufs).toString()
                let reqData = JSON.parse(reqDataRaw)
                if(reqData.type == 'save'){
                    let project_id = reqData.project_id
                    let project_data = reqData.project_data
                    // 如果不存在原有项目id，则新建
                    // 否则进行更新
                    if(!project_id){
	                    // 保存项目数据
	                    project_id = hashData(project_data)
                        const sql = "INSERT INTO projects(project_id, project_data, project_create_time, project_last_edit_time) values(?, ?, ?, ?)"
                        const sql_now_time = getMysqlDatetimeNow()
	                    const sql_args = [project_id, project_data, sql_now_time, sql_now_time]
                        const tag = "insert"
                        queryMysql(sql, sql_args, tag, responseJson, function(reuslt, responseJson){
                            responseJson.project_id = project_id
                            resolve(responseJson)
                        }, function(err, responseJson){resolve(responseJson)})
                    }else{
                        const sql = "UPDATE projects SET project_data = ?, project_last_edit_time = ? where project_id = ?"
	                    const sql_args = [project_data, getMysqlDatetimeNow(), project_id]
	                    const tag = "update"
                        queryMysql(sql, sql_args, tag, responseJson, function(result, responseJson){
                            if(!result.affectedRows){
                                responseJson.status = 400
                                responseJson.note = "not found"
                                resolve(responseJson)
                                return
                            }
                            responseJson.project_id = project_id
                            resolve(responseJson)
                        }, function(err, responseJson){resolve(responseJson)})
                    }
                }else if(reqData.type == 'read'){
                    let project_id = reqData.project_id
                    // 读取项目数据
                    const sql = "SELECT * from projects WHERE project_id = ?"
                    const sql_args = [project_id]
                    const tag = "query"
                    queryMysql(sql, sql_args, tag, responseJson, function(result, responseJson){
                        // 默认选择第一项
                        if(!result[0]){
                            responseJson.status = 400
                            responseJson.note = "not found"
                            resolve(responseJson)
                            return
                        }
                        result = result[0]
                        responseJson.type = "rep"
                        responseJson.project_id = result.project_id
                        responseJson.project_data = result.project_data
                        responseJson.project_create_time = result.project_create_time
                        responseJson.project_last_edit_time = result.project_last_edit_time
                        resolve(responseJson)
                    }, function(err, responseJson){resolve(responseJson)})
                }else{
                    responseJson.status = 400
                    responseJson.note = "unsupported request type"
                    resolve(responseJson)
                }
            }catch(e){
                responseJson.status = 400
                responseJson.note = `unexpected error during data processing: ${e.toString()}`
                resolve(responseJson)
            }
        })
    })
    response.end(JSON.stringify(msg))
})

server.listen(port, () => {
    console.log(`lowcode-backend is listening on port ${port}`)
})

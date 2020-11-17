// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-f3c86f'
})

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  var rows = event.rows
  var skip = (event.page - 1) * rows
console.log("云函数 getQuestion event",event)
  return db.collection("question").where({
    course_no: event.course_no
  }).orderBy('createDate', 'desc').skip(skip).limit(rows).get()
}
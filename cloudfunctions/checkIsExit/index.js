// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-f3c86f'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command
  console.log("event course",event.course)
  return db.collection('course').where(event.course).update({
    data: {
      'course_status': 0
    }
  })
}
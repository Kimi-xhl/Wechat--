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
  var item = event.item
  return db.collection('course').update({
    data: {
      per_practice: 0,
      intelligent_practice: 0,
      update_time: new Date()
    }
  })


}
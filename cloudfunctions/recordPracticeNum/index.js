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
  var item = event.item
  return db.collection('course').where({
    account: event.account,
    course_no: event.course_no
  }).update({
    data: {
      per_practice: _.inc(event.per_num),
      intelligent_practice: _.inc(event.intell_num),
      update_time:new Date()
    }
  })


}
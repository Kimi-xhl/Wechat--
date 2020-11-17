// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'test-f3c86f'
})
// 云函数入口函数
exports.main = (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  console.log("云函数：", wxContext.OPENID)
  console.log("云函数 event：", event)
  return db.collection('course').where({
      account: _.eq(event.account),
      course_no: _.eq(event.course_no)
    })
    .update({
      data: {
        integral: _.inc(event.point),
        update_time:new Date()
      }
    })
   
}
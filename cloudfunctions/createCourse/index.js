// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-f3c86f'
})

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  var course = event.course
  course.course_status =0
  course.integral =0
  course.per_practice=0
  course.intelligent_practice=0
  course.study_time = 0,

  course.account=event.account
  course.user_type=event.user_type
  course.account =event.account
  // course.invitation_code=event.code
  return await db.collection('course').add({
    data:course
  })
 
}
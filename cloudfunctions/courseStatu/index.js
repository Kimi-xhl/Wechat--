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
  console.log("event", event)
  var sql = ''
  //教师解散课程，则将该课程所有学生及教师本人课程状态设为解散
  if (event.user_type == 1 && event.course_status == 2) {
    sql = db.collection('course').where({
      course_no: _.eq(event.course_no),
      class_no: _.eq(event.class_no),
      course_name:_.eq(event.course_name),
      course_status: _.in(event.status)//0,1
    })
  } 
   else {
    sql = db.collection('course').where({
      account: _.eq(event.account),
      course_no: _.eq(event.course_no),
      course_name: _.eq(event.course_name),
      user_type: _.eq(event.user_type),
      class_no: _.eq(event.class_no),
      course_status: _.in(event.status)

    })
  }
  var data = {
    course_status: event.course_status,
    update_time: new Date()
  }
  if (event.course_status == 2){
    data.dismiss_time=new Date()
  } else if (event.course_status == 1){
    data.exit_time = new Date()
  }
  return sql.update({
    data: data
  })

}
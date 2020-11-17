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

  
  return await db.collection('user').add({
    // data 字段表示需新增的 JSON 数据
    data: {
      user_type: event.type,
      account: event.account,
      name: event.name,
      // register_time: Date.parse(new Date()),
      register_time:new Date(),
      openid: wxContext.OPENID
    }
  })

}
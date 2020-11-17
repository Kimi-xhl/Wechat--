// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'test-f3c86f'
})
var result = {
  success: false,
  data: {},
  msg: ''
}
// 云函数入口函数
exports.main = async(event, context) => {
  console.log("event", event)
  const wxContext = cloud.getWXContext()
  console.log("wxContext", wxContext)
  const db = cloud.database()
  const _ = db.command
  var userPro = db.collection('user').where({
    openid: _.eq(wxContext.OPENID),
    account: _.eq(event.account)
  }).update({
    data: {
      account: event.newAccount,
      name: event.newName,
      update_time: new Date()
    }

   
  })
  var coursePro = db.collection("course").where({
    account: _.eq(event.account)
  }).update({
    data: {
      account: event.newAccount,
      update_time: new Date()

    }
  })

return  Promise.all([userPro, coursePro]).then(res => {
    console.log("promise all res", res)
    if (res[0].errMsg == 'collection.update:ok' && res[1].errMsg == 'collection.update:ok' ){
      result.success=true
      result.data=res
      return result
    }
    else{
      result.success = false
      result.data = res
      return result
    }
  }).catch(err => {
    console.log("err message", err)
    result.success = false
    result.data = res
    result.msg = err.toString()
    return result
  })

}
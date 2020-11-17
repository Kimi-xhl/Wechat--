//app.js
App({
  onLaunch: function () {

    var that = this
    wx.clearStorage()
    wx.cloud.init({
      traceUser: true,
      // env: 'prod-eudio'
      env: 'test-f3c86f'
    })
  
    // wx.hideTabBar({});
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // this.globalData = {}

  },
  globalData:{
    course_no:'',
    account:"",
    isUpdate:false,
    user:[]
  }
})

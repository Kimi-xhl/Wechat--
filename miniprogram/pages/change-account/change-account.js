// miniprogram/pages/bind_school_no/bind_school_no.js
const userUtils = require('../../utils/user.js')
const netUtils = require('../../utils/net.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newAccount: '',
    newName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  newAccount: function(e) {
    this.setData({
      newAccount: e.detail.value
    })
  },
  newName: function(e) {
    this.setData({
      newName: e.detail.value
    })
  },
  //修改账号，姓名
  changeAccount() {
    var _this = this
    var account = getApp().globalData.account
    //判断账号是否需修改，若需，则新账号在数据库中应不存在，若否，则数据库有该账号
    var accountLength = account == _this.data.newAccount ? 1 : 0
    if (!this.data.newAccount && this.data.newName) {
      wx.showToast({
        title: '账号，姓名不能为空',
        icon: 'none'
      })
      return
    }
    userUtils.checkAccount({
      "account": _this.data.newAccount
    }).then(res => {
      console.log('res.data.length', res.data.length, "accountLength", accountLength)
      if (res.data.length > accountLength) {
        wx.showToast({
          title: '该账号已存在',
          icon: 'none',
          duration: 2000
        })
        return
      } else {
        // wx.showLoading({
        //   title: '正在修改',
        //   icon:'none',
        //   duration:2000
        // })
        var params = {
          newAccount: _this.data.newAccount,
          newName: _this.data.newName,
          account: account
        }
        // wx.cloud.callFunction({
        //   name: 'changeAccount',
        //   data: {
        //     newAccount: _this.data.newAccount,
        //     newName: _this.data.newName,
        //     account: account
        //   }
        // }).then(res=>{
        //   wx.hideLoading()
        //   wx.showToast({
        //     title: 'success!',
        //   })
        //   console.log("changeAccount res",res)
        // })


        netUtils.callCloudFunc('changeAccount', params, "正在修改").then(res => {
          wx.showToast({
            title: 'success！',
            icon:'success',
            duration:2000
          })
          getApp().globalData.account=params.newAccount
          console.log('callCloudFunc changeAccount res', res)
        })
      }
    })
  }
})
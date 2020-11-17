// miniprogram/pages/tea_register/tea_register.js
const {
  $Toast
} = require('../../components/iview/base/index');
var userUtils = require("../../utils/user.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputAccount: "",
    inputPasswd: "",
    inputPasswd2: ""
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
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  inputAccount: function(e) {
    this.setData({
      inputAccount: e.detail.value
    })
  },
  inputPasswd: function(e) {
    this.setData({
      inputPasswd: e.detail.value
    })
  },
  inputPasswd2: function(e) {
    this.setData({
      inputPasswd2: e.detail.value
    })
  },
  registerTeacher: function() {
    var _this = this
    if (_this.data.inputAccount && _this.data.inputPasswd && _this.data.inputPasswd2) {
      if (_this.data.inputPasswd != _this.data.inputPasswd2) {
        $Toast({
          content: "密码两次输入不一致"
        })
        return;
      }
      userUtils.checkAccount({
        "account": _this.data.inputAccount
      }).then(res => {
        if (res.data.length > 0) {
          $Toast({
            content: '该账号已存在！'
          });
        } else {
          wx.cloud.callFunction({
            name: 'registerUser',
            data: {
              type: 1,
              passwd: _this.data.inputPasswd,
              account: _this.data.inputAccount
            },
            complete: res => {
              console.log("registerUser result", res)
              wx.showLoading({
                title: '正在加载页面',
              })
              wx.showLoading({
                title: '正在加载页面',
              })
              wx.navigateTo({

                url: '../teacher/teacher?account=' + _this.data.inputAccount,
              })
            }
          })
        }
      })
    } else {
      $Toast({
        content: '请输入账号密码！'
      });
    }


  },
  jump: function() {
    wx.showLoading({
      title: '正在加载页面',
    })
    wx.navigateTo({
      url: '../tea_login/tea_login',
    })
  }
})
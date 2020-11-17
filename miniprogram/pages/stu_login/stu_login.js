// miniprogram/pages/login/login.js
const {
  $Toast
} = require('../../components/iview/base/index');
var userUtils = require("../../utils/user.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
//判断显示学生登录或教师登录
    isShow: true,
    inputAccount: "",
    inputName: "",
  

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideLoading();
    // userUtils.checkUser().then(res => {
    //   console.log(res.data)
    //   if (res.data) {
    //     wx.showLoading({
    //       title: '正在加载页面',
    //     })
    //     wx.navigateTo({
    //       url: '../student/student?account='+res.data[0].account,
    //     })
    //   }
    // })
    console.log(options)
    // this.setData({
    //   isShow: options.isShow
    // })
    this.isShow = options.isShow
    wx.hideLoading()
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
    wx.hideLoading()
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

  switchView: function() {
    var _this = this
    console.log('aa')
    console.log(_this.data.isShow)
    _this.setData({
      isShow: !_this.data.isShow
    })
  },
  jump: function() {
    wx.showLoading({
      title: '正在加载页面',
    })
    wx.navigateTo({
      url: '../tea_register/tea_register',
    })
  },
  inputAccount: function(e) {
    // this.data.inputAccount = e.detail.value;
    this.setData({
      inputAccount: e.detail.value
    })

  },
  inputName: function(e) {
    // this.data.inputName = e.detail.value;
    this.setData({
      inputName: e.detail.value
    })

  },
 

  
  studentLogin: function() {
    var _this = this;
    var account = _this.data.inputAccount;
    if (_this.data.inputAccount && _this.data.inputName) {
      userUtils.checkAccount({
        "account": account
      }).then(res => {
        console.log("checkUserAccount", res)
        if (res.data.length > 0) {
        wx.showToast({
          title: '该账号已存在！',
          duration:2000
        })
          // $Toast({
          //   content: '该账号已存在！'
          // });
          return;
        } else {
          wx.cloud.callFunction({
            name: 'registerUser',
            data: {
              type: 0,
              name: _this.data.inputName,
              account: _this.data.inputAccount
            },
            complete: res => {
              console.log("registerUser result", res)
              wx.showLoading({
                title: '绑定成功，正在加载页面',
              })

              getApp().globalData.account = _this.data.inputAccount
              wx.redirectTo({
                url: '../student/student',
              })
              // wx.navigateTo({
              //   url: '../student/student?account=' + account,
              // })
            }
          })
        }

      })
    } else {
      $Toast({
        content: '请输入学号，姓名！'
      });
    }
  },
  // 教师登录
  teacherLogin: function() {
    var _this = this;
    var account = _this.data.inputAccount;
    if (_this.data.inputAccount && _this.data.inputName) {
      userUtils.checkAccount({
        "account": account
      }).then(res => {
        console.log("checkUserAccount", res)
        if (res.data.length > 0) {
          $Toast({
            content: '该账号已存在！'
          });
          return;
        } else {
          wx.showLoading({
            title: '正在注册',
          })
          wx.cloud.callFunction({
            name: 'registerUser',
            data: {
              type: 1,
              name: _this.data.inputName,
              account: _this.data.inputAccount
            },
            complete: res => {
              wx.hideLoading()
              console.log("registerUser result", res)
              wx.showLoading({
                title: '注册成功！正在加载页面',
              })
              getApp().globalData.account = _this.data.inputAccount
              wx.redirectTo({
                url: '../teacher/teacher',
              })
            }
          })
        }

      })
    } else {
      $Toast({
        content: '请输入账号，姓名！'
      });
    }
  }
})
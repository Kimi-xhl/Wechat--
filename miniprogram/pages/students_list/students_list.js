// miniprogram/pages/students_list/students_list.js
var userUtils = require("../../utils/user.js");
var commonrUtils = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    studentList: [],
    current: 'homepage',
    course_no: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this
    _this.setData({
        course_no: getApp().globalData.course_no
    })

    userUtils.getStudentList({
      "course_no": _this.data.course_no
    }).then(res => {
      console.log("studentList", res)
      for(var i=0;i<res.data.length;i++){
        console.log("account:",res.data[i].account,"study_time:",res.data[i].study_time)
        res.data[i].study_time = commonrUtils.getGapTime(res.data[i].study_time)
      }
      _this.setData({
        studentList: res.data
      })
    })
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

  handleChange({
    detail
  }) {
    console.log(detail)
    this.setData({
      current: detail.key
    });
  },
  returnMain: function() {
    wx.showLoading({
      title: '正在加载页面',
    })
    wx.redirectTo({
      url: '../teacher/teacher',
    })
  }
})
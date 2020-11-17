// miniprogram/pages/daily_questions/daily_questions.js
var userUtils = require("../../utils/user.js");
var integralUtils = require("../../utils/integral.js")
var courseUtils = require("../../utils/course.js")
const {
  $Toast
} = require('../../components/iview/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionList: [],
    current: 0,
    account: "",
    course_no: "",
    start_time: 0,
    entrance: '',
    showTip: true,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this;
    if (options.account) {
      _this.setData({
        account: options.account,
        course_no: options.course_no,
        start_time: options.start_time,
        entrance: options.entrance
      })
      console.log("options start_time:", options.start_time)
      console.log("this data time:", _this.data.start_time)
    } else {
      wx.getStorage({
        key: 'history',
        success: function(res) {
          _this.setData({
            account: res.data.account,
            course_no: res.data.course_no,
            start_time: res.data.start_time,
            entrance: res.data.entrance,
            current: res.data.current,
            questionList: res.data.questionList
          })
        },
        fail: function(err) {
          wx.showToast({
            title: '读取失败',
          })
        }
      })
      return
    }

    // 获取题目
    var qNum = 20
    if (_this.data.entrance == 'intell') {
      qNum = 5
    }
    userUtils.getQuesionsList({
      "num": qNum,
      "course_no": _this.data.course_no
    }).then(res => {
      console.log("result", res)
      if (res.length == 0) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '暂无该课程题目，点击确定返回',
          success(res) {
            if (res.confirm) {
              _this.setData({
                showTip: false
              })
              wx.navigateBack({
                delta: 1,
              })
            }
          }

        })
      }
      _this.setData({
        questionList: res
      })
      console.log("questionList", _this.data.questionList)
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log("onHide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var _this = this
    console.log("onUnload")
    if (!_this.data.showTip) {
      return
    }
    wx.showModal({
      title: '提示',
      content: '您有题目未做完，是否返回继续答题？',
      success(res) {
        if (res.confirm) {
          var history = {
            'questionList': _this.data.questionList,
            'current': _this.data.current,
            'account': _this.data.account,
            'course_no': _this.data.course_no,
            'start_time': _this.data.start_time,
            "entrance": _this.data.entrance
          }
          wx.setStorageSync('history', history)
          wx.navigateTo({
            url: '../daily_questions/daily_questions',
          })
        } else if (res.cancel) {
          return
        }
      }



    })
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
  // addPoint: function(selectAnwser) {
  //   if (selectAnwser == this.data.questionList[this.data.current].answer) {

  //     var _point =1
  //     wx.cloud.callFunction({
  //       // 云函数名称
  //       name: 'addPoint',
  //       // 传给云函数的参数
  //       data: {
  //         point: _point
  //       }
  //     })
  //   }
  // },

  // 选择答案
  onSelectAnswer: function(e) {
    if (this.data.questionList[this.data.current].selectAnswer) {
      return;
    }
    var option = e.target.id;
    console.log('选中选项：', option)
    this.data.questionList[this.data.current].selectAnswer = option;
    this.setData({
      questionList: this.data.questionList
    })
    console.log("选择", this.data.questionList)
    // console.log(this.data.questionList)
  },


  handleChangePage: function({
    detail
  }) {
    const type = detail.type;
    if (type === 'next') {
      if (!this.data.questionList[this.data.current].selectAnswer) {
        $Toast({
          content: '请先完成该题！'
        });
        return;
      }
      this.setData({
        current: this.data.current + 1
      });
    } else if (type === 'prev') {
      this.setData({
        current: this.data.current - 1
      });

    }
  },
  submit: function() {
    var _this = this
    _this.setData({
      showTip: false
    })
    console.log("start_time:", this.data.start_time)
    var study_time = new Date().getTime() - new Date(this.data.start_time).getTime()
    console.log("study_time", study_time)
    var params = {
      "questionList": this.data.questionList,
      "course_no": this.data.course_no,
      "account": this.data.account,
      "study_time": study_time
    }
    console.log("_this.data.entrance", _this.data.entrance)
    if (_this.data.entrance == 'per') {
      wx.cloud.callFunction({
        name: 'recordPracticeNum',
        data: {
          per_num: 1,
          account: _this.data.account,
          course_no: _this.data.course_no
        }
      }).then(res => {
        console.log("recordPracticeNum per result ", res)
      })
    } else {
      wx.cloud.callFunction({
        name: 'recordPracticeNum',
        data: {
          intell_num: 1,
          account: _this.data.account,
          course_no: _this.data.course_no
        }
      }).then(res => {
        console.log("recordPracticeNum intell result", res)
      })
    }

    courseUtils.addStudyTime(params)
    var ponit = integralUtils.addPoint(params);
    console.log("提交：", this.data.questionList)
    wx.showModal({
      title: '提示',
      content: '此次答题得分:' + ponit,
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在加载页面',
          })
          wx.navigateBack({
            url: '../index/index',
          })
        }

      }
    })

    console.log("点击成功")

  }
})
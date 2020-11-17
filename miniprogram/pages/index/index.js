//index.js
const app = getApp()
var integralUtil = require("../../utils/integral.js")
var userUtil = require("../../utils/user.js")
var courseUtil = require("../../utils/course.js")
var commonUtil = require("../../utils/common.js")
Page({
  data: {
    account: '??',
    course_no: '',
    integralList: [],
    myIntegralRank: '',
    userIntegral: "",
    hidden: true,
    userInfo: {},
    showLeft2: false,
    courseList: '',
    selectIndex: '',
    level:0,//等级
    percent:0//进度条值
  },

  onLoad: function(options) {
    console.log('options', options)
    var _this = this
    if (options.account) {
      _this.setData({
        account: options.account,
        course_no: options.course_no,
      })
    }
    courseUtil.getIntegral({
        "account": _this.data.account,
        "course_no": _this.data.course_no
      })
      .then(res => {
        console.log("getIntegral result:", res)
        console.log("getIntegral result:", res.data[0].integral)
        _this.setData({
          userIntegral: res.data[0].integral,
           level: parseInt(res.data[0].integral / 100),
          percent: res.data[0].integral % 100
        })
      
      })

      .then(res => {
        var params = {
          "course_no": _this.data.course_no,
          "num": 10,
          "integral": _this.data.userIntegral
        }
        courseUtil.getIntegralRank(
          params
        ).then(res => {
          console.log("getIntegralRank")
          _this.setData({
            integralList: res[1].data,
            myIntegralRank: (_this.data.userIntegral ? res[2].total + 1 : res[0].total) + "/" + res[0].total
          })
          wx.hideLoading()
          console.log("getIntegralRank result", res)
        })

      })




    // this.setData({
    //   hidden: this.data.hidden
    // })

    // //获取用户信息
    // userUtil.getOpenid()
    //   .then(res => {
    //     console.log('[云函数] [login] user openid: ', res.result.openid)
    //     console.log('[云函数] [login] res: ', res)
    //     app.globalData.openid = res.result.openid
    //   })
    //   .then(function() {
    //     return userUtil.getUserInfo({
    //       openid: app.globalData.openid
    //     }).then(res => {
    //       console.log('获取用户信息：', res.data);
    //       app.globalData.userinfo = res.data ? res.data[0] : undefined;
    //       // //判断用户是学生或老师
    //       // if (app.globalData.userinfo.user_type == '1') {
    //       //   wx.showTabBar({});
    //       // }
    //     })
    //   })
    //   .then(function() {
    //     console.log(app.globalData.userinfo);
    //     Promise.all([userUtil.getUserNum(), userUtil.getBiggerIntegralNum({
    //       integral: app.globalData.userinfo.integral
    //     })]).then(res => {
    //       console.log('获取用户排名及总人数', res);
    //       var totalUserNum = res[0].total;
    //       var userRank = res[1].total + 1;
    //       if (totalUserNum != 0) {
    //         _this.setData({
    //           myIntegralRank: userRank + '/' + totalUserNum,
    //           userIntegral: app.globalData.userinfo.integral,
    //           hidden: "false"
    //         });
    //       }

    //     })
    //   });

    // //获取积分排行
    // var _this = this;
    // integralUtil.getIntegralList({
    //   rows: 5
    // }).then(res => {
    //   console.log(res.data);
    //   _this.setData({

    //     integralList: res.data

    //   });
    // });
  },
  intoPractice: function() {
    var _this = this
    var params = {
      account: _this.data.account,
      course_no: _this.data.course_no
    }
    courseUtil.getPracticeTimes(params).then(res => {
      if (res.data[0].per_practice != 0) {
        wx.showToast({
          icon:'none',
          title: '今日答题次数已上限',
        })
        return
      } else {
        var start_time = new Date()
        console.log("index page start_time:", start_time)
        wx.showLoading({
          title: '正在加载页面',
        })
        wx.navigateTo({
          url: '../daily_questions/daily_questions?course_no=' + _this.data.course_no + '&account=' + _this.data.account + '&start_time=' + start_time +'&entrance=per'
        })
      }
    })
  },
  intoIntellPractice: function () {
    var _this = this
    var params = {
      account: _this.data.account,
      course_no: _this.data.course_no
    }
    courseUtil.getPracticeTimes(params).then(res => {
      if (res.data[0].intelligent_practice==3) {
        wx.showToast({
          icon: 'none',
          title: '今日答题次数已上限',
        })
        return
      } else {
        var start_time = new Date()
        console.log("index page start_time:", start_time)
        wx.showLoading({
          title: '正在加载页面',
        })
        wx.navigateTo({
          url: '../daily_questions/daily_questions?course_no=' + _this.data.course_no + '&account=' + _this.data.account + '&start_time=' + start_time+'&entrance=intell'
        })
      }
    })
  },
  onShow: function() {
    wx.hideLoading()
    var _this = this
    courseUtil.getIntegral({
        "account": _this.data.account,
        "course_no": _this.data.course_no
      })
      .then(res => {
        console.log("getIntegral result:", res)
        console.log("getIntegral result:", res.data[0].integral)
        _this.setData({
          userIntegral: res.data[0].integral,
          level: parseInt(res.data[0].integral / 100),
          percent: res.data[0].integral % 100

        })
      })

      .then(res => {
        var params = {
          "course_no": _this.data.course_no,
          "num": 10,
          "integral": _this.data.userIntegral
        }
        courseUtil.getIntegralRank(
          params
        ).then(res => {
          _this.setData({
            integralList: res[1].data,
            myIntegralRank: (_this.data.userIntegral ? res[2].total + 1 : res[0].total) + "/" + res[0].total
          })

          console.log("getIntegralRank result", res)
        })

      })
  },
  toggleLeft2: function() {
    this.setData({
      showLeft2: !this.data.showLeft2
    });
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
    wx.hideLoading()
    console.log("test1 onReady");
  }
})
// miniprogram/pages/student/student.js
const app = getApp()
const {
  $Toast
} = require('../../components/iview/base/index');
const courseUtils = require('../../utils/course.js')
const commonUtils = require('../../utils/common.js')
var userUtils = require("../../utils/user.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account: "未绑定",
    userInfo: {},
    courseList: [],
    showModalstatuss: false,
    getCourseInformation: {},
    showClassInformation: false,
    rows: 7,
    code: '',
    items: [{
        name: '课程信息',
      },
      {
        name: '退出课程',
      }
    ],
    selectCourse: '',
    showDialog: false,
    selectCourseImformation: '',
    page: 1,
    hasMoreData: true,
    pageSize: 7,
    showTip: false, //检测是否已绑定账号，决定是否显示绑定跳转
    checkUserType: 'stu', //检测账号类型是学生或老师

    //滑动实现开关抽屉页
    mark: 0,
    // newmark 是指移动的最新点的x轴坐标 
    newmark: 0,
    istoright: true,
    showMenuBar: false,
    //记录手指一开始触摸屏幕的位置，用来判断是点击还是滑动
    position: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("onLoad")
    wx.hideLoading()
    // console.log("getApp().globalData.account", getApp().globalData.account)
    // if (getApp().globalData.user.user_tyoe==1){
    //   wx.redirectTo({
    //     url: '../teacher/teacher',
    //   })
    // }
    // if(getApp().globalData.account){
    //   this.setData({
    //     account: getApp().globalData.account
    //     // account:'1607050229'
    //   })
    // }
    console.log("页面检测","onLoad")
    var _this = this
      userUtils.checkUser().then(res => {
        console.log("================")
        console.log(res)
        console.log(res.data)
        console.log("checkUser !res.data", !res.data[0])
        if (!res.data[0]) {
          wx.hideLoading()
          console.log("student page onShow account==未绑定")
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '还未绑定学号，点击确定绑定',
            success(res) {
              if (res.confirm) {
                wx.showLoading({
                  title: '正在加载页面',
                })
                wx.redirectTo({
                  url: '../stu_login/stu_login'
                })
              }
            }
          })
        } else if (res.data[0].user_type == 1) {
          wx.hideLoading()
          getApp().globalData.user = res.data[0]
          getApp().globalData.account = res.data[0].account
          wx.showLoading({
            title: '正在加载页面',
          })
          wx.redirectTo({
            url: '../teacher/teacher',
          })
        } else {
          wx.hideLoading()
          getApp().globalData.user = res.data[0]
          getApp().globalData.account = res.data[0].account
          // _this.setData({
          //   account: res.data[0].account,
          //   page: 1,
          //   courseList: []
          // })
          // _this.getCourseList()
        }
      })
  },
  getCourseList() {
    var _this = this
    var params = {
      "account": _this.data.account,
      "course_status": 0,
      "user_type": 0,
      "page": _this.data.page,
      "rows": _this.data.rows
    }
    courseUtils.getCourseList(
      params
    ).then(res => {
      console.log("getCourseList", res)
      if (res.data.length < _this.data.pageSize) {
        _this.setData({
          courseList: _this.data.courseList.concat(res.data),
          hasMoreData: false
        })
        wx.hideLoading()
      } else {
        _this.setData({
          courseList: _this.data.courseList.concat(res.data),
          page: _this.data.page + 1
        })
      }
      wx.hideLoading()
    })
  },
  onShow: function() {
    wx.hideLoading()
    console.log("onShow")
    var _this = this
    wx.showLoading({
      title: '正在加载',
    })
    if(getApp().globalData.account){
      this.setData({
        account: getApp().globalData.account
      })
    }
    console.log("onShow this account", _this.data.account)
    if (_this.data.account == '未绑定') {
      userUtils.checkUser().then(res => {
        console.log(res.data)
        console.log("checkUser !res.data", !res.data[0])
        getApp().globalData.user=res.data[0]
        if (!res.data[0]) {
          wx.hideLoading()
          console.log("student page onShow account==未绑定")
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '还未绑定学号，点击确定绑定',
            success(res) {
              if (res.confirm) {
                wx.showLoading({
                  title: '正在加载页面',
                })
                wx.redirectTo({
                  url: '../stu_login/stu_login'
                })
              }
            }
          })
        } else if (res.data[0].user_type == 1) {
          wx.hideLoading()
          getApp().globalData.account = res.data[0].account
          wx.showLoading({
            title: '正在加载页面',
          })
          wx.redirectTo({
            url: '../teacher/teacher',
          })
        } else {
          wx.hideLoading()
          getApp().globalData.account = res.data[0].account
          _this.setData({
            account: res.data[0].account
          })
          _this.getCourseList()
        }
      })
    } else {
      _this.setData({
        page:1,
        courseList:[]
      })
      _this.getCourseList()
      wx.hideLoading()
    }
    console.log("页面检测", "onshow")

  },
  onReady:function(){
    console.log("页面检测", "onReady")
  },
  onHide:function(){
    console.log("页面检测", "onHide")
  },
  onUnload:function(){
    console.log("页面检测", "onUnload")
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
  powerDrawer: function(e) {
    var currentstatus = e.currentTarget.dataset.status;
    this.util(currentstatus)
  },
  //下拉抽屉动画效果
  util: function(currentstatus) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });

    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;

    // 第3步：执行第一组动画：Y轴偏移240px后(盒子高度是240px)，停
    animation.translateY(240).step();

    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function() {
      // 执行第二组动画：Y轴不偏移，停
      animation.translateY(0).step()
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })

      //关闭抽屉
      if (currentstatus == "close") {
        this.setData({
          showModalstatuss: false
        });
      }
    }.bind(this), 200)

    // 显示抽屉
    if (currentstatus == "open") {
      this.setData({
        showModalstatuss: true
      });
    }
  },
  //获取输入验证码
  invitationCode: function(e) {
    this.setData({
      showClassInformation: false,
      code: e.detail.value
    });

  },
  //控制侧滑菜单
  toggleLeft: function() {
    // console.log("test")
    // this.setData({
    //   courseList: [],
    //   page: 0,
    //   hasMoreData: true,
    //   showClassInformation: false
    // })
    // this.getCourseList()
    this.setData({
      showMenuBar: !this.data.showMenuBar
    });
  },
  //查询输入验证码对应课程信息
  search: function() {
    
    var _this = this
    console.log(_this.data.code)
    if (!_this.data.code) {
      $Toast({
        content: '请输入邀请码！'
      })
      return
    }
    wx.showLoading({
      title: '正在查询',
    })
    courseUtils.searchCourse({
      "code": _this.data.code
    }).then(res => {
      wx.hideLoading()
      console.log("searchCourse res", res)
      if (res.data.length == 0) {
        $Toast({
          content: "邀请码错误"
        })
        return
      }
      console.log("searchCourse", res)
      _this.setData({
        getCourseInformation: res.data[0],
        showClassInformation: true
      })
      console.log('searchCourse res', _this.data.getCourseInformation)
    })
  },
  //加入新课程
  joinButton: function() {
    var _this = this
    console.log(" _this.data.getCourseInformation", _this.data.getCourseInformation)
    for (var i = 0; i < _this.data.courseList.length; i++) {
      if (_this.data.getCourseInformation.course_no == _this.data.courseList[i].course_no) {
        $Toast({
          content: "你已添加了此课程"
        })
        return
      }

      // else if (new Date() > new Date(_this.data.getCourseInformation.overdue_time)) {
      //   console.log("验证码日期检验", new Date() > new Date(_this.data.getCourseInformation.overdue_time))
      //   $Toast({
      //     content: "邀请码已过期"
      //   })
      //   wx.hideLoading()
      //   return
      // }

    }

    var checkCourseStatus = {
      'class_no': _this.data.getCourseInformation.class_no,
      "course_no": _this.data.getCourseInformation.course_no,
      "course_name": _this.data.getCourseInformation.course_name,
      "course_tea": _this.data.getCourseInformation.course_tea,
      "account":_this.data.getCourseInformation.account,
      'user_type': 1
    }
    courseUtils.checkCourseStatus(checkCourseStatus).then(res => {
      if (res.data[0].course_status == 2 || res.data[0].course_status == 3) {
        wx.showToast({
          icon: 'none',
          title: '该课程已解散',
          duration: 2000
        })
        return
      }
      wx.showLoading({
        title: '正在添加',
      })
      var checkItem = {
        'class_no': _this.data.getCourseInformation.class_no,
        'course_name': _this.data.getCourseInformation.course_name,
        "course_no": _this.data.getCourseInformation.course_no,
        "course_status": 1
      }
//检测该课程是否已添加过，现状态为退出
      courseUtils.checkIsExit(checkItem).then(res => {
        console.log("checkIsExit", res)
        if (res.data.length!=0) {
          var setStatusParams = {
            account: _this.data.account,
            user_type: 0,
            class_no: _this.data.getCourseInformation.class_no,
            course_name:_this.data.getCourseInformation.course_name,
            course_tea:_this.data.getCourseInformation,
            course_status: 0,
            status: [1],
            course_no: _this.data.getCourseInformation.course_no
          }
          courseUtils.setCourseStatus(setStatusParams).then(res => {
            console.log("setCourseStatus res", res)
            _this.util('close')
            // $Toast({
            //   content: "添加课程成功"
            // })
            wx.showToast({
              title: '添加课程成功',
              icon:"none",
              duration:20000
            })
            _this.setData({
              courseList: [],
              page: 0,
              hasMoreData: true,
              showClassInformation: false
            })
            _this.getCourseList()
            wx.hideLoading()
          })
        } else {
          var this_information = _this.data.getCourseInformation
          var time = new Date().toString()
          var course = {
            "course_no": this_information.course_no,
            "course_name": this_information.course_name,
            "class_no": this_information.class_no,
            "course_tea": this_information.course_tea,
            // 'invitation_code':_this.data.code,
            "create_time": time
          }
          courseUtils.addCourse(course, _this.data.account).then(res => {
            _this.util('close')
            // $Toast({
            //   content: "添加课程成功"
            // })
            wx.showToast({
              title: '添加课程成功',
              icon: "none",
              duration: 20000
            })
            _this.setData({
              courseList: [],
              page: 0,
              hasMoreData: true,
              showClassInformation: false
            })
            _this.getCourseList()
            wx.hideLoading()
          })
        }
      })
    })



  },

  intoStudy: function(e) {
    console.log("intoStudy e", e)
    var _this = this
    // var params ={"account":this.data.account,"course_no":e.target.id}
    // console.log("studentParams",params)
    wx.showLoading({
      // mask: true,
      // images:'../../loading.gif',
      title: '正在加载页面',
    })
    wx.navigateTo({
      url: '../index/index?account=' + _this.data.account + '&course_no=' + e.currentTarget.dataset.course.course_no
    })
  },
  //控制课程操作菜单
  openMune(e) {
    console.log("openMune e", e)
    var selectCourse = e.currentTarget.dataset.course
    this.setData({
      visible: true,
      // selectCourse:e._relatedInfo.anchorRelatedText
      selectCourse: selectCourse
    });
  },
  closeMune() {
    this.setData({
      visible: false
    });
  },
  clickItem(e) {
    var _this = this
    var course = _this.data.selectCourse
    const index = e.detail.index
    console.log("clickItem e", e)
    if (index == 0) {
      console.log("select_course", _this.data.selectCourse)

      _this.setData({
        'selectCourse.create_time': commonUtils.formatDate(_this.data.selectCourse.create_time)
      })
      _this.closeMune()
      _this.toggleDialog()

    } else if (index == 1) {
      _this.exitCourse(course)
      _this.closeMune
    }

  },
//控制课程详情弹窗
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    })
  },
  exitCourse(course) {
    var _this = this
    console.log("diabandCourse course", course)
    wx.showModal({
      title: '提示',
      content: '确认退出' + course.course_name + '吗？',
      success(res) {
        if (res.confirm) {
          var courseStatusParams = {
            "course_no": course.course_no,
            "class_no": course.class_no,
            "account": _this.data.account,
            "course_name":course.course_name,
            "user_type": 0,
            'status': [0],
            "course_status": 1
          }
          _this.closeMune()
          console.log("courseStatusParams:", courseStatusParams)
          courseUtils.setCourseStatus(courseStatusParams).then(res => {
            console.log("setCourseStatus result", res)
            console.log("setCourseStatus res.result.stats.updated", res.result.stats.updated)

            if (res.result.stats.updated == 0) {
              $Toast({
                content: "退出课程失败"
              })
              return
            }
            // $Toast({
            //   content: "退出程成功"
            // })
            wx.showToast({
              title: '退出程成功',
              icon: "none",
              duration: 20000
            })
            _this.setData({
              page: 1,
              courseList: [],
              hasMoreData: true
            })
            _this.getCourseList()

          })
        }
      }
    })
  },

  allCourse: function() {
    var _this = this
    wx.showLoading({
      mask: true,
      image: '../../images/load.gif',
      title: '正在加载页面',
    })
    wx.navigateTo({
      url: '../all-courses/all-courses?account=' + _this.data.account + '&user_type=0',
    })
  },
//下拉框滑动到底部
  bottom: function() {

    if (this.data.hasMoreData) {
      wx.showLoading({
        title: '正在加载',
      })
      this.getCourseList()
    } else {
      wx.showToast({
        icon: 'none',
        title: '没有更多数据',
      })
    }
  },
  //修改绑定账号
  toChangeAccount: function() {
    wx.navigateTo({
      url: '../change-account/change-account',
    })
  },

  
  tap_start: function (e) {
    // touchstart事件
    // 把手指触摸屏幕的那一个点的 x 轴坐标赋值给 mark 和 newmark
    this.data.mark = this.data.newmark = e.touches[0].pageX;
    this.data.position = e.touches[0].pageX;
  },

  tap_drag: function (e) {
    // touchmove事件
    this.data.newmark = e.touches[0].pageX;

    // 手指从左向右移动
    if (this.data.mark < this.data.newmark) {
      this.istoright = true;
    }

    // 手指从右向左移动
    if (this.data.mark > this.data.newmark) {
      this.istoright = false;
    }
    this.data.mark = this.data.newmark;
  },

  tap_end: function (e) {
    // touchend事件
    console.log("mark:", this.data.mark, 'newmark:', this.data.newmark, 'position', this.data.position)
    if (this.data.mark == this.data.position && this.data.position == this.data.newmark) {
      return
    }
    this.data.mark = 0;
    this.data.newmark = 0;
    // 通过改变 opne 的值，让主页加上滑动的样式
    if (this.istoright) {
      this.setData({
        showMenuBar: true
      });
    } else {
      this.setData({
        showMenuBar: false
      });
    }
  }

})
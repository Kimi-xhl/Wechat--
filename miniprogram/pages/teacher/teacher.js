// miniprogram/pages/student/student.js
const app = getApp()
var courseUtils = require('../../utils/course.js')
var commonUtils = require('../../utils/common.js')
const {
  $Toast
} = require('../../components/iview/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account: "未绑定",
    // account: "13724333416",
    userInfo: {},
    showMenuBar: false,
    // "大学英语", "java", "C语言"
    courseList: [],
    showModalstatuss: false,
    getClassInformation: {

    },
    showClassInformation: false,

    course: {},//新建
    visible: false,
    items: [{
        name: '课程信息',
      },
      {
        name: '解散',
      }
    ],
    selectCourse: '',
    showDialog: false,
    //选中课程详情信息
    selectCourseImformation: '',
    studentCount: 0,
    //分页加载课程列表信息
    page: 1,
    hasMoreData: true,
    pageSize: 7,
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
    var _this = this

    _this.setData({
      account: getApp().globalData.account
      // account:'13724333416'
    })

    this.getCourseList()
  },
  onShow: function() {
  
    if (getApp().globalData.isUpdate) {
      this.setData({
        page: 1,
        hasMoreData: true,
        courseList: [],
      })
      this.getCourseList()
      getApp().globalData.isUpdate=false
    }
  },

  getCourseList: function() {
    var _this = this
    var courseListParams = {
      "account": _this.data.account,
      "course_status": 0,
      "user_type": 1,
      "rows": 7,
      "page": this.data.page
    }
    console.log('courseListParams', courseListParams)
    courseUtils.getCourseList(
      courseListParams
    ).then(res => {
      console.log('getCourseList', res)
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
        wx.hideLoading()
      }
      console.log("res.data :", res.data)
      console.log("courseList:", _this.data.courseList)

    })
    
    
  },
  courseName: function(e) {
    this.setData({
      'course.course_name': e.detail.value
    })
  },
  courseNo: function(e) {
    this.setData({
      'course.course_no': e.detail.value
    })
  },
  courseTea: function(e) {
    this.setData({
      'course.course_tea': e.detail.value
    })
  },
  classNo: function(e) {
    this.setData({
      'course.class_no': e.detail.value
    })
  },

  powerDrawer: function(e) {
    var currentstatus = e.currentTarget.dataset.status;
    this.util(currentstatus)
  },
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
  showMenuBar: function() {
    console.log("showMenuBar before", this.data.showMenuBar)
    this.setData({
      showMenuBar: !this.data.showMenuBar
    });
    console.log("showMenuBar after", this.data.showMenuBar)
  },
  intoManage: function(e) {
    console.log("进入课程管理", e)
    getApp().globalData.course_no = e.currentTarget.dataset.course.course_no
    getApp().globalData.account = e.currentTarget.dataset.course.account
    wx.showLoading({
      mark: true,
      title: '正在加载页面',
    })
    wx.switchTab({
      url: '../students_list/students_list',
    })
  },
  goToChange: function() {
    var _this = this
    wx.showLoading({
      mark: true,
      title: '正在加载页面',
    })

    wx.navigateTo({
      url: '../change_passwd/change_passwd?account=' + _this.data.account,
    })
  },
  exit: function() {
    wx.showLoading({
      mark: true,
      title: '正在加载页面',
    })
    wx.navigateTo({
      url: '../stu_login/stu_login?isShow=false',
    })
  },

  creatCourse: function() {
    var input = this.data.course
    if (!input.course_name) {
      $Toast({
        content: "请输入课程名称"
      })
      return
    } else if (!input.course_no) {
      $Toast({
        content: "请输入课程号"
      })
      return
    } else if (!input.course_tea) {
      $Toast({
        content: "请输入教师名"
      })
      return
    } else if (!input.class_no) {
      $Toast({
        content: "请输入班级号"
      })
      return
    }
    // this.util('close')
    var _this = this
    console.log("course", _this.data.course)
    //检查课程号是否已存在
    // courseUtils.checkCourseNo({"course_no":_this.data.course.course_no}).then(res=>{
     
    //   console.log("courseUtils.checkCourseNo",res)
    //   if (res.data.length!=0){
    //    $Toast({
    //      content:"该课程号已存在，请重新输入"
    //    })
    //    return
    //   }
    // })
    courseUtils.checkCourse(_this.data.course).then(res=>{
      if(res.data.length!=0){
        for(var i=0;i<res.data.length;i++){
          if(res.data[i].course_tea!=_this.data.course.course_tea||res.data[i].class_no==_this.data.course.class_no){
            $Toast({
              content: "该课程号班级已存在"
            })
            return
          }
        }
      }
      console.log("test","================================")
      courseUtils.creatCode()
        .then(res => {
          console.log("getcode", res)
          var code = res
          if (!code) {
            $Toast({
              content: "创建课程出错，请重新创建！"
            })
            return
          }
          courseUtils.createCourse(_this.data.course, code, _this.data.account)
            .then(res => {
              this.util('close')
             
              wx.showModal({
                title: '提示',
                content: '创建成功，邀请码为:' + code,
                showCancel: false,
                success: true
              })
              _this.setData({
                page: 1,
                courseList: [],
                hasMoreData: true
              })
              _this.getCourseList()

            })

        })


    })
    
  },
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
      var stuCountPro = courseUtils.getCourseStudentCount({
        "class_no": _this.data.selectCourse.class_no,
        "course_no": _this.data.selectCourse.course_no,
        "course_name":_this.data.selectCourse.course_name,
        'user_type': 0,
        'course_status': 0
      })
      var selCourseInformtionPro = courseUtils.getCourseInformation({
        "class_no": _this.data.selectCourse.class_no,
        "course_no": _this.data.selectCourse.course_no,
        "course_name": _this.data.selectCourse.course_name,
      })

      Promise.all([stuCountPro, selCourseInformtionPro]).then(res => {
        console.log("select imformation prominse res", res)
        _this.setData({
          studentCount: res[0].total,
          selectCourseImformation: res[1].data[0],
          'selectCourseImformation.create_time': commonUtils.formatDate(res[1].data[0].create_time)
        })
        _this.closeMune()
        _this.toggleDialog()
      })


    } else if (index == 1) {
      _this.disbandCourse(course)
      _this.closeMune
    }

  },

  //控制课程详情弹窗
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    })
  },
  disbandCourse(course) {
    var _this = this
    console.log("diabandCourse course", course)
    wx.showModal({
      title: '提示',
      content: '确认解散' + course.course_name + '吗？',
      success(res) {
        if (res.confirm) {
          var courseStatusParams = {
            "course_no": course.course_no,
            "class_no": course.class_no,
            "course_name":course.course_name,
            "account": _this.data.account,
            "user_type": 1,
            "status": [0, 1],
            "course_status": 2
          }
          _this.closeMune()
          console.log("courseStatusParams:", courseStatusParams)
          courseUtils.setCourseStatus(courseStatusParams).then(res => {
            console.log("setCourseStatus result", res)
            console.log("setCourseStatus res.result.stats.updated", res.result.stats.updated)
            if (res.result.stats.updated == 0) {
              $Toast({
                content: "解散课程失败"
              })
              return
            }
            $Toast({
              content: "解散课程成功"
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
      mark: true,
      title: '正在加载页面',
    })
    wx.navigateTo({
      url: '../all-courses/all-courses?account=' + _this.data.account + '&user_type=1',
    })
  },
  // upper: function() {
  //   wx.showToast({
  //     icon: 'none',
  //     title: '到达顶部了',
  //   })
  // },
  bottom: function() {

    if (this.data.hasMoreData) {
      wx.showLoading({
        mark: true,
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


  tap_start: function(e) {
    // touchstart事件
    // 把手指触摸屏幕的那一个点的 x 轴坐标赋值给 mark 和 newmark
    this.data.mark = this.data.newmark = e.touches[0].pageX;
    this.data.position = e.touches[0].pageX;
  },

  tap_drag: function(e) {
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

  tap_end: function(e) {
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
// miniprogram/pages/all-courses/all-courses.js
const courseUtils = require('../../utils/course.js')
const commonUtils = require('../../utils/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseList: [],
    account: '15602960276',
    page: 1,
    hasMoreData: true,
    pageSize: 10,
    user_type: '',
    selectCourseImformation: [],
    showDialog: false,
    lock: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideLoading()
    var _this = this
    if (options.account) {
      _this.setData({
        account: options.account,
        user_type: options.user_type
      })
    }
    _this.getAllCourse()
  },
  //获取所有课程
  getAllCourse() {
    var _this = this
    console.log("this page", _this.data.page)
    var params = {
      account: _this.data.account,
      user_type: _this.data.user_type,
      page: _this.data.page,
      rows: 10
    }
    courseUtils.getAllCourseList(params).then(res => {
      console.log("getCourseList res", res)
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].exit_time) {
          res.data[i].exit_time = commonUtils.formatDate(res.data[i].exit_time)
        }
        if (res.data[i].dismiss_time){
          res.data[i].dismiss_time = commonUtils.formatDate(res.data[i].dismiss_time)
        }
      }
      if (res.data.length < _this.data.pageSize) {
        _this.setData({
          courseList: _this.data.courseList.concat(res.data),
          hasMoreData: false
        })
        console.log("courseList=========", _this.data.courseList)
        wx.hideLoading()
      } else {
        _this.setData({
          courseList: _this.data.courseList.concat(res.data),
          page: _this.data.page + 1
        })
        wx.hideLoading()
        console.log("params", params)
      }


    })
    console.log("course_list:", _this.data.courseList)
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

  returnTea: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  upper: function() {
    wx.showToast({
      icon: 'none',
      title: '到达顶部了',
    })
  },
  bottom: function() {

    if (this.data.hasMoreData) {
      wx.showLoading({
        title: '正在加载',
      })
      this.getAllCourse()
    } else {
      wx.showToast({
        icon: 'none',
        title: '没有更多数据',
      })
    }
  },
  deleteCourse: function(e) {
    console.log('bindLongTap=deleteCourse', this.data.lock)
    console.log("deleteCourse e", e)
    var _this = this
    _this.setData({
      lock: true
    })
    var course = e.currentTarget.dataset.course
    wx.showModal({
      title: '提示',
      content: '删除后，所有记录将清空，确定删除吗',
      success(res) {
        if (res.confirm) {
          getApp().globalData.isUpdate=true;
          //执行操作若为学生，则更改学生课程状态为3（删除）
          if (_this.data.user_type == 0) {
            console.log(" deleteCourse user_type", _this.data.user_type)
            var params = {
              account: _this.data.account,
              course_no: course.course_no,
              course_name:course.course_name,
              user_type: course.user_type,
              class_no: course.class_no,
              status: [0, 1, 2],
              course_status: 3
            }
            courseUtils.setCourseStatus(params).then(res => {
              _this.setData({
                page: 0,
                courseList: []
              })
              _this.getAllCourse()
              wx.showToast({
                title: '删除成功',
              })
            })
            //删除操作为教师，更改教师课程状态为3(删除)，学生课程状态为2（解散）
          } else if (_this.data.user_type == 1) {
            console.log(" deleteCourse user_type", _this.data.user_type)
            var disbandParams = {
              "course_no": course.course_no,
              "class_no": course.class_no,
             "course_name" : course.course_name,
              "account": _this.data.account,
              "user_type": 1,
              "status": [0, 1],
              "course_status": 2
            }
            var deleteParams = {
              "course_no": course.course_no,
              "class_no": course.class_no,
              "course_name": course.course_name,
              "account": _this.data.account,
              "user_type": 1,
              "status": [0, 1, 2],
              "course_status": 3
            }
            console.log("disbandParams",disbandParams)
            console.log("deleteParams", deleteParams)

            var disbandPromise = courseUtils.setCourseStatus(disbandParams)
            var deletePromise = courseUtils.setCourseStatus(deleteParams)
           disbandPromise.then(res=>{
             disbandPromise.then(res=>{
               console.log('deleteCourse res', res)
              _this.setData({
                page: 0,
                courseList: []
              })
              _this.getAllCourse()
              wx.showToast({
                title: '删除成功',
              })
             })
           })
            // Promise.all([disbandPromise, deletePromise]).then(res => {
            //   console.log('deleteCourse res', res)
            //   _this.setData({
            //     page: 0,
            //     courseList: []
            //   })
            //   _this.getAllCourse()
            //   wx.showToast({
            //     title: '删除成功',
            //   })
            // })
          } else {
            wx.showToast({
              title: 'err:user_type:' + _this.data.user_type,
            })
          }
        }
      }
    })
  },



  showCourseDetail: function(e) {
    console.log('binTap=showCourseDetail', this.data.lock)
    if (this.data.lock) {
      return
    }
    var _this = this
    _this.setData({
      selectCourseImformation: e.currentTarget.dataset.course
    })
    console.log("selectCourseImformation", e.currentTarget.dataset.course)
    var stuCountPro = courseUtils.getCourseStudentCount({
      "class_no": _this.data.selectCourseImformation.class_no,
      "course_no": _this.data.selectCourseImformation.course_no,
      'user_type': 0,
      'course_status': 0
    })
    var courseInfromationPro = courseUtils.getCourseInformation({
      "course_no": _this.data.selectCourseImformation.course_no,
      "class_no": _this.data.selectCourseImformation.class_no
    })
    Promise.all([stuCountPro, courseInfromationPro]).then(res => {
      _this.setData({
        'selectCourseImformation.studentCount': res[0].total,
        'selectCourseImformation.invitation_code': res[1].data[0].invitation_code,
        'selectCourseImformation.create_time': commonUtils.formatDate(_this.data.selectCourseImformation.create_time),
        showDialog: true
      })
    })

  },
  //操作课程详情菜单显示隐藏
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    })
  },

  touchend: function() {
    console.log('bindtounchend=touchend1', this.data.lock)
    if (this.data.lock) {
      //开锁
      setTimeout(() => {
        this.setData({
          lock: false
        });
      }, 100);
    }
    console.log('bindtounchend=touchend1', this.data.lock)
  },
})
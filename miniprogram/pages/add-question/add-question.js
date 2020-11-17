// miniprogram/pages/add-question/add-question.js
const {
  $Toast
} = require('../../components/iview/base/index');
const courseUtils = require('../../utils/course.js')
const netUtils = require('../../utils/net.js')
const commonUtils = require('../../utils/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempFiles: [],
    account: "",
    course_no: "",
    fileName: "",
    page: 1,//当前显示页面
    inputPage:1,//用户输入想跳转的页数
    questionList: [],
    questionCount: 0,
    pageTotal: 1,
    rows: 10,
    showModalstatuss: false,
    showAddView: false,
    showDialog: false, 
    showQuestion:false,
    selectQuestion:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    this.setData({
      account: getApp().globalData.account,
      course_no: getApp().globalData.course_no
      // course_no: "10000001"
    })
    console.log(" add-question onLoad account:", this.data.account, "course_no:", this.data.course_no)
   this.getQuestionCount()
    this.getQuestonList()
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

  returnMain: function() {
    wx.showLoading({
      title: '正在加载页面',
    })
    wx.redirectTo({
      url: '../teacher/teacher',
    })
  },
  chooseFile: function() {
    var _this = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xlsx'],
      success(res) {
        console.log(res)
        console.log('从本地获取文件:', res)
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFiles = res.tempFiles;
        console.log("tempFiles:", tempFiles)
        if (!tempFiles || !validateExcel(tempFiles[0])) {
          return;
        }
        _this.setData({
          tempFiles: tempFiles,
          fileName: tempFiles[0].name,
          showDialog:true
        })
      }
    })
  },




  doUpload: function() {
    var _this = this
    if (!_this.data.tempFiles) {
      $Toast({
        content: "文件不能为空"
      })
    }
    wx.showLoading({
      title: '正在导入',
    })
    wx.cloud.uploadFile({
      cloudPath: Date.parse(new Date()) + '_' + _this.data.tempFiles[0].name,
      filePath: _this.data.tempFiles[0].path, // 文件路径
      success: res => {
        // get resource ID
        console.log('上传成功,fileId:', res.fileID);
        wx.showLoading({
          title: '正在解析',
        })
        _this.analysisReq(res.fileID, _this.data.course_no,undefined)
      },
      fail: err => {
        console.log("uploadFile success")
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '文件上传失败！error:' + err.result.msg,
        })
        
        console.log("callFunction uploadFile", err)
        // handle error
      }
    })

  },

  analysisReq:function(fileId,course_no,imported){
    var _this = this;
    console.log(fileId, course_no, imported)
    wx.cloud.callFunction({
      name: 'analysisExcel',
      data: {
        'fileId': fileId,
        course_no: course_no,
        'imported': imported ? imported : 0
      },
      success: res => {
        console.log("analysisExcel success res", res)
       
        if (!res.result || res.result.success == false) {
            wx.showToast({
              title: res.result && res.result.msg ? res.result.msg.toString() : "系統异常",
              icon: 'none',
              duration: 2500
            })
        } else if (res.result.imported != undefined 
                    && res.result.total != undefined 
                    && res.result.imported < res.result.total){
           wx.showLoading({
             title: '请耐心等待'
           })
          
           
          _this.analysisReq(fileId, course_no, res.result.imported);
        }else{
          wx.hideLoading()
          mask: true
          wx.showToast({
            icon: 'none',
            title: res.result.msg.toString(),
          })

          _this.setData({
            fileName: "",
            page: 1,
            showDialog: false
          })
          setTimeout(function () {
            wx.hideLoading()
            _this.getQuestonList()
            _this.getQuestionCount()
          }, 2000)

          console.log('文件解析结果：', res);
        }  
        
      },
      fail: err => {
        console.log("analysisExcel fail")
        wx.hideLoading()
        // handle error
        console.log("fail err", err)
        wx.showToast({
          icon: 'none',
          title: '导入失败！error:' + err.errMsg,
        })
        console.log("callFunction analysisExcel", err)
      }
    })
  },

  getQuestionCount: function () {
    var _this = this
    courseUtils.getQuestionCount({
      "course_no": _this.data.course_no
    }).then(res => {
      console.log("getQuestionCount res", res)
      _this.setData({
        questionCount: res.total,
        pageTotal: Math.ceil(res.total / _this.data.rows)
      })
    })
  },
  getQuestonList: function() {
    var _this = this
    var name = 'getQuestion';
    var data = {
      rows: _this.data.rows,
      page: _this.data.page,
      course_no: _this.data.course_no
    };
    var callRes = netUtils.callCloudFunc(name, data);
    callRes.then(res => {
      console.log("云函数getQuestion", res)
      if(res.data.length==0){
        _this.setData(
          {page:0}
        )
      }
      _this.setData({
        questionList: res.data
      })
      console.log("this questionList", _this.data.questionList)
    })
  },
  pre: function() {
    var _this = this
    if (_this.data.page == 1) {
      $Toast({
        content: '当前已是第一页！'
      })
      return
    }
    _this.setData({
      page: _this.data.page - 1
    })
    _this.getQuestonList()
  },
  next: function() {
    var _this = this
    if (_this.data.page == _this.data.pageTotal) {
      $Toast({
        content: '当前已是最后一页！'
      })
      return
    }
    _this.setData({
      page: parseInt(_this.data.page )+ 1
    })
    _this.getQuestonList()
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
  inputPage: function(e) {
    var _this = this
    
    _this.setData({
      inputPage: e.detail.value
    })
  },
  jump: function() {
    var _this = this
    if (_this.data.inputPage > _this.data.pageTotal || _this.data.inputPage<=0){
    wx.showToast({
      title: '不存在第'+_this.data.inputPage+'页，请重新输入',
      icon:'none'
    })
    return
    }
    else{
      _this.setData({
        page: _this.data.inputPage
      })
      _this.getQuestonList()
      _this.util('close')

    }
   
  },
  showAddView: function() {
    var _this = this
    _this.setData({
      showAddView: !_this.data.showAddView
    })
  },
    toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    })
  },
  showQuestion:function(e){
    var _this = this
    _this.setData({
      selectQuestion:e.currentTarget.dataset.question,
      'selectQuestion.createDate': commonUtils.formatDate(e.currentTarget.dataset.question.createDate),
      showQuestion:true
    })
  },
  closeQuestion:function(){
    this.setData({
      showQuestion:false
    })
  }
})


function validateExcel(fileInfo) {
  var validExt = 'xlsx';
  if (!fileInfo || !fileInfo.path) {
    wx.showToast({
      duration: 3000,
      icon: 'none',
      title: '文件不能为空',
    })
    console.log('文件为空')
    return false;
  }
  var index = fileInfo.path.lastIndexOf(".");
  var ext = fileInfo.path.substr(index + 1);
  if (ext != validExt) {
    console.log('文件类型', ext, '不为', validExt);
    wx.showToast({
      icon: 'none',
      duration: 3000,
      title: '文件类型' + ext + '不为' + validExt,
    })
    return false;
  }
  return true;
}
const commonUtils = require('common.js')
const netUtils = require('net.js')

function addToInvitation(params, code) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command;
  params.invitation_code = code
  console.log("overdue", commonUtils.addDate(params.create_time, 15))
  params.overdue_time = commonUtils.addDate(params.create_time, 15)
  return db.collection("invitationCode").add({
    data: params
  })
}



function createCourse(params, code, account) {
  console.log("params:", params, "code:", code, "account:", account)
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command;
  params.create_time = new Date().toString()
  // params.invitation_code=code
  var promiseList = [];
  var paramCopy = JSON.parse(JSON.stringify(params));
  var promise1 = addToInvitation(paramCopy, code)
  var promise2 = wx.cloud.callFunction({
    name: 'createCourse',
    data: {
      course: params,
      account: account,
      code: code,
      user_type: 1
    }
  });
  promiseList.push(promise1)
  promiseList.push(promise2)
  return Promise.all(promiseList).then(res => {
    console.log("result", res)
  })


}

function creatCode() {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command;
  var code = randomNum(10001, 100000).toString();
  // console.log("第一次code",code)
  return db.collection("invitationCode").where({
    invitation_code: _.eq(code)
  }).count().then(res => {
    // console.log("数据库code：",res.total)
    if (res.total != 0) {
      creatCode()
    } else {
      // console.log("最终code：", code)
      return code;
    }
  })

}

//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      if (maxNum == minNum) return maxNum;
      return parseInt(Math.random() * (maxNum - minNum) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }

}

function getCourseList(params) {
  if (!params) {
    params = {};
  }
  let rows = params.rows ? params.rows : 10;
  let page = params.page ? params.page : 1;
  let skip = (page - 1) * rows;
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command;
  console.log(" getCourseList params", params)
  var sql = db.collection('course').where({
    account: _.eq(params.account),
    user_type: _.eq(params.user_type),
    course_status: _.eq(params.course_status)
  }).skip(skip).limit(rows);
  return netUtils.dbGet(sql)
}
//获取用户所有课程数
function getUserCourseCount(account) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command;
  return db.collection('course').where({
    account: account
  }).count()
}
//获取单门课程学生人数
function getCourseStudentCount(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  return db.collection('course').where(params).count()
}
// 获取所有课程
function getAllCourseList(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command;
  console.log(" getAllCourseList params", params)
  if (!params) {
    params = {};
  }
  let rows = params.rows ? params.rows : 10;
  let page = params.page ? params.page : 1;
  let skip = (page - 1) * rows;
  console.log("getAllCourseList rows:", rows, "page:", page, "skip:", skip)
  var sql = db.collection('course').where({
    account: _.eq(params.account),
    user_type: _.eq(parseInt(params.user_type)),
    course_status: _.neq(3)
  }).skip(skip).limit(rows);
  return netUtils.dbGet(sql)
}

function searchCourse(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  return db.collection('invitationCode').where({
    invitation_code: _.eq(params.code)
  }).get()
}

function addCourse(params, account) {
  console.log("addCourse", params)
  var name = 'createCourse'
  var data = {
    account: account,
    course: params,
    user_type: 0
  }
  return netUtils.callCloudFunc(name, data, '正在添加')

  // return wx.cloud.callFunction({
  //   name: 'createCourse',
  //   data: {
  //     account: account,
  //     course: params,
  //     user_type: 0
  //   }
  // })
}
// 设置课程状态
// 0:正常->显示在课程列表上
// 1：退出 ->放到抽屉页的课程记录上
// 2: 解散 -> 放到抽屉页的课程记录上
// 3:删除->不显示该记录
function setCourseStatus(params) {

  console.log(" courseStatus Params", params)
  return wx.cloud.callFunction({
    name: "courseStatu",
    data: params
    // {
    //   account: params.account,
    //   course_no: params.course_no,
    //   user_type: params.user_type,
    //   class_no: params.class_no,
    //   status: params.status,
    //   course_status: params.course_status
    // }
  })
}
//获取课程积分
function getIntegral(params) {
  console.log("getIntegral params", params)
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  var sql = db.collection('course').where({
    course_no: _.eq(params.course_no),
    account: _.eq(params.account)
  });
  return netUtils.dbGet(sql)

}
//根据课程号，获取该课程号所有人数
function getCourseMemberNum(params) {
  console.log('getCourseMemberNum', params)
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  return db.collection('course')
    .where({
      'course_no': _.eq(params.course_no),
      'course_status': _.eq(0),
      'user_type': _.eq(0)
    })
    .count()
}

function getTopMember(params) {
  var num = params.num ? params.num : 10
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  var sql = db.collection('course')
    .where({
      course_no: _.eq(params.course_no),
      course_status: _.eq(0),
      integral: _.gt(0),
      user_type: _.eq(0)
    })
    .orderBy(
      'integral', 'desc'
    ).limit(num);
  return netUtils.dbGet(sql)
}

function getBiggerNum(params) {
  console.log('getBiggerNum', params)
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  return db.collection('course')
    .where({
      'course_no': _.eq(params.course_no),
      'course_status': _.eq(0),
      'integral': _.gt(params.integral),
      user_type: _.eq(0)
    })
    .count()
}

function getIntegralRank(params) {
  return Promise.all([getCourseMemberNum(params), getTopMember(params), getBiggerNum(params)])
}

function addStudyTime(params) {
  wx.cloud.callFunction({
    name: "addStudyTime",
    data: {
      course_no: params.course_no,
      account: params.account,
      study_time: params.study_time
    }
  }).then(res => {
    console.log("add study time result:", res)
  })
}

function getCourseInformation(params) {
  console.log("getCourseInformation params", params)
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  var sql = db.collection('invitationCode').where(
    params
  //   {
  //   class_no: _.eq(params.class_no),
  //   course_no: params.course_no
  // }
  )
  return netUtils.dbGet(sql, '正在查询')
}

function getPracticeTimes(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  return db.collection('course').where({
    account: params.account,
    course_no: params.course_no,
    course_status: 0
  }).get()
}

function checkIsExit(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command

 var sql= db.collection("course").where(params)
 return netUtils.dbGet(sql)

  // console.log("checkIsExit params", params)
  // return wx.cloud.callFunction({
  //   name: "checkIsExit",
  //   data: {
  //     course: params
  //   }
  // })
}

//获取课程题库题数
function getQuestionCount(params) {
  console.log("getQuestionCount params", params)
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  return db.collection('question').where(params).count()
}
//查询课程状态
function checkCourseStatus(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  var sql = db.collection('course').where(params)
  return netUtils.dbGet(sql, '正在查询')
}

function checkCourse(params) {
  const db = wx.cloud.database({
    env:'test-f3c86f'
  })
  const _ = db.command
  params.course_status=0
  var sql = db.collection('course').where(
    {
      course_no:_.eq(params.course_no),
      // class_no:_.eq(params.class_no),
      course_status:_.eq(0)
    }
  )
  return netUtils.dbGet(sql, '正在查询')
}
module.exports.checkCourse = checkCourse;
module.exports.getCourseStudentCount = getCourseStudentCount;
module.exports.checkCourseStatus = checkCourseStatus; 
module.exports.getQuestionCount = getQuestionCount;
module.exports.addToInvitation = addToInvitation;
module.exports.creatCode = creatCode;
module.exports.createCourse = createCourse;
module.exports.getCourseList = getCourseList;
module.exports.getAllCourseList = getAllCourseList;
module.exports.searchCourse = searchCourse;
module.exports.addCourse = addCourse;
module.exports.setCourseStatus = setCourseStatus;
module.exports.getIntegral = getIntegral;
module.exports.getIntegralRank = getIntegralRank;
module.exports.addStudyTime = addStudyTime;
module.exports.getCourseInformation = getCourseInformation;
module.exports.getPracticeTimes = getPracticeTimes;
module.exports.getUserCourseCount = getUserCourseCount;
module.exports.checkIsExit = checkIsExit;
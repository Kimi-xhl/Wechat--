//用户工具类

const app = getApp()
const commonUtils = require('common.js')
const netUtils = require('net.js')
//获取用户信息
function getUserInfo(params) {
  if (!params || !params.openid) {
    return new Promise(function(resolve, reject) {
      reject("未获取到openid");
    });
  }
  const db = wx.cloud.database();
  const _ = db.command;
  return db.collection('user').where({
    _openid: _.eq(params.openid)
  }).limit(1).get();
}


//获取用户数（有积分记录）
function getUserNum() {
  const db = wx.cloud.database();
  const _ = db.command;
  return db.collection('user').where({
    integral: _.gt(0)
  }).count();
}
// 查询数据库是否已存在该openid，即用户是否已注册
function checkUser() {
  console.log("user function->checkUser()")
  const db = wx.cloud.database();
  const _ = db.command;
  return getOpenid().then(res => {
    console.log(res)
    return db.collection('user').where({
        openid: _.eq(res.result.openid)
      })
      .skip(0)
      .limit(1).get();
  })
}

// 查询数据库是否已存在该学号或帐号，即账号是否重复
function checkAccount(param) {
  console.log(param)
  const db = wx.cloud.database();
  const _ = db.command;
  return db.collection('user').where({
    account: _.eq(param.account)
  }).get();
}
//获取大于当前积分的人数
function getBiggerIntegralNum(params) {

  if (!params || !params.integral) {
    return new Promise(function(resolve, reject) {
      reject("用户积分为空");
    });
  }

  const db = wx.cloud.database();
  const _ = db.command;

  return db.collection('user').where({
    integral: _.gt(params.integral)
  }).count();
}

function getOpenid() {
  // 调用云函数
  return wx.cloud.callFunction({
    name: 'login',
    data: {}
  })
}

function getQuesions() {
  var difficultList = [{
      difficultLevel: 1,
      num: 6
    },
    {
      difficultLevel: 2,
      num: 8
    },
    {
      difficultLevel: 3,
      num: 6
    }
  ];
  var result = [];
  var functionList = [];
  for (var i = 0; i < difficultList.length; i++) {
    functionList.push(queryParactice(difficultList[i].difficultLevel, difficultList[i].num));
  }

  return Promise.all(functionList).then(res => {
    console.log('查询题目最终结果：', res);
    for (var j = 0; j < res.length; j++) {
      result = result.concat(res[j]);
    }
    for (var k = 0; k < result.length; k++) {
      if (typeof result[k].options == 'string') {
        result[k].options = JSON.parse(result[k].options);
      }
    }
    console.log('返回数据：', result);
    return result;
  })

}

function evalJson(result) {
  if (!result) {
    return;
  }
  for (var k = 0; k < result.length; k++) {
    if (typeof result[k].options == 'string') {
      result[k].options = JSON.parse(result[k].options);
    }
  }
}

function getQuesionsList(params) {
  console.log("getQuesionsList params", params)
  wx.showLoading({
    title: '正在读取题目',
  })
  //查询数据库次数
  var queryDbCount = 4;
  //一次查询数量
  var queryNum = 5;

  if (params.num > queryNum * queryDbCount) {
    queryNum = Math.ceil(params.num / queryDbCount);
  } else {
    queryDbCount = Math.ceil(params.num / queryNum);
  }

  const db = wx.cloud.database();
  const _ = db.command;


  var querySql = db.collection('question').where({
    course_no: _.eq(params.course_no)
  })
  var promise = new Promise(function(resolve, reject) {
    querySql.count()
      .then(res => {
        var count = res.total;
        console.log('数量：', count)
        //数据库题库总数小于查询的数量，直接返回全部数据
        if (count <= params.num) {
          return querySql.get()
            .then(res => {
              wx.hideLoading();
              evalJson(res.data);
              console.log(res);
              resolve(res.data);

            })
        } else {
          //从数据库题库中抽取题目
          var result = [];
          var haveDoQueryNum = 0;
          for (var i = 0; i < queryDbCount; i++) {
            //防止随机跳数相近导致结果重叠，将数据库总数分为queryDbCount个区间，每次查询限制在特定区间内
            var step = Math.floor(count / queryDbCount);
            var randomSkip = randomNum(step * i, step * (i + 1)) - queryNum;
            if (randomSkip < step * i) {
              randomSkip = step * i;
            }
            var _queryNum = queryNum > params.num - haveDoQueryNum ? params.num - haveDoQueryNum : queryNum;
            console.log('第', i + 1, '次查询，limit:', _queryNum, ',skip:', randomSkip)
            querySql.skip(randomSkip).limit(_queryNum).get()
              .then(res => {
                console.log('单次查询结果:', res);
                result = result.concat(res.data);
                if (result.length == params.num) {
                  for (var i = 0; i < result.length; i++) {
                    if (typeof result[i].options == 'string') {
                      result[i].options = JSON.parse(result[i].options);
                    }
                  }
                  wx.hideLoading();
                  evalJson(result);
                  resolve(result);
                }
              })
            haveDoQueryNum += _queryNum;
          }
        }
      })

  });
  return promise;
}

function queryParactice(level, num) {
  //查询数据库次数
  var queryDbCount = 4;
  //一次查询数量
  var queryNum = 2;

  if (num > queryNum * queryDbCount) {
    queryNum = Math.ceil(num / queryDbCount);
  } else {
    queryDbCount = Math.ceil(num / queryNum);
  }

  const db = wx.cloud.database();
  const _ = db.command;


  var querySql = db.collection('question').where({
    level: _.eq(level)
  });
  var promise = new Promise(function(resolve, reject) {
    querySql.count()
      .then(res => {
        var count = res.total;
        console.log('等级', level, '数量：', count)
        //数据库题库总数小于查询的数量，直接返回全部数据
        if (count <= num) {
          return querySql.get()
            .then(res => {
              console.log(res);
              resolve(res.data);
            })
        } else {
          //从数据库题库中抽取题目
          var result = [];
          var haveDoQueryNum = 0;
          for (var i = 0; i < queryDbCount; i++) {
            //防止随机跳数相近导致结果重叠，将数据库总数分为queryDbCount个区间，每次查询限制在特定区间内
            var step = Math.floor(count / queryDbCount);
            var randomSkip = randomNum(step * i, step * (i + 1)) - queryNum;
            if (randomSkip < step * i) {
              randomSkip = step * i;
            }
            var _queryNum = queryNum > num - haveDoQueryNum ? num - haveDoQueryNum : queryNum;
            console.log('等级', level, '第', i + 1, '次查询，limit:', _queryNum, ',skip:', randomSkip)
            querySql.skip(randomSkip).limit(_queryNum).get()
              .then(res => {
                console.log('单次查询结果:', res);
                result = result.concat(res.data);
                if (result.length == num) {
                  resolve(result);
                }
              })

            haveDoQueryNum += _queryNum;
          }
        }
      })

  });
  return promise;
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

function getStudentList(params) {
  console.log("getStudentList params", params)
  const db = wx.cloud.database();
  const _ = db.command;
  var querySql = db.collection('course').where({
    course_no: _.eq(params.course_no),
    user_type: _.eq(0)
    // integral: _.gt(0)
  }).orderBy('integral', 'desc');
  return netUtils.dbGet(querySql)
  // var promise = new Promise(function(resolve, reject) {
  //   querySql.get().then(res => {
  //     resolve(res.data)
  //   })

  // });
  // return promise;
}
//更改密碼
function changePasswd(params) {
  console.log("changePasswd params",params)
  const db = wx.cloud.database()
  // const _ = db.command
 return db.collection("user").where({
    account: params.account,
    passwd: params.oldPasswd
  }).update({
    data: {
      passwd: params.newPasswd
    }
  })
}
module.exports.changePasswd = changePasswd;
module.exports.getUserInfo = getUserInfo;
module.exports.getUserNum = getUserNum;
module.exports.getBiggerIntegralNum = getBiggerIntegralNum;
module.exports.getOpenid = getOpenid;
module.exports.getQuesions = getQuesions;
module.exports.getStudentList = getStudentList;
module.exports.getQuesionsList = getQuesionsList;
module.exports.checkUser = checkUser;
module.exports.checkAccount = checkAccount;
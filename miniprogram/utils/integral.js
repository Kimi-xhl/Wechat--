//积分工具类

//获取积分列表
function getIntegralList(params) {

  const db = wx.cloud.database();
  const _ = db.command;

  if (!params) {
    params = {};
  }
  let rows = params.rows ? params.rows : 10;
  let page = params.page ? params.page : 1;
  let skip = (page - 1) * rows;


  return db.collection('user').skip(skip).where({
    integral: _.gt(0)
  }).limit(rows).orderBy('integral', 'desc').get();
}

function addPoint(params) {
  console.log("addpoint params：", params)
  var point=0;
  for (var i = 0; i < params.questionList.length; i++) {
    console.log("selectAnwser:", params.questionList[i].selectAnswer, "anwser：", params.questionList[i].answer);
    if (params.questionList[i].selectAnswer == params.questionList[i].answer)point=point+1;
    
  } 
  console.log("分数：",point);
  wx.cloud.callFunction({
      // 云函数名称
      name: 'addPoint',
      // 传给云函数的参数
      data: {
        point: point,
        account:params.account,
        course_no:params.course_no
      }
      });
      return point;
  
}

module.exports.getIntegralList = getIntegralList;
module.exports.addPoint = addPoint;
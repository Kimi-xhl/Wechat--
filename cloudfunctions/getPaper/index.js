// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-f3c86f'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var queryNum = 20;
  var difficultList = [
    {
      difficultLevel:1,
      num:6
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
  for (var i = 0; i < difficultList.length; i++){
    functionList.push(queryParactice(difficultList[i].difficultLevel,difficultList[i].num));
  }
  Promise.all(functionList).then(res =>{
    console.log(res);
    for(var j=0; j<res.length; j++){
      result.push(j);
    }
  })
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    result: result
  }
}

function queryParactice(level,num){ 
  //查询数据库次数
  var queryCount = 4;
  //一次查询数量
  var queryNum = 2;

  if (num > queryNum * queryCount){
    queryNum = num / queryCount;
    if (num % queryCount != 0){
      queryNum++;
    }
  }else{
    queryCount = num / queryNum;
    if(queryCount == 0){
      queryCount++;
    }
  }

  const db = cloud.database();
  const _ = db.command;


  var querySql = db.collection('paper').where({
    level: _.eq(level)
  });

  querySql.count()
  .then(res => {
    var count = res.total;
    if(count <= num){
      querySql.get()
      .then(res => {
        console.log(res);
        return res.data;
      })
    }else{
      var result = [];
      for(var i=0; i<queryCount; i++){
        var step = count / queryCount;
        var randomSkip = randomNum(step * i, step * (i + 1)) - queryCount;
        if (randomSkip < step * i){
          randomSkip = step * i;
        }
        var _queryCount = queryCount > num - result.length ? num - result.length : queryCount;
        querySql.skip(randomSkip).limit(_queryCount).get()
        .then(res => {
          console.log(res);
          result.push(res.data);
          if(result.length == num){
            return result;
          }
        })
      }
    }
  })
}


function queryPracticeLimit(queryCount,queryNum){

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
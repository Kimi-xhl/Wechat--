function dbGet(exp, tipMsg) {

  return new Promise(function (resolve, reject) {
  wx.showLoading({
    title: tipMsg ? tipMsg : '正在加载'
  })
  exp.get()
    .then(res => {
      // if(res.xxx == 'ok'){
      console.log("dbGet res",res)
      // }else{
      //   showToast(xxx0);
      // }
      wx.hideLoading()
     resolve(res);
    })
    .catch(function(err) {
      wx.showToast({
        title: err,
        icon: 'none',
        duration: 2500
      })
      wx.hideLoading()
     reject(err);
    });
  });

}

function callCloudFunc(name, data, tipMsg) {
  console.log("callCloudFunc params data",data)
  return new Promise(function(resolve,reject){
    wx.showLoading({
      title: tipMsg ? tipMsg : '正在加载',
    })
    wx.cloud.callFunction({
      name: name,
      data: data
    }).then(res => {
      var result = res.result?res.result:res
      console.log("callFunction",name,"result",result)
      if (result.success == false) {
        if (result.msg) {
          wx.showToast({
            title: res.msg.toString(),
            icon: 'none',
            duration: 2500
          })
        }
      } else {
      wx.hideLoading();
     
        resolve(result);}
    }).catch(e => {
      console.log('调用方法', name, '返回错误:', e);
      var errMsg = e != undefined && e.message ? e.message.toString() : '系统异常';
      wx.showToast({
        title: errMsg,
        icon: 'none',
        duration: 2500
      })
      wx.hideLoading();
      reject(e);
    })
  });
}



module.exports.dbGet = dbGet
module.exports.callCloudFunc = callCloudFunc


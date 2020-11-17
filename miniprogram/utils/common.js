//List 转 Map
//list:要转换的数组 ， key：要作为mapKey的属性名称
function listToMap(list, key) {
  var map = {};
  if (!list || !Array.isArray(list)) {
    console.log('listToMap warning:list undefined or is not an array');
    return map;
  }
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    for (var itemKey in item) {
      if (itemKey == key) {
        map[item[key]] = item;
        break;
      }
    }
  }

  return map;
}

function addDate(date, days) {
  if (days == undefined || days == '') {
    days = 1;

  }
  var date = new Date(date);
  date.setDate(date.getDate() + days);
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var mm = "'" + month + "'";
  var dd = "'" + day + "'";

  //单位数前面加0
  if (mm.length == 3) {
    month = "0" + month;

  }
  if (dd.length == 3) {
    day = "0" + day;
  }
  var time = date.getFullYear() + "-" + month + "-" + day
  return time;
}

function returnFloat(value) {
  var value = Math.round(parseFloat(value) * 100) / 100;
  var xsd = value.toString().split(".");
  if (xsd.length == 1) {
    value = value.toString() + ".00";
    return value;
  }
  if (xsd.length > 1) {
    if (xsd[1].length < 2) {
      value = value.toString() + "0";
    }
    return value;
  }
}
function formatDate(date){

  Date.prototype.format = function (format) {
    var o = {
      "M+": this.getMonth() + 1, //month
      "d+": this.getDate(),    //day
      "h+": this.getHours(),   //hour
      "m+": this.getMinutes(), //minute
      "s+": this.getSeconds(), //second
      "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
      "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  }
  console.log("wait to format date",date)
  var date = new Date(date).format("yyyy-MM-dd")
  return date

}

function getGapTime(millTime){
    var hour = 1000 * 3600;
    var min = 1000 * 60;
    var second;
    var gapHour = Math.floor(millTime / hour);
   var gapMin = Math.floor((millTime % hour) / min);
    var result = gapMin + "分";

    if (gapHour > 0){
      result = gapHour + "时" + result;
    }else if(gapMin==0){
      second = Math.floor(millTime/1000);
      result = second+"秒"
    }
    return result;
}


module.exports.listToMap = listToMap;
module.exports.addDate = addDate;
module.exports.returnFloat = returnFloat;
module.exports.formatDate = formatDate; 
module.exports.getGapTime = getGapTime;
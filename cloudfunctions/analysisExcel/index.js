// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
const xlsx = require('node-xlsx');
const request = require("request");

cloud.init({
  env: 'test-f3c86f'
})
const db = cloud.database();
const _ = cloud.command;

//习题模板，暂只校验长度
// const pacticeFileColumn = ['word', 'question', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'remark'];
const pacticeFileColumn = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'remark'];

const importNumPerRequest = 1000; //每次请求的数据最大插入量

// 初始化 cloud
cloud.init()

exports.main = async(event, context) => {
  console.log("event", event)

  var reqStart = event.imported;
  var reqEnd = event.imported != undefined ? event.imported + importNumPerRequest : undefined;
  var tempCourseNo = 'tmp-' + event.course_no; //临时课程号



  //TODO 1、当reqStart不存在或者为0时，删除临时课程号中的题目，防止有脏数据
  if (reqStart == undefined || reqStart <= 0) {
    db.collection("question").where({
      course_no: tempCourseNo
    }).remove();
  }
  // 2、本次插入一定量的数据，插入后res中会保存整个文件的已插入数据量imported及总量total
  var res = await doAnalysis(event.fileId, tempCourseNo, reqStart, reqEnd);
  console.log("doAnalysis result", res)
  console.log("1res.imported >= res.total:", res.imported >= res.total)
  //TODO 3、检查已插入的数据是否已经是所有数据，若是，则将该课程号的原题目删除，再将临时课程号的题目更新为该课程号
  if (res.imported >= res.total) {
    var updateResult = await updateCourse(tempCourseNo, event.course_no)
    if (updateResult != true) {
      result.msg = '跟新课程号失败';
      return result;
    }
    // db.collection('question').where({
    //   course_no: _.eq(event.course_no)
    // }).remove().then(res => {
    //   console.log("已删除原题库，正要修改插入题目课程号")
    //   db.collection('question').where({
    //     course_no: _.eq(tempCourseNo)
    //   }).update({
    //     data: {
    //       course_no: event.course_no
    //     }
    //   }).then(res=>{
    //     console.log("修改课程号完成",res)
    //   })
    // })
  }
  //TODO 小程序端判断Imported是否大于等于total，若是则提示结果，若否则再次调用云函数

  return res;
};

async function doAnalysis(fileId, course_no, reqStart, reqEnd) {
  //返回结果
  var result = {
    success: false,
    data: {},
    msg: '',
    total: 0,
    imported: -1
  }
  try {
    //前端传入fileId
    var fileId = fileId;

    //获取文件名
    var spritIndex = fileId.lastIndexOf("/");
    var fileName = fileId.substr(spritIndex);
    //云函数的运行环境中在 /tmp （不是下面定义的./tmp/） 目录下提供了一块 512MB 的临时磁盘空间，用于处理单次云函数执行过程中的临时文件读写需求，需特别注意的是，这块临时磁盘空间在函数执行完毕后可能被销毁
    let path = "./tmp/" + fileName;
    console.log('临时保存地址:', path);
    var downRes = await checkDownloadFile(path, fileId);
    if (downRes) {
      result.msg = downRes;
      return result
    }
    // var file = 'test.xlsx';
    // const fileStream = fs.createReadStream(path.join(__dirname, file))
    // let r = await analysisdata(path.join(__dirname, file));

    //将临时保存的文件送node-xlsx解析
    let xlsxObj = await analysisdata(path);
    //校验解析后的数据
    let msg = await validateXlsx(xlsxObj);
    if ('success' != msg) {
      result.msg = msg;
      return result;
    }

    //将传入的数据封装为符合数据库集合格式的对象
    var recordList = [];
    var data = xlsxObj[0].data;
    var emptyCount = 0;
    for (var i = 1; i < data.length; i++) {
      if (!data[i] || data[i].length == 0) {
        emptyCount++;
        continue;
      }
      var record = buildRecord(data[i], course_no);
      if (!record) {
        result.msg = '第' + (i + 1) + '行解析异常，请检查';
        return result;
      }
      recordList.push(record);
    }

    //将封装后的数据插入数据库
    // var deleteRes = await deleteCourseAllQuesstion(course_no);

    // console.log("deleteCourseAllQuesstionRes", deleteRes)
    // if (deleteRes != true) {
    //   result.msg = '删除原题目失败';
    //   return result;
    // }
    if (!reqStart) {
      reqStart = 0;
    }
    if (!reqEnd || reqEnd > recordList.length) {
      reqEnd = recordList.length;
    }
    var successNum = await importIntoDb(recordList, reqStart, reqEnd);
    console.log('成功插入数据库数量：', successNum);
    result.success = true;
    result.msg = '解析成功，共添加' + (reqEnd - emptyCount) + '条题目';
    if (emptyCount > 0) {
      result.msg += (',跳过' + emptyCount + '个空行');
    }
    result.total = recordList.length;
    result.imported = reqEnd;
    return result;


  } catch (err) {
    result.msg = '执行错误，' + err;
    return result;
  }
}

//检查是否需要下载文件
async function checkDownloadFile(path, fileId) {
  // fs.exists(path, function (exists) {
  //   if (!exists) {

  //根据fileId获取临时下载地址
  var urlRes = await cloud.getTempFileURL({
    fileList: [fileId],
    success: res => {},
    fail: err => {
      // handle error
    }
  });
  console.log('获取下载地址：', urlRes);
  if (!urlRes || !urlRes.fileList || urlRes.fileList.length == 0) {
    return "无法获取文件下载地址";
  }

  var url = urlRes.fileList[0].tempFileURL;
  let opts = {
    url: encodeURI(url),
  };
  //使用获取的下载地址，用网络请求将文件下载至临时目录
  let r1 = await downFile(opts, path);
  console.log('临时保存地址下载结果:', path, ',', r1);
  // } 
  //   else {
  //     console.log('文件已存在，无需再次下载')
  //   }
  // });
}

//封装一行数据为符合数据库集合格式的对象
function buildRecord(columns, course_no) {

  if (!columns || columns.length < pacticeFileColumn.length) {
    console.log("columns", columns)
    return
  }
  var options = [];
  if (columns[1]) {
    options.push({
      'option': 'A',
      'content': columns[1]
    });
  }
  if (columns[2]) {
    options.push({
      'option': 'B',
      'content': columns[2]
    });
  }
  if (columns[3]) {
    options.push({
      'option': 'C',
      'content': columns[3]
    });
  }
  if (columns[4]) {
    options.push({
      'option': 'D',
      'content': columns[4]
    });
  }

  var practiceRecord = {
    // 'word': columns[0],
    'question': columns[0],
    'options': options,
    'answer': columns[5],
    'remark': columns[6],
    "course_no": course_no

  }

  return practiceRecord;
}

//将数据列表插入数据库
async function importIntoDb(recordList, reqStart, reqEnd) {
  if (!reqStart) {
    reqStart = 0;
  }
  if (!reqEnd || reqEnd > recordList.length) {
    reqEnd = recordList.length;
  }
  console.log('数据总行数：', recordList.length, '本次插入：', reqStart, '-', reqEnd);
  //限制每次异步执行的数据库操作数量
  //防止数据库连接数用尽导致异常
  var limit = 10;
  var size = reqEnd - reqStart;

  //若插入的数据条数小于限制，直接执行一次
  if (limit >= size) {

    return await importIntoDbPart(recordList, reqStart, reqEnd);
  }


  var index = 1;
  var successNum = 0;
  //循环每次插入limit条数据
  while (true) {
    var _start = reqStart + limit * (index - 1);
    var _end = reqStart + limit * index > reqEnd ? reqEnd : reqStart + limit * index;
    successNum += await importIntoDbPart(recordList, _start, _end);
    index++;
    if (_end >= reqEnd) {
      break;
    }
  }

  return successNum;

}

//分段将数据列表插入数据库
async function importIntoDbPart(recordList, start, end) {
  console.log('即将插入第', start, '-', end, '行数据：');

  var promiseList = [];

  for (var i = start; i < end; i++) {
    recordList[i].createDate = new Date();
    promiseList.push(
      db.collection('question').add({
        data: recordList[i]
      })
    )
  }
  return Promise.all(promiseList).then(res => {
    // console.log('插入数据库返回结果：', res);
    return res.length;
  });
}

async function analysisdata(xlsxfile) {
  let obj = xlsx.parse(xlsxfile);
  return obj;
}
//检验文件模板
async function validateXlsx(xlsxObj) {
  var data = xlsxObj[0].data;
  var columnSize = pacticeFileColumn.length;
  console.log("文件行数：" + data.length);
  for (var i = 0; i < data.length; i++) {
    if (data[i].length == columnSize - 1) {
      var str = "略"
      data[i].push(str)
    }
    if (data[i] && data[i].length > 0 && data[i].length < columnSize) {
      return "导入失败！第" + (i + 1) + "行列数小于" + columnSize;
    }
  }
  return 'success';
}

async function readdata(v) {
  console.log("xlsx =", v); //xlsx = [ { name: 'Sheet1', data: [ [Array], [Array], [Array] ] } ]
  console.log("数据 = ", v[0]); //数据 =  { name: 'Sheet1',
  //        data: [ [ '姓名', '年龄' ], [ '张三', 20 ], [ '李四', 30 ] ]}
  console.log("要上传的数据 = ", v[0].data); //要上传的数据 =  [ [ '姓名.', '年龄' ], [ '张三', 20 ], [ '李四', 30 ] ]

}

//使用request下载文件
async function downFile(opts = {}, path = '') {
  console.log('从', opts, '下载文件至', path)
  return new Promise((resolve, reject) => {
    request
      .get(opts)
      .on('response', (response) => {
        // console.log(response)
        console.log("img type:", response.headers['content-type'])
      })
      .pipe(fs.createWriteStream(path))
      .on("error", (e) => {
        console.log("pipe error", e)
        resolve('');
      })
      .on("finish", () => {
        console.log("finish");
        resolve("ok");
      })
      .on("close", () => {
        console.log("close");
      })

  })
};
//删除数据库传入课程号的所有问题
async function deleteCourseAllQuesstion(course_no) {
  try {
    var deleteResult = await db.collection('question').where({
      course_no: course_no
    }).remove();
    console.log("delete course result:", deleteResult);
    return true;
  } catch (e) {
    console.error("delete course err", e)
    throw e;
  }
}


async function updateCourse(tempCourseNo, course_no) {
  try {
    var updateResult = await db.collection('question').where({
      course_no: course_no
    }).remove().then(res => {
      console.log("已删除原题库，正要修改插入题目课程号",res)
      
    })

    updateResult = await db.collection('question').where({
      course_no: tempCourseNo
    })
    .update({
      data: {
        course_no: course_no
      }
    })
  
    console.log("update course result:", updateResult);
    return true;
  } catch (e) {
    console.error("update course err", e)
    throw e;
  }
}
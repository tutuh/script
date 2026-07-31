/**
 * 顺丰速运签到 Surge版
 * 
 * 获取会话:
 * 打开顺丰APP 获取 Cookie
 * 
 * 运行本脚本签到
 */

const SF_KEY = "sfexpress_session";

let login = null;
let signData = null;
let taskList = [];
let pointInfo = { signPoints: 0, taskPoints: 0, totalPoints: 0 };

(async () => {
  console.log("🔔顺丰速运 开始");

  try {
    if (typeof $request !== "undefined") {
      const session = {
        url: $request.url,
        body: $request.body,
        headers: $request.headers
      };

      const ok = $persistentStore.write(JSON.stringify(session), SF_KEY);
      console.log(ok ? "会话保存成功" : "会话保存失败");

      $notification.post(
        "顺丰速运",
        ok ? "获取会话成功" : "获取会话失败",
        ""
      );

      $done();
      return;
    }

    await loginApp();
    await wait(1000);
    await loginWeb();
    await wait(1000);
    await sign();
    await wait(1000);
    await dailyTask();
    await wait(1000);
    await getPointDetail();

    showMsg();

  } catch (e) {
    console.log("异常: " + e);
    $notification.post("顺丰速运", "执行失败", String(e));
  }

  $done();
})();

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function requestPost(opts) {
  return new Promise((resolve, reject) => {
    $httpClient.post(opts, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

function requestGet(opts) {
  return new Promise((resolve, reject) => {
    $httpClient.get(opts, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

async function loginApp() {
  const data = $persistentStore.read(SF_KEY);
  
  if (!data) {
    throw "没有顺丰会话";
  }

  let opts = JSON.parse(data);
  if (opts.headers.Cookie) {
    delete opts.headers.Cookie;
  }

  const body = await requestPost(opts);
  login = JSON.parse(body);

  if (login.success) {
    console.log("APP登录成功");
  } else {
    throw "APP登录失败";
  }
}

async function loginWeb() {
  const sign = encodeURIComponent(login.obj.sign);

  await requestGet({
    url: `https://mcs-mimp-web.sf-express.com/mcs-mimp/share/app/shareRedirect?sign=${sign}&source=SFAPP&bizCode=647@RnlvejM1R3VTSVZ6d3BNaXJxRFpOUVVtQkp0ZnFpNDBKdytobm5TQWxMeHpVUXVrVzVGMHVmTU5BVFA1bXlwcw==`
  });

  console.log("WEB登录成功");
}

async function sign() {
  // 查询签到状态
  let body = await requestPost({
    url: "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralSignV2Service~getTodaySign",
    headers: {
      "Content-Type": "application/json"
    },
    body: "{}"
  });

  let data = JSON.parse(body);

  if (!data.success) {
    console.log("查询签到状态失败");
    signData = data;
    return;
  }

  // 已签到
  if (data.obj.signed) {
    signData = {
      success: true,
      obj: {
        hasFinishSign: true,
        countDay: data.obj.dayCount
      }
    };

    console.log(`今日已签到 连续${data.obj.dayCount}天`);
    return;
  }

  // 执行签到
  body = await requestPost({
    url: "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralSignV2Service~sign",
    headers: {
      "Content-Type": "application/json"
    },
    body: "{}"
  });

  data = JSON.parse(body);

  if (data.success) {
    signData = {
      success: true,
      obj: {
        hasFinishSign: false,
        countDay: data.obj.dayCount
      }
    };

    console.log(`签到成功 连续${data.obj.dayCount}天`);
  } else {
    signData = data;
    console.log("签到失败：" + (data.errorMessage || "未知错误"));
  }
}

async function dailyTask() {
  const body = await requestPost({
    url: "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ channelType: "1" })
  });

  const data = JSON.parse(body);

  if (!data.success || !data.obj) {
    console.log("获取任务失败");
    taskList = [];
    return;
  }

  taskList = data.obj.taskTitleLevels || [];
  console.log("任务数量: " + taskList.length);

  for (const task of taskList) {
    if (task.status === 1) {
      await getPoint(task);
    } else if (task.status === 2) {
      await requestPost({
        url: "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonRoutePost/memberEs/taskRecord/finishTask",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          taskCode: task.taskCode
        })
      });
      await getPoint(task);
    } else if (task.status === 3) {
      task.result = "已领取";
    }
  }

  console.log("--- 任务执行明细 ---");
  console.log(
    taskList.map((task) => `${task.title}: ${task.result || "未完成"}`).join("\n")
  );
  console.log("--------------------");
}

async function getPoint(task) {
  const body = await requestPost({
    url: "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~fetchIntegral",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      strategyId: task.strategyId,
      taskId: task.taskId,
      taskCode: task.taskCode,
      channelType: "1"
    })
  });

  const data = JSON.parse(body);

  if (!data.success) {
    task.result = data.errorMessage || "没有对应任务";
    return;
  }

  task.result = "成功";
}

// 获取今天日期的辅助函数，格式：YYYY-MM-DD
function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 积分明细
async function getPointDetail() {
  try {
    const body = await requestPost({
      url: "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberIntegral~memberPoint~queryMemberPointDetailInfo",
      headers: {
        "Content-Type": "application/json"
      },
      body: "{}"
    });

    const data = JSON.parse(body);

    if (data.success && data.obj && data.obj.data) {
      const todayStr = getTodayStr(); // 获取当天的日期字符串
      const records = data.obj.data;

      // 如果有数据，获取第一条数据的 curPoint 作为当前总积分
      if (records.length > 0) {
        pointInfo.totalPoints = records[0].curPoint;
      }

      // 遍历列表，统计今天的各项积分收益
      for (const item of records) {
        if (item.createTm && item.createTm.startsWith(todayStr)) {
          const val = parseInt(item.pointVal || 0);
          if (item.sourceCodeLabel && item.sourceCodeLabel.includes("签到")) {
            pointInfo.signPoints += val;
          } else if (item.sourceCodeLabel && item.sourceCodeLabel.includes("任务")) {
            pointInfo.taskPoints += val;
          }
        }
      }
      console.log(`今日积分统计 - 签到: ${pointInfo.signPoints}, 任务: ${pointInfo.taskPoints}, 总计: ${pointInfo.totalPoints}`);
    }
  } catch (e) {
    console.log("获取积分明细异常：" + e);
  }
}

// 整合统计结果并展示
function showMsg() {
  // 统计成功或已领取的任务数量
  let successCount = 0;
  for (const task of taskList) {
    if (task.result === "成功" || task.result === "已领取") {
      successCount++;
    }
  }

  let title = "签到失败";
  
  if (signData && signData.success) {
    title = signData.obj.hasFinishSign ? 
      `今日已签到 (连续${signData.obj.countDay}天)` : 
      `签到成功 (连续${signData.obj.countDay}天)`;
  }

  // 通知
  let msg = `🪙 今日获取: 签到 ${pointInfo.signPoints} 分 | 任务 ${pointInfo.taskPoints} 分\n`;
  msg += `💰 当前总计: ${pointInfo.totalPoints} 分\n`;
  msg += `🎉 自动任务: 成功完成并领取 ${successCount} 个`;

  $notification.post("顺丰速运", title, msg);
}

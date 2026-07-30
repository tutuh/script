/****************----------------*
 百度贴吧签到 Surge版

 功能:
 1. 自动精准获取 BDUSS Cookie
 2. 自动签到关注贴吧
 3. 已签到自动跳过
 4. 未签到随机延迟
 5. 签到失败自动重试
*********************************/

var NAME = "贴吧签到";
var COOKIE_KEY = "TieBa_Cookie";
var MAX_RETRY = 3;

var UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

var cookie = $persistentStore.read(COOKIE_KEY) || "";
var result = [];

(async function() {
  try {
    if (typeof $request !== "undefined") {
      getCookie();
      // 在 Surge 中，针对网络请求脚本，必须返回空对象放行
      $done({});
    } else {
      await main();
      // 针对 Cron 定时任务，直接结束
      $done(); 
    }
  } catch (e) {
    console.log("脚本主进程异常: " + e);
    $notification.post(NAME, "❌ 脚本崩溃", "请查看 Surge 日志");
    $done();
  }
})();

async function main() {
  if (!cookie) {
    notify(NAME, "❌ 失败", "未获取Cookie，请先用浏览器登录贴吧获取");
    return;
  }

  console.log("开始获取贴吧列表...");
  var data = await getForum();

  if (!data || !data.like_forum) {
    notify(NAME, "❌ 失败", "未获取到贴吧列表，可能是 Cookie/BDUSS 已失效");
    return;
  }

  var bars = data.like_forum;
  var tbs = data.tbs;

  if (!Array.isArray(bars)) {
    notify(NAME, "❌ 失败", "贴吧列表数据格式异常");
    return;
  }

  console.log("共发现 " + bars.length + " 个贴吧");

  var success = 0;
  var already = 0;

  for (var i = 0; i < bars.length; i++) {
    var bar = bars[i];
    if (!bar || !bar.forum_name) continue;

    if (bar.is_sign == 1) {
      already++;
      var level = bar.user_level !== undefined ? bar.user_level : "?";
      var exp = bar.user_exp !== undefined ? bar.user_exp : "?";
      result.push("【" + bar.forum_name + "】已经签到，等级" + level + "，经验" + exp);
      continue;
    }

    var wait = random(5000, 10000);
    await sleep(wait);

    var r = await sign(bar.forum_name, tbs);

    if (r && r.success) {
      success++;
      result.push("【" + bar.forum_name + "】签到成功，" + r.msg);
    } else {
      var failMsg = (r && r.msg) ? r.msg : "未知错误";
      result.push("【" + bar.forum_name + "】签到失败: " + failMsg);
    }

    var logMsg = (r && r.msg) ? r.msg : "无返回";
    console.log(bar.forum_name + ": " + logMsg + "，等待 " + (wait / 1000).toFixed(2) + " 秒");
  }

  console.log("\n========== 签到详情 ==========\n" + result.join("\n") + "\n==============================");

  notify(
    NAME,
    "✅ 签到完成",
    "新增: " + success + " 吧\n已签: " + already + " 吧\n共计: " + bars.length + " 吧"
  );
}

function getForum() {
  return new Promise(function(resolve) {
    $httpClient.get(
      {
        url: "https://tieba.baidu.com/mo/q/newmoindex",
        headers: {
          "Content-Type": "application/octet-stream",
          "Referer": "https://tieba.baidu.com/index/tbwise/forum",
          "Cookie": cookie,
          "User-Agent": UA
        }
      },
      function(err, resp, body) {
        if (err) {
          console.log("获取列表网络错误: " + err);
          resolve(null);
          return;
        }

        try {
          if (!body) {
            console.log("获取列表返回空内容");
            resolve(null);
            return;
          }
          var obj = JSON.parse(body);
          if (obj && obj.no == 0 && obj.data) {
            resolve(obj.data);
          } else {
            console.log("获取列表接口返回异常: " + body);
            resolve(null);
          }
        } catch (e) {
          console.log("解析贴吧列表失败: " + e + ", 返回内容: " + body);
          resolve(null);
        }
      }
    );
  });
}

async function sign(kw, tbs) {
  var lastResult = { success: false, msg: "未知错误" };

  for (var attempt = 1; attempt <= MAX_RETRY; attempt++) {
    var r = await signOnce(kw, tbs);
    
    if (r && r.success) {
      return r;
    }

    lastResult = r || lastResult;
    console.log("[重试提示] " + kw + " 第 " + attempt + " 次尝试失败: " + lastResult.msg);

    if (attempt < MAX_RETRY) {
      var retryWait = random(2000, 5000); 
      console.log("[重试提示] " + kw + " 将在 " + (retryWait / 1000).toFixed(1) + " 秒后重试...");
      await sleep(retryWait);
    }
  }

  return { success: false, msg: "重试" + MAX_RETRY + "次后放弃 (" + lastResult.msg + ")" };
}

function signOnce(kw, tbs) {
  return new Promise(function(resolve) {
    var safeTbs = tbs ? tbs : "";
    var safeKw = kw ? kw : "";
    
    $httpClient.post(
      {
        url: "https://tieba.baidu.com/sign/add",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": cookie,
          "User-Agent": UA,
          "Referer": "https://tieba.baidu.com/f?kw=" + encodeURIComponent(safeKw),
          "Origin": "https://tieba.baidu.com"
        },
        body: "tbs=" + safeTbs + "&kw=" + encodeURIComponent(safeKw) + "&ie=utf-8"
      },
      function(err, resp, body) {
        if (err) {
          resolve({ success: false, msg: "网络请求失败" });
          return;
        }

        try {
          if (!body) {
            resolve({ success: false, msg: "接口返回空内容" });
            return;
          }
          var obj = JSON.parse(body);
          if (obj && obj.no == 0) {
            var cont = (obj.data && obj.data.uinfo && obj.data.uinfo.cont_sign_num) ? obj.data.uinfo.cont_sign_num : "?";
            var rank = (obj.data && obj.data.uinfo && obj.data.uinfo.user_sign_rank) ? obj.data.uinfo.user_sign_rank : "?";
            resolve({
              success: true,
              msg: "连续签到 " + cont + " 天，第 " + rank + " 个签到"
            });
          } else {
            var errorMsg = (obj && obj.error) ? obj.error : ("错误码:" + (obj ? obj.no : "未知"));
            resolve({ success: false, msg: errorMsg });
          }
        } catch (e) {
          console.log("【" + kw + "】签到接口返回异常:\n" + body);
          resolve({ success: false, msg: "接口返回非JSON数据" });
        }
      }
    );
  });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

function getCookie() {
  if (typeof $request === "undefined" || !$request.headers) return;

  var ck = $request.headers["Cookie"] || $request.headers["cookie"] || $request.headers["COOKIE"];

  if (ck) {
    var bdussMatch = ck.match(/BDUSS=([^;]+)/);
    
    if (bdussMatch && bdussMatch[1]) {
      var cleanCookie = "BDUSS=" + bdussMatch[1];
      var old = $persistentStore.read(COOKIE_KEY) || "";

      if (cleanCookie !== old) {
        $persistentStore.write(cleanCookie, COOKIE_KEY);
        console.log("BDUSS Cookie 更新成功!");
        notify(NAME, "🎉 获取 Cookie 成功", "已成功保存 BDUSS 凭证");
      } else {
        console.log("BDUSS Cookie 无变化，跳过保存");
      }
      return;
    }
  }
  
  console.log("获取 Cookie 失败：当前请求头中未找到 BDUSS 字段");
}

function notify(title, subtitle, body) {
  $notification.post(title, subtitle, body);
  console.log("\n[通知] " + title + "\n" + subtitle + "\n" + body + "\n");
}

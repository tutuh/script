// 百度贴吧签到 Surge 增强优化版

const NAME = "贴吧签到";
const COOKIE_KEY = "TieBa_Cookie";

const CONFIG = {
  timeout: 20000,
  retry: 3,
  minDelay: 1500,
  maxDelay: 3000,
  retryDelay: 5000,
  notificationLimit: 2000
};

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";

let cookie = $persistentStore.read(COOKIE_KEY) || "";
let result = [];
let failedBars = [];
let finalFailed = [];
let startTime = Date.now();
let stopTask = false;

(async () => {
  try {
    if (typeof $request !== "undefined") {
      getCookie();
    } else {
      await main();
    }
  } catch (e) {
    console.log("脚本异常:", e);
    notify(NAME, "运行异常", String(e));
  }
  $done();
})();

async function main() {
  if (!checkCookie()) {
    notify(NAME, "Cookie错误", "未检测到有效 BDUSS，请重新获取 Cookie");
    return;
  }
  console.log("开始获取贴吧列表");
  
  let forumData = await retryRequest(getForum, "获取贴吧列表");
  if (!forumData || (!forumData.like_forum && !forumData.forum_list)) {
    notify(NAME, "失败", "无法获取关注贴吧，请检查 Cookie");
    return;
  }

  let bars = forumData.like_forum || forumData.forum_list || [];
  let tbs = forumData.tbs || "";
  
  if (!bars.length) {
    notify(NAME, "失败", "没有找到关注贴吧");
    return;
  }
  console.log(`发现 ${bars.length} 个贴吧`);

  let success = 0;
  let already = 0;

  for (let bar of bars) {
    if (stopTask) break;
    let name = bar.forum_name || bar.name;
    if (!name) continue;

    if (String(bar.is_sign) === "1" || String(bar.sign_status) === "1") {
      already++;
      result.push(`【${name}】已签到`);
      continue;
    }

    await sleep(random(CONFIG.minDelay, CONFIG.maxDelay));
    let begin = Date.now();
    let res = await signRetry(name, tbs);
    let cost = Date.now() - begin;

    if (res.success) {
      success++;
      result.push(`【${name}】签到成功 ${res.msg} (${cost}ms)`);
    } else {
      if (res.code === "COOKIE_ERROR") {
        stopTask = true;
        notify(NAME, "Cookie失效", "请重新获取 BDUSS");
        return;
      }
      failedBars.push({ name: name, tbs: tbs });
      result.push(`【${name}】失败：${res.msg} (${cost}ms)`);
    }
  }

  if (failedBars.length && !stopTask) {
    console.log("开始失败补签");
    await sleep(CONFIG.retryDelay);
    for (let bar of failedBars) {
      await sleep(random(2000, 5000));
      let res = await signRetry(bar.name, bar.tbs);
      
      if (res.success) {
        success++;
        result.push(`【${bar.name}】补签成功 ${res.msg}`);
      } else {
        if (res.code === "COOKIE_ERROR") {
          stopTask = true;
          break;
        }
        finalFailed.push(bar.name);
        result.push(`【${bar.name}】补签失败：${res.msg}`);
      }
    }
  }

  let cost = ((Date.now() - startTime) / 1000).toFixed(1);
  let body = [
    `完成: ${success + already}/${bars.length}`,
    `成功: ${success}`,
    `已签: ${already}`,
    `失败: ${finalFailed.length}`,
    `耗时: ${cost}s`,
    "",
    ...(finalFailed.length ? ["失败贴吧：" + finalFailed.join("、"), ""] : []),
    ...result
  ].join("\n").slice(0, CONFIG.notificationLimit);

  notify(NAME, `签到完成 ${success + already}/${bars.length}`, body);
}

// 获取贴吧列表
function getForum() {
  return new Promise(resolve => {
    $httpClient.get({
      url: "https://tieba.baidu.com/mo/q/newmoindex",
      timeout: CONFIG.timeout,
      headers: {
        "Content-Type": "application/octet-stream",
        "Referer": "https://tieba.baidu.com/index/tbwise/forum",
        "Cookie": cookie,
        "User-Agent": UA
      }
    }, (err, resp, body) => {
      if (err) {
        console.log("获取贴吧错误:", JSON.stringify(err));
        resolve(null);
        return;
      }
      const code = resp && (resp.status || resp.statusCode);
      if (!resp || code !== 200) {
        console.log("贴吧HTTP:", code);
        resolve(null);
        return;
      }
      try {
        let obj = JSON.parse(body);
        if (obj.no && obj.no != 0) {
          console.log("贴吧接口错误:", body);
          resolve(null);
          return;
        }
        let data = obj.data || {};
        if (!data.like_forum && data.forum_list) {
          data.like_forum = data.forum_list;
        }
        if (!data.like_forum && !data.forum_list) {
          console.log("贴吧列表返回异常:\n", body);
        }
        resolve(data);
      } catch (e) {
        console.log("解析贴吧失败:", body);
        resolve(null);
      }
    });
  });
}

// 签到重试
async function signRetry(kw, tbs) {
  let last = { success: false, msg: "未知错误" };
  for (let i = 1; i <= CONFIG.retry; i++) {
    last = await sign(kw, tbs);
    if (last.success || last.code === "COOKIE_ERROR") return last;
    
    console.log(`【${kw}】第${i}次失败:${last.msg}`);
    
    if (last.code === "TBS_ERROR") {
      console.log("刷新 tbs");
      let data = await getForum();
      if (data && data.tbs) {
        tbs = data.tbs;
        last = await sign(kw, tbs);
        if (last.success) return last;
      }
    }
    
    if (i < CONFIG.retry) {
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  return last;
}

// 签到接口
function sign(kw, tbs) {
  return new Promise(resolve => {
    $httpClient.post({
      url: "https://tieba.baidu.com/sign/add",
      timeout: CONFIG.timeout,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "User-Agent": UA,
        "Referer": "https://tieba.baidu.com/",
        "Origin": "https://tieba.baidu.com"
      },
      body: `tbs=${encodeURIComponent(tbs)}&kw=${encodeURIComponent(kw)}&ie=utf-8`
    }, (err, resp, body) => {
      if (err) {
        resolve({ success: false, msg: getError(err) });
        return;
      }
      const code = resp && (resp.status || resp.statusCode);
      if (!resp || code !== 200) {
        resolve({ success: false, msg: `HTTP ${code}` });
        return;
      }
      try {
        let obj = JSON.parse(body);
        if (obj.no == 0) {
          let uinfo = (obj.data && obj.data.uinfo) || {};
          let msg = [];
          if (uinfo.cont_sign_num) msg.push(`连续${uinfo.cont_sign_num}天`);
          if (uinfo.user_sign_rank) msg.push(`第${uinfo.user_sign_rank}个签到`);
          resolve({ success: true, msg: msg.join(" ") });
          return;
        }
        
        let errorMsg = obj.error || obj.error_msg || `错误码 ${obj.no}`;
        
        // tbs失效
        if (obj.no == 110001 || obj.no == 2150040 || obj.no == 220034) {
          resolve({ success: false, code: "TBS_ERROR", msg: errorMsg });
          return;
        }
        // Cookie失效
        if (obj.no == 110000 || obj.no == 110002) {
          resolve({ success: false, code: "COOKIE_ERROR", msg: "Cookie失效" });
          return;
        }
        resolve({ success: false, msg: errorMsg });
      } catch (e) {
        console.log(`【${kw}】返回:`, body);
        resolve({ success: false, msg: "JSON解析失败" });
      }
    });
  });
}

// 通用请求重试
async function retryRequest(fn, name) {
  let data = null;
  for (let i = 1; i <= CONFIG.retry; i++) {
    data = await fn();
    if (data) return data;
    console.log(`${name} 第${i}次失败`);
    if (i < CONFIG.retry) {
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  return null;
}

// Cookie获取
function getCookie() {

  let headers = $request.headers || {};

  let ck =
    headers["Cookie"] ||
    headers["cookie"] ||
    headers["COOKIE"];

  if (
    ck &&
    ck.length > 20
  ) {

    let old =
      $persistentStore.read(
        COOKIE_KEY
      ) || "";

    if (
      ck !== old
    ) {

      $persistentStore.write(
        ck,
        COOKIE_KEY
      );

      notify(
        NAME,
        "",
        "Cookie获取成功 🎉"
      );

      console.log(
        "Cookie更新成功"
      );

    } else {

      console.log(
        "Cookie未变化"
      );

    }

  } else {

    console.log(
      "无Cookie，跳过"
    );

  }

}

// 检查Cookie有效格式
function checkCookie() {

  return (
    cookie &&
    cookie.length > 20
  );

}

// 随机延迟
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 延迟
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 错误处理
function getError(err) {
  if (!err) return "未知错误";
  return err.error || err.localizedDescription || JSON.stringify(err);
}

// Surge通知
function notify(title, subtitle, body) {
  $notification.post(title, subtitle, body);
  console.log(`\n${title}\n${body}`);
}

// 百度贴吧签到 Surge版

const NAME = "贴吧签到";
const COOKIE_KEY = "TieBa_Cookie";
const CONFIG = {
  timeout: 20000,
  retry: 3,
  minDelay: 1500,
  maxDelay: 3000
};

let cookie = $persistentStore.read(COOKIE_KEY) || "";
let result = [];
let failedBars = [];
let finalFailed = [];
let startTime = Date.now();

(async () => {
  if (typeof $request !== "undefined") {
    getCookie();
  } else {
    await main();
  }
  $done();
})();

async function main() {
  if (!cookie || !cookie.includes("BDUSS=")) {
    notify(NAME, "Cookie错误", "未检测到有效BDUSS，请重新获取Cookie");
    return;
  }

  console.log("开始获取贴吧列表");

  let forumData = await retryRequest(getForum, "获取贴吧列表");

  if (!forumData || !forumData.like_forum) {
    notify(NAME, "失败", "无法获取关注贴吧，请检查Cookie");
    return;
  }

  let bars = forumData.like_forum;
  let tbs = forumData.tbs;

  console.log(`共发现 ${bars.length} 个贴吧`);

  let success = 0;
  let already = 0;

  for (let bar of bars) {
    let name = bar.forum_name;

    if (bar.is_sign == 1) {
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
      result.push(`【${name}】签到成功，${res.msg} (${cost}ms)`);
    } else {
      failedBars.push({ name, tbs });
      result.push(`【${name}】失败：${res.msg} (${cost}ms)`);
    }
  }

  // 失败贴吧补签
  if (failedBars.length) {
    console.log("开始失败贴吧补签");
    await sleep(5000);

    for (let bar of failedBars) {
      let res = await signRetry(bar.name, bar.tbs);
      if (res.success) {
        success++;
        result.push(`【${bar.name}】补签成功，${res.msg}`);
      } else {
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
    ...result
  ].join("\n");

  notify(NAME, `签到完成 ${success + already}/${bars.length}`, body);
}

function getForum() {
  return new Promise(resolve => {
    $httpClient.get({
      url: "https://tieba.baidu.com/mo/q/newmoindex",
      timeout: CONFIG.timeout,
      headers: {
        "Content-Type": "application/octet-stream",
        "Referer": "https://tieba.baidu.com/index/tbwise/forum",
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
      }
    }, (err, resp, body) => {
      if (err) {
        console.log("获取贴吧错误:", JSON.stringify(err));
        resolve(null);
        return;
      }

      if (!resp || resp.status !== 200) {
        console.log("贴吧HTTP:", resp && resp.status);
        resolve(null);
        return;
      }

      try {
        let obj = JSON.parse(body);
        if (obj.no && obj.no != 0) {
          console.log("贴吧返回错误:", body);
          resolve(null);
          return;
        }
        resolve(obj.data);
      } catch (e) {
        console.log("贴吧解析失败:", body);
        resolve(null);
      }
    });
  });
}

/**
 * 签到重试
 */
async function signRetry(kw, tbs) {
  let last = { success: false, msg: "未知错误" };

  for (let i = 1; i <= CONFIG.retry; i++) {
    last = await sign(kw, tbs);
    if (last.success) return last;

    console.log(`【${kw}】第${i}次失败: ${last.msg}`);

    // tbs异常，刷新一次
    if (last.code === "TBS_ERROR") {
      console.log("tbs异常，重新获取");
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

/**
 * 签到接口
 */
function sign(kw, tbs) {
  return new Promise(resolve => {
    $httpClient.post({
      url: "https://tieba.baidu.com/sign/add",
      timeout: CONFIG.timeout,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (iPhone)",
        "Referer": "https://tieba.baidu.com/",
        "Origin": "https://tieba.baidu.com"
      },
      body: `tbs=${encodeURIComponent(tbs)}&kw=${encodeURIComponent(kw)}&ie=utf-8`
    }, (err, resp, body) => {
      if (err) {
        resolve({ success: false, msg: getError(err) });
        return;
      }

      if (!resp || resp.status !== 200) {
        resolve({ success: false, msg: `HTTP ${resp && resp.status}` });
        return;
      }

      try {
        let obj = JSON.parse(body);
        if (obj.no == 0) {
          resolve({
            success: true,
            msg: `获得 ${obj.data.uinfo.cont_sign_num} 积分，第 ${obj.data.uinfo.user_sign_rank} 个签到`
          });
          return;
        }

        let errorMsg = obj.error || obj.error_msg || `错误码 ${obj.no}`;

        // 常见tbs失效
        if (obj.no == 110001 || obj.no == 2150040) {
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
        console.log(`【${kw}】返回内容:`, body);
        resolve({ success: false, msg: "JSON解析失败" });
      }
    });
  });
}

/**
 * 通用请求重试
 */
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

/**
 * Cookie获取
 */
function getCookie() {
  let ck = $request.headers["Cookie"] || $request.headers["cookie"];

  if (ck && ck.includes("BDUSS=") && $request.url.includes("tieba.baidu.com")) {
    let old = $persistentStore.read(COOKIE_KEY) || "";
    if (ck !== old) {
      $persistentStore.write(ck, COOKIE_KEY);
      notify(NAME, "", "Cookie获取成功 🎉");
      console.log("Cookie更新成功");
    } else {
      notify(NAME, "", "Cookie未变化");
      console.log("Cookie未变化");
    }
  } else {
    notify(NAME, "", "Cookie获取失败，缺少BDUSS");
    console.log("Cookie获取失败");
  }
}

/**
 * 工具函数
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getError(err) {
  if (!err) return "未知错误";
  return err.error || err.localizedDescription || JSON.stringify(err);
}

/**
 * Surge通知
 */
function notify(title, subtitle, body) {
  $notification.post(title, subtitle, body);
  console.log(`\n${title}\n${body}`);
}

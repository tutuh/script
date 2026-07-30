/*********************************
 百度贴吧签到 Surge版

 功能:
 1. 自动获取Cookie
 2. 自动签到关注贴吧
 3. 已签到自动跳过
 4. 未签到随机延迟
 5. 签到失败自动重试 (新增)
*********************************/

const NAME = "贴吧签到";
const COOKIE_KEY = "TieBa_Cookie";
const MAX_RETRY = 3; // 签到失败最大重试次数

let cookie = $persistentStore.read(COOKIE_KEY) || "";
let result = [];

(async () => {
  if (typeof $request !== "undefined") {
    getCookie();
  } else {
    await main();
  }
  $done();
})();

async function main() {
  if (!cookie) {
    notify(NAME, "", "未获取Cookie");
    return;
  }

  console.log("开始获取贴吧列表");
  let data = await getForum();

  if (!data || !data.like_forum) {
    notify(NAME, "失败", "未获取关注贴吧");
    return;
  }

  let bars = data.like_forum;
  let tbs = data.tbs;

  console.log(`共发现 ${bars.length} 个贴吧`);

  let success = 0;
  let already = 0;

  for (let bar of bars) {
    /* 已签到直接跳过 */
    if (bar.is_sign == 1) {
      already++;
      result.push(`【${bar.forum_name}】已经签到，等级${bar.user_level}，经验${bar.user_exp}`);
      continue;
    }

    // 随机等待 2 到 4 秒，防止请求过快被限制
    let wait = random(2000, 4000);
    await sleep(wait);

    // 调用带重试机制的签到方法
    let r = await sign(bar.forum_name, tbs);

    if (r.success) {
      success++;
      result.push(`【${bar.forum_name}】签到成功，${r.msg}`);
    } else {
      result.push(`【${bar.forum_name}】签到失败: ${r.msg}`);
    }

    console.log(`${bar.forum_name}: ${r.msg}，前置等待 ${(wait / 1000).toFixed(2)} 秒`);
  }

  notify(
    NAME,
    `✅ 签到完成 | 新增: ${success} | 已签: ${already} | 共: ${bars.length}`,
    result.join("\n")
  );
}

// 获取贴吧列表
function getForum() {
  return new Promise((resolve) => {
    $httpClient.get(
      {
        url: "https://tieba.baidu.com/mo/q/newmoindex",
        headers: {
          "Content-Type": "application/octet-stream",
          "Referer": "https://tieba.baidu.com/index/tbwise/forum",
          "Cookie": cookie,
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
        }
      },
      (err, resp, body) => {
        if (err) {
          console.log(err);
          resolve(null);
          return;
        }

        try {
          let obj = JSON.parse(body);
          resolve(obj.data);
        } catch (e) {
          resolve(null);
        }
      }
    );
  });
}

// 签到控制器（包含重试机制）
async function sign(kw, tbs) {
  let lastResult = { success: false, msg: "未知错误" };

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    let r = await signOnce(kw, tbs);
    
    // 如果签到成功，直接返回结果
    if (r.success) {
      return r;
    }

    lastResult = r;
    console.log(`[重试提示] ${kw} 第 ${attempt} 次尝试失败: ${r.msg}`);

    // 如果未达到最大重试次数，则等待一段时间后重试
    if (attempt < MAX_RETRY) {
      let retryWait = random(2000, 4000); // 重试前等待 2 到 4 秒
      console.log(`[重试提示] ${kw} 将在 ${(retryWait / 1000).toFixed(2)} 秒后进行第 ${attempt + 1} 次尝试...`);
      await sleep(retryWait);
    }
  }

  // 达到最大重试次数依然失败
  return { success: false, msg: `重试${MAX_RETRY}次后放弃 (${lastResult.msg})` };
}

// 单次签到接口请求
function signOnce(kw, tbs) {
  return new Promise((resolve) => {
    $httpClient.post(
      {
        url: "https://tieba.baidu.com/sign/add",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": cookie,
          "User-Agent": "Mozilla/5.0 (iPhone)"
        },
        body: `tbs=${tbs}&kw=${encodeURIComponent(kw)}&ie=utf-8`
      },
      (err, resp, body) => {
        if (err) {
          resolve({ success: false, msg: "接口错误" });
          return;
        }

        try {
          let obj = JSON.parse(body);
          if (obj.no == 0) {
            resolve({
              success: true,
              msg: `获得 ${obj.data.uinfo.cont_sign_num} 积分，第 ${obj.data.uinfo.user_sign_rank} 个签到`
            });
          } else {
            resolve({ success: false, msg: obj.error });
          }
        } catch (e) {
          resolve({ success: false, msg: "解析失败" });
        }
      }
    );
  });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 获取Cookie
function getCookie() {
  let ck = $request.headers["Cookie"] || $request.headers["cookie"];

  if (ck && ck.includes("BDUSS=")) {
    let old = $persistentStore.read(COOKIE_KEY) || "";

    // 判断Cookie是否变化
    if (ck !== old) {
      $persistentStore.write(ck, COOKIE_KEY);
      console.log("Cookie更新成功");
      notify(NAME, "", "Cookie获取成功 🎉");
    } else {
      console.log("Cookie未变化，跳过");
    }
  } else {
    console.log("Cookie获取失败，缺少BDUSS");
  }
}

// Surge通知
function notify(title, subtitle, body) {
  $notification.post(title, subtitle, body);
  console.log("\n" + title + "\n" + body);
}

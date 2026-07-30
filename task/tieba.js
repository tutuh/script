/*********************************
 百度贴吧签到 Surge版

 功能:
 1. 自动获取Cookie
 2. 自动签到关注贴吧
 3. 已签到自动跳过
 4. 未签到随机延迟
 5. 获取贴吧列表失败重试
 6. 签到失败自动重试
 7. Cookie失效自动停止
*********************************/

const NAME = "贴吧签到";
const COOKIE_KEY = "TieBa_Cookie";

let cookie = $persistentStore.read(COOKIE_KEY) || "";
let result = [];

const CONFIG = {
  retry: 3,
  retryDelayMin: 3000,
  retryDelayMax: 8000,
  minDelay: 1000,
  maxDelay: 5000,
  timeout: 10000,
  notifyLimit: 2000
};

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
  const data = await getForumRetry();

  if (data?.cookieExpired) {
    notify(NAME, "失败", "Cookie失效，请重新获取Cookie");
    return;
  }

  if (!data || !data.like_forum) {
    notify(NAME, "失败", "未获取关注贴吧");
    return;
  }

  const bars = data.like_forum;
  const tbs = data.tbs;
  console.log(`共发现 ${bars.length} 个贴吧`);

  let success = 0;
  let already = 0;

  for (const bar of bars) {
    // 已签到直接跳过
    if (bar.is_sign == 1 || bar.is_sign == "1") {
      already++;
      result.push(`【${bar.forum_name}】已经签到，等级${bar.user_level}，经验${bar.user_exp}`);
      continue;
    }

    // 随机等待
    const wait = random(CONFIG.minDelay, CONFIG.maxDelay);
    await sleep(wait);

    const r = await sign(bar.forum_name, tbs);

    // Cookie失效直接停止
    if (r.msg.includes("Cookie失效")) {
      notify(NAME, "失败", "Cookie失效，请重新获取Cookie");
      return;
    }

    if (r.success) {
      success++;
      result.push(`【${bar.forum_name}】签到成功，${r.msg}`);
    } else {
      result.push(`【${bar.forum_name}】签到失败：${r.msg}`);
    }
    console.log(`${bar.forum_name}: ${r.msg}，等待 ${(wait / 1000).toFixed(2)} 秒`);
  }

  notify(NAME, `✅ 签到完成 | 新增:${success} | 已签:${already} | 共:${bars.length}`, result.join("\n").slice(0, CONFIG.notifyLimit));
}

/**
 * 获取贴吧列表失败重试
 */
async function getForumRetry() {
  for (let i = 1; i <= CONFIG.retry; i++) {
    const data = await getForum();
    if (data?.cookieExpired) return data;
    if (data && data.like_forum) return data;
    
    console.log(`获取贴吧列表失败，第${i}/${CONFIG.retry}次`);
    if (i < CONFIG.retry) {
      await sleep(random(CONFIG.retryDelayMin, CONFIG.retryDelayMax));
    }
  }
  return null;
}

/**
 * 获取贴吧列表
 */
function getForum() {
  return new Promise((resolve) => {
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
        console.log(err);
        resolve(null);
        return;
      }
      try {
        const obj = JSON.parse(body);
        if (obj.error || obj.error_code == 1 || obj.error_code == 3 || JSON.stringify(obj).includes("BDUSS")) {
          console.log("Cookie失效");
          resolve({ cookieExpired: true });
          return;
        }
        resolve(obj.data);
      } catch (e) {
        console.log("贴吧列表解析失败");
        resolve(null);
      }
    });
  });
}

/**
 * 签到（带重试）
 */
async function sign(kw, tbs) {
  let lastMsg = "未知错误";

  for (let attempt = 1; attempt <= CONFIG.retry; attempt++) {
    const signResult = await signOnce(kw, tbs);
    if (signResult.success) return signResult;

    lastMsg = signResult.msg;
    console.log(`${kw} 第${attempt}/${CONFIG.retry}次签到失败：${lastMsg}`);

    // Cookie失效直接退出
    if (lastMsg.includes("Cookie失效")) {
      return { success: false, msg: lastMsg };
    }

    if (attempt < CONFIG.retry) {
      const delay = random(CONFIG.retryDelayMin, CONFIG.retryDelayMax);
      console.log(`${kw} 等待 ${(delay / 1000).toFixed(1)} 秒后重试`);
      await sleep(delay);
    }
  }

  return { success: false, msg: `重试${CONFIG.retry}次失败：${lastMsg}` };
}

/**
 * 单次签到
 */
function signOnce(kw, tbs) {
  return new Promise((resolve) => {
    $httpClient.post({
      url: "https://tieba.baidu.com/sign/add",
      timeout: CONFIG.timeout,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
      },
      body: `tbs=${tbs}&kw=${encodeURIComponent(kw)}&ie=utf-8`
    }, (err, resp, body) => {
      if (err) {
        resolve({ success: false, msg: "网络错误" });
        return;
      }
      try {
        const obj = JSON.parse(body);
        
        // Cookie失效
        if (obj.error && (obj.error.includes("登录") || obj.error.includes("BDUSS"))) {
          resolve({ success: false, msg: "Cookie失效，请重新获取" });
          return;
        }

        if (obj.no == 0) {
          const day = obj.data?.uinfo?.cont_sign_num ?? "?";
          const rank = obj.data?.uinfo?.user_sign_rank ?? "?";
          resolve({ success: true, msg: `连续签到${day}天，排名${rank}` });
        } else {
          resolve({ success: false, msg: obj.error || `错误码:${obj.no}` });
        }
      } catch (e) {
        resolve({ success: false, msg: "返回解析失败" });
      }
    });
  });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取Cookie
 */
function getCookie() {
  const ck = $request.headers["Cookie"] || $request.headers["cookie"];

  if (!ck || !ck.includes("BDUSS=")) {
    console.log("Cookie获取失败");
    return;
  }

  const old = $persistentStore.read(COOKIE_KEY) || "";

  if (ck !== old) {
    $persistentStore.write(ck, COOKIE_KEY);
    console.log("Cookie更新成功");
    notify(NAME, "", "Cookie获取成功 🎉");
  } else {
    console.log("Cookie未变化");
  }
}

/**
 * 通知
 */
function notify(title, subtitle, body) {
  $notification.post(title, subtitle, body);
  console.log(`\n${title}\n${subtitle}\n${body}`);
}

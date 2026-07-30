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

// 通用 User-Agent，防止被百度反爬拦截
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

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
    notify(NAME, "❌ 失败", "未获取Cookie，请先用浏览器登录贴吧获取");
    return;
  }

  console.log("开始获取贴吧列表...");
  let data = await getForum();

  if (!data || !data.like_forum) {
    notify(NAME, "❌ 失败", "未获取到贴吧列表，可能是 Cookie/BDUSS 已失效，请重新获取");
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

    // 随机等待 5 到 10 秒
    let wait = random(5000, 10000);
    await sleep(wait);

    // 签到请求
    let r = await sign(bar.forum_name, tbs);

    if (r.success) {
      success++;
      result.push(`【${bar.forum_name}】签到成功，${r.msg}`);
    } else {
      result.push(`【${bar.forum_name}】签到失败: ${r.msg}`);
    }

    console.log(`${bar.forum_name}: ${r.msg}，等待 ${(wait / 1000).toFixed(2)} 秒`);
  }

  // 1. 详细结果仅打印到日志
  console.log("\n========== 签到详情 ==========\n" + result.join("\n") + "\n==============================");

  // 2. 弹窗通知分行显示
  notify(
    NAME,
    "✅ 签到完成",
    `新增: ${success} 吧\n已签: ${already} 吧\n共计: ${bars.length} 吧`
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
          "User-Agent": UA
        }
      },
      (err, resp, body) => {
        if (err) {
          console.log("获取列表网络错误:", err);
          resolve(null);
          return;
        }

        try {
          let obj = JSON.parse(body);
          if (obj.no == 0 && obj.data) {
            resolve(obj.data);
          } else {
            console.log(`获取列表接口返回异常: ${body}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`解析贴吧列表失败，接口返回非JSON数据: ${body}`);
          resolve(null);
        }
      }
    );
  });
}

// 签到控制器（带重试机制）
async function sign(kw, tbs) {
  let lastResult = { success: false, msg: "未知错误" };

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    let r = await signOnce(kw, tbs);
    
    if (r.success) {
      return r;
    }

    lastResult = r;
    console.log(`[重试提示] ${kw} 第 ${attempt} 次尝试失败: ${r.msg}`);

    if (attempt < MAX_RETRY) {
      let retryWait = random(2000, 5000); 
      console.log(`[重试提示] ${kw} 将在 ${(retryWait / 1000).toFixed(2)} 秒后进行第 ${attempt + 1} 次尝试...`);
      await sleep(retryWait);
    }
  }

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
          "User-Agent": UA,
          "Referer": `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}`,
          "Origin": "https://tieba.baidu.com"
        },
        body: `tbs=${tbs}&kw=${encodeURIComponent(kw)}&ie=utf-8`
      },
      (err, resp, body) => {
        if (err) {
          resolve({ success: false, msg: "网络请求失败" });
          return;
        }

        try {
          let obj = JSON.parse(body);
          if (obj.no == 0) {
            let cont = obj.data?.uinfo?.cont_sign_num ?? "?";
            let rank = obj.data?.uinfo?.user_sign_rank ?? "?";
            resolve({
              success: true,
              msg: `连续签到 ${cont} 天，第 ${rank} 个签到`
            });
          } else {
            resolve({ success: false, msg: obj.error || `错误码:${obj.no}` });
          }
        } catch (e) {
          console.log(`【${kw}】签到接口返回内容异常:\n${body}`);
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 获取 Cookie (精确抓取 BDUSS)
function getCookie() {
  if (!$request || !$request.headers) return;

  // 兼容不同大小写形式的 Cookie 请求头
  let ck = $request.headers["Cookie"] || $request.headers["cookie"] || $request.headers["COOKIE"];

  if (ck) {
    // 使用正则提取 BDUSS 核心部分
    let bdussMatch = ck.match(/BDUSS=([^;]+)/);
    
    if (bdussMatch) {
      let cleanCookie = `BDUSS=${bdussMatch[1]}`;
      let old = $persistentStore.read(COOKIE_KEY) || "";

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

// Surge 通知
function notify(title, subtitle, body) {
  $notification.post(title, subtitle, body);
  console.log(`\n[通知] ${title}\n${subtitle}\n${body}\n`);
}
}

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

const CONFIG = {
  timeout: 15000,
  retry: 3,
  minDelay: 2000,
  maxDelay: 5000,
  retryDelay: 5000,
  notifyLimit: 2500
};

let cookie = $persistentStore.read(COOKIE_KEY) || "";
let result = [];

(async () => {
  try {
    if (typeof $request !== "undefined") {
      getCookie();
    } else {
      await main();
    }
  } catch (e) {
    console.log("运行异常：" + e);
    notify(NAME, "运行异常", String(e));
  }
  $done();
})();

async function main() {
  if (!cookie) {
    notify(NAME, "", "未获取Cookie");
    return;
  }

  console.log("开始获取贴吧列表...");

  const data = await getForumRetry();

  if (!data || !data.like_forum) {
    notify(NAME, "失败", "未获取关注贴吧");
    return;
  }

  const bars = data.like_forum;
  const tbs = data.tbs;

  console.log(`共发现 ${bars.length} 个贴吧`);

  let success = 0;
  let already = 0;
  let failed = 0;

  for (const bar of bars) {

    if (bar.is_sign == 1 || bar.is_sign == "1") {
      already++;
      result.push(`【${bar.forum_name}】已签到 Lv.${bar.user_level}`);
      continue;
    }

    const wait = random(CONFIG.minDelay, CONFIG.maxDelay);

    console.log(
      `${bar.forum_name} 等待 ${(wait / 1000).toFixed(1)} 秒`
    );

    await sleep(wait);

    const r = await signRetry(bar.forum_name, tbs);

    if (r.cookieExpired) {
      notify(NAME, "Cookie失效", "请重新抓取Cookie");
      return;
    }

    if (r.success) {
      success++;
      result.push(`【${bar.forum_name}】✅ ${r.msg}`);
    } else {
      failed++;
      result.push(`【${bar.forum_name}】❌ ${r.msg}`);
    }
  }

  notify(
    NAME,
    `新增:${success} 已签:${already} 失败:${failed} 共:${bars.length}`,
    result.join("\n").slice(0, CONFIG.notifyLimit)
  );
}

async function getForumRetry() {
  for (let i = 1; i <= CONFIG.retry; i++) {

    const data = await getForum();

    if (data) {
      return data;
    }

    console.log(`获取贴吧失败 ${i}/${CONFIG.retry}`);

    if (i < CONFIG.retry) {
      await sleep(CONFIG.retryDelay);
    }
  }

  return null;
}

function getForum() {
  return new Promise((resolve) => {

    $httpClient.get(
      {
        url: "https://tieba.baidu.com/mo/q/newmoindex",
        timeout: CONFIG.timeout,
        headers: {
          Referer:
            "https://tieba.baidu.com/index/tbwise/forum",
          Cookie: cookie,
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
        }
      },
      (err, resp, body) => {

        if (err) {
          console.log(err);
          resolve(null);
          return;
        }

        try {
          const obj = JSON.parse(body);

          if (!obj.data) {
            resolve(null);
            return;
          }

          resolve(obj.data);

        } catch (e) {
          console.log("贴吧列表解析失败");
          resolve(null);
        }
      }
    );
  });
}

async function signRetry(kw, tbs) {

  let lastMsg = "";

  for (let i = 1; i <= CONFIG.retry; i++) {

    const r = await sign(kw, tbs);

    if (r.success) return r;

    if (r.cookieExpired) return r;

    lastMsg = r.msg;

    console.log(`${kw} 重试 ${i}/${CONFIG.retry}`);

    if (i < CONFIG.retry) {
      await sleep(CONFIG.retryDelay);
    }
  }

  return {
    success: false,
    msg: lastMsg || "重试失败"
  };
}

function sign(kw, tbs) {

  return new Promise((resolve) => {

    $httpClient.post(
      {
        url: "https://tieba.baidu.com/sign/add",
        timeout: CONFIG.timeout,
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          Cookie: cookie,
          "User-Agent": "Mozilla/5.0 (iPhone)"
        },
        body: `kw=${encodeURIComponent(kw)}&ie=utf-8&tbs=${tbs}`
      },
      (err, resp, body) => {

        if (err) {
          resolve({
            success: false,
            msg: "网络错误"
          });
          return;
        }

        try {

          const obj = JSON.parse(body);

          if (
            obj.error &&
            (
              obj.error.includes("登录") ||
              obj.error.includes("BDUSS")
            )
          ) {
            resolve({
              success: false,
              cookieExpired: true,
              msg: "Cookie失效"
            });
            return;
          }

          if (obj.no == 0) {

            const day =
              obj.data?.uinfo?.cont_sign_num || "?";

            const rank =
              obj.data?.uinfo?.user_sign_rank || "?";

            resolve({
              success: true,
              msg: `连续${day}天 排名${rank}`
            });

          } else {

            resolve({
              success: false,
              msg:
                obj.error ||
                ("错误码:" + obj.no)
            });
          }

        } catch (e) {

          resolve({
            success: false,
            msg: "返回解析失败"
          });
        }
      }
    );
  });
}

function getCookie() {

  const ck =
    $request.headers["Cookie"] ||
    $request.headers["cookie"];

  if (!ck || !ck.includes("BDUSS=")) {
    console.log("未发现BDUSS");
    return;
  }

  const old =
    $persistentStore.read(COOKIE_KEY) || "";

  if (old !== ck) {

    $persistentStore.write(
      ck,
      COOKIE_KEY
    );

    console.log("Cookie更新成功");

    notify(
      NAME,
      "",
      "Cookie获取成功 🎉"
    );

  } else {

    console.log("Cookie未变化");
  }
}

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function notify(title, subtitle, body) {

  $notification.post(
    title,
    subtitle,
    body
  );

  console.log(
    `\n${title}\n${subtitle}\n${body}`
  );
}}

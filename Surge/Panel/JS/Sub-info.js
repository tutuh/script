(async () => {
  let args = getArgs();
  
  // 安全校验：如果没有填 URL 核心参数，直接报错提示
  if (!args.url) {
    return $done({
      title: args.title || "流量信息",
      content: "❌ 配置错误: 缺少 url 参数",
      icon: "exclamationmark.triangle",
      "icon-color": "#FF3B30",
    });
  }

  try {
    let info = await getDataInfo(args.url);
    
    // 如果获取不到流量信息，主动抛出错误进入 catch 块
    if (!info) throw new Error("订阅响应头未包含流量信息");

    let resetDayLeft = getRemainingDays(parseInt(args["reset_day"]));
    let expireDaysLeft = getExpireDaysLeft(args.expire || info.expire);

    let used = info.download + info.upload;
    let total = info.total;
    let content = [`用量：${bytesToSize(used)} / ${bytesToSize(total)}`];

    // 判断是否为不限时套餐
    if (!resetDayLeft && !expireDaysLeft) {
      let percentage = ((used / total) * 100).toFixed(1);
      content.push(`提醒：流量已使用${percentage}%`);
    } else {
      if (resetDayLeft && expireDaysLeft) {
        content.push(`提醒：${resetDayLeft}天后重置，${expireDaysLeft}天后到期`);
      } else if (resetDayLeft) {
        content.push(`提醒：流量将在${resetDayLeft}天后重置`);
      } else if (expireDaysLeft) {
        content.push(`提醒：套餐将在${expireDaysLeft}天后到期`);
      }
      
      // 到期时间（日期）显示
      if (expireDaysLeft) {
        content.push(`到期：${formatTime(args.expire || info.expire)}`);
      }
    }

    // 动态生成标准时间戳标题
    let now = new Date();
    let timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    $done({
      title: `${args.title || "机场流量"} | ${timeStr}`,
      content: content.join("\n"),
      icon: args.icon || "airplane.circle",
      "icon-color": args.color || "#007aff",
    });

  } catch (err) {
    // 捕获所有网络错误、解析错误，并在面板上直观展示
    console.log(`[流量脚本错误]: ${err}`);
    $done({
      title: args.title || "机场流量",
      content: `❌ 获取失败\n原因: ${err.message || err}`,
      icon: "exclamationmark.triangle",
      "icon-color": "#FF3B30",
    });
  }
})();

// 安全解析 arguments
function getArgs() {
  if (typeof $argument === "undefined" || !$argument) return {};
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, v ? decodeURIComponent(v) : ""])
  );
}

// 获取网络响应头
function getUserInfo(url) {
  let request = { headers: { "User-Agent": "Quantumult%20X" }, url, timeout: 5000 };
  return new Promise((resolve, reject) =>
    $httpClient.get(request, (err, resp) => {
      if (err != null) {
        reject("网络请求超时或失败");
        return;
      }
      if (resp.status !== 200) {
        reject(`HTTP 状态码: ${resp.status}`);
        return;
      }
      let header = Object.keys(resp.headers).find((key) => key.toLowerCase() === "subscription-userinfo");
      if (header) {
        resolve(resp.headers[header]);
        return;
      }
      reject("响应头不带有流量信息");
    })
  );
}

// 解析响应头数据
async function getDataInfo(url) {
  let data = await getUserInfo(url);
  if (!data) return null;

  let matches = data.match(/\w+=[\d.eE+-]+/g);
  // 防御性代码：如果正则匹配不到结果，不执行 map，防止崩溃
  if (!matches) return null; 

  return Object.fromEntries(
    matches
      .map((item) => item.split("="))
      .map(([k, v]) => [k, Number(v)])
  );
}

// 计算重置剩余天数
function getRemainingDays(resetDay) {
  if (!resetDay || isNaN(resetDay) || resetDay < 1 || resetDay > 31) return;

  let now = new Date();
  let today = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();

  let daysInThisMonth = new Date(year, month + 1, 0).getDate();
  let daysInNextMonth = new Date(year, month + 2, 0).getDate();

  resetDay = Math.min(resetDay, daysInThisMonth);

  if (resetDay > today) {
    return resetDay - today;
  } else {
    resetDay = Math.min(resetDay, daysInNextMonth);
    return daysInThisMonth - today + resetDay;
  }
}

// 计算到期剩余天数
function getExpireDaysLeft(expire) {
  if (!expire) return;

  let now = new Date().getTime();
  let expireTime;

  if (/^[\d.]+$/.test(expire)) {
    let num = parseFloat(expire);
    expireTime = num < 1000000000000 ? num * 1000 : num;
  } else {
    expireTime = new Date(expire).getTime();
  }

  if (isNaN(expireTime)) return null;

  let daysLeft = Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? daysLeft : null;
}

// 格式化用量单位
function bytesToSize(bytes) {
  if (bytes === 0) return "0 B";
  let k = 1024;
  let sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

// 格式化日期显示
function formatTime(time) {
  if (/^[\d.]+$/.test(time)) {
    let num = parseFloat(time);
    if (num < 1000000000000) num *= 1000;
    time = num;
  }
  
  let dateObj = new Date(time);
  if (isNaN(dateObj.getTime())) return "未知日期";

  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return `${year}年${month}月${day}日`;
}
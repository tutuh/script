// 基础配置
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

// 状态定义
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

// ChatGPT 不支持的地区黑名单
const GPT_BLOCKED_REGIONS = ['CN', 'HK', 'MO', 'RU', 'IR', 'KP', 'SY', 'CU', 'BY'];

/**
 * 核心对齐引擎：根据动态传入的 mode 决定使用哪种对齐策略
 */
function getAlignedName(name, mode) {
  if (mode === 'native') {
    // 备用：原生系统字体像素对齐
    switch (name) {
      case 'ChatGPT': return 'ChatGPT' + '     ';
      case 'Gemini':  return 'Gemini' + '         ';
      case 'Netflix': return 'Netflix' + '          ';
      case 'Disney+': return 'Disney+' + '       ';
      case 'YouTube': return 'YouTube' + '      ';
      default:        return name.padEnd(10, ' ');
    }
  } else {
    // 默认：等宽极客风，100%完美对齐 (\u2007 是等宽数字空格)
    const monoMap = {
      'ChatGPT': '𝙲𝚑𝚊𝚝𝙶𝙿𝚃\u2007',
      'Gemini':  '𝙶𝚎𝚖𝚒𝚗𝚒\u2007\u2007',
      'Netflix': '𝙽𝚎𝚝𝚏𝚕𝚒𝚡\u2007',
      'Disney+': '𝙳𝚒𝚜𝚗𝚎𝚢+\u2007',  
      'YouTube': '𝚈𝚘𝚞𝚃𝚞𝚋𝚎\u2007'
    };
    return monoMap[name] || name.padEnd(8, '\u2007');
  }
}

// 解析 Surge 参数 ($argument)
function getArgs() {
  const args = {};
  if (typeof $argument !== 'undefined' && $argument) {
    const params = $argument.split('&');
    for (const param of params) {
      const [key, value] = param.split('=');
      if (key && value) {
        // 将键名转换为小写方便后续兼容读取，但保留原始值的大小写
        args[key.trim().toLowerCase()] = value.trim();
      }
    }
  }
  return args;
}

// 获取格式化的当前时间 (HH:MM:SS)
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// 主入口
(async function () {
  // 1. 解析参数
  const args = getArgs();
  const baseTitle = args.title || '网络解锁检测';
  const timeoutLimit = parseInt(args.timeout) || 3000;
  
  // 动态读取对齐模式，默认使用 monospace
  const alignMode = args.align_mode || args.mode || 'monospace';
  
  const panel = {
    title: `${baseTitle} | ${getCurrentTime()}`,
    content: '',
    icon: args.icon || 'play.tv.fill',
    'icon-color': args.color || '#D22F20'
  };

  try {
    const results = await Promise.all([
      checkChatGPT(timeoutLimit),
      checkGemini(timeoutLimit),
      checkNetflix(timeoutLimit),
      checkDisneyPlus(timeoutLimit),
      checkYouTubePremium(timeoutLimit)
    ]);

    panel.content = results.map(r => {
      // 传入动态对齐模式
      const paddedName = getAlignedName(r.name, alignMode);
      let statusText = '';
      
      switch (r.status) {
        case STATUS_AVAILABLE:
          statusText = `${paddedName}➟  ${r.region}`;
          break;
        case STATUS_NOT_AVAILABLE:
          statusText = `${paddedName}➟  未解锁`;
          break;
        case STATUS_TIMEOUT:
          statusText = `${paddedName}➟  超时`;
          break;
        case STATUS_ERROR:
          statusText = `${paddedName}➟  检测失败`;
          break;
        case STATUS_COMING:
          const tag = r.name === 'Netflix' ? '自制' : '即将';
          statusText = `${paddedName}➟  ${tag} ${r.region}`;
          break;
      }
      return statusText;
    }).join('\n');

  } catch (e) {
    panel.content = '检测过程发生异常';
  }

  $done(panel);
})();

// 基础网络请求封装
function request(method, url, timeout, headers = REQUEST_HEADERS, body = null, maxRetries = 1) {
  return new Promise((resolve) => {
    const opts = { url, headers, timeout: timeout / 1000 };
    if (body) opts.body = body;

    const attempt = (currentTry) => {
      const callback = (error, response, data) => {
        if (error && currentTry < maxRetries) {
          setTimeout(() => attempt(currentTry + 1), 200);
        } else {
          resolve({ error, response: response || {}, data: data || '' });
        }
      };

      if (method.toUpperCase() === 'POST') {
        $httpClient.post(opts, callback);
      } else {
        $httpClient.get(opts, callback);
      }
    };

    attempt(0);
  });
}

// === 各平台检测逻辑 ===

// ChatGPT
async function checkChatGPT(timeout) {
  try {
    const r = await request('GET', 'https://chatgpt.com/cdn-cgi/trace', timeout);
    if (r.error || !r.data) return { name: 'ChatGPT', status: STATUS_TIMEOUT };

    const locMatch = r.data.match(/loc=([A-Z]{2})/i);
    if (!locMatch) return { name: 'ChatGPT', status: STATUS_ERROR };

    const region = locMatch[1].toUpperCase();
    if (!GPT_BLOCKED_REGIONS.includes(region)) {
      return { name: 'ChatGPT', status: STATUS_AVAILABLE, region };
    }
    return { name: 'ChatGPT', status: STATUS_NOT_AVAILABLE };
  } catch (e) {
    return { name: 'ChatGPT', status: STATUS_ERROR };
  }
}

// Gemini
async function checkGemini(timeout) {
  try {
    const r = await request('GET', 'https://gemini.google.com/app', timeout);
    if (r.error || !r.response) return { name: 'Gemini', status: STATUS_TIMEOUT };

    const status = r.response.status || 0;
    const data = r.data || '';

    if (status === 200) {
      if (data.includes('not available') || data.includes('unavailable in your country')) {
        return { name: 'Gemini', status: STATUS_NOT_AVAILABLE };
      }
      const m = data.match(/,2,1,200,"([A-Z]{2,3})"/);
      const region = m && m[1] ? m[1].slice(0, 2).toUpperCase() : 'US';
      return { name: 'Gemini', status: STATUS_AVAILABLE, region };
    }

    if ([403, 404, 302].includes(status)) {
      return { name: 'Gemini', status: STATUS_NOT_AVAILABLE };
    }
    return { name: 'Gemini', status: STATUS_ERROR };
  } catch (e) {
    return { name: 'Gemini', status: STATUS_ERROR };
  }
}

// Netflix
async function checkNetflix(timeout) {
  try {
    // 1. 先检测非自制剧 (绝命毒师)，判断是否解锁了完整版权
    const r1 = await request('GET', 'https://www.netflix.com/title/70143836', timeout);
    if (r1.error || !r1.response) return { name: 'Netflix', status: STATUS_TIMEOUT };

    const status1 = r1.response.status || 0;
    const data1 = r1.data || '';

    // 403 代表节点 IP 被明确封禁
    if (status1 === 403) return { name: 'Netflix', status: STATUS_NOT_AVAILABLE };

    // 健壮的地区代码提取函数 (兼容空格、转义符和新旧字段)
    const extractRegion = (htmlData) => {
      let match;

      match = htmlData.match(/(?:"|\\")(?:requestCountryCode|countryCode)(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i);
      if (match && match[1]) return match[1].toUpperCase();
      
      match = htmlData.match(/(?:"|\\")(?:geolocation|location)(?:"|\\")\s*:\s*\{[^}]*?(?:"|\\")country(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i);
      if (match && match[1]) return match[1].toUpperCase();
      
      match = htmlData.match(/(?:"|\\")country(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i);
      if (match && match[1]) return match[1].toUpperCase();

      return null;
    };

    if (status1 === 200) {
      // 200 说明完整版权解锁
      let region = extractRegion(data1) || 'US';
      return { name: 'Netflix', status: STATUS_AVAILABLE, region };
    }

    if (status1 === 404) {
      // 非自制剧 404，说明可能是“仅自制”或者“该地区不提供网飞服务”
      // 2. 进一步检测自制剧 (怪奇物语)
      const r2 = await request('GET', 'https://www.netflix.com/title/80062035', timeout);
      if (r2.error || !r2.response) return { name: 'Netflix', status: STATUS_TIMEOUT };
      
      const status2 = r2.response.status || 0;
      const data2 = r2.data || '';
      
      if (status2 === 200) {
        // 只有自制剧能访问，说明是仅解锁自制剧
        let region = extractRegion(data2) || 'US';
        // STATUS_COMING 在你的主函数里会被展示为 "自制"
        return { name: 'Netflix', status: STATUS_COMING, region }; 
      }
      
      // 连自制剧都 404，说明未解锁
      return { name: 'Netflix', status: STATUS_NOT_AVAILABLE };
    }

    return { name: 'Netflix', status: STATUS_ERROR };
  } catch (e) {
    return { name: 'Netflix', status: STATUS_ERROR };
  }
}

// Disney+
async function checkDisneyPlus(timeout) {
  try {
    const [home, loc] = await Promise.all([
      testDisneyHomePage(timeout),
      getDisneyLocationInfo(timeout)
    ]);

    let region = loc?.countryCode ? loc.countryCode.toUpperCase() : '';
    if (!region && home?.region) region = home.region.toUpperCase();

    if (loc?.inSupportedLocation === false || loc?.inSupportedLocation === 'false') {
      return { name: 'Disney+', status: STATUS_COMING, region: region || 'UN' };
    }

    if (region) return { name: 'Disney+', status: STATUS_AVAILABLE, region };
    
    if (home && home.available === false) return { name: 'Disney+', status: STATUS_NOT_AVAILABLE };
    if (home && home.available === true) return { name: 'Disney+', status: STATUS_AVAILABLE, region: home.region || 'US' };

    return { name: 'Disney+', status: STATUS_TIMEOUT };
  } catch (e) {
    return { name: 'Disney+', status: STATUS_ERROR };
  }
}

async function getDisneyLocationInfo(timeout) {
  const headers = {
    ...REQUEST_HEADERS,
    'Authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
    'Content-Type': 'application/json'
  };
  const body = JSON.stringify({
    query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
    variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '124.0.0.0', manufacturer: 'apple', model: null, operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] }, deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } }
  });

  const r = await request('POST', 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', timeout, headers, body);
  if (r.error || !r.response || r.response.status !== 200) return null;
  
  try {
    const obj = JSON.parse(r.data);
    const session = obj?.extensions?.sdk?.session;
    return {
      inSupportedLocation: session?.inSupportedLocation,
      countryCode: session?.location?.countryCode || ''
    };
  } catch (e) { 
    return null; 
  }
}

async function testDisneyHomePage(timeout) {
  const r = await request('GET', 'https://www.disneyplus.com/', timeout);
  if (r.error || !r.response) return null;
  if (r.response.status !== 200) return { available: false };
  if (r.data && r.data.includes('Sorry, Disney+ is not available in your region.')) {
    return { available: false };
  }
  const match = (r.data || '').match(/Region: ([A-Za-z]{2})/i);
  return { available: true, region: match ? match[1].toUpperCase() : '' };
}

// YouTube Premium
async function checkYouTubePremium(timeout) {
  try {
    const r = await request('GET', 'https://www.youtube.com/premium', timeout);
    if (r.error || !r.response) return { name: 'YouTube', status: STATUS_TIMEOUT };

    const data = r.data || '';
    
    const isNotAvailable = data.includes('Premium is not available in your country') || 
                           data.includes('is not available in your country') ||
                           data.includes('在您所在的国家') ||
                           data.includes('尚未推出') || 
                           data.includes('not available in your location') ||
                           data.includes('目前無法使用');

    if (isNotAvailable) {
      return { name: 'YouTube', status: STATUS_NOT_AVAILABLE };
    }

    if (r.response.status === 200) {
      let region = 'US';
      
      const glMatch = data.match(/"GL"\s*:\s*"([A-Za-z]{2})"/i);

      const countryMatch = data.match(/(?:"|\\")countryCode(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i);
      
      if (glMatch && glMatch[1]) {
        region = glMatch[1].toUpperCase();
      } else if (countryMatch && countryMatch[1]) {
        region = countryMatch[1].toUpperCase();
      } else if (data.includes('www.google.cn')) {
        region = 'CN';
      }
      
      return { name: 'YouTube', status: STATUS_AVAILABLE, region };
    }

    return { name: 'YouTube', status: STATUS_ERROR };
  } catch (e) {
    return { name: 'YouTube', status: STATUS_ERROR };
  }
}


// 基础配置
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

// 状态定义
const STATUS_COMING = 2;         // 仅自制/即将支持
const STATUS_AVAILABLE = 1;      // 完全解锁
const STATUS_NOT_AVAILABLE = 0;  // 未解锁
const STATUS_TIMEOUT = -1;       // 检测超时
const STATUS_ERROR = -2;         // 检测失败

// ChatGPT 不支持的地区黑名单
const GPT_BLOCKED_REGIONS = ['CN', 'HK', 'MO', 'RU', 'IR', 'KP', 'SY', 'CU', 'BY'];

// 解析 Surge 参数 ($argument)
function getArgs() {
  const args = {};
  if (typeof $argument !== 'undefined' && $argument) {
    const params = $argument.split('&');
    for (const param of params) {
      const [key, value] = param.split('=');
      if (key && value) {
        args[key.trim()] = value.trim();
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
  const args = getArgs();
  const baseTitle = args.title || '网络解锁检测';
  const timeoutLimit = parseInt(args.timeout) || 3000; // 默认 3 秒超时，更适合 Panel 快速展示
  
  const panel = {
    title: `${baseTitle} | ${getCurrentTime()}`,
    content: '',
    icon: args.icon || 'play.tv.fill',
    'icon-color': args.color || '#D22F20'
  };

  try {
    // 并发执行检测任务
    const results = await Promise.all([
      checkChatGPT(timeoutLimit),
      checkGemini(timeoutLimit),
      checkNetflix(timeoutLimit),
      checkDisneyPlus(timeoutLimit),
      checkYouTubePremium(timeoutLimit)
    ]);

    // 1. 动态计算 UI 补齐长度 (实现完美对齐)
    const maxLen = Math.max(...results.map(r => r.name.length));
    
    // 2. 格式化输出
    panel.content = results.map(r => {
      // 动态补充空格 (Surge 英文等宽效果较好，中文可能略有偏移，但能保证最大对齐程度)
      const paddedName = r.name.padEnd(maxLen + 2, ' ');
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
    const r = await request('GET', 'https://www.netflix.com/title/80062035', timeout);
    if (r.error || !r.response) return { name: 'Netflix', status: STATUS_TIMEOUT };

    const status = r.response.status || 0;
    const data = r.data || '';

    if (status === 403) return { name: 'Netflix', status: STATUS_NOT_AVAILABLE };
    
    if (status === 200 || status === 404) {
      let region = 'US';
      const match = data.match(/"(?:requestCountryCode|countryCode)":"([A-Z]{2})"/i);
      if (match && match[1]) {
        region = match[1].toUpperCase();
      }

      if (status === 404) {
         return { name: 'Netflix', status: STATUS_COMING, region };
      }
      return { name: 'Netflix', status: STATUS_AVAILABLE, region };
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
    
    if (data.includes('Premium is not available in your country') || data.includes('is not available in your country')) {
      return { name: 'YouTube', status: STATUS_NOT_AVAILABLE };
    }

    if (r.response.status === 200) {
      let region = 'US';
      const m = data.match(/"countryCode":"([A-Za-z]{2})"/i);
      if (m && m[1]) {
        region = m[1].toUpperCase();
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

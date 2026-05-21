// === UI 视觉对齐配置 ===
const ALIGN_MAP = {
  'ChatGPT': 'ChatGPT  ', // 基准
  'YouTube': 'YouTube   ',
  'Disney+': 'Disney+    ',
  'Netflix': 'Netflix       ',
  'Gemini':  'Gemini      '
};

// 基础配置
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const REQUEST_TIMEOUT = 5;
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const GPT_SUPPORTED_REGIONS = {
  "T1": 1, "XX": 1, "AL": 1, "DZ": 1, "AD": 1, "AO": 1, "AG": 1, "AR": 1, "AM": 1, "AU": 1,
  "AT": 1, "AZ": 1, "BS": 1, "BD": 1, "BB": 1, "BE": 1, "BZ": 1, "BJ": 1, "BT": 1, "BA": 1,
  "BW": 1, "BR": 1, "BG": 1, "BF": 1, "CV": 1, "CA": 1, "CL": 1, "CO": 1, "KM": 1, "CR": 1,
  "HR": 1, "CY": 1, "DK": 1, "DJ": 1, "DM": 1, "DO": 1, "EC": 1, "SV": 1, "EE": 1, "FJ": 1,
  "FI": 1, "FR": 1, "GA": 1, "GM": 1, "GE": 1, "DE": 1, "GH": 1, "GR": 1, "GD": 1, "GT": 1,
  "GN": 1, "GW": 1, "GY": 1, "HT": 1, "HN": 1, "HU": 1, "IS": 1, "IN": 1, "ID": 1, "IQ": 1,
  "IE": 1, "IL": 1, "IT": 1, "JM": 1, "JP": 1, "JO": 1, "KZ": 1, "KE": 1, "KI": 1, "KW": 1,
  "KG": 1, "LV": 1, "LB": 1, "LS": 1, "LR": 1, "LI": 1, "LT": 1, "LU": 1, "MG": 1, "MW": 1,
  "MY": 1, "MV": 1, "ML": 1, "MT": 1, "MH": 1, "MR": 1, "MU": 1, "MX": 1, "MC": 1, "MN": 1,
  "ME": 1, "MA": 1, "MZ": 1, "MM": 1, "NA": 1, "NR": 1, "NP": 1, "NL": 1, "NZ": 1, "NI": 1,
  "NE": 1, "NG": 1, "MK": 1, "NO": 1, "OM": 1, "PK": 1, "PW": 1, "PA": 1, "PG": 1, "PE": 1,
  "PH": 1, "PL": 1, "PT": 1, "QA": 1, "RO": 1, "RW": 1, "KN": 1, "LC": 1, "VC": 1, "WS": 1,
  "SM": 1, "ST": 1, "SN": 1, "RS": 1, "SC": 1, "SL": 1, "SG": 1, "SK": 1, "SI": 1, "SB": 1,
  "ZA": 1, "ES": 1, "LK": 1, "SR": 1, "SE": 1, "CH": 1, "TH": 1, "TG": 1, "TO": 1, "TT": 1,
  "TN": 1, "TR": 1, "TV": 1, "UG": 1, "AE": 1, "US": 1, "UY": 1, "VU": 1, "ZM": 1, "BO": 1,
  "BN": 1, "CG": 1, "CZ": 1, "VA": 1, "FM": 1, "MD": 1, "PS": 1, "KR": 1, "TW": 1, "TZ": 1,
  "TL": 1, "GB": 1
};

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
  const timeStr = getCurrentTime();
  
  const panel = {
    title: `${baseTitle}   「${timeStr}」`, // 在这里拼接时间显示
    content: '',
    icon: args.icon || 'play.tv.fill',
    'icon-color': args.color || '#D22F20'
  };

  try {
    const results = await Promise.all([
      checkChatGPT(),
      checkGemini(),
      checkNetflix(),
      checkDisneyPlus(),
      checkYouTubePremium()
    ]);

    panel.content = results.map(r => r.text).join('\n');
  } catch (e) {
    panel.content = '检测过程发生异常';
  }

  $done(panel);
})();

// === 基础请求封装（结合了 Timeout 限制 与 EOF 重试机制） ===
function request(method, url, headers = REQUEST_HEADERS, body = null, maxRetries = 1) {
  return new Promise((resolve) => {
    const opts = { url, headers, timeout: REQUEST_TIMEOUT };
    if (body) opts.body = body;

    const attempt = (currentTry) => {
      const callback = (error, response, data) => {
        if (error && currentTry < maxRetries) {
          setTimeout(() => {
            attempt(currentTry + 1);
          }, 200);
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

// 统一结果格式化函数（处理中文状态与 ➟ 符号）
function makeResult(name, status, region = '') {
  // 读取顶部的对齐配置
  const paddedName = ALIGN_MAP[name] || name + ' ';

  let text = '';
  switch (status) {
    case STATUS_AVAILABLE:
      text = `${paddedName}➟  ${region}`;
      break;
    case STATUS_NOT_AVAILABLE:
      text = `${paddedName}➟  未解锁`;
      break;
    case STATUS_TIMEOUT:
      text = `${paddedName}➟  超时`;
      break;
    case STATUS_ERROR:
      text = `${paddedName}➟  检测失败`;
      break;
    case STATUS_COMING:
      const tag = name === 'Netflix' ? '自制' : '即将';
      text = `${paddedName}➟  ${tag} ${region}`;
      break;
  }

  return { name, status, text, region };
}

// === 各平台检测逻辑 ===

// ChatGPT
async function checkChatGPT() {
  try {
    const r = await request('GET', 'https://chatgpt.com/cdn-cgi/trace');
    if (r.error || !r.data) return makeResult('ChatGPT', STATUS_TIMEOUT);

    const locMatch = r.data.match(/loc=([A-Z]{2})/i);
    if (!locMatch) return makeResult('ChatGPT', STATUS_ERROR);

    const region = locMatch[1].toUpperCase();
    if (GPT_SUPPORTED_REGIONS[region]) {
      return makeResult('ChatGPT', STATUS_AVAILABLE, region);
    }
    return makeResult('ChatGPT', STATUS_NOT_AVAILABLE);
  } catch (e) {
    return makeResult('ChatGPT', STATUS_ERROR);
  }
}

// Gemini
async function checkGemini() {
  try {
    const r = await request('GET', 'https://gemini.google.com/app');
    if (r.error || !r.response) return makeResult('Gemini', STATUS_TIMEOUT);

    const status = r.response.status || 0;
    const data = r.data || '';

    if (status === 200) {
      if (data.includes('not available') || data.includes('unavailable in your country')) {
        return makeResult('Gemini', STATUS_NOT_AVAILABLE);
      }
      const m = data.match(/,2,1,200,"([A-Z]{2,3})"/);
      const region = m && m[1] ? m[1].slice(0, 2).toUpperCase() : 'US';
      return makeResult('Gemini', STATUS_AVAILABLE, region);
    }

    if (status === 403 || status === 404 || status === 302) {
      return makeResult('Gemini', STATUS_NOT_AVAILABLE);
    }
    return makeResult('Gemini', STATUS_ERROR);
  } catch (e) {
    return makeResult('Gemini', STATUS_ERROR);
  }
}

// Netflix
async function checkNetflix() {
  try {
    const r = await request('GET', 'https://www.netflix.com/title/80062035');
    if (r.error || !r.response) return makeResult('Netflix', STATUS_TIMEOUT);

    const status = r.response.status || 0;
    const data = r.data || '';

    if (status === 403) return makeResult('Netflix', STATUS_NOT_AVAILABLE);
    
    if (status === 200 || status === 404) {
      let region = 'US';
      const match = data.match(/"(?:requestCountryCode|countryCode)":"([A-Z]{2})"/i);
      if (match && match[1]) {
        region = match[1].toUpperCase();
      }

      if (status === 404) {
         return makeResult('Netflix', STATUS_COMING, region);
      }
      return makeResult('Netflix', STATUS_AVAILABLE, region);
    }
    return makeResult('Netflix', STATUS_ERROR);
  } catch (e) {
    return makeResult('Netflix', STATUS_ERROR);
  }
}

// Disney+
async function checkDisneyPlus() {
  try {
    const [home, loc] = await Promise.all([
      testDisneyHomePage(),
      getDisneyLocationInfo()
    ]);

    let region = loc?.countryCode ? loc.countryCode.toUpperCase() : '';
    if (!region && home?.region) region = home.region.toUpperCase();

    if (loc?.inSupportedLocation === false || loc?.inSupportedLocation === 'false') {
      return makeResult('Disney+', STATUS_COMING, region || 'UN');
    }

    if (region) return makeResult('Disney+', STATUS_AVAILABLE, region);
    
    if (home && home.available === false) return makeResult('Disney+', STATUS_NOT_AVAILABLE);
    if (home && home.available === true) return makeResult('Disney+', STATUS_AVAILABLE, home.region || 'US');

    return makeResult('Disney+', STATUS_TIMEOUT);
  } catch (e) {
    return makeResult('Disney+', STATUS_ERROR);
  }
}

async function getDisneyLocationInfo() {
  const headers = {
    ...REQUEST_HEADERS,
    'Authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
    'Content-Type': 'application/json'
  };
  const body = JSON.stringify({
    query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
    variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '124.0.0.0', manufacturer: 'apple', model: null, operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] }, deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } }
  });

  const r = await request('POST', 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', headers, body);
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

async function testDisneyHomePage() {
  const r = await request('GET', 'https://www.disneyplus.com/');
  if (r.error || !r.response) return null;
  if (r.response.status !== 200) return { available: false };
  if (r.data && r.data.includes('Sorry, Disney+ is not available in your region.')) {
    return { available: false };
  }
  const match = (r.data || '').match(/Region: ([A-Za-z]{2})/i);
  return { available: true, region: match ? match[1].toUpperCase() : '' };
}

// YouTube Premium
async function checkYouTubePremium() {
  try {
    const r = await request('GET', 'https://www.youtube.com/premium');
    if (r.error || !r.response) return makeResult('YouTube', STATUS_TIMEOUT);

    const data = r.data || '';
    
    if (data.includes('Premium is not available in your country') || data.includes('is not available in your country')) {
      return makeResult('YouTube', STATUS_NOT_AVAILABLE);
    }

    if (r.response.status === 200) {
      let region = 'US';
      const m = data.match(/"countryCode":"([A-Za-z]{2})"/i);
      if (m && m[1]) {
        region = m[1].toUpperCase();
      } else if (data.includes('www.google.cn')) {
        region = 'CN';
      }
      return makeResult('YouTube', STATUS_AVAILABLE, region);
    }

    return makeResult('YouTube', STATUS_ERROR);
  } catch (e) {
    return makeResult('YouTube', STATUS_ERROR);
  }
}
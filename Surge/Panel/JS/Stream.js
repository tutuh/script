// 基础配置
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const REQUEST_TIMEOUT = 3; // 面板追求快，超时降为 3 秒

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

// 主入口
(async function () {
  const panel = {
    title: '网络解锁检测',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#D22F20'
  };

  // 增加核心 try-catch，防止某处未知错误导致整个面板断流崩溃
  try {
    const results = await Promise.all([
      checkChatGPT(),
      checkGemini(),
      checkNetflix(),
      checkDisneyPlus(),
      checkYouTubePremium()
    ]);

    panel.content = results.map(r => r.text).join('\n');
    panel['icon-color'] = pickIconColor(results);
  } catch (e) {
    panel.content = '检测失败 ❌';
    panel['icon-color'] = '#FF453A';
  }

  $done(panel);
})();

// 基础请求封装
function request(method, url, headers = REQUEST_HEADERS, body = null) {
  return new Promise((resolve) => {
    const opts = { url, headers, timeout: REQUEST_TIMEOUT };
    if (body) opts.body = body;

    const callback = (error, response, data) => {
      resolve({ error, response: response || {}, data: data || '' });
    };

    method === 'POST' ? $httpClient.post(opts, callback) : $httpClient.get(opts, callback);
  });
}

function makeResult(name, status, text, region = '') {
  return { name, status, text, region };
}

function pickIconColor(results) {
  let hasAvailable = false;
  let hasWarning = false;

  for (const res of results) {
    if (res.status === STATUS_AVAILABLE) hasAvailable = true;
    else hasWarning = true;
  }

  if (hasAvailable && !hasWarning) return '#32D74B'; // 全绿
  if (hasAvailable && hasWarning) return '#FFD60A';   // 部分解锁（黄）
  return '#FF453A';                                   // 全挂（红）
}

// === 各平台检测逻辑 ===

// ChatGPT (精简为单次请求，移除多余的循环等待)
async function checkChatGPT() {
  try {
    const r = await request('GET', 'https://chatgpt.com/cdn-cgi/trace');
    if (r.error || !r.data) return makeResult('ChatGPT', STATUS_ERROR, 'ChatGPT: 检测失败 ❌');

    const locMatch = r.data.match(/loc=([A-Z]{2})/i);
    if (!locMatch) return makeResult('ChatGPT', STATUS_ERROR, 'ChatGPT: 检测失败 ❌');

    const region = locMatch[1].toUpperCase();
    if (GPT_SUPPORTED_REGIONS[region]) {
      return makeResult('ChatGPT', STATUS_AVAILABLE, `ChatGPT: 已解锁 ➟ ${region}`, region);
    }
    return makeResult('ChatGPT', STATUS_NOT_AVAILABLE, 'ChatGPT: 未支持 🚫', region);
  } catch (e) {
    return makeResult('ChatGPT', STATUS_ERROR, 'ChatGPT: 检测失败 ❌');
  }
}

// Gemini
async function checkGemini() {
  try {
    const r = await request('GET', 'https://gemini.google.com/app');
    if (r.error || !r.response) return makeResult('Gemini', STATUS_ERROR, 'Gemini: 检测失败 ❌');

    const status = r.response.status || 0;
    const data = r.data || '';

    if (status === 200) {
      if (data.includes('not available') || data.includes('unavailable in your country')) {
        return makeResult('Gemini', STATUS_NOT_AVAILABLE, 'Gemini: 未支持 🚫');
      }
      const m = data.match(/,2,1,200,"([A-Z]{2,3})"/);
      const region = m && m[1] ? m[1].slice(0, 2).toUpperCase() : 'YES';
      return makeResult('Gemini', STATUS_AVAILABLE, `Gemini: 已解锁 ➟ ${region}`, region);
    }

    if (status === 403 || status === 404) {
      return makeResult('Gemini', STATUS_NOT_AVAILABLE, 'Gemini: 未支持 🚫');
    }
    return makeResult('Gemini', STATUS_ERROR, 'Gemini: 检测失败 ❌');
  } catch (e) {
    return makeResult('Gemini', STATUS_ERROR, 'Gemini: 检测失败 ❌');
  }
}

// Netflix (精简掉串行循环，只检查单ID，兼顾地区识别)
async function checkNetflix() {
  try {
    const r = await request('GET', 'https://www.netflix.com/title/80062035');
    if (r.error || !r.response) return makeResult('Netflix', STATUS_ERROR, 'Netflix: 检测失败 ❌');

    const status = r.response.status || 0;
    const headers = r.response.headers || {};
    const data = r.data || '';

    if (status === 403) return makeResult('Netflix', STATUS_NOT_AVAILABLE, 'Netflix: 未支持 🚫');
    
    if (status === 200 || status === 404) {
      // 404 说明能访问自制剧页面但该特定ID不存在，通常也算自制剧解锁
      const url = headers['x-originating-url'] || headers['location'] || headers['Location'] || '';
      let region = '';
      
      if (url) {
        const parts = url.split('/');
        if (parts.length >= 4 && parts[3] && parts[3] !== 'title') {
          region = parts[3].split('-')[0].toUpperCase();
        }
      }
      if (!region && data.includes('www.netflix.com/title/')) region = 'US';
      
      region = region || 'KV'; // 自制剧解锁/未知地区
      return makeResult('Netflix', STATUS_AVAILABLE, `Netflix: 已解锁 ➟ ${region}`, region);
    }
    return makeResult('Netflix', STATUS_ERROR, 'Netflix: 检测失败 ❌');
  } catch (e) {
    return makeResult('Netflix', STATUS_ERROR, 'Netflix: 检测失败 ❌');
  }
}

// Disney+ (移除多余的本地 Timeout，靠统一的 REQUEST_TIMEOUT 控制)
async function checkDisneyPlus() {
  try {
    const [home, loc] = await Promise.all([
      testDisneyHomePage().catch(() => null),
      getDisneyLocationInfo().catch(() => null)
    ]);

    let region = loc?.countryCode ? loc.countryCode.toUpperCase() : '';
    if (!region && home?.region) region = home.region.toUpperCase();

    if (loc?.inSupportedLocation === false || loc?.inSupportedLocation === 'false') {
      return makeResult('Disney+', STATUS_COMING, `Disney+: 未登陆 ➟ ${region || 'UN'} ⏳`, region || 'UN');
    }

    if (region) return makeResult('Disney+', STATUS_AVAILABLE, `Disney+: 已解锁 ➟ ${region}`, region);
    if (home && home.available === false) return makeResult('Disney+', STATUS_NOT_AVAILABLE, 'Disney+: 未支持 🚫');

    return makeResult('Disney+', STATUS_ERROR, 'Disney+: 检测失败 ❌');
  } catch (e) {
    return makeResult('Disney+', STATUS_ERROR, 'Disney+: 检测失败 ❌');
  }
}

function getDisneyLocationInfo() {
  return new Promise((resolve, reject) => {
    const opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        'Authorization': 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': REQUEST_HEADERS['User-Agent']
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '124.0.0.0', manufacturer: 'apple', model: null, operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] }, deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } }
      }),
      timeout: REQUEST_TIMEOUT
    };

    $httpClient.post(opts, (error, response, data) => {
      if (error || !response || response.status !== 200) return reject();
      try {
        const obj = JSON.parse(data);
        if (obj?.errors) return reject();
        const session = obj?.extensions?.sdk?.session;
        resolve({
          inSupportedLocation: session ? session.inSupportedLocation : null,
          countryCode: session?.location ? session.location.countryCode : ''
        });
      } catch (e) { reject(); }
    });
  });
}

function testDisneyHomePage() {
  return new Promise((resolve, reject) => {
    const opts = { url: 'https://www.disneyplus.com/', headers: REQUEST_HEADERS, timeout: REQUEST_TIMEOUT };
    $httpClient.get(opts, (error, response, data) => {
      if (error) return reject();
      if (!response || response.status !== 200) return resolve({ available: false });
      if (data && data.includes('Sorry, Disney+ is not available in your region.')) {
        return resolve({ available: false });
      }
      const match = data.match(/Region: ([A-Za-z]{2})/);
      resolve({ available: true, region: match ? match[1] : '' });
    });
  });
}

// YouTube Premium (精简并修复重叠的逻辑)
async function checkYouTubePremium() {
  try {
    const r = await request('GET', 'https://www.youtube.com/premium');
    if (r.error || !r.response) return makeResult('YouTube', STATUS_ERROR, 'YouTube: 检测失败 ❌');

    const data = r.data || '';
    
    // 无论是 200 还是其他状态，只要包含不可用文本即判定为不支持
    if (data.includes('Premium is not available in your country') || data.includes('is not available in your country')) {
      return makeResult('YouTube', STATUS_NOT_AVAILABLE, 'YouTube: 未支持 🚫');
    }

    if (r.response.status === 200) {
      let region = 'US';
      const m = data.match(/"countryCode":"(.*?)"/);
      if (m && m[1]) region = m[1].toUpperCase();
      else if (data.includes('www.google.cn')) region = 'CN';
      
      return makeResult('YouTube', STATUS_AVAILABLE, `YouTube: 已解锁 ➟ ${region}`, region);
    }

    return makeResult('YouTube', STATUS_ERROR, 'YouTube: 检测失败 ❌');
  } catch (e) {
    return makeResult('YouTube', STATUS_ERROR, 'YouTube: 检测失败 ❌');
  }
}

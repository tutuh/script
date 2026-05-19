// --- 基础配置 ---
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const REQUEST_TIMEOUT = 5;

const STATUS = {
  COMING: 2,
  AVAILABLE: 1,
  NOT_AVAILABLE: 0,
  TIMEOUT: -1,
  ERROR: -2
};

const GPT_SUPPORTED_REGIONS = new Set([
  "T1", "XX", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ", "BS", "BD", "BB", "BE", "BZ", "BJ", "BT", "BA",
  "BW", "BR", "BG", "BF", "CV", "CA", "CL", "CO", "KM", "CR", "HR", "CY", "DK", "DJ", "DM", "DO", "EC", "SV", "EE", "FJ",
  "FI", "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IQ",
  "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KW", "KG", "LV", "LB", "LS", "LR", "LI", "LT", "LU", "MG", "MW",
  "MY", "MV", "ML", "MT", "MH", "MR", "MU", "MX", "MC", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NZ", "NI",
  "NE", "NG", "MK", "NO", "OM", "PK", "PW", "PA", "PG", "PE", "PH", "PL", "PT", "QA", "RO", "RW", "KN", "LC", "VC", "WS",
  "SM", "ST", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB", "ZA", "ES", "LK", "SR", "SE", "CH", "TH", "TG", "TO", "TT",
  "TN", "TR", "TV", "UG", "AE", "US", "UY", "VU", "ZM", "BO", "BN", "CG", "CZ", "VA", "FM", "MD", "PS", "KR", "TW", "TZ",
  "TL", "GB"
]);

const CHATGPT_TRACE_URLS = [
  'https://chatgpt.com/cdn-cgi/trace',
  'https://chat.openai.com/cdn-cgi/trace'
];

// --- 主入口 ---
;(async () => {
  try {
    const results = await Promise.all([
      checkChatGPT(),
      checkGemini(),
      checkNetflix(),
      checkDisneyPlus(),
      checkYouTubePremium()
    ]);

    $done({
      title: '网络解锁检测',
      content: results.map(r => r.text).join('\n'),
      icon: 'play.tv.fill',
      'icon-color': pickIconColor(results)
    });
  } catch (error) {
    $done({
      title: '网络解锁检测',
      content: '检测失败 ❌',
      icon: 'play.tv.fill',
      'icon-color': '#D22F20'
    });
  }
})();

// --- 工具函数 ---
const request = (method, url, headers = REQUEST_HEADERS, body = null, timeoutMs = REQUEST_TIMEOUT) => {
  return new Promise(resolve => {
    const opts = { url, headers, timeout: timeoutMs };
    if (body) opts.body = body;

    const callback = (error, response, data) => resolve({ error, response: response || {}, data: data || '' });
    method === 'POST' ? $httpClient.post(opts, callback) : $httpClient.get(opts, callback);
  });
};

const upper = s => (s || '').toString().toUpperCase();
const isSupportedGPTRegion = loc => GPT_SUPPORTED_REGIONS.has(upper(loc));
const makeResult = (name, status, text, region = '') => ({ name, status, text, region });
const timeout = ms => new Promise((_, reject) => setTimeout(() => reject('Timeout'), ms));

const pickIconColor = results => {
  const hasAvailable = results.some(r => r.status === STATUS.AVAILABLE);
  const hasWarning = results.some(r => r.status !== STATUS.AVAILABLE);

  if (hasAvailable && !hasWarning) return '#32D74B';
  if (hasAvailable && hasWarning) return '#FFD60A';
  return '#FF453A';
};

// --- ChatGPT 检测 ---
async function checkChatGPT() {
  for (const url of CHATGPT_TRACE_URLS) {
    const { error, data } = await request('GET', url);
    if (error || !data) continue;

    const locMatch = data.match(/loc=([A-Za-z0-9]+)/);
    if (!locMatch) continue;

    const region = upper(locMatch[1]);
    return isSupportedGPTRegion(region)
      ? makeResult('ChatGPT', STATUS.AVAILABLE, `ChatGPT: 已解锁 ➟ ${region}`, region)
      : makeResult('ChatGPT', STATUS.NOT_AVAILABLE, `ChatGPT: 未支持 🚫`, region);
  }
  return makeResult('ChatGPT', STATUS.ERROR, 'ChatGPT: 检测失败 ❌');
}

// --- Gemini 检测 ---
async function checkGemini() {
  const urls = ['https://gemini.google.com/', 'https://gemini.google.com/app'];

  for (const url of urls) {
    const { error, response, data } = await request('GET', url);
    if (error || !response) continue;

    const status = response.status || 0;

    if (status === 200) {
      if (data.includes('not available') || data.includes('unavailable in your country')) {
        return makeResult('Gemini', STATUS.NOT_AVAILABLE, 'Gemini: 未支持 🚫');
      }
      const m = data.match(/,2,1,200,"([A-Z]{2,3})"/);
      const region = m && m[1] ? upper(m[1].substring(0, 2)) : 'YES';
      return makeResult('Gemini', STATUS.AVAILABLE, `Gemini: 已解锁 ➟ ${region}`, region);
    }

    if (status === 403 || status === 404) {
      return makeResult('Gemini', STATUS.NOT_AVAILABLE, 'Gemini: 未支持 🚫');
    }
  }
  return makeResult('Gemini', STATUS.ERROR, 'Gemini: 检测失败 ❌');
}

// --- Netflix 检测 ---
async function checkNetflix() {
  const ids = [80062035, 80018499];

  for (const id of ids) {
    const { error, response, data } = await request('GET', `https://www.netflix.com/title/${id}`);
    if (error || !response) continue;

    const status = response.status || 0;
    if (status === 403) return makeResult('Netflix', STATUS.NOT_AVAILABLE, 'Netflix: 未支持 🚫');
    if (status === 404) continue;

    if (status === 200) {
      const headers = response.headers || {};
      const url = headers['x-originating-url'] || headers['location'] || headers['Location'] || '';
      let region = 'US'; // 默认 fallback
      
      if (url) {
        const parts = url.split('/');
        if (parts.length >= 4 && parts[3]) {
          const parsedRegion = parts[3].split('-')[0];
          if (parsedRegion !== 'title') region = upper(parsedRegion);
        }
      } else if (!data.includes('www.netflix.com/title/')) {
        region = 'US';
      }
      
      return makeResult('Netflix', STATUS.AVAILABLE, `Netflix: 已解锁 ➟ ${region}`, region);
    }
  }
  return makeResult('Netflix', STATUS.ERROR, 'Netflix: 检测失败 ❌');
}

// --- Disney+ 检测 ---
async function checkDisneyPlus() {
  try {
    const [homeRes, locRes] = await Promise.allSettled([
      Promise.race([testDisneyHomePage(), timeout(7000)]),
      Promise.race([getDisneyLocationInfo(), timeout(7000)])
    ]);

    const homeData = homeRes.status === 'fulfilled' ? homeRes.value : null;
    const locData = locRes.status === 'fulfilled' ? locRes.value : null;

    let region = locData?.countryCode ? upper(locData.countryCode) : (homeData?.region ? upper(homeData.region) : '');
    const inSupportedLocation = locData?.inSupportedLocation;

    if (inSupportedLocation === false || String(inSupportedLocation) === 'false') {
      return makeResult('Disney+', STATUS.COMING, `Disney+: 未登陆 ➟ ${region || 'UN'} ⏳`, region || 'UN');
    }

    if (region) {
      return makeResult('Disney+', STATUS.AVAILABLE, `Disney+: 已解锁 ➟ ${region}`, region);
    }

    if (homeData && homeData.available === false) {
      return makeResult('Disney+', STATUS.NOT_AVAILABLE, 'Disney+: 未支持 🚫');
    }

    return makeResult('Disney+', STATUS.ERROR, 'Disney+: 检测失败 ❌');
  } catch (e) {
    return makeResult('Disney+', STATUS.TIMEOUT, 'Disney+: 检测超时 🚦');
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
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: { browserName: 'chrome', browserVersion: '124.0.0.0', manufacturer: 'apple', model: null, operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] },
            deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx'
          }
        }
      }),
      timeout: REQUEST_TIMEOUT
    };

    $httpClient.post(opts, (error, response, data) => {
      if (error || !response || response.status !== 200) return reject('Not Available');
      try {
        const obj = JSON.parse(data);
        if (obj?.errors) return reject('Not Available');
        const session = obj?.extensions?.sdk?.session;
        resolve({
          inSupportedLocation: session?.inSupportedLocation ?? null,
          countryCode: session?.location?.countryCode || ''
        });
      } catch {
        reject('Error');
      }
    });
  });
}

function testDisneyHomePage() {
  return new Promise(resolve => {
    $httpClient.get({ url: 'https://www.disneyplus.com/', headers: REQUEST_HEADERS, timeout: REQUEST_TIMEOUT }, (error, response, data) => {
      if (error || !response || response.status !== 200) return resolve({ available: false });
      if (data?.includes('Sorry, Disney+ is not available in your region.')) return resolve({ available: false });
      
      const match = data?.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
      resolve({ available: true, region: match ? match[1] : '' });
    });
  });
}

// --- YouTube Premium 检测 ---
async function checkYouTubePremium() {
  const { error, response, data } = await request('GET', 'https://www.youtube.com/premium');
  if (error || !response) return makeResult('YouTube', STATUS.ERROR, 'YouTube: 检测失败 ❌');

  const isUnavailable = data.includes('Premium is not available in your country') || data.includes('is not available in your country');
  
  if (response.status !== 200 || isUnavailable) {
    return makeResult('YouTube', isUnavailable ? STATUS.NOT_AVAILABLE : STATUS.ERROR, isUnavailable ? 'YouTube: 未支持 🚫' : 'YouTube: 检测失败 ❌');
  }

  let region = 'US';
  const m = data.match(/"countryCode":"(.*?)"/);
  if (m && m[1]) {
    region = upper(m[1]);
  } else if (data.includes('www.google.cn')) {
    region = 'CN';
  }

  return makeResult('YouTube', STATUS.AVAILABLE, `YouTube: 已解锁 ➟ ${region}`, region);
}

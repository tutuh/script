// 全局配置：统一 Headers 并强制禁用缓存
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
}

// 状态常量定义
const STATUS_COMING = 2
const STATUS_AVAILABLE = 1
const STATUS_NOT_AVAILABLE = 0
const STATUS_TIMEOUT = -1
const STATUS_ERROR = -2

// ChatGPT 支持的国家/地区列表（外移至全局，优化内存）
const GPT_SUPPORTED_REGIONS = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];

;(async () => {
  let panel_result = {
    title: '网络解锁检测',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#D22F20',
  }
  
  // 并发获取所有检测结果
  const [chatgpt_result, gemini_result, netflix_result, disney_raw, youtube_result] = await Promise.all([
    check_chatgpt(),
    check_gemini(),
    check_netflix(),
    testDisneyPlus(),
    check_youtube_premium()
  ]);
  
  // 根据 Disney 状态组装输出文本
  let disney_result = "Disney+: ";
  switch(disney_raw.status) {
    case STATUS_AVAILABLE:
      disney_result += "已解锁 ➟ " + disney_raw.region.toUpperCase();
      break;
    case STATUS_COMING:
      disney_result += "未登陆 ➟ " + disney_raw.region.toUpperCase() + " ⏳";
      break;
    case STATUS_NOT_AVAILABLE:
      disney_result += "未支持 🚫";
      break;
    case STATUS_TIMEOUT:
      disney_result += "检测超时 🚦";
      break;
    default:
      disney_result += "检测失败 ❌";
      break;
  }

  // 完美排版输出
  panel_result['content'] = [
    chatgpt_result, 
    gemini_result, 
    netflix_result, 
    disney_result, 
    youtube_result
  ].join('\n');
  
  $done(panel_result);
})()

// ====== ChatGPT 检测函数 ======
async function check_chatgpt() {
  return new Promise((resolve) => {
    let option = {
      url: "https://chat.openai.com/cdn-cgi/trace",
      headers: REQUEST_HEADERS,
      timeout: 5000
    }
    $httpClient.get(option, function(error, response, data) {
      if (error || !data) {
        resolve("ChatGPT: 检测失败 ❌");
        return;
      }
      
      let lines = data.split("\n"); 
      let cf = lines.reduce((acc, line) => {
        let [key, value] = line.split("=");
        if(key && value) acc[key] = value.trim();
        return acc;
      }, {});
      
      let loc = cf.loc || '';
      let isSupported = GPT_SUPPORTED_REGIONS.includes(loc.toUpperCase());
      let gptStatus = isSupported ? "已解锁 ➟ " + loc.toUpperCase() : "未支持 🚫";
      
      resolve("ChatGPT: " + gptStatus);
    });
  });
}

// ====== Gemini 检测函数 ======
async function check_gemini() {
  return new Promise((resolve) => {
    let option = {
      url: "https://gemini.google.com",
      headers: REQUEST_HEADERS,
      timeout: 5000
    }
    $httpClient.get(option, function(error, response, data) {
      if (error || !data) {
        resolve("Gemini: 检测失败 ❌");
        return;
      }
      
      if (data.includes("45631641,null,true")) {
        const m = data.match(/,2,1,200,"([A-Z]{2,3})"/);
        if (m) {
          const region = m[1].substring(0, 2);
          resolve("Gemini: 已解锁 ➟ " + region.toUpperCase());
        } else {
          resolve("Gemini: 已解锁 ➟ YES");
        }
      } else {
        resolve("Gemini: 未支持 🚫");
      }
    });
  });
}

// ====== YouTube Premium 检测函数 ======
async function check_youtube_premium() {
  return new Promise((resolve) => {
    let option = {
      url: 'https://www.youtube.com/premium',
      headers: REQUEST_HEADERS,
      timeout: 5000
    }
    $httpClient.get(option, function (error, response, data) {
      if (error || !data || response.status !== 200) {
        resolve('YouTube: 检测失败 ❌')
        return
      }

      if (data.indexOf('Premium is not available in your country') !== -1) {
        resolve('YouTube: 未支持 🚫')
        return
      }

      let region = 'US'
      let re = new RegExp('"countryCode":"(.*?)"', 'gm')
      let result = re.exec(data)
      if (result && result.length === 2) {
        region = result[1]
      } else if (data.indexOf('www.google.cn') !== -1) {
        region = 'CN'
      }
      resolve('YouTube: 已解锁 ➟ ' + region.toUpperCase())
    })
  })
}

// ====== Netflix 检测函数 ======
async function check_netflix() {
  let inner_check = (filmId) => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
        timeout: 5000
      }
      $httpClient.get(option, function (error, response, data) {
        if (error != null) return reject('Error')
        if (response.status === 403) return reject('Not Available')
        if (response.status === 404) return resolve('Not Found')

        if (response.status === 200) {
          let url = response.headers['x-originating-url'] || response.headers['Location'] || ''
          if (!url || url.includes('/title/')) return resolve('US')
          let region = url.split('/')[3]
          if (region) {
            region = region.split('-')[0]
            if (region == 'title') region = 'US'
            resolve(region)
          } else {
            resolve('US')
          }
          return
        }
        reject('Error')
      })
    })
  }

  let netflix_check_result = 'Netflix: '

  await inner_check(80062035)
    .then((code) => {
      if (code === 'Not Found') return inner_check(80018499)
      netflix_check_result += '已解锁 ➟ ' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .then((code) => {
      if (code === 'Not Found') return Promise.reject('Not Available')
      netflix_check_result += '自制剧 ➟ ' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .catch((error) => {
      if (error === 'BreakSignal') return
      if (error === 'Not Available') {
        netflix_check_result += '未支持 🚫'
        return
      }
      netflix_check_result += '检测失败 ❌'
    })

  return netflix_check_result
}

// ====== DisneyPlus 检测函数 ======
async function testDisneyPlus() {
  try {
    let { region } = await Promise.race([testHomePage(), timeout(7000)])
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)])
    
    region = countryCode ?? region
    
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    } else {
      return { region, status: STATUS_AVAILABLE }
    }
  } catch (error) {
    if (error === 'Not Available') return { status: STATUS_NOT_AVAILABLE }
    if (error === 'Timeout') return { status: STATUS_TIMEOUT }
    return { status: STATUS_ERROR }
  } 
}
  
function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
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
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) return reject('Error')
      if (response.status !== 200) return reject('Not Available')

      try {
        data = JSON.parse(data)
        if (data?.errors) return reject('Not Available')

        let {
          session: {
            inSupportedLocation,
            location: { countryCode },
          },
        } = data?.extensions?.sdk
        resolve({ inSupportedLocation, countryCode })
      } catch (e) {
        reject('Error')
      }
    })
  })
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: REQUEST_HEADERS,
    }

    $httpClient.get(opts, function (error, response, data) {
      if (error) return reject('Error')
      if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        return reject('Not Available')
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
      if (!match) return resolve({ region: '', cnbl: '' })

      resolve({ region: match[1], cnbl: match[2] })
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('Timeout'), delay)
  })
}

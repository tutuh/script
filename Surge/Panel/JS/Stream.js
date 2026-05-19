// 基础配置
var REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
}

var REQUEST_TIMEOUT = 5

var STATUS_COMING = 2
var STATUS_AVAILABLE = 1
var STATUS_NOT_AVAILABLE = 0
var STATUS_TIMEOUT = -1
var STATUS_ERROR = -2

var GPT_SUPPORTED_REGIONS = {
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
}

var CHATGPT_TRACE_URLS = [
  'https://chatgpt.com/cdn-cgi/trace',
  'https://chat.openai.com/cdn-cgi/trace'
]

// 主入口
;(async function () {
  var panel = {
    title: '网络解锁检测',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#D22F20'
  }

  var results = await Promise.all([
    checkChatGPT(),
    checkGemini(),
    checkNetflix(),
    checkDisneyPlus(),
    checkYouTubePremium()
  ])

  panel.content = [
    results[0].text,
    results[1].text,
    results[2].text,
    results[3].text,
    results[4].text
  ].join('\n')

  panel['icon-color'] = pickIconColor(results)

  $done(panel)
})().catch(function () {
  $done({
    title: '网络解锁检测',
    content: '检测失败 ❌',
    icon: 'play.tv.fill',
    'icon-color': '#FF453A'
  })
})

// 请求
function request(method, url, headers, body, timeoutMs) {
  return new Promise(function (resolve) {
    var opts = {
      url: url,
      headers: headers || REQUEST_HEADERS,
      timeout: timeoutMs || REQUEST_TIMEOUT
    }

    if (body !== undefined && body !== null) {
      opts.body = body
    }

    var callback = function (error, response, data) {
      resolve({
        error: error,
        response: response || {},
        data: data || ''
      })
    }

    if (method === 'POST') {
      $httpClient.post(opts, callback)
    } else {
      $httpClient.get(opts, callback)
    }
  })
}

function upper(s) {
  return (s || '').toString().toUpperCase()
}

function isSupportedGPTRegion(loc) {
  return !!GPT_SUPPORTED_REGIONS[upper(loc)]
}

function makeResult(name, status, text, region) {
  return {
    name: name,
    status: status,
    text: text,
    region: region || ''
  }
}

function pickIconColor(results) {
  var hasAvailable = false
  var hasWarning = false

  for (var i = 0; i < results.length; i++) {
    if (results[i].status === STATUS_AVAILABLE) {
      hasAvailable = true
    } else {
      hasWarning = true
    }
  }

  if (hasAvailable && !hasWarning) return '#32D74B'
  if (hasAvailable && hasWarning) return '#FFD60A'
  return '#FF453A'
}

function timeout(ms) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject('Timeout')
    }, ms)
  })
}

// ChatGPT
async function checkChatGPT() {
  for (var i = 0; i < CHATGPT_TRACE_URLS.length; i++) {
    var r = await request('GET', CHATGPT_TRACE_URLS[i], REQUEST_HEADERS, null, REQUEST_TIMEOUT)
    if (r.error || !r.data) continue

    var loc = parseCloudflareTraceLoc(r.data)
    if (!loc) continue

    var region = upper(loc)
    if (isSupportedGPTRegion(region)) {
      return makeResult('ChatGPT', STATUS_AVAILABLE, 'ChatGPT: 已解锁 ➟ ' + region, region)
    }

    return makeResult('ChatGPT', STATUS_NOT_AVAILABLE, 'ChatGPT: 未支持 🚫', region)
  }

  return makeResult('ChatGPT', STATUS_ERROR, 'ChatGPT: 检测失败 ❌')
}

function parseCloudflareTraceLoc(text) {
  var lines = text.split('\n')
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('loc=') === 0) {
      return lines[i].slice(4).trim()
    }
  }
  return ''
}

// Gemini
async function checkGemini() {
  var urls = [
    'https://gemini.google.com/',
    'https://gemini.google.com/app'
  ]

  for (var i = 0; i < urls.length; i++) {
    var r = await request('GET', urls[i], REQUEST_HEADERS, null, REQUEST_TIMEOUT)
    if (r.error || !r.response) continue

    var status = r.response.status || 0
    var data = r.data || ''

    if (status === 200) {
      if (data.indexOf('not available') !== -1 || data.indexOf('unavailable in your country') !== -1) {
        return makeResult('Gemini', STATUS_NOT_AVAILABLE, 'Gemini: 未支持 🚫')
      }

      var m = data.match(/,2,1,200,"([A-Z]{2,3})"/)
      if (m && m[1]) {
        var region = upper(m[1].slice(0, 2))
        return makeResult('Gemini', STATUS_AVAILABLE, 'Gemini: 已解锁 ➟ ' + region, region)
      }

      return makeResult('Gemini', STATUS_AVAILABLE, 'Gemini: 已解锁 ➟ YES')
    }

    if (status === 403 || status === 404) {
      return makeResult('Gemini', STATUS_NOT_AVAILABLE, 'Gemini: 未支持 🚫')
    }
  }

  return makeResult('Gemini', STATUS_ERROR, 'Gemini: 检测失败 ❌')
}

// Netflix
async function checkNetflix() {
  var ids = [80062035, 80018499]

  for (var i = 0; i < ids.length; i++) {
    var r = await request('GET', 'https://www.netflix.com/title/' + ids[i], REQUEST_HEADERS, null, REQUEST_TIMEOUT)
    if (r.error || !r.response) continue

    var status = r.response.status || 0
    var headers = r.response.headers || {}
    var data = r.data || ''

    if (status === 403) {
      return makeResult('Netflix', STATUS_NOT_AVAILABLE, 'Netflix: 未支持 🚫')
    }

    if (status === 404) {
      continue
    }

    if (status === 200) {
      var url = headers['x-originating-url'] || headers['location'] || headers['Location'] || ''
      var region = parseNetflixRegion(url, data)

      if (region) {
        return makeResult('Netflix', STATUS_AVAILABLE, 'Netflix: 已解锁 ➟ ' + region, region)
      }

      return makeResult('Netflix', STATUS_AVAILABLE, 'Netflix: 已解锁 ➟ US', 'US')
    }
  }

  return makeResult('Netflix', STATUS_ERROR, 'Netflix: 检测失败 ❌')
}

function parseNetflixRegion(url, data) {
  if (url) {
    var parts = url.split('/')
    if (parts.length >= 4) {
      var region = parts[3]
      if (region) {
        region = region.split('-')[0]
        if (region === 'title') return 'US'
        return upper(region)
      }
    }
  }

  if (data && data.indexOf('www.netflix.com/title/') !== -1) {
    return 'US'
  }

  return ''
}

// Disney+
async function checkDisneyPlus() {
  try {
    var home = null
    var loc = null

    try {
      home = await Promise.race([testDisneyHomePage(), timeout(7000)])
    } catch (e1) {}

    try {
      loc = await Promise.race([getDisneyLocationInfo(), timeout(7000)])
    } catch (e2) {}

    var region = ''
    var inSupportedLocation = null

    if (loc) {
      if (loc.countryCode) region = upper(loc.countryCode)
      if (typeof loc.inSupportedLocation !== 'undefined') {
        inSupportedLocation = loc.inSupportedLocation
      }
    }

    if (!region && home && home.region) {
      region = upper(home.region)
    }

    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return makeResult('Disney+', STATUS_COMING, 'Disney+: 未登陆 ➟ ' + (region || 'UN') + ' ⏳', region || 'UN')
    }

    if (region) {
      return makeResult('Disney+', STATUS_AVAILABLE, 'Disney+: 已解锁 ➟ ' + region, region)
    }

    if (home && home.available === false) {
      return makeResult('Disney+', STATUS_NOT_AVAILABLE, 'Disney+: 未支持 🚫')
    }

    return makeResult('Disney+', STATUS_ERROR, 'Disney+: 检测失败 ❌')
  } catch (e) {
    if (e === 'Timeout') return makeResult('Disney+', STATUS_TIMEOUT, 'Disney+: 检测超时 🚦')
    return makeResult('Disney+', STATUS_ERROR, 'Disney+: 检测失败 ❌')
  }
}

function getDisneyLocationInfo() {
  return new Promise(function (resolve, reject) {
    var opts = {
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
              browserVersion: '124.0.0.0',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: []
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx'
          }
        }
      }),
      timeout: REQUEST_TIMEOUT
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) return reject('Error')
      if (!response || response.status !== 200) return reject('Not Available')

      try {
        var obj = JSON.parse(data)
        if (obj && obj.errors) return reject('Not Available')

        var sdk = obj && obj.extensions && obj.extensions.sdk
        var session = sdk && sdk.session
        var location = session && session.location

        resolve({
          inSupportedLocation: session ? session.inSupportedLocation : null,
          countryCode: location ? location.countryCode : ''
        })
      } catch (e) {
        reject('Error')
      }
    })
  })
}

function testDisneyHomePage() {
  return new Promise(function (resolve, reject) {
    var opts = {
      url: 'https://www.disneyplus.com/',
      headers: REQUEST_HEADERS,
      timeout: REQUEST_TIMEOUT
    }

    $httpClient.get(opts, function (error, response, data) {
      if (error) return reject('Error')
      if (!response || response.status !== 200) return resolve({ available: false })

      if (data && data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        return resolve({ available: false })
      }

      var match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
      if (!match) return resolve({ available: true, region: '' })

      resolve({
        available: true,
        region: match[1]
      })
    })
  })
}

// YouTube Premium
async function checkYouTubePremium() {
  var r = await request('GET', 'https://www.youtube.com/premium', REQUEST_HEADERS, null, REQUEST_TIMEOUT)
  if (r.error || !r.response) {
    return makeResult('YouTube', STATUS_ERROR, 'YouTube: 检测失败 ❌')
  }

  var status = r.response.status || 0
  var data = r.data || ''

  if (status !== 200) {
    if (data.indexOf('Premium is not available in your country') !== -1 ||
        data.indexOf('is not available in your country') !== -1) {
      return makeResult('YouTube', STATUS_NOT_AVAILABLE, 'YouTube: 未支持 🚫')
    }
    return makeResult('YouTube', STATUS_ERROR, 'YouTube: 检测失败 ❌')
  }

  if (data.indexOf('Premium is not available in your country') !== -1 ||
      data.indexOf('is not available in your country') !== -1) {
    return makeResult('YouTube', STATUS_NOT_AVAILABLE, 'YouTube: 未支持 🚫')
  }

  var region = parseYouTubeRegion(data)
  return makeResult('YouTube', STATUS_AVAILABLE, 'YouTube: 已解锁 ➟ ' + region, region)
}

function parseYouTubeRegion(data) {
  var region = 'US'
  var m = data.match(/"countryCode":"(.*?)"/)
  if (m && m[1]) {
    region = upper(m[1])
  } else if (data.indexOf('www.google.cn') !== -1) {
    region = 'CN'
  }
  return region
}
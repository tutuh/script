/*
 * 网络解锁检测面板
 * 支持：
 * ChatGPT / Gemini / Netflix / Disney+ / YouTube Premium
 */

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

// ===== 状态常量 =====
const STATUS_COMING = 2
const STATUS_AVAILABLE = 1
const STATUS_NOT_AVAILABLE = 0
const STATUS_TIMEOUT = -1
const STATUS_ERROR = -2

// ===== 通用请求封装 =====
function httpGet(option) {
  return new Promise((resolve, reject) => {
    $httpClient.get(option, (error, response, data) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ response, data })
    })
  })
}

function httpPost(option) {
  return new Promise((resolve, reject) => {
    $httpClient.post(option, (error, response, data) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ response, data })
    })
  })
}

function timeout(delay = 8000) {
  return new Promise((_, reject) => {
    setTimeout(() => reject('Timeout'), delay)
  })
}

function safeUpper(v) {
  return (v || '').toUpperCase()
}

function formatResult(name, status, region = '') {
  switch (status) {
    case STATUS_AVAILABLE:
      return `${name}: 已解锁 ➟ ${safeUpper(region)}`
    case STATUS_COMING:
      return `${name}: 即将登陆 ➟ ${safeUpper(region)} ⏳`
    case STATUS_NOT_AVAILABLE:
      return `${name}: 未支持 🚫`
    case STATUS_TIMEOUT:
      return `${name}: 检测超时 🚦`
    default:
      return `${name}: 检测失败 ❌`
  }
}

// ===== 主程序 =====
;(async () => {
  const panel_result = {
    title: '网络解锁检测',
    content: '检测中...',
    icon: 'play.tv.fill',
    'icon-color': '#D22F20',
  }

  try {
    const results = await Promise.allSettled([
      check_chatgpt(),
      check_gemini(),
      check_netflix(),
      testDisneyPlus(),
      check_youtube_premium(),
    ])

    const output = []

    // ChatGPT
    output.push(
      results[0].status === 'fulfilled'
        ? results[0].value
        : 'ChatGPT: 检测失败 ❌'
    )

    // Gemini
    output.push(
      results[1].status === 'fulfilled'
        ? results[1].value
        : 'Gemini: 检测失败 ❌'
    )

    // Netflix
    output.push(
      results[2].status === 'fulfilled'
        ? results[2].value
        : 'Netflix: 检测失败 ❌'
    )

    // Disney+
    if (results[3].status === 'fulfilled') {
      const disney = results[3].value
      output.push(formatResult('Disney+', disney.status, disney.region))
    } else {
      output.push('Disney+: 检测失败 ❌')
    }

    // YouTube
    output.push(
      results[4].status === 'fulfilled'
        ? results[4].value
        : 'YouTube: 检测失败 ❌'
    )

    panel_result.content = output.join('\n')
  } catch (e) {
    panel_result.content = '检测发生异常 ❌'
  }

  $done(panel_result)
})()

// ===== ChatGPT =====
async function check_chatgpt() {
  const supported = [
    "T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB",
    "BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR",
    "HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE",
    "DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ",
    "IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR",
    "LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN",
    "ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM",
    "PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS",
    "SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE",
    "CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO",
    "BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"
  ]

  try {
    const { data } = await Promise.race([
      httpGet({
        url: 'https://chat.openai.com/cdn-cgi/trace',
        headers: REQUEST_HEADERS,
      }),
      timeout(),
    ])

    const lines = data.split('\n')

    const cf = lines.reduce((acc, line) => {
      const [key, value] = line.split('=')
      if (key && value) acc[key] = value.trim()
      return acc
    }, {})

    const loc = cf.loc || ''

    if (supported.includes(loc)) {
      return `ChatGPT: 已解锁 ➟ ${safeUpper(loc)}`
    }

    return 'ChatGPT: 未支持 🚫'
  } catch (e) {
    return 'ChatGPT: 检测失败 ❌'
  }
}

// ===== Gemini =====
async function check_gemini() {
  try {
    const { data } = await Promise.race([
      httpGet({
        url: 'https://gemini.google.com',
        headers: REQUEST_HEADERS,
      }),
      timeout(),
    ])

    // 不支持
    if (
      data.includes('not available in your country') ||
      data.includes('Gemini is not currently supported')
    ) {
      return 'Gemini: 未支持 🚫'
    }

    // RegionRestrictionCheck 逻辑
    if (data.includes('45631641,null,true')) {
      const m2 = data.match(/,2,1,200,"([A-Z]{2})"/)

      if (m2 && m2[1]) {
        return `Gemini: 已解锁 ➟ ${safeUpper(m2[1])}`
      }

      const m3 = data.match(/,2,1,200,"([A-Z]{3})"/)

      if (m3 && m3[1]) {
        return `Gemini: 已解锁 ➟ ${safeUpper(
          m3[1].substring(0, 2)
        )}`
      }

      return 'Gemini: 已解锁 ✅'
    }

    // fallback
    const regionMatch = data.match(/"countryCode":"([A-Z]{2})"/)

    if (regionMatch && regionMatch[1]) {
      return `Gemini: 已解锁 ➟ ${safeUpper(regionMatch[1])}`
    }

    return 'Gemini: 未支持 🚫'
  } catch (e) {
    if (e === 'Timeout') {
      return 'Gemini: 检测超时 🚦'
    }
    return 'Gemini: 检测失败 ❌'
  }
}

// ===== YouTube Premium =====
async function check_youtube_premium() {
  try {
    const { response, data } = await Promise.race([
      httpGet({
        url: 'https://www.youtube.com/premium',
        headers: REQUEST_HEADERS,
      }),
      timeout(),
    ])

    if (response.status !== 200) {
      return 'YouTube: 检测失败 ❌'
    }

    if (data.includes('Premium is not available in your country')) {
      return 'YouTube: 未支持 🚫'
    }

    let region = ''

    const result = /"countryCode":"(.*?)"/gm.exec(data)

    if (result && result.length === 2) {
      region = result[1]
    } else if (data.includes('www.google.cn')) {
      region = 'CN'
    } else {
      region = 'US'
    }

    return `YouTube: 已解锁 ➟ ${safeUpper(region)}`
  } catch (e) {
    return e === 'Timeout'
      ? 'YouTube: 检测超时 🚦'
      : 'YouTube: 检测失败 ❌'
  }
}

// ===== Netflix =====
async function check_netflix() {
  async function innerCheck(filmId) {
    const { response } = await Promise.race([
      httpGet({
        url: `https://www.netflix.com/title/${filmId}`,
        headers: REQUEST_HEADERS,
      }),
      timeout(),
    ])

    if (response.status === 403) {
      throw 'Not Available'
    }

    if (response.status === 404) {
      return 'Not Found'
    }

    if (response.status === 200) {
      const url =
        response.headers['x-originating-url'] ||
        response.headers['Location'] ||
        ''

      if (!url || url.includes('/title/')) {
        return 'US'
      }

      let region = url.split('/')[3]

      if (region) {
        region = region.split('-')[0]
        if (region === 'title') region = 'US'
        return region
      }

      return 'US'
    }

    throw 'Error'
  }

  try {
    const result = await innerCheck(80062035)

    if (result !== 'Not Found') {
      return `Netflix: 已解锁 ➟ ${safeUpper(result)}`
    }

    const onlyNetflix = await innerCheck(80018499)

    if (onlyNetflix !== 'Not Found') {
      return `Netflix: 自制剧 ➟ ${safeUpper(onlyNetflix)}`
    }

    return 'Netflix: 未支持 🚫'
  } catch (e) {
    if (e === 'Timeout') {
      return 'Netflix: 检测超时 🚦'
    }

    if (e === 'Not Available') {
      return 'Netflix: 未支持 🚫'
    }

    return 'Netflix: 检测失败 ❌'
  }
}

// ===== Disney+ =====
async function testDisneyPlus() {
  try {
    let { region } = await Promise.race([
      testHomePage(),
      timeout(),
    ])

    let {
      countryCode,
      inSupportedLocation,
    } = await Promise.race([
      getLocationInfo(),
      timeout(),
    ])

    region = countryCode || region || 'US'

    if (
      inSupportedLocation === false ||
      inSupportedLocation === 'false'
    ) {
      return {
        region,
        status: STATUS_COMING,
      }
    }

    return {
      region,
      status: STATUS_AVAILABLE,
    }
  } catch (e) {
    if (e === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE }
    }

    if (e === 'Timeout') {
      return { status: STATUS_TIMEOUT }
    }

    return { status: STATUS_ERROR }
  }
}

async function getLocationInfo() {
  const opts = {
    url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
    headers: {
      'Accept-Language': 'en',
      Authorization:
        'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify({
      query:
        'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
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

  const { response, data } = await httpPost(opts)

  if (response.status !== 200) {
    throw 'Not Available'
  }

  let json

  try {
    json = JSON.parse(data)
  } catch {
    throw 'Error'
  }

  if (json?.errors) {
    throw 'Not Available'
  }

  const {
    session: {
      inSupportedLocation,
      location: { countryCode },
    },
  } = json?.extensions?.sdk

  return {
    inSupportedLocation,
    countryCode,
  }
}

async function testHomePage() {
  const { response, data } = await httpGet({
    url: 'https://www.disneyplus.com/',
    headers: {
      'Accept-Language': 'en',
      'User-Agent': UA,
    },
  })

  if (
    response.status !== 200 ||
    data.includes('Sorry, Disney+ is not available in your region.')
  ) {
    throw 'Not Available'
  }

  const match = data.match(
    /Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/
  )

  if (!match) {
    return {
      region: '',
      cnbl: '',
    }
  }

  return {
    region: match[1],
    cnbl: match[2],
  }
}
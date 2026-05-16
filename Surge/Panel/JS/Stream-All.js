const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
}

// 状态常量定义
const STATUS_COMING = 2
const STATUS_AVAILABLE = 1
const STATUS_NOT_AVAILABLE = 0
const STATUS_TIMEOUT = -1
const STATUS_ERROR = -2

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

;(async () => {
  let panel_result = {
    title: '流媒体解锁',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#DC3131',
  }
  
  // 并发获取各个流媒体的检测结果，大幅提高检测速度
  const [netflix_result, disney_raw, youtube_result] = await Promise.all([
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

  // 将检测结果按照 Netflix, Disney, YouTube 的顺序组装
  panel_result['content'] = [netflix_result, disney_result, youtube_result].join('\n');
  
  // 输出结果
  $done(panel_result);
})()

// ====== YouTube Premium 检测函数 ======
async function check_youtube_premium() {
  let inner_check = () => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.youtube.com/premium',
        headers: REQUEST_HEADERS,
      }
      $httpClient.get(option, function (error, response, data) {
        if (error != null || response.status !== 200) {
          reject('Error')
          return
        }

        if (data.indexOf('Premium is not available in your country') !== -1) {
          resolve('Not Available')
          return
        }

        let region = ''
        let re = new RegExp('"countryCode":"(.*?)"', 'gm')
        let result = re.exec(data)
        if (result != null && result.length === 2) {
          region = result[1]
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN'
        } else {
          region = 'US'
        }
        resolve(region)
      })
    })
  }

  let youtube_check_result = 'YouTube: '

  await inner_check()
    .then((code) => {
      if (code === 'Not Available') {
        youtube_check_result += '未支持 🚫'
      } else {
        youtube_check_result += '已解锁 ➟ ' + code.toUpperCase()
      }
    })
    .catch((error) => {
      youtube_check_result += '检测失败 ❌'
    })

  return youtube_check_result
}

// ====== Netflix 检测函数 ======
async function check_netflix() {
  let inner_check = (filmId) => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
      }
      $httpClient.get(option, function (error, response, data) {
        if (error != null) {
          reject('Error')
          return
        }

        if (response.status === 403) {
          reject('Not Available')
          return
        }

        if (response.status === 404) {
          resolve('Not Found')
          return
        }

        if (response.status === 200) {
          let url = response.headers['x-originating-url'] || response.headers['Location'] || ''
          if (!url || url.includes('/title/')) {
            resolve('US')
            return
          }
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
      if (code === 'Not Found') {
        return inner_check(80018499)
      }
      netflix_check_result += '已解锁 ➟ ' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .then((code) => {
      if (code === 'Not Found') {
        return Promise.reject('Not Available')
      }

      netflix_check_result += '自制剧 ➟ ' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .catch((error) => {
      if (error === 'BreakSignal') {
        return
      }
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
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)])
    console.log(`homepage: region=${region}, cnbl=${cnbl}`)
    
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)])
    console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`)
    
    region = countryCode ?? region
    console.log("region:" + region)
    
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    } else {
      return { region, status: STATUS_AVAILABLE }
    }
    
  } catch (error) {
    console.log("error:" + error)
    if (error === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE }
    }
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT }
    }
    return { status: STATUS_ERROR }
  } 
}
  
function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
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
      if (error) {
        reject('Error')
        return
      }

      if (response.status !== 200) {
        console.log('getLocationInfo: ' + data)
        reject('Not Available')
        return
      }

      try {
        data = JSON.parse(data)
        if (data?.errors) {
          console.log('getLocationInfo: ' + JSON.stringify(data.errors))
          reject('Not Available')
          return
        }

        let {
          token: { accessToken },
          session: {
            inSupportedLocation,
            location: { countryCode },
          },
        } = data?.extensions?.sdk
        resolve({ inSupportedLocation, countryCode, accessToken })
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
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    }

    $httpClient.get(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }
      if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        reject('Not Available')
        return
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
      if (!match) {
        resolve({ region: '', cnbl: '' })
        return
      }

      let region = match[1]
      let cnbl = match[2]
      resolve({ region, cnbl })
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

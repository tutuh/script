const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
}

// 状态常量
const STATUS_COMING = 2
const STATUS_AVAILABLE = 1
const STATUS_NOT_AVAILABLE = 0
const STATUS_TIMEOUT = -1
const STATUS_ERROR = -2

// 解析 Panel 传入的参数（图标、颜色等）
let iconUrl = '';
let iconColor = '';
let args = {};

if (typeof $argument !== 'undefined') {
  $argument.split('&').forEach(item => {
    const [key, value] = item.split('=');
    args[key] = value;
  });
}

// 优先使用传入的参数，否则使用默认流媒体图标
iconUrl = args.icon ? args.icon : 'play.tv.fill';
iconColor = args['icon-color'] ? args['icon-color'] : '#FF2D55';

;(async () => {
  let panel_result = {
    title: '流媒体 & ChatGPT 检测',
    content: '',
    icon: iconUrl,
    'icon-color': iconColor,
  }

  // 并发执行所有检测函数
  try {
    const [chatgptResult, youtubeResult, netflixResult, disneyRaw] = await Promise.all([
      check_chatgpt(),
      check_youtube_premium(),
      check_netflix(),
      testDisneyPlus()
    ]);

    // 处理 Disney+ 的结果文本
    let disneyResult = "Disney+: ";
    if (disneyRaw.status == STATUS_COMING) {
      disneyResult += "即将登陆 ~ " + disneyRaw.region.toUpperCase();
    } else if (disneyRaw.status == STATUS_AVAILABLE) {
      disneyResult += "已解锁 ➟ " + disneyRaw.region.toUpperCase();
    } else if (disneyRaw.status == STATUS_NOT_AVAILABLE) {
      disneyResult += "未支持 🚫";
    } else if (disneyRaw.status == STATUS_TIMEOUT) {
      disneyResult += "检测超时 🚦";
    } else {
      disneyResult += "检测失败 ❌";
    }

    // 组合所有结果并用换行符连接
    let contentList = [chatgptResult, youtubeResult, netflixResult, disneyResult];
    panel_result['content'] = contentList.join('\n');

  } catch (err) {
    panel_result['content'] = '检测程序异常，请刷新面板';
    console.log(err);
  } finally {
    $done(panel_result);
  }
})()

// ====== ChatGPT 检测函数 ======
async function check_chatgpt() {
  const tf = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];
  
  return new Promise((resolve) => {
    let option = {
      url: "https://chat.openai.com/cdn-cgi/trace",
      headers: REQUEST_HEADERS,
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
      let l = tf.indexOf(loc);
      let gptStatus = (l !== -1) ? "已解锁 ➟ " + loc.toUpperCase() : "未支持 🚫";
      
      resolve("ChatGPT: " + gptStatus);
    });
  });
}

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
        youtube_check_result += '不支持解锁 🚫'
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
          if (url.includes('/title/')) {
            resolve('us')
            return
          }
          let region = url.split('/')[3]
          if (region) {
            region = region.split('-')[0]
            if (region == 'title') {
              region = 'us'
            }
            resolve(region)
          } else {
            resolve('us')
          }
          return
        }

        reject('Error')
      })
    })
  }

  let netflix_check_result = 'Netflix: '

  await inner_check(81280792)
    .then((code) => {
      if (code === 'Not Found') {
        return inner_check(80018499)
      }
      netflix_check_result += '已完整解锁 ➟ ' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .then((code) => {
      if (code === 'Not Found') {
        return Promise.reject('Not Available')
      }

      netflix_check_result += '仅解锁自制剧 ➟ ' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .catch((error) => {
      if (error === 'BreakSignal') {
        return
      }
      if (error === 'Not Available') {
        netflix_check_result += '不支持解锁 🚫'
        return
      }
      netflix_check_result += '检测失败 ❌'
    })

  return netflix_check_result
}

// ====== DisneyPlus 检测函数 ======
function testDisneyPlus() {
  return new Promise((resolve) => {
    let option = {
      url: 'https://www.disneyplus.com/en-gb',
      headers: REQUEST_HEADERS,
      timeout: 5000
    }
    
    $httpClient.get(option, function (error, response, data) {
      if (error) {
        if (error.indexOf('timeout') !== -1) {
          resolve({ region: '', status: STATUS_TIMEOUT })
        } else {
          resolve({ region: '', status: STATUS_ERROR })
        }
        return
      }
      
      if (response.status !== 200) {
        resolve({ region: '', status: STATUS_NOT_AVAILABLE })
        return
      }

      if (data.indexOf('Disney+ is not available in your region') !== -1) {
        resolve({ region: '', status: STATUS_NOT_AVAILABLE })
        return
      }

      if (data.indexOf('disneyplus.com/welcome') !== -1 || data.indexOf('home') !== -1) {
        let region = 'us'
        let match = data.match(/"region":"(.*?)"/)
        if (match && match[1]) region = match[1]
        resolve({ region: region, status: STATUS_AVAILABLE })
      } else if (data.indexOf('coming-soon') !== -1) {
        resolve({ region: 'preview', status: STATUS_COMING })
      } else {
        resolve({ region: 'us', status: STATUS_AVAILABLE })
      }
    })
  })
}

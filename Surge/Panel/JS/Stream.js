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
 * 根据对齐模式格式化名称
 */
function getAlignedName(name, alignMode) {
  if (alignMode === 'native') {
    // 原生系统字体像素对齐
    switch (name) {
      case 'ChatGPT': return 'ChatGPT' + '     ';
      case 'Gemini': return 'Gemini' + '         ';
      case 'Netflix': return 'Netflix' + '          ';
      case 'Disney+': return 'Disney+' + '       ';
      case 'YouTube': return 'YouTube' + '      ';
      default: return name.padEnd(10, ' ');
    }
  }

  // 等宽极客风
  const monoMap = {
    'ChatGPT': '𝙲𝚑𝚊𝚝𝙶𝙿𝚃\u2007',
    'Gemini': '𝙶𝚎𝚖𝚒𝚗𝚒\u2007\u2007',
    'Netflix': '𝙽𝚎𝚝𝚏𝚕𝚒𝚡\u2007',
    'Disney+': '𝙳𝚒𝚜𝚗𝚎𝚢+\u2007',
    'YouTube': '𝚈𝚘𝚞𝚃𝚞𝚋𝚎\u2007'
  };

  return monoMap[name] || name.padEnd(8, '\u2007');
}

// 解析 Surge 参数
function getArgs() {
  const args = {};

  if (typeof $argument === 'undefined' || !$argument) {
    return args;
  }

  const params = $argument.split('&');

  for (const param of params) {
    const separatorIndex = param.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = param.slice(0, separatorIndex).trim().toLowerCase();
    const value = param.slice(separatorIndex + 1).trim();

    if (key && value) {
      args[key] = value;
    }
  }

  return args;
}

// 获取格式化的当前时间
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
  const timeoutMs = parseInt(args.timeout, 10) || 3000;
  const alignMode = args.align_mode || args.mode || 'monospace';

  const panel = {
    title: `${baseTitle} | ${getCurrentTime()}`,
    content: '',
    icon: args.icon || 'play.tv.fill',
    'icon-color': args.color || '#D22F20'
  };

  try {
    const results = await Promise.all([
      checkChatGPT(timeoutMs),
      checkGemini(timeoutMs),
      checkNetflix(timeoutMs),
      checkDisneyPlus(timeoutMs),
      checkYouTubePremium(timeoutMs)
    ]);

    panel.content = results.map(result => {
      const alignedName = getAlignedName(result.name, alignMode);

      switch (result.status) {
        case STATUS_AVAILABLE:
          return `${alignedName}➟  ${result.region}`;

        case STATUS_NOT_AVAILABLE:
          return `${alignedName}➟  未解锁`;

        case STATUS_TIMEOUT:
          return `${alignedName}➟  超时`;

        case STATUS_ERROR:
          return `${alignedName}➟  检测失败`;

        case STATUS_COMING: {
          const tag = result.name === 'Netflix' ? '自制' : '即将';
          return `${alignedName}➟  ${tag} ${result.region}`;
        }

        default:
          return `${alignedName}➟  未知`;
      }
    }).join('\n');
  } catch (error) {
    panel.content = '检测过程发生异常';
  }

  $done(panel);
})();

// 基础网络请求封装
function request(method, url, timeoutMs, headers = REQUEST_HEADERS, body = null, maxRetries = 1) {
  return new Promise(resolve => {
    const requestOptions = {
      url,
      headers,
      timeout: timeoutMs / 1000
    };

    if (body) {
      requestOptions.body = body;
    }

    const requestMethod = method.toUpperCase();

    const attemptRequest = retryCount => {
      const callback = (error, response, responseData) => {
        if (error && retryCount < maxRetries) {
          setTimeout(() => {
            attemptRequest(retryCount + 1);
          }, 200);
          return;
        }

        resolve({
          error,
          response: response || {},
          data: responseData || ''
        });
      };

      if (requestMethod === 'POST') {
        $httpClient.post(requestOptions, callback);
      } else {
        $httpClient.get(requestOptions, callback);
      }
    };

    attemptRequest(0);
  });
}

// ChatGPT
async function checkChatGPT(timeoutMs) {
  try {
    const response = await request(
      'GET',
      'https://chatgpt.com/cdn-cgi/trace',
      timeoutMs
    );

    if (response.error || !response.data) {
      return {
        name: 'ChatGPT',
        status: STATUS_TIMEOUT
      };
    }

    const locationMatch = response.data.match(/loc=([A-Z]{2})/i);

    if (!locationMatch) {
      return {
        name: 'ChatGPT',
        status: STATUS_ERROR
      };
    }

    const region = locationMatch[1].toUpperCase();

    if (!GPT_BLOCKED_REGIONS.includes(region)) {
      return {
        name: 'ChatGPT',
        status: STATUS_AVAILABLE,
        region
      };
    }

    return {
      name: 'ChatGPT',
      status: STATUS_NOT_AVAILABLE
    };
  } catch (error) {
    return {
      name: 'ChatGPT',
      status: STATUS_ERROR
    };
  }
}

// Gemini
async function checkGemini(timeoutMs) {
  try {
    const response = await request(
      'GET',
      'https://gemini.google.com/app',
      timeoutMs
    );

    if (response.error || !response.response) {
      return {
        name: 'Gemini',
        status: STATUS_TIMEOUT
      };
    }

    const responseStatus = response.response.status || 0;
    const htmlData = response.data || '';

    if (responseStatus === 200) {
      if (
        htmlData.includes('not available') ||
        htmlData.includes('unavailable in your country')
      ) {
        return {
          name: 'Gemini',
          status: STATUS_NOT_AVAILABLE
        };
      }

      const regionMatch = htmlData.match(/,2,1,200,"([A-Z]{2,3})"/);

      if (!regionMatch || !regionMatch[1]) {
        return {
          name: 'Gemini',
          status: STATUS_ERROR
        };
      }

      const region = regionMatch[1].slice(0, 2).toUpperCase();

      return {
        name: 'Gemini',
        status: STATUS_AVAILABLE,
        region
      };
    }

    if ([403, 404, 302].includes(responseStatus)) {
      return {
        name: 'Gemini',
        status: STATUS_NOT_AVAILABLE
      };
    }

    return {
      name: 'Gemini',
      status: STATUS_ERROR
    };
  } catch (error) {
    return {
      name: 'Gemini',
      status: STATUS_ERROR
    };
  }
}

// Netflix
async function checkNetflix(timeoutMs) {
  try {
    const primaryResponse = await request(
      'GET',
      'https://www.netflix.com/title/70143836',
      timeoutMs
    );

    if (primaryResponse.error || !primaryResponse.response) {
      return {
        name: 'Netflix',
        status: STATUS_TIMEOUT
      };
    }

    const primaryStatus = primaryResponse.response.status || 0;
    const primaryHtml = primaryResponse.data || '';

    if (primaryStatus === 403) {
      return {
        name: 'Netflix',
        status: STATUS_NOT_AVAILABLE
      };
    }

    const extractRegion = htmlData => {
      let regionMatch = htmlData.match(
        /(?:"|\\")(?:requestCountryCode|countryCode)(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i
      );

      if (regionMatch && regionMatch[1]) {
        return regionMatch[1].toUpperCase();
      }

      regionMatch = htmlData.match(
        /(?:"|\\")(?:geolocation|location)(?:"|\\")\s*:\s*\{[^}]*?(?:"|\\")country(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i
      );

      if (regionMatch && regionMatch[1]) {
        return regionMatch[1].toUpperCase();
      }

      regionMatch = htmlData.match(
        /(?:"|\\")country(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i
      );

      if (regionMatch && regionMatch[1]) {
        return regionMatch[1].toUpperCase();
      }

      return null;
    };

    if (primaryStatus === 200) {
      const region = extractRegion(primaryHtml) || 'US';

      return {
        name: 'Netflix',
        status: STATUS_AVAILABLE,
        region
      };
    }

    if (primaryStatus === 404) {
      const secondaryResponse = await request(
        'GET',
        'https://www.netflix.com/title/80062035',
        timeoutMs
      );

      if (secondaryResponse.error || !secondaryResponse.response) {
        return {
          name: 'Netflix',
          status: STATUS_TIMEOUT
        };
      }

      const secondaryStatus = secondaryResponse.response.status || 0;
      const secondaryHtml = secondaryResponse.data || '';

      if (secondaryStatus === 200) {
        const region = extractRegion(secondaryHtml) || 'US';

        return {
          name: 'Netflix',
          status: STATUS_COMING,
          region
        };
      }

      return {
        name: 'Netflix',
        status: STATUS_NOT_AVAILABLE
      };
    }

    return {
      name: 'Netflix',
      status: STATUS_ERROR
    };
  } catch (error) {
    return {
      name: 'Netflix',
      status: STATUS_ERROR
    };
  }
}

// Disney+
async function checkDisneyPlus(timeoutMs) {
  try {
    const [homePageInfo, locationInfo] = await Promise.all([
      testDisneyHomePage(timeoutMs),
      getDisneyLocationInfo(timeoutMs)
    ]);

    let region = locationInfo?.countryCode
      ? locationInfo.countryCode.toUpperCase()
      : '';

    if (!region && homePageInfo?.region) {
      region = homePageInfo.region.toUpperCase();
    }

    if (
      locationInfo?.inSupportedLocation === false ||
      locationInfo?.inSupportedLocation === 'false'
    ) {
      return {
        name: 'Disney+',
        status: STATUS_COMING,
        region: region || 'UN'
      };
    }

    if (region) {
      return {
        name: 'Disney+',
        status: STATUS_AVAILABLE,
        region
      };
    }

    if (homePageInfo && homePageInfo.available === false) {
      return {
        name: 'Disney+',
        status: STATUS_NOT_AVAILABLE
      };
    }

    if (homePageInfo && homePageInfo.available === true) {
      return {
        name: 'Disney+',
        status: STATUS_AVAILABLE,
        region: homePageInfo.region || 'US'
      };
    }

    return {
      name: 'Disney+',
      status: STATUS_TIMEOUT
    };
  } catch (error) {
    return {
      name: 'Disney+',
      status: STATUS_ERROR
    };
  }
}

async function getDisneyLocationInfo(timeoutMs) {
  const requestHeaders = {
    ...REQUEST_HEADERS,
    'Authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
    'Content-Type': 'application/json'
  };

  const requestBody = JSON.stringify({
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
  });

  const response = await request(
    'POST',
    'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
    timeoutMs,
    requestHeaders,
    requestBody
  );

  if (
    response.error ||
    !response.response ||
    response.response.status !== 200
  ) {
    return null;
  }

  try {
    const responseObject = JSON.parse(response.data);
    const session = responseObject?.extensions?.sdk?.session;

    return {
      inSupportedLocation: session?.inSupportedLocation,
      countryCode: session?.location?.countryCode || ''
    };
  } catch (error) {
    return null;
  }
}

async function testDisneyHomePage(timeoutMs) {
  const response = await request(
    'GET',
    'https://www.disneyplus.com/',
    timeoutMs
  );

  if (response.error || !response.response) {
    return null;
  }

  if (response.response.status !== 200) {
    return {
      available: false
    };
  }

  const htmlData = response.data || '';

  const isNotAvailable =
    htmlData.includes('Sorry, Disney+ is not available in your region.') ||
    htmlData.includes('not available in your region') ||
    htmlData.includes('尚未在您的地區提供服務') ||
    htmlData.includes('目前無法提供') ||
    htmlData.includes('not available in your location');

  if (isNotAvailable) {
    return {
      available: false
    };
  }

  const regionMatch = htmlData.match(/Region:\s*([A-Za-z]{2})/i);

  return {
    available: true,
    region: regionMatch ? regionMatch[1].toUpperCase() : ''
  };
}

// YouTube Premium
async function checkYouTubePremium(timeoutMs) {
  try {
    const response = await request(
      'GET',
      'https://www.youtube.com/premium',
      timeoutMs
    );

    if (response.error || !response.response) {
      return {
        name: 'YouTube',
        status: STATUS_TIMEOUT
      };
    }

    const htmlData = response.data || '';

    const isNotAvailable =
      htmlData.includes('Premium is not available in your country') ||
      htmlData.includes('is not available in your country') ||
      htmlData.includes('在您所在的国家') ||
      htmlData.includes('尚未推出') ||
      htmlData.includes('not available in your location') ||
      htmlData.includes('目前無法使用');

    if (isNotAvailable) {
      return {
        name: 'YouTube',
        status: STATUS_NOT_AVAILABLE
      };
    }

    if (response.response.status === 200) {
      let region = '';

      const glMatch = htmlData.match(/"GL"\s*:\s*"([A-Za-z]{2})"/i);
      const countryMatch = htmlData.match(
        /(?:"|\\")countryCode(?:"|\\")\s*:\s*(?:"|\\")([A-Za-z]{2})(?:"|\\")/i
      );

      if (glMatch && glMatch[1]) {
        region = glMatch[1].toUpperCase();
      } else if (countryMatch && countryMatch[1]) {
        region = countryMatch[1].toUpperCase();
      } else if (htmlData.includes('www.google.cn')) {
        region = 'CN';
      }

      if (!region) {
        return {
          name: 'YouTube',
          status: STATUS_ERROR
        };
      }

      return {
        name: 'YouTube',
        status: STATUS_AVAILABLE,
        region
      };
    }

    return {
      name: 'YouTube',
      status: STATUS_ERROR
    };
  } catch (error) {
    return {
      name: 'YouTube',
      status: STATUS_ERROR
    };
  }
}

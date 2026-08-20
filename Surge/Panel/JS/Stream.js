// 基础配置
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache'
};

// 状态定义
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

// ChatGPT 不支持的地区黑名单
const GPT_BLOCKED_REGIONS = ['CN', 'HK', 'MO', 'RU', 'IR', 'KP', 'SY', 'CU', 'BY'];

// 格式化名称
function getAlignedName(name) {
  const nameMap = {
    ChatGPT: 'ChatGPT  \u2009',
    Gemini: 'Gemini      ',
    Netflix: 'Netflix       ',
    'Disney+': 'Disney+    ',
    YouTube: 'YouTube  \u2009\u2009\u2009'
  };

  return nameMap[name] || name;
}

// 解析 Surge 参数
function getArgs() {
  const args = {};

  if (typeof $argument === 'undefined' || !$argument) {
    return args;
  }

  for (const param of $argument.split('&')) {
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

// 获取当前时间
function getCurrentTime() {
  const now = new Date();

  return [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join(':');
}

// 创建检测结果
function createResult(name, status, region) {
  const result = {
    name,
    status
  };

  if (region) {
    result.region = region;
  }

  return result;
}

// 格式化检测结果
function formatResult(result) {
  const alignedName = getAlignedName(result.name);

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
}

// 主入口
(async function () {
  const args = getArgs();

  const baseTitle = args.title || '网络解锁检测';

  // 脚本检测超时
  const detectionTimeoutSeconds =
    parseInt(args.detection_timeout, 10) || 3;

  const detectionTimeoutMs = detectionTimeoutSeconds * 1000;

  const panel = {
    title: `${baseTitle} | ${getCurrentTime()}`,
    content: '',
    icon: args.icon || 'play.tv.fill',
    'icon-color': args.color || '#D22F20'
  };

  try {
    const results = await Promise.all([
      checkChatGPT(detectionTimeoutMs),
      checkGemini(detectionTimeoutMs),
      checkNetflix(detectionTimeoutMs),
      checkDisneyPlus(detectionTimeoutMs),
      checkYouTubePremium(detectionTimeoutMs)
    ]);

    panel.content = results.map(formatResult).join('\n');
  } catch (error) {
    panel.content = '检测过程发生异常';
  }

  $done(panel);
})();

// 基础网络请求封装
function request(
  method,
  url,
  timeoutMs,
  headers = REQUEST_HEADERS,
  body = null,
  maxRetries = 1
) {
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
      return createResult('ChatGPT', STATUS_TIMEOUT);
    }

    const locationMatch = response.data.match(/loc=([A-Z]{2})/i);

    if (!locationMatch) {
      return createResult('ChatGPT', STATUS_ERROR);
    }

    const region = locationMatch[1].toUpperCase();

    if (!GPT_BLOCKED_REGIONS.includes(region)) {
      return createResult('ChatGPT', STATUS_AVAILABLE, region);
    }

    return createResult('ChatGPT', STATUS_NOT_AVAILABLE);
  } catch (error) {
    return createResult('ChatGPT', STATUS_ERROR);
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
      return createResult('Gemini', STATUS_TIMEOUT);
    }

    const responseStatus = response.response.status || 0;
    const htmlData = response.data || '';

    if (responseStatus === 200) {
      if (
        htmlData.includes('not available') ||
        htmlData.includes('unavailable in your country')
      ) {
        return createResult('Gemini', STATUS_NOT_AVAILABLE);
      }

      const regionMatch = htmlData.match(/,2,1,200,"([A-Z]{2,3})"/);

      if (!regionMatch || !regionMatch[1]) {
        return createResult('Gemini', STATUS_ERROR);
      }

      const region = regionMatch[1].slice(0, 2).toUpperCase();

      return createResult('Gemini', STATUS_AVAILABLE, region);
    }

    if ([403, 404, 302].includes(responseStatus)) {
      return createResult('Gemini', STATUS_NOT_AVAILABLE);
    }

    return createResult('Gemini', STATUS_ERROR);
  } catch (error) {
    return createResult('Gemini', STATUS_ERROR);
  }
}

// 提取 Netflix 地区
function extractNetflixRegion(htmlData) {
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
      return createResult('Netflix', STATUS_TIMEOUT);
    }

    const primaryStatus = primaryResponse.response.status || 0;
    const primaryHtml = primaryResponse.data || '';

    if (primaryStatus === 403) {
      return createResult('Netflix', STATUS_NOT_AVAILABLE);
    }

    if (primaryStatus === 200) {
      const region = extractNetflixRegion(primaryHtml) || 'US';

      return createResult('Netflix', STATUS_AVAILABLE, region);
    }

    if (primaryStatus === 404) {
      const secondaryResponse = await request(
        'GET',
        'https://www.netflix.com/title/80062035',
        timeoutMs
      );

      if (secondaryResponse.error || !secondaryResponse.response) {
        return createResult('Netflix', STATUS_TIMEOUT);
      }

      const secondaryStatus = secondaryResponse.response.status || 0;
      const secondaryHtml = secondaryResponse.data || '';

      if (secondaryStatus === 200) {
        const region = extractNetflixRegion(secondaryHtml) || 'US';

        return createResult('Netflix', STATUS_COMING, region);
      }

      return createResult('Netflix', STATUS_NOT_AVAILABLE);
    }

    return createResult('Netflix', STATUS_ERROR);
  } catch (error) {
    return createResult('Netflix', STATUS_ERROR);
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
      return createResult('Disney+', STATUS_COMING, region || 'UN');
    }

    if (region) {
      return createResult('Disney+', STATUS_AVAILABLE, region);
    }

    if (homePageInfo && homePageInfo.available === false) {
      return createResult('Disney+', STATUS_NOT_AVAILABLE);
    }

    if (homePageInfo && homePageInfo.available === true) {
      return createResult(
        'Disney+',
        STATUS_AVAILABLE,
        homePageInfo.region || 'US'
      );
    }

    return createResult('Disney+', STATUS_TIMEOUT);
  } catch (error) {
    return createResult('Disney+', STATUS_ERROR);
  }
}

// 获取 Disney+ 地区信息
async function getDisneyLocationInfo(timeoutMs) {
  const requestHeaders = {
    ...REQUEST_HEADERS,
    Authorization:
      'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
    'Content-Type': 'application/json'
  };

  const requestBody = JSON.stringify({
    query:
      'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
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

// 检测 Disney+ 首页
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
      return createResult('YouTube', STATUS_TIMEOUT);
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
      return createResult('YouTube', STATUS_NOT_AVAILABLE);
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
        return createResult('YouTube', STATUS_ERROR);
      }

      return createResult('YouTube', STATUS_AVAILABLE, region);
    }

    return createResult('YouTube', STATUS_ERROR);
  } catch (error) {
    return createResult('YouTube', STATUS_ERROR);
  }
}

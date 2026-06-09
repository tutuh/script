// 1. 安全解析参数
let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK_ENABLED = arg.MASK == '1';

// 2. 封装带超时控制的原生请求
function request(url, timeoutSec = 5) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutSec * 1000);
    $httpClient.get({ url, timeout: timeoutSec }, (error, response, data) => {
      clearTimeout(timer);
      if (error || !data) {
        resolve(null);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      }
    });
  });
}

// 封装 Surge HTTP API 调用
function getSurgeAPI(path) {
  return new Promise((resolve) => {
    if (typeof $httpAPI === 'undefined') return resolve(null);
    $httpAPI('GET', path, null, (res) => resolve(res));
  });
}

// 3. 主程序
!(async () => {
  let content = '';

  // --- 本地网络信息 ---
  if (arg.SSID == '1' && $network?.wifi?.ssid) {
    content += `SSID: ${$network.wifi.ssid}\n`;
  }
  if (arg.LAN == '1' && $network?.v4?.primaryAddress) {
    content += `LAN: ${$network.v4.primaryAddress}\n`;
  }
  if (content !== '') content += '\n';

  // --- 并发获取国内直连 & 国外落地 ---
  // 国内使用平安接口，国外使用 ip-api
  const [directData, proxyData, recentReqs] = await Promise.all([
    request('https://rmb.zssq.com.cn/itam/mas/linden/ip/request'),
    request('http://ip-api.com/json?lang=zh-CN'),
    getSurgeAPI('/v1/requests/recent')
  ]);

  // 解析国内信息
  let CN_IP = directData?.data?.ip || '-';
  let CN_LOC = `${directData?.data?.country || ''} ${directData?.data?.region || ''} ${directData?.data?.city || ''}`.trim().replace(/中国\s*/, '');
  let CN_ISP = directData?.data?.isp || '-';

  content += `[国内节点]\n`;
  content += `IP: ${maskIP(CN_IP)}\n`;
  if (CN_LOC) content += `位置: ${CN_LOC}\n`;
  content += `运营商: ${CN_ISP}\n\n`;

  // 解析落地信息
  let PROXY_IP = proxyData?.query || '-';
  let PROXY_LOC = `${proxyData?.country || ''} ${proxyData?.regionName || ''} ${proxyData?.city || ''}`.trim();
  let PROXY_ISP = proxyData?.isp || proxyData?.org || '-';
  let PROXY_ASN = proxyData?.as || '-';
  let PROXY_ORG = proxyData?.org || '-';
  let PROXY_POLICY = '';

  // --- 获取入口 IP 及策略 ---
  let ENTRANCE_IP = '';
  if (recentReqs && recentReqs.requests) {
    // 找出检测国外 IP 的请求，提取其代理策略和入口 IP
    const req = recentReqs.requests.find(i => /ip-api\.com|ipinfo\.io|ip\.sb/.test(i.URL));
    if (req) {
      PROXY_POLICY = req.policyName || '';
      if (req.remoteAddress && req.remoteAddress.includes('(Proxy)')) {
        ENTRANCE_IP = req.remoteAddress.replace(/\s*\(Proxy\)\s*/, '');
      }
    }
  }

  // --- 处理入口双重解析逻辑 ---
  if (ENTRANCE_IP && ENTRANCE_IP !== PROXY_IP) {
    const entranceDelay = parseFloat(arg.ENTRANCE_DELAY || 0);
    if (entranceDelay > 0) await new Promise(r => setTimeout(r, entranceDelay * 1000));

    // 使用国内和国外两个接口并发查询入口 IP
    const [entDirect, entProxy] = await Promise.all([
      request(`https://rmb.zssq.com.cn/itam/mas/linden/ip/request?ip=${ENTRANCE_IP}`),
      request(`http://ip-api.com/json/${ENTRANCE_IP}?lang=zh-CN`)
    ]);

    content += `[入口节点]\n`;
    content += `IP: ${maskIP(ENTRANCE_IP)}\n`;
    
    let hasInfo1 = false;
    // 位置 1 (国内接口) - 只有当判定为国内 IP 时才显示，防止国内接口对国外 IP 解析乱码
    if (entDirect?.data?.country?.includes('中国')) {
      hasInfo1 = true;
      const loc1 = `${entDirect.data.country || ''} ${entDirect.data.region || ''} ${entDirect.data.city || ''}`.trim().replace(/中国\s*/, '');
      if (loc1) content += `位置¹: ${loc1}\n`;
      content += `运营商¹: ${entDirect.data.isp || '-'}\n`;
    }

    // 位置 2 (国外接口)
    if (entProxy?.status === 'success') {
      const suffix = hasInfo1 ? '²' : ''; // 如果有位置 1，这里就标 ²
      const loc2 = `${entProxy.country || ''} ${entProxy.regionName || ''} ${entProxy.city || ''}`.trim();
      if (loc2) content += `位置${suffix}: ${loc2}\n`;
      content += `运营商${suffix}: ${entProxy.isp || entProxy.org || '-'}\n`;
    }
    content += '\n';
  }

  // --- 拼接落地节点信息 ---
  content += `[落地节点]\n`;
  if (PROXY_POLICY && PROXY_POLICY !== 'DIRECT') {
    content += `策略: ${maskAddr(PROXY_POLICY)}\n`;
  }
  content += `IP: ${maskIP(PROXY_IP)}\n`;
  if (PROXY_LOC) content += `位置: ${PROXY_LOC}\n`;
  content += `运营商: ${PROXY_ISP}\n`;
  if (arg.ASN == '1' && PROXY_ASN !== '-') content += `ASN: ${PROXY_ASN}\n`;
  if (arg.ORG == '1' && PROXY_ORG !== '-') content += `组织: ${PROXY_ORG}\n`;

  // --- 拼接执行时间 ---
  const timeStr = new Date().toTimeString().split(' ')[0];
  content += `\n执行时间: ${timeStr}`;

  // 4. 返回渲染结果
  $done({
    title: PROXY_POLICY ? `代理策略: ${maskAddr(PROXY_POLICY)}` : (arg.PANEL_NAME || '网络信息 𝕏'),
    content: content,
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });

})().catch(e => {
  console.log('❌ 网络信息脚本异常: ' + e);
  $done({
    title: '网络信息 𝕏',
    content: '获取网络信息失败\n请检查网络连接',
    icon: 'exclamationmark.triangle.fill',
    'icon-color': '#FF3B30'
  });
});

// --- 辅助打码函数 ---
function maskIP(ip) {
  if (!ip || !MASK_ENABLED) return ip;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return [...parts.slice(0, 2), '*', '*'].join('.');
  } else {
    const parts = ip.split(':');
    return [...parts.slice(0, 3), '*', '*', '*', '*'].join(':');
  }
}

function maskAddr(addr) {
  if (!addr || !MASK_ENABLED) return addr;
  const third = Math.floor(addr.length / 3);
  if (third > 0) {
    return addr.substring(0, third) + '*'.repeat(third) + addr.substring(2 * third);
  }
  return addr;
}

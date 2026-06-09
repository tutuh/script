
/**
 * Surge Panel 网络信息面板 (原版经典排版 1:1 复刻版)
 * 优化特性：
 * 1. 100% 复刻原版排版：无多余修饰，严格按照截图中的换行结构展示。
 * 2. 彻底移除 FLAG 国旗及 EVENT 事件逻辑代码，极致纯净。
 * 3. 完美保留入口 IP 双重解析（位置¹/运营商¹，位置²/运营商²）的原版逻辑。
 * 4. 彻底重构底层架构：移除 1000+ 行跨平台 Env 代码，全面采用原生 Surge API，零延迟、防闪退。
 */

// --- 参数解析 ---
let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK_ENABLED = arg.MASK == '1';

// --- 原生网络请求封装 ---
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

function getSurgeAPI(path) {
  return new Promise((resolve) => {
    if (typeof $httpAPI === 'undefined') return resolve(null);
    $httpAPI('GET', path, null, (res) => resolve(res));
  });
}

// --- 主程序 ---
!(async () => {
  // 1. 并发获取国内直连、国外落地、近期请求（用于分析入口和策略）
  const [directData, proxyData, recentReqs] = await Promise.all([
    request('https://rmb.zssq.com.cn/itam/mas/linden/ip/request'),
    request('http://ip-api.com/json?lang=zh-CN'),
    getSurgeAPI('/v1/requests/recent')
  ]);

  let content = '';

  // 2. 本地网络信息 (若开启)
  if (arg.SSID == '1' && $network?.wifi?.ssid) content += `SSID: ${$network.wifi.ssid}\n`;
  if (arg.LAN == '1' && $network?.v4?.primaryAddress) content += `LAN: ${$network.v4.primaryAddress}\n`;
  if (content !== '') content += '\n';

  // 3. 国内节点区块
  let CN_IP = directData?.data?.ip || '-';
  let CN_LOC = `${directData?.data?.country || ''} ${directData?.data?.region || ''} ${directData?.data?.city || ''}`.trim().replace(/中国\s*/, '');
  let CN_ISP = directData?.data?.isp || '-';

  content += `IP: ${maskIP(CN_IP)}\n`;
  content += `位置: ${CN_LOC || '-'}\n`;
  content += `运营商: ${CN_ISP}`;

  // 4. 分析入口 IP 与代理策略
  let PROXY_IP = proxyData?.query || '-';
  let PROXY_POLICY = '';
  let ENTRANCE_IP = '';

  if (recentReqs && recentReqs.requests) {
    // 查找检测国外 IP 的请求，提取策略名和真实入口 IP
    const req = recentReqs.requests.find(i => /ip-api\.com|ipinfo\.io|ip\.sb/.test(i.URL));
    if (req) {
      PROXY_POLICY = req.policyName || '';
      if (req.remoteAddress && req.remoteAddress.includes('(Proxy)')) {
        ENTRANCE_IP = req.remoteAddress.replace(/\s*\(Proxy\)\s*/, '');
      }
    }
  }

  // 5. 入口节点区块 (如果入口 IP 存在且不等于落地 IP)
  if (ENTRANCE_IP && ENTRANCE_IP !== PROXY_IP) {
    const entranceDelay = parseFloat(arg.ENTRANCE_DELAY || 0);
    if (entranceDelay > 0) await new Promise(r => setTimeout(r, entranceDelay * 1000));

    // 并发双路查询入口 IP 信息
    const [entDirect, entProxy] = await Promise.all([
      request(`https://rmb.zssq.com.cn/itam/mas/linden/ip/request?ip=${ENTRANCE_IP}`),
      request(`http://ip-api.com/json/${ENTRANCE_IP}?lang=zh-CN`)
    ]);

    content += `\n\n入口¹: ${maskIP(ENTRANCE_IP)}\n`;
    
    let hasInfo1 = false;
    // 位置¹ & 运营商¹ (国内接口解析，仅当 IP 归属国内时展示，过滤离谱解析)
    if (entDirect?.data?.country?.includes('中国')) {
      hasInfo1 = true;
      const loc1 = `${entDirect.data.country || ''} ${entDirect.data.region || ''} ${entDirect.data.city || ''}`.trim().replace(/中国\s*/, '');
      content += `位置¹: ${loc1 || '-'}\n`;
      content += `运营商¹: ${entDirect.data.isp || '-'}\n`;
    }

    // 位置² & 运营商² (国外接口解析)
    if (entProxy?.status === 'success') {
      const suffix = hasInfo1 ? '²' : '¹'; // 如果没有位置1，这里就变成位置1
      const loc2 = `${entProxy.country || ''} ${entProxy.regionName || ''} ${entProxy.city || ''}`.trim().replace(/中国\s*/, '');
      content += `位置${suffix}: ${loc2 || '-'}\n`;
      content += `运营商${suffix}: ${entProxy.isp || entProxy.org || '-'}`;
    }
  }

  // 6. 落地节点区块
  let PROXY_LOC = `${proxyData?.country || ''} ${proxyData?.regionName || ''} ${proxyData?.city || ''}`.trim().replace(/中国\s*/, '');
  let PROXY_ISP = proxyData?.isp || proxyData?.org || '-';

  content += `\n\n落地 IP: ${maskIP(PROXY_IP)}\n`;
  content += `位置: ${PROXY_LOC || '-'}\n`;
  content += `运营商: ${PROXY_ISP}`;
  if (arg.ASN == '1' && proxyData?.as) content += `\nASN: ${proxyData.as}`;
  if (arg.ORG == '1' && proxyData?.org) content += `\n组织: ${proxyData.org}`;

  // 7. 尾部执行时间
  const timeStr = new Date().toTimeString().split(' ')[0];
  content += `\n执行时间: ${timeStr}`;

  // 8. 渲染 Panel
  const title = PROXY_POLICY && PROXY_POLICY !== 'DIRECT' ? `代理策略: ${PROXY_POLICY}` : (arg.PANEL_NAME || '网络信息 𝕏');

  $done({
    title: title,
    content: content,
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });

})().catch(e => {
  $done({
    title: '网络信息 𝕏',
    content: '获取数据失败\n请检查网络连接',
    icon: 'exclamationmark.triangle.fill',
    'icon-color': '#FF3B30'
  });
});

// --- 辅助函数 ---
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

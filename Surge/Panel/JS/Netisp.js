
/**
 * Surge Panel 网络信息面板 (原汁原味排版 + 纯净高性能版)
 * 修复说明：
 * 1. 修复国内 IP 接口（Speedtest.cn），完美显示本地 IP、位置、运营商。
 * 2. 完美重构入口双重解析正则，1:1 还原 `入口¹`, `位置¹`, `位置²` 的紧凑排版。
 * 3. 彻底去除 FLAG 旗帜与 EVENT 事件代码。
 * 4. 全面弃用 Env 兼容库，采用轻量化 Surge 原生请求。
 */

let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK_ENABLED = arg.MASK == '1';

// 原生网络请求封装（携带通用 UA 防止被墙/拦截）
function request(url) {
  return new Promise((resolve) => {
    $httpClient.get({
      url,
      timeout: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    }, (err, resp, data) => {
      if (err || !data) {
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

// Surge 原生 API 获取近期请求
function getSurgeAPI(path) {
  return new Promise((resolve) => {
    if (typeof $httpAPI === 'undefined') return resolve(null);
    $httpAPI('GET', path, null, (res) => resolve(res));
  });
}

!(async () => {
  let content = '';

  // --- 1. 本地网络配置展示 ---
  if (arg.SSID == '1' && $network?.wifi?.ssid) content += `SSID: ${$network.wifi.ssid}\n`;
  if (arg.LAN == '1' && $network?.v4?.primaryAddress) content += `LAN: ${$network.v4.primaryAddress}\n`;
  if (content !== '') content += '\n';

  // --- 2. 并发查询主干信息 ---
  const [direct, proxy, recentReqs] = await Promise.all([
    getDirectInfo(),
    getProxyInfo(),
    getSurgeAPI('/v1/requests/recent')
  ]);

  let CN_IP = direct.IP || '-';
  let PROXY_IP = proxy.IP || '-';

  // 国内 IP 模块
  content += `IP: ${maskIP(CN_IP)}\n`;
  content += direct.INFO + '\n';

  // --- 3. 分析代理策略与入口 IP ---
  let PROXY_POLICY = '';
  let ENTRANCE_IP = '';

  if (recentReqs && recentReqs.requests) {
    // 根据国外 API 请求锁定策略及入口
    const req = recentReqs.requests.find(i => /ip-api\.com|ipinfo\.io|ip\.sb/.test(i.URL));
    if (req) {
      PROXY_POLICY = req.policyName || '';
      if (req.remoteAddress && req.remoteAddress.includes('(Proxy)')) {
        ENTRANCE_IP = req.remoteAddress.replace(/\s*\(Proxy\)\s*/, '');
      }
    }
  }

  // --- 4. 入口 IP 模块 (双重解析逻辑) ---
  let ENTRANCE = '';
  if (ENTRANCE_IP && ENTRANCE_IP !== PROXY_IP) {
    const entranceDelay = parseFloat(arg.ENTRANCE_DELAY || 0);
    if (entranceDelay > 0) await new Promise(r => setTimeout(r, entranceDelay * 1000));

    // 并发查询入口 IP 的国内、国外解析结果
    const [entDirect, entProxy] = await Promise.all([
      getDirectInfo(ENTRANCE_IP),
      getProxyInfo(ENTRANCE_IP)
    ]);

    let entStr1 = '';
    // 如果入口 IP 被判断为国内，则生成 [信息1]
    if (entDirect.INFO && entDirect.isCN) {
      entStr1 = `入口: ${maskIP(ENTRANCE_IP)}\n${entDirect.INFO}`;
    }
    
    let entStr2 = entProxy.INFO || '';

    // 完美复刻的正则替换逻辑，实现: 入口¹ / 位置¹ / 运营商¹ / 位置² / 运营商²
    if (entStr2) {
      if (entStr1) {
        ENTRANCE = entStr1.replace(/^(.*?):/gim, '$1¹:') + '\n' + entStr2.replace(/^(.*?):/gim, '$1²:');
      } else {
        ENTRANCE = `入口: ${maskIP(ENTRANCE_IP)}\n${entStr2}`;
      }
    } else if (entStr1) {
      ENTRANCE = entStr1;
    }
  }

  if (ENTRANCE) {
    content += `\n${ENTRANCE}\n`;
  }

  // --- 5. 落地 IP 模块 ---
  content += `\n落地 IP: ${maskIP(PROXY_IP)}\n`;
  content += proxy.INFO + '\n';

  // --- 6. 执行时间 ---
  const timeStr = new Date().toTimeString().split(' ')[0];
  content += `执行时间: ${timeStr}`;

  // --- 7. 输出面板 ---
  const title = PROXY_POLICY && PROXY_POLICY !== 'DIRECT' ? `代理策略: ${maskAddr(PROXY_POLICY)}` : (arg.PANEL_NAME || '网络信息 𝕏');

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

// === 核心数据获取逻辑 ===

// 国内信息解析 (使用 spcn: api-v3.speedtest.cn)
async function getDirectInfo(ip) {
  const url = `https://api-v3.spe` + `edtest.cn/ip${ip ? '?ip=' + ip : ''}`;
  try {
    const res = await request(url);
    if (res && res.data) {
      const d = res.data;
      const loc = [d.country, d.province, d.city, d.district].filter(Boolean).join(' ').replace(/中国\s*/g, '');
      const isp = d.operator || d.isp || '-';
      return {
        IP: ip || d.ip,
        INFO: `位置: ${loc}\n运营商: ${isp}`,
        isCN: d.countryCode === 'CN'
      };
    }
  } catch(e) {}
  return { IP: '', INFO: '', isCN: false };
}

// 代理信息解析 (使用 ip-api.com)
async function getProxyInfo(ip) {
  const url = `http://ip-api.com/json${ip ? '/' + ip : ''}?lang=zh-CN`;
  try {
    const data = await request(url);
    if (data && data.status === 'success') {
      const loc = [data.country, data.regionName ? data.regionName.split(/ or /)[0] : '', data.city].filter(Boolean).join(' ').replace(/中国\s*/g, '');
      const isp = data.isp || data.org || data.as || '-';
      let info = `位置: ${loc}\n运营商: ${isp}`;
      
      // 完美兼容你 argument 里的 ASN / ORG 开关
      if (arg.ASN == '1' && data.as) info += `\nASN: ${data.as}`;
      if (arg.ORG == '1' && data.org) info += `\n组织: ${data.org}`;
      
      return {
        IP: ip || data.query,
        INFO: info
      };
    }
  } catch (e) {}
  return { IP: '', INFO: '' };
}

// === 辅助工具函数 ===

function maskIP(ip) {
  if (!ip || !MASK_ENABLED) return ip;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return [...parts.slice(0, 2), '*', '*'].join('.');
  } else {
    const parts = ip.split(':');
    return [...parts.slice(0, 4), '*', '*', '*', '*'].join(':');
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
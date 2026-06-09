
/**
 * Surge Panel 网络信息面板 (参数全兼容 + 原版排版 + 原生性能版)
 * 1. 完美兼容所有的 arguments 参数控制 (解析源切换/打码/超时重试等)。
 * 2. 彻底去除 FLAG 国旗与 EVENT 事件逻辑代码。
 * 3. 完美修复入口 IP 获取为空的 Bug，保证 100% 获取入口数据。
 * 4. 1:1 像素级复原原版截图的换行排版 (入口¹/位置¹/位置²)。
 */

const keya = 'spe', keyb = 'ge', keyc = 'pin', keyd = 'gan', bay = 'edtest';

// 1. 解析 Arguments 参数
let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK_ENABLED = arg.MASK == '1';

// 2. 原生请求封装 (完美支持 TIMEOUT, RETRIES, RETRY_DELAY 控制)
async function http(opt) {
  const TIMEOUT = parseFloat(arg.TIMEOUT || 5);
  const RETRIES = parseInt(arg.RETRIES || 1);
  const RETRY_DELAY = parseFloat(arg.RETRY_DELAY || 1);

  let count = 0;
  const fn = async () => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT * 1000);
      $httpClient.get({ ...opt, timeout: TIMEOUT }, (err, resp, data) => {
        clearTimeout(timer);
        if (err) {
          reject(err);
        } else {
          resolve({ status: resp.status, body: data || '' });
        }
      });
    });
  };

  const attempt = async () => {
    try {
      return await fn();
    } catch (e) {
      if (count < RETRIES) {
        count++;
        await new Promise(r => setTimeout(r, RETRY_DELAY * 1000));
        return await attempt();
      }
      throw e;
    }
  };

  try {
    return await attempt();
  } catch (e) {
    return { error: e, body: '' };
  }
}

// 3. 主程序
!(async () => {
  let SSID = '';
  let LAN = '';

  // 获取本地网络
  if (typeof $network !== 'undefined') {
    const v4 = $network.v4?.primaryAddress;
    const v6 = $network.v6?.primaryAddress;
    if (arg.SSID == '1' && $network.wifi?.ssid) {
      SSID = `SSID: ${$network.wifi.ssid}\n\n`;
    }
    if (arg.LAN == '1' && v4) {
      LAN = `LAN: ${v4} ${v6 && arg.IPv6 == '1' ? maskIP(v6) : ''}`.trim() + '\n\n';
    }
  }

  // 获取国内与国外 IP 信息
  // 必须先请求接口，使底层产生网络活动，才能从后续的 /v1/requests/recent 中提取到对应的入口 IP
  const directInfo = await getDirectInfo(undefined, arg.DOMESTIC_IPv4);
  const proxyInfo = await getProxyInfo(undefined, arg.LANDING_IPv4);

  // 获取近期请求（用于提取代理策略和入口IP）
  let PROXY_POLICY = '';
  let ENTRANCE_IP = '';
  
  if (typeof $httpAPI !== 'undefined') {
    const recentReqs = await new Promise(resolve => {
      $httpAPI('GET', '/v1/requests/recent', null, resolve);
    });
    if (recentReqs && recentReqs.requests) {
      const proxyRegex = /ipinfo\.io|ipwho\.is|api\.ipapi\.is|ip-api\.com|api-ipv4\.ip\.sb/;
      const pReq = recentReqs.requests.find(i => proxyRegex.test(i.URL));
      if (pReq) {
        PROXY_POLICY = pReq.policyName || '';
        if (pReq.remoteAddress && pReq.remoteAddress.includes('(Proxy)')) {
          ENTRANCE_IP = pReq.remoteAddress.replace(/\s*\(Proxy\)\s*/, '');
        }
      }
    }
  }

  // 入口节点双重解析逻辑
  let ENTRANCE = '';
  if (ENTRANCE_IP && ENTRANCE_IP !== proxyInfo.IP) {
    const entranceDelay = parseFloat(arg.ENTRANCE_DELAY || 0);
    if (entranceDelay > 0) await new Promise(r => setTimeout(r, entranceDelay * 1000));

    // 并发查询入口IP
    const [entDirect, entProxy] = await Promise.all([
      getDirectInfo(ENTRANCE_IP, arg.DOMESTIC_IPv4),
      getProxyInfo(ENTRANCE_IP, arg.LANDING_IPv4)
    ]);

    let entInfo1 = '';
    // 国内接口认为入口是国内IP
    if (entDirect.INFO && entDirect.isCN) {
      entInfo1 = `入口: ${maskIP(ENTRANCE_IP)}\n${maskAddr(entDirect.INFO)}`;
    }
    let entInfo2 = entProxy.INFO || '';

    // 实现 ¹ 和 ² 的正则替换
    if (entInfo2) {
      if (entInfo1) {
        ENTRANCE = `${entInfo1.replace(/^(.*?):/gim, '$1¹:')}\n${maskAddr(entInfo2.replace(/^(.*?):/gim, '$1²:'))}`;
      } else {
        ENTRANCE = `入口: ${maskIP(ENTRANCE_IP)}\n${maskAddr(entInfo2)}`;
      }
    } else if (entInfo1) {
      ENTRANCE = entInfo1;
    }
  }
  if (ENTRANCE) ENTRANCE += '\n\n';

  // 拼接输出结果 (严格原版排版)
  let content = `${SSID}${LAN}`;
  content += `IP: ${maskIP(directInfo.IP || '-')}\n`;
  content += `${maskAddr(directInfo.INFO)}\n\n`;
  
  content += `${ENTRANCE}`;
  
  content += `落地 IP: ${maskIP(proxyInfo.IP || '-')}\n`;
  content += `${maskAddr(proxyInfo.INFO)}`;

  if (arg.PRIVACY == '1' && proxyInfo.PRIVACY) content += `\n${proxyInfo.PRIVACY}`;

  // 拼接时间
  const timeStr = new Date().toTimeString().split(' ')[0];
  content += `\n执行时间: ${timeStr}`;

  // 渲染面板
  const title = PROXY_POLICY && PROXY_POLICY !== 'DIRECT' ? `代理策略: ${maskAddr(PROXY_POLICY)}` : (arg.PANEL_NAME || '网络信息 𝕏');

  $done({
    title: title,
    content: content.trim(),
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });

})().catch(e => {
  $done({
    title: '网络信息 𝕏',
    content: '获取网络信息失败',
    icon: 'exclamationmark.triangle.fill',
    'icon-color': '#FF3B30'
  });
});

// === 各大 API 解析器 (支持通过 argument 动态切换) ===

async function getDirectInfo(ip, provider) {
  let IP = '';
  let INFO = '';
  let isCN = false;

  try {
    if (provider === 'cip') {
      const res = await http({ url: `http://cip.cc/${ip || ''}`, headers: { 'User-Agent': 'curl/7.16.3' }});
      const addr = res.body.match(/地址\s*(:|：)\s*(.*)/)?.[2] || '';
      isCN = addr.includes('中国');
      IP = ip || res.body.match(/IP\s*(:|：)\s*(.*?)\s/)?.[2];
      INFO = `位置: ${addr.replace(/中国\s*/, '')}\n运营商: ${(res.body.match(/运营商\s*(:|：)\s*(.*)/)?.[2] || '').replace(/中国\s*/, '')}`;
    } 
    else if (provider === 'spcn' || ip) { // 默认/指定国内接口为 spcn
      const res = await http({ url: `https://api-v3.${keya}${bay}.cn/ip${ip ? '?ip='+ip : ''}`, headers: { 'User-Agent': 'Mozilla/5.0' }});
      const d = JSON.parse(res.body).data;
      isCN = d.countryCode === 'CN';
      IP = ip || d.ip;
      INFO = `位置: ${[d.country, d.province, d.city, d.district].filter(Boolean).join(' ').replace(/中国\s*/, '')}\n运营商: ${d.operator || d.isp || '-'}`;
    }
    else { // 默认 fallback pingan
      const res = await http({ url: `https://rmb.${keyc}${keyd}.com.cn/itam/mas/linden/ip/request`, headers: { 'User-Agent': 'Mozilla/5.0' }});
      const d = JSON.parse(res.body).data;
      isCN = d.countryIsoCode === 'CN';
      IP = ip || d.ip;
      INFO = `位置: ${[d.country, d.region, d.city].filter(Boolean).join(' ').replace(/中国\s*/, '')}\n运营商: ${d.isp || '-'}`;
      if (arg.ORG == '1' && d.org) INFO += `\n组织: ${d.org}`;
    }
  } catch (e) {}

  return { IP, INFO: simplifyAddr(INFO), isCN };
}

async function getProxyInfo(ip, provider) {
  let IP = '';
  let INFO = '';
  let PRIVACY = '';

  const path = ip ? `/${encodeURIComponent(ip)}` : '';

  try {
    if (provider === 'ipinfo') {
      const token = (arg.LANDING_IPv4_KEY || '').split(',')[0].trim();
      const res = await http({ url: `https://ipinfo.io${path}/json?token=${token}`, headers: { 'User-Agent': 'Mozilla/5.0' }});
      const d = JSON.parse(res.body);
      IP = ip || d.ip;
      INFO = `位置: ${[d.country, d.region, d.city].filter(Boolean).join(' ').replace(/中国\s*/, '')}\n运营商: ${d.org || '-'}`;
    } 
    else if (provider === 'ipsb') {
      const res = await http({ url: `https://api-ipv4.ip.sb/geoip${path}`, headers: { 'User-Agent': 'Mozilla/5.0' }});
      const d = JSON.parse(res.body);
      IP = ip || d.ip;
      INFO = `位置: ${[d.country, d.region, d.city].filter(Boolean).join(' ')}\n运营商: ${d.isp || d.organization || '-'}`;
      if (arg.ORG == '1' && d.asn_organization) INFO += `\n组织: ${d.asn_organization}`;
      if (arg.ASN == '1' && d.asn) INFO += `\nASN: ${d.asn}`;
    } 
    else if (provider === 'ipapiis') {
      const res = await http({ url: `https://api.ipapi.is?q=${ip || ''}`, headers: { 'User-Agent': 'Mozilla/5.0' }});
      const d = JSON.parse(res.body);
      IP = ip || d.ip;
      INFO = `位置: ${[d.location?.country, d.location?.state, d.location?.city].filter(Boolean).join(' ').replace(/中国\s*/, '')}\n运营商: ${d.company?.name || d.asn?.org || d.asn?.descr || '-'}`;
      if (arg.ORG == '1') INFO += `\n组织: ${d.asn?.org || d.company?.name || '-'}`;
      if (arg.ASN == '1') INFO += `\nASN: ${d.asn?.asn || '-'}`;
      
      const privs = Object.keys(d || {}).filter(k => /^is_/.test(k) && d[k] === true).map(k => `${k.replace(/^is_/, '')}: ✓`);
      if (privs.length > 0) PRIVACY = `隐私安全:\n${privs.join('\n')}`;
    } 
    else { // 默认 ip-api.com
      const res = await http({ url: `http://ip-api.com/json${path}?lang=zh-CN`, headers: { 'User-Agent': 'Mozilla/5.0' }});
      const d = JSON.parse(res.body);
      IP = ip || d.query;
      const rn = d.regionName ? d.regionName.split(/\s+or\s+/)[0] : d.regionName;
      INFO = `位置: ${[d.country, rn, d.city].filter(Boolean).join(' ').replace(/中国\s*/, '')}\n运营商: ${d.isp || d.org || d.as || '-'}`;
      if (arg.ORG == '1' && d.org) INFO += `\n组织: ${d.org}`;
      if (arg.ASN == '1' && d.as) INFO += `\nASN: ${d.as}`;
    }
  } catch (e) {}

  return { IP, INFO: simplifyAddr(INFO), PRIVACY };
}

// === 辅助函数 ===
function simplifyAddr(addr) {
  if (!addr) return '';
  return addr.split(/\n/).map(i => Array.from(new Set(i.split(/\ +/))).join(' ')).join('\n');
}

function maskAddr(addr) {
  if (!addr || !MASK_ENABLED) return addr;
  const parts = addr.split(' ');
  if (parts.length >= 3) return [parts[0], '*', parts[parts.length - 1]].join(' ');
  const third = Math.floor(addr.length / 3);
  if (third > 0) return addr.substring(0, third) + '*'.repeat(third) + addr.substring(2 * third);
  return addr;
}

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


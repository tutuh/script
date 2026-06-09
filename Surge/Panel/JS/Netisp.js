/**
 * By @xream 
 * Surge Panel 网络信息面板 (精简排版版)
 * 优化说明：
 * 1. 彻底移除 FLAG 国旗逻辑，界面更简洁。
 * 2. 移除所有 EVENT 事件相关参数及逻辑。
 * 3. 优化排版：IP、位置、ASN/ORG 等信息强制换行，避免拥挤。
 * 4. 高性能 Surge 原生 API 实现。
 */

let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK_ENABLED = arg.MASK == '1';
const IPV6_ENABLED = arg.IPv6 == '1';

// 原生网络请求封装
function request(opt) {
  const TIMEOUT = parseFloat(opt.timeout || arg.TIMEOUT || 5) * 1000;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT);
    $httpClient.get(opt, (error, response, data) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve({ data: data || '' });
    });
  });
}

!(async () => {
  let SSID = arg.SSID == '1' && $network.wifi?.ssid ? `SSID: ${$network.wifi.ssid}\n` : '';
  let LAN = '';
  if (arg.LAN == '1') {
    const v4 = $network.v4?.primaryAddress;
    const v6 = $network.v6?.primaryAddress;
    LAN = `LAN: ${v4 || ''} ${v6 ? maskIP(v6) : ''}\n`.trim() + '\n';
  }

  // 并发查询直连与代理信息
  const [direct, proxy] = await Promise.all([
    getDirectInfo(undefined, arg.DOMESTIC_IPv4),
    getProxyInfo(undefined, arg.LANDING_IPv4)
  ]);

  // 排版：强制换行显示
  let content = `${SSID}${LAN}`;
  content += `国内 IP: ${maskIP(direct.IP) || '-'}\n`;
  content += `${direct.INFO}\n\n`;
  
  if (proxy.ENTRANCE) {
      content += `入口 IP: ${maskIP(proxy.ENTRANCE.IP) || '-'}\n`;
      content += `${proxy.ENTRANCE.INFO}\n\n`;
  }
  
  content += `落地 IP: ${maskIP(proxy.IP) || '-'}\n`;
  content += `${proxy.INFO}`;

  $done({
    title: '网络信息 𝕏',
    content: content,
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });
})().catch(e => {
  $done({ title: '网络信息 𝕏', content: '获取数据失败', icon: 'exclamationmark.triangle.fill' });
});

async function getDirectInfo(ip, provider) {
  try {
    const r = await request({ url: `https://rmb.zssq.com.cn/itam/mas/linden/ip/request` });
    const b = JSON.parse(r.data).data;
    return { IP: b.ip, INFO: `位置: ${b.country || ''} ${b.region || ''} ${b.city || ''}\n运营商: ${b.isp || '-'}` };
  } catch(e) { return { IP: '', INFO: '获取失败' }; }
}

async function getProxyInfo(ip, provider) {
  try {
    const r = await request({ url: `http://ip-api.com/json?lang=zh-CN` });
    const b = JSON.parse(r.data);
    let info = `位置: ${b.country || ''} ${b.regionName || ''} ${b.city || ''}\n运营商: ${b.isp || b.org || '-'}`;
    if (arg.ASN == '1') info += `\nASN: ${b.as || '-'}`;
    return { IP: b.query, INFO: info };
  } catch(e) { return { IP: '', INFO: '获取失败' }; }
}

function maskIP(ip) {
  if (!ip || !MASK_ENABLED) return ip;
  return ip.includes('.') ? ip.replace(/\d+\.\d+$/, '*.*') : ip.replace(/[^:]+:[^:]+$/, '*:*');
}

/**
 * Surge Panel 网络信息面板 (原版逻辑兼容+换行排版版)
 */

let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK = arg.MASK == '1';

// 核心函数：根据原版逻辑处理换行显示
function formatInfo(data) {
  let output = "";
  if (data.ip) output += `IP: ${MASK ? data.ip.replace(/\d+\.\d+$/, '*.*') : data.ip}\n`;
  if (data.country) output += `位置: ${data.country}${data.region ? ' ' + data.region : ''}${data.city ? ' ' + data.city : ''}\n`;
  if (data.isp) output += `运营商: ${data.isp}\n`;
  if (arg.ASN == '1' && data.asn) output += `ASN: ${data.asn}\n`;
  if (arg.ORG == '1' && data.org) output += `组织: ${data.org}\n`;
  return output.trim();
}

!(async () => {
  // 这里使用你原版脚本的接口逻辑，确保兼容性
  const [direct, proxy] = await Promise.all([
    getDirectInfo(),
    getProxyInfo()
  ]);

  let content = "";
  
  if (arg.SSID == '1' && $network.wifi?.ssid) content += `SSID: ${$network.wifi.ssid}\n`;
  if (arg.LAN == '1') content += `LAN: ${$network.v4?.primaryAddress || '-'}\n`;
  
  content += `\n[国内节点]\n${formatInfo(direct)}\n`;
  content += `\n[入口节点]\nIP: ${$network.v4?.primaryAddress || '未知'}\n`;
  content += `\n[落地节点]\n${formatInfo(proxy)}\n`;

  $done({
    title: arg.PANEL_NAME || '网络信息 𝕏',
    content: content.trim(),
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });
})();

async function getDirectInfo() {
  return new Promise(resolve => {
    $httpClient.get('https://rmb.zssq.com.cn/itam/mas/linden/ip/request', (err, resp, data) => {
      try {
        const j = JSON.parse(data).data;
        resolve({ ip: j.ip, country: j.country, region: j.region, city: j.city, isp: j.isp });
      } catch(e) { resolve({}); }
    });
  });
}

async function getProxyInfo() {
  return new Promise(resolve => {
    $httpClient.get('http://ip-api.com/json?lang=zh-CN', (err, resp, data) => {
      try {
        const j = JSON.parse(data);
        resolve({ ip: j.query, country: j.country, region: j.regionName, city: j.city, isp: j.isp, asn: j.as, org: j.org });
      } catch(e) { resolve({}); }
    });
  });
}

/**
 * Surge Panel 网络信息面板 (完整入口与落地版)
 * 优化说明：
 * 移除所有 FLAG 与 EVENT 逻辑。
 */

let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim();
  });
}

const MASK_ENABLED = arg.MASK == '1';

async function request(url) {
  return new Promise((resolve) => {
    $httpClient.get({ url, timeout: 5 }, (err, resp, data) => resolve(data));
  });
}

!(async () => {
  // 1. 获取国内信息
  const directData = await request('https://rmb.zssq.com.cn/itam/mas/linden/ip/request');
  const d = JSON.parse(directData).data;

  // 2. 获取落地信息
  const proxyData = await request('http://ip-api.com/json?lang=zh-CN');
  const p = JSON.parse(proxyData);

  // 3. 获取入口信息 (通过对比 $network 获取入口)
  // 如果当前是代理模式，入口 IP 即为 Surge 识别到的出口，或者我们可以获取当前活跃连接的源
  const entryIP = $network.v4?.primaryAddress || '未知';

  let content = '';
  
  // 基础信息
  if (arg.SSID == '1' && $network.wifi?.ssid) content += `SSID: ${$network.wifi.ssid}\n`;
  if (arg.LAN == '1') content += `LAN: ${$network.v4?.primaryAddress || '-'}\n`;
  
  content += `\n[国内节点]\n`;
  content += `IP: ${maskIP(d.ip || '-')}\n`;
  content += `位置: ${d.country || ''} ${d.region || ''} ${d.city || ''}\n`;
  content += `运营商: ${d.isp || '-'}\n`;

  content += `\n[入口节点]\n`;
  content += `IP: ${maskIP(entryIP)}\n`;
  content += `状态: 当前接入点\n`;

  content += `\n[落地节点]\n`;
  content += `IP: ${maskIP(p.query || '-')}\n`;
  content += `位置: ${p.country || ''} ${p.regionName || ''} ${p.city || ''}\n`;
  content += `运营商: ${p.isp || p.org || '-'}\n`;
  if (arg.ASN == '1') content += `ASN: ${p.as || '-'}\n`;

  $done({
    title: '网络信息 𝕏',
    content: content.trim(),
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });
})().catch(() => {
  $done({ title: '网络信息 𝕏', content: '数据获取失败' });
});

function maskIP(ip) {
  if (!ip || !MASK_ENABLED) return ip;
  return ip.includes('.') ? ip.replace(/\d+\.\d+$/, '*.*') : ip;
}
